/**
 * Authentication related type definitions
 * Based on casbin-rbac API swagger schemas
 */

// Login
export interface LoginInputVo {
  userName: string
  password: string
  uuid?: string // captcha uuid
  code?: string // captcha code
}

export interface LoginOutputDto {
  token: string
  refreshToken: string
}

// Captcha
export interface CaptchaImageDto {
  uuid: string
  img: string // base64 image
  isEnableCaptcha: boolean
}

// Phone Captcha
export interface PhoneCaptchaImageDto {
  phone: string
  uuid?: string // image captcha uuid
  code?: string // image captcha code
}

// Registration
export interface RegisterDto {
  userName: string
  password: string
  uuid: string // phone verification uuid
  phone: number
  code: string // phone verification code
  nick?: string
}

// Password Reset
export interface RetrievePasswordDto {
  password: string
  uuid: string // phone verification uuid
  phone: number
  code: string // phone verification code
}

// User Info (from backend)
export interface UserInfo {
  user: {
    id: string
    userName: string
    nick: string
    icon?: string
    email?: string
    phone?: number
  }
  roleCodes: string[]
  permissionCodes: string[]
}
