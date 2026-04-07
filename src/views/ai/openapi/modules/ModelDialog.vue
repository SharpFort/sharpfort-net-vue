<template>
  <el-dialog v-model="visible" title="Test Chat Completion" width="500px" destroy-on-close>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="Model" prop="model">
        <el-input v-model.trim="formData.model" disabled placeholder="e.g. gpt-3.5-turbo" />
      </el-form-item>
      <el-form-item label="Message" prop="content">
        <el-input v-model.trim="formData.content" type="textarea" :rows="4" placeholder="Enter your prompt" />
      </el-form-item>
      
      <el-form-item v-if="response" label="Response">
        <el-input v-model.trim="response" type="textarea" :rows="6" readonly />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">Send</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { openApi } from '@/api/openapi'

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const response = ref('')

const formData = reactive({
  model: '',
  content: 'Hello, testing OpenApi!',
})

const rules = reactive<FormRules>({
  model: [{ required: true, message: 'Model is required', trigger: 'blur' }],
  content: [{ required: true, message: 'Message is required', trigger: 'blur' }]
})

const open = (modelId: string) => {
  formData.model = modelId || ''
  formData.content = 'Hello, testing OpenApi!'
  response.value = ''
  visible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        response.value = ''
        const req: Api.OpenApi.ThorChatCompletionsRequest = {
          model: formData.model,
          messages: [
            {
              role: 'user', // ThorChatMessageRoleConst.User equivalent
              content: formData.content
            }
          ]
        }
        const res: any = await openApi.chatCompletions(req)
        response.value = JSON.stringify(res, null, 2)
        ElMessage.success('Chat completion requested successfully')
      } catch (error: any) {
        ElMessage.error(error.message || 'Execution failed')
      } finally {
        loading.value = false
      }
    }
  })
}

defineExpose({
  open
})
</script>

