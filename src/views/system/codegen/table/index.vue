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
            <ElButton v-ripple @click="showDialog('add')">新增表</ElButton>
            <ElButton
              v-ripple
              type="success"
              :disabled="!selectedRows.length"
              @click="showCodeGenDialog"
              >代码生成</ElButton
            >
            <ElButton v-ripple type="danger" :disabled="!selectedRows.length" @click="batchDelete"
              >批量删除</ElButton
            >
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

      <!-- 表弹窗 -->
      <TableDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :table-data="currentTableData"
        @submit="handleDialogSubmit"
      />

      <!-- 生成弹窗 -->
      <CodeGenDialog v-model:visible="codeGenVisible" :table-ids="selectedTableIds" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import TableSearch from './modules/table-search.vue'
  import TableDialog from './modules/table-dialog.vue'
  import CodeGenDialog from './modules/codegen-dialog.vue'
  import { DialogType } from '@/types'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'CodeGenTable' })

  const router = useRouter()

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentTableData = ref<any>({})

  const codeGenVisible = ref(false)
  const selectedTableIds = ref<string[]>([])

  // 选中行
  const selectedRows = ref<any[]>([])

  // 搜索表单
  const searchForm = ref({
    Name: undefined
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
          label: '表名',
          minWidth: 150
        },
        {
          prop: 'description',
          label: '备注',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
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
                label: '编辑',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                label: '删除',
                onClick: () => deleteTable(row)
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
    currentTableData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteTable = (row: any): void => {
    ElMessageBox.confirm(`确定要删除表 [${row.name}] 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await CasbinApi.table.del([row.id])
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const batchDelete = (): void => {
    const ids = selectedRows.value.map((row) => row.id)
    ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 个项目吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await CasbinApi.table.del(ids)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const goToFields = (row: any) => {
    router.push({
      path: '/system/codegen/field',
      query: { tableId: row.id }
    })
  }

  const showCodeGenDialog = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要生成的表')
      return
    }
    selectedTableIds.value = selectedRows.value.map((row) => row.id)
    codeGenVisible.value = true
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
