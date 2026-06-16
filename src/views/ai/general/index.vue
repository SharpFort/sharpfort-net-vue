<template>
  <div class="p-6 h-full flex flex-col space-y-4 bg-gray-50">
    <SearchForm @search="onSearch" @reset="onReset" />

    <div class="bg-white p-4 rounded shadow-sm flex-1 flex flex-col">
      <div class="mb-4 flex space-x-2">
        <el-button type="primary" @click="handleAdd">新增</el-button>
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
        <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120" show-overflow-tooltip />
        <el-table-column prop="describe" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除吗？" @confirm="handleDelete(row)">
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
  import { aiGeneral } from '@/api/ai'
  import { ElMessage } from 'element-plus'
  import SearchForm from './modules/SearchForm.vue'
  import ModelDialog from './modules/ModelDialog.vue'

  defineOptions({ name: 'AiGeneral' })

  const loading = ref(false)
  const tableData = ref<Api.AiApp.AiAppDto[]>([])
  const total = ref(0)
  const dialogRef = ref<InstanceType<typeof ModelDialog> | null>(null)

  const queryParams = reactive({
    Keyword: '',
    SkipCount: 1,
    MaxResultCount: 10
  })

  const getList = async () => {
    loading.value = true
    try {
      const params = {
        Keyword: queryParams.Keyword || undefined,
        MaxResultCount: queryParams.MaxResultCount,
        SkipCount: (queryParams.SkipCount - 1) * queryParams.MaxResultCount
      }
      const res = await aiGeneral.getList(params)
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
    queryParams.Keyword = params.Keyword || ''
    queryParams.SkipCount = 1
    getList()
  }

  const onReset = () => {
    queryParams.Keyword = ''
    queryParams.SkipCount = 1
    getList()
  }

  const handleAdd = () => {
    dialogRef.value?.open()
  }

  const handleEdit = (row: Api.AiApp.AiAppDto) => {
    dialogRef.value?.open(row.id)
  }

  const handleDelete = async (row: Api.AiApp.AiAppDto) => {
    try {
      await aiGeneral.delete(row.id as string)
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
