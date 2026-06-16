<!-- 表管理页面 -->
<template>
  <div class="table-page art-full-height">
    <!-- 搜索栏 -->
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElTooltip
              content="反射扫描所有带 [SugarTable] 特性的 C# 实体类，增量合并到注册表"
              placement="top"
            >
              <ElButton v-ripple type="warning" @click="handleRefresh">
                <ElIcon><Refresh /></ElIcon>
                刷新注册表
              </ElButton>
            </ElTooltip>
            <ElButton
              v-ripple
              type="success"
              :disabled="!selectedRows.length"
              @click="showCodeGenDialog"
            >
              <ElIcon><Box /></ElIcon>
              代码生成
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as any[]"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 表编辑弹窗 -->
      <TableDialog
        v-model:visible="dialogVisible"
        :table-data="currentTableData"
        @submit="handleDialogSubmit"
      />

      <!-- 生成弹窗 -->
      <CodeGenDialog v-model:visible="codeGenVisible" :table-ids="selectedTableIds" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Refresh, Box } from '@element-plus/icons-vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import TableSearch from './modules/table-search.vue'
  import TableDialog from './modules/table-dialog.vue'
  import CodeGenDialog from './modules/codegen-dialog.vue'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'CodeGenTable' })

  const router = useRouter()

  const dialogVisible = ref(false)
  const currentTableData = ref<Partial<any>>({})

  const codeGenVisible = ref(false)
  const selectedTableIds = ref<string[]>([])

  const selectedRows = ref<any[]>([])

  const searchForm = ref({
    Name: undefined as string | undefined,
    ModuleName: undefined as string | undefined,
    ProjectName: undefined as string | undefined
  })

  const formatTime = (time?: string) => {
    if (!time) return '-'
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
    refreshData
  } = useTable({
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return CasbinApi.table.getList({
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
          label: '实体类名',
          minWidth: 150
        },
        {
          prop: 'physicalTableName',
          label: '物理表名',
          minWidth: 130,
          showOverflowTooltip: true
        },
        {
          prop: 'description',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'moduleName',
          label: '所属模块',
          width: 120
        },
        {
          prop: 'projectName',
          label: '所属项目',
          width: 120
        },
        {
          prop: 'isOverwrite',
          label: '覆盖',
          width: 70,
          formatter: (row: any) => (row.isOverwrite ? '是' : '否')
        },
        {
          prop: 'lastSyncTime',
          label: '最后同步',
          width: 170,
          formatter: (row: any) => formatTime(row.lastSyncTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 160,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'view',
                label: '字段',
                onClick: () => goToFields(row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                label: '配置',
                onClick: () => showEditDialog(row)
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

  const showEditDialog = (row: any): void => {
    currentTableData.value = row
    dialogVisible.value = true
  }

  const goToFields = (row: any) => {
    router.push({
      path: '/system/codegen/field',
      query: { tableId: row.id }
    })
  }

  const showCodeGenDialog = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要生成的实体')
      return
    }
    selectedTableIds.value = selectedRows.value.map((row: any) => row.id)
    codeGenVisible.value = true
  }

  /** 手动刷新实体注册表 */
  const handleRefresh = async () => {
    try {
      await CasbinApi.codegen.refresh()
      ElMessage.success('注册表刷新成功')
      refreshData()
    } catch (e: any) {
      ElMessage.error(e.message || '刷新失败')
    }
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentTableData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
