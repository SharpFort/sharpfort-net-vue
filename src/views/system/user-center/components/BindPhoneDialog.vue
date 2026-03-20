<template>
  <el-dialog
    v-model="visible"
    :title="oldPhone ? '换绑手机号' : '绑定手机号'"
    width="400px"
    @closed="handleClosed"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position="top">
      <el-form-item label="原手机号" v-if="oldPhone">
        <el-input :model-value="oldPhone" disabled />
      </el-form-item>

      <el-form-item label="新手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入新的手机号" maxlength="11">
          <template #prefix>
            <el-icon><Iphone /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="验证码" prop="code">
        <div class="flex w-full gap-2">
          <el-input v-model="form.code" placeholder="请输入验证码" maxlength="6" class="flex-1">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            plain
            :disabled="countdown > 0"
            :loading="codeLoading"
            @click="sendCode"
            class="w-28"
          >
            {{ countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit"> 确认绑定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { reactive, ref, onBeforeUnmount } from 'vue'
  import { ElMessage, type FormInstance, FormRules } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { Iphone, Message } from '@element-plus/icons-vue'

  const emit = defineEmits(['success'])

  const visible = ref(false)
  const oldPhone = ref('')
  const formRef = ref<FormInstance>()

  const codeLoading = ref(false)
  const submitLoading = ref(false)
  const countdown = ref(0)
  let timer: any = null

  const form = reactive({
    phone: '',
    code: '',
    uuid: ''
  })

  // Basic mobile phone regex
  const validatePhone = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    phone: [{ validator: validatePhone, trigger: 'blur' }],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  })

  const open = (currentPhone: string = '') => {
    oldPhone.value = currentPhone
    visible.value = true
    form.uuid = generateUUID()
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    form.phone = ''
    form.code = ''
    form.uuid = ''
    clearTimer()
  }

  const sendCode = async () => {
    // Validate phone number first
    let validPhone = false
    await formRef.value?.validateField('phone', (valid) => {
      validPhone = valid
    })

    if (!validPhone) return

    codeLoading.value = true
    try {
      await CasbinApi.account.getPhoneCaptcha({
        phone: form.phone,
        uuid: form.uuid
      })
      ElMessage.success('验证码发送成功')
      startCountdown()
    } catch (error) {
      console.error(error)
    } finally {
      codeLoading.value = false
    }
  }

  const submit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          await CasbinApi.account.bindPhone({
            phone: form.phone,
            code: form.code,
            uuid: form.uuid
          })
          ElMessage.success('手机号绑定成功')
          visible.value = false
          emit('success')
        } catch (error) {
          console.error(error)
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  const startCountdown = () => {
    countdown.value = 60
    clearTimer()
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearTimer()
      }
    }, 1000)
  }

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    countdown.value = 0
  }

  const generateUUID = () => {
    // Simple fallback UUID generation if standard not available
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  onBeforeUnmount(() => {
    clearTimer()
  })

  defineExpose({
    open
  })
</script>

<style scoped>
  /* Extra styling if needed */
</style>
