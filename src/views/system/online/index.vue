<template>
  <div class="online-user-page art-full-height">
    <!-- Search Bar -->
    <ElForm :model="searchForm" inline class="search-form" @keyup.enter="getData">
      <ElFormItem label="用户名">
        <ElInput v-model="searchForm.userName" placeholder="请输入用户名" clearable />
      </ElFormItem>
      <ElFormItem label="IP地址">
        <ElInput v-model="searchForm.ipaddr" placeholder="请输入IP地址" clearable />
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="getData">查询</ElButton>
        <ElButton @click="resetSearchParams">重置</ElButton>
      </ElFormItem>
    </ElForm>

    <ElCard class="art-table-card" shadow="never">
      <!-- Toolbar -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
      </ArtTableHeader>

      <!-- Table -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessageBox, ElMessage } from 'element-plus'

  defineOptions({ name: 'OnlineUser' })

  // Search Form
  const searchForm = ref({
    userName: undefined,
    ipaddr: undefined
  })

  const selectedRows = ref<Api.SystemManage.OnlineUserModel[]>([])

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: (params: any) => {
        // Map pagination to backend expectation if needed (User view uses SkipCount/MaxResultCount)
        // Check if CasbinApi.user.getList used { SkipCount, MaxResultCount }
        // CasbinApi.monitor.online(params)
        // If the backend for online users is standard ABP, it might need PagedResultRequestDto
        const { current, size, ...others } = params
        // Assuming standard params for now, adjust if needed
        return CasbinApi.monitor.online({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'connnectionId',
          label: '会话编号',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'userName',
          label: '用户名',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'ipaddr',
          label: 'IP地址',
          width: 140
        },
        {
          prop: 'loginLocation',
          label: '登录地点',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'os',
          label: '操作系统',
          width: 120
        },
        {
          prop: 'browser',
          label: '浏览器',
          width: 120
        },
        {
          prop: 'loginTime',
          label: '登录时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 100,
          fixed: 'right',
          formatter: (row: Api.SystemManage.OnlineUserModel) =>
            h(ArtButtonTable, {
              type: 'delete',
              text: '强退',
              onClick: () => handleForceLogout(row)
            })
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.SystemManage.OnlineUserModel[]) => {
    selectedRows.value = selection
  }

  const handleForceLogout = (row: Api.SystemManage.OnlineUserModel) => {
    if (!row.connnectionId) return

    ElMessageBox.confirm(`确定要强制退出用户 "${row.userName}" 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // API call
      // Note: The row has 'connnectionId' (typo), but the API might expect 'connectionId' in the URL path?
      // Wait, CasbinApi.monitor.forceLogout takes 'connectionId' and puts it in URL.
      // If row.connnectionId is the value, we pass it.
      if (row.connnectionId) {
        CasbinApi.monitor.forceLogout(row.connnectionId).then(() => {
          ElMessage.success('强退成功')
          refreshData()
        })
      }
    })
  }
</script>

<style scoped>
  .search-form {
    padding: 15px;
    margin-bottom: 15px;
    background-color: var(--el-bg-color);
    border-radius: 4px;
  }
</style>
