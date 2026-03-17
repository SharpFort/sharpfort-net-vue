<template>
  <ElDialog
    :title="form.id ? '编辑部门' : '新增部门'"
    v-model="dialogVisible"
    width="800px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 上级部门 - 全宽 -->
      <ElFormItem label="上级部门" prop="parentId">
        <ElTreeSelect
          v-model="form.parentId"
          :data="deptOptions"
          :props="{ label: 'deptName', children: 'children' }"
          value-key="id"
          placeholder="选择上级部门"
          check-strictly
          clearable
          style="width: 100%"
        />
      </ElFormItem>

      <ElDivider />

      <!-- 两列布局 -->
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="部门名称" prop="deptName">
            <ElInput v-model="form.deptName" placeholder="请输入部门名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="部门编码" prop="deptCode">
            <ElInput v-model="form.deptCode" placeholder="请输入部门编码" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="负责人" prop="leader">
            <ElInput v-model="form.leader" placeholder="请输入负责人" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="显示顺序" prop="orderNum">
            <ElInputNumber v-model="form.orderNum" :min="0" style="width: 100%" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="状态" prop="state">
            <ElSwitch v-model="form.state" active-text="启用" inactive-text="停用" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    editData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const deptOptions = ref<any[]>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const form = reactive<any>({
    id: undefined,
    parentId: null,
    deptName: '',
    deptCode: '',
    leader: '',
    orderNum: 0,
    state: true,
    remark: ''
  })

  const rules = reactive<FormRules>({
    deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
    deptCode: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
  })

  const loadDeptOptions = async () => {
    try {
      const res = await CasbinApi.dept.getSelectData()
      deptOptions.value = handleTree(res.items || [])
    } catch (error) {
      console.error('加载部门选项失败:', error)
    }
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

  const initForm = async () => {
    if (props.editData && props.editData.id) {
      try {
        const detail = await CasbinApi.dept.get(props.editData.id)
        Object.assign(form, detail)
      } catch (error) {
        console.error('获取部门详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        parentId: props.editData?.parentId || null,
        deptName: '',
        deptCode: '',
        leader: '',
        orderNum: 0,
        state: true,
        remark: ''
      })
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true
      emit('submit', { ...form })
      handleCancel()
    } catch (error) {
      console.error('表单校验失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  const handleClosed = (): void => {
    formRef.value?.resetFields()
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        loadDeptOptions()
        initForm()
      }
    }
  )
</script>
