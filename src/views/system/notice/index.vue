<!-- 通知公告页面 -->
<template>
  <div class="notice-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAddNotice" v-ripple> 新增公告 </ElButton>
            <ElButton @click="handleDownloadTemplate" v-ripple> 下载模板 </ElButton>
            <ElButton @click="handleExport" v-ripple> 导出 </ElButton>
            <ElUpload
              action="#"
              :show-file-list="false"
              :http-request="handleImport"
              accept=".xlsx,.xls"
            >
              <ElButton v-ripple>导入</ElButton>
            </ElUpload>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="true"
      />

      <!-- 分页 -->
      <div class="pagination custom-pagination center">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          align="center"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>

      <!-- 公告弹窗 -->
      <NoticeDialog v-model:visible="dialogVisible" :editData="editData" @submit="handleRefresh" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import NoticeDialog from './modules/notice-dialog.vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElTag, ElMessageBox, ElMessage, ElUpload } from 'element-plus'
  import { downloadFile } from '@/utils/file'
  import { h, computed, reactive, ref, onMounted } from 'vue'

  defineOptions({ name: 'Notice' })

  // 状态管理
  const loading = ref(false)
  const dialogVisible = ref(false)
  const editData = ref<any>(null)
  const tableData = ref<any[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索相关
  const formFilters = reactive({
    Title: '',
    NoticeType: undefined,
    Content: '',
    State: undefined
  })

  // 公告类型选项
  const noticeTypeOptions = ref<any[]>([
    { label: '走马灯', value: 10 },
    { label: '提示弹窗', value: 20 }
  ])

  const formItems = computed(() => [
    {
      label: '公告标题',
      key: 'Title',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '内容预览',
      key: 'Content',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '公告类型',
      key: 'NoticeType',
      type: 'select',
      props: {
        clearable: true,
        options: noticeTypeOptions.value
      }
    },
    {
      label: '状态',
      key: 'State',
      type: 'select',
      props: {
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '停用', value: false }
        ]
      }
    }
  ])

  onMounted(() => {
    fetchNoticeTypes()
    getNoticeList()
  })

  /**
   * 获取公告类型字典
   */
  const fetchNoticeTypes = async () => {
    try {
      const res = await CasbinApi.dictionary.data.getByType('NoticeType')
      if (res && res.length > 0) {
        noticeTypeOptions.value = res.map((item: any) => ({
          label: item.dictLabel,
          value: isNaN(Number(item.dictValue)) ? item.dictValue : Number(item.dictValue)
        }))
      }
    } catch {
      console.warn('获取公告类型字典失败，使用静态配置')
    }
  }

  /**
   * 获取公告列表
   */
  const getNoticeList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.notice.getList({
        ...formFilters,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size
      })
      tableData.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error('获取公告失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      type: 'index',
      label: '序号',
      width: 80,
      align: 'center'
    },
    {
      prop: 'title',
      label: '公告标题',
      minWidth: 180
    },
    {
      prop: 'noticeType',
      label: '公告类型',
      width: 120,
      align: 'center',
      formatter: (row: any) => {
        const typeMap: any = {
          10: { label: '走马灯', type: 'primary' },
          20: { label: '提示弹窗', type: 'success' },
          MerryGoRound: { label: '走马灯', type: 'primary' },
          Popup: { label: '提示弹窗', type: 'success' }
        }
        const cfg = typeMap[row.noticeType] || { label: '未知', type: 'info' }
        return h(ElTag, { type: cfg.type, size: 'small' }, () => cfg.label)
      }
    },
    {
      prop: 'content',
      label: '内容预览',
      minWidth: 200,
      formatter: (row: any) => {
        if (!row.content) return '-'
        const preview = row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content
        return h('span', { class: 'text-gray-600' }, preview)
      }
    },
    {
      prop: 'orderNum',
      label: '显示顺序',
      width: 100,
      align: 'center',
      sortable: true
    },
    {
      prop: 'state',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: (row: any) =>
        h(
          ElTag,
          {
            type: row.state ? 'success' : 'danger',
            size: 'small'
          },
          () => (row.state ? '启用' : '停用')
        )
    },
    {
      prop: 'creationTime',
      label: '创建时间',
      width: 180,
      sortable: true
    },
    {
      prop: 'operation',
      label: '操作',
      width: 250,
      align: 'center',
      fixed: 'right',
      formatter: (row: any) => {
        return h('div', { class: 'flex justify-center gap-1' }, [
          h(ArtButtonTable, {
            icon: 'ri:broadcast-line',
            iconColor: '#409EFF',
            buttonBgColor: 'rgba(64, 158, 255, 0.1)',
            onClick: () => handleSendOnlineMessage(row)
          }),
          h(ArtButtonTable, {
            icon: 'ri:chat-off-line',
            iconColor: '#E6A23C',
            buttonBgColor: 'rgba(230, 162, 60, 0.1)',
            onClick: () => handleSendOfflineMessage(row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditNotice(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteNotice(row)
          })
        ])
      }
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      Title: '',
      NoticeType: undefined,
      Content: '',
      State: undefined
    })
    getNoticeList()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getNoticeList()
  }

  const handleRefresh = (): void => {
    getNoticeList()
  }

  const handlePageChange = (): void => {
    getNoticeList()
  }

  const handleAddNotice = (): void => {
    editData.value = null
    dialogVisible.value = true
  }

  const handleEditNotice = (row: any): void => {
    editData.value = row
    dialogVisible.value = true
  }

  const handleDeleteNotice = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除公告 [${row.title}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await CasbinApi.notice.del(row.id)
      ElMessage.success('删除成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') console.error('删除失败:', error)
    }
  }

  const handleSendOnlineMessage = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要发送在线消息 [${row.title}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
      await CasbinApi.notice.sendOnlineMessage(row.id)
      ElMessage.success('在线消息发送成功')
    } catch (error) {
      if (error !== 'cancel') console.error('发送在线消息失败:', error)
    }
  }

  const handleSendOfflineMessage = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要发送离线消息 [${row.title}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
      await CasbinApi.notice.sendOfflineMessage(row.id)
      ElMessage.success('离线消息发送成功')
    } catch (error) {
      if (error !== 'cancel') console.error('发送离线消息失败:', error)
    }
  }

  /**
   * 导出公告
   */
  const handleExport = async () => {
    try {
      ElMessage.info('正在导出数据，请稍候...')
      const res = await CasbinApi.notice.export(formFilters)
      downloadFile(res, `公告数据_${new Date().getTime()}.xlsx`)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }

  /**
   * 下载导入模板
   */
  const handleDownloadTemplate = async () => {
    try {
      ElMessage.info('正在生成模板，请稍候...')
      // 传入空参数或特定参数获取模板（通常导出接口不加过滤即为全量或空白模板）
      const res = await CasbinApi.notice.export({})
      downloadFile(res, '公告导入模板.xlsx')
      ElMessage.success('模板下载成功')
    } catch (error) {
      console.error('模板下载失败:', error)
      ElMessage.error('模板下载失败')
    }
  }

  /**
   * 导入公告
   */
  const handleImport = async (options: any) => {
    try {
      await ElMessageBox.confirm(
        '请上传标准 Excel 格式文件。如果尚未拥有模板，请先下载模板！是否继续？',
        '导入提示',
        {
          confirmButtonText: '继续上传',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      const formData = new FormData()
      formData.append('file', options.file)
      await CasbinApi.notice.import(formData)
      ElMessage.success('导入成功')
      handleRefresh()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('导入失败:', error)
        ElMessage.error('导入失败')
      }
    }
  }
</script>

<style scoped lang="scss">
  .notice-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
