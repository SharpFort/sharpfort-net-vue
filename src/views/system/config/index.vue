<!-- 参数设置页面 -->
<template>
  <div class="config-page art-full-height">
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
          <ElButton type="primary" @click="handleAddConfig" v-ripple> 新增参数 </ElButton>
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

      <!-- 参数弹窗 -->
      <ConfigDialog v-model:visible="dialogVisible" :editData="editData" @submit="handleRefresh" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ConfigDialog from './modules/config-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Config' })

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
    ConfigName: '',
    ConfigKey: '',
    ConfigType: undefined
  })

  const formItems = computed(() => [
    {
      label: '参数名称',
      key: 'ConfigName',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '参数键名',
      key: 'ConfigKey',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '系统内置',
      key: 'ConfigType',
      type: 'select',
      options: [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' }
      ],
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getConfigList()
  })

  /**
   * 获取参数列表
   */
  const getConfigList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.config.getList({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取参数失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'configName',
      label: '参数名称',
      minWidth: 150
    },
    {
      prop: 'configKey',
      label: '参数键名',
      minWidth: 150
    },
    {
      prop: 'configValue',
      label: '参数键值',
      minWidth: 100
    },
    {
      prop: 'configType',
      label: '系统内置',
      width: 100,
      formatter: (row: any) => (row.configType === 'Y' ? '是' : '否')
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
            onClick: () => handleEditConfig(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteConfig(row)
          })
        ])
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      ConfigName: '',
      ConfigKey: '',
      ConfigType: undefined
    })
    getConfigList()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getConfigList()
  }

  const handleRefresh = (): void => {
    getConfigList()
  }

  const handlePageChange = (): void => {
    getConfigList()
  }

  const handleAddConfig = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEditConfig = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleDeleteConfig = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除参数 [${row.configName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.config.del(row.id)
      ElMessage.success('删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }
</script>

<style scoped lang="scss">
  .config-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
