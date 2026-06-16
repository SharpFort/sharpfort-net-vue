<!-- 字段管理页面 -->
<template>
  <div class="field-page art-full-height">
    <!-- 搜索栏 -->
    <FieldSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <span class="text-sm text-gray-500 ml-2">
            字段由反射同步维护，点击编辑仅可修改 UI 配置
          </span>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as any[]"
        :columns="columns"
        :pagination="pagination"
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
        <template #isPublic="{ row }">
          <ElTag :type="row.isPublic ? 'success' : 'info'">{{ row.isPublic ? '是' : '否' }}</ElTag>
        </template>
      </ArtTable>

      <!-- 字段弹窗 -->
      <FieldDialog
        v-model:visible="dialogVisible"
        :field-data="currentFieldData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, ref, watch } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import FieldSearch from './modules/field-search.vue'
  import FieldDialog from './modules/field-dialog.vue'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'CodeGenField' })

  const route = useRoute()

  // 弹窗相关
  const dialogVisible = ref(false)
  const currentFieldData = ref<any>({})

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
    refreshData
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
          prop: 'isPublic',
          label: '公共',
          width: 80,
          slot: 'isPublic'
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
          width: 100,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                label: '编辑',
                onClick: () => showDialog(row)
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

  const showDialog = (row?: any): void => {
    currentFieldData.value = row || {}
    dialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentFieldData.value = {}
    refreshData()
  }
</script>
