<template>
  <div class="usage-statistics-container p-4">
    <el-card shadow="never" class="mb-4">
      <SearchForm @search="handleSearch" @reset="handleReset" />
    </el-card>

    <!-- 今日消耗 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="never" header="今日模型使用情况">
          <div v-loading="loading.today" class="flex flex-wrap gap-4">
            <el-card v-for="item in todayUsage" :key="item.modelId || 'unknown'" shadow="hover" class="w-64">
              <div class="flex items-center gap-4 mb-2">
                <el-avatar v-if="item.iconUrl" :src="item.iconUrl" :size="40" />
                <el-avatar v-else :size="40">{{ (item.modelId || '未知').charAt(0).toUpperCase() }}</el-avatar>
                <div class="font-bold truncate" :title="item.modelId || '未知'">{{ item.modelId || '未知' }}</div>
              </div>
              <div class="flex justify-between text-sm text-gray-500 mt-2">
                <span>使用次数:</span>
                <span class="text-blue-600 font-bold">{{ item.usageCount }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>消耗Token:</span>
                <span class="text-orange-500 font-bold">{{ item.totalTokens }}</span>
              </div>
            </el-card>
            <el-empty v-if="!todayUsage.length" description="今日暂无使用记录" class="mx-auto" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表展示区 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="12">
        <el-card shadow="never" header="各模型Token消耗占比">
          <el-table v-loading="loading.model" :data="modelUsage" style="width: 100%" height="300px">
            <el-table-column prop="model" label="模型" show-overflow-tooltip />
            <el-table-column prop="tokens" label="消耗 Token" width="120" />
            <el-table-column prop="percentage" label="占比 (%)" width="120">
              <template #default="{ row }">
                {{ row.percentage?.toFixed(2) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" header="近7天Token消耗趋势">
          <el-table v-loading="loading.daily" :data="dailyUsage" style="width: 100%" height="300px">
            <el-table-column label="日期" width="180">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="tokens" label="消耗 Token" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近24小时 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="never" header="近24小时Token消耗">
          <el-table v-loading="loading.hourly" :data="hourlyUsage" style="width: 100%" height="350px">
            <el-table-column label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.hour) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalTokens" label="总消耗 Token" width="150" />
            <el-table-column label="模型明细">
              <template #default="{ row }">
                <div v-if="row.modelBreakdown?.length" class="flex gap-2 flex-wrap">
                  <el-tag v-for="tag in row.modelBreakdown" :key="tag.modelId" size="small">
                    {{ tag.modelId }}: {{ tag.tokens }}
                  </el-tag>
                </div>
                <span v-else class="text-gray-400">无数据</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usageStatistics } from '@/api/ai'
import SearchForm from './modules/SearchForm.vue'

defineOptions({
  name: 'AiUsageStatistics'
})

// 数据状态
const todayUsage = ref<Api.UsageStatistics.ModelTodayUsageDto[]>([])
const dailyUsage = ref<Api.UsageStatistics.DailyTokenUsageDto[]>([])
const modelUsage = ref<Api.UsageStatistics.ModelTokenUsageDto[]>([])
const hourlyUsage = ref<Api.UsageStatistics.HourlyTokenUsageDto[]>([])

const loading = ref({
  today: false,
  daily: false,
  model: false,
  hourly: false
})

const currentParams = ref<{ TokenId?: string }>({})

// 并发加载数据
const loadData = async () => {
  const p = currentParams.value

  loading.value.today = true
  usageStatistics.getTodayModelUsage(p).then(res => {
    todayUsage.value = res || []
  }).catch(() => {}).finally(() => { loading.value.today = false })

  loading.value.daily = true
  usageStatistics.getLast7DaysTokenUsage(p).then(res => {
    dailyUsage.value = res || []
  }).catch(() => {}).finally(() => { loading.value.daily = false })

  loading.value.model = true
  usageStatistics.getModelTokenUsage(p).then(res => {
    modelUsage.value = res || []
  }).catch(() => {}).finally(() => { loading.value.model = false })

  loading.value.hourly = true
  usageStatistics.getLast24HoursTokenUsage(p).then(res => {
    hourlyUsage.value = res || []
  }).catch(() => {}).finally(() => { loading.value.hourly = false })
}

const handleSearch = (params: { TokenId?: string }) => {
  currentParams.value = params
  loadData()
}

const handleReset = () => {
  currentParams.value = {}
  loadData()
}

// 时间格式化工具函数
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '-'
  const d = new Date(timeStr)
  return `${d.toLocaleDateString()} ${d.getHours().toString().padStart(2, '0')}:00`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.usage-statistics-container {
  background-color: var(--el-bg-color-page);
  min-height: 100%;
}
</style>
