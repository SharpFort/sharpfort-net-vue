<template>
  <ElDialog
    v-model="dialogVisible"
    title="编辑字段 UI 配置"
    width="650px"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" label-width="120px" v-loading="loading">
      <ElDivider content-position="left">结构属性（由反射同步维护，只读）</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="字段名称">
            <ElInput :model-value="formData.name" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="字段类型">
            <ElInput :model-value="formData.fieldType" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="长度">
            <ElInputNumber :model-value="formData.length" disabled class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="关联表 ID">
            <ElInput :model-value="formData.tableId" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="8">
          <ElFormItem label="主键">
            <ElSwitch :model-value="formData.isKey" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="必填">
            <ElSwitch :model-value="formData.isRequired" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="自增">
            <ElSwitch :model-value="formData.isAutoAdd" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">UI 配置（可编辑）</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="排序权重" prop="orderNum">
            <ElInputNumber v-model="formData.orderNum" :min="0" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="控件类型" prop="htmlType">
            <ElSelect
              v-model="formData.htmlType"
              placeholder="请选择前端控件类型"
              clearable
              class="w-full"
            >
              <ElOption label="Input 输入框" value="Input" />
              <ElOption label="Select 下拉框" value="Select" />
              <ElOption label="DatePicker 日期选择" value="DatePicker" />
              <ElOption label="Textarea 文本域" value="Textarea" />
              <ElOption label="Switch 开关" value="Switch" />
              <ElOption label="Number 数字输入" value="Number" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="8">
          <ElFormItem label="查询字段">
            <ElSwitch v-model="formData.isQueryField" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="列表显示">
            <ElSwitch v-model="formData.isListDisplay" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="表单项">
            <ElSwitch v-model="formData.isFormItem" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElFormItem label="字段描述" prop="description">
        <ElInput
          v-model.trim="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入字段备注/说明"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    fieldData?: any
    defaultTableId?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const submitLoading = ref(false)
  const currentId = ref<string | null>(null)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()

  const formData = reactive<Record<string, any>>({
    id: '',
    name: '',
    description: '',
    orderNum: 0,
    length: 0,
    fieldType: '',
    tableId: '',
    isRequired: false,
    isKey: false,
    isAutoAdd: false,
    isPublic: false,
    isQueryField: false,
    isListDisplay: false,
    isFormItem: false,
    htmlType: ''
  })

  const initFormData = () => ({
    id: '',
    name: '',
    description: '',
    orderNum: 0,
    length: 0,
    fieldType: '',
    tableId: '',
    isRequired: false,
    isKey: false,
    isAutoAdd: false,
    isPublic: false,
    isQueryField: false,
    isListDisplay: false,
    isFormItem: false,
    htmlType: ''
  })

  /** Open dialog and load detail */
  const open = async (id: string) => {
    if (!id) {
      ElMessage.warning('缺少字段 ID')
      return
    }
    dialogVisible.value = true
    currentId.value = id
    loading.value = true
    try {
      const res = await CasbinApi.field.get(id)
      Object.assign(formData, {
        id: res.id || '',
        name: res.name || '',
        description: res.description || '',
        orderNum: res.orderNum ?? 0,
        length: res.length ?? 0,
        fieldType: res.fieldType || '',
        tableId: res.tableId || '',
        isRequired: res.isRequired ?? false,
        isKey: res.isKey ?? false,
        isAutoAdd: res.isAutoAdd ?? false,
        isPublic: res.isPublic ?? false,
        isQueryField: res.isQueryField ?? false,
        isListDisplay: res.isListDisplay ?? false,
        isFormItem: res.isFormItem ?? false,
        htmlType: res.htmlType || ''
      })
    } catch (e: any) {
      ElMessage.error(e.message || '获取字段详情失败')
      dialogVisible.value = false
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    Object.assign(formData, initFormData())
    currentId.value = null
  }

  /** Watch visible to load data when opening */
  watch(
    () => props.visible,
    (visible) => {
      if (visible && props.fieldData?.id) {
        open(props.fieldData.id)
      }
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          if (currentId.value) {
            const payload = { ...formData, id: currentId.value }
            await CasbinApi.field.update(currentId.value, payload)
            ElMessage.success('保存成功')
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error: any) {
          console.error('提交失败:', error)
          ElMessage.error(error.message || '保存失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }

  defineExpose({ open })
</script>

<style scoped>
  .w-full {
    width: 100%;
  }
</style>
