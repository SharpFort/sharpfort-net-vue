<template>
  <div class="codegen-generate-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-ripple
              type="primary"
              :disabled="!selectedRows.length"
              @click="handleBuild('webToCode')"
            >
              <template #icon><ArtSvgIcon icon="ri:code-box-line" /></template>
              生成代码 (Web -> Code)
            </ElButton>
            <ElButton
              v-ripple
              type="success"
              :disabled="!selectedRows.length"
              @click="handleBuild('webToDb')"
            >
              <template #icon><ArtSvgIcon icon="ri:database-2-line" /></template>
              同步到数据库 (Web -> Db)
            </ElButton>
            <ElButton
              v-ripple
              type="warning"
              :disabled="!selectedRows.length"
              @click="handleBuild('codeToWeb')"
            >
              <template #icon><ArtSvgIcon icon="ri:layout-top-line" /></template>
              从代码同步 (Code -> Web)
            </ElButton>
            <ElButton
              v-ripple
              type="danger"
              :disabled="!selectedRows.length"
              @click="handleBuild('codeToDb')"
            >
              <template #icon><ArtSvgIcon icon="ri:database-line" /></template>
              从代码同步到数据库 (Code -> Db)
            </ElButton>
            <ElButton v-ripple @click="handleOpenDir">
              <template #icon><ArtSvgIcon icon="ri:folder-open-line" /></template>
              打开目录
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        tableLayout="fixed"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { CodeGenApi } from '@/api/code-gen'

  defineOptions({ name: 'CodeGenGenerate' })

  // 选中行
  const selectedRows = ref<Api.CodeGen.TableDto[]>([])

  // 搜索表单
  const searchForm = ref({
    Name: undefined
  })

  // 搜索配置
  const searchItems = computed(() => [
    {
      label: '表名',
      key: 'Name',
      type: 'input',
      placeholder: '请输入表名',
      clearable: true
    }
  ])

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
    refreshData
  } = useTable({
    core: {
      apiFn: (params: any) => {
        const { current, size, ...others } = params
        return CodeGenApi.table.getList({
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
          label: '表名',
          minWidth: 150
        },
        {
          prop: 'description',
          label: '备注',
          minWidth: 200,
          showOverflowTooltip: true
        }
      ]
    }
  })

  const handleSearch = (params?: Record<string, any>) => {
    Object.assign(searchParams, params || {})
    getData()
  }

  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
  }

  const handleBuild = async (type: 'webToCode' | 'webToDb' | 'codeToWeb' | 'codeToDb') => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要生成的表')
      return
    }

    const tableIds = selectedRows.value.map((row) => row.id)
    const typeLabels = {
      webToCode: '生成代码 (Web -> Code)',
      webToDb: '同步到数据库 (Web -> Db)',
      codeToWeb: '从代码同步 (Code -> Web)',
      codeToDb: '从代码同步到数据库 (Code -> Db)'
    }

    try {
      await ElMessageBox.confirm(`确定要执行 [${typeLabels[type]}] 操作吗？`, '提示', {
        type: 'info',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })

      switch (type) {
        case 'webToCode':
          await CodeGenApi.codegen.webToCode(tableIds)
          ElMessage.success('代码生成成功')
          break
        case 'webToDb':
          await CodeGenApi.codegen.webToDb(tableIds)
          ElMessage.success('数据库同步成功')
          break
        case 'codeToWeb':
          await CodeGenApi.codegen.codeToWeb(tableIds)
          ElMessage.success('代码同步成功')
          break
        case 'codeToDb':
          await CodeGenApi.codegen.codeToDb(tableIds)
          ElMessage.success('代码同步到数据库成功')
          break
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('操作失败:', error)
        // Global error handler handles API errors, but we catch cancel here
      }
    }
  }

  const handleOpenDir = () => {
    ElMessageBox.prompt('请输入要打开的目录路径', '打开目录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入目录路径'
    })
      .then(async ({ value }) => {
        if (!value) return
        await CodeGenApi.codegen.openDir(value)
        ElMessage.success('目录已打开')
      })
      .catch(() => {})
  }
</script>
