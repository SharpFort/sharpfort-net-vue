<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加字段' : '编辑字段'"
    width="650px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="字段名称" prop="name" :error="fieldErrors.name">
            <ElInput v-model="formData.name" placeholder="请输入字段名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="所属表" prop="tableId" :error="fieldErrors.tableId">
            <ElSelect v-model="formData.tableId" placeholder="请选择所属表" class="w-full">
              <ElOption
                v-for="item in tableOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="字段类型" prop="fieldType" :error="fieldErrors.fieldType">
            <ElSelect v-model="formData.fieldType" placeholder="请选择字段类型" class="w-full">
              <ElOption v-for="item in fieldTypeOptions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="长度" prop="length" :error="fieldErrors.length">
            <ElInputNumber v-model="formData.length" :min="0" class="w-full" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="排序" prop="orderNum" :error="fieldErrors.orderNum">
            <ElInputNumber v-model="formData.orderNum" :min="0" class="w-full" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElFormItem label="是否必填" prop="isRequired">
            <ElSwitch v-model="formData.isRequired" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="是否主键" prop="isKey">
            <ElSwitch v-model="formData.isKey" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="是否自增" prop="isAutoAdd">
            <ElSwitch v-model="formData.isAutoAdd" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="是否公共" prop="isPublic">
            <ElSwitch v-model="formData.isPublic" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="备注" prop="description" :error="fieldErrors.description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="2"
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
  import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    type: string
    fieldData?: any
    defaultTableId?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const submitLoading = ref(false)
  const fieldErrors = ref<Record<string, string>>({})
  const tableOptions = ref<any[]>([])
  const fieldTypeOptions = ref<string[]>([])

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
    description: '',
    orderNum: 0,
    length: 0,
    fieldType: 'String',
    tableId: undefined as string | undefined,
    isRequired: false,
    isKey: false,
    isAutoAdd: false,
    isPublic: false
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
    tableId: [{ required: true, message: '请选择所属表', trigger: 'change' }],
    fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = async () => {
    fieldErrors.value = {}
    if (props.type === 'edit' && props.fieldData) {
      const id = props.fieldData.id
      try {
        const detail = await CasbinApi.field.get(id)
        Object.assign(formData, {
          id: detail.id,
          name: detail.name,
          description: detail.description || '',
          orderNum: detail.orderNum || 0,
          length: detail.length || 0,
          fieldType: detail.fieldType,
          tableId: detail.tableId,
          isRequired: detail.isRequired,
          isKey: detail.isKey,
          isAutoAdd: detail.isAutoAdd,
          isPublic: detail.isPublic
        })
      } catch (error) {
        console.error('获取详情失败:', error)
      }
    } else {
      Object.assign(formData, {
        id: undefined,
        name: '',
        description: '',
        orderNum: 0,
        length: 0,
        fieldType: 'String',
        tableId: props.defaultTableId,
        isRequired: false,
        isKey: false,
        isAutoAdd: false,
        isPublic: false
      })
    }
  }

  onMounted(async () => {
    try {
      const [tables, types] = await Promise.all([
        CasbinApi.table.getSelectData(),
        CasbinApi.field.getFieldType()
      ])
      tableOptions.value = tables.map((t: any) => ({
        label: t.name,
        value: t.id
      }))
      fieldTypeOptions.value = types
    } catch (error) {
      console.error('获取基础数据失败:', error)
    }
  })

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
            await CasbinApi.field.create(formData)
            ElMessage.success('添加成功')
          } else {
            await CasbinApi.field.update(formData.id!, formData)
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
