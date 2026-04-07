<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑提示词' : '新增提示词'"
    width="550px"
    destroy-on-close
    append-to-body
    class="custom-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loadingData"
      class="mt-4"
    >
      <el-form-item label="提示词编码" prop="code">
        <el-input v-model.trim="formData.code" 
          placeholder="请输入唯一编码标识 (例如: sys-greeting)" 
          maxlength="100" 
          show-word-limit 
        />
      </el-form-item>
      
      <el-form-item label="默认可用模型" prop="defaultModelId">
        <el-select 
          v-model="formData.defaultModelId" 
          placeholder="请选择绑定的默认 AI 模型 (可选)" 
          clearable 
          class="w-full"
        >
          <el-option
            v-for="model in aiModels"
            :key="model.id"
            :label="model.name"
            :value="model.id"
          >
            <div class="flex justify-between items-center w-full">
              <span>{{ model.name }}</span>
              <span class="text-xs text-slate-400">{{ model.providerName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="提示词内容" prop="content">
        <el-input v-model.trim="formData.content"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="请输入核心 Prompt 系统提示词内容..."
        />
      </el-form-item>

      <el-form-item label="描述备注" prop="description">
        <el-input v-model.trim="formData.description"
          type="textarea"
          :rows="2"
          placeholder="关于该提示词适用的场景描述 (可选)"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          <el-icon class="mr-1"><Check /></el-icon> 确认保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { aiPrompt, aiImage } from '@/api/ai'

const emit = defineEmits(['success'])

const visible = ref(false)
const submitLoading = ref(false)
const loadingData = ref(false)
const formRef = ref<FormInstance>()

const aiModels = ref<Api.AiModel.AiModelDto[]>([])
const activeId = ref<string>('')
const isEdit = computed(() => !!activeId.value)

const formData = reactive<Api.AiPrompt.AiPromptCreateInput | Api.AiPrompt.AiPromptUpdateInput>({
  code: '',
  content: '',
  description: '',
  defaultModelId: ''
})

const formRules = reactive<FormRules>({
  code: [
    { required: true, message: '请输入提示词编码', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入提示词内容', trigger: 'blur' }
  ]
})

const resetForm = () => {
  formData.code = ''
  formData.content = ''
  formData.description = ''
  formData.defaultModelId = ''
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

const fetchModels = async () => {
  if (aiModels.value.length > 0) return
  try {
    const res = await aiImage.getModels()
    aiModels.value = res || []
  } catch (error) {
    console.error('Failed to parse models', error)
  }
}

const open = async (id?: string) => {
  activeId.value = id || ''
  resetForm()
  visible.value = true
  
  // Concurrently fetch dictionary data if needed
  fetchModels()

  if (activeId.value) {
    loadingData.value = true
    try {
      const res = await aiPrompt.get(activeId.value)
      formData.code = res.code || ''
      formData.content = res.content || ''
      formData.description = res.description || ''
      formData.defaultModelId = res.defaultModelId || ''
    } catch (err: any) {
      ElMessage.error(err.message || '获取数据失败')
      visible.value = false
    } finally {
      loadingData.value = false
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await aiPrompt.update(activeId.value, formData)
          ElMessage.success('更新成功')
        } else {
          await aiPrompt.create(formData as Api.AiPrompt.AiPromptCreateInput)
          ElMessage.success('创建成功')
        }
        visible.value = false
        emit('success')
      } catch (err: any) {
        ElMessage.error(err.message || (isEdit.value ? '更新失败' : '创建失败'))
      } finally {
        submitLoading.value = false
      }
    }
  })
}

defineExpose({ open })
</script>



