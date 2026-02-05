<template>
  <ElDialog
    :title="form.id ? '编辑字典数据' : '新增字典数据'"
    v-model="dialogVisible"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput v-model="form.dictType" disabled />
      </ElFormItem>
      <ElFormItem label="字典标签" prop="dictLabel">
        <ElInput v-model="form.dictLabel" placeholder="请输入字典标签" />
      </ElFormItem>
      <ElFormItem label="字典键值" prop="dictValue">
        <ElInput v-model="form.dictValue" placeholder="请输入字典键值" />
      </ElFormItem>
      <ElFormItem label="显示顺序" prop="orderNum">
        <ElInputNumber v-model="form.orderNum" :min="0" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="系统默认" prop="isDefault">
        <ElRadioGroup v-model="form.isDefault">
          <ElRadio :value="true">是</ElRadio>
          <ElRadio :value="false">否</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="状态" prop="state">
        <ElSwitch v-model="form.state" />
      </ElFormItem>
      <ElFormItem label="回显样式" prop="listClass">
        <ElSelect v-model="form.listClass" placeholder="选择回显样式" style="width: 100%">
          <ElOption label="默认 (default)" value="default" />
          <ElOption label="主要 (primary)" value="primary" />
          <ElOption label="成功 (success)" value="success" />
          <ElOption label="信息 (info)" value="info" />
          <ElOption label="警告 (warning)" value="warning" />
          <ElOption label="危险 (danger)" value="danger" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="CSS类名" prop="cssClass">
        <ElInput v-model="form.cssClass" placeholder="请输入CSS类名" />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
    dictType: string
  }

  interface Emits {
    (event: 'update:visible', value: boolean): void
    (event: 'submit', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const form = reactive<any>({
    id: undefined,
    dictType: props.dictType,
    dictLabel: '',
    dictValue: '',
    orderNum: 0,
    isDefault: false,
    state: true,
    listClass: 'default',
    cssClass: '',
    remark: ''
  })

  const rules = reactive<FormRules>({
    dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
    dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }]
  })

  const initForm = async () => {
    if (props.editData && props.editData.id) {
      try {
        const detail = await CasbinApi.dictionary.data.get(props.editData.id)
        Object.assign(form, detail)
      } catch (error) {
        console.error('获取字典数据详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        dictType: props.dictType,
        dictLabel: '',
        dictValue: '',
        orderNum: 0,
        isDefault: false,
        state: true,
        listClass: 'default',
        cssClass: '',
        remark: ''
      })
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (form.id) {
        await CasbinApi.dictionary.data.update(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await CasbinApi.dictionary.data.create(form)
        ElMessage.success('添加成功')
      }

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
        initForm()
      }
    }
  )

  watch(
    () => props.dictType,
    (val) => {
      form.dictType = val
    }
  )
</script>
