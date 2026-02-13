<template>
  <ElDialog
    title="上传文件"
    v-model="dialogVisible"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" label-width="80px">
      <ElFormItem label="目标目录" prop="directoryId">
        <ElTreeSelect
          v-model="form.directoryId"
          :data="directoryOptions"
          :props="{ label: 'name', children: 'children' }"
          value-key="id"
          placeholder="请选择上传目录"
          check-strictly
          clearable
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="选择文件">
        <ElUpload
          class="upload-demo"
          drag
          action="#"
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
        >
          <ElIcon class="el-icon--upload"><upload-filled /></ElIcon>
          <div class="el-upload__text"> Drop file here or <em>click to upload</em> </div>
        </ElUpload>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="uploading"
          @click="handleUpload"
          :disabled="fileList.length === 0"
        >
          开始上传
        </ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { UploadFilled } from '@element-plus/icons-vue'
  import { FileApi } from '@/api/file'
  import { ElMessage } from 'element-plus'
  import type { UploadUserFile } from 'element-plus'

  interface Props {
    visible: boolean
    directoryId?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const uploading = ref(false)
  const fileList = ref<UploadUserFile[]>([])
  const directoryOptions = ref<any[]>([])

  const form = reactive({
    directoryId: ''
  })

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        form.directoryId = props.directoryId || ''
        fileList.value = []
        loadDirectoryTree()
      }
    }
  )

  const loadDirectoryTree = async () => {
    try {
      const res = await FileApi.directory.getList()
      directoryOptions.value = handleTree(res || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleTree = (data: any[]) => {
    const res: any[] = []
    const map = new Map()
    data.forEach((item) => {
      map.set(item.id, { ...item, children: [] })
    })
    data.forEach((item) => {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children.push(map.get(item.id))
      } else {
        res.push(map.get(item.id))
      }
    })
    return res
  }

  const handleFileChange = (file: any, files: any[]) => {
    fileList.value = files
  }

  const handleFileRemove = (file: any, files: any[]) => {
    fileList.value = files
  }

  const handleUpload = async () => {
    if (fileList.value.length === 0) return
    if (!form.directoryId) {
      ElMessage.warning('请选择上传目录')
      return
    }

    uploading.value = true
    try {
      const formData = new FormData()
      fileList.value.forEach((file) => {
        if (file.raw) {
          formData.append('files', file.raw)
        }
      })

      // Pass both path param and query param as per API definition (though path param is used in URL)
      // The API definition has `upload: (directoryId: string, data: FormData, directoryId?: string)`
      // We should use the path param. The query param might be redundant or optional.
      // Wait, let's check the generated API client again.
      // upload: (directoryId: string, data: FormData) => request.post...

      await FileApi.file.upload(form.directoryId, formData)

      ElMessage.success('上传成功')
      emit('success')
      dialogVisible.value = false
    } catch (error) {
      console.error(error)
    } finally {
      uploading.value = false
    }
  }

  const handleClosed = () => {
    fileList.value = []
    form.directoryId = ''
  }
</script>
