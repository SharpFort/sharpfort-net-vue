<template>
  <div class="storage-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="loadList"
      >
        <template #left>
          <ElButton type="primary" @click="handleAdd">
            <ElIcon class="mr-1"><Plus /></ElIcon> 新增提供者
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        tableLayout="auto"
        :pagination="pagination"
        @page-change="handlePageChange"
      />

      <StorageProviderDialog
        v-model:visible="dialogVisible"
        :editData="editData"
        @success="loadList"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { FileApi } from '@/api/file'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import StorageProviderDialog from '../modules/storage-provider-dialog.vue'

  defineOptions({ name: 'StorageProvider' })

  const loading = ref(false)
  const tableData = ref<any[]>([])
  const dialogVisible = ref(false)
  const editData = ref<any>(null)

  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  // Columns
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'name',
      label: '名称',
      minWidth: 150
    },
    {
      prop: 'providerType',
      label: '类型',
      width: 120,
      align: 'center'
    },
    {
      prop: 'bucketName',
      label: 'Bucket',
      minWidth: 150
    },
    {
      prop: 'endpoint',
      label: 'Endpoint',
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: 'isDefault',
      label: '默认',
      width: 80,
      align: 'center',
      formatter: (row: any) =>
        row.isDefault
          ? h(ElTag, { type: 'success', size: 'small' }, () => '是')
          : h(ElTag, { type: 'info', size: 'small' }, () => '否')
    },
    {
      prop: 'isEnabled',
      label: '启用',
      width: 80,
      align: 'center',
      formatter: (row: any) =>
        row.isEnabled
          ? h(ElTag, { type: 'success', size: 'small' }, () => '启用')
          : h(ElTag, { type: 'danger', size: 'small' }, () => '禁用')
    },
    {
      prop: 'creationTime',
      label: '创建时间',
      width: 160,
      formatter: (row: any) => row.creationTime?.substring(0, 19).replace('T', ' ')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { class: 'flex justify-center gap-2' }, [
          !row.isDefault &&
            h(
              'span',
              {
                class: 'text-primary cursor-pointer hover:underline',
                onClick: () => handleSetDefault(row)
              },
              '设为默认'
            ),
          h(
            'span',
            {
              class: 'text-primary cursor-pointer hover:underline',
              onClick: () => handleEdit(row)
            },
            '编辑'
          ),
          h(
            'span',
            {
              class: 'text-danger cursor-pointer hover:underline',
              onClick: () => handleDelete(row)
            },
            '删除'
          )
        ])
      }
    }
  ])

  onMounted(() => {
    loadList()
  })

  const loadList = async () => {
    loading.value = true
    try {
      const params = {
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      }
      const res = await FileApi.storageProvider.getList(params)
      tableData.value = res.items || []
      pagination.total = res.totalCount
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    editData.value = row // Clone to avoid direct mutation? Dialog usually handles internal copy
    dialogVisible.value = true
  }

  const handleDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除存储提供者 "${row.name}" 吗？`, '警告', {
        type: 'warning'
      })
      await FileApi.storageProvider.del([row.id])
      ElMessage.success('删除成功')
      loadList()
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleSetDefault = async (row: any) => {
    try {
      await ElMessageBox.confirm(`确定要将 "${row.name}" 设为默认存储提供者吗？`, '提示', {
        type: 'info'
      })
      await FileApi.storageProvider.setDefault(row.id)
      ElMessage.success('设置成功')
      loadList()
    } catch (e: any) {
      console.error(e)
    }
  }

  const handlePageChange = (val: any) => {
    pagination.current = val.current
    pagination.size = val.size
    loadList()
  }
</script>

<style scoped lang="scss">
  .storage-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
