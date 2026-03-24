<template>
  <div class="h-full flex flex-col p-4 bg-white rounded shadow-sm">
    <!-- Filter Bar -->
    <div class="filter-container mb-4 flex gap-4 items-center">
      <ElInput
        v-model="queryParams.name"
        placeholder="搜索配置名称"
        clearable
        class="w-48"
        @keyup.enter="handleSearch"
      />
      <ElSelect
        v-model="queryParams.providerType"
        placeholder="请选择存储类型"
        clearable
        class="w-48"
        @change="handleSearch"
      >
        <ElOption label="本地存储 (Local)" value="Local" />
        <ElOption label="亚马逊 (S3Compatible)" value="S3Compatible" />
        <ElOption label="阿里云 (Aliyun)" value="Aliyun" />
        <ElOption label="腾讯云 (TencentCloud)" value="TencentCloud" />
      </ElSelect>
      <ElSelect
        v-model="queryParams.isEnabled"
        placeholder="状态"
        clearable
        class="w-48"
        @change="handleSearch"
      >
        <ElOption label="启用" :value="true" />
        <ElOption label="禁用" :value="false" />
      </ElSelect>
      <ElButton type="primary" icon="search" @click="handleSearch">查询</ElButton>
      <ElButton icon="refresh" @click="resetQuery">重置</ElButton>
    </div>

    <!-- Action Bar -->
    <div class="mb-4">
      <ElButton type="primary" icon="plus" @click="openForm(null)">新增</ElButton>
      <ElButton
        type="danger"
        icon="delete"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </ElButton>
    </div>

    <!-- Table -->
    <ElTable
      v-loading="loading"
      :data="tableData"
      class="flex-1 w-full"
      border
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <ElTableColumn type="selection" width="50" align="center" />
      <ElTableColumn prop="name" label="配置名称" show-overflow-tooltip min-width="150" />
      <ElTableColumn prop="providerType" label="存储类型" width="150">
        <template #default="{ row }">
          <ElTag :type="getProviderTag(row.providerType)">{{ row.providerType }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="bucketName" label="存储桶/空间名称" show-overflow-tooltip min-width="150" />
      <ElTableColumn prop="endpoint" label="访问节点(Endpoint)" show-overflow-tooltip min-width="150" />
      <ElTableColumn prop="isDefault" label="是否默认" width="90" align="center">
        <template #default="{ row }">
          <ElTag v-if="row.isDefault" type="success" effect="dark" size="small">默认</ElTag>
          <span v-else class="text-g-400">-</span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="isEnabled" label="状态" width="80" align="center">
        <template #default="{ row }">
          <ElTag :type="row.isEnabled ? 'success' : 'info'">
            {{ row.isEnabled ? '启用' : '禁用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="creationTime" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.creationTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="220" fixed="right" align="center">
        <template #default="{ row }">
          <ElButton
            link
            type="primary"
            icon="star"
            v-if="!row.isDefault && row.isEnabled"
            @click="handleSetDefault(row)"
          >
            设为默认
          </ElButton>
          <ElButton link type="primary" icon="edit" @click="openForm(row)"> 编辑 </ElButton>
          <ElButton link type="danger" icon="delete" @click="handleDelete(row)"> 删除 </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- Pagination -->
    <div class="mt-4 flex justify-end">
      <ElPagination
        v-model:current-page="queryParams.skipCount"
        v-model:page-size="queryParams.maxResultCount"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="loadData"
      />
    </div>

    <!-- Form Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑存储配置' : '新增存储配置'"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <ElFormItem label="配置名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入配置名称" />
        </ElFormItem>
        <ElFormItem label="存储类型" prop="providerType">
          <ElSelect
            v-model="formData.providerType"
            placeholder="请选择类型"
            class="w-full"
            :disabled="isEdit"
          >
            <ElOption label="本地存储 (Local)" value="Local" />
            <ElOption label="亚马逊 S3 兼容 (S3Compatible)" value="S3Compatible" />
            <ElOption label="阿里云 OSS (Aliyun)" value="Aliyun" />
            <ElOption label="腾讯云 COS (TencentCloud)" value="TencentCloud" />
          </ElSelect>
        </ElFormItem>
        
        <template v-if="formData.providerType !== 'Local'">
          <ElFormItem label="访问凭证(AK)" prop="accessKey">
            <ElInput v-model="formData.accessKey" placeholder="AccessKey ID" />
          </ElFormItem>
          <ElFormItem label="安全凭证(SK)" prop="secretKey">
            <ElInput
              v-model="formData.secretKey"
              type="password"
              show-password
              placeholder="SecretKey (部分接口返回时不展示)"
            />
          </ElFormItem>
          <ElFormItem label="存储桶(Bucket)" prop="bucketName">
            <ElInput v-model="formData.bucketName" placeholder="Bucket Name" />
          </ElFormItem>
          <ElFormItem label="节点(Endpoint)" prop="endpoint">
            <ElInput v-model="formData.endpoint" placeholder="Endpoint" />
          </ElFormItem>
          <ElFormItem label="地域(Region)" prop="region">
            <ElInput v-model="formData.region" placeholder="Region (选填)" />
          </ElFormItem>
        </template>
        <!-- For local it might use endpoint for local base url, bucket for base path -->
        <template v-else>
          <ElFormItem label="存储根路径" prop="bucketName" :required="true">
            <ElInput v-model="formData.bucketName" placeholder="如 D:\Uploads 或 /var/uploads" />
            <div class="text-xs text-g-400 mt-1">本地存储使用 BucketName 作为存储绝对路径</div>
          </ElFormItem>
          <ElFormItem label="外部访问前缀" prop="endpoint">
            <ElInput v-model="formData.endpoint" placeholder="如 http://localhost:5000/files" />
          </ElFormItem>
        </template>
        
        <ElFormItem label="自定义域名" prop="customDomain">
          <ElInput v-model="formData.customDomain" placeholder="CDN 或自定义访问域名 (选填)" />
        </ElFormItem>
        <ElFormItem label="启用 HTTPS" prop="isEnableHttps">
          <ElSwitch v-model="formData.isEnableHttps" />
        </ElFormItem>
        <ElFormItem label="备注说明" prop="remark">
          <ElInput v-model="formData.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { FileApi, type FileStorageProviderGetListOutputDto, type FileStorageProviderCreateInput, type FileStorageProviderUpdateInput } from '@/api/file'
import type { StorageProviderType } from '@/api/file'
import dayjs from 'dayjs'

defineOptions({ name: 'FileStorageProviderAdmin' })

// Data
const loading = ref(false)
const tableData = ref<FileStorageProviderGetListOutputDto[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

// Query params
const queryParams = reactive({
  name: '',
  providerType: undefined as StorageProviderType | undefined,
  isEnabled: undefined as boolean | undefined,
  skipCount: 1, // Will map to 0-based for API
  maxResultCount: 20
})

// Dialog
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const currentId = ref<string | null>(null)

const formRef = ref<FormInstance>()
const formData = reactive<FileStorageProviderCreateInput & FileStorageProviderUpdateInput>({
  name: '',
  providerType: 'Local' as StorageProviderType,
  bucketName: '',
  accessKey: '',
  secretKey: '',
  endpoint: '',
  region: '',
  customDomain: '',
  isEnableHttps: false,
  remark: ''
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  providerType: [{ required: true, message: '请选择存储类型', trigger: 'change' }]
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await FileApi.storageProvider.getList({
      ...queryParams,
      // Convert typical 1-based UI `skipCount` concept to actual skipped items for API
      skipCount: (queryParams.skipCount - 1) * queryParams.maxResultCount
    })
    tableData.value = res.items
    total.value = res.totalCount
  } catch (error) {
    console.error('Failed to load table', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.skipCount = 1
  loadData()
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.providerType = undefined
  queryParams.isEnabled = undefined
  handleSearch()
}

const handleSelectionChange = (selection: FileStorageProviderGetListOutputDto[]) => {
  selectedIds.value = selection.map(row => row.id!)
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm('确认删除所选的存储配置吗？', '提示', { type: 'warning' })
    await FileApi.storageProvider.del(selectedIds.value)
    ElMessage.success('批量删除成功')
    loadData()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleDelete = async (row: FileStorageProviderGetListOutputDto) => {
  try {
    await ElMessageBox.confirm(`确认删除配置 "${row.name}" 吗？`, '提示', { type: 'warning' })
    await FileApi.storageProvider.del([row.id!])
    ElMessage.success('删除成功')
    loadData()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleSetDefault = async (row: FileStorageProviderGetListOutputDto) => {
  try {
    await FileApi.storageProvider.setDefault(row.id!)
    ElMessage.success('已应用为默认存储策略')
    loadData()
  } catch (err) {
    ElMessage.error('设置失败')
  }
}

const openForm = async (row: FileStorageProviderGetListOutputDto | null) => {
  isEdit.value = !!row
  dialogVisible.value = true
  
  if (formRef.value) formRef.value.clearValidate()

  if (row) {
    currentId.value = row.id!
    submitLoading.value = true
    try {
      const detail = await FileApi.storageProvider.get(row.id!)
      Object.assign(formData, {
        name: detail.name || '',
        providerType: detail.providerType || 'Local',
        bucketName: detail.bucketName || '',
        accessKey: detail.accessKey || '',
        secretKey: '', // Usually omitted from output side for security
        endpoint: detail.endpoint || '',
        region: detail.region || '',
        customDomain: detail.customDomain || '',
        isEnableHttps: !!detail.isEnableHttps,
        remark: detail.remark || ''
      })
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      submitLoading.value = false
    }
  } else {
    currentId.value = null
    Object.assign(formData, {
      name: '',
      providerType: 'Local',
      bucketName: '',
      accessKey: '',
      secretKey: '',
      endpoint: '',
      region: '',
      customDomain: '',
      isEnableHttps: false,
      remark: ''
    })
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value && currentId.value) {
          const updateDto: FileStorageProviderUpdateInput = { ...formData }
          // Don't send empty secret key so it won't overwrite with blank
          if (!updateDto.secretKey) delete updateDto.secretKey
          await FileApi.storageProvider.update(currentId.value, updateDto)
          ElMessage.success('更新成功')
        } else {
          await FileApi.storageProvider.create(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (err) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const getProviderTag = (type?: StorageProviderType) => {
  switch (type) {
    case 'Local': return 'info'
    case 'Aliyun': return 'primary'
    case 'TencentCloud': return 'success'
    case 'S3Compatible': return 'warning'
    default: return ''
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Scoped overrides if needed */
</style>
