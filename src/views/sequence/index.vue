<!-- 序号规则管理页面 -->
<template>
  <div class="sequence-page art-full-height">
    <!-- 搜索栏 -->
    <SequenceSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" v-ripple @click="showDialog('add')">新增规则</ElButton>
            <ElButton
              type="danger"
              v-ripple
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </ElButton>
            <ElButton v-ripple @click="handleTestGenerate">测试生成</ElButton>
            <ElButton type="warning" v-ripple @click="handleExport">导出Excel</ElButton>
            <ElButton type="success" v-ripple @click="handleImportClick">导入Excel</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data as SequenceRuleDto[]"
        :columns="columns"
        :pagination="pagination"
        table-layout="auto"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 规则编辑/新增弹窗 -->
      <SequenceRuleDialog
        v-model:visible="dialogVisible"
        :edit-data="currentRule"
        @submit="handleDialogSubmit"
      />

      <!-- 测试生成弹窗 -->
      <TestGenerateDialog v-model:visible="testDialogVisible" />

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
  import { h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import * as XLSX from 'xlsx'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    SequenceApi,
    SequenceRuleDto,
    SequenceRuleSearchParams,
    CreateSequenceRuleInput
  } from '@/api/sequence'
  import SequenceSearch from './modules/sequence-search.vue'
  import SequenceRuleDialog from './modules/sequence-rule-dialog.vue'
  import TestGenerateDialog from './modules/test-generate-dialog.vue'
  import { DialogType } from '@/types'

  defineOptions({ name: 'SequenceRule' })

  // 弹窗相关
  const dialogVisible = ref(false)
  const testDialogVisible = ref(false)
  const currentRule = ref<SequenceRuleDto | null>(null)

  // 选中行
  const selectedRows = ref<SequenceRuleDto[]>([])

  // 文件上传
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // 搜索表单
  const searchForm = ref<SequenceRuleSearchParams>({
    RuleName: undefined,
    RuleCode: undefined,
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
        return SequenceApi.sequenceRule.getList({
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
        { prop: 'ruleName', label: '规则名称', minWidth: 140 },
        { prop: 'ruleCode', label: '规则代码', width: 140 },
        { prop: 'template', label: '模板', minWidth: 180, showOverflowTooltip: true },
        { prop: 'currentValue', label: '当前值', width: 90, align: 'center' },
        { prop: 'step', label: '步长', width: 70, align: 'center' },
        { prop: 'seqLength', label: '序列长度', width: 90, align: 'center' },
        {
          prop: 'resetType',
          label: '重置类型',
          width: 110,
          formatter: (row: SequenceRuleDto) => {
            const RESET_LABELS: Record<string, string> = {
              None: '不重置',
              Daily: '按日',
              Weekly: '按周',
              Monthly: '按月',
              Quarterly: '按季度',
              Yearly: '按年',
              FiscalYearly: '按财年'
            }
            return RESET_LABELS[row.resetType ?? 'None'] ?? row.resetType
          }
        },
        {
          prop: 'lastResetTime',
          label: '最后重置',
          width: 180,
          showOverflowTooltip: true
        },
        { prop: 'creationTime', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          align: 'center',
          formatter: (row: SequenceRuleDto) =>
            h('div', { class: 'flex justify-center gap-1' }, [
              h(ArtButtonTable, {
                type: 'edit',
                label: '编辑',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, { type: 'delete', label: '删除', onClick: () => handleDelete(row) })
            ])
        }
      ]
    }
  })

  // ========================
  // 搜索 / 重置
  // ========================
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  // ========================
  // 弹窗操作
  // ========================
  const showDialog = (type: DialogType, row?: SequenceRuleDto) => {
    currentRule.value = type === 'edit' && row ? { ...row } : null
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentRule.value = null
    refreshData()
  }

  // ========================
  // 单行/批量删除
  // ========================
  const handleDelete = (row: SequenceRuleDto) => {
    ElMessageBox.confirm(`确定要删除规则 [${row.ruleName}] 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await SequenceApi.sequenceRule.del(row.id)
        ElMessage.success('删除成功')
        refreshRemove()
      })
      .catch(() => {})
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条规则吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        const ids = selectedRows.value.map((r) => r.id)
        await SequenceApi.sequenceRule.del(ids)
        ElMessage.success('批量删除成功')
        refreshRemove()
      })
      .catch(() => {})
  }

  const handleSelectionChange = (selection: SequenceRuleDto[]) => {
    selectedRows.value = selection
  }

  // ========================
  // 测试生成
  // ========================
  const handleTestGenerate = () => {
    testDialogVisible.value = true
  }

  // ========================
  // 导出
  // ========================
  const handleExport = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { current: _c, size: _s, ...others } = searchParams
      const response = await SequenceApi.sequenceRule.export(others)
      const blob = new Blob([response as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `序号规则_${new Date().getTime()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败', error)
      ElMessage.error('导出失败')
    }
  }

  // ========================
  // 导入
  // ========================
  const handleImportClick = () => {
    fileInputRef.value?.click()
  }

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const rawData = ev.target?.result
        const workbook = XLSX.read(rawData, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const results = XLSX.utils.sheet_to_json<CreateSequenceRuleInput>(worksheet)

        if (results.length === 0) {
          ElMessage.warning('文件内容为空')
          return
        }

        await SequenceApi.sequenceRule.import(results)
        ElMessage.success('导入成功')
        refreshData()
      } catch (error) {
        console.error('导入失败', error)
        ElMessage.error('导入失败，请检查文件格式')
      } finally {
        target.value = ''
      }
    }
    reader.readAsBinaryString(file)
  }
</script>

<style scoped lang="scss">
  .sequence-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
