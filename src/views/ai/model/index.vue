<template>
  <div class="p-6 h-full flex flex-col space-y-4 bg-gray-50">
    <!-- 顶部搜索模块 -->
    <SearchForm @search="onSearch" @reset="onReset" />

    <!-- 列表数据模块 -->
    <div class="bg-white p-4 rounded shadow-sm flex-1 flex flex-col">
      <!-- 按钮操作区 -->
      <div class="mb-4 flex space-x-2">
        <el-button type="primary" @click="handleAdd">
          新增AI模型
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
        <el-table-column prop="name" label="模型名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="modelId" label="模型ID" min-width="160" show-overflow-tooltip />
        <el-table-column prop="providerName" label="供应商分组" min-width="120" />
        <el-table-column prop="handlerName" label="处理程序" min-width="140" show-overflow-tooltip />
        
        <el-table-column prop="modelType" label="类型/API类型" min-width="120">
          <template #default="{ row }">
            <span class="text-sm block">类型: {{ row.modelType }}</span>
            <span class="text-gray-500 text-xs">API: {{ row.modelApiType }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="multiplierShow" label="显示倍率" width="100" />
        <el-table-column prop="isEnabled" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="排序" width="80" align="center" />
        
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm title="确定要删除该模型吗？" @confirm="handleDelete(row)">
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
import { aiModel } from '@/api/ai'
import { ElMessage } from 'element-plus'

// 模块组件导入
import SearchForm from './modules/SearchForm.vue'
import ModelDialog from './modules/ModelDialog.vue'

// ==== 数据定义 ====
const loading = ref(false)
const tableData = ref<Api.AiModel.AiModelDto[]>([])
const total = ref(0)
const dialogRef = ref<InstanceType<typeof ModelDialog> | null>(null)

// 分页与搜索参数
const queryParams = reactive({
  SearchKey: '',
  AiProviderId: '',
  StartTime: '',
  EndTime: '',
  SkipCount: 1, // 当前页码，用于 el-pagination 绑定
  MaxResultCount: 10
})

// ==== 方法定义 ====

/**
 * 获取列表数据
 */
const getList = async () => {
  loading.value = true
  try {
    const params: Api.AiModel.AiModelSearchParams = {
      SearchKey: queryParams.SearchKey || undefined,
      AiProviderId: queryParams.AiProviderId || undefined,
      StartTime: queryParams.StartTime || undefined,
      EndTime: queryParams.EndTime || undefined,
      MaxResultCount: queryParams.MaxResultCount,
      // ABP 的 SkipCount 表示跳过的记录数
      SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount
    }
    const res = await aiModel.getList(params)
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
const onSearch = (params: Partial<Api.AiModel.AiModelSearchParams>) => {
  Object.assign(queryParams, params)
  queryParams.SkipCount = 1
  getList()
}

/**
 * 重置搜索条件
 */
const onReset = () => {
  queryParams.SearchKey = ''
  queryParams.AiProviderId = ''
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
const handleEdit = (row: Api.AiModel.AiModelDto) => {
  dialogRef.value?.open(row.id)
}

/**
 * 执行删除操作
 */
const handleDelete = async (row: Api.AiModel.AiModelDto) => {
  try {
    await aiModel.delete(row.id)
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
