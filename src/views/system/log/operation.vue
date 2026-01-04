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
      />

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="true"
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
      <ArtPagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        @change="handlePageChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag } from 'element-plus'

  defineOptions({ name: 'OperationLog' })

  // 状态管理
  const loading = ref(false)
  const tableData = ref<any[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索相关
  const formFilters = reactive({
    Title: '',
    OperUser: '',
    OperationType: undefined
  })

  const formItems = computed(() => [
    {
      label: '日志标题',
      key: 'Title',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '操作用户',
      key: 'OperUser',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '操作类型',
      key: 'OperationType',
      type: 'select',
      options: [
        { label: '新增', value: 'Insert' },
        { label: '修改', value: 'Update' },
        { label: '删除', value: 'Delete' },
        { label: '授权', value: 'Grant' },
        { label: '导出', value: 'Export' },
        { label: '导入', value: 'Import' },
        { label: '强退', value: 'ForceLogout' },
        { label: '清空缓存', value: 'ClearCache' }
      ],
      props: { clearable: true }
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
      const res = await CasbinApi.logs.operation({
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
  const formatJson = (str: string) => {
    try {
      if (!str) return ''
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      type: 'expand'
    },
    {
      prop: 'title',
      label: '日志标题',
      minWidth: 150
    },
    {
      prop: 'operationType',
      label: '操作类型',
      width: 100,
      formatter: (row: any) => {
        const typeMap: any = {
          Insert: { label: '新增', type: 'success' },
          Update: { label: '修改', type: 'warning' },
          Delete: { label: '删除', type: 'danger' },
          Grant: { label: '授权', type: 'primary' },
          Export: { label: '导出', type: 'info' },
          Import: { label: '导入', type: 'info' },
          ForceLogout: { label: '强退', type: 'danger' },
          ClearCache: { label: '清空', type: 'danger' }
        }
        const cfg = typeMap[row.operationType] || { label: '其他', type: 'info' }
        return h(ElTag, { type: cfg.type }, () => cfg.label)
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
      width: 180
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      Title: '',
      OperUser: '',
      OperationType: undefined
    })
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
</style>
