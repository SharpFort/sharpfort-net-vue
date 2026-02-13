<template>
  <div class="file-manager art-full-height">
    <ElContainer class="h-full">
      <!-- Left: Directory Tree -->
      <ElAside width="260px" class="directory-panel">
        <div class="panel-header">
          <span>目录结构</span>
          <div class="actions">
            <ElButton type="primary" link @click="handleAddDirectory" title="新建目录">
              <ElIcon><Plus /></ElIcon>
            </ElButton>
            <ElButton type="primary" link @click="loadDirectoryTree" title="刷新">
              <ElIcon><Refresh /></ElIcon>
            </ElButton>
          </div>
        </div>
        <div class="tree-container" v-loading="treeLoading">
          <ElTree
            ref="treeRef"
            :data="directoryTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span class="node-label">
                  <ElIcon class="mr-1"><Folder /></ElIcon>
                  {{ node.label }}
                </span>
                <span class="node-actions" v-if="data.id !== 'root'">
                  <ElDropdown trigger="click" @command="(cmd) => handleTreeCommand(cmd, data)">
                    <span class="el-dropdown-link">
                      <ElIcon><MoreFilled /></ElIcon>
                    </span>
                    <template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem command="add">新建子目录</ElDropdownItem>
                        <ElDropdownItem command="edit">重命名</ElDropdownItem>
                        <ElDropdownItem command="delete" divided class="text-danger"
                          >删除</ElDropdownItem
                        >
                      </ElDropdownMenu>
                    </template>
                  </ElDropdown>
                </span>
              </div>
            </template>
          </ElTree>
        </div>
      </ElAside>

      <!-- Right: File List -->
      <ElContainer>
        <ElHeader height="auto" class="file-header">
          <div class="breadcrumb">
            <span class="current-path">
              {{ currentDirectory ? currentDirectory.name : '全部文件' }}
            </span>
          </div>
          <div class="toolbar">
            <ElButton type="primary" @click="handleUpload">
              <ElIcon class="mr-1"><Upload /></ElIcon> 上传文件
            </ElButton>
            <ElButton
              type="danger"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </ElButton>
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索文件名"
              class="search-input"
              clearable
              @clear="loadFileList"
              @keyup.enter="loadFileList"
            >
              <template #append>
                <ElButton @click="loadFileList"
                  ><ElIcon><Search /></ElIcon
                ></ElButton>
              </template>
            </ElInput>
          </div>
        </ElHeader>

        <ElMain class="file-main">
          <ArtTable
            ref="tableRef"
            rowKey="id"
            :loading="listLoading"
            :columns="columns"
            :data="fileList"
            tableLayout="auto"
            @selection-change="handleSelectionChange"
            :pagination="pagination"
            @page-change="handlePageChange"
          />
        </ElMain>
      </ElContainer>
    </ElContainer>

    <!-- Dialogs -->
    <DirectoryDialog
      v-model:visible="itemDialogVisible"
      :parentId="currentParentId"
      :editData="editDirectoryData"
      @success="loadDirectoryTree"
    />
    <UploadDialog
      v-model:visible="uploadDialogVisible"
      :directoryId="currentDirectory?.id"
      @success="loadFileList"
    />
  </div>
</template>

<script setup lang="ts">
  import { Plus, Refresh, Folder, MoreFilled, Upload, Search } from '@element-plus/icons-vue'
  import { FileApi } from '@/api/file'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import DirectoryDialog from '../modules/directory-dialog.vue'
  import UploadDialog from '../modules/upload-dialog.vue'

  defineOptions({ name: 'FileManager' })

  const treeLoading = ref(false)
  const listLoading = ref(false)
  const directoryTree = ref<any[]>([])
  const fileList = ref<any[]>([])
  const currentDirectory = ref<any>(null)
  const searchKeyword = ref('')
  const selectedFiles = ref<any[]>([])

  // Dialogs
  const itemDialogVisible = ref(false)
  const uploadDialogVisible = ref(false)
  const currentParentId = ref('')
  const editDirectoryData = ref<any>(null)

  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  // Format bytes inline
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const columns = useTableColumns(() => [
    {
      type: 'selection',
      width: 50,
      align: 'center'
    },
    {
      prop: 'name',
      label: '文件名',
      minWidth: 200,
      formatter: (row: any) => {
        // Can add icon based on file type
        return row.name
      }
    },
    {
      prop: 'size',
      label: '大小',
      width: 100,
      align: 'right',
      formatter: (row: any) => formatSize(row.size)
    },
    {
      prop: 'fileType',
      label: '类型',
      width: 100,
      align: 'center'
    },
    {
      prop: 'creationTime',
      label: '上传时间',
      width: 160,
      formatter: (row: any) => row.creationTime?.substring(0, 19).replace('T', ' ')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { class: 'flex justify-center gap-2' }, [
          h(
            'span',
            {
              class: 'text-primary cursor-pointer hover:underline',
              onClick: () => handleDownload(row)
            },
            '下载'
          ),
          h(
            'span',
            {
              class: 'text-primary cursor-pointer hover:underline',
              onClick: () => handleRenameFile(row)
            },
            '重命名'
          ),
          h(
            'span',
            {
              class: 'text-danger cursor-pointer hover:underline',
              onClick: () => handleDeleteFile(row)
            },
            '删除'
          )
        ])
      }
    }
  ]).columns

  onMounted(() => {
    loadDirectoryTree()
    loadFileList()
  })

  const loadDirectoryTree = async () => {
    treeLoading.value = true
    try {
      const res = await FileApi.directory.getList()
      const tree = handleTree(res || [])
      // Add a "Root" node if needed, or just show top level
      // We can add a virtual root to allow selecting "All Files" logic if API supports listing root files
      // If parentId is null, it's root.
      directoryTree.value = [{ id: 'root', name: '全部文件', children: tree }]

      // Default expand first level handled by default-expand-all
    } catch (error) {
      console.error(error)
    } finally {
      treeLoading.value = false
    }
  }

  const handleTree = (data: any[]) => {
    const res: any[] = []
    const map = new Map()
    // First pass: create nodes
    data.forEach((item) => {
      map.set(item.id, { ...item, children: [] })
    })
    // Second pass: link parents
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

  const loadFileList = async () => {
    listLoading.value = true
    try {
      const params = {
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size,
        DirectoryId: currentDirectory.value?.id === 'root' ? undefined : currentDirectory.value?.id,
        Name: searchKeyword.value || undefined
      }
      const res = await FileApi.file.getList(params)
      fileList.value = res.items || []
      pagination.total = res.totalCount
    } catch (error) {
      console.error(error)
    } finally {
      listLoading.value = false
    }
  }

  const handleNodeClick = (data: any) => {
    currentDirectory.value = data
    pagination.current = 1
    loadFileList()
  }

  const handleAddDirectory = () => {
    currentParentId.value = currentDirectory.value?.id === 'root' ? '' : currentDirectory.value?.id
    editDirectoryData.value = null
    itemDialogVisible.value = true
  }

  const handleTreeCommand = (command: string, data: any) => {
    if (command === 'add') {
      currentParentId.value = data.id
      editDirectoryData.value = null
      itemDialogVisible.value = true
    } else if (command === 'edit') {
      editDirectoryData.value = data
      itemDialogVisible.value = true
    } else if (command === 'delete') {
      handleDeleteDirectory(data)
    }
  }

  const handleDeleteDirectory = async (data: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除目录 "${data.name}" 及其所有内容吗？`, '警告', {
        type: 'warning'
      })
      await FileApi.directory.del(data.id)
      ElMessage.success('删除成功')
      loadDirectoryTree()
      if (currentDirectory.value?.id === data.id) {
        currentDirectory.value = null
        loadFileList()
      }
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleUpload = () => {
    if (!currentDirectory.value || currentDirectory.value.id === 'root') {
      // Allow upload to root? If API parentId is optional, then yes.
      // Assuming root upload is allowed (directoryId empty)
    }
    // API requires directoryId for upload: /api/app/file-descriptor/upload/{directoryId}
    // If uploading to root is supported, maybe directoryId should be GUID.Empty or special endpoint?
    // Swagger says: `upload/{directoryId}`. Path param is required.
    // If root upload is not supported by API design (must happen in a directory?), then we must select a directory.
    // Let's assume we need a directory.
    if (!currentDirectory.value || currentDirectory.value.id === 'root') {
      // If root is selected, we prompt user to select a directory in the dialog, handled by passing empty directoryId
      // But the dialog props handle it.
    }

    uploadDialogVisible.value = true
  }

  const handleDownload = async (row: any) => {
    try {
      const blob = await FileApi.file.download(row.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = row.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error(error)
      ElMessage.error('下载失败')
    }
  }

  const handleRenameFile = async (row: any) => {
    try {
      const { value } = await ElMessageBox.prompt('请输入新文件名', '重命名', {
        inputValue: row.name,
        inputPattern: /^.+$/,
        inputErrorMessage: '文件名不能为空'
      })
      if (value) {
        await FileApi.file.rename(row.id, value) // Removed explicit argument name to avoid syntax error if API doesn't support named args in TS call directly like that
        // API signature: rename(id, newName)
        ElMessage.success('重命名成功')
        loadFileList()
      }
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleDeleteFile = async (row: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除文件 "${row.name}" 吗？`, '提示', {
        type: 'warning'
      })
      await FileApi.file.del(row.id)
      ElMessage.success('删除成功')
      loadFileList()
    } catch (e: any) {
      console.error(e)
    }
  }

  const handleSelectionChange = (val: any[]) => {
    selectedFiles.value = val
  }

  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
        '提示',
        {
          type: 'warning'
        }
      )
      const ids = selectedFiles.value.map((item) => item.id)
      await FileApi.file.deleteMany(ids)
      ElMessage.success('批量删除成功')
      loadFileList()
      selectedFiles.value = []
    } catch (e: any) {
      console.error(e)
    }
  }

  const handlePageChange = (val: any) => {
    pagination.current = val.current
    pagination.size = val.size
    loadFileList()
  }
</script>

<style scoped lang="scss">
  .file-manager {
    padding: 16px;
    background-color: var(--art-bg-color);
  }

  .directory-panel {
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #eee;

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      font-weight: bold;
      border-bottom: 1px solid #f0f0f0;

      .actions {
        display: flex;
      }
    }

    .tree-container {
      flex: 1;
      padding: 10px 0;
      overflow-y: auto;
    }
  }

  .file-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 16px;
    background: #fff;
    border-bottom: 1px solid #eee;

    .breadcrumb {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      align-items: center;

      .search-input {
        width: 250px;
        margin-left: auto;
      }
    }
  }

  .file-main {
    padding: 16px;
    background: #fff;
  }

  .custom-tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;
    font-size: 14px;

    .node-label {
      display: flex;
      align-items: center;
    }

    .node-actions {
      display: none;
    }

    &:hover .node-actions {
      display: block;
    }
  }
</style>
