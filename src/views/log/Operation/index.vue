<!-- 操作日志页面 -->
<template>
  <div class="operation-log-page art-custom-card">
    <div class="art-custom-card-container">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model="formFilters"
        :items="formItems"
        @reset="handleReset"
        @search="handleSearch"
      />

      <ElCard class="art-table-card" shadow="never">
        <!-- 表格头部 -->
        <ArtTableHeader
          :showZebra="false"
          :loading="loading"
          v-model:columns="columnChecks"
          @refresh="handleRefresh"
        >
          <template #right>
            <ElButton type="danger" @click="handleBatchDelete" :disabled="!selection.length">
              批量删除
            </ElButton>
            <ElButton type="primary" @click="handleExport" :loading="exportLoading">
              导出
            </ElButton>
          </template>
        </ArtTableHeader>

        <ArtTable
          ref="tableRef"
          rowKey="id"
          :loading="loading"
          :columns="columns"
          :data="tableData"
          :stripe="true"
          @selection-change="handleSelectionChange"
        />

        <!-- 分页 -->
        <div class="pagination custom-pagination center">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 30, 50]"
            align="center"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="handlePageChange"
            @size-change="handlePageChange"
          />
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { LogApi } from '@/api/log'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { downloadFile } from '@/utils/file'

  defineOptions({ name: 'OperationLog' })

  // 状态管理
  const loading = ref(false)
  const exportLoading = ref(false)
  const tableData = ref<Api.Log.OperationLogDto[]>([])
  const selection = ref<Api.Log.OperationLogDto[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索相关
  // 定义表单绑定的数据类型，包含日期范围数组
  interface SearchForm extends Api.Log.OperationLogSearchParams {
    dateRange?: [string, string]
  }

  const formFilters = reactive<SearchForm>({
    OperUser: '',
    OperationType: undefined,
    dateRange: undefined
  })

  const formItems = computed(() => [
    {
      label: '操作人员',
      key: 'OperUser',
      type: 'input',
      props: { clearable: true, placeholder: '请输入操作人员' }
    },
    {
      label: '操作类型',
      key: 'OperationType',
      type: 'select',
      options: [
        { label: '其他', value: 0 },
        { label: '新增', value: 1 },
        { label: '修改', value: 2 },
        { label: '删除', value: 3 },
        { label: '授权', value: 4 },
        { label: '导出', value: 5 },
        { label: '导入', value: 6 },
        { label: '强退', value: 7 },
        { label: '生成代码', value: 8 },
        { label: '清空数据', value: 9 }
      ],
      props: { clearable: true, placeholder: '请选择操作类型' }
    },
    {
      label: '操作时间',
      key: 'dateRange',
      type: 'daterange',
      props: {
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]
      }
    }
  ])

  onMounted(() => {
    getOperationLogList()
  })

  /**
   * 获取操作日志列表
   */
  const getOperationLogList = async (): Promise<void> => {
    loading.value = true
    try {
      // 处理日期范围
      const { dateRange, ...params } = formFilters
      if (dateRange && dateRange.length === 2) {
        params.StartTime = dateRange[0]
        params.EndTime = dateRange[1]
      }

      const res = await LogApi.operation.getList({
        ...params,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size,
        Sorting: 'creationTime desc'
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取操作日志失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出Excel
   */
  const handleExport = async (): Promise<void> => {
    exportLoading.value = true
    try {
      const { dateRange, ...params } = formFilters
      if (dateRange && dateRange.length === 2) {
        params.StartTime = dateRange[0]
        params.EndTime = dateRange[1]
      }

      const blob = await LogApi.operation.export({
        ...params,
        SkipCount: 0,
        MaxResultCount: 1000 // 导出数量限制
      })
      downloadFile(blob, `操作日志_${new Date().getTime()}.xlsx`)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    } finally {
      exportLoading.value = false
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = (): void => {
    if (!selection.value.length) return
    ElMessageBox.confirm('确认删除选中的日志吗？', '提示', {
      type: 'warning'
    }).then(async () => {
      try {
        const ids = selection.value.map((item) => item.id)
        await LogApi.operation.del(ids)
        ElMessage.success('删除成功')
        getOperationLogList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
  }

  const handleSelectionChange = (val: Api.Log.OperationLogDto[]) => {
    selection.value = val
  }

  // 辅助函数：操作类型转文字
  const getOperationTypeText = (val: number | undefined) => {
    const map = {
      0: '其他',
      1: '新增',
      2: '修改',
      3: '删除',
      4: '授权',
      5: '导出',
      6: '导入',
      7: '强退',
      8: '生成代码',
      9: '清空数据'
    }
    return map[val as keyof typeof map] || '未知'
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    { type: 'selection', width: 55 },
    {
      prop: 'title',
      label: '模块标题',
      minWidth: 120
    },
    {
      prop: 'operationType',
      label: '操作类型',
      width: 100,
      formatter: (row: Api.Log.OperationLogDto) => getOperationTypeText(row.operationType)
    },
    {
      prop: 'requestMethod',
      label: '请求方式',
      width: 100
    },
    {
      prop: 'operUser',
      label: '操作人员',
      width: 120
    },
    {
      prop: 'operIp',
      label: '操作IP',
      width: 130
    },
    {
      prop: 'operLocation',
      label: '操作地点',
      width: 150
    },
    {
      prop: 'method',
      label: '方法名称',
      minWidth: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'creationTime',
      label: '操作时间',
      width: 180,
      formatter: (row: any) => {
        return row.creationTime ? row.creationTime.replace('T', ' ').split('.')[0] : ''
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      OperUser: '',
      OperationType: undefined,
      dateRange: undefined
    })
    handleSearch()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getOperationLogList()
  }

  const handleRefresh = (): void => {
    getOperationLogList()
  }

  const handlePageChange = (): void => {
    getOperationLogList()
  }
</script>

<style scoped lang="scss">
  .operation-log-page {
    .art-custom-card-container {
      padding: 20px;
      background-color: var(--art-bg-color);
    }
  }
</style>
