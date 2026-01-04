<!-- 租户管理页面 -->
<template>
  <div class="tenant-page art-full-height">
    <!-- 搜索栏 -->
    <TenantSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple @click="showDialog('add')">新增租户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
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

      <!-- 租户弹窗 -->
      <TenantDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :tenant-data="currentTenantData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import TenantSearch from './modules/tenant-search.vue'
  import TenantDialog from './modules/tenant-dialog.vue'
  import { ElMessageBox } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'Tenant' })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentTenantData = ref<any>({})

  // 选中行
  const selectedRows = ref<any[]>([])

  // 搜索表单
  const searchForm = ref({
    Name: undefined,
    StartTime: undefined,
    EndTime: undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshRemove
  } = useTable({
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return CasbinApi.tenant.getList({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '租户名称',
          minWidth: 150
        },
        {
          prop: 'dbType',
          label: '数据库类型',
          width: 120
        },
        {
          prop: 'tenantConnectionString',
          label: '连接字符串',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'creationTime',
          label: '创建日期',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                label: '编辑',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                label: '删除',
                onClick: () => deleteTenant(row)
              })
            ])
        }
      ]
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showDialog = (type: DialogType, row?: any): void => {
    dialogType.value = type
    currentTenantData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteTenant = (row: any): void => {
    ElMessageBox.confirm(`确定要删除租户 [${row.name}] 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await CasbinApi.tenant.del(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentTenantData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
