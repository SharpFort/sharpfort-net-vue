<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="right">
      <ElFormItem label="字段名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入字段名称" />
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput v-model="form.description" type="textarea" placeholder="请输入描述" />
      </ElFormItem>
      <ElFormItem label="字段类型" prop="fieldType">
        <ElSelect v-model="form.fieldType" placeholder="请选择字段类型">
          <ElOption v-for="item in fieldTypes" :key="item" :label="item" :value="item" />
        </ElSelect>
      </ElFormItem>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="排序" prop="orderNum">
            <ElInputNumber v-model="form.orderNum" :min="0" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="长度" prop="length">
            <ElInputNumber v-model="form.length" :min="0" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="关联表ID" prop="tableId">
        <ElInput v-model="form.tableId" placeholder="请输入关联表ID" />
      </ElFormItem>

      <ElFormItem label="选项">
        <ElCheckbox v-model="form.isRequired">必填</ElCheckbox>
        <ElCheckbox v-model="form.isKey">主键</ElCheckbox>
        <ElCheckbox v-model="form.isAutoAdd">自增</ElCheckbox>
        <ElCheckbox v-model="form.isPublic">公共字段</ElCheckbox>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CodeGenApi } from '@/api/code-gen'

  const props = defineProps<{
    modelValue: boolean
    type: 'add' | 'edit'
    data?: Api.CodeGen.FieldDto
  }>()

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const title = computed(() => (props.type === 'add' ? '新增字段' : '编辑字段'))
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const fieldTypes = ref<string[]>([])

  const form = reactive<Api.CodeGen.FieldDto>({
    id: '',
    name: '',
    description: '',
    orderNum: 0,
    length: 0,
    fieldType: undefined,
    tableId: '',
    isRequired: false,
    isKey: false,
    isAutoAdd: false,
    isPublic: false
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
    fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }]
    // tableId: [{ required: true, message: '请输入关联表ID', trigger: 'blur' }] // Assuming tableId might be required
  }

  const getFieldTypes = async () => {
    try {
      const res = await CodeGenApi.field.getFieldType()
      fieldTypes.value = res
    } catch (error) {
      console.error(error)
    }
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        getFieldTypes()
        if (props.type === 'edit' && props.data) {
          Object.assign(form, props.data)
        } else {
          formRef.value?.resetFields()
          Object.assign(form, {
            id: '',
            name: '',
            description: '',
            orderNum: 0,
            length: 0,
            fieldType: undefined,
            tableId: '', // Ideally this should be passed if we are adding a field to a specific table context
            isRequired: false,
            isKey: false,
            isAutoAdd: false,
            isPublic: false
          })
        }
      }
    }
  )

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        loading.value = true
        try {
          if (props.type === 'add') {
            await CodeGenApi.field.create(form)
            ElMessage.success('新增成功')
          } else {
            await CodeGenApi.field.update(form.id, form)
            ElMessage.success('编辑成功')
          }
          emit('success')
          handleClose()
        } catch (error) {
          console.error(error)
        } finally {
          loading.value = false
        }
      }
    })
  }
</script>
