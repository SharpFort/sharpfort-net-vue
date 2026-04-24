<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="600px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model.trim="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="roleCode">
        <ElInput v-model.trim="form.roleCode" placeholder="请输入角色编码" />
      </ElFormItem>
      <ElFormItem label="数据范围" prop="dataScope">
        <ElSelect v-model="form.dataScope" placeholder="请选择数据范围" style="width: 100%">
          <ElOption label="全部数据" value="ALL" />
          <ElOption label="自定义" value="CUSTOM" />
          <ElOption label="本部门" value="DEPT" />
          <ElOption label="本部门及以下" value="DEPT_FOLLOW" />
          <ElOption label="仅本人" value="SELF" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="显示顺序" prop="orderNum">
        <ElInputNumber v-model.trim="form.orderNum" :min="0" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSwitch v-model="form.state" active-text="启用" inactive-text="停用" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model.trim="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: any
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<any>({
    id: undefined,
    roleName: '',
    roleCode: '',
    dataScope: 'ALL',
    remark: '',
    orderNum: 0,
    state: true,
    menuIds: [],
    departmentIds: []
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  /**
   * 初始化表单数据
   */
  const initForm = async () => {
    if (props.dialogType === 'edit' && props.roleData) {
      try {
        const detail = await CasbinApi.role.get(props.roleData.id)
        Object.assign(form, {
          id: detail.id,
          roleName: detail.roleName,
          roleCode: detail.roleCode,
          dataScope: detail.dataScope || 'ALL',
          remark: detail.remark,
          orderNum: detail.orderNum,
          state: detail.state,
          menuIds: (detail as any).menuIds || [],
          departmentIds: (detail as any).departmentIds || []
        })
      } catch (error) {
        console.error('获取详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        roleName: '',
        roleCode: '',
        dataScope: 'ALL',
        remark: '',
        orderNum: 0,
        state: true,
        menuIds: [],
        departmentIds: []
      })
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (props.dialogType === 'add') {
        await CasbinApi.role.create(form)
        ElMessage.success('新增成功')
      } else {
        await CasbinApi.role.update(form.id, form)
        ElMessage.success('修改成功')
      }

      emit('success')
      handleClose()
    } catch (error) {
      console.log('提交失败:', error)
    } finally {
      submitLoading.value = false
    }
  }
</script>
