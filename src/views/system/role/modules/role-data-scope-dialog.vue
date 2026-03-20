<template>
  <el-dialog
    v-model="visible"
    title="分配数据权限"
    width="600px"
    @open="handleOpen"
    append-to-body
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="loading">
      <el-form-item label="角色名称">
        <el-input v-model="form.roleName" disabled />
      </el-form-item>
      <el-form-item label="角色编码">
        <el-input v-model="form.roleCode" disabled />
      </el-form-item>

      <el-form-item label="数据范围" prop="dataScope">
        <el-select v-model="form.dataScope" placeholder="请选择数据范围" style="width: 100%">
          <el-option label="全部数据" value="ALL" />
          <el-option label="自定义数据" value="CUSTOM" />
          <el-option label="本部门数据" value="DEPT" />
          <el-option label="本部门及以下数据" value="DEPT_FOLLOW" />
          <el-option label="仅本人数据" value="SELF" />
        </el-select>
      </el-form-item>

      <el-form-item label="数据权限" v-if="form.dataScope === 'CUSTOM'">
        <div
          style="
            width: 100%;
            padding: 10px;
            border: 1px solid var(--el-border-color);
            border-radius: 4px;
          "
        >
          <div style="display: flex; gap: 10px; margin-bottom: 10px">
            <el-checkbox v-model="expandAll" @change="handleExpandChange">展开/折叠</el-checkbox>
            <el-checkbox v-model="linkage">父子联动(仅向下)</el-checkbox>
          </div>
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            show-checkbox
            node-key="id"
            :default-expand-all="expandAll"
            :check-strictly="true"
            :props="{ label: 'deptName', children: 'children' }"
            @check="handleNodeCheck"
          />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, nextTick } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessage } from 'element-plus'
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

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    roleData: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const deptTreeRef = ref()
  const loading = ref(false)
  const submitLoading = ref(false)

  const deptOptions = ref<any[]>([])
  const expandAll = ref(true)
  const linkage = ref(true) // 自定义联动标志，只向下传递，不向上传递

  const form = reactive({
    roleId: '',
    roleName: '',
    roleCode: '',
    dataScope: 'ALL'
  })

  const rules = {
    dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }]
  }

  const handleExpandChange = (val: any) => {
    if (!deptOptions.value || deptOptions.value.length === 0) return
    const nodes = deptTreeRef.value?.store.nodesMap
    if (nodes) {
      for (const key in nodes) {
        nodes[key].expanded = val
      }
    }
  }

  // 递归获取所有子节点ID
  const getAllChildIds = (node: any, ids: string[] = []) => {
    if (node.children && node.children.length) {
      node.children.forEach((child: any) => {
        ids.push(child.id)
        getAllChildIds(child, ids)
      })
    }
    return ids
  }

  // 极其严谨的独立树形节点勾选逻辑：选中/取消父节点时，向下传递给所有子节点；但选中/取消子节点时，绝对不会向上传递给父节点，从而防止数据权限放大！
  const handleNodeCheck = (data: any, info: any) => {
    if (!linkage.value) return // 未开启联动，则使用树默认的完全独立(check-strictly=true)逻辑

    const isChecked = info.checkedKeys.includes(data.id)
    const childIds = getAllChildIds(data)

    if (childIds.length === 0) return // 如果没有子节点，就不需要向下联动

    // 取出现有被全选的节点 Set（因为强制 check-strictly=true，所以不存在半选节点）
    const currentCheckedKeys = new Set(deptTreeRef.value.getCheckedKeys())

    if (isChecked) {
      childIds.forEach((id) => currentCheckedKeys.add(id))
    } else {
      childIds.forEach((id) => currentCheckedKeys.delete(id))
    }

    deptTreeRef.value.setCheckedKeys(Array.from(currentCheckedKeys))
  }

  /** 查部门树 */
  const loadDeptTree = async () => {
    try {
      const res = await CasbinApi.dept.getList({ SkipCount: 0, MaxResultCount: 2000 })
      const items = res.items || res || []
      if (items.some((i: any) => i.parentId !== undefined)) {
        deptOptions.value = handleTree(items)
      } else {
        deptOptions.value = items
      }
    } catch (error) {
      console.error('Failed to load dept tree', error)
    }
  }

  /** 弹窗打开时 */
  const handleOpen = async () => {
    if (!props.roleData?.id) return

    loading.value = true
    // 数据初始化
    form.roleId = props.roleData.id
    form.roleName = props.roleData.roleName || ''
    form.roleCode = props.roleData.roleCode || ''
    form.dataScope = props.roleData.dataScope || 'ALL'

    linkage.value = true // 重置联动状态为开启

    await loadDeptTree()

    if (form.dataScope === 'CUSTOM') {
      // 回显当前角色已绑定的部门
      try {
        const depts = await CasbinApi.role.getDepts(props.roleData.id)
        // Element Plus Tree 回显时，如果父节点被勾选，所有子节点也会被自动勾选（如果非 strictly）。
        // 为避免半选状态被错误全选，可以临时开启 literally strictly，回显后再关闭。
        const checkedIds = Array.isArray(depts) ? depts : []

        nextTick(() => {
          if (deptTreeRef.value) {
            deptTreeRef.value.setCheckedKeys(checkedIds)
          }
        })
      } catch (e) {
        console.error('获取绑定部门失败', e)
      }
    }

    loading.value = false
  }

  const submitForm = async () => {
    submitLoading.value = true
    try {
      let departmentIds: string[] = []
      if (form.dataScope === 'CUSTOM' && deptTreeRef.value) {
        // 仅仅获取完全选中的节点，不包含半选节点，防止数据权限被意外上级放大
        departmentIds = deptTreeRef.value.getCheckedKeys()
      }

      await CasbinApi.role.setDataScope({
        roleId: form.roleId,
        dataScope: form.dataScope, // Type: string or number depending on enum logic, assuming string enum if it parses successfully
        departmentIds: departmentIds
      })

      ElMessage.success('分配数据权限成功')
      visible.value = false
      emit('success')
    } catch (error) {
      console.error('分配数据权限失败', error)
    } finally {
      submitLoading.value = false
    }
  }
</script>
