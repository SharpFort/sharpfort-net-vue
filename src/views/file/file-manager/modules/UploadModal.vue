<template>
  <ElDialog
    v-model="visible"
    title="上传文件"
    width="550px"
    :close-on-click-modal="false"
    :before-close="handleBeforeClose"
    destroy-on-close
  >
    <div class="upload-container">
      <ElUpload
        drag
        action="#"
        :auto-upload="false"
        :http-request="customUpload"
        :limit="20"
        multiple
        v-model:file-list="fileList"
        ref="uploadRef"
        class="custom-upload"
      >
        <div class="el-upload__text">
          <h1 class="text-6xl text-blue-400 mb-3 flex justify-center">
            <ElIcon><UploadFilled /></ElIcon>
          </h1>
          <div class="text-base text-gray-500">
            将文件拖到此处，或
            <em class="text-blue-600 font-semibold cursor-pointer hover:underline">点击选择</em>
          </div>
        </div>
        <template #file="{ file }">
          <div
            class="custom-file-item flex flex-col w-full bg-slate-50 border border-gray-100 rounded-xl p-3 mb-3 hover:shadow-md transition-all group select-none"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 overflow-hidden flex-1">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center shrink-0 shadow-inner"
                >
                  <ElIcon class="text-xl"><Document /></ElIcon>
                </div>
                <div class="flex flex-col overflow-hidden w-full text-left">
                  <span class="text-sm font-semibold text-gray-700 truncate" :title="file.name">{{
                    file.name
                  }}</span>
                  <span class="text-xs text-gray-400 mt-0.5">{{ formatSize(file.size) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 pl-3 shrink-0">
                <span
                  v-if="file.status === 'success'"
                  class="text-green-500 text-sm flex items-center font-medium"
                  ><ElIcon class="mr-1 text-lg"><Select /></ElIcon>完成</span
                >
                <span
                  v-else-if="file.status === 'fail'"
                  class="text-red-500 text-sm flex items-center font-medium"
                  ><ElIcon class="mr-1 text-lg"><CloseBold /></ElIcon>失败</span
                >
                <ElButton
                  v-if="file.status !== 'success' && file.status !== 'uploading'"
                  type="danger"
                  link
                  @click.stop="handleRemove(file)"
                >
                  <ElIcon class="text-lg"><Delete /></ElIcon>
                </ElButton>
                <!-- Loading spinner for uploading -->
                <span
                  v-if="(file as any).isHashing"
                  class="text-amber-500 text-sm flex items-center"
                  ><ElIcon class="is-loading mr-1"><Loading /></ElIcon>安全校验中</span
                >
                <span
                  v-else-if="file.status === 'uploading'"
                  class="text-blue-500 text-sm flex items-center"
                  ><ElIcon class="is-loading mr-1"><Loading /></ElIcon>上传中</span
                >
              </div>
            </div>
            <!-- Progress bar using native transition -->
            <div
              class="mt-3 w-full"
              v-if="file.status === 'uploading' || (file.percentage && file.percentage > 0)"
            >
              <ElProgress
                :percentage="Math.floor(file.percentage || 0)"
                :status="
                  file.status === 'success' ? 'success' : file.status === 'fail' ? 'exception' : ''
                "
                :stroke-width="6"
                :show-text="false"
              />
            </div>
          </div>
        </template>
      </ElUpload>
    </div>
    <template #footer>
      <span class="dialog-footer flex justify-between items-center w-full">
        <span class="text-xs text-gray-500 font-medium">已选择 {{ fileList.length }} 个文件</span>
        <div>
          <ElButton class="!rounded-xl" @click="handleClose">取消</ElButton>
          <ElButton
            class="!rounded-xl"
            type="primary"
            :loading="isUploading"
            @click="submitUpload"
            :disabled="fileList.length === 0"
            >开始上传</ElButton
          >
        </div>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage, type UploadRequestOptions, type UploadUserFile } from 'element-plus'
  import { FileApi } from '@/api/file'
  import {
    Document,
    UploadFilled,
    Delete,
    Select,
    CloseBold,
    Loading
  } from '@element-plus/icons-vue'
  import CryptoJS from 'crypto-js'

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
  const fileList = ref<UploadUserFile[]>([])
  const isUploading = ref(false)

  const formatSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return ''
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleRemove = (file: UploadUserFile) => {
    if (uploadRef.value) {
      uploadRef.value.handleRemove(file)
    }
  }

  const submitUpload = async () => {
    if (fileList.value.length === 0) return
    isUploading.value = true
    try {
      uploadRef.value!.submit()
    } catch (err) {
      console.error(err)
      isUploading.value = false
    }
  }

  const checkUploadComplete = () => {
    const pending = fileList.value.filter((f) => f.status === 'ready' || f.status === 'uploading')
    if (pending.length === 0) {
      isUploading.value = false
      const failed = fileList.value.filter((f) => f.status === 'fail')
      if (failed.length === 0) {
        ElMessage.success('全部上传完成')
        emit('success') // Signal the parent to refresh pane ONLY once!
        setTimeout(() => {
          visible.value = false
          fileList.value = []
        }, 1000)
      } else {
        ElMessage.warning(`有 ${failed.length} 个文件上传失败`)
        emit('success') // Refresh anyway to show the completed ones
      }
    }
  }

  const calculateHash = (file: File, onProgress?: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const chunkSize = 5 * 1024 * 1024 // 5MB chunks
      const chunks = Math.ceil(file.size / chunkSize)
      let currentChunk = 0
      const sha256 = CryptoJS.algo.SHA256.create()
      const fileReader = new FileReader()

      fileReader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer
          const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer) as any)
          sha256.update(wordArray)

          currentChunk++
          if (onProgress) {
            onProgress(Math.floor((currentChunk / chunks) * 99))
          }

          if (currentChunk < chunks) {
            loadNext()
          } else {
            const hash = sha256.finalize().toString(CryptoJS.enc.Hex).toLowerCase()
            resolve(hash)
          }
        } catch (err) {
          reject(err)
        }
      }

      fileReader.onerror = (error) => reject(error)

      const loadNext = () => {
        const start = currentChunk * chunkSize
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(file.slice(start, end))
      }

      loadNext()
    })
  }

  const customUpload = async (options: UploadRequestOptions) => {
    const { file, onSuccess, onError, onProgress } = options
    const uploadedFile = fileList.value.find((f) => f.uid === (file as any).uid) as any

    if (uploadedFile) {
      uploadedFile.isHashing = true
      uploadedFile.percentage = 0
    }

    try {
      // 1. Calculate Hash (SHA-256)
      const hash = await calculateHash(file as File, (percent) => {
        if (uploadedFile) uploadedFile.percentage = percent
        onProgress({ percent } as any)
      })

      if (uploadedFile) {
        uploadedFile.isHashing = false
      }

      const directoryId = props.directoryId || '00000000-0000-0000-0000-000000000000'

      // 2. Verify Hash
      const verifyRes = await FileApi.file.verifyHash({ hash })

      if (verifyRes.canQuickUpload) {
        // Quick upload (秒传)
        await FileApi.file.quickUpload({
          hash,
          fileName: file.name,
          directoryId
        })
        onProgress({ percent: 100 } as any)
        onSuccess(true)
        if (uploadedFile) uploadedFile.percentage = 100
        checkUploadComplete()
        return
      }

      // 3. Normal upload if not found
      const formData = new FormData()
      formData.append('file', file)
      formData.append('hash', hash)

      // Fake progress for actual network request
      if (uploadedFile) uploadedFile.percentage = 0
      let progress = 0
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += Math.floor(Math.random() * 10) + 5
          if (progress > 90) progress = 90
          onProgress({ percent: progress } as any)
        }
      }, 250)

      await FileApi.file.upload(directoryId, formData)

      clearInterval(progressInterval)
      onProgress({ percent: 100 } as any)

      onSuccess(true)
      if (uploadedFile) {
        uploadedFile.percentage = 100
      }

      checkUploadComplete()
    } catch (err: any) {
      if (uploadedFile) uploadedFile.isHashing = false
      onError(err)
      checkUploadComplete()
    }
  }

  const handleBeforeClose = (done: () => void) => {
    if (isUploading.value) {
      ElMessage.warning('文件正在上传中，请耐心等待完成')
    } else {
      fileList.value = []
      done()
    }
  }

  const handleClose = () => {
    if (isUploading.value) {
      ElMessage.warning('文件正在上传中，请耐心等待完成')
      return
    }
    fileList.value = []
    visible.value = false
  }
</script>

<style scoped>
  .upload-container {
    padding: 20px 0;
  }

  /* 修复 Element Plus 默认样式导致的进度条重叠问题 */
  .custom-upload :deep(.el-upload-list__item .el-progress) {
    position: relative !important;
    top: unset !important;
    bottom: unset !important;
    width: 100% !important;
    margin: 8px 0 0 !important;
  }

  /* 移除 Element Plus 默认列表项的边框和内边距，以免与自定义卡片冲突 */
  .custom-upload :deep(.el-upload-list__item) {
    padding: 0 !important;
    margin-bottom: 0 !important;
    background: transparent !important;
    border: none !important;
    transition: none !important;
  }

  /* 悬停效果优化 */
  .custom-upload :deep(.el-upload-list__item:hover) {
    background: transparent !important;
  }
</style>
