<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑实体注册表配置"
    width="600px"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-divider content-position="left">结构属性（由反射同步维护，只读）</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="实体类名">
            <el-input :model-value="formData.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物理表名">
            <el-input :model-value="formData.physicalTableName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最后同步时间">
            <el-input :model-value="formatTime(formData.lastSyncTime)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最后生成时间">
            <el-input :model-value="formatTime(formData.lastBuildTime)" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">生成配置（可编辑）</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属模块" prop="moduleName">
            <el-input v-model.trim="formData.moduleName" placeholder="目标模块名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属项目" prop="projectName">
            <el-input v-model.trim="formData.projectName" placeholder="目标项目名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="根命名空间" prop="rootNamespace">
        <el-input v-model.trim="formData.rootNamespace" placeholder="解决方案命名空间" />
      </el-form-item>
      <el-form-item label="实体描述" prop="description">
        <el-input
          v-model.trim="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入实体描述/备注"
        />
      </el-form-item>
      <el-form-item label="覆盖已有文件" prop="isOverwrite">
        <el-switch v-model="formData.isOverwrite" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { CodeGenApi } from '@/api/code-gen'
  import dayjs from 'dayjs'

  interface Props {
    visible: boolean
    tableData?: Partial<Api.CodeGen.TableDto>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const submitting = ref(false)
  const fieldErrors = ref<Record<string, string>>({})

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()

  const getInitialData = () => ({
    id: '',
    name: '',
    physicalTableName: '',
    description: '',
    moduleName: '',
    rootNamespace: '',
    isOverwrite: false,
    projectName: '',
    lastSyncTime: '',
    lastBuildTime: ''
  })

  const formData = reactive<Record<string, any>>(getInitialData())

  const rules: FormRules = {}

  const formatTime = (time?: string | null) => {
    if (!time) return '-'
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  /** 从已有数据填充表单（列表行数据已含所有字段，跳过 GET） */
  const populateFromProps = () => {
    const d = props.tableData
    Object.assign(formData, {
      id: d?.id || '',
      name: d?.name || '',
      physicalTableName: d?.physicalTableName || '',
      description: d?.description || '',
      moduleName: d?.moduleName || '',
      rootNamespace: d?.rootNamespace || '',
      isOverwrite: d?.isOverwrite ?? false,
      projectName: d?.projectName || '',
      lastSyncTime: d?.lastSyncTime || '',
      lastBuildTime: d?.lastBuildTime || ''
    })
  }

  /** 监听弹窗打开 */
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        if (props.tableData?.id) {
          populateFromProps()
        } else {
          Object.assign(formData, getInitialData())
        }
      }
    }
  )

  const handleClosed = () => {
    formRef.value?.resetFields()
    Object.assign(formData, getInitialData())
    fieldErrors.value = {}
  }

  /** 解析 ABP 验证错误 */
  const parseValidationErrors = (error: any) => {
    const errors: Record<string, string> = {}
    const validationErrors = error.data?.error?.validationErrors || error.error?.validationErrors
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err: any) => {
        if (err.members && err.members.length > 0) {
          err.members.forEach((member: string) => {
            const key = member.charAt(0).toLowerCase() + member.slice(1)
            errors[key] = err.message
          })
        }
      })
    }
    return errors
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    fieldErrors.value = {}

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          if (formData.id) {
            await CodeGenApi.table.update(formData.id, formData as any)
            ElMessage.success('更新成功')
            dialogVisible.value = false
            emit('submit')
          }
        } catch (error: any) {
          const errors = parseValidationErrors(error)
          if (Object.keys(errors).length > 0) {
            fieldErrors.value = errors
            ElMessage.error('表单验证失败，请检查输入')
          } else {
            ElMessage.error(error.message || '保存失败')
          }
        } finally {
          submitting.value = false
        }
      }
    })
  }
</script>
