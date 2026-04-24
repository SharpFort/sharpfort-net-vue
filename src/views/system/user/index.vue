<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的 高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
            <ElButton @click="handleExport" v-ripple>导出</ElButton>
            <ElUpload
              action="#"
              :show-file-list="false"
              :http-request="handleImport"
              accept=".xlsx,.xls"
            >
              <ElButton v-ripple>导入</ElButton>
            </ElUpload>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as any[]"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElMessageBox, ElSwitch, ElUpload, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    UserName: undefined,
    Phone: undefined,
    Email: undefined,
    State: undefined,
    Gender: undefined,
    PostId: undefined,
    RoleId: undefined
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
    // 核心配置
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return CasbinApi.user.getList({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userName',
          label: '用户名',
          minWidth: 60,
          showOverflowTooltip: true
        },
        {
          prop: 'nick',
          label: '昵称',
          minWidth: 60,
          showOverflowTooltip: true
        },
        {
          prop: 'gender',
          label: '性别',
          width: 60,
          formatter: (row: any) => {
            const genderMap: Record<string, string> = {
              Unknown: '未知',
              Male: '男',
              Female: '女'
            }
            return genderMap[row.gender] || '未知'
          }
        },
        {
          prop: 'phone',
          label: '手机号',
          width: 130
        },
        {
          prop: 'email',
          label: '邮箱',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'deptName',
          label: '部门',
          minWidth: 40,
          showOverflowTooltip: true
        },
        {
          prop: 'posts',
          label: '岗位',
          minWidth: 40,
          showOverflowTooltip: true,
          formatter: (row: any) => {
            return row.posts?.map((p: any) => p.postName).join(', ') || '-'
          }
        },
        {
          prop: 'roles',
          label: '角色',
          minWidth: 40,
          showOverflowTooltip: true,
          formatter: (row: any) => {
            return row.roles?.map((r: any) => r.roleName).join(', ') || '-'
          }
        },
        {
          prop: 'state',
          label: '状态',
          width: 60,
          formatter: (row: any) => {
            return h(ElSwitch, {
              modelValue: row.state,
              activeText: '正常',
              inactiveText: '停用',
              inlinePrompt: true,
              style: '--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949',
              'onUpdate:modelValue': (val: any) => {
                const checked = val as boolean
                row.state = checked
                CasbinApi.user
                  .updateState(row.id as string, checked)
                  .then(() => {
                    ElMessage.success(checked ? '已启用该用户' : '已停用该用户')
                  })
                  .catch(() => {
                    row.state = !checked // revert on error
                  })
              }
            })
          }
        },
        {
          prop: 'creationTime',
          label: '创建时间',
          width: 260,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row: any) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 导出用户
   */
  const handleExport = async () => {
    try {
      ElMessage.info('正在导出数据，请稍候...')
      const res = await CasbinApi.user.export(searchParams)
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `用户数据_${new Date().getTime()}.xlsx`)
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
   * 导入用户
   */
  const handleImport = async (options: any) => {
    try {
      const formData = new FormData()
      formData.append('file', options.file)
      await CasbinApi.user.import(formData)
      ElMessage.success('导入成功')
      refreshData()
    } catch (error) {
      console.error('导入失败:', error)
      ElMessage.error('导入失败')
    }
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        try {
          await CasbinApi.user.del(row.id as unknown as string)
          ElMessage.success('注销成功')
          refreshData()
        } catch (error) {
          console.error('删除用户失败:', error)
        }
      })
      .catch(() => {
        // 取消操作
      })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
  }
</script>
