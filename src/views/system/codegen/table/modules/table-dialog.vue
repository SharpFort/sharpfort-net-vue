<template>
  <ElDialog
    v-model="dialogVisible"
    title="编辑实体注册表配置"
    width="600px"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" label-width="120px" v-loading="loading">
      <ElDivider content-position="left">结构属性（由反射同步维护，只读）</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="实体类名">
            <ElInput :model-value="formData.name" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="物理表名">
            <ElInput :model-value="formData.physicalTableName" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="最后同步时间">
            <ElInput :model-value="formatTime(formData.lastSyncTime)" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="最后生成时间">
            <ElInput :model-value="formatTime(formData.lastBuildTime)" disabled />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">生成配置（可编辑）</ElDivider>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="所属模块" prop="moduleName">
            <ElInput v-model.trim="formData.moduleName" placeholder="目标模块名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="所属项目" prop="projectName">
            <ElInput v-model.trim="formData.projectName" placeholder="目标项目名称" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElFormItem label="根命名空间" prop="rootNamespace">
        <ElInput v-model.trim="formData.rootNamespace" placeholder="解决方案命名空间" />
      </ElFormItem>
      <ElFormItem label="实体描述" prop="description">
        <ElInput
          v-model.trim="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入实体描述/备注"
        />
      </ElFormItem>
      <ElFormItem label="覆盖已有文件" prop="isOverwrite">
        <ElSwitch v-model="formData.isOverwrite" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { ElMessage, type FormInstance } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'
  import dayjs from 'dayjs'

  interface Props {
    visible: boolean
    tableData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const submitLoading = ref(false)

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

  const formatTime = (time?: string | null) => {
    if (!time) return '-'
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  const loadDetail = async () => {
    if (!props.tableData?.id) return
    loading.value = true
    try {
      const detail = await CasbinApi.table.get(props.tableData.id)
      Object.assign(formData, {
        id: detail.id || '',
        name: detail.name || '',
        physicalTableName: detail.physicalTableName || '',
        description: detail.description || '',
        moduleName: detail.moduleName || '',
        rootNamespace: detail.rootNamespace || '',
        isOverwrite: detail.isOverwrite ?? false,
        projectName: detail.projectName || '',
        lastSyncTime: detail.lastSyncTime || '',
        lastBuildTime: detail.lastBuildTime || ''
      })
    } catch (e: any) {
      ElMessage.error(e.message || '获取实体详情失败')
      dialogVisible.value = false
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        if (props.tableData?.id) {
          loadDetail()
        } else {
          Object.assign(formData, getInitialData())
        }
      }
    }
  )

  const handleClosed = () => {
    formRef.value?.resetFields()
    Object.assign(formData, getInitialData())
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          if (formData.id) {
            await CasbinApi.table.update(formData.id, formData)
            ElMessage.success('更新成功')
            dialogVisible.value = false
            emit('submit')
          }
        } catch (error: any) {
          console.error('提交失败:', error)
          ElMessage.error(error.message || '保存失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>
