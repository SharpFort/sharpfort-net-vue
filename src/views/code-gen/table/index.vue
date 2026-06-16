<!-- 实体注册表管理页面 -->
<template>
  <div class="table-page art-full-height">
    <!-- 搜索栏 -->
    <table-search v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <el-card class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <art-table-header v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <el-space wrap>
            <el-tooltip
              content="反射扫描所有带 [SugarTable] 特性的 C# 实体类，增量合并到注册表"
              placement="top"
            >
              <el-button v-ripple type="warning" @click="handleRefresh">
                <template #icon><art-svg-icon icon="ri:refresh-line" /></template>
                刷新注册表
              </el-button>
            </el-tooltip>
            <el-button
              v-ripple
              type="primary"
              :disabled="!selectedRows.length"
              @click="showCodeGenDialog"
            >
              <template #icon><art-svg-icon icon="ri:code-box-line" /></template>
              代码生成
            </el-button>
          </el-space>
        </template>
      </art-table-header>

      <!-- 表格 -->
      <art-table
        table-layout="fixed"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 详情弹窗 -->
      <table-detail-dialog ref="detailDialogRef" v-model:visible="detailVisible" />

      <!-- 表编辑弹窗 -->
      <table-dialog
        v-model:visible="dialogVisible"
        :table-data="currentTableData"
        @submit="handleDialogSubmit"
      />

      <!-- 代码生成弹窗 -->
      <code-gen-dialog v-model:visible="codeGenVisible" :table-ids="selectedTableIds" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CodeGenApi } from '@/api/code-gen'
  import TableSearch from './modules/table-search.vue'
  import TableDialog from './modules/table-dialog.vue'
  import TableDetailDialog from './modules/table-detail-dialog.vue'
  import CodeGenDialog from './modules/codegen-dialog.vue'

  defineOptions({ name: 'CodeGenTable' })

  const detailDialogRef = ref<InstanceType<typeof TableDetailDialog> | null>(null)
  const detailVisible = ref(false)

  const dialogVisible = ref(false)
  const currentTableData = ref<Partial<Api.CodeGen.TableDto>>({})

  const codeGenVisible = ref(false)
  const selectedTableIds = ref<string[]>([])

  const selectedRows = ref<Api.CodeGen.TableDto[]>([])

  const searchForm = ref({
    Name: undefined as string | undefined,
    ModuleName: undefined as string | undefined,
    ProjectName: undefined as string | undefined
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
    refreshData
  } = useTable({
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return CodeGenApi.table.getList({
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
                label: '详情',
                onClick: () => showDetailDialog(row)
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

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showEditDialog = (row: Api.CodeGen.TableDto): void => {
    currentTableData.value = row
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const showDetailDialog = (row: Api.CodeGen.TableDto): void => {
    detailVisible.value = true
    nextTick(() => {
      detailDialogRef.value?.open(row.id)
    })
  }

  const showCodeGenDialog = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要生成的实体')
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

  /** 手动刷新实体注册表 */
  const handleRefresh = async () => {
    try {
      await CodeGenApi.codegen.refresh()
      ElMessage.success('注册表刷新成功')
      refreshData()
    } catch (e: any) {
      ElMessage.error(e.message || '刷新失败')
    }
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
