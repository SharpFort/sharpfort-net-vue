<template>
  <ElDialog
    v-model="visible"
    title="授权菜单"
    :width="dialogWidth"
    align-center
    class="role-permission-dialog"
  >
    <div class="permission-content">
      <div class="permission-header">
        <ElSpace>
          <ElButton @click="toggleExpandAll" size="small">
            <template #icon>
              <i :class="isExpandAll ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
            </template>
            {{ isExpandAll ? '全部收起' : '全部展开' }}
          </ElButton>
          <ElButton @click="toggleSelectAll" size="small">
            <template #icon>
              <i :class="isSelectAll ? 'ri-checkbox-line' : 'ri-checkbox-blank-line'"></i>
            </template>
            {{ isSelectAll ? '全部选择' : '取消全选' }}
          </ElButton>
          <ElTag type="info" size="small">已选择 {{ checkedCount }} 项</ElTag>
        </ElSpace>
      </div>

      <ElScrollbar :height="scrollbarHeight" class="permission-tree-scrollbar">
        <ElTree
          ref="treeRef"
          v-loading="loading"
          :data="menuList"
          show-checkbox
          node-key="id"
          :default-expand-all="isExpandAll"
          :props="defaultProps"
          class="permission-tree"
          @check="handleCheck"
        />
      </ElScrollbar>
    </div>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="savePermission">保存</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss">
  .role-permission-dialog {
    :deep(.el-dialog__body) {
      padding: 10px 20px;
    }
  }

  .permission-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .permission-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .permission-tree-scrollbar {
    padding: 12px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
  }

  .permission-tree {
    :deep(.el-tree-node__content) {
      height: 32px;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    :deep(.el-tree-node__label) {
      font-size: 14px;
    }

    :deep(.el-checkbox) {
      margin-right: 8px;
    }

    :deep(.el-tree-node__expand-icon) {
      font-size: 16px;
    }

    // 按钮类型的节点横向排列
    :deep(.el-tree-node[data-menu-type='Button']) {
      display: inline-block;
      margin-right: 8px;
      margin-bottom: 4px;
      vertical-align: top;

      .el-tree-node__content {
        width: auto;
        padding-right: 12px;
      }
    }

    // 目录和菜单类型保持纵向排列
    :deep(.el-tree-node[data-menu-type='Catalogue']),
    :deep(.el-tree-node[data-menu-type='Menu']) {
      display: block;
      width: 100%;
    }

    // 父节点的子节点容器
    :deep(.el-tree-node__children) {
      padding-left: 24px;

      // 如果子节点包含按钮,使用 flex 布局
      &:has([data-menu-type='Button']) {
        display: flex;
        flex-wrap: wrap;
        gap: 0;
        align-items: flex-start;
      }

      // 如果子节点不包含按钮,保持块级布局
      &:not(:has([data-menu-type='Button'])) {
        display: block;
      }
    }
  }
</style>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    modelValue: boolean
    roleData?: any
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const treeRef = ref()
  const loading = ref(false)
  const submitLoading = ref(false)
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const menuList = ref<any[]>([])
  const checkedCount = ref(0)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  // 响应式对话框宽度
  const dialogWidth = computed(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 768) return '95vw'
      if (width < 1200) return '85vw'
      return '90vw'
    }
    return '1400px'
  })

  // 响应式滚动条高度
  const scrollbarHeight = computed(() => {
    if (typeof window !== 'undefined') {
      const height = window.innerHeight
      if (height < 600) return '50vh'
      if (height < 800) return '60vh'
      return '65vh'
    }
    return '65vh'
  })

  const defaultProps = {
    children: 'children',
    label: (data: any) => data.menuName || data.label || ''
  }

  /**
   * 处理选中变化
   */
  const handleCheck = () => {
    if (treeRef.value) {
      const checked = treeRef.value.getCheckedKeys()
      const halfChecked = treeRef.value.getHalfCheckedKeys()
      checkedCount.value = checked.length + halfChecked.length
    }
  }

  /**
   * 加载菜单和角色权限
   */
  const loadData = async () => {
    if (!props.roleData?.id) return
    loading.value = true
    try {
      // 1. 获取所有菜单
      const menuRes = await CasbinApi.menu.getList({ SkipCount: 0, MaxResultCount: 1000 })
      menuList.value = handleTree(menuRes.items || [])

      // 2. 获取该角色的菜单权限
      const roleMenus = await CasbinApi.role.getMenus(props.roleData.id)
      const roleMenuIds = (roleMenus || []).map((m: any) => m.id)

      // 设置选中状态
      nextTick(() => {
        treeRef.value?.setCheckedKeys(roleMenuIds)
        handleCheck()
        // 为树节点添加 data-menu-type 属性
        addMenuTypeAttributes()
      })
    } catch (error) {
      console.error('加载权限数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 为树节点添加 data-menu-type 属性
   */
  const addMenuTypeAttributes = () => {
    nextTick(() => {
      if (!treeRef.value) return
      const nodes = treeRef.value.$el.querySelectorAll('.el-tree-node')
      nodes.forEach((node: HTMLElement) => {
        const nodeKey = node.getAttribute('data-key')
        if (nodeKey) {
          const nodeData = findNodeData(menuList.value, nodeKey)
          if (nodeData?.menuType) {
            node.setAttribute('data-menu-type', nodeData.menuType)
          }
        }
      })
    })
  }

  /**
   * 根据 ID 查找节点数据
   */
  const findNodeData = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findNodeData(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 构造树型结构
   */
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

  watch(
    () => props.modelValue,
    (val) => {
      if (val) loadData()
    }
  )

  const savePermission = async () => {
    if (!props.roleData?.id) return
    submitLoading.value = true
    try {
      const checkedKeys = treeRef.value.getCheckedKeys()
      const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
      const menuIds = [...checkedKeys, ...halfCheckedKeys]

      // 获取当前角色完整数据进行更新
      const roleDetail = await CasbinApi.role.get(props.roleData.id)
      const updateData = {
        ...roleDetail,
        menuIds: menuIds
      }

      await CasbinApi.role.update(props.roleData.id, updateData)
      ElMessage.success('权限保存成功')

      emit('success')
      visible.value = false
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  const toggleExpandAll = () => {
    isExpandAll.value = !isExpandAll.value
    const nodes = treeRef.value.store.nodesMap
    for (let i in nodes) {
      nodes[i].expanded = isExpandAll.value
    }
    // 展开/收起后重新添加属性
    nextTick(() => {
      addMenuTypeAttributes()
    })
  }

  const toggleSelectAll = () => {
    isSelectAll.value = !isSelectAll.value
    if (isSelectAll.value) {
      const allKeys = getAllNodeKeys(menuList.value)
      treeRef.value.setCheckedKeys(allKeys)
    } else {
      treeRef.value.setCheckedKeys([])
    }
    handleCheck()
  }

  const getAllNodeKeys = (nodes: any[]) => {
    const keys: string[] = []
    const traverse = (list: any[]) => {
      list.forEach((n) => {
        keys.push(n.id)
        if (n.children?.length) traverse(n.children)
      })
    }
    traverse(nodes)
    return keys
  }
</script>
