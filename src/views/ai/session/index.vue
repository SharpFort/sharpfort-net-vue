<template>
  <div class="session-container p-4">
    <el-card shadow="never" class="mb-4">
      <SearchForm @search="handleSearch" @reset="handleReset" />
      <div class="mt-4">
        <el-button type="primary" @click="handleCreate">创建会话</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        border
      >
        <el-table-column prop="sessionTitle" label="会话标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="sessionType" label="会话类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.sessionType === 'Agent' ? 'warning' : 'primary'">
              {{ row.sessionType === 'Agent' ? '智能体' : '对话' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sessionContent" label="会话内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定要删除该会话吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <ModelDialog ref="dialogRef" @success="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { sessionApi } from '@/api/ai'
import { ElMessage } from 'element-plus'
import SearchForm from './modules/SearchForm.vue'
import ModelDialog from './modules/ModelDialog.vue'

defineOptions({
  name: 'AiSession'
})

const loading = ref(false)
const tableData = ref<Api.Session.SessionDto[]>([])
const searchParams = ref<{ [key: string]: any }>({})
const dialogRef = ref<InstanceType<typeof ModelDialog>>()

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchData = async () => {
  try {
    loading.value = true
    const params: Api.Session.SessionSearchParams = {
      ...searchParams.value,
      skipCount: (pagination.page - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    }
    const res = await sessionApi.getList(params)
    tableData.value = res.items || []
    pagination.total = res.totalCount || 0
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: any) => {
  searchParams.value = params
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchParams.value = {}
  pagination.page = 1
  fetchData()
}

const handleCreate = () => {
  dialogRef.value?.open()
}

const handleEdit = (row: Api.Session.SessionDto) => {
  dialogRef.value?.open(row.id)
}

const handleDelete = async (row: Api.Session.SessionDto) => {
  try {
    await sessionApi.delete(row.id)
    ElMessage.success('删除成功')
    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page--
    }
    fetchData()
  } catch {
    //
  }
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchData()
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.session-container {
  background-color: var(--el-bg-color-page);
  min-height: 100%;
}
</style>


