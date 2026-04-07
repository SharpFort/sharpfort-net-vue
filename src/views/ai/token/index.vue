<template>
  <div class="p-6 h-full flex flex-col space-y-4 bg-gray-50">
    <!-- 顶部搜索模块 -->
    <SearchForm @search="onSearch" @reset="onReset" />

    <!-- 列表数据模块 -->
    <div class="bg-white p-4 rounded shadow-sm flex-1 flex flex-col">
      <!-- 按钮操作区 -->
      <div class="mb-4 flex space-x-2">
        <el-button type="primary" @click="handleAdd">
          新增 Token
        </el-button>
      </div>

      <!-- 表格区 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        class="w-full flex-1"
        height="100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="Token 名称" min-width="150" />
        <el-table-column prop="apiKey" label="API Key" min-width="200">
          <template #default="{ row }">
            <span v-if="row.apiKey">{{ row.apiKey }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间" width="160" align="center">
          <template #default="{ row }">
            <span v-if="row.expireTime">{{ formatDateTime(row.expireTime) }}</span>
            <span v-else class="text-gray-400">永久</span>
          </template>
        </el-table-column>
        <el-table-column prop="isDisabled" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isDisabled ? 'danger' : 'success'">
              {{ row.isDisabled ? '已禁用' : '已启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creationTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.creationTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              :title="row.isDisabled ? '确定要启用该 Token 吗？' : '确定要禁用该 Token 吗？'"
              @confirm="handleToggleStatus(row)"
            >
              <template #reference>
                <el-button :type="row.isDisabled ? 'success' : 'warning'" link>
                  {{ row.isDisabled ? '启用' : '禁用' }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm title="确定要删除该 Token 吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.SkipCount"
          v-model:page-size="queryParams.MaxResultCount"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="getList"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 弹窗组件 -->
    <ModelDialog ref="dialogRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { aiToken } from '@/api/token'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

// 模块组件导入
import SearchForm from './modules/SearchForm.vue'
import ModelDialog from './modules/ModelDialog.vue'

// ==== 数据定义 ====
const loading = ref(false)
const tableData = ref<Api.Token.TokenGetListOutputDto[]>([])
const total = ref(0)
const dialogRef = ref<InstanceType<typeof ModelDialog> | null>(null)

// 分页与搜索参数
const queryParams = reactive({
  SearchKey: '',
  StartTime: '',
  EndTime: '',
  SkipCount: 1, // 当前页码
  MaxResultCount: 10
})

// ==== 方法定义 ====

const formatDateTime = (time: string | undefined) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取列表数据
 */
const getList = async () => {
  loading.value = true
  try {
    const params: Api.Token.TokenSearchParams = {
      searchKey: queryParams.SearchKey || undefined,
      startTime: queryParams.StartTime || undefined,
      endTime: queryParams.EndTime || undefined,
      maxResultCount: queryParams.MaxResultCount,
      // ABP 的 SkipCount 表示跳过的记录数
      skipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount
    }
    const res = await aiToken.getList(params)
    tableData.value = res.items || []
    total.value = res.totalCount || 0
  } catch (e: any) {
    ElMessage.error(e.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 页码改变时的回调
 */
const handlePageChange = (page: number) => {
  queryParams.SkipCount = page
  getList()
}

/**
 * 接收搜索参数并重置到第一页后查询
 */
const onSearch = (params: any) => {
  queryParams.SearchKey = params.searchKey || ''
  queryParams.StartTime = params.startTime || ''
  queryParams.EndTime = params.endTime || ''
  queryParams.SkipCount = 1
  getList()
}

/**
 * 重置搜索条件
 */
const onReset = () => {
  queryParams.SearchKey = ''
  queryParams.StartTime = ''
  queryParams.EndTime = ''
  queryParams.SkipCount = 1
  getList()
}

/**
 * 打开新增弹窗
 */
const handleAdd = () => {
  dialogRef.value?.open()
}

/**
 * 打开编辑弹窗
 */
const handleEdit = (row: Api.Token.TokenGetListOutputDto) => {
  dialogRef.value?.open(row)
}

/**
 * 执行切换状态操作 (启用/禁用)
 */
const handleToggleStatus = async (row: Api.Token.TokenGetListOutputDto) => {
  try {
    if (row.isDisabled) {
      await aiToken.enable(row.id)
      ElMessage.success('已启用')
    } else {
      await aiToken.disable(row.id)
      ElMessage.success('已禁用')
    }
    getList()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

/**
 * 执行删除操作
 */
const handleDelete = async (row: Api.Token.TokenGetListOutputDto) => {
  try {
    await aiToken.delete(row.id as string)
    ElMessage.success('删除成功')
    getList()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

// ==== 生命周期 ====
onMounted(() => {
  getList()
})
</script>
