/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

axiosInstance.interceptors.response.use(
  async (response) => {
    // 兼容ABP直接返回数据的情况（没有code/msg包装）
    if (!Object.prototype.hasOwnProperty.call(response.data, 'code')) {
      // ABP直接返回数据，包装成标准格式
      response.data = {
        code: ApiStatus.success,
        msg: 'success',
        data: response.data
      } as any
      return response
    }

    const { code, msg } = response.data
    if (code === ApiStatus.success) return response

    // Token过期内层状态码情况
    if (code === ApiStatus.unauthorized) {
      return handleTokenRefresh(response.config) as any
    }

    throw createHttpError(msg || $t('httpMsg.requestFailed'), code)
  },
  async (error) => {
    if (error.response?.status === ApiStatus.unauthorized) {
      return handleTokenRefresh(error.config)
    }
    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 执行 Token 无感刷新与请求重试 */
async function handleTokenRefresh(config: InternalAxiosRequestConfig): Promise<any> {
  const userStore = useUserStore()
  // 如果没有刷新令牌，或者请求本身就是刷新接口，直接退出登录
  if (!userStore.refreshToken || config.url?.includes('/api/app/account/refresh')) {
    return handleUnauthorizedError()
  }

  // 如果正在刷新中，将请求挂起
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber((newToken: string) => {
        config.headers.set('Authorization', `Bearer ${newToken}`)
        resolve(axiosInstance(config))
      })
    })
  }

  isRefreshing = true
  try {
    // 使用单纯的 axios 实例发起刷新请求，避免拦截器死循环
    const res = await axios.post(`${VITE_API_URL}/api/app/account/refresh`, null, {
      params: { refresh_token: userStore.refreshToken }
    })

    // 假设刷新接口返回的数据结构 { data: { token, refreshToken } } 或者直接是 { token, refreshToken } 根据后端的约定
    // ABP 中可能包裹在 response.data 层，我们尝试提取
    const newAuthData = res.data?.data || res.data
    const newToken = newAuthData.token
    const newRefToken = newAuthData.refreshToken

    if (!newToken) {
      throw new Error('Refresh failed')
    }

    userStore.setToken(newToken, newRefToken)
    // 更新当前失败请求的 token 并重发
    config.headers.set('Authorization', `Bearer ${newToken}`)

    // 执行队列中的所有挂起请求
    onRefreshed(newToken)

    return axiosInstance(config)
  } catch {
    // 刷新失败，清空队列，跳转登录
    refreshSubscribers = []
    return handleUnauthorizedError()
  } finally {
    isRefreshing = false
  }
}

/** 处理彻底无法授权的情况（带防抖登出） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
