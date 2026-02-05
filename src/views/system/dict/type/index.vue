<!-- 字典管理页面 -->
<template>
  <div class="dict-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton type="primary" @click="handleAddDictType" v-ripple> 新增字典 </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="true"
      />

      <!-- 分页 -->
      <ArtPagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        @change="handlePageChange"
      />

      <!-- 字典类型弹窗 -->
      <DictTypeDialog
        v-model:visible="dialogVisible"
        :editData="editData"
        @submit="handleRefresh"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import DictTypeDialog from '../modules/dict-type-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'Dict' })

  const router = useRouter()

  // 状态管理
  const loading = ref(false)
  const dialogVisible = ref(false)
  const editData = ref<any>(null)
  const tableData = ref<any[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索相关
  const formFilters = reactive({
    DictName: '',
    DictType: '',
    State: undefined
  })

  const formItems = computed(() => [
    {
      label: '字典名称',
      key: 'DictName',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '字典类型',
      key: 'DictType',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '状态',
      key: 'State',
      type: 'select',
      options: [
        { label: '正常', value: true },
        { label: '停用', value: false }
      ],
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getDictTypeList()
  })

  /**
   * 获取字典类型列表数据
   */
  const getDictTypeList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.dictionary.type.getList({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取字典失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'dictName',
      label: '字典名称',
      minWidth: 150
    },
    {
      prop: 'dictType',
      label: '字典类型',
      minWidth: 150,
      formatter: (row: any) => {
        return h(
          'span',
          {
            style: 'color: var(--el-color-primary); cursor: pointer',
            onClick: () => handleViewData(row)
          },
          row.dictType
        )
      }
    },
    {
      prop: 'state',
      label: '状态',
      width: 100,
      formatter: (row: any) =>
        h(ElTag, { type: row.state ? 'success' : 'danger' }, () => (row.state ? '正常' : '停用'))
    },
    {
      prop: 'remark',
      label: '备注',
      minWidth: 150
    },
    {
      prop: 'creationTime',
      label: '创建时间',
      width: 180
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { style: 'text-align: right' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditDictType(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteDictType(row)
          })
        ])
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      DictName: '',
      DictType: '',
      State: undefined
    })
    getDictTypeList()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getDictTypeList()
  }

  const handleRefresh = (): void => {
    getDictTypeList()
  }

  const handlePageChange = (): void => {
    getDictTypeList()
  }

  const handleAddDictType = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEditDictType = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleDeleteDictType = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除字典 [${row.dictName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.dictionary.type.del(row.id)
      ElMessage.success('删除成功')
      getDictTypeList()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }

  const handleViewData = (row: any) => {
    // 假设路由已经配置好，或者可以通过 query 传递
    router.push({
      path: '/system/dict/data',
      query: { type: row.dictType }
    })
  }
</script>

<style scoped lang="scss">
  .dict-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
