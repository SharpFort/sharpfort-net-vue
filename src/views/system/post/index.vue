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
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAddPost" v-ripple> 新增岗位 </ElButton>
            <ElButton @click="handleExport" v-ripple> 导出 </ElButton>
            <ElUpload
              action="#"
              :show-file-list="false"
              :http-request="handleImport"
              accept=".xlsx,.xls"
            >
              <ElButton v-ripple> 导入 </ElButton>
            </ElUpload>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="displayTableData"
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
  import { ElTag, ElMessageBox, ElMessage, ElSpace, ElUpload } from 'element-plus'

  defineOptions({ name: 'Post' })

  // 状态管理
  const loading = ref(false)
  const dialogVisible = ref(false)
  const editData = ref<any>(null)
  const tableData = ref<any[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  // 搜索相关
  const formFilters = reactive({
    PostCode: '',
    PostName: '',
    State: undefined
  })

  const appliedFilters = reactive({
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
      props: {
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '停用', value: false }
        ]
      }
    }
  ])

  onMounted(() => {
    getPostList()
  })

  /**
   * 获取岗位列表数据（全量获取）
   */
  const getPostList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.post.getList({
        SkipCount: 0,
        MaxResultCount: 1000
      })
      tableData.value = res.items || []
    } catch (error) {
      console.error('获取岗位失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 过滤后的数据
   */
  const filteredTableData = computed(() => {
    const searchCode = appliedFilters.PostCode?.toLowerCase().trim() || ''
    const searchName = appliedFilters.PostName?.toLowerCase().trim() || ''
    const searchState = appliedFilters.State

    return tableData.value.filter((item) => {
      const matchCode = !searchCode || (item.postCode || '').toLowerCase().includes(searchCode)
      const matchName = !searchName || (item.postName || '').toLowerCase().includes(searchName)
      const matchState = searchState === undefined || item.state === searchState
      return matchCode && matchName && matchState
    })
  })

  /**
   * 当前页显示的数据
   */
  const displayTableData = computed(() => {
    const start = (pagination.current - 1) * pagination.size
    return filteredTableData.value.slice(start, start + pagination.size)
  })

  // 监听过滤后的数据变化，更新总条数
  watch(
    () => filteredTableData.value.length,
    (val) => {
      pagination.total = val
    },
    { immediate: true }
  )

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
      prop: 'remark',
      label: '备注',
      minWidth: 150,
      showOverflowTooltip: true
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
    Object.assign(appliedFilters, formFilters)
    pagination.current = 1
  }

  const handleSearch = (): void => {
    Object.assign(appliedFilters, formFilters)
    pagination.current = 1
  }

  const handleRefresh = (): void => {
    getPostList()
  }

  /**
   * 导出岗位
   */
  const handleExport = async () => {
    try {
      ElMessage.info('正在导出数据，请稍候...')
      const res = await CasbinApi.post.export(appliedFilters)
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `岗位数据_${new Date().getTime()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }

  /**
   * 导入岗位
   */
  const handleImport = async (options: any) => {
    try {
      const formData = new FormData()
      formData.append('file', options.file)
      await CasbinApi.post.import(formData)
      ElMessage.success('导入成功')
      getPostList()
    } catch (error) {
      console.error('导入失败:', error)
      ElMessage.error('导入失败')
    }
  }

  const handlePageChange = (): void => {
    // 客户端分页无需重新请求
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
