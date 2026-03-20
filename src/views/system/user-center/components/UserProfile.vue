<template>
  <div class="user-profile">
    <el-form
      :model="form"
      ref="ruleFormRef"
      :rules="rules"
      label-width="86px"
      label-position="top"
      class="box-border"
    >
      <!-- Avatar Section -->
      <div class="flex items-center justify-center mb-8">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :http-request="uploadAvatar"
          accept="image/*"
        >
          <div class="relative group cursor-pointer">
            <el-avatar
              :size="100"
              :src="form.icon || defaultAvatarImg"
              class="border-2 border-gray-100 shadow-sm"
            />
            <div
              class="absolute inset-0 bg-black bg-opacity-50 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <el-icon :size="20"><Camera /></el-icon>
              <span class="text-xs mt-1">更换头像</span>
            </div>
          </div>
        </el-upload>
      </div>

      <el-form-item label="账号" prop="name">
        <el-input v-model="form.name" disabled />
      </el-form-item>

      <el-form-item label="昵称" prop="nick">
        <el-input v-model="form.nick" :disabled="!isEdit" />
      </el-form-item>

      <el-form-item label="手机" prop="phone">
        <div class="flex w-full gap-2">
          <el-input v-model="form.phone" disabled placeholder="未绑定手机号" class="flex-1" />
          <el-button type="primary" plain @click="openBindPhoneDialog">
            {{ form.phone ? '换绑' : '绑定' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" :disabled="!isEdit" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="form.gender" placeholder="Select" :disabled="!isEdit" class="w-full">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" :disabled="!isEdit" />
      </el-form-item>

      <el-form-item label="个人介绍" prop="introduction">
        <el-input
          type="textarea"
          :rows="4"
          v-model="form.introduction"
          :disabled="!isEdit"
          placeholder="介绍一下自己吧..."
        />
      </el-form-item>

      <div class="flex justify-start mt-6 pt-4 border-t border-gray-100">
        <el-button type="primary" class="w-24" @click="edit">
          {{ isEdit ? '保存修改' : '编辑资料' }}
        </el-button>
        <el-button v-if="isEdit" class="w-24 ml-4" @click="cancelEdit"> 取消 </el-button>
      </div>
    </el-form>

    <BindPhoneDialog ref="bindPhoneDialogRef" @success="handlePhoneBindSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessage, type FormInstance, FormRules } from 'element-plus'
  import { Camera } from '@element-plus/icons-vue'
  import defaultAvatarImg from '@/assets/images/user/avatar.webp'
  import BindPhoneDialog from './BindPhoneDialog.vue'

  const props = defineProps<{
    user: any
  }>()

  const emit = defineEmits(['refresh'])

  const isEdit = ref(false)
  const ruleFormRef = ref<FormInstance>()
  const bindPhoneDialogRef = ref<InstanceType<typeof BindPhoneDialog> | null>(null)

  const form = reactive({
    id: '', // store actual userId for payload
    name: '',
    nick: '',
    email: '',
    phone: '',
    address: '',
    gender: 0,
    introduction: '',
    icon: ''
  })

  // To restore on cancel
  let originalForm: any = {}

  watch(
    () => props.user,
    (newVal) => {
      if (newVal) {
        Object.assign(form, {
          id: newVal.id,
          name: newVal.userName || newVal.name,
          nick: newVal.nick || newVal.userName,
          email: newVal.email,
          phone: newVal.phone,
          address: newVal.address,
          gender: Number(newVal.gender) || 0,
          introduction: newVal.introduction,
          icon: newVal.icon
        })
        originalForm = { ...form }
      }
    },
    { immediate: true, deep: true }
  )

  const rules = reactive<FormRules>({
    nick: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
  })

  const options = [
    { value: 0, label: '未知' },
    { value: 1, label: '男' },
    { value: 2, label: '女' }
  ]

  const edit = async () => {
    if (isEdit.value) {
      if (!ruleFormRef.value) return
      await ruleFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            await CasbinApi.user.updateProfile(form)
            ElMessage.success('资料保存成功')
            isEdit.value = false
            emit('refresh')
          } catch (error) {
            console.error(error)
          }
        }
      })
    } else {
      isEdit.value = true
    }
  }

  const cancelEdit = () => {
    Object.assign(form, originalForm)
    isEdit.value = false
    ruleFormRef.value?.clearValidate()
  }

  // --- Avatar Upload Logic ---
  const uploadAvatar = async (options: any) => {
    const file = options.file
    // Optional: add size/type validation here
    // const isLt2M = file.size / 1024 / 1024 < 2
    try {
      // 1. Upload to File API
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await CasbinApi.file.upload(formData)

      // uploadRes might be an array of objects depending on backend: [{ code: 'xxx' }]
      let iconCode = ''
      if (Array.isArray(uploadRes) && uploadRes.length > 0) {
        iconCode = uploadRes[0].code || uploadRes[0].url || uploadRes[0]
      } else if (uploadRes && uploadRes.code) {
        iconCode = uploadRes.code
      } else if (typeof uploadRes === 'string') {
        iconCode = uploadRes
      } else if (uploadRes.data && uploadRes.data.length > 0) {
        iconCode = uploadRes.data[0].code
      }

      const imageUrl = iconCode.startsWith('http') ? iconCode : `/api/app/file/${iconCode}/false`

      // 2. Call UpdateIcon API
      await CasbinApi.account.updateIcon({ icon: imageUrl, userId: form.id })

      ElMessage.success('头像更新成功')
      emit('refresh') // Refresh global states natively
    } catch (error) {
      console.error('Avatar upload failed:', error)
      ElMessage.error('头像上传更新失败')
    }
  }

  // --- Phone Bind Logic ---
  const openBindPhoneDialog = () => {
    bindPhoneDialogRef.value?.open(form.phone)
  }

  const handlePhoneBindSuccess = () => {
    emit('refresh')
  }
</script>

<style scoped>
  .user-profile {
    max-width: 600px;
  }
</style>
