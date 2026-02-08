<template>
  <div class="field-page art-full-height">
    <!-- 搜索栏 -->
    <ElForm :inline="true" :model="searchForm" class="search-form">
      <ElFormItem label="字段名称">
        <ElInput
          v-model="searchForm.Name"
          placeholder="请输入字段名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </ElFormItem>
      <ElFormItem label="表ID">
        <ElInput
          v-model="searchForm.TableId"
          placeholder="请输入表ID"
          clearable
          @keyup.enter="handleSearch"
        />
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="resetSearchParams">重置</ElButton>
      </ElFormItem>
    </ElForm>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')">新增字段</ElButton>
            <ElButton type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
              >批量删除</ElButton
            >
            <ElButton @click="handleExport">导出</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        tableLayout="fixed"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 字段弹窗 -->
      <FieldModal
        v-model="dialogVisible"
        :type="dialogType"
        :data="currentFieldData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CodeGenApi } from '@/api/code-gen'
  import FieldModal from './components/FieldModal.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'

  defineOptions({ name: 'Field' })

  type FieldDto = Api.CodeGen.FieldDto

  // 弹窗相关
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentFieldData = ref<FieldDto | undefined>(undefined)

  // 选中行
  const selectedRows = ref<FieldDto[]>([])

  // 搜索表单
  const searchForm = reactive({
    Name: undefined,
    TableId: undefined,
    Sorting: undefined
  })

  // useTable Hook
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
        return CodeGenApi.field.getList({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm
      },
      columnsFactory: () => [
        { type: 'selection', width: 50 },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '字段名称',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'description',
          label: '描述',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'fieldType',
          label: '字段类型',
          width: 100
        },
        {
          prop: 'tableId',
          label: '表ID',
          width: 300,
          showOverflowTooltip: true
        },
        {
          prop: 'orderNum',
          label: '排序',
          width: 80
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
          formatter: (row: FieldDto) => (row.isRequired ? '是' : '否')
        },
        {
          prop: 'isKey',
          label: '主键',
          width: 80,
          formatter: (row: FieldDto) => (row.isKey ? '是' : '否')
        },
        {
          prop: 'creationTime',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: FieldDto) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteField(row)
              })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm)
    getData()
  }

  const showDialog = (type: 'add' | 'edit', row?: FieldDto) => {
    dialogType.value = type
    currentFieldData.value = row ? { ...row } : undefined
    dialogVisible.value = true
  }

  const deleteField = (row: FieldDto) => {
    ElMessageBox.confirm(`确定要删除字段 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await CodeGenApi.field.del([row.id])
        ElMessage.success('删除成功')
        refreshData()
      } catch (error) {
        console.error(error)
      }
    })
  }

  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) return
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个字段吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const ids = selectedRows.value.map((row) => row.id)
        await CodeGenApi.field.del(ids)
        ElMessage.success('批量删除成功')
        refreshData()
      } catch (error) {
        console.error(error)
      }
    })
  }

  const handleSelectionChange = (selection: FieldDto[]) => {
    selectedRows.value = selection
  }

  const handleExport = async () => {
    try {
      const res = await CodeGenApi.field.export(searchForm)
      // Handle file download (assuming response is a blob)
      const blob = new Blob([res as any])
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `字段导出_${new Date().getTime()}.xlsx`
      link.click()
    } catch (error) {
      console.error(error)
      ElMessage.error('导出失败')
    }
  }
</script>

<style scoped>
  .search-form {
    padding: 10px 0;
  }
</style>
