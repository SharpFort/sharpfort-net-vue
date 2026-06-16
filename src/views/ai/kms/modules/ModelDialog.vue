<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑知识库' : '新增知识库'"
    width="680px"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="知识库名称" prop="name">
            <el-input v-model.trim="formData.name" placeholder="请输入知识库名称" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="每段落最大Token数" prop="maxTokensPerParagraph">
            <el-input-number v-model="formData.maxTokensPerParagraph" :min="1" :max="4096" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="每行最大Token数" prop="maxTokensPerLine">
            <el-input-number v-model="formData.maxTokensPerLine" :min="1" :max="4096" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重叠Token数" prop="overlappingTokens">
            <el-input-number v-model="formData.overlappingTokens" :min="0" :max="2048" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="矢量化模型ID" prop="aiModelId">
            <el-input v-model.trim="formData.aiModelId" placeholder="选择或输入模型ID" />
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
  import { aiKms } from '@/api/ai'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  const emit = defineEmits<{ success: [] }>()

  const visible = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const currentId = ref<string | null>(null)
  const formRef = ref<FormInstance>()

  const isEdit = computed(() => !!currentId.value)

  const getInitialData = (): Api.AiKms.AiKmsDto => ({
    name: '',
    maxTokensPerParagraph: 299,
    maxTokensPerLine: 99,
    overlappingTokens: 49,
    aiModelId: null
  })

  const formData = reactive(getInitialData())

  const rules: FormRules = {
    name: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }]
  }

  const open = async (id?: string) => {
    visible.value = true
    if (id) {
      currentId.value = id
      loading.value = true
      try {
        const res = await aiKms.get(id)
        Object.assign(formData, {
          name: res.name || '',
          maxTokensPerParagraph: res.maxTokensPerParagraph ?? 299,
          maxTokensPerLine: res.maxTokensPerLine ?? 99,
          overlappingTokens: res.overlappingTokens ?? 49,
          aiModelId: res.aiModelId || null
        })
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
            await aiKms.update(currentId.value, formData as any)
            ElMessage.success('更新成功')
          } else {
            await aiKms.create(formData as any)
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
