<template>
  <div class="w-full">
    <ElDivider>
      <span class="text-gray-400 font-normal text-xs">{{ $t('login.thirdPartyLogin') }}</span>
    </ElDivider>

    <div class="flex-center gap-4 mt-4">
      <div
        class="cursor-pointer hover:scale-110 transition-transform duration-300"
        @click="handleLogin('Gitee')"
        title="Gitee"
      >
        <span class="iconify text-2xl text-[#c71d23]" data-icon="simple-icons:gitee"></span>
      </div>
      <div
        class="cursor-pointer hover:scale-110 transition-transform duration-300"
        @click="handleLogin('GitHub')"
        title="GitHub"
      >
        <span class="iconify text-2xl" data-icon="ri:github-fill"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ThirdPartyLogin' })

  const handleLogin = async (scheme: string) => {
    try {
      // The backend endpoint likely redirects or returns a URL to redirect to.
      // If it's a direct API call that returns a URL:
      // const res = await thirdParty.oauthLogin(scheme)
      // if (res && res.url) window.location.href = res.url

      // However, typically for OAuth initiation, we just navigate the browser to the endpoint
      // to let the backend handle the 302 redirect to the provider.
      // But since we have an API client, let's see.
      // Swagger says GET /api/app/auth/oauth/login/{scheme}.
      // If we use axios, it might follow redirects automatically or return the HTML of the provider page (CORS issues).
      // Safest bet for OAuth initiation is usually window.location.href.
      // Let's assume the backend API constructs the provider URL and returns it, OR we just visit it.
      // If the backend returns a JSON with the target URL, we use that.
      // If the backend 302s, axios might fail due to CORS if not configured, or we just observe.

      // Let's try navigating directly for now, assuming the backend handles the flow.
      // Construct the URL manually to avoid Axios constraints for top-level navigation.
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const targetUrl = `${apiUrl}/api/app/auth/oauth/login/${scheme}`

      // We might need to pass a callback URL or state? Usually backend handles this based on config.
      // Let's try navigating.
      window.location.href = targetUrl
    } catch (error) {
      console.error('Third party login failed', error)
      ElMessage.error('Third party login failed')
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
