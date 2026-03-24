<template>
  <div class="w-full">
    <ElDivider>
      <span class="text-gray-400 font-normal text-xs">{{ $t('login.thirdPartyLogin') }}</span>
    </ElDivider>

    <div class="flex-center gap-4 mt-4">
      <ElButton color="#c71d23" plain @click="openDialog('Gitee')">
        <template #icon>
          <span class="iconify" data-icon="simple-icons:gitee"></span>
        </template>
        Gitee
      </ElButton>
      <ElButton color="#24292e" plain @click="openDialog('GitHub')">
        <template #icon>
          <span class="iconify" data-icon="ri:github-fill"></span>
        </template>
        GitHub
      </ElButton>
    </div>

    <!-- 第三方登录弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="`第三方登录 - ${currentScheme}`"
      width="400px"
      append-to-body
    >
      <div class="flex flex-col gap-4">
        <ElAlert
          title="请先前往授权，获取到Code后在此处输入以完成登录"
          type="info"
          :closable="false"
        />
        <ElButton type="primary" @click="goToAuthorize" class="w-full">
          前往 {{ currentScheme }} 授权
        </ElButton>

        <ElDivider>授权后输入Code</ElDivider>

        <ElInput v-model="authCode" placeholder="请输入获取到的授权码(Code)" clearable />

        <ElButton
          type="success"
          @click="submitLoginCode"
          :loading="loading"
          class="w-full"
          :disabled="!authCode"
        >
          确认登录
        </ElButton>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { thirdParty } from '@/api/auth'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'ThirdPartyLogin' })

  const router = useRouter()
  const dialogVisible = ref(false)
  const currentScheme = ref('')
  const authCode = ref('')
  const loading = ref(false)

  const openDialog = (scheme: string) => {
    currentScheme.value = scheme
    authCode.value = ''
    dialogVisible.value = true
  }

  const goToAuthorize = () => {
    // Navigate to backend OAuth initiation endpoint (or open in new window)
    const apiUrl = import.meta.env.VITE_API_URL || ''
    const targetUrl = `${apiUrl}/api/app/auth/oauth/login/${currentScheme.value}`
    window.open(targetUrl, '_blank')
  }

  const submitLoginCode = async () => {
    if (!authCode.value) return
    loading.value = true
    try {
      // Call the thirdParty.oauthLogin API with the given scheme and code
      const res = await thirdParty.oauthLogin(currentScheme.value, authCode.value)

      ElMessage.success('第三方登录成功')
      dialogVisible.value = false

      // Assuming the API returns token information, the user state should be updated here.
      // E.g., userStore.setToken(res.token)
      // Since we don't know the exact store implementation inside this component for now,
      // we'll safely redirect or reload to allow system bootstrap to fetch user context.
      console.log('Login Result:', res)

      // Fallback reload/redirect
      router.push('/')
    } catch (error) {
      console.error('第三方登录失败', error)
      ElMessage.error('第三方登录失败，请检查Code是否正确')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
