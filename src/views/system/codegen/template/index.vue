<!-- 模板管理页面 -->
<template>
  <div class="template-page art-full-height">
    <!-- 搜索栏 -->
    <TemplateSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple @click="showDialog('add')">新增模板</ElButton>
            <ElButton v-ripple type="danger" :disabled="!selectedRows.length" @click="batchDelete"
              >批量删除</ElButton
            >
            <ElDivider direction="vertical" />
            <ElButton v-ripple type="primary" plain @click="handleSyncImport">从文件导入</ElButton>
            <ElButton v-ripple type="primary" plain @click="handleSyncExport">导出到文件</ElButton>
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

      <!-- 模板弹窗 -->
      <TemplateDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :template-data="currentTemplateData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { CodeGenApi } from '@/api/code-gen'
  import TemplateSearch from './modules/template-search.vue'
  import TemplateDialog from './modules/template-dialog.vue'
  import { DialogType } from '@/types'

  defineOptions({ name: 'CodeGenTemplate' })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentTemplateData = ref<any>({})

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
        return CasbinApi.template.getList({
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
          label: '模板名称',
          minWidth: 150
        },
        {
          prop: 'buildPath',
          label: '生成路径',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'content',
          label: '模板内容',
          width: 150,
          formatter: (row: any) =>
            row.content
              ? h('span', { style: { color: '#67C23A', fontSize: '13px' } }, [
                  h('span', { style: { marginRight: '4px' } }, '✓'),
                  h('span', { style: { color: '#909399' } }, `已编写 (${row.content.length}字符)`)
                ])
              : h('span', { style: { color: '#C0C4CC' } }, '—')
        },
        {
          prop: 'remarks',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
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
                onClick: () => deleteTemplate(row)
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
    currentTemplateData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteTemplate = (row: any): void => {
    ElMessageBox.confirm(`确定要删除模板 [${row.name}] 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await CasbinApi.template.del([row.id])
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
      await CasbinApi.template.del(ids)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleSyncImport = (): void => {
    ElMessageBox.confirm(
      '确定要导入模板吗？<br/>将扫描本地 Templates/*.scriban 文件，增量同步到数据库（Upsert by Name）。' +
        '<br/>• 本地有 + DB 无 → 新增<br/>• 本地有 + DB 有 → 更新内容（保留备注）<br/>• 本地无 + DB 有 → 跳过不删',
      '导入模板（本地 → DB）',
      {
        confirmButtonText: '确定导入',
        cancelButtonText: '取消',
        type: 'info',
        dangerouslyUseHTMLString: true
      }
    ).then(async () => {
      await CodeGenApi.template.importTemplates()
      ElMessage.success('模板导入成功')
      refreshData()
    })
  }

  const handleSyncExport = (): void => {
    ElMessageBox.confirm(
      '确定要导出模板吗？<br/>将遍历数据库所有模板，写入本地 Templates/{Name}.scriban 文件。' +
        '<br/>• 本地无 → 补全缺失文件<br/>• 本地有 → 覆写保持一致',
      '导出模板（DB → 本地）',
      {
        confirmButtonText: '确定导出',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    ).then(async () => {
      await CodeGenApi.template.exportTemplates()
      ElMessage.success('模板导出成功')
    })
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentTemplateData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
