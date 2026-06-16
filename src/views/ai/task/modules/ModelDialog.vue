<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑AI任务' : '新增AI任务'"
    width="600px"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="任务名称" prop="name">
            <el-input
              v-model.trim="formData.name"
              placeholder="请输入唯一任务名称"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Cron表达式" prop="cronExpression">
            <el-input
              v-model.trim="formData.cronExpression"
              placeholder="如: 0 0 * * * (每小时的0分执行)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="任务内容" prop="content">
            <el-input
              v-model.trim="formData.content"
              type="textarea"
              :rows="6"
              placeholder="请输入任务的Prompt内容"
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
  import { aiTask } from '@/api/ai'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  const emit = defineEmits<{ success: [] }>()

  const visible = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const currentName = ref<string | null>(null)
  const formRef = ref<FormInstance>()

  const isEdit = computed(() => !!currentName.value)

  const getInitialData = (): Api.AiTask.AiTaskCreateUpdateInput => ({
    name: '',
    content: '',
    cronExpression: ''
  })

  const formData = reactive(getInitialData())

  const rules: FormRules = {
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    content: [{ required: true, message: '请输入任务内容', trigger: 'blur' }],
    cronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }]
  }

  const open = async (row?: Api.AiTask.AiTaskItem) => {
    visible.value = true
    if (row && row.name) {
      currentName.value = row.name
      formData.name = row.name
      formData.content = row.content || ''
      formData.cronExpression = row.cronExpression || ''
    } else {
      currentName.value = null
      Object.assign(formData, getInitialData())
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    Object.assign(formData, getInitialData())
    currentName.value = null
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          await aiTask.createOrUpdate({
            name: formData.name,
            content: formData.content,
            cronExpression: formData.cronExpression
          })
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
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
