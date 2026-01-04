<!-- 部门管理页面 -->
<template>
  <div class="dept-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
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
          <ElButton @click="handleAddDept" v-ripple> 新增部门 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <!-- 部门弹窗 -->
      <DeptDialog v-model:visible="dialogVisible" :editData="editData" @submit="handleSubmit" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import DeptDialog from './modules/dept-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Dept' })

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const editData = ref<any>(null)

  // 搜索相关
  const formFilters = reactive({
    deptName: ''
  })
  const appliedFilters = reactive({
    deptName: ''
  })

  const formItems = computed(() => [
    {
      label: '部门名称',
      key: 'deptName',
      type: 'input',
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getDeptList()
  })

  /**
   * 获取部门列表数据
   */
  const getDeptList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.dept.getList({ SkipCount: 0, MaxResultCount: 1000 })
      tableData.value = res.items || []
    } catch (error) {
      console.error('获取部门失败:', error)
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
      prop: 'deptName',
      label: '部门名称',
      minWidth: 180
    },
    {
      prop: 'deptCode',
      label: '部门编码',
      width: 140
    },
    {
      prop: 'leader',
      label: '负责人',
      width: 120,
      formatter: (row: any) => row.leader || '-'
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
      width: 180,
      align: 'center',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { class: 'flex justify-center gap-1' }, [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => handleAddSubDept(row),
            title: '新增下级'
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditDept(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteDept(row)
          })
        ])
      }
    }
  ])

  // 数据相关
  const tableData = ref<any[]>([])

  const handleReset = (): void => {
    formFilters.deptName = ''
    appliedFilters.deptName = ''
  }

  const handleSearch = (): void => {
    appliedFilters.deptName = formFilters.deptName
  }

  const handleRefresh = (): void => {
    getDeptList()
  }

  const handleTree = (data: any[]) => {
    const res: any[] = []
    const map = new Map()
    data.forEach((item) => {
      map.set(item.id, { ...item, children: [] })
    })
    data.forEach((item) => {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children.push(map.get(item.id))
      } else {
        res.push(map.get(item.id))
      }
    })
    return res
  }

  const searchDept = (items: any[]): any[] => {
    const results: any[] = []
    for (const item of items) {
      const searchName = appliedFilters.deptName?.toLowerCase().trim() || ''
      const match = !searchName || (item.deptName || '').toLowerCase().includes(searchName)

      const clonedItem = { ...item, children: [] }
      if (item.children?.length) {
        const matchedChildren = searchDept(item.children)
        if (matchedChildren.length > 0) {
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (match) {
        results.push(clonedItem)
      }
    }
    return results
  }

  const filteredTableData = computed(() => {
    const treeData = handleTree(tableData.value)
    if (!appliedFilters.deptName) return treeData
    return searchDept(treeData)
  })

  const handleAddDept = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleAddSubDept = (row: any): void => {
    editData.value = { parentId: row.id }
    dialogVisible.value = true
  }

  const handleEditDept = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleSubmit = async (formData: any): Promise<void> => {
    try {
      if (formData.id) {
        await CasbinApi.dept.update(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await CasbinApi.dept.create(formData)
        ElMessage.success('添加成功')
      }
      getDeptList()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  const handleDeleteDept = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除部门 [${row.deptName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.dept.del(row.id)
      ElMessage.success('删除成功')
      getDeptList()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }

  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: any[]) => {
          rows.forEach((row: any) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }
</script>

<style scoped lang="scss">
  .dept-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
