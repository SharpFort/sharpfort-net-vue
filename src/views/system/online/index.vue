<template>
  <div class="online-user-page art-full-height">
    <!-- Search Bar -->
    <ElForm :model="searchParams" inline class="search-form" @keyup.enter="getData">
      <ElFormItem label="会话编号">
        <ElInput v-model="searchParams.ConnnectionId" placeholder="请输入会话编号" clearable />
      </ElFormItem>
      <ElFormItem label="用户名">
        <ElInput v-model="searchParams.UserName" placeholder="请输入用户名" clearable />
      </ElFormItem>
      <ElFormItem label="IP地址">
        <ElInput v-model="searchParams.Ipaddr" placeholder="请输入IP地址" clearable />
      </ElFormItem>
      <ElFormItem label="登录地点">
        <ElInput v-model="searchParams.LoginLocation" placeholder="请输入登录地点" clearable />
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

  // Online users rows

  const selectedRows = ref<Api.SystemManage.OnlineUserModel[]>([])

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
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
        // CasbinApi.online.getList(params)
        // If the backend for online users is standard ABP, it might need PagedResultRequestDto
        const { current, size, ...others } = params
        // Assuming standard params for now, adjust if needed
        return CasbinApi.online.getList({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 20,
        ConnnectionId: undefined,
        UserName: undefined,
        Ipaddr: undefined,
        LoginLocation: undefined
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
          sortable: true,
          formatter: (row: Api.SystemManage.OnlineUserModel) => {
            if (!row.loginTime) return '-'
            const d = new Date(row.loginTime)
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const hours = String(d.getHours()).padStart(2, '0')
            const minutes = String(d.getMinutes()).padStart(2, '0')
            const seconds = String(d.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          }
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
      // Wait, CasbinApi.online.forceLogout takes 'connectionId' and puts it in URL.
      // If row.connnectionId is the value, we pass it.
      if (row.connnectionId) {
        CasbinApi.online.forceLogout(row.connnectionId).then(() => {
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
