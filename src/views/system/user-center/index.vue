<!-- 个人中心页面 -->
<template>
  <div class="user-center-container art-full-height p-5">
    <el-card class="box-card user-center-card border-none" shadow="never">
      <el-tabs v-model="activeTab" class="user-tabs" tab-position="left">
        <el-tab-pane label="基本资料" name="profile">
          <div class="tab-pane-content">
            <h3 class="tab-title">个人基本资料</h3>
            <UserProfile :user="userInfo" @refresh="getUserInfo" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="安全设置" name="security">
          <div class="tab-pane-content">
            <h3 class="tab-title">安全设置</h3>
            <UserPwd />
          </div>
        </el-tab-pane>
        <el-tab-pane label="登录日志" name="loginLog">
          <div class="tab-pane-content">
            <h3 class="tab-title">个人登录日志</h3>
            <UserLog type="login" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="操作日志" name="opLog">
          <div class="tab-pane-content">
            <h3 class="tab-title">个人操作日志</h3>
            <UserLog type="operation" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/store/modules/user'
  import { CasbinApi } from '@/api/casbin-rbac'
  import UserProfile from './components/UserProfile.vue'
  import UserPwd from './components/UserPwd.vue'
  import UserLog from './components/UserLog.vue'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = ref<any>({})
  const activeTab = ref('profile')

  const getUserInfo = async () => {
    // Handling possible mismatch in UserStore typings vs actual backend response
    const storedInfo = userStore.getUserInfo || {}
    const userId = storedInfo.userId || storedInfo.id || storedInfo.user?.id

    if (userId) {
      try {
        const res = await CasbinApi.user.get(userId)
        userInfo.value = res
        // Sync back to store if needed
        userStore.setUserInfo({ ...storedInfo, ...res })
      } catch (error) {
        console.error('Failed to get user details:', error)
      }
    } else {
      console.warn(
        'Cannot fetch user profile mapping because userId is missing from auth data:',
        storedInfo
      )
    }
  }

  onMounted(() => {
    getUserInfo()
  })
</script>

<style scoped lang="scss">
  .user-center-container {
    height: 100%;
    background-color: var(--el-bg-color-page);
  }

  .user-center-card {
    height: 100%;
    border-radius: 8px;

    :deep(.el-card__body) {
      height: 100%;
      padding: 0;
    }
  }

  .user-tabs {
    height: 100%;

    :deep(.el-tabs__header.is-left) {
      width: 200px;
      padding-top: 20px;
      margin-right: 0;
      border-right: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-tabs__item) {
      height: 50px;
      padding: 0 30px;
      font-size: 15px;
      line-height: 50px;
      text-align: left;

      &.is-active {
        background-color: var(--el-color-primary-light-9);
        border-right: 3px solid var(--el-color-primary);
      }
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__active-bar) {
      display: none;
    }
  }

  .tab-pane-content {
    height: 100%;
    padding: 30px 40px;
    overflow-y: auto;

    .tab-title {
      margin-bottom: 30px;
      font-size: 20px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
</style>
