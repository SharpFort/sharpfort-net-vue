<template>
  <div class="w-full h-full flex-c justify-center items-center bg-gray-50">
    <ElSkeleton v-if="loading" animated class="w-full h-full">
      <template #template>
        <div class="w-full h-full bg-gray-200"></div>
      </template>
    </ElSkeleton>

    <img v-else-if="src" :src="src" class="w-full h-full object-cover" alt="Thumbnail" />

    <div v-else class="flex-c justify-center text-gray-300">
      <i :class="iconClass" class="text-4xl"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
  import { FileApi } from '@/api/file'

  const props = defineProps({
    fileId: { type: String, required: true },
    fileType: { type: String, default: '' }
  })

  const loading = ref(true)
  const src = ref('')

  const iconClass = computed(() => {
    // Simple icon mapping based on type if available
    if (props.fileType.includes('pdf')) return 'ri-file-pdf-line'
    if (props.fileType.includes('word') || props.fileType.includes('doc'))
      return 'ri-file-word-line'
    return 'ri-file-line'
  })

  const loadThumbnail = async () => {
    loading.value = true
    try {
      // Try to fetch thumbnail. If it fails (404/400), it might not be an image.
      const blob = await FileApi.file.download(props.fileId)
      if (blob.size > 0 && blob.type.startsWith('image/')) {
        src.value = URL.createObjectURL(blob)
      } else {
        // Not an image or empty
        src.value = ''
      }
    } catch {
      src.value = ''
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (props.fileId) loadThumbnail()
  })

  watch(
    () => props.fileId,
    () => {
      if (src.value) URL.revokeObjectURL(src.value)
      loadThumbnail()
    }
  )

  onUnmounted(() => {
    if (src.value) URL.revokeObjectURL(src.value)
  })
</script>
