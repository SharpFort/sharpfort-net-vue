<template>
  <div
    class="file-manager-container h-full flex bg-slate-50/50 rounded-2xl overflow-hidden p-4 gap-4"
  >
    <!-- Left Sidebar: Directory Tree -->
    <div
      class="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-hidden"
    >
      <div class="p-4 border-b border-gray-50 bg-gray-50/50">
        <!-- 💡 TODO: 后端支持后，这里可以对接分页式平铺搜索 -->
        <ElInput
          v-model.trim="treeSearchKeyword"
          placeholder="过滤目录..."
          clearable
          @input="filterTree"
        >
          <template #prefix>
            <i class="ri-filter-3-line text-gray-400"></i>
          </template>
        </ElInput>
      </div>
      <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
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
          class="bg-transparent"
        >
          <template #default="{ node, data }">
            <div
              class="group flex items-center justify-between w-full py-2 px-3 rounded-xl transition-all duration-300 border select-none cursor-pointer"
              :class="
                dragTargetId === data.id
                  ? '!bg-blue-100 !border-blue-400 shadow-sm'
                  : 'border-transparent hover:border-blue-100/50 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-transparent'
              "
              @dragover.prevent="handleDragOver($event, data)"
              @dragleave.prevent="handleDragLeave($event, data)"
              @drop.stop="handleDrop($event, data)"
            >
              <div class="flex items-center space-x-3 overflow-hidden pointer-events-none">
                <ElIcon
                  class="text-blue-400 text-xl group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                  ><Folder
                /></ElIcon>
                <span
                  class="text-sm font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors"
                  >{{ node.label }}</span
                >
              </div>
              <div
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ElTooltip content="修改" placement="top" :show-after="300">
                  <div
                    class="p-1 rounded-md hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                    @click.stop="handleEditFolder(data)"
                  >
                    <i class="ri-edit-line text-sm"></i>
                  </div>
                </ElTooltip>
                <ElTooltip content="删除" placement="top" :show-after="300">
                  <div
                    class="p-1 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    @click.stop="deleteFolder(data)"
                  >
                    <i class="ri-delete-bin-line text-sm"></i>
                  </div>
                </ElTooltip>
              </div>
            </div>
          </template>
        </ElTree>
      </div>
    </div>

    <!-- Right Pane: File & Folder Grid -->
    <div
      class="flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm p-6 min-w-0"
    >
      <!-- Toolbar -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div class="flex items-center">
          <div
            class="flex items-center gap-2 text-sm font-semibold bg-gray-50/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200/60 shadow-sm transition-all hover:shadow-md"
          >
            <div
              class="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center transition-colors px-2 py-1 rounded-lg hover:bg-white select-none"
              @click="goToFolder(null)"
            >
              <ElIcon class="mr-1 text-lg"><HomeFilled /></ElIcon>
              <span>全部文件</span>
            </div>

            <template v-for="(item, index) in breadcrumbPath" :key="item.id">
              <ElIcon class="text-gray-300"><ArrowRight /></ElIcon>
              <div
                class="flex items-center transition-colors px-3 py-1.5 rounded-xl select-none"
                :class="
                  index === breadcrumbPath.length - 1
                    ? 'text-blue-600 bg-blue-50 border border-blue-100 shadow-sm'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-white cursor-pointer'
                "
                @click="index !== breadcrumbPath.length - 1 ? goToFolder(item) : null"
              >
                <ElIcon
                  v-if="index === breadcrumbPath.length - 1"
                  class="mr-1.5 text-lg text-blue-500"
                  ><FolderOpened
                /></ElIcon>
                <ElIcon v-else class="mr-1.5 text-lg"><Folder /></ElIcon>
                <span>{{ item.name }}</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex gap-3">
          <!-- 💡 TODO: 对接后端文件搜索的时候，可在此处请求 FileApi.file.getList 传入 name 等 -->
          <ElInput
            v-model.trim="fileSearchKeyword"
            placeholder="搜索当前目录内容..."
            class="w-64"
            clearable
            @input="handleLocalSearch"
          >
            <template #prefix>
              <i class="ri-search-line"></i>
            </template>
          </ElInput>
          <ElButton class="!rounded-xl" type="default" @click="handleCreateFolder">
            <template #icon><i class="ri-folder-add-line"></i></template>
            新建文件夹
          </ElButton>
          <ElButton
            class="!rounded-xl !bg-blue-600 hover:!bg-blue-700 !border-blue-600"
            type="primary"
            @click="showUpload = true"
          >
            <template #icon><i class="ri-upload-cloud-2-line"></i></template>
            上传文件
          </ElButton>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar" v-loading="loading">
        <!-- Empty State -->
        <div
          v-if="displayFolders.length === 0 && displayFiles.length === 0"
          class="h-full flex flex-col justify-center items-center text-gray-400 pb-10"
        >
          <div class="w-48 h-48 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <i class="ri-folder-open-line text-8xl text-blue-200"></i>
          </div>
          <p class="text-lg text-gray-500 font-medium">当前目录为空</p>
          <p class="text-sm text-gray-400 mt-2">您可以新建文件夹或上传文件</p>
        </div>

        <!-- Grid View -->
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-5 content-start p-1"
        >
          <!-- Render Folders First -->
          <div
            v-for="folder in displayFolders"
            :key="folder.id"
            draggable="true"
            @dragstart="handleDragStart($event, folder, 'directory')"
            @dragover.prevent="handleDragOver($event, folder)"
            @dragleave.prevent="handleDragLeave($event, folder)"
            @drop.stop="handleDrop($event, folder)"
            class="file-card group relative bg-white border hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden select-none"
            :class="
              dragTargetId === folder.id
                ? '!border-blue-500 !bg-blue-50/50 scale-105 z-20 shadow-lg'
                : 'border-gray-100'
            "
            @click="goToFolder(folder)"
          >
            <div
              class="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            ></div>
            <div
              class="text-6xl text-blue-400 mb-3 group-hover:scale-110 group-hover:-translate-y-1 drop-shadow-md transition-all duration-300 relative z-10 flex justify-center items-center pointer-events-none"
            >
              <ElIcon><FolderOpened /></ElIcon>
            </div>
            <div
              class="text-sm truncate w-full px-1 font-semibold text-gray-700 group-hover:text-blue-600 transition-colors relative z-10 pointer-events-none"
              :title="folder.name"
            >
              {{ folder.name }}
            </div>
            <div
              class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm"
            >
              <div
                class="p-1 rounded-md hover:bg-blue-100 text-gray-500 hover:text-blue-600"
                @click.stop="handleEditFolder(folder)"
                title="修改"
              >
                <ElIcon class="text-sm"><EditPen /></ElIcon>
              </div>
              <div
                class="p-1 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-500"
                @click.stop="deleteFolder(folder)"
                title="删除"
              >
                <ElIcon class="text-sm"><Delete /></ElIcon>
              </div>
            </div>
          </div>

          <!-- Render Files Next -->
          <div
            v-for="file in displayFiles"
            :key="file.id"
            draggable="true"
            @dragstart="handleDragStart($event, file, 'file')"
            class="file-card group relative bg-white border border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
            @click="openPreview(file)"
          >
            <!-- Thumbnail -->
            <div
              class="aspect-square flex flex-col justify-center items-center bg-gray-50/50 overflow-hidden relative"
            >
              <AsyncImage
                class="group-hover:scale-105 transition-transform duration-500"
                :file-id="file.id || ''"
                :file-type="file.fileType || ''"
              />

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ElButton
                  circle
                  :icon="View"
                  type="info"
                  size="small"
                  @click.stop="openPreview(file)"
                  title="预览"
                />
                <ElButton
                  circle
                  :icon="Download"
                  type="primary"
                  size="small"
                  @click.stop="downloadFile(file)"
                  title="下载"
                />
                <ElButton
                  circle
                  :icon="Delete"
                  type="danger"
                  size="small"
                  @click.stop="deleteFile(file)"
                  title="删除"
                />
              </div>
            </div>

            <!-- Info -->
            <div
              class="p-3 text-center bg-white z-10 border-t border-gray-50 group-hover:bg-blue-50/30 transition-colors"
            >
              <div
                class="text-sm truncate text-gray-700 font-semibold group-hover:text-blue-600 transition-colors"
                :title="file.name"
              >
                {{ file.name }}
              </div>
              <div class="text-xs text-gray-400 mt-1.5 font-medium">{{
                formatSize(file.size)
              }}</div>
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
  import {
    View,
    Download,
    Delete,
    FolderOpened,
    Folder,
    HomeFilled,
    ArrowRight,
    EditPen
  } from '@element-plus/icons-vue'
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
  const breadcrumbPath = ref<{ id: string; name: string }[]>([])
  const currentFile = ref<FileDescriptorGetListOutputDto | null>(null)

  // Drag and Drop Logic
  const draggedItem = ref<{ id: string; type: 'directory' | 'file' } | null>(null)
  const dragTargetId = ref<string | null>(null)

  const handleDragStart = (e: DragEvent, item: any, type: 'directory' | 'file') => {
    draggedItem.value = { id: item.id, type }
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', item.id)
    }
  }

  const handleDragOver = (e: DragEvent, folder: any) => {
    if (!draggedItem.value) return
    if (draggedItem.value.type === 'directory' && draggedItem.value.id === folder.id) return

    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    dragTargetId.value = folder.id
  }

  const handleDragLeave = (e: DragEvent, folder: any) => {
    const currentList = e.currentTarget as Node
    const related = e.relatedTarget as Node
    if (currentList && related && currentList.contains(related)) {
      return
    }
    if (dragTargetId.value === folder.id) {
      dragTargetId.value = null
    }
  }

  const handleDrop = async (e: DragEvent, targetFolder: any) => {
    e.preventDefault()
    dragTargetId.value = null
    const dragged = draggedItem.value
    if (!dragged) return

    // Validate target is not self
    if (dragged.type === 'directory' && dragged.id === targetFolder.id) return

    try {
      if (dragged.type === 'directory') {
        const { value: confirm } = await ElMessageBox.confirm(
          `确定要将所选文件夹移入 "${targetFolder.name}" 目录内吗？`,
          '移动文件夹',
          { type: 'warning' }
        ).catch(() => ({ value: false }))
        if (confirm === false) return
        await FileApi.directory.move(dragged.id, targetFolder.id)
      } else {
        const { value: confirm } = await ElMessageBox.confirm(
          `确定要将文件移入 "${targetFolder.name}" 目录内吗？`,
          '移动文件',
          { type: 'warning' }
        ).catch(() => ({ value: false }))
        if (confirm === false) return
        await FileApi.file.move(dragged.id, targetFolder.id)
      }

      ElMessage.success('操作成功')
      fetchRightPaneContent()
    } catch (err: any) {
      if (err !== 'cancel') {
        console.error(err)
        ElMessage.error(
          err.response?.data?.error?.message || err.message || '移动操作失败，请确认层级逻辑后再试'
        )
      }
    } finally {
      draggedItem.value = null
    }
  }

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

      const existingIndex = breadcrumbPath.value.findIndex((p) => p.id === folder.id)
      if (existingIndex !== -1) {
        breadcrumbPath.value = breadcrumbPath.value.slice(0, existingIndex + 1)
      } else {
        const treeNode = treeRef.value?.getNode(folder.id)
        if (treeNode) {
          const path: { id: string; name: string }[] = []
          let node = treeNode
          while (node && node.data && node.data.id && node.level > 0) {
            path.unshift({ id: node.data.id, name: node.data.name })
            node = node.parent
          }
          breadcrumbPath.value = path
        } else {
          breadcrumbPath.value.push({ id: folder.id!, name: folder.name! })
        }
      }

      nextTick(() => {
        if (treeRef.value?.getNode(folder.id)) {
          treeRef.value?.setCurrentKey(folder.id)
        }
      })
    } else {
      currentDirectoryId.value = undefined
      currentDirectoryName.value = ''
      breadcrumbPath.value = []
      treeRef.value?.setCurrentKey(null)
    }
    fetchRightPaneContent()
  }

  // Actions
  const handleEditFolder = async (folder: DirectoryDescriptorGetOutputDto) => {
    try {
      const { value: folderName } = await ElMessageBox.prompt(
        '请输入新的文件夹名称',
        '修改文件夹',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: folder.name,
          inputPattern: /\S+/,
          inputErrorMessage: '名称不能为空'
        }
      )

      await FileApi.directory.update(folder.id!, {
        name: folderName
      })
      ElMessage.success('修改成功')

      if (currentDirectoryId.value === folder.id) {
        currentDirectoryName.value = folderName
      }

      // Update local tree node or refetch right content
      folder.name = folderName // optimistic update
      fetchRightPaneContent()
    } catch (err) {
      if (err !== 'cancel') {
        console.error(err)
        ElMessage.error('修改失败')
      }
    }
  }

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
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  :deep(.el-tree-node__content) {
    position: relative;
    height: auto;
    padding: 2px 0;
    background-color: transparent !important;
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content > .group) {
    background-image: linear-gradient(to right, rgb(239 246 255), transparent);
    border-color: rgb(219 234 254);
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content > .group span) {
    color: rgb(37 99 235);
  }
</style>
