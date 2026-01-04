<!-- 登录日志页面 -->
<template>
  <div class="login-log-page art-full-height">
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
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { CasbinApi } from '@/api/casbin-rbac'

  defineOptions({ name: 'LoginLog' })

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
    LoginUser: '',
    LoginIp: '',
    LogMsg: ''
  })

  const formItems = computed(() => [
    {
      label: '登录用户',
      key: 'LoginUser',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: 'IP地址',
      key: 'LoginIp',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '信息内容',
      key: 'LogMsg',
      type: 'input',
      props: { clearable: true }
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
      const res = await CasbinApi.logs.login({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取登录日志失败:', error)
    } finally {
      loading.value = false
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
      minWidth: 150
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
      minWidth: 150
    },
    {
      prop: 'creationTime',
      label: '登录时间',
      width: 180
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      LoginUser: '',
      LoginIp: '',
      LogMsg: ''
    })
    getLoginLogList()
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
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
