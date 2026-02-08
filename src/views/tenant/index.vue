<!-- 租户管理页面 -->
<template>
  <div class="tenant-page art-full-height">
    <!-- 搜索栏 -->
    <TenantSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" v-ripple @click="showDialog('add')">新增租户</ElButton>
            <ElButton type="warning" v-ripple @click="handleExport">导出Excel</ElButton>
            <ElButton type="success" v-ripple @click="handleImportClick">导入Excel</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as any[]"
        :columns="columns"
        :pagination="pagination"
        table-layout="auto"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 租户弹窗 -->
      <TenantDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :tenant-data="currentTenantData"
        @submit="handleDialogSubmit"
      />

      <!-- 隐藏的文件上传输入框 -->
      <input
        ref="fileInputRef"
        type="file"
        style="display: none"
        accept=".xlsx, .xls"
        @change="handleFileChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { TenantApi, TenantDto } from '@/api/tenant'
  import TenantSearch from './modules/tenant-search.vue'
  import TenantDialog from './modules/tenant-dialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'
  import * as XLSX from 'xlsx'

  defineOptions({ name: 'Tenant' })

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentTenantData = ref<any>({})

  // 选中行
  const selectedRows = ref<any[]>([])

  // 文件上传
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // 搜索表单
  const searchForm = ref({
    Name: undefined,
    StartTime: undefined,
    EndTime: undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshRemove
  } = useTable({
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return TenantApi.getList({
          SkipCount: (current - 1) * size,
          MaxResultCount: size,
          ...others
        })
      },
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '租户名称',
          minWidth: 150
        },
        {
          prop: 'dbType',
          label: '数据库类型',
          width: 120
        },
        {
          prop: 'tenantConnectionString',
          label: '连接字符串',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'creationTime',
          label: '创建日期',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 220,
          fixed: 'right',
          formatter: (row: any) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                label: '编辑',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                label: '删除',
                onClick: () => deleteTenant(row)
              }),
              h(ArtButtonTable, {
                icon: 'ri:database-2-line',
                title: '初始化',
                onClick: () => initTenant(row)
              })
            ])
        }
      ]
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showDialog = (type: DialogType, row?: any): void => {
    dialogType.value = type
    currentTenantData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteTenant = (row: any): void => {
    ElMessageBox.confirm(`确定要删除租户 [${row.name}] 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await TenantApi.del(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const initTenant = (row: any): void => {
    ElMessageBox.confirm(`确定要初始化租户 [${row.name}] 吗？这可能需要一些时间。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        await TenantApi.init(row.id)
        ElMessage.success('租户初始化成功')
      } catch (error) {
        console.error(error)
      }
    })
  }

  const handleExport = async () => {
    try {
      const response = await TenantApi.exportExcel(searchParams)
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `租户列表_${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败', error)
      ElMessage.error('导出失败')
    }
  }

  const handleImportClick = () => {
    fileInputRef.value?.click()
  }

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const results = XLSX.utils.sheet_to_json<TenantDto.TenantCreateInput>(worksheet)

        if (results.length === 0) {
          ElMessage.warning('文件内容为空')
          return
        }

        // 可以在这里进行一些简单的数据校验或转换
        // 假设Excel列名与 DTO 属性名一致，或者在这里映射

        await TenantApi.importExcel(results as any[])
        ElMessage.success('导入成功')
        refreshData()
      } catch (error) {
        console.error('导入失败', error)
        ElMessage.error('导入失败，请检查文件格式')
      } finally {
        // 清空 input，允许重复上传同一文件
        target.value = ''
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentTenantData.value = {}
    refreshData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }
</script>
