<!-- 个人中心页面 -->
<template>
  <div class="user-center-container">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <div class="user-info-header">
            <div class="user-avatar-box">
              <img :src="userInfo.icon || defaultAvatar" class="user-avatar" />
            </div>
            <h2 class="user-name">{{ userInfo.nick || userInfo.userName }}</h2>
            <p class="user-desc">{{ userInfo.introduction || '暂无介绍' }}</p>
          </div>
          <div class="user-info-list">
            <div class="list-item">
              <el-icon><User /></el-icon>
              <span>{{ userInfo.userName }}</span>
            </div>
            <div class="list-item">
              <el-icon><Iphone /></el-icon>
              <span>{{ userInfo.phone || '暂无手机号' }}</span>
            </div>
            <div class="list-item">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo.email || '暂无邮箱' }}</span>
            </div>
            <div class="list-item">
              <el-icon><Location /></el-icon>
              <span>{{ userInfo.address || '暂无地址' }}</span>
            </div>
          </div>

          <div class="user-tags">
            <div class="tag-title">标签</div>
            <div class="tag-list">
              <el-tag v-for="tag in labelList" :key="tag" class="tag-item">{{ tag }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16" :xs="24">
        <el-card class="box-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="profile">
              <UserProfile :user="userInfo" @refresh="getUserInfo" />
            </el-tab-pane>
            <el-tab-pane label="安全设置" name="security">
              <UserPwd />
            </el-tab-pane>
            <el-tab-pane label="操作日志" name="log">
              <UserLog />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/store/modules/user'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { User, Iphone, Message, Location } from '@element-plus/icons-vue'
  import UserProfile from './components/UserProfile.vue'
  import UserPwd from './components/UserPwd.vue'
  import UserLog from './components/UserLog.vue'
  import defaultAvatarImg from '@/assets/imgs/user/avatar.webp' // Assuming path, check

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = ref<any>({})
  const activeTab = ref('profile')
  const defaultAvatar = defaultAvatarImg
  const labelList = ['专注设计', '很有想法', '辣~', '大长腿', '川妹子', '海纳百川']

  const getUserInfo = async () => {
    const userId = userStore.getUserInfo.value?.userId
    if (userId) {
      try {
        const res = await CasbinApi.user.get(userId)
        userInfo.value = res
      } catch (error) {
        console.error(error)
      }
    }
  }

  onMounted(() => {
    getUserInfo()
  })
</script>

<style scoped lang="scss">
  .user-center-container {
    padding: 20px;
  }

  .box-card {
    margin-bottom: 20px;
  }

  .user-info-header {
    padding-bottom: 20px;
    text-align: center;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .user-avatar-box {
      margin-bottom: 15px;

      .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }
    }

    .user-name {
      margin-bottom: 10px;
      font-size: 20px;
      font-weight: 500;
    }

    .user-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .user-info-list {
    padding: 20px 0;

    .list-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-size: 14px;
      color: var(--el-text-color-regular);

      .el-icon {
        margin-right: 10px;
        font-size: 16px;
      }
    }
  }

  .user-tags {
    margin-top: 10px;

    .tag-title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 500;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
</style>
