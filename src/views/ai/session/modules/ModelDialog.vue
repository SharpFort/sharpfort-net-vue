<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑会话' : '创建会话'"
    width="500px"
    @closed="onClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="会话标题" prop="sessionTitle">
        <el-input v-model.trim="formData.sessionTitle" placeholder="请输入会话标题" maxlength="100" />
      </el-form-item>
      <el-form-item label="会话类型" prop="sessionType">
        <el-select v-model="formData.sessionType" placeholder="请选择类型" class="w-full">
          <el-option label="对话 (Chat)" value="Chat" />
          <el-option label="智能体 (Agent)" value="Agent" />
        </el-select>
      </el-form-item>
      <el-form-item label="会话内容" prop="sessionContent">
        <el-input v-model.trim="formData.sessionContent" type="textarea" :rows="4" placeholder="请输入会话内容" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="formData.remark" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { sessionApi } from '@/api/ai'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const emit = defineEmits(['success'])

const visible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const submitting = ref(false)
const currentId = ref('')

const formRef = ref<FormInstance>()
const formData = reactive<Api.Session.SessionCreateAndUpdateInput>({
  sessionTitle: '',
  sessionType: 'Chat',
  sessionContent: '',
  remark: ''
})

const rules = reactive<FormRules>({
  sessionTitle: [{ required: true, message: '请输入会话标题', trigger: 'blur' }],
  sessionType: [{ required: true, message: '请选择会话类型', trigger: 'change' }]
})

const open = async (id?: string) => {
  visible.value = true
  isEdit.value = !!id
  if (id) {
    currentId.value = id
    await fetchDetail(id)
  }
}

const fetchDetail = async (id: string) => {
  try {
    loading.value = true
    const res = await sessionApi.get(id)
    if (res) {
      formData.sessionTitle = res.sessionTitle || ''
      formData.sessionType = res.sessionType || 'Chat'
      formData.sessionContent = res.sessionContent || ''
      formData.remark = res.remark || ''
    }
  } catch {
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        if (isEdit.value) {
          await sessionApi.put(currentId.value, formData)
          ElMessage.success('更新成功')
        } else {
          await sessionApi.post(formData)
          ElMessage.success('创建成功')
        }
        visible.value = false
        emit('success')
      } catch {
        // 请求内部已包含错误处理
      } finally {
        submitting.value = false
      }
    }
  })
}

const onClosed = () => {
  formRef.value?.resetFields()
  formData.sessionTitle = ''
  formData.sessionType = 'Chat'
  formData.sessionContent = ''
  formData.remark = ''
  currentId.value = ''
}

defineExpose({
  open
})
</script>

