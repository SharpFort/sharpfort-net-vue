<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加租户' : '编辑租户'"
    width="550px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <ElFormItem label="租户名称" prop="name" :error="fieldErrors.name">
        <ElInput v-model="formData.name" placeholder="请输入租户名称" />
      </ElFormItem>

      <ElFormItem label="数据库类型" prop="dbType" :error="fieldErrors.dbType">
        <ElSelect v-model="formData.dbType" placeholder="请选择数据库类型" class="w-full">
          <ElOption
            v-for="(label, value) in DB_TYPE_OPTIONS"
            :key="value"
            :label="label"
            :value="value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem
        label="连接字符串"
        prop="tenantConnectionString"
        :error="fieldErrors.tenantConnectionString"
      >
        <ElInput
          v-model="formData.tenantConnectionString"
          type="textarea"
          :rows="3"
          placeholder="请输入连接字符串（为空则使用默认数据库）"
        />
      </ElFormItem>

      <template v-if="dialogType === 'edit'">
        <ElFormItem label="实体版本" prop="entityVersion">
          <ElInput v-model="formData.entityVersion" disabled />
        </ElFormItem>
      </template>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { TenantApi, SqlSugar } from '@/api/tenant'

  interface Props {
    visible: boolean
    type: string
    tenantData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const submitLoading = ref(false)
  const fieldErrors = ref<Record<string, string>>({})

  const DB_TYPE_OPTIONS = SqlSugar.DbType

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    id: undefined as string | undefined,
    name: '',
    tenantConnectionString: '',
    dbType: SqlSugar.DbType.Sqlite,
    entityVersion: undefined as number | undefined
  })

  // 表单验证规则
  const rules: FormRules = {
    name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
    dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }]
  }

  /**
   * 初始化表单数据
   */
  const initFormData = async () => {
    fieldErrors.value = {}
    if (props.type === 'edit' && props.tenantData) {
      const id = props.tenantData.id
      try {
        const detail = await TenantApi.get(id)
        Object.assign(formData, {
          id: detail.id,
          name: detail.name,
          tenantConnectionString: detail.tenantConnectionString || '',
          dbType: detail.dbType,
          entityVersion: detail.entityVersion
        })
      } catch (error) {
        console.error('获取租户详情失败:', error)
      }
    } else {
      Object.assign(formData, {
        id: undefined,
        name: '',
        tenantConnectionString: '',
        dbType: SqlSugar.DbType.Sqlite,
        entityVersion: undefined
      })
    }
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  /**
   * 解析 ABP 验证错误
   */
  const parseValidationErrors = (error: any) => {
    const errors: Record<string, string> = {}
    // ABP 格式: error.data.error.validationErrors: [{ message: string, members: string[] }]
    const validationErrors = error.data?.error?.validationErrors || error.error?.validationErrors
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err: any) => {
        if (err.members && err.members.length > 0) {
          err.members.forEach((member: string) => {
            // 将首字母转为小写以匹配 formData 的 key
            const key = member.charAt(0).toLowerCase() + member.slice(1)
            errors[key] = err.message
          })
        }
      })
    }
    return errors
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return
    fieldErrors.value = {}

    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          if (dialogType.value === 'add') {
            await TenantApi.create(formData)
            ElMessage.success('添加成功')
          } else {
            await TenantApi.update(formData.id!, formData)
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error: any) {
          console.error('提交失败:', error)
          // 捕获并显示后端验证错误
          const errors = parseValidationErrors(error)
          if (Object.keys(errors).length > 0) {
            fieldErrors.value = errors
            ElMessage.error('表单验证失败，请检查输入')
          }
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>
