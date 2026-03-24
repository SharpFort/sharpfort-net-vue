<template>
  <ElDialog
    v-model="visible"
    title="上传文件"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="upload-container">
      <ElUpload
        drag
        action="#"
        :http-request="customUpload"
        :limit="10"
        multiple
        :on-success="handleSuccess"
        :on-error="handleError"
        :show-file-list="true"
        ref="uploadRef"
      >
        <div class="el-upload__text">
          <h1 class="text-6xl text-primary mb-2">
            <i class="ri-upload-cloud-2-line"></i>
          </h1>
          <div class="text-sm"> 将文件拖到此处，或 <em class="text-primary">点击上传</em> </div>
        </div>
      </ElUpload>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage, type UploadRequestOptions } from 'element-plus'
  import { FileApi } from '@/api/file'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    directoryId: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const uploadRef = ref()

  const customUpload = async (options: UploadRequestOptions) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await FileApi.file.upload(props.directoryId || '00000000-0000-0000-0000-000000000000', formData)
      // res should be FileGetListOutputDto[]
      // We emit the first item (since we upload one by one here)
      if (Array.isArray(res) && res.length > 0) {
        const uploadedFile = res[0]
        // Merge with client side info since DTO is sparse
        const fileItem = {
          id: uploadedFile.id,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          creationTime: new Date().toISOString()
        }
        emit('success', fileItem)
      } else {
        emit('success') // Fallback
      }
      onSuccess(true)
    } catch (err: any) {
      onError(err)
    }
  }

  const handleSuccess = () => {
    ElMessage.success('上传成功')
    // emit('success'); // Removed, moved to customUpload
  }

  const handleError = (err: Error) => {
    console.error(err)
    ElMessage.error('上传失败')
  }

  const handleClose = () => {
    visible.value = false
  }
</script>

<style scoped>
  .upload-container {
    padding: 20px 0;
  }
</style>
