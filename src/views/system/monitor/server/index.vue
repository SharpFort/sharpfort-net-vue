<template>
  <div class="monitor-server-page">
    <ElCard shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">服务器监控</span>
          <ElButton :icon="RefreshIcon" :loading="loading" @click="fetchData">刷新</ElButton>
        </div>
      </template>

      <div v-if="loading && !serverInfo" class="loading-container">
        <ElSkeleton :rows="8" animated />
      </div>

      <div v-else-if="error" class="error-container">
        <ElEmpty description="暂无服务器监控数据">
          <ElButton type="primary" @click="fetchData">重试</ElButton>
        </ElEmpty>
      </div>

      <div v-else class="server-info">
        <!-- CPU信息 -->
        <ElDescriptions title="CPU信息" :column="2" border class="info-section">
          <ElDescriptionsItem label="CPU型号">
            {{ serverInfo?.cpu?.name || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="核心数">
            {{ serverInfo?.cpu?.coreCount || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="当前使用率" :span="2">
            <div class="progress-item">
              <ElProgress
                :percentage="parseFloat(serverInfo?.cpu?.usage || 0)"
                :color="getProgressColor(parseFloat(serverInfo?.cpu?.usage || 0))"
              />
            </div>
          </ElDescriptionsItem>
        </ElDescriptions>

        <!-- 内存信息 -->
        <ElDescriptions title="内存信息" :column="2" border class="info-section">
          <ElDescriptionsItem label="总内存">
            {{ formatBytes(serverInfo?.memory?.total) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="已用内存">
            {{ formatBytes(serverInfo?.memory?.used) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="可用内存">
            {{ formatBytes(serverInfo?.memory?.available) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="使用率">
            <div class="progress-item">
              <ElProgress
                :percentage="parseFloat(serverInfo?.memory?.usageRate || 0)"
                :color="getProgressColor(parseFloat(serverInfo?.memory?.usageRate || 0))"
              />
            </div>
          </ElDescriptionsItem>
        </ElDescriptions>

        <!-- 磁盘信息 -->
        <ElDescriptions title="磁盘信息" :column="1" border class="info-section">
          <ElDescriptionsItem
            v-for="(disk, index) in serverInfo?.disks || []"
            :key="index"
            :label="disk.name || `磁盘${index + 1}`"
          >
            <div class="disk-info">
              <div class="disk-details">
                <span>总容量: {{ formatBytes(disk.total) }}</span>
                <span>已用: {{ formatBytes(disk.used) }}</span>
                <span>可用: {{ formatBytes(disk.available) }}</span>
              </div>
              <ElProgress
                :percentage="parseFloat(disk.usageRate || 0)"
                :color="getProgressColor(parseFloat(disk.usageRate || 0))"
              />
            </div>
          </ElDescriptionsItem>
          <ElDescriptionsItem v-if="!serverInfo?.disks || serverInfo.disks.length === 0">
            <ElEmpty description="暂无磁盘信息" :image-size="60" />
          </ElDescriptionsItem>
        </ElDescriptions>

        <!-- 系统信息 -->
        <ElDescriptions title="系统信息" :column="2" border class="info-section">
          <ElDescriptionsItem label="操作系统">
            {{ serverInfo?.system?.os || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="系统架构">
            {{ serverInfo?.system?.arch || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="主机名">
            {{ serverInfo?.system?.hostName || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="运行时间">
            {{ formatUptime(serverInfo?.system?.uptime) }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <!-- 运行时信息 -->
        <ElDescriptions title="运行时信息" :column="2" border class="info-section">
          <ElDescriptionsItem label="运行环境">
            {{ serverInfo?.runtime?.name || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="版本">
            {{ serverInfo?.runtime?.version || '暂无数据' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="项目路径" :span="2">
            {{ serverInfo?.runtime?.projectPath || '暂无数据' }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Refresh as RefreshIcon } from '@element-plus/icons-vue'
  import { CasbinApi } from '@/api/casbin-rbac'

  defineOptions({ name: 'MonitorServer' })

  const loading = ref(false)
  const error = ref(false)
  const serverInfo = ref<any>(null)

  const fetchData = async () => {
    loading.value = true
    error.value = false
    try {
      const response = await CasbinApi.monitor.serverInfo()
      serverInfo.value = response
    } catch (err: any) {
      error.value = true
      ElMessage.warning('获取服务器信息失败，后端接口可能尚未实现')
      console.error('Failed to fetch server info:', err)
    } finally {
      loading.value = false
    }
  }

  const formatBytes = (bytes: number | undefined): string => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number | undefined): string => {
    if (!seconds) return '0秒'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const parts = []
    if (days > 0) parts.push(`${days}天`)
    if (hours > 0) parts.push(`${hours}小时`)
    if (minutes > 0) parts.push(`${minutes}分钟`)
    return parts.join(' ') || '0分钟'
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage < 60) return '#67c23a'
    if (percentage < 80) return '#e6a23c'
    return '#f56c6c'
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped>
  .monitor-server-page {
    padding: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
  }

  .loading-container,
  .error-container {
    padding: 40px 20px;
  }

  .server-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .info-section {
    margin-bottom: 0;
  }

  .progress-item {
    width: 100%;
    padding-right: 20px;
  }

  .disk-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .disk-details {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
