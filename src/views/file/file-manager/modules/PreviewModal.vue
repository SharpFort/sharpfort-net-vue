<template>
  <ElDialog
    v-model="visible"
    title="文件预览"
    width="800px"
    destroy-on-close
    @close="handleClose"
    align-center
  >
    <div v-loading="loading" class="preview-container flex-c justify-center min-h-[400px]">
      <div v-if="error" class="text-center">
        <h1 class="text-8xl text-g-300 mb-4"><i class="ri-file-search-line"></i></h1>
        <p class="text-g-500">无法预览此文件</p>
      </div>

      <img
        v-else-if="imageUrl"
        :src="imageUrl"
        class="max-w-full max-h-[600px] object-contain shadow-sm rounded"
        alt="Preview"
      />

      <div v-else class="text-center">
        <h1 class="text-8xl text-primary mb-4"><i class="ri-file-text-line"></i></h1>
        <p class="text-g-500 mb-4">此文件类型不支持在线预览</p>
        <ElButton type="primary" @click="downloadFile">下载文件</ElButton>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { FileApi } from '@/api/file'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    fileId: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['update:modelValue'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const error = ref(false)
  const imageUrl = ref('')

  const loadFile = async () => {
    if (!props.fileId) return

    loading.value = true
    error.value = false
    imageUrl.value = ''

    try {
      const blob = await FileApi.file.download(props.fileId)
      if (blob.type.startsWith('image/')) {
        imageUrl.value = URL.createObjectURL(blob)
      } else {
        // Not an image, show fallback
        imageUrl.value = '' // Ensure empty
      }
    } catch (err) {
      console.error(err)
      error.value = true
    } finally {
      loading.value = false
    }
  }

  const downloadFile = async () => {
    try {
      const blob = await FileApi.file.download(props.fileId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = props.fileId // TODO: Real filename if available
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        loadFile()
      } else {
        if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
        imageUrl.value = ''
      }
    }
  )

  const handleClose = () => {
    visible.value = false
  }
</script>

<style scoped>
  .preview-container {
    background-color: var(--el-bg-color-page);
  }
</style>
