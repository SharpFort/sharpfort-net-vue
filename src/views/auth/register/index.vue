<!-- 注册页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('register.title') }}</h3>
          <p class="sub-title">{{ $t('register.subTitle') }}</p>
          <ElForm
            class="mt-7.5"
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            :key="formKey"
          >
            <ElFormItem prop="username">
              <ElInput
                class="custom-height"
                v-model.trim="formData.username"
                :placeholder="$t('register.placeholder.username')"
              />
            </ElFormItem>

            <ElFormItem prop="nick">
              <ElInput
                class="custom-height"
                v-model.trim="formData.nick"
                :placeholder="$t('register.placeholder.nick')"
              />
            </ElFormItem>

            <ElFormItem prop="phone">
              <ElInput
                class="custom-height"
                v-model.trim="formData.phone"
                :placeholder="$t('register.placeholder.phone')"
                maxlength="11"
              />
            </ElFormItem>

            <ElFormItem prop="code">
              <div class="flex gap-2">
                <ElInput
                  class="custom-height flex-1"
                  v-model.trim="formData.code"
                  :placeholder="$t('register.placeholder.code')"
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
                  {{ countdown > 0 ? `${countdown}s` : $t('register.sendCode') }}
                </ElButton>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                {{ $t('register.testCodeHint') }}: 123456
              </div>
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                v-model.trim="formData.password"
                :placeholder="$t('register.placeholder.password')"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                class="custom-height"
                v-model.trim="formData.confirmPassword"
                :placeholder="$t('register.placeholder.confirmPassword')"
                type="password"
                autocomplete="off"
                @keyup.enter="register"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="agreement">
              <ElCheckbox v-model="formData.agreement">
                {{ $t('register.agreeText') }}
                <RouterLink
                  style="color: var(--theme-color); text-decoration: none"
                  to="/privacy-policy"
                  >{{ $t('register.privacyPolicy') }}</RouterLink
                >
              </ElCheckbox>
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ $t('register.submitBtnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-g-600">
              <span>{{ $t('register.hasAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Login' }">{{
                $t('register.toLogin')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { ElMessage, type FormInstance, FormRules } from 'element-plus'
  import { fetchRegister } from '@/api/auth'
  import { HttpError } from '@/utils/http/error'

  defineOptions({ name: 'Register' })

  interface RegisterForm {
    username: string
    nick: string
    phone: string
    code: string
    password: string
    confirmPassword: string
    agreement: boolean
  }

  const USERNAME_MIN_LENGTH = 3
  const USERNAME_MAX_LENGTH = 20
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

  const formData = reactive<RegisterForm>({
    username: '',
    nick: '',
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    agreement: false
  })

  /**
   * 验证手机号
   */
  const validatePhone = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.placeholder.phone')))
      return
    }
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error(t('register.rule.phoneInvalid')))
      return
    }
    callback()
  }

  /**
   * 验证密码
   * 当密码输入后，如果确认密码已填写，则触发确认密码的验证
   */
  const validatePassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.placeholder.password')))
      return
    }

    if (formData.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }

    callback()
  }

  /**
   * 验证确认密码
   * 检查确认密码是否与密码一致
   */
  const validateConfirmPassword = (
    _rule: any,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (!value) {
      callback(new Error(t('register.rule.confirmPasswordRequired')))
      return
    }

    if (value !== formData.password) {
      callback(new Error(t('register.rule.passwordMismatch')))
      return
    }

    callback()
  }

  /**
   * 验证用户协议
   * 确保用户已勾选同意协议
   */
  const validateAgreement = (_rule: any, value: boolean, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.rule.agreementRequired')))
      return
    }
    callback()
  }

  const rules = computed<FormRules<RegisterForm>>(() => ({
    username: [
      { required: true, message: t('register.placeholder.username'), trigger: 'blur' },
      {
        min: USERNAME_MIN_LENGTH,
        max: USERNAME_MAX_LENGTH,
        message: t('register.rule.usernameLength'),
        trigger: 'blur'
      }
    ],
    phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
    code: [
      { required: false, message: t('register.placeholder.code'), trigger: 'blur' },
      { len: 6, message: t('register.rule.codeLength'), trigger: 'blur' }
    ],
    password: [
      { required: true, validator: validatePassword, trigger: 'blur' },
      { min: PASSWORD_MIN_LENGTH, message: t('register.rule.passwordLength'), trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    agreement: [{ validator: validateAgreement, trigger: 'change' }]
  }))

  /**
   * 发送验证码
   */
  const sendCode = async () => {
    try {
      // 验证手机号
      await formRef.value?.validateField('phone')

      // 生成UUID（测试用）
      captchaUuid.value = `test-uuid-${Date.now()}`

      // TODO: 实际发送验证码
      // await fetchGetPhoneCaptcha({
      //   phone: formData.phone,
      //   uuid: captchaUuid.value
      // })

      ElMessage.success(t('register.codeSent'))

      // 开始倒计时
      countdown.value = COUNTDOWN_TIME
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } catch (error) {
      console.error('[Register] Failed to send code:', error)
    }
  }

  /**
   * 注册用户
   * 验证表单后提交注册请求
   */
  const register = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      // 调用注册API
      const params = {
        userName: formData.username,
        password: formData.password,
        nick: formData.nick || formData.username,
        phone: parseInt(formData.phone),
        code: formData.code,
        uuid: captchaUuid.value || `test-uuid-${Date.now()}`
      }

      await fetchRegister(params)

      ElMessage.success(t('register.success'))
      toLogin()
    } catch (error) {
      if (error instanceof HttpError) {
        // 后端错误已由拦截器处理
      } else {
        console.error('[Register] Unexpected error:', error)
      }
      loading.value = false
    }
  }

  /**
   * 跳转到登录页面
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
