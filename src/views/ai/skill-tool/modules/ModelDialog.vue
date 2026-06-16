<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑技能/工具' : '新增技能/工具'"
    width="680px"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="名称" prop="name">
            <el-input
              v-model.trim="formData.name"
              placeholder="请输入技能/工具名称"
              maxlength="100"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型" prop="skillToolType">
            <el-select v-model="formData.skillToolType" placeholder="请选择类型" class="w-full">
              <el-option label="Tool (工具)" :value="0" />
              <el-option label="Skill (技能)" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类方法名" prop="classMethod">
            <el-input
              v-model.trim="formData.classMethod"
              placeholder="Tool类型时填写"
              maxlength="200"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否系统内置" prop="isSystem">
            <el-switch v-model="formData.isSystem" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否启用" prop="isEnabled">
            <el-switch v-model="formData.isEnabled" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input
              v-model.trim="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
              maxlength="500"
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
  import { aiSkillTool } from '@/api/ai'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

  const emit = defineEmits<{ success: [] }>()

  const visible = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const currentId = ref<string | null>(null)
  const formRef = ref<FormInstance>()

  const isEdit = computed(() => !!currentId.value)

  const getInitialData = (): Api.AiSkillTool.AiSkillToolDto => ({
    name: '',
    classMethod: null,
    description: null,
    isSystem: false,
    isEnabled: true,
    skillToolType: 0
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
        const res = await aiSkillTool.getList({ SkipCount: 0, MaxResultCount: 100 })
        const found = res.items?.find((item) => item.id === id)
        if (found) {
          Object.assign(formData, {
            name: found.name || '',
            classMethod: found.classMethod || null,
            description: found.description || null,
            isSystem: found.isSystem ?? false,
            isEnabled: found.isEnabled ?? true,
            skillToolType: found.skillToolType ?? 0
          })
        }
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
            await aiSkillTool.update(currentId.value, formData as any)
            ElMessage.success('更新成功')
          } else {
            await aiSkillTool.create(formData as any)
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
