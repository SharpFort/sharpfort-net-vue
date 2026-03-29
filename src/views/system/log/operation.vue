<!-- 操作日志页面 -->
<template>
  <div class="operation-log-page art-full-height">
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
        <template #left>
          <ElSpace wrap>
            <ElButton type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
              批量删除
            </ElButton>
            <ElButton @click="handleExport">导出</ElButton>
          </ElSpace>
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
      >
        <template #expand="{ row }">
          <div style="padding: 20px">
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="请求方法">{{ row.method }}</ElDescriptionsItem>
              <ElDescriptionsItem label="请求参数">
                <pre>{{ formatJson(row.requestParam) }}</pre>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="返回结果">
                <pre>{{ formatJson(row.requestResult) }}</pre>
              </ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </template>
      </ArtTable>

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
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'OperationLog' })

  // 状态管理
  const loading = ref(false)
  const tableData = ref<Api.Log.OperationLogDto[]>([])
  const selectedIds = ref<string[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  /**
   * 后端 OperationType 枚举序列化为字符串（.NET 默认行为）
   * enum 数值 -> 字符串名称:
   *   0=Other, 1=Insert, 2=Update, 3=Delete, 4=Auth,
   *   5=Export, 6=Import, 7=Force, 8=GenerateCode, 9=Clean
   */
  const operationTypeOptions = [
    { label: '新增', value: 'Insert' },
    { label: '修改', value: 'Update' },
    { label: '删除', value: 'Delete' },
    { label: '授权', value: 'Auth' },
    { label: '导出', value: 'Export' },
    { label: '导入', value: 'Import' },
    { label: '强退', value: 'Force' },
    { label: '代码生成', value: 'GenerateCode' },
    { label: '清空数据', value: 'Clean' },
    { label: '其他', value: 'Other' }
  ]

  const operationTypeMap: Record<string, { label: string; type: string }> = {
    Other: { label: '其他', type: 'info' },
    Insert: { label: '新增', type: 'success' },
    Update: { label: '修改', type: 'warning' },
    Delete: { label: '删除', type: 'danger' },
    Auth: { label: '授权', type: 'primary' },
    Export: { label: '导出', type: 'info' },
    Import: { label: '导入', type: 'info' },
    Force: { label: '强退', type: 'danger' },
    GenerateCode: { label: '代码生成', type: 'primary' },
    Clean: { label: '清空数据', type: 'danger' }
  }

  // 搜索相关 — 字段名与后端 OperationLogSearchParams 保持一致（PascalCase）
  const formFilters = reactive({
    OperUser: undefined as string | undefined,
    OperationType: undefined as string | undefined,
    StartTime: undefined as string | undefined,
    EndTime: undefined as string | undefined
  })

  const formItems = computed(() => [
    {
      label: '操作用户',
      key: 'OperUser',
      type: 'input',
      props: { clearable: true, placeholder: '请输入操作用户' }
    },
    {
      label: '操作类型',
      key: 'OperationType',
      type: 'select',
      options: operationTypeOptions,
      props: { clearable: true, placeholder: '请选择操作类型' }
    },
    {
      label: '开始时间',
      key: 'StartTime',
      type: 'date-picker',
      props: {
        type: 'datetime',
        clearable: true,
        placeholder: '请选择开始时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss'
      }
    },
    {
      label: '结束时间',
      key: 'EndTime',
      type: 'date-picker',
      props: {
        type: 'datetime',
        clearable: true,
        placeholder: '请选择结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss'
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
      const res = await CasbinApi.logs.operation.getList({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
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
   * 格式化JSON
   */
  const formatJson = (str?: string | null): string => {
    try {
      if (!str) return ''
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str ?? ''
    }
  }

  /**
   * 多选变化
   */
  const handleSelectionChange = (rows: Api.Log.OperationLogDto[]): void => {
    selectedIds.value = rows.map((r) => r.id)
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async (): Promise<void> => {
    if (selectedIds.value.length === 0) return
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 条操作日志吗？`,
      '删除确认',
      { type: 'warning' }
    )
    try {
      await CasbinApi.logs.operation.del(selectedIds.value)
      ElMessage.success('删除成功')
      selectedIds.value = []
      getOperationLogList()
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }

  /**
   * 导出 Excel
   */
  const handleExport = async (): Promise<void> => {
    try {
      ElMessage.info('正在导出，请稍候...')
      const res = await CasbinApi.logs.operation.export({ ...formFilters })
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `操作日志_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error(error)
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    { type: 'selection', width: 50 },
    { type: 'expand' },
    {
      prop: 'title',
      label: '日志标题',
      minWidth: 150
    },
    {
      prop: 'operationType',
      label: '操作类型',
      width: 110,
      formatter: (row: Api.Log.OperationLogDto) => {
        // 后端返回字符串枚举名称，如 "Insert"、"Update" 等
        const key = row.operationType as unknown as string
        const cfg = operationTypeMap[key] ?? { label: key || '未知', type: 'info' }
        return h(ElTag, { type: cfg.type as any }, () => cfg.label)
      }
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
      minWidth: 150
    },
    {
      prop: 'requestMethod',
      label: '请求方式',
      width: 100
    },
    {
      prop: 'creationTime',
      label: '操作时间',
      width: 175
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      OperUser: undefined,
      OperationType: undefined,
      StartTime: undefined,
      EndTime: undefined
    })
    pagination.current = 1
    getOperationLogList()
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
    padding: 20px;
    background-color: var(--art-bg-color);
  }

  pre {
    margin: 0;
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
