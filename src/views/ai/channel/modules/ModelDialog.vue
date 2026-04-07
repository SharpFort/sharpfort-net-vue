<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑应用' : '新增应用'"
    width="500px"
    @closed="handleClosed"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="应用名称" prop="name">
        <el-input v-model.trim="formData.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="API端点" prop="endpoint">
        <el-input v-model.trim="formData.endpoint" placeholder="请输入API端点，如 https://api.openai.com/v1" />
      </el-form-item>
      <el-form-item label="扩展URL" prop="extraUrl">
        <el-input v-model.trim="formData.extraUrl" placeholder="非必填" />
      </el-form-item>
      <el-form-item label="API Key" prop="apiKey">
        <el-input v-model.trim="formData.apiKey" placeholder="请输入API Key" type="password" show-password />
      </el-form-item>
      <el-form-item label="排序号" prop="orderNum">
        <el-input-number v-model="formData.orderNum" :min="0" :max="99999" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'
import { FormInstance, FormRules, ElMessage } from 'element-plus'
import { aiApp } from '@/api/channel'

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance | null>(null)
const currentId = ref<string | null>(null)

const isEdit = computed(() => !!currentId.value)

const defaultForm = (): Api.Channel.AiAppCreateInput => ({
  name: '',
  endpoint: '',
  extraUrl: '',
  apiKey: '',
  orderNum: 0
})

const formData = reactive<Api.Channel.AiAppCreateInput & { id?: string }>(defaultForm())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  endpoint: [{ required: false, message: '请输入API端点', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入API Key', trigger: 'blur' }]
}

/**
 * 打开弹窗
 * @param id 如果存在 id，则为编辑模式
 */
const open = async (id?: string) => {
  visible.value = true
  currentId.value = id || null
  if (id) {
    loading.value = true
    try {
      const res = await aiApp.get(id)
      Object.assign(formData, res)
    } catch (e: any) {
      ElMessage.error(e.message || '获取详情失败')
      visible.value = false
    } finally {
      loading.value = false
    }
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value && currentId.value) {
          await aiApp.update(currentId.value, formData as Api.Channel.AiAppUpdateInput)
          ElMessage.success('更新成功')
        } else {
          await aiApp.create(formData as Api.Channel.AiAppCreateInput)
          ElMessage.success('创建成功')
        }
        visible.value = false
        emit('success')
      } catch (e: any) {
        ElMessage.error(e.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

/**
 * 弹窗关闭后清理表单
 */
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, defaultForm())
  currentId.value = null
}

defineExpose({
  open
})
</script>

