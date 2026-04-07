<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑供应商' : '新增供应商'"
    width="550px"
    destroy-on-close
    align-center
    class="custom-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="loading"
      class="mt-4 pr-6"
    >
      <el-form-item label="供应商名称" prop="name">
        <el-input v-model.trim="formData.name" 
          placeholder="请输入供应商名称 (如: OpenAI)" 
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="API终结点" prop="endpoint">
        <el-input v-model.trim="formData.endpoint" 
          placeholder="请输入API终结点URL" 
          maxlength="500"
        />
      </el-form-item>
      
      <el-form-item label="API Key" prop="apiKey">
        <el-input v-model.trim="formData.apiKey" 
          placeholder="请输入API Key" 
          show-password
          maxlength="500"
        />
      </el-form-item>

      <el-form-item label="额外URL" prop="extraUrl">
        <el-input v-model.trim="formData.extraUrl" 
          placeholder="请输入额外依赖的URL（选填）" 
          maxlength="500"
        />
      </el-form-item>

      <el-form-item label="排序权重" prop="orderNum">
        <el-input-number 
          v-model="formData.orderNum" 
          :min="0" 
          :max="9999" 
          controls-position="right"
          class="!w-40"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer flex justify-end gap-2">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { aiProvider } from '@/api/ai'

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const currentId = ref('')

const formRef = ref<FormInstance>()
const formData = reactive<Api.AiProvider.AiProviderUpdateInput>({
  name: '',
  endpoint: '',
  apiKey: '',
  extraUrl: '',
  orderNum: 0
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  endpoint: [
    { required: true, message: '请输入API终结点', trigger: 'blur' },
    { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' },
    { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
  ]
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    name: '',
    endpoint: '',
    apiKey: '',
    extraUrl: '',
    orderNum: 0
  })
  isEdit.value = false
  currentId.value = ''
}

const open = async (id?: string) => {
  resetForm()
  visible.value = true
  
  if (id) {
    isEdit.value = true
    currentId.value = id
    await fetchDetail(id)
  }
}

const fetchDetail = async (id: string) => {
  loading.value = true
  try {
    const res = await aiProvider.get(id)
    Object.assign(formData, {
      name: res.name || '',
      endpoint: res.endpoint || '',
      apiKey: res.apiKey || '',
      extraUrl: res.extraUrl || '',
      orderNum: res.orderNum || 0
    })
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败')
    visible.value = false
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await aiProvider.update(currentId.value, formData)
          ElMessage.success('更新成功')
        } else {
          await aiProvider.create(formData)
          ElMessage.success('创建成功')
        }
        visible.value = false
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        submitLoading.value = false
      }
    } else {
      console.log('Validation failed', fields)
    }
  })
}

defineExpose({
  open
})
</script>

<style scoped>
.custom-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}
.custom-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>

