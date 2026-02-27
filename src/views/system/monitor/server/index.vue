<template>
  <div class="monitor-server-page">
    <ElCard shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">服务器监控面板</span>
          <div class="header-actions">
            <span class="refresh-indicator" v-if="polling">实时通讯中 (5s)</span>
            <ElButton
              :icon="RefreshIcon"
              :loading="loading"
              @click="fetchData(true)"
              type="primary"
              plain
              size="small"
              >手 动 刷 新</ElButton
            >
          </div>
        </div>
      </template>

      <div v-if="loading && !serverInfo && !pollingInit" class="loading-container">
        <ElSkeleton :rows="12" animated />
      </div>

      <div v-else-if="error && !serverInfo" class="error-container">
        <ElEmpty description="暂无服务器监控数据">
          <ElButton type="primary" @click="fetchData(true)">重试</ElButton>
        </ElEmpty>
      </div>

      <div v-else-if="serverInfo" class="server-info-grid">
        <!-- 概览指标 (CPU & 内存) -->
        <ElRow :gutter="20">
          <ElCol :span="12" :xs="24" :md="12" :lg="12">
            <ElCard shadow="hover" class="metric-card cpu-card">
              <template #header>
                <div class="card-title"
                  ><ElIcon><Cpu /></ElIcon> CPU 使用率</div
                >
              </template>
              <div class="metric-content">
                <ElProgress
                  type="dashboard"
                  :percentage="parseFloat(serverInfo.cpu?.cpuRate?.toString() || '0')"
                  :color="getProgressColor"
                  :width="150"
                  :stroke-width="12"
                >
                  <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage.toFixed(1) }}%</span>
                    <span class="percentage-label">{{ serverInfo.cpu?.coreTotal || 0 }} 核心</span>
                  </template>
                </ElProgress>
                <div class="metric-details">
                  <p><strong>型号:</strong> {{ serverInfo.cpu?.name || '未知' }}</p>
                  <p><strong>逻辑处理器:</strong> {{ serverInfo.cpu?.logicalProcessors || 0 }}</p>
                  <p>
                    <strong>空闲率:</strong>
                    <ElTag size="small" type="success" effect="light"
                      >{{ serverInfo.cpu?.freeRate || 0 }}%</ElTag
                    >
                  </p>
                </div>
              </div>
            </ElCard>
          </ElCol>

          <ElCol :span="12" :xs="24" :md="12" :lg="12">
            <ElCard shadow="hover" class="metric-card memory-card">
              <template #header>
                <div class="card-title"
                  ><ElIcon><PieChart /></ElIcon> 内存使用率</div
                >
              </template>
              <div class="metric-content">
                <ElProgress
                  type="dashboard"
                  :percentage="parseFloat(serverInfo.memory?.ramRate || '0')"
                  :color="getProgressColor"
                  :width="150"
                  :stroke-width="12"
                >
                  <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage.toFixed(1) }}%</span>
                    <span class="percentage-label">已使用</span>
                  </template>
                </ElProgress>
                <div class="metric-details">
                  <p><strong>总内存:</strong> {{ serverInfo.memory?.totalRAM || '0' }}</p>
                  <p><strong>已用内存:</strong> {{ serverInfo.memory?.usedRam || '0' }}</p>
                  <p>
                    <strong>可用内存:</strong>
                    <ElTag size="small" type="success" effect="light">{{
                      serverInfo.memory?.freeRam || '0'
                    }}</ElTag>
                  </p>
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>

        <!-- 系统与应用环境 -->
        <ElRow :gutter="20" class="mt-20">
          <ElCol :span="12" :xs="24">
            <ElCard shadow="hover" class="info-card">
              <template #header>
                <div class="card-title"
                  ><ElIcon><Monitor /></ElIcon> 服务器信息</div
                >
              </template>
              <ElDescriptions :column="1" border size="small">
                <ElDescriptionsItem label="主机名称">{{
                  serverInfo.sys?.computerName || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="操作系统">{{
                  serverInfo.sys?.osName || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="系统架构">{{
                  serverInfo.sys?.osArch || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="服务器IP">{{
                  serverInfo.sys?.serverIP || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="系统运行时间">{{
                  serverInfo.sys?.runTime || '-'
                }}</ElDescriptionsItem>
              </ElDescriptions>
            </ElCard>
          </ElCol>

          <ElCol :span="12" :xs="24">
            <ElCard shadow="hover" class="info-card">
              <template #header>
                <div class="card-title"
                  ><ElIcon><Platform /></ElIcon> 运行环境信息</div
                >
              </template>
              <ElDescriptions :column="1" border size="small">
                <ElDescriptionsItem label="应用名称">{{
                  serverInfo.app?.name || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="运行时版本">{{
                  serverInfo.app?.version || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="应用内存驻留">{{
                  serverInfo.app?.appRAM || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="启动时间">{{
                  serverInfo.app?.startTime || '-'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="连续运行">{{
                  serverInfo.app?.runTime || '-'
                }}</ElDescriptionsItem>
              </ElDescriptions>
            </ElCard>
          </ElCol>
        </ElRow>

        <!-- 磁盘信息 -->
        <ElCard shadow="hover" class="mt-20 disk-section">
          <template #header>
            <div class="card-title"
              ><ElIcon><DataLine /></ElIcon> 磁盘空间分配</div
            >
          </template>
          <ElRow :gutter="20">
            <ElCol
              v-for="(disk, index) in serverInfo.disks || []"
              :key="index"
              :span="8"
              :md="8"
              :sm="12"
              :xs="24"
            >
              <div class="disk-item">
                <div class="disk-header">
                  <span class="disk-name">{{ disk.diskName }} ({{ disk.typeName }})</span>
                  <span class="disk-percent">{{ disk.availablePercent }}% 可用</span>
                </div>
                <!-- 磁盘使用率 = 100 - 可用百分比 (规避可能是 undefined) -->
                <ElProgress
                  :percentage="
                    Math.max(0, 100 - parseFloat(disk.availablePercent?.toString() || '0'))
                  "
                  :color="getProgressColor"
                  :stroke-width="10"
                />
                <div class="disk-stats">
                  <!-- 如果totalSize特别大通常是byte单位，否则如果不到100,000可能是GB -->
                  <span title="总量">共 {{ formatDiskSize(disk.totalSize) }}</span>
                  <span title="已使用">用 {{ formatDiskSize(disk.used) }}</span>
                  <span title="剩余闲置">余 {{ formatDiskSize(disk.availableFreeSpace) }}</span>
                </div>
              </div>
            </ElCol>
          </ElRow>
          <ElEmpty
            v-if="!serverInfo.disks?.length"
            description="暂无挂载磁盘信息"
            :image-size="60"
          />
        </ElCard>

        <!-- 网卡与程序集 -->
        <ElTabs type="border-card" class="mt-20 custom-tabs">
          <ElTabPane>
            <template #label>
              <span class="tab-label"
                ><ElIcon><Connection /></ElIcon> 网络适配器</span
              >
            </template>
            <ElTable :data="serverInfo.networks || []" size="small" border stripe>
              <ElTableColumn prop="name" label="网卡名称" min-width="250" show-overflow-tooltip />
              <ElTableColumn prop="iPv4" label="IPv4 地址" width="200" align="center" />
              <ElTableColumn
                prop="macAddress"
                label="MAC 地址 (物理地址)"
                width="200"
                align="center"
              />
            </ElTable>
          </ElTabPane>

          <ElTabPane>
            <template #label>
              <span class="tab-label"
                ><ElIcon><Files /></ElIcon> .NET 依赖程序集</span
              >
            </template>
            <ElTable :data="serverInfo.assemblies || []" size="small" border stripe height="350">
              <ElTableColumn type="index" label="序列" width="70" align="center" />
              <ElTableColumn
                prop="name"
                label="装载程序集名称"
                min-width="350"
                show-overflow-tooltip
              />
              <ElTableColumn prop="version" label="库版本号" width="180" align="center">
                <template #default="{ row }">
                  <ElTag size="small" effect="plain" type="info">{{ row.version }}</ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>
        </ElTabs>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Refresh as RefreshIcon,
    Cpu,
    PieChart,
    Monitor,
    Platform,
    DataLine,
    Connection,
    Files
  } from '@element-plus/icons-vue'
  import { CasbinApi } from '@/api/casbin-rbac'

  defineOptions({ name: 'MonitorServer' })

  const loading = ref(false)
  const error = ref(false)
  const serverInfo = ref<Api.Monitor.MonitorServerInfoDto | null>(null)

  // 轮询控制
  const polling = ref(false)
  const pollingInit = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  const fetchData = async (isManual = false) => {
    if (isManual && !pollingInit.value) {
      loading.value = true
    }
    error.value = false
    try {
      const response = await CasbinApi.monitor.serverInfo()
      serverInfo.value = response

      // 初始化成功标记
      if (!pollingInit.value) {
        pollingInit.value = true
      }
    } catch (err: any) {
      error.value = true
      if (isManual) {
        ElMessage.warning('获取服务器各项指标失败，无法连接监控模块')
      }
      console.error('Failed to fetch monitoring server info:', err)
    } finally {
      if (isManual) {
        loading.value = false
      }
    }
  }

  const startPolling = () => {
    if (timer) clearInterval(timer)
    polling.value = true
    // 提供良好的连续动画体验，定时5秒抓一次
    timer = setInterval(() => {
      fetchData(false)
    }, 5000)
  }

  const stopPolling = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    polling.value = false
  }

  // 通用的字节转GB/MB等可视文字化 (如果直接给了GB数字也会自适应)
  const formatDiskSize = (val: number | undefined): string => {
    if (val === undefined || val === null || isNaN(val)) return '0 B'
    // 若值较小，可能新库Hardware.Info以GB返回。若超大，则可能是Bytes
    if (val < 1000000) {
      return `${val} GB` // assuming GB
    }
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(val) / Math.log(k))
    if (i < 0) return '0 B'
    return parseFloat((val / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProgressColor = (percentage: number): string => {
    const p = isNaN(percentage) ? 0 : parseFloat(percentage.toString())
    if (p < 60) return '#67c23a' // 绿色健康
    if (p < 85) return '#e6a23c' // 黄色警惕
    return '#f56c6c' // 红色风险
  }

  onMounted(() => {
    fetchData(true).then(() => {
      startPolling()
    })
  })

  onBeforeUnmount(() => {
    stopPolling()
  })
</script>

<style scoped>
  .monitor-server-page {
    min-height: calc(100vh - 120px);
    padding: 16px;
    background-color: transparent;
  }

  .main-card {
    background: var(--el-bg-color-overlay);
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 5%);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    letter-spacing: 0.5px;
  }

  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .refresh-indicator {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-color-success);
    background: rgb(103 194 58 / 10%);
    border-radius: 20px;
  }

  .refresh-indicator::before {
    display: inline-block;
    width: 8px;
    height: 8px;
    content: '';
    background-color: var(--el-color-success);
    border-radius: 50%;
    animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 0 0 rgb(103 194 58 / 70%);
    }

    70% {
      box-shadow: 0 0 0 8px rgb(103 194 58 / 0%);
    }

    100% {
      box-shadow: 0 0 0 0 rgb(103 194 58 / 0%);
    }
  }

  .mt-20 {
    margin-top: 20px;
  }

  .loading-container,
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
  }

  .card-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .metric-card {
    height: 100%;
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .metric-card:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 12px 28px rgb(0 0 0 / 8%);
    transform: translateY(-4px);
  }

  .metric-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
  }

  .percentage-value {
    display: block;
    font-size: 26px;
    font-weight: 800;
    line-height: 1.2;
    color: var(--el-text-color-primary);
  }

  .percentage-label {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .metric-details {
    flex: 1;
    padding-left: 20px;
  }

  .metric-details p {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 4px;
    margin: 10px 0;
    font-size: 14px;
    color: var(--el-text-color-regular);
    border-bottom: 1px dashed var(--el-border-color-lighter);
  }

  .metric-details p:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .info-card {
    height: 100%;
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
  }

  .info-card :deep(.el-descriptions__label) {
    width: 120px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-light);
  }

  .disk-section {
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
  }

  .disk-item {
    padding: 16px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border: 1px solid transparent;
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .disk-item:hover {
    background: var(--el-bg-color);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
  }

  .disk-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .disk-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .disk-percent {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }

  .disk-stats {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .custom-tabs {
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 4%) !important;
  }

  .tab-label {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
  }

  :deep(.el-progress-circle) {
    transition:
      stroke-dasharray 0.6s ease-in-out,
      stroke 0.6s ease;
  }

  :deep(.el-progress-bar__inner) {
    transition:
      width 0.6s ease-in-out,
      background-color 0.6s ease;
  }
</style>
