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
