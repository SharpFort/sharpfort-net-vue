<template>
  <div class="user-pwd">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="top">
      <el-form-item label="当前密码" prop="oldPassword">
        <el-input
          v-model.trim="form.oldPassword"
          type="password"
          show-password
          placeholder="请输入当前密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model.trim="form.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model.trim="form.confirmPassword"
          type="password"
          show-password
          placeholder="请确认新密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  const formRef = ref<FormInstance>()
  const loading = ref(false)

  const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const validateConfirmPassword = (rule: any, value: any, callback: any) => {
    if (value !== form.newPassword) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }

  const rules: FormRules = {
    oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ]
  }

  const submit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          // Update Password API
          // PUT /api/app/account/password
          // DTO: UpdatePasswordDto (newPassword, oldPassword)
          await CasbinApi.account.updatePassword({
            oldPassword: form.oldPassword,
            newPassword: form.newPassword
          })
          ElMessage.success('密码修改成功')
          reset()
        } catch (error) {
          console.error(error)
        } finally {
          loading.value = false
        }
      }
    })
  }

  const reset = () => {
    formRef.value?.resetFields()
  }
</script>

<style scoped>
  .user-pwd {
    max-width: 500px;
    padding: 20px;
  }
</style>
