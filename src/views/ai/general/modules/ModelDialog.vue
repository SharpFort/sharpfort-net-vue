<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑' : '新增'"
    width="680px"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="150px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="名称" prop="name">
            <el-input v-model.trim="formData.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型" prop="type">
            <el-input v-model.trim="formData.type" placeholder="应用类型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图标" prop="icon">
            <el-input v-model.trim="formData.icon" placeholder="图标URL" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="会话模型ID" prop="chatModelId">
            <el-input v-model.trim="formData.chatModelId" placeholder="选择模型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="知识库ID" prop="kmsId">
            <el-input v-model.trim="formData.kmsId" placeholder="选择知识库" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述" prop="describe">
            <el-input
              v-model.trim="formData.describe"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
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
  import { aiGeneral } from '@/api/ai'
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
    type: null,
    icon: null,
    chatModelId: null,
    kmsId: null,
    secretKey: null,
    aiPromptId: null,
    temperature: 70,
    isAiTools: false,
    isSkill: false,
    isHttpLog: false
  })

  const formData = reactive(getInitialData())

  const rules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }

  const open = async (id?: string) => {
    visible.value = true
    if (id) {
      currentId.value = id
      loading.value = true
      try {
        const res = await aiGeneral.get(id)
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
            await aiGeneral.update(currentId.value, formData as any)
            ElMessage.success('更新成功')
          } else {
            await aiGeneral.create(formData as any)
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
