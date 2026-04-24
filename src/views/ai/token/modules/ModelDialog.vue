<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑 Token' : '新增 Token'"
    width="500px"
    @closed="handleClosed"
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="Token 名称" prop="name">
        <el-input v-model.trim="formData.name" placeholder="请输入 Token 名称" />
      </el-form-item>
      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          type="datetime"
          placeholder="选择过期时间"
          value-format="YYYY-MM-DDTHH:mm:ss"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { FormInstance, FormRules, ElMessage } from 'element-plus'
  import { aiToken } from '@/api/ai'

  const emit = defineEmits(['success'])

  const visible = ref(false)
  const submitLoading = ref(false)
  const formRef = ref<FormInstance | null>(null)
  const currentId = ref<string | null>(null)

  const isEdit = computed(() => !!currentId.value)

  const defaultForm = () => ({
    name: '',
    expireTime: ''
  })

  const formData = reactive<any>(defaultForm())

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入Token名称', trigger: 'blur' }]
  }

  /**
   * 打开弹窗
   * @param row 如果存在 row，则为编辑模式
   */
  const open = (row?: Api.Token.TokenGetListOutputDto) => {
    visible.value = true
    if (row) {
      currentId.value = row.id
      formData.name = row.name
      formData.expireTime = row.expireTime || ''
    } else {
      currentId.value = null
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
            const updateData: Api.Token.TokenUpdateInput = {
              id: currentId.value,
              name: formData.name,
              expireTime: formData.expireTime || undefined
            }
            await aiToken.update(updateData)
            ElMessage.success('更新成功')
          } else {
            const createData: Api.Token.TokenCreateInput = {
              name: formData.name,
              expireTime: formData.expireTime || undefined
            }
            await aiToken.create(createData)
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
