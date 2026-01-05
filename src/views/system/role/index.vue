<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RoleSearch>

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增角色</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <!-- 菜单权限弹窗 -->
    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { CasbinApi } from '@/api/casbin-rbac'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'
  import { ElTag, ElMessageBox, ElButton, ElMessage } from 'element-plus'

  defineOptions({ name: 'Role' })

  // 搜索表单
  const searchForm = ref({
    RoleName: undefined,
    RoleCode: undefined,
    State: undefined
  })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const currentRoleData = ref<any>(undefined)

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
    refreshData,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return CasbinApi.role.getList({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', label: '序号', width: 60 },
        {
          prop: 'id',
          label: '角色ID',
          width: 280,
          visible: false,
          showOverflowTooltip: true
        },
        {
          prop: 'roleName',
          label: '角色名称',
          minWidth: 120
        },
        {
          prop: 'roleCode',
          label: '角色编码',
          minWidth: 120
        },
        {
          prop: 'dataScope',
          label: '数据范围',
          width: 120,
          formatter: (row: any) => {
            const dataScopeMap: Record<string, string> = {
              ALL: '全部数据',
              CUSTOM: '自定义',
              DEPT: '本部门',
              DEPT_FOLLOW: '本部门及以下',
              SELF: '仅本人'
            }
            return dataScopeMap[row.dataScope] || row.dataScope || '-'
          }
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
          formatter: (row: any) => {
            const statusConfig = row.state
              ? { type: 'success', text: '正常' }
              : { type: 'danger', text: '停用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'danger' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'creationTime',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'creatorId',
          label: '创建者ID',
          width: 280,
          visible: false,
          showOverflowTooltip: true
        },
        {
          prop: 'lastModificationTime',
          label: '最后修改时间',
          width: 180,
          visible: false,
          sortable: true
        },
        {
          prop: 'lastModifierId',
          label: '最后修改者ID',
          width: 280,
          visible: false,
          showOverflowTooltip: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 380,
          fixed: 'right',
          formatter: (row) =>
            h('div', { class: 'flex gap-2 flex-wrap' }, [
              h(
                ElButton,
                {
                  link: true,
                  type: 'primary',
                  size: 'small',
                  onClick: () => showPermissionDialog(row)
                },
                () => '授权菜单'
              ),
              h(
                ElButton,
                {
                  link: true,
                  type: 'primary',
                  size: 'small',
                  onClick: () => showUserPermissionDialog(row)
                },
                () => '授权账号'
              ),
              h(
                ElButton,
                {
                  link: true,
                  type: 'primary',
                  size: 'small',
                  onClick: () => showDialog('edit', row)
                },
                () => '编辑'
              ),
              h(
                ElButton,
                {
                  link: true,
                  type: 'primary',
                  size: 'small',
                  onClick: () => copyRole(row)
                },
                () => '复制'
              ),
              h(
                ElButton,
                {
                  link: true,
                  type: 'danger',
                  size: 'small',
                  onClick: () => deleteRole(row)
                },
                () => '删除'
              )
            ])
        }
      ]
    }
  })

  const dialogType = ref<'add' | 'edit'>('add')

  const showDialog = (type: 'add' | 'edit', row?: any) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRoleData.value = row
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  const showPermissionDialog = (row?: any) => {
    permissionDialog.value = true
    currentRoleData.value = row
  }

  const showUserPermissionDialog = () => {
    ElMessage.info('授权账号功能开发中...')
    // TODO: 实现授权账号对话框
    // userPermissionDialog.value = true
    // currentRoleData.value = row
  }

  const copyRole = async (row: any) => {
    try {
      const detail = await CasbinApi.role.get(row.id)
      const copyData = {
        ...detail,
        id: undefined,
        roleName: `${detail.roleName}_副本`,
        roleCode: `${detail.roleCode}_copy`,
        creationTime: undefined,
        creatorId: undefined,
        lastModificationTime: undefined,
        lastModifierId: undefined
      }
      await CasbinApi.role.create(copyData)
      ElMessage.success('复制成功')
      refreshData()
    } catch (error) {
      console.error('复制失败:', error)
      ElMessage.error('复制失败')
    }
  }

  const deleteRole = (row: any) => {
    ElMessageBox.confirm(`确定删除角色"${row.roleName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await CasbinApi.role.del(row.id)
        ElMessage.success('删除成功')
        refreshRemove()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
