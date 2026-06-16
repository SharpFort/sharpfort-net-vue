<template>
  <div class="field-page art-full-height">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="字段名称">
        <el-input
          v-model.trim="searchForm.Name"
          placeholder="请输入字段名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="表 ID">
        <el-input
          v-model.trim="searchForm.TableId"
          placeholder="请输入表 ID"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearchParams">重置</el-button>
      </el-form-item>
    </el-form>

    <el-card class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <art-table-header v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <span class="text-sm text-gray-500 ml-2">
            字段由反射同步维护，点击编辑仅可修改 UI 配置
          </span>
        </template>
      </art-table-header>

      <!-- 表格 -->
      <art-table
        table-layout="fixed"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 字段编辑弹窗 -->
      <field-modal ref="dialogRef" @success="refreshData" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, h } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CodeGenApi } from '@/api/code-gen'
  import FieldModal from './components/FieldModal.vue'

  defineOptions({ name: 'Field' })

  type FieldDto = Api.CodeGen.FieldDto

  const dialogRef = ref<InstanceType<typeof FieldModal> | null>(null)

  // 搜索表单
  const searchForm = reactive({
    Name: undefined as string | undefined,
    TableId: undefined as string | undefined,
    Sorting: undefined as string | undefined
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
          prop: 'tableName',
          label: '所属实体',
          minWidth: 130,
          showOverflowTooltip: true
        },
        {
          prop: 'moduleName',
          label: '所属模块',
          width: 100
        },
        {
          prop: 'orderNum',
          label: '排序',
          width: 70
        },
        {
          prop: 'isRequired',
          label: '必填',
          width: 70,
          formatter: (row: FieldDto) => (row.isRequired ? '是' : '否')
        },
        {
          prop: 'isKey',
          label: '主键',
          width: 70,
          formatter: (row: FieldDto) => (row.isKey ? '是' : '否')
        },
        {
          prop: 'isAutoAdd',
          label: '自增',
          width: 70,
          formatter: (row: FieldDto) => (row.isAutoAdd ? '是' : '否')
        },
        {
          prop: 'isPublic',
          label: '公共',
          width: 70,
          formatter: (row: FieldDto) => (row.isPublic ? '是' : '否')
        },
        {
          prop: 'isQueryField',
          label: '查询',
          width: 70,
          formatter: (row: FieldDto) => (row.isQueryField ? '是' : '否')
        },
        {
          prop: 'isListDisplay',
          label: '列表',
          width: 70,
          formatter: (row: FieldDto) => (row.isListDisplay ? '是' : '否')
        },
        {
          prop: 'isFormItem',
          label: '表单',
          width: 70,
          formatter: (row: FieldDto) => (row.isFormItem ? '是' : '否')
        },
        {
          prop: 'htmlType',
          label: '控件类型',
          width: 110,
          showOverflowTooltip: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 100,
          fixed: 'right',
          formatter: (row: FieldDto) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                label: '编辑',
                onClick: () => showEditDialog(row)
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

  const showEditDialog = (row: FieldDto) => {
    dialogRef.value?.open(row.id)
  }
</script>

<style scoped>
  .search-form {
    padding: 10px 0;
  }
</style>
