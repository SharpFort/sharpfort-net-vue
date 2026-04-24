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

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentTemplateData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
