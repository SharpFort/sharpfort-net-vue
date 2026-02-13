<template>
  <div class="sequence-page art-full-height">
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
          <ElButton type="primary" @click="handleCreate" v-ripple>新增规则</ElButton>
          <ElButton @click="handleTestGenerate" v-ripple>测试生成</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        tableLayout="auto"
        @page-change="handlePageChange"
      />
    </ElCard>

    <!-- 规则编辑/新增弹窗 -->
    <SequenceRuleDialog
      v-model:visible="dialogVisible"
      :edit-data="currentRule"
      @submit="handleSubmit"
    />

    <!-- 测试生成弹窗 -->
    <TestGenerateDialog v-model:visible="testDialogVisible" />
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted, computed, h } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { SequenceApi, SequenceRuleDto } from '@/api/sequence'
  import SequenceRuleDialog from './modules/sequence-rule-dialog.vue'
  import TestGenerateDialog from './modules/test-generate-dialog.vue'

  defineOptions({ name: 'SequenceRule' })

  // 状态
  const loading = ref(false)
  const dialogVisible = ref(false)
  const testDialogVisible = ref(false)
  const currentRule = ref<SequenceRuleDto | null>(null)
  const tableData = ref<SequenceRuleDto[]>([])
  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    current: 1,
    size: 10
  })

  // 搜索
  const formFilters = reactive({
    ruleName: '',
    ruleCode: ''
  })

  const formItems = computed(() => [
    { label: '规则名称', key: 'ruleName', type: 'input', props: { clearable: true } },
    { label: '规则代码', key: 'ruleCode', type: 'input', props: { clearable: true } }
  ])

  // 初始化
  onMounted(() => {
    getList()
  })

  const getList = async () => {
    loading.value = true
    try {
      const params = {
        SkipCount: (pagination.currentPage - 1) * pagination.pageSize,
        MaxResultCount: pagination.pageSize,
        RuleName: formFilters.ruleName || undefined,
        RuleCode: formFilters.ruleCode || undefined
      }
      const res = await SequenceApi.sequenceRule.getList(params)
      tableData.value = res.items
      pagination.total = res.totalCount
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.currentPage = 1
    pagination.current = 1
    getList()
  }

  const handleReset = () => {
    formFilters.ruleName = ''
    formFilters.ruleCode = ''
    handleSearch()
  }

  const handlePageChange = (page: number, size: number) => {
    pagination.currentPage = page
    pagination.pageSize = size
    pagination.current = page
    pagination.size = size
    getList()
  }

  const handleRefresh = () => {
    getList()
  }

  // 操作
  const handleCreate = () => {
    currentRule.value = null
    dialogVisible.value = true
  }

  const handleEdit = (row: SequenceRuleDto) => {
    currentRule.value = { ...row }
    dialogVisible.value = true
  }

  const handleDelete = async (row: SequenceRuleDto) => {
    try {
      await ElMessageBox.confirm(`确定要删除规则 [${row.ruleName}] 吗？`, '警告', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await SequenceApi.sequenceRule.del(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (e) {
      if (e !== 'cancel') console.error(e)
    }
  }

  const handleTestGenerate = () => {
    testDialogVisible.value = true
  }

  const handleSubmit = async () => {
    dialogVisible.value = false
    getList()
  }

  // 表格列
  const { columnChecks, columns } = useTableColumns(() => [
    { type: 'index', label: '序号', width: 60, align: 'center' },
    { prop: 'ruleName', label: '规则名称', minWidth: 150 },
    { prop: 'ruleCode', label: '规则代码', width: 150 },
    { prop: 'template', label: '模板', minWidth: 200 },
    { prop: 'currentValue', label: '当前值', width: 100 },
    { prop: 'step', label: '步长', width: 80 },
    { prop: 'seqLength', label: '序列长度', width: 100 },
    {
      prop: 'resetType',
      label: '重置类型',
      width: 120,
      formatter: (row: SequenceRuleDto) => {
        const types: Record<string, string> = {
          None: '不重置',
          Daily: '每天',
          Weekly: '每周',
          Monthly: '每月',
          Quarterly: '每季度',
          Yearly: '每年',
          FiscalYearly: '财年'
        }
        return types[row.resetType || 'None'] || row.resetType
      }
    },
    { prop: 'creationTime', label: '创建时间', width: 180 },
    {
      prop: 'operation',
      label: '操作',
      width: 150,
      fixed: 'right',
      align: 'center',
      formatter: (row: SequenceRuleDto) => {
        return h('div', { class: 'flex justify-center gap-1' }, [
          h(ArtButtonTable, { type: 'edit', onClick: () => handleEdit(row) }),
          h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row) })
        ])
      }
    }
  ])
</script>

<style scoped lang="scss">
  .sequence-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }
</style>
