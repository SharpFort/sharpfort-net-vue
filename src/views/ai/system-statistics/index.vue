<template>
  <div class="system-statistics-container p-4">
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" class="mb-0">
        <el-form-item label="统计日期">
          <el-date-picker
            v-model="queryDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            :clearable="false"
            @change="fetchData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">刷新数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="never" header="全局模型 Token 消耗及成本分析">
          <el-table v-loading="loading" :data="tableData" border style="width: 100%">
            <el-table-column prop="modelName" label="模型名称" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="font-bold">{{ row.modelName }}</span>
                <div class="text-xs text-gray-400">{{ row.modelId }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="tokens" label="消耗 Token" width="150" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.tokens) }}
              </template>
            </el-table-column>
            <el-table-column prop="tokensInWan" label="消耗(万)" width="120" align="right">
              <template #default="{ row }">
                {{ row.tokensInWan?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="count" label="使用次数" width="120" align="right" />
            <el-table-column prop="cost" label="预估成本 (RMB)" width="150" align="right">
              <template #default="{ row }">
                <span class="text-orange-600 font-bold">¥{{ row.cost?.toFixed(4) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="costPerHundredMillion" label="1亿Token成本" width="150" align="right">
              <template #default="{ row }">
                <el-tag :type="getRiskType(row.costPerHundredMillion)" size="small">
                  ¥{{ row.costPerHundredMillion?.toFixed(2) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成本摘要卡片 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="text-center">
          <template #header>总消耗 Token</template>
          <div class="text-2xl font-bold text-blue-600">{{ formatNumber(totalTokens) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="text-center">
          <template #header>总成本 (RMB)</template>
          <div class="text-2xl font-bold text-orange-600">¥{{ totalCost.toFixed(4) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="text-center">
          <template #header>总调用次数</template>
          <div class="text-2xl font-bold text-green-600">{{ totalCount }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { systemStatisticsApi } from '@/api/ai'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'AiSystemStatistics'
})

const loading = ref(false)
const tableData = ref<Api.SystemStatistics.ModelTokenStatisticsDto[]>([])
const queryDate = ref(new Date().toISOString().split('T')[0])

const totalTokens = computed(() => tableData.value.reduce((sum, item) => sum + (item.tokens || 0), 0))
const totalCost = computed(() => tableData.value.reduce((sum, item) => sum + (item.cost || 0), 0))
const totalCount = computed(() => tableData.value.reduce((sum, item) => sum + (item.count || 0), 0))

const fetchData = async () => {
  try {
    loading.value = true
    const res = await systemStatisticsApi.getTokenStatistics({
      date: `${queryDate.value}T00:00:00`
    })
    tableData.value = res.modelStatistics || []
  } catch {
    ElMessage.error('获取系统统计数据失败')
  } finally {
    loading.value = false
  }
}

const formatNumber = (num?: number) => {
  if (num === undefined) return '0'
  return num.toLocaleString()
}

const getRiskType = (cost?: number) => {
  if (!cost) return 'info'
  if (cost > 100) return 'danger'
  if (cost > 20) return 'warning'
  return 'success'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.system-statistics-container {
  background-color: var(--el-bg-color-page);
  min-height: 100%;
}
</style>

