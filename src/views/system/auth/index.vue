<!-- 三方账号管理页面 -->
<template>
  <div class="system-auth-page art-custom-card">
    <div class="art-custom-card-container">
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
          <template #right>
            <!-- 暂时没有批量删除接口， swagger显示 ids是数组，但通常三方绑定是单个管理的，这里先不加批量删除按钮，或者仅在表格行内操作 -->
            <!-- <ElButton type="danger" @click="handleBatchDelete" :disabled="!selection.length">
              批量删除
            </ElButton> -->
            <ElButton type="success" @click="testDialogVisible = true"> 三方认证测试 </ElButton>
            <ElUpload
              class="inline-block mx-2"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImport"
            >
              <ElButton type="warning" :loading="importLoading"> 导入 </ElButton>
            </ElUpload>
            <ElButton type="primary" @click="handleExport" :loading="exportLoading">
              导出
            </ElButton>
          </template>
        </ArtTableHeader>

        <ArtTable
          ref="tableRef"
          rowKey="id"
          :loading="loading"
          :columns="columns"
          :data="tableData"
          :stripe="true"
          @selection-change="handleSelectionChange"
        >
          <template #action="{ row }">
            <ElButton type="primary" link @click="handleDetail(row)"> 详情 </ElButton>
            <ElButton type="danger" link @click="handleDelete(row)"> 解绑 </ElButton>
          </template>
        </ArtTable>

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
      </ElCard>
    </div>

    <!-- 详情弹窗 -->
    <ElDialog v-model="detailVisible" title="认证详情" width="500px">
      <ElDescriptions :column="1" border v-if="detailData">
        <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户ID">{{ detailData.userId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="名称">{{ detailData.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="OpenId">{{ detailData.openId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="认证类型">{{ detailData.authType }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detailData.creationTime }}</ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>

    <!-- 测试第三方接口弹窗 -->
    <ElDialog v-model="testDialogVisible" title="第三方接口测试" width="700px">
      <ElTabs v-model="activeTestTab">
        <ElTabPane label="OAuth登录" name="login">
          <ElForm :model="testForm">
            <ElFormItem label="Scheme (如 Github)"
              ><ElInput v-model.trim="testForm.scheme"
            /></ElFormItem>
            <ElFormItem label="Code"><ElInput v-model.trim="testForm.code" /></ElFormItem>
            <ElButton type="primary" @click="testOauthLogin">发起 OauthLogin</ElButton>
          </ElForm>
        </ElTabPane>
        <ElTabPane label="OAuth绑定" name="bind">
          <ElForm :model="testForm">
            <ElFormItem label="Scheme (如 Github)"
              ><ElInput v-model.trim="testForm.scheme"
            /></ElFormItem>
            <ElFormItem label="Code"><ElInput v-model.trim="testForm.code" /></ElFormItem>
            <ElButton type="primary" @click="testOauthBind">发起 OauthBind</ElButton>
          </ElForm>
        </ElTabPane>
        <ElTabPane label="获取绑定信息" name="info">
          <ElForm :model="testForm">
            <ElFormItem label="OpenId"><ElInput v-model.trim="testForm.openId" /></ElFormItem>
            <ElFormItem label="AuthType"><ElInput v-model.trim="testForm.authType" /></ElFormItem>
            <ElFormItem label="UserId"><ElInput v-model.trim="testForm.userId" /></ElFormItem>
            <ElButton type="primary" @click="testAuthInfo">获取 (TryGetAuthInfo)</ElButton>
          </ElForm>
        </ElTabPane>
        <ElTabPane label="当前用户Auth" name="account">
          <ElButton type="primary" @click="testGetAuthAccount"
            >获取我的绑定列 (GetAuthAccount)</ElButton
          >
          <div v-if="testResult" class="mt-4 p-4 bg-gray-100 rounded">
            <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
          </div>
        </ElTabPane>
      </ElTabs>
      <div v-if="activeTestTab !== 'account' && testResult" class="mt-4 p-4 bg-gray-100 rounded">
        <strong>结果:</strong><br />
        <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { thirdParty } from '@/api/auth'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { downloadFile } from '@/utils/file'

  defineOptions({ name: 'SystemAuth' })

  // 状态管理
  const loading = ref(false)
  const exportLoading = ref(false)
  const tableData = ref<Api.Auth.AuthOutputDto[]>([])
  const selection = ref<Api.Auth.AuthOutputDto[]>([])

  // 分页
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 搜索相关
  interface SearchForm extends Api.Auth.AuthSearchParams {
    dateRange?: [string, string]
  }

  const formFilters = reactive<SearchForm>({
    UserId: undefined,
    OpenId: undefined,
    AuthType: undefined,
    dateRange: undefined
  })

  const formItems = computed(() => [
    {
      label: '用户ID',
      key: 'UserId',
      type: 'input',
      props: { clearable: true, placeholder: '请输入用户ID' }
    },
    {
      label: 'OpenId',
      key: 'OpenId',
      type: 'input',
      props: { clearable: true, placeholder: '请输入OpenId' }
    },
    {
      label: '认证类型',
      key: 'AuthType',
      type: 'input', // 后续可以改为Select，如果知道具体的类型列表 (如 Github, Gitee)
      props: { clearable: true, placeholder: '请输入认证类型' }
    },
    {
      label: '创建时间',
      key: 'dateRange',
      type: 'daterange',
      props: {
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]
      }
    }
  ])

  onMounted(() => {
    getAuthList()
  })

  /**
   * 获取认证列表
   */
  const getAuthList = async (): Promise<void> => {
    loading.value = true
    try {
      const { dateRange, ...params } = formFilters
      if (dateRange && dateRange.length === 2) {
        params.StartTime = dateRange[0]
        params.EndTime = dateRange[1]
      }

      const res = await thirdParty.getList({
        ...params,
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size,
        Sorting: 'creationTime desc'
      })
      tableData.value = (res as any).items || []
      pagination.total = (res as any).totalCount || 0
    } catch (error) {
      console.error('获取认证列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出Excel
   */
  const handleExport = async (): Promise<void> => {
    exportLoading.value = true
    try {
      const { dateRange, ...params } = formFilters
      if (dateRange && dateRange.length === 2) {
        params.StartTime = dateRange[0]
        params.EndTime = dateRange[1]
      }

      const blob = await thirdParty.export({
        ...params,
        SkipCount: 0,
        MaxResultCount: 1000 // 导出数量限制
      })
      downloadFile(blob, `三方认证_${new Date().getTime()}.xlsx`)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    } finally {
      exportLoading.value = false
    }
  }

  /**
   * 导入Excel
   */
  const importLoading = ref(false)
  const handleImport = async (file: any) => {
    importLoading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file.raw)
      await thirdParty.import(formData)
      ElMessage.success('导入成功')
      handleRefresh()
    } catch (error) {
      console.error('导入失败:', error)
      ElMessage.error('导入失败')
    } finally {
      importLoading.value = false
    }
  }

  /**
   * 详情
   */
  const detailVisible = ref(false)
  const detailData = ref<Api.Account.AuthOutputDto | null>(null)
  const handleDetail = async (row: Api.Account.AuthOutputDto) => {
    try {
      const res = await thirdParty.get(row.id)
      detailData.value = res
      detailVisible.value = true
    } catch (error) {
      console.error('获取详情失败:', error)
      ElMessage.error('获取详情失败')
    }
  }

  /**
   * 测试弹窗相关状态与逻辑
   */
  const testDialogVisible = ref(false)
  const activeTestTab = ref('login')
  const testForm = reactive({
    scheme: 'Github',
    code: '',
    openId: '',
    authType: '',
    userId: ''
  })
  const testResult = ref<any>(null)

  const testOauthLogin = async () => {
    try {
      const res = await thirdParty.oauthLogin(testForm.scheme, testForm.code)
      testResult.value = res || 'Success (No return payload)'
      ElMessage.success('OAuth Login 请求发送成功')
    } catch (error) {
      testResult.value = error
    }
  }

  const testOauthBind = async () => {
    try {
      await thirdParty.oauthBind(testForm.scheme, testForm.code)
      testResult.value = 'Success (No return payload)'
      ElMessage.success('OAuth Bind 请求发送成功')
    } catch (error) {
      testResult.value = error
    }
  }

  const testAuthInfo = async () => {
    try {
      const res = await thirdParty.getAuthInfo({
        openId: testForm.openId,
        authType: testForm.authType,
        userId: testForm.userId
      })
      testResult.value = res || 'No Data Found'
      ElMessage.success('尝试获取绑定信息成功')
    } catch (error) {
      testResult.value = error
    }
  }

  const testGetAuthAccount = async () => {
    try {
      const res = await thirdParty.getAuthAccount()
      testResult.value = res || []
      ElMessage.success('成功检索当前账号三方绑定信息')
    } catch (error) {
      testResult.value = error
    }
  }

  /**
   * 删除认证
   */
  const handleDelete = (row: Api.Auth.AuthOutputDto): void => {
    ElMessageBox.confirm(
      `确认解除用户 ${row.name || row.userId} 的 ${row.authType} 绑定吗？`,
      '提示',
      {
        type: 'warning'
      }
    ).then(async () => {
      try {
        await thirdParty.delete(row.id)
        ElMessage.success('解绑成功')
        getAuthList()
      } catch (error) {
        console.error('解绑失败:', error)
      }
    })
  }

  const handleSelectionChange = (val: Api.Auth.AuthOutputDto[]) => {
    selection.value = val
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    { type: 'selection', width: 55 },
    {
      prop: 'userId',
      label: '用户ID',
      width: 300,
      showOverflowTooltip: true
    },
    {
      prop: 'name', // 这个name可能是第三方昵称，也可能是当前账户名，API dto里有 name
      label: '显示名称',
      width: 150
    },
    {
      prop: 'authType',
      label: '认证类型',
      width: 120
    },
    {
      prop: 'openId',
      label: 'OpenId',
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: 'creationTime',
      label: '绑定时间',
      width: 180,
      formatter: (row: any) => {
        return row.creationTime ? row.creationTime.replace('T', ' ').split('.')[0] : ''
      }
    },
    {
      prop: 'action',
      label: '操作',
      width: 100,
      fixed: 'right',
      slot: 'action' // Use slot instead of render
    }
  ])

  const handleReset = (): void => {
    Object.assign(formFilters, {
      UserId: undefined,
      OpenId: undefined,
      AuthType: undefined,
      dateRange: undefined
    })
    handleSearch()
  }

  const handleSearch = (): void => {
    pagination.current = 1
    getAuthList()
  }

  const handleRefresh = (): void => {
    getAuthList()
  }

  const handlePageChange = (): void => {
    getAuthList()
  }
</script>

<style scoped lang="scss">
  .system-auth-page {
    .art-custom-card-container {
      padding: 20px;
      background-color: var(--art-bg-color);
    }
  }
</style>
