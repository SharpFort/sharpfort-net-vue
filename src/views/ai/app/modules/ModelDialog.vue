<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑AI应用' : '新增AI应用'"
    width="800px"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="150px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="应用名称" prop="name">
            <el-input v-model.trim="formData.name" placeholder="请输入应用名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="应用类型" prop="type">
            <el-input v-model.trim="formData.type" placeholder="如 Chat、Agent" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图标" prop="icon">
            <el-input v-model.trim="formData.icon" placeholder="图标URL或类名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="API调用秘钥" prop="secretKey">
            <el-input
              v-model.trim="formData.secretKey"
              type="password"
              show-password
              placeholder="对外API秘钥"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会话模型ID" prop="chatModelId">
            <el-input v-model.trim="formData.chatModelId" placeholder="选择会话模型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重排模型ID" prop="rerankModelId">
            <el-input v-model.trim="formData.rerankModelId" placeholder="选择重排模型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="知识库ID" prop="kmsId">
            <el-input v-model.trim="formData.kmsId" placeholder="选择知识库" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="提示词ID" prop="aiPromptId">
            <el-input v-model.trim="formData.aiPromptId" placeholder="选择提示词" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="温度" prop="temperature">
            <el-input-number v-model="formData.temperature" :min="10" :max="200" :step="1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="相似度阈值" prop="relevance">
            <el-input-number v-model="formData.relevance" :min="10" :max="100" :step="1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="消息类型" prop="msgType">
            <el-select v-model="formData.msgType" placeholder="选择消息类型" class="w-full">
              <el-option label="非流式文本" :value="1" />
              <el-option label="流式文本" :value="2" />
              <el-option label="图片" :value="3" />
              <el-option label="音频" :value="4" />
              <el-option label="视频" :value="5" />
              <el-option label="文件" :value="6" />
              <el-option label="链接" :value="7" />
              <el-option label="卡片" :value="8" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="提问最大Token" prop="maxAskPromptSize">
            <el-input-number v-model="formData.maxAskPromptSize" :min="1" :max="131072" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="回答最大Token" prop="answerTokens">
            <el-input-number v-model="formData.answerTokens" :min="1" :max="131072" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="向量匹配数" prop="maxMatchesCount">
            <el-input-number v-model="formData.maxMatchesCount" :min="1" :max="50" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Rerank数量" prop="rerankCount">
            <el-input-number v-model="formData.rerankCount" :min="1" :max="100" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最大重试次数" prop="maxRetries">
            <el-input-number v-model="formData.maxRetries" :min="0" :max="10" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="超时(分钟)" prop="networkTimeout">
            <el-input-number v-model="formData.networkTimeout" :min="1" :max="120" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="开启AI工具" prop="isAiTools">
            <el-switch v-model="formData.isAiTools" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="开启Skill" prop="isSkill">
            <el-switch v-model="formData.isSkill" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="开启日志" prop="isHttpLog">
            <el-switch v-model="formData.isHttpLog" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="应用描述" prop="describe">
            <el-input
              v-model.trim="formData.describe"
              type="textarea"
              :rows="3"
              placeholder="请输入应用描述"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { aiAppManagement } from '@/api/ai'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  const emit = defineEmits<{ success: [] }>()

  const visible = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const currentId = ref<string | null>(null)
  const formRef = ref<FormInstance>()

  const isEdit = computed(() => !!currentId.value)

  const getInitialData = (): Api.AiApp.AiAppDto => ({
    name: '',
    describe: null,
    icon: null,
    type: null,
    chatModelId: null,
    rerankModelId: null,
    temperature: 70,
    kmsId: null,
    secretKey: null,
    relevance: 60,
    maxAskPromptSize: 2048,
    maxMatchesCount: 3,
    rerankCount: 20,
    answerTokens: 2048,
    aiPromptId: null,
    aiPromptName: null,
    msgType: 2,
    isAiTools: false,
    isSkill: false,
    isHttpLog: false,
    maxRetries: 3,
    networkTimeout: 5
  })

  const formData = reactive(getInitialData())

  const rules: FormRules = {
    name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
  }

  const open = async (id?: string) => {
    visible.value = true
    if (id) {
      currentId.value = id
      loading.value = true
      try {
        const res = await aiAppManagement.get(id)
        Object.assign(formData, getInitialData(), res)
      } catch (e: any) {
        ElMessage.error(e.message || '获取详情失败')
        visible.value = false
      } finally {
        loading.value = false
      }
    } else {
      currentId.value = null
      Object.assign(formData, getInitialData())
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
          if (isEdit.value && currentId.value) {
            await aiAppManagement.update(currentId.value, formData as any)
            ElMessage.success('更新成功')
          } else {
            await aiAppManagement.create(formData as any)
            ElMessage.success('创建成功')
          }
          visible.value = false
          emit('success')
        } catch (e: any) {
          ElMessage.error(e.message || '操作失败')
        } finally {
          submitting.value = false
        }
      }
    })
  }

  defineExpose({ open })
</script>
