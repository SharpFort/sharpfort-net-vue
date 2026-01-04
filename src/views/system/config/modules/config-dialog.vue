<template>
  <ElDialog
    :title="form.id ? '编辑参数' : '新增参数'"
    v-model="dialogVisible"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="参数名称" prop="configName">
        <ElInput v-model="form.configName" placeholder="请输入参数名称" />
      </ElFormItem>
      <ElFormItem label="参数键名" prop="configKey">
        <ElInput v-model="form.configKey" placeholder="请输入参数键名" />
      </ElFormItem>
      <ElFormItem label="参数键值" prop="configValue">
        <ElInput v-model="form.configValue" placeholder="请输入参数键值" />
      </ElFormItem>
      <ElFormItem label="系统内置" prop="configType">
        <ElRadioGroup v-model="form.configType">
          <ElRadio value="Y">是</ElRadio>
          <ElRadio value="N">否</ElRadio>
        </ElRadioGroup>
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
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
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
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'N',
    remark: ''
  })

  const rules = reactive<FormRules>({
    configName: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
    configKey: [{ required: true, message: '请输入参数键名', trigger: 'blur' }],
    configValue: [{ required: true, message: '请输入参数键值', trigger: 'blur' }]
  })

  const initForm = async () => {
    if (props.editData && props.editData.id) {
      try {
        const detail = await CasbinApi.config.get(props.editData.id)
        Object.assign(form, detail)
      } catch (error) {
        console.error('获取参数详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        configName: '',
        configKey: '',
        configValue: '',
        configType: 'N',
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
        await CasbinApi.config.update(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await CasbinApi.config.create(form)
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
</script>
