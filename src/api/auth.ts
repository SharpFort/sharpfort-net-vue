import request from '@/utils/http'

// 模拟数据开关
const USE_MOCK = true

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  if (USE_MOCK) {
    console.warn('正在使用 Mock 登录（已跳过后端验证）')
    return Promise.resolve({
      token: 'mock_token_' + Date.now(),
      refreshToken: 'mock_refresh_token'
    })
  }

  return request.post<Api.Auth.LoginResponse>({
    url: '/api/app/account/login',
    data: params
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  if (USE_MOCK) {
    return Promise.resolve({
      user: {
        id: 'admin_id',
        userName: 'Admin',
        nick: '超级管理员',
        icon: 'https://img0.baidu.com/it/u=3021883569,1259293397&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
      },
      roleCodes: ['R_SUPER'],
      permissionCodes: ['*:*:*'] // 赋予所有权限
    })
  }

  return request.get<any>({
    url: '/api/app/account'
  })
}

/**
 * 获取验证码
 */
export function fetchGetCaptcha() {
  if (USE_MOCK) {
    return Promise.resolve({
      isEnableCaptcha: false
    })
  }

  return request.get<any>({
    url: '/api/app/account/captcha-image'
  })
}
