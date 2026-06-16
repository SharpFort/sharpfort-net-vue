<template>
  <el-dialog
    v-model="visible"
    title="编辑字段 UI 配置"
    width="650px"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" v-loading="loading">
      <el-divider content-position="left">结构属性（由反射同步维护，只读）</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="字段名称">
            <el-input :model-value="formData.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="字段类型">
            <el-input :model-value="formData.fieldType" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="长度">
            <el-input-number :model-value="formData.length" disabled class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属实体">
            <el-input :model-value="formData.tableName || '-'" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属模块">
            <el-input :model-value="formData.moduleName || '-'" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="主键">
            <el-switch :model-value="formData.isKey" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="必填">
            <el-switch :model-value="formData.isRequired" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="自增">
            <el-switch :model-value="formData.isAutoAdd" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="公共">
            <el-switch :model-value="formData.isPublic" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">UI 配置（可编辑）</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序权重" prop="orderNum">
            <el-input-number v-model="formData.orderNum" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="控件类型" prop="htmlType">
            <el-select
              v-model="formData.htmlType"
              placeholder="请选择前端控件类型"
              clearable
              class="w-full"
            >
              <el-option label="Input 输入框" value="Input" />
              <el-option label="Select 下拉框" value="Select" />
              <el-option label="DatePicker 日期选择" value="DatePicker" />
              <el-option label="Textarea 文本域" value="Textarea" />
              <el-option label="Switch 开关" value="Switch" />
              <el-option label="Number 数字输入" value="Number" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="查询字段">
            <el-switch v-model="formData.isQueryField" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="列表显示">
            <el-switch v-model="formData.isListDisplay" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="表单项">
            <el-switch v-model="formData.isFormItem" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="字段描述" prop="description">
        <el-input
          v-model.trim="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入字段备注/说明"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { CodeGenApi } from '@/api/code-gen'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  const emit = defineEmits<{ success: [] }>()

  const visible = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const currentId = ref<string | null>(null)
  const formRef = ref<FormInstance>()

  const getInitialData = () => ({
    id: '',
    name: '',
    description: '',
    orderNum: 0,
    length: 0,
    fieldType: '',
    tableId: '',
    tableName: '',
    moduleName: '',
    isRequired: false,
    isKey: false,
    isAutoAdd: false,
    isPublic: false,
    isQueryField: false,
    isListDisplay: false,
    isFormItem: false,
    htmlType: ''
  })

  const formData = reactive<Record<string, any>>(getInitialData())

  const rules: FormRules = {
    htmlType: [{ required: true, message: '请选择控件类型', trigger: 'change' }]
  }

  const open = async (id?: string) => {
    if (!id) {
      ElMessage.warning('缺少字段 ID')
      return
    }
    visible.value = true
    currentId.value = id
    loading.value = true
    try {
      const res = await CodeGenApi.field.get(id)
      Object.assign(formData, {
        id: res.id || '',
        name: res.name || '',
        description: res.description || '',
        orderNum: res.orderNum ?? 0,
        length: res.length ?? 0,
        fieldType: res.fieldType || '',
        tableId: res.tableId || '',
        tableName: res.tableName || '',
        moduleName: res.moduleName || '',
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
      visible.value = false
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    Object.assign(formData, getInitialData())
    currentId.value = null
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          if (currentId.value) {
            // 构造更新 payload：只提交 UI 配置字段 + 必要 ID
            const payload: Api.CodeGen.FieldDto = {
              id: currentId.value,
              name: formData.name,
              description: formData.description,
              orderNum: formData.orderNum,
              length: formData.length,
              fieldType: formData.fieldType,
              tableId: formData.tableId,
              tableName: formData.tableName,
              moduleName: formData.moduleName,
              isRequired: formData.isRequired,
              isKey: formData.isKey,
              isAutoAdd: formData.isAutoAdd,
              isPublic: formData.isPublic,
              isQueryField: formData.isQueryField,
              isListDisplay: formData.isListDisplay,
              isFormItem: formData.isFormItem,
              htmlType: formData.htmlType
            }
            await CodeGenApi.field.update(currentId.value, payload)
            ElMessage.success('保存成功')
          }
          visible.value = false
          emit('success')
        } catch (e: any) {
          ElMessage.error(e.message || '保存失败')
        } finally {
          submitting.value = false
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
