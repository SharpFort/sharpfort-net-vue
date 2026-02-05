<template>
  <div class="file-manager-container p-4 h-full flex flex-col">
    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-4 bg-white p-4 rounded shadow-sm">
      <div class="flex items-center">
        <h2 class="text-xl font-medium mr-4">文件管理</h2>
        <!-- Simulated Search -->
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索文件 (本地)"
          class="w-64"
          prefix-icon="search"
          clearable
        />
      </div>
      <div>
        <ElButton type="primary" icon="upload" @click="showUpload = true">上传文件</ElButton>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 bg-white p-4 rounded shadow-sm overflow-hidden flex flex-col">
      <!-- Empty State -->
      <div v-if="files.length === 0" class="flex-1 flex-c justify-center items-center text-g-400">
        <div class="text-center">
          <h1 class="text-8xl mb-4 text-g-200"><i class="ri-folder-open-line"></i></h1>
          <p>暂无文件，请点击上方“上传文件”按钮</p>
        </div>
      </div>

      <!-- Grid View -->
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 overflow-y-auto content-start"
      >
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          class="file-card group relative border border-g-200 rounded hover:shadow-md transition-all cursor-pointer bg-g-50"
          @click="openPreview(file)"
        >
          <!-- Thumbnail -->
          <div
            class="aspect-square flex-c justify-center items-center bg-white overflow-hidden rounded-t relative"
          >
            <AsyncImage :file-id="file.id" :file-type="file.fileType" />

            <!-- Hover Overlay -->
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex-c justify-center gap-2"
            >
              <ElButton
                circle
                icon="view"
                type="info"
                size="small"
                @click.stop="openPreview(file)"
                title="预览"
              />
              <ElButton
                circle
                icon="download"
                type="primary"
                size="small"
                @click.stop="handleDownload(file)"
                title="下载"
              />
            </div>
          </div>

          <!-- Info -->
          <div class="p-2 text-center">
            <div class="text-sm truncate text-g-700 font-medium" :title="file.fileName || file.id">
              {{ file.fileName || file.id }}
            </div>
            <div class="text-xs text-g-400 mt-1">{{ formatSize(file.size) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UploadModal v-model="showUpload" @success="handleUploadSuccess" />
    <PreviewModal
      v-model="showPreview"
      :file-id="currentFile?.id"
      :file-type="currentFile?.fileType"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { FileItem } from './types'
  import UploadModal from './modules/UploadModal.vue'
  import PreviewModal from './modules/PreviewModal.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import AsyncImage from './modules/AsyncImage.vue' // Need to create this helper

  defineOptions({ name: 'FileManager' })

  const showUpload = ref(false)
  const showPreview = ref(false)
  const searchKeyword = ref('')
  const currentFile = ref<FileItem | null>(null)

  // Since there is no List API, we maintain a local list of uploaded files for this session.
  // Ideally this would be fetched from the backend.
  const files = ref<FileItem[]>([])

  const filteredFiles = computed(() => {
    if (!searchKeyword.value) return files.value
    return files.value.filter(
      (f) =>
        (f.fileName && f.fileName.includes(searchKeyword.value)) ||
        f.id.includes(searchKeyword.value)
    )
  })

  const handleUploadSuccess = (newFile?: FileItem) => {
    // If we get a file item back from upload (which we tacked on in the modal), add it.
    if (newFile) {
      files.value.unshift(newFile)
    }
  }

  const openPreview = (file: FileItem) => {
    currentFile.value = file
    showPreview.value = true
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await CasbinApi.file.download(file.id, false)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.fileName || file.id
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return ''
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
</script>

<style scoped>
  /* Custom Scrollbar for the grid area if needed */
</style>
