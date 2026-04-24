<!-- 字段管理页面 -->
<template>
  <div class="field-page art-full-height">
    <!-- 搜索栏 -->
    <FieldSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple @click="showDialog('add')">新增字段</ElButton>
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
        <template #isRequired="{ row }">
          <ElTag :type="row.isRequired ? 'danger' : 'info'">{{
            row.isRequired ? '是' : '否'
          }}</ElTag>
        </template>
        <template #isKey="{ row }">
          <ElTag :type="row.isKey ? 'warning' : 'info'">{{ row.isKey ? '是' : '否' }}</ElTag>
        </template>
      </ArtTable>

      <!-- 字段弹窗 -->
      <FieldDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :field-data="currentFieldData"
        :default-table-id="searchForm.TableId"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, nextTick, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import FieldSearch from './modules/field-search.vue'
  import FieldDialog from './modules/field-dialog.vue'
  import { DialogType } from '@/types'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'CodeGenField' })

  const route = useRoute()

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentFieldData = ref<any>({})

  // 选中行
  const selectedRows = ref<any[]>([])

  // 搜索表单
  const searchForm = ref({
    Name: undefined,
    TableId: (route.query.tableId as string) || undefined
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
        return CasbinApi.field.getList({
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
          label: '字段名称',
          minWidth: 120
        },
        {
          prop: 'fieldType',
          label: '类型',
          width: 100
        },
        {
          prop: 'length',
          label: '长度',
          width: 80
        },
        {
          prop: 'isRequired',
          label: '必填',
          width: 80,
          slot: 'isRequired'
        },
        {
          prop: 'isKey',
          label: '主键',
          width: 80,
          slot: 'isKey'
        },
        {
          prop: 'orderNum',
          label: '排序',
          width: 80,
          sortable: true
        },
        {
          prop: 'description',
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
                onClick: () => deleteField(row)
              })
            ])
        }
      ]
    }
  })

  // 监听路由参数变化
  watch(
    () => route.query.tableId,
    (newVal) => {
      if (newVal) {
        searchForm.value.TableId = newVal as string
        handleSearch(searchForm.value)
      }
    }
  )

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showDialog = (type: DialogType, row?: any): void => {
    dialogType.value = type
    currentFieldData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteField = (row: any): void => {
    ElMessageBox.confirm(`确定要删除字段 [${row.name}] 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await CasbinApi.field.del([row.id])
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
      await CasbinApi.field.del(ids)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentFieldData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
