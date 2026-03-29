<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加表' : '编辑表'"
    width="550px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElFormItem label="表名" prop="name" :error="fieldErrors.name">
        <ElInput v-model.trim="formData.name" placeholder="请输入表名" />
      </ElFormItem>

      <ElFormItem label="备注" prop="description" :error="fieldErrors.description">
        <ElInput
          v-model.trim="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    type: string
    tableData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const submitLoading = ref(false)
  const fieldErrors = ref<Record<string, string>>({})

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    id: undefined as string | undefined,
    name: '',
    description: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入表名', trigger: 'blur' }]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = async () => {
    fieldErrors.value = {}
    if (props.type === 'edit' && props.tableData) {
      const id = props.tableData.id
      try {
        const detail = await CasbinApi.table.get(id)
        Object.assign(formData, {
          id: detail.id,
          name: detail.name,
          description: detail.description || ''
        })
      } catch (error) {
        console.error('获取详情失败:', error)
      }
    } else {
      Object.assign(formData, {
        id: undefined,
        name: '',
        description: ''
      })
    }
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  /**
   * 解析 ABP 验证错误
   */
  const parseValidationErrors = (error: any) => {
    const errors: Record<string, string> = {}
    const validationErrors = error.data?.error?.validationErrors || error.error?.validationErrors
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err: any) => {
        if (err.members && err.members.length > 0) {
          err.members.forEach((member: string) => {
            const key = member.charAt(0).toLowerCase() + member.slice(1)
            errors[key] = err.message
          })
        }
      })
    }
    return errors
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return
    fieldErrors.value = {}

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          if (dialogType.value === 'add') {
            await CasbinApi.table.create(formData)
            ElMessage.success('添加成功')
          } else {
            await CasbinApi.table.update(formData.id!, formData)
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error: any) {
          console.error('提交失败:', error)
          const errors = parseValidationErrors(error)
          if (Object.keys(errors).length > 0) {
            fieldErrors.value = errors
            ElMessage.error('表单验证失败，请检查输入')
          }
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>
