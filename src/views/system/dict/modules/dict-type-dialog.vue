<template>
  <ElDialog
    :title="form.id ? '编辑字典类型' : '新增字典类型'"
    v-model="dialogVisible"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="字典名称" prop="dictName">
        <ElInput v-model="form.dictName" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="dictType">
        <ElInput v-model="form.dictType" placeholder="请输入字典类型" />
      </ElFormItem>
      <ElFormItem label="状态" prop="state">
        <ElSwitch v-model="form.state" />
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
    editData?: Api.SystemManage.DictionaryTypeGetListOutputDto | null
  }

  interface Emits {
    (event: 'update:visible', value: boolean): void
    (event: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  interface DictTypeForm extends Api.SystemManage.DictionaryTypeUpdateInputVo {
    id?: string
  }

  const form = reactive<DictTypeForm>({
    id: undefined,
    dictName: '',
    dictType: '',
    state: true,
    remark: ''
  })

  const rules = reactive<FormRules>({
    dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }]
  })

  const initForm = async () => {
    if (props.editData && props.editData.id) {
      try {
        const detail = await CasbinApi.dictionary.type.get(props.editData.id)
        Object.assign(form, detail)
      } catch (error) {
        console.error('获取字典类型详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        dictName: '',
        dictType: '',
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

      if (form.id) {
        await CasbinApi.dictionary.type.update(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await CasbinApi.dictionary.type.create(form)
        ElMessage.success('添加成功')
      }

      emit('submit')
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
