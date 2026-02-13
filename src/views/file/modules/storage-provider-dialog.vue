<template>
  <ElDialog
    :title="form.id ? '编辑存储提供者' : '新增存储提供者'"
    v-model="dialogVisible"
    width="600px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入名称" />
      </ElFormItem>

      <ElFormItem label="类型" prop="providerType">
        <ElSelect
          v-model="form.providerType"
          placeholder="请选择类型"
          style="width: 100%"
          :disabled="!!form.id"
        >
          <ElOption label="本地存储" value="Local" />
          <ElOption label="S3 兼容" value="S3Compatible" />
          <ElOption label="阿里云 OSS" value="Aliyun" />
          <ElOption label="腾讯云 COS" value="TencentCloud" />
        </ElSelect>
      </ElFormItem>

      <template v-if="form.providerType !== 'Local'">
        <ElFormItem label="AccessKey" prop="accessKey">
          <ElInput v-model="form.accessKey" placeholder="请输入 AccessKey" />
        </ElFormItem>
        <ElFormItem label="SecretKey" prop="secretKey">
          <ElInput
            v-model="form.secretKey"
            type="password"
            show-password
            placeholder="请输入 SecretKey"
          />
        </ElFormItem>
        <ElFormItem label="Bucket名称" prop="bucketName">
          <ElInput v-model="form.bucketName" placeholder="请输入 Bucket 名称" />
        </ElFormItem>
        <ElFormItem label="Endpoint" prop="endpoint">
          <ElInput
            v-model="form.endpoint"
            placeholder="请输入 Endpoint (例如: oss-cn-hangzhou.aliyuncs.com)"
          />
        </ElFormItem>
        <ElFormItem label="Region" prop="region">
          <ElInput v-model="form.region" placeholder="请输入 Region (例如: cn-hangzhou)" />
        </ElFormItem>
        <ElFormItem label="自定义域名" prop="customDomain">
          <ElInput v-model="form.customDomain" placeholder="请输入自定义域名" />
        </ElFormItem>
        <ElFormItem label="启用 HTTPS" prop="isEnableHttps">
          <ElSwitch v-model="form.isEnableHttps" />
        </ElFormItem>
      </template>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { FileApi, type StorageProviderType } from '@/api/file'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    editData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  // We can use the interface from API or define a local one that matches
  const form = reactive({
    id: '',
    name: '',
    providerType: 'Local' as StorageProviderType,
    bucketName: '',
    accessKey: '',
    secretKey: '',
    endpoint: '',
    region: '',
    customDomain: '',
    isEnableHttps: true,
    remark: ''
  })

  // Basic validation rules
  const rules = reactive<FormRules>({
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    providerType: [{ required: true, message: '请选择类型', trigger: 'change' }],
    bucketName: [{ required: false, message: '请输入 Bucket 名称', trigger: 'blur' }] // Dynamic?
  })

  // Dynamic validation could be added but stick to basic for now

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        initForm()
      }
    }
  )

  const initForm = () => {
    if (props.editData && props.editData.id) {
      Object.assign(form, props.editData)
    } else {
      form.id = ''
      form.name = ''
      form.providerType = 'Local'
      form.bucketName = ''
      form.accessKey = ''
      form.secretKey = ''
      form.endpoint = ''
      form.region = ''
      form.customDomain = ''
      form.isEnableHttps = true
      form.remark = ''
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    form.id = ''
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          if (form.id) {
            await FileApi.storageProvider.update(form.id, form)
            ElMessage.success('更新成功')
          } else {
            await FileApi.storageProvider.create(form)
            ElMessage.success('创建成功')
          }
          emit('success')
          dialogVisible.value = false
        } catch (error) {
          console.error(error)
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>
