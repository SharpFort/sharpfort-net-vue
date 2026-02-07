<!-- 找回密码页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ $t('forgetPassword.subTitle') }}</p>
          <ElForm
            class="mt-7.5"
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            :key="formKey"
          >
            <ElFormItem prop="phone">
              <ElInput
                class="custom-height"
                v-model.trim="formData.phone"
                :placeholder="$t('forgetPassword.placeholder.phone')"
                maxlength="11"
              />
            </ElFormItem>

            <ElFormItem prop="code">
              <div class="flex gap-2">
                <ElInput
                  class="custom-height flex-1"
                  v-model.trim="formData.code"
                  :placeholder="$t('forgetPassword.placeholder.code')"
                  maxlength="6"
                />
                <ElButton
                  class="custom-height"
                  type="primary"
                  plain
                  :disabled="countdown > 0"
                  @click="sendCode"
                  style="width: 120px"
                >
                  {{ countdown > 0 ? `${countdown}s` : $t('forgetPassword.sendCode') }}
                </ElButton>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                {{ $t('forgetPassword.testCodeHint') }}: 123456
              </div>
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                v-model.trim="formData.password"
                :placeholder="$t('forgetPassword.placeholder.password')"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                class="custom-height"
                v-model.trim="formData.confirmPassword"
                :placeholder="$t('forgetPassword.placeholder.confirmPassword')"
                type="password"
                autocomplete="off"
                @keyup.enter="handleResetPassword"
                show-password
              />
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleResetPassword"
                :loading="loading"
                v-ripple
              >
                {{ $t('forgetPassword.submitBtnText') }}
              </ElButton>
            </div>

            <div style="margin-top: 15px">
              <ElButton class="w-full custom-height" plain @click="toLogin">
                {{ $t('forgetPassword.backBtnText') }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { v4 as uuidv4 } from 'uuid'
  import { useI18n } from 'vue-i18n'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchRetrievePassword, fetchGetPhoneCaptchaForReset } from '@/api/auth'
  import { HttpError } from '@/utils/http/error'

  defineOptions({ name: 'ForgetPassword' })

  interface ForgetPasswordForm {
    phone: string
    code: string
    password: string
    confirmPassword: string
  }

  const PASSWORD_MIN_LENGTH = 6
  const REDIRECT_DELAY = 1500
  const COUNTDOWN_TIME = 60

  const { t, locale } = useI18n()
  const router = useRouter()
  const formRef = ref<FormInstance>()

  const loading = ref(false)
  const formKey = ref(0)
  const countdown = ref(0)
  const captchaUuid = ref('')

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  const formData = reactive<ForgetPasswordForm>({
    phone: '',
    code: '',
    password: '',
    confirmPassword: ''
  })

  /**
   * 验证手机号
   */
  const validatePhone = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('forgetPassword.placeholder.phone')))
      return
    }
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error(t('forgetPassword.rule.phoneInvalid')))
      return
    }
    callback()
  }

  /**
   * 验证密码
   */
  const validatePassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('forgetPassword.placeholder.password')))
      return
    }

    if (formData.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }

    callback()
  }

  /**
   * 验证确认密码
   */
  const validateConfirmPassword = (
    _rule: any,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (!value) {
      callback(new Error(t('forgetPassword.rule.confirmPasswordRequired')))
      return
    }

    if (value !== formData.password) {
      callback(new Error(t('forgetPassword.rule.passwordMismatch')))
      return
    }

    callback()
  }

  const rules = computed<FormRules<ForgetPasswordForm>>(() => ({
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    code: [
      { required: true, message: t('forgetPassword.placeholder.code'), trigger: 'blur' },
      { len: 6, message: t('forgetPassword.rule.codeLength'), trigger: 'blur' }
    ],
    password: [
      { required: true, validator: validatePassword, trigger: 'blur' },
      {
        min: PASSWORD_MIN_LENGTH,
        message: t('forgetPassword.rule.passwordLength'),
        trigger: 'blur'
      }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
  }))

  /**
   * 发送验证码
   */
  const sendCode = async () => {
    try {
      // 验证手机号
      await formRef.value?.validateField('phone')

      // 生成UUID
      captchaUuid.value = uuidv4()

      loading.value = true
      await fetchGetPhoneCaptchaForReset({
        phone: formData.phone,
        uuid: captchaUuid.value
      })

      ElMessage.success(t('forgetPassword.codeSent'))

      // 开始倒计时
      countdown.value = COUNTDOWN_TIME
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } catch (error) {
      console.error('[ForgetPassword] Failed to send code:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置密码
   */
  const handleResetPassword = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      // 调用找回密码API
      const params = {
        password: formData.password,
        phone: parseInt(formData.phone),
        code: formData.code,
        uuid: captchaUuid.value
      }

      await fetchRetrievePassword(params)

      ElMessage.success(t('forgetPassword.success'))
      toLogin()
    } catch (error) {
      if (error instanceof HttpError) {
        // 后端错误已由拦截器处理
      } else {
        console.error('[ForgetPassword] Unexpected error:', error)
      }
      loading.value = false
    }
  }

  /**
   * 返回登录页面
   */
  const toLogin = () => {
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, REDIRECT_DELAY)
  }
</script>

<style scoped>
  @import '../login/style.css';
</style>
