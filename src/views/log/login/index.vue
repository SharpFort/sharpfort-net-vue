<!-- 登录日志页面 -->
<template>
  <div class="login-log-page art-custom-card">
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
        />

        <!-- 分页 -->
        <ArtPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @change="handlePageChange"
        />
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { LogApi } from '@/api/log'
  import { ElMessage } from 'element-plus'
  import { downloadFile } from '@/utils/file'

  defineOptions({ name: 'LoginLog' })

  // 状态管理
  const loading = ref(false)
  const exportLoading = ref(false)
  const tableData = ref<Api.Log.LoginLogDto[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索相关
  // 定义表单绑定的数据类型，包含日期范围数组
  interface SearchForm extends Api.Log.LoginLogSearchParams {
    dateRange?: [string, string]
  }

  const formFilters = reactive<SearchForm>({
    LoginUser: '',
    LoginIp: '',
    dateRange: undefined
  })

  const formItems = computed(() => [
    {
      label: '登录用户',
      key: 'LoginUser',
      type: 'input',
      props: { clearable: true, placeholder: '请输入登录用户' }
    },
    {
      label: 'IP地址',
      key: 'LoginIp',
      type: 'input',
      props: { clearable: true, placeholder: '请输入IP地址' }
    },
    {
      label: '登录时间',
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
    getLoginLogList()
  })

  /**
   * 获取登录日志列表
   */
  const getLoginLogList = async (): Promise<void> => {
    loading.value = true
    try {
      // 处理日期范围
      const { dateRange, ...params } = formFilters
      if (dateRange && dateRange.length === 2) {
        params.StartTime = dateRange[0]
        params.EndTime = dateRange[1]
      }

      const res = await LogApi.login.getList({
        ...params,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size,
        Sorting: 'creationTime desc' // 默认按创建时间倒序
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取登录日志失败:', error)
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

      const blob = await LogApi.login.export({
        ...params,
        SkipCount: 0,
        MaxResultCount: 1000 // 导出通常不仅仅限制在分页大小，这里根据需求可能需要调整
      })
      downloadFile(blob, `登录日志_${new Date().getTime()}.xlsx`)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    } finally {
      exportLoading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'loginUser',
      label: '登录用户',
      width: 120
    },
    {
      prop: 'loginIp',
      label: '登录IP',
      width: 130
    },
    {
      prop: 'loginLocation',
      label: '登录地点',
      width: 150
    },
    {
      prop: 'browser',
      label: '浏览器',
      width: 120
    },
    {
      prop: 'os',
      label: '操作系统',
      width: 120
    },
    {
      prop: 'logMsg',
      label: '提示信息',
      minWidth: 150,
      showOverflowTooltip: true
    },
    {
      prop: 'creationTime',
      label: '登录时间',
      width: 180,
      formatter: (row: any) => {
        // 简单的时间格式化，或者使用 utils/date
        return row.creationTime ? row.creationTime.replace('T', ' ').split('.')[0] : ''
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      LoginUser: '',
      LoginIp: '',
      dateRange: undefined
    })
    // 同时也需要重置 StartTime 和 EndTime 属性，虽然它们不在 v-model 中直接绑定，
    // 但是在 getLoginLogList 中是根据 dateRange 计算的，所以重置 dateRange 即可。
    // 如果 Api Params 中这些字段是可选的，那么 undefined 是 ok 的。
    handleSearch()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getLoginLogList()
  }

  const handleRefresh = (): void => {
    getLoginLogList()
  }

  const handlePageChange = (): void => {
    getLoginLogList()
  }
</script>

<style scoped lang="scss">
  .login-log-page {
    .art-custom-card-container {
      padding: 20px;
      background-color: var(--art-bg-color);
    }
  }
</style>
