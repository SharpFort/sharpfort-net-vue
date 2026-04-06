<template>
  <div class="channel-app-container h-[calc(100vh-80px)] w-full flex flex-col p-6 overflow-hidden bg-slate-50 dark:bg-slate-900 !text-slate-800 dark:!text-slate-200">
    <!-- Header Area -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-md flex items-center justify-center text-white">
          <el-icon :size="20"><Box /></el-icon>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">渠道商应用管理</h1>
          <p class="text-xs text-slate-500 font-medium mt-0.5">管理和维护第三方平台及对外接入 AI 应用</p>
        </div>
      </div>
      <div>
        <el-button type="primary" class="shadow-sm font-medium" @click="handleCreate">
          <el-icon class="mr-1"><Plus /></el-icon> 新增应用
        </el-button>
      </div>
    </div>

    <!-- Search Form -->
    <SearchForm @search="handleSearch" @reset="handleReset" class="mb-4" />

    <!-- Main Data Table Area -->
    <div class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4 flex flex-col overflow-hidden">
      <!-- Table -->
      <el-table
        v-loading="loading"
        :data="tableData"
        class="custom-table w-full flex-1"
        height="100%"
        border
        stripe
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        
        <el-table-column prop="name" label="应用名称" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-medium text-slate-800 dark:text-slate-200">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="endpoint" label="应用终结点" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-mono text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 block w-full truncate">
              {{ row.endpoint }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="apiKey" label="应用 Key" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-slate-500 italic text-sm">
              {{ row.apiKey ? '**********************' : '未设置' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="orderNum" label="排序权重" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.orderNum }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="creationTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            <span class="text-xs text-slate-500">
              {{ new Date(row.creationTime).toLocaleString() }}
            </span>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon class="mr-1"><Edit /></el-icon> 编辑
            </el-button>
            
            <el-popconfirm 
              title="确定要该删除该应用吗？此操作不可恢复。" 
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">
                  <el-icon class="mr-1"><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-4 flex justify-end shrink-0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- Dialog -->
    <ModelDialog ref="dialogRef" @success="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Box, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SearchForm from './modules/SearchForm.vue'
import ModelDialog from './modules/ModelDialog.vue'
import { aiApp } from '@/api/channel'

// Data
const loading = ref(false)
const tableData = ref<Api.Channel.AiAppDto[]>([])
const dialogRef = ref<InstanceType<typeof ModelDialog> | null>(null)

// Pagination
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// Search Params
const searchParams = reactive<Partial<Api.Channel.AiAppSearchParams>>({})

const fetchData = async () => {
  loading.value = true
  try {
    const SkipCount = (pagination.page - 1) * pagination.limit
    
    const params: Api.Channel.AiAppSearchParams = {
      SkipCount,
      MaxResultCount: pagination.limit,
      ...searchParams
    }

    const { items, totalCount } = await aiApp.getList(params)
    tableData.value = items || []
    pagination.total = totalCount || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取应用列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (query: any) => {
  Object.keys(searchParams).forEach((key) => {
    delete (searchParams as any)[key]
  })
  Object.assign(searchParams, query)
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  Object.keys(searchParams).forEach((key) => {
    delete (searchParams as any)[key]
  })
  pagination.page = 1
  fetchData()
}

const handleCreate = () => {
  dialogRef.value?.open()
}

const handleEdit = (row: Api.Channel.AiAppDto) => {
  dialogRef.value?.open(row.id)
}

const handleDelete = async (row: Api.Channel.AiAppDto) => {
  try {
    await aiApp.delete(row.id)
    ElMessage.success('删除成功')
    
    // Auto page fallback
    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1
    }
    fetchData()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>
