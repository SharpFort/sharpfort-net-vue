import request from '@/utils/http'
import type {
  LoginInputVo,
  LoginOutputDto,
  CaptchaImageDto,
  PhoneCaptchaImageDto,
  RegisterDto,
  RetrievePasswordDto,
  UserInfo
} from '@/types/auth'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: LoginInputVo) {
  return request.post<LoginOutputDto>({
    url: '/api/app/account/login',
    data: params
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<UserInfo>({
    url: '/api/app/account'
  })
}

/**
 * 获取图片验证码
 * @returns 验证码信息
 */
export function fetchGetCaptcha() {
  return request.get<CaptchaImageDto>({
    url: '/api/app/account/captcha-image'
  })
}

/**
 * 获取手机验证码（注册用）
 * @param params 手机验证码参数
 */
export function fetchGetPhoneCaptcha(params: PhoneCaptchaImageDto) {
  return request.post<void>({
    url: '/api/app/account/captcha-phone',
    data: params
  })
}

/**
 * 获取手机验证码（找回密码用）
 * @param params 手机验证码参数
 */
export function fetchGetPhoneCaptchaForReset(params: PhoneCaptchaImageDto) {
  return request.post<void>({
    url: '/api/app/account/captcha-phone/repassword',
    data: params
  })
}

/**
 * 注册
 * @param params 注册参数
 */
export function fetchRegister(params: RegisterDto) {
  return request.post<void>({
    url: '/api/app/account/register',
    data: params
  })
}

/**
 * 找回密码
 * @param params 找回密码参数
 * @returns 成功消息
 */
export function fetchRetrievePassword(params: RetrievePasswordDto) {
  return request.post<string>({
    url: '/api/app/account/retrieve-password',
    data: params
  })
}

/**
 * 刷新Token
 * @param refreshToken 刷新令牌
 */
export function fetchRefreshToken(refreshToken: string) {
  return request.post<LoginOutputDto>({
    url: '/api/app/account/refresh',
    params: { refresh_token: refreshToken }
  })
}

/**
 * 第三方认证服务
 */
export const thirdParty = {
  /**
   * 第三方OAuth登录
   * @param scheme 认证方案
   * @param code 授权码
   */
  oauthLogin: (scheme: string, code?: string) =>
    request.get<any>({
      url: `/api/app/auth/oauth/login/${scheme}`,
      params: { code }
    }),

  /**
   * 第三方OAuth绑定
   * @param scheme 认证方案
   * @param code 授权码
   */
  oauthBind: (scheme: string, code?: string) =>
    request.post<void>({
      url: `/api/app/auth/oauth/bind/${scheme}`,
      params: { code }
    }),

  /**
   * 获取认证列表 (管理)
   * @param params 搜索参数
   */
  getList: (params: Api.Auth.AuthSearchParams) =>
    request.get<Api.Common.PaginatedResponse<Api.Auth.AuthOutputDto>>({
      url: '/api/app/auth',
      params
    }),

  /**
   * 删除第三方认证
   * @param id ID
   */
  delete: (id: string) =>
    request.del<void>({
      url: '/api/app/auth',
      params: { id: [id] }
    }),

  /**
   * 尝试获取认证信息
   * @param params 参数
   */
  getAuthInfo: (params: { openId?: string; authType?: string; userId?: string }) =>
    request.post<Api.Auth.AuthOutputDto>({
      url: '/api/app/auth/try-get-auth-info',
      params
    }),

  /**
   * 导出Excel
   */
  export: (params: Api.Auth.AuthSearchParams) =>
    request.get<Blob>({
      url: '/api/app/auth/export-excel',
      params,
      responseType: 'blob'
    }),

  /**
   * 获取下拉数据
   */
  selectDataList: (keywords?: string) =>
    request.get<any>({
      url: '/api/app/auth/select-data-list',
      params: { keywords }
    })
}
