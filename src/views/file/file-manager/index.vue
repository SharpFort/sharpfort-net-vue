<template>
  <div class="file-manager-container h-full flex bg-white shadow-sm rounded overflow-hidden p-2">
    <!-- Left Sidebar: Directory Tree -->
    <div class="w-64 border-r pr-2 flex flex-col shrink-0">
      <div class="mb-3 px-1">
        <!-- 💡 TODO: 后端支持后，这里可以对接分页式平铺搜索 -->
        <ElInput
          v-model="treeSearchKeyword"
          placeholder="过滤目录..."
          prefix-icon="search"
          clearable
          @input="filterTree"
        />
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <ElTree
          ref="treeRef"
          :data="treeData"
          lazy
          :load="loadTreeNodes"
          :props="treeProps"
          node-key="id"
          highlight-current
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        >
          <template #default="{ node }">
            <span class="custom-tree-node flex items-center text-sm">
              <i class="ri-folder-3-fill text-yellow-400 mr-2 text-lg"></i>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </ElTree>
      </div>
    </div>

    <!-- Right Pane: File & Folder Grid -->
    <div class="flex-1 flex flex-col pl-4 min-w-0">
      <!-- Toolbar -->
      <div class="flex justify-between items-center mb-4 pb-2 border-b">
        <div class="flex items-center">
          <ElBreadcrumb separator="/">
            <ElBreadcrumbItem :to="{ path: '' }" @click="goToFolder(null)"
              >全部文件</ElBreadcrumbItem
            >
            <!-- 假设这里有完整的面包屑链路，目前用当前文件夹名称替代 -->
            <ElBreadcrumbItem v-if="currentDirectoryName">{{
              currentDirectoryName
            }}</ElBreadcrumbItem>
          </ElBreadcrumb>
        </div>
        <div class="flex gap-2">
          <!-- 💡 TODO: 对接后端文件搜索的时候，可在此处请求 FileApi.file.getList 传入 name 等 -->
          <ElInput
            v-model="fileSearchKeyword"
            placeholder="搜索当前目录内容"
            class="w-64"
            prefix-icon="search"
            clearable
            @input="handleLocalSearch"
          />
          <ElButton type="default" icon="folder-add" @click="handleCreateFolder"
            >新建文件夹</ElButton
          >
          <ElButton type="primary" icon="upload" @click="showUpload = true">上传文件</ElButton>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar" v-loading="loading">
        <!-- Empty State -->
        <div
          v-if="displayFolders.length === 0 && displayFiles.length === 0"
          class="h-full flex flex-col justify-center items-center text-g-400"
        >
          <h1 class="text-8xl mb-4 text-g-200"><i class="ri-folder-open-line"></i></h1>
          <p>当前目录为空</p>
        </div>

        <!-- Grid View -->
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 content-start"
        >
          <!-- Render Folders First -->
          <div
            v-for="folder in displayFolders"
            :key="folder.id"
            class="file-card group relative border border-transparent hover:bg-g-50 hover:border-g-200 rounded p-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center"
            @click="goToFolder(folder)"
          >
            <div class="text-6xl text-yellow-400 mb-2">
              <i class="ri-folder-3-fill"></i>
            </div>
            <div class="text-sm truncate w-full px-1 font-medium text-g-700" :title="folder.name">
              {{ folder.name }}
            </div>
            <div
              class="text-xs text-g-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ElButton type="danger" link @click.stop="deleteFolder(folder)"
                ><i class="ri-delete-bin-line"></i
              ></ElButton>
            </div>
          </div>

          <!-- Render Files Next -->
          <div
            v-for="file in displayFiles"
            :key="file.id"
            class="file-card group relative border border-g-200 bg-g-50 rounded hover:shadow-md transition-all cursor-pointer"
            @click="openPreview(file)"
          >
            <!-- Thumbnail -->
            <div
              class="aspect-square flex flex-col justify-center items-center bg-white overflow-hidden rounded-t relative"
            >
              <AsyncImage :file-id="file.id || ''" :file-type="file.fileType || ''" />

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
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
                  @click.stop="downloadFile(file)"
                  title="下载"
                />
                <ElButton
                  circle
                  icon="delete"
                  type="danger"
                  size="small"
                  @click.stop="deleteFile(file)"
                  title="删除"
                />
              </div>
            </div>

            <!-- Info -->
            <div class="p-2 text-center">
              <div class="text-sm truncate text-g-700 font-medium" :title="file.name">
                {{ file.name }}
              </div>
              <div class="text-xs text-g-400 mt-1">{{ formatSize(file.size) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UploadModal
      v-model="showUpload"
      :directory-id="currentDirectoryId || ''"
      @success="handleUploadSuccess"
    />
    <PreviewModal
      v-model="showPreview"
      :file-id="currentFile?.id || ''"
      :file-type="currentFile?.fileType || ''"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import UploadModal from './modules/UploadModal.vue'
  import PreviewModal from './modules/PreviewModal.vue'
  import AsyncImage from './modules/AsyncImage.vue'
  import {
    FileApi,
    DirectoryDescriptorGetOutputDto,
    FileDescriptorGetListOutputDto
  } from '@/api/file'

  defineOptions({ name: 'FileManager' })

  const loading = ref(false)
  const showUpload = ref(false)
  const showPreview = ref(false)
  const treeSearchKeyword = ref('')
  const fileSearchKeyword = ref('')

  const currentDirectoryId = ref<string | undefined>(undefined)
  const currentDirectoryName = ref<string>('')
  const currentFile = ref<FileDescriptorGetListOutputDto | null>(null)

  // Tree Logic
  const treeRef = ref<any>(null)
  const treeData = ref<DirectoryDescriptorGetOutputDto[]>([])
  const treeProps = {
    label: 'name',
    children: 'children', // although lazy loaded, we tell el-tree what property has children if any
    isLeaf: 'isLeaf' // ElTree lazy setting: true if no children
  }

  const loadTreeNodes = async (node: any, resolve: (data: any[]) => void) => {
    // node.level === 0 implies root layer
    const parentId = node.level === 0 ? undefined : node.data.id
    try {
      const res = await FileApi.directory.getList({ parentId })
      // In many UI designs, a folder might still be a leaf if it's empty. We don't know from this API until loaded.
      // If backend doesn't provide hasChildren flag, we return them without isLeaf = true, meaning all nodes are expandable.
      // Expanding an empty node will just show empty and cache it.
      resolve(res.map((d) => ({ ...d })))
    } catch (error) {
      console.error('Failed to load directories', error)
      resolve([])
    }
  }

  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.name.includes(value)
  }

  const filterTree = () => {
    treeRef.value?.filter(treeSearchKeyword.value)
  }

  const handleNodeClick = (data: DirectoryDescriptorGetOutputDto) => {
    goToFolder(data)
  }

  // Right Pane Logic
  const originalFolders = ref<DirectoryDescriptorGetOutputDto[]>([])
  const originalFiles = ref<FileDescriptorGetListOutputDto[]>([])

  const displayFolders = ref<DirectoryDescriptorGetOutputDto[]>([])
  const displayFiles = ref<FileDescriptorGetListOutputDto[]>([])

  const fetchRightPaneContent = async () => {
    loading.value = true
    fileSearchKeyword.value = ''
    try {
      const [dirs, filesResp] = await Promise.all([
        FileApi.directory.getList({ parentId: currentDirectoryId.value }),
        FileApi.file.getList({
          directoryId: currentDirectoryId.value,
          maxResultCount: 1000 // In an ideal setup, we'd paginate the scrollview with skipCount. Here we fetch a large batch for demonstration.
        })
      ])
      originalFolders.value = dirs
      originalFiles.value = filesResp.items || []

      handleLocalSearch()
    } catch (error) {
      console.error('Failed to load right pane content', error)
    } finally {
      loading.value = false
    }
  }

  const handleLocalSearch = () => {
    const keyword = fileSearchKeyword.value.trim().toLowerCase()
    if (!keyword) {
      displayFolders.value = [...originalFolders.value]
      displayFiles.value = [...originalFiles.value]
      return
    }
    displayFolders.value = originalFolders.value.filter(
      (f) => f.name && f.name.toLowerCase().includes(keyword)
    )
    displayFiles.value = originalFiles.value.filter(
      (f) => f.name && f.name.toLowerCase().includes(keyword)
    )
  }

  const goToFolder = (folder: DirectoryDescriptorGetOutputDto | null) => {
    if (folder) {
      currentDirectoryId.value = folder.id
      currentDirectoryName.value = folder.name || ''
      // Ensure the tree node is selected up visually
      nextTick(() => {
        treeRef.value?.setCurrentKey(folder.id)
      })
    } else {
      currentDirectoryId.value = undefined
      currentDirectoryName.value = ''
      treeRef.value?.setCurrentKey(null)
    }
    fetchRightPaneContent()
  }

  // Actions
  const handleCreateFolder = async () => {
    try {
      const { value: folderName } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '名称不能为空'
      })

      await FileApi.directory.create({
        name: folderName,
        parentId: currentDirectoryId.value
      })
      ElMessage.success('创建成功')

      // Refresh content
      fetchRightPaneContent()

      // If the node is loaded in tree, we should theoretically update the tree node too.
      // However, refreshing the entire lazy tree is complex in Element Plus.
      // For now, refreshing the right pane solves the immediate UX need.
    } catch (err) {
      if (err !== 'cancel') {
        console.error(err)
        ElMessage.error('创建失败')
      }
    }
  }

  const deleteFolder = async (folder: DirectoryDescriptorGetOutputDto) => {
    try {
      await ElMessageBox.confirm(`确定要删除文件夹 "${folder.name}" 及其下所有内容吗？`, '警告', {
        type: 'warning'
      })
      await FileApi.directory.del(folder.id!)
      ElMessage.success('删除成功')
      fetchRightPaneContent()
    } catch (e) {
      if (e !== 'cancel') ElMessage.error('删除失败')
    }
  }

  const deleteFile = async (file: FileDescriptorGetListOutputDto) => {
    try {
      await ElMessageBox.confirm(`确定要删除文件 "${file.name}" 吗？`, '警告', {
        type: 'warning'
      })
      await FileApi.file.del(file.id!)
      ElMessage.success('删除成功')
      fetchRightPaneContent()
    } catch (e) {
      if (e !== 'cancel') ElMessage.error('删除失败')
    }
  }

  const downloadFile = async (file: FileDescriptorGetListOutputDto) => {
    try {
      const blob = await FileApi.file.download(file.id!)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name || file.id!
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      ElMessage.error('下载失败')
    }
  }

  const handleUploadSuccess = () => {
    fetchRightPaneContent()
  }

  const openPreview = (file: FileDescriptorGetListOutputDto) => {
    currentFile.value = file
    showPreview.value = true
  }

  const formatSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return ''
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  onMounted(() => {
    // Initial fetch for the root file view
    fetchRightPaneContent()
  })
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
</style>
