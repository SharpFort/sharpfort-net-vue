<!-- 字典数据管理页面 -->
<template>
  <div class="dict-data-page art-full-height">
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
          <ElButton type="primary" @click="handleAddDictData" v-ripple> 新增数据 </ElButton>
          <ElButton @click="handleBack" v-ripple> 返回字典类型 </ElButton>
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
      <div class="pagination custom-pagination center">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          align="center"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>

      <!-- 字典数据弹窗 -->
      <DictDataDialog
        v-model:visible="dialogVisible"
        :editData="editData"
        :dictType="formFilters.dictType"
        @submit="handleRefresh"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import DictDataDialog from '../modules/dict-data-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { useRoute, useRouter } from 'vue-router'

  defineOptions({ name: 'DictData' })

  const route = useRoute()
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
    dictType: (route.query.type as string) || '',
    dictLabel: '',
    state: undefined
  })

  const formItems = computed(() => [
    {
      label: '字典标签',
      key: 'dictLabel',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '状态',
      key: 'state',
      type: 'select',
      options: [
        { label: '正常', value: true },
        { label: '停用', value: false }
      ],
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getDictDataList()
  })

  /**
   * 获取字典数据列表
   */
  const getDictDataList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.dictionary.data.getList({
        DictType: formFilters.dictType,
        DictLabel: formFilters.dictLabel,
        State: formFilters.state,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取字典数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'dictLabel',
      label: '字典标签',
      minWidth: 150
    },
    {
      prop: 'dictValue',
      label: '字典键值',
      minWidth: 150
    },
    {
      prop: 'orderNum',
      label: '排序',
      width: 80
    },
    {
      prop: 'state',
      label: '状态',
      width: 100,
      formatter: (row: any) =>
        h(ElTag, { type: row.state ? 'success' : 'danger' }, () => (row.state ? '正常' : '停用'))
    },
    {
      prop: 'isDefault',
      label: '默认',
      width: 80,
      formatter: (row: any) => (row.isDefault ? '是' : '否')
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
      width: 150,
      align: 'right',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { style: 'text-align: right' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditDictData(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteDictData(row)
          })
        ])
      }
    }
  ])

  const handleReset = (): void => {
    formFilters.dictLabel = ''
    formFilters.state = undefined
    getDictDataList()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getDictDataList()
  }

  const handleRefresh = (): void => {
    getDictDataList()
  }

  const handlePageChange = (): void => {
    getDictDataList()
  }

  const handleAddDictData = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEditDictData = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleDeleteDictData = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除 [${row.dictLabel}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.dictionary.data.del(row.id)
      ElMessage.success('删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }

  const handleBack = () => {
    router.push('/system/dict/type')
  }
</script>

<style scoped lang="scss">
  .dict-data-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
