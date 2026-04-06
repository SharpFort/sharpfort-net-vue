<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑AI模型' : '新增AI模型'"
    width="680px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模型名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入模型名称" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型ID" prop="modelId">
            <el-input v-model="formData.modelId" placeholder="请输入模型ID" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理程序" prop="handlerName">
            <el-input v-model="formData.handlerName" placeholder="类名后缀" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商ID" prop="aiProviderId">
            <el-input v-model="formData.aiProviderId" placeholder="提供商的UUID格式" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分组名称" prop="providerName">
            <el-input v-model="formData.providerName" placeholder="如：OpenAI" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="isEnabled">
            <el-switch v-model="formData.isEnabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型类型" prop="modelType">
            <el-select v-model="formData.modelType" placeholder="请选择">
              <el-option label="文本生成(Chat)" :value="1" />
              <el-option label="绘图(Image)" :value="2" />
              <el-option label="嵌入(Embedding)" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="API类型" prop="modelApiType">
            <el-select v-model="formData.modelApiType" placeholder="请选择">
              <el-option label="默认配置" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="成本倍率" prop="multiplier">
            <el-input-number v-model="formData.multiplier" :min="0" :precision="2" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示倍率" prop="multiplierShow">
            <el-input-number v-model="formData.multiplierShow" :min="0" :precision="2" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="orderNum">
            <el-input-number v-model="formData.orderNum" :min="0" class="w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="图标URL" prop="iconUrl">
            <el-input v-model="formData.iconUrl" placeholder="图标的网络地址" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input v-model="formData.description" type="textarea" placeholder="模型的简单描述" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="额外JSON信息" prop="extraInfo">
            <el-input v-model="formData.extraInfo" type="textarea" :rows="3" placeholder='{"key":"value"}' />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { aiModel } from '@/api/ai'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const emit = defineEmits(['success'])

const visible = ref(false)
const isEdit = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const getInitialData = (): Api.AiModel.AiModelCreateInput & { id?: string } => ({
  handlerName: '',
  modelId: '',
  name: '',
  description: '',
  orderNum: 0,
  aiProviderId: '',
  extraInfo: '',
  modelType: 1,
  modelApiType: 1,
  multiplier: 1,
  multiplierShow: 1,
  providerName: '',
  iconUrl: '',
  isEnabled: true
})

const formData = reactive(getInitialData())

const rules: FormRules = {
  name: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelId: [{ required: true, message: '请输入模型ID', trigger: 'blur' }],
  handlerName: [{ required: true, message: '请输入处理程序', trigger: 'blur' }],
  aiProviderId: [{ required: true, message: '请输入供应商ID', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
  modelApiType: [{ required: true, message: '请选择API类型', trigger: 'change' }]
}

const open = async (id?: string) => {
  visible.value = true
  if (id) {
    isEdit.value = true
    try {
      const res = await aiModel.get(id)
      // 提取接口字段覆盖表单默认数据
      Object.assign(formData, res)
      formData.id = id
    } catch (e: any) {
      ElMessage.error(e.message || '获取模型详情失败')
    }
  } else {
    isEdit.value = false
    Object.assign(formData, getInitialData())
  }
}

const handleClosed = () => {
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  loading.value = true
  try {
    if (isEdit.value && formData.id) {
      await aiModel.put(formData.id, formData as Api.AiModel.AiModelUpdateInput)
      ElMessage.success('更新成功')
    } else {
      await aiModel.post(formData)
      ElMessage.success('创建成功')
    }
    visible.value = false
    emit('success')
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
