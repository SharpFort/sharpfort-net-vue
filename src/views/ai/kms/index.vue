<template>
  <div class="p-6 h-full flex flex-col space-y-4 bg-gray-50">
    <SearchForm @search="onSearch" @reset="onReset" />

    <div class="bg-white p-4 rounded shadow-sm flex-1 flex flex-col">
      <div class="mb-4 flex space-x-2">
        <el-button type="primary" @click="handleAdd">新增知识库</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        class="w-full flex-1"
        height="100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="知识库名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="documentCount" label="文档数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 2" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 1" type="warning">处理中</el-tag>
            <el-tag v-else-if="row.status === 3" type="danger">失败</el-tag>
            <el-tag v-else type="info">待处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="maxTokensPerParagraph"
          label="每段Token"
          width="110"
          align="center"
        />
        <el-table-column prop="overlappingTokens" label="重叠Token" width="100" align="center" />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleProcessVector(row)">向量化</el-button>
            <el-popconfirm title="确定要删除该知识库吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

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

    <ModelDialog ref="dialogRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { aiKms } from '@/api/ai'
  import { ElMessage } from 'element-plus'
  import SearchForm from './modules/SearchForm.vue'
  import ModelDialog from './modules/ModelDialog.vue'

  defineOptions({ name: 'AiKms' })

  const loading = ref(false)
  const tableData = ref<Api.AiKms.AiKmsDto[]>([])
  const total = ref(0)
  const dialogRef = ref<InstanceType<typeof ModelDialog> | null>(null)

  const queryParams = reactive({
    SearchKey: '',
    SkipCount: 1,
    MaxResultCount: 10
  })

  const getList = async () => {
    loading.value = true
    try {
      const params: Api.AiKms.AiKmsSearchParams = {
        MaxResultCount: queryParams.MaxResultCount,
        SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount
      }
      const res = await aiKms.getList(params)
      tableData.value = res.items || []
      total.value = res.totalCount || 0
    } catch (e: any) {
      ElMessage.error(e.message || '获取列表失败')
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = (page: number) => {
    queryParams.SkipCount = page
    getList()
  }

  const onSearch = (params: Record<string, any>) => {
    queryParams.SearchKey = params.SearchKey || ''
    queryParams.SkipCount = 1
    getList()
  }

  const onReset = () => {
    queryParams.SearchKey = ''
    queryParams.SkipCount = 1
    getList()
  }

  const handleAdd = () => {
    dialogRef.value?.open()
  }

  const handleEdit = (row: Api.AiKms.AiKmsDto) => {
    dialogRef.value?.open(row.id)
  }

  const handleProcessVector = async (row: Api.AiKms.AiKmsDto) => {
    try {
      await aiKms.processVectorData(row.id as string)
      ElMessage.success('向量化处理已启动')
      getList()
    } catch (e: any) {
      ElMessage.error(e.message || '向量化处理失败')
    }
  }

  const handleDelete = async (row: Api.AiKms.AiKmsDto) => {
    try {
      await aiKms.delete(row.id as string)
      ElMessage.success('删除成功')
      getList()
    } catch (e: any) {
      ElMessage.error(e.message || '删除失败')
    }
  }

  onMounted(() => {
    getList()
  })
</script>
