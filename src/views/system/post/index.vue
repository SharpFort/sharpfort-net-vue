<!-- 岗位管理页面 -->
<template>
  <div class="post-page art-full-height">
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
          <ElButton type="primary" @click="handleAddPost" v-ripple> 新增岗位 </ElButton>
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

      <!-- 岗位弹窗 -->
      <PostDialog v-model:visible="dialogVisible" :editData="editData" @submit="handleRefresh" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import PostDialog from './modules/post-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Post' })

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
    PostCode: '',
    PostName: '',
    State: undefined
  })

  const formItems = computed(() => [
    {
      label: '岗位编码',
      key: 'PostCode',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '岗位名称',
      key: 'PostName',
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
    getPostList()
  })

  /**
   * 获取岗位列表数据
   */
  const getPostList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.post.getList({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取岗位失败:', error)
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
      prop: 'postCode',
      label: '岗位编码',
      width: 150
    },
    {
      prop: 'postName',
      label: '岗位名称',
      minWidth: 150
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
            onClick: () => handleEditPost(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeletePost(row)
          })
        ])
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      PostCode: '',
      PostName: '',
      State: undefined
    })
    getPostList()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getPostList()
  }

  const handleRefresh = (): void => {
    getPostList()
  }

  const handlePageChange = (): void => {
    getPostList()
  }

  const handleAddPost = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEditPost = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleDeletePost = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除岗位 [${row.postName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.post.del(row.id)
      ElMessage.success('删除成功')
      getPostList()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }
</script>

<style scoped lang="scss">
  .post-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
