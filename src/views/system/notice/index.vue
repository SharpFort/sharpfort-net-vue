<!-- 通知公告页面 -->
<template>
  <div class="notice-page art-full-height">
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
          <ElButton type="primary" @click="handleAddNotice" v-ripple> 新增公告 </ElButton>
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

      <!-- 公告弹窗 -->
      <NoticeDialog v-model:visible="dialogVisible" :editData="editData" @submit="handleRefresh" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import NoticeDialog from './modules/notice-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Notice' })

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
    Title: '',
    NoticeType: undefined
  })

  const formItems = computed(() => [
    {
      label: '公告标题',
      key: 'Title',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '公告类型',
      key: 'NoticeType',
      type: 'select',
      options: [
        { label: '走马灯', value: 'MerryGoRound' },
        { label: '提示弹窗', value: 'Popup' }
      ],
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getNoticeList()
  })

  /**
   * 获取公告列表
   */
  const getNoticeList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.notice.getList({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取公告失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      type: 'index',
      label: '序号',
      width: 80,
      align: 'center'
    },
    {
      prop: 'title',
      label: '公告标题',
      minWidth: 180
    },
    {
      prop: 'type',
      label: '公告类型',
      width: 120,
      align: 'center',
      formatter: (row: any) => {
        const typeMap: any = {
          MerryGoRound: { label: '走马灯', type: 'primary' },
          Popup: { label: '提示弹窗', type: 'success' }
        }
        const cfg = typeMap[row.type] || { label: '未知', type: 'info' }
        return h(ElTag, { type: cfg.type, size: 'small' }, () => cfg.label)
      }
    },
    {
      prop: 'content',
      label: '内容预览',
      minWidth: 200,
      formatter: (row: any) => {
        if (!row.content) return '-'
        const preview = row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content
        return h('span', { class: 'text-gray-600' }, preview)
      }
    },
    {
      prop: 'orderNum',
      label: '显示顺序',
      width: 100,
      align: 'center',
      sortable: true
    },
    {
      prop: 'state',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row: any) =>
        h(
          ElTag,
          {
            type: row.state ? 'success' : 'danger',
            size: 'small'
          },
          () => (row.state ? '启用' : '停用')
        )
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
      width: 150,
      align: 'center',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { class: 'flex justify-center gap-1' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditNotice(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteNotice(row)
          })
        ])
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      Title: '',
      NoticeType: undefined
    })
    getNoticeList()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getNoticeList()
  }

  const handleRefresh = (): void => {
    getNoticeList()
  }

  const handlePageChange = (): void => {
    getNoticeList()
  }

  const handleAddNotice = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEditNotice = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleDeleteNotice = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除公告 [${row.title}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.notice.del(row.id)
      ElMessage.success('删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }
</script>

<style scoped lang="scss">
  .notice-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
