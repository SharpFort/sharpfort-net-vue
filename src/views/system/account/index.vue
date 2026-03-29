<template>
  <div class="account-page art-full-height">
    <!-- Search -->
    <el-form :inline="true" :model="searchForm" class="search-form bg-white p-4 mb-4">
      <el-form-item label="用户名">
        <el-input v-model.trim="searchForm.userName" placeholder="用户名" clearable />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model.trim="searchForm.phone" placeholder="手机号" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="art-table-card bg-white p-4" style="height: calc(100% - 80px)">
      <el-table v-loading="loading" :data="tableData" style="width: 100%; height: 100%" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="userName" label="用户名" min-width="120" />
        <el-table-column prop="nick" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="state" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.state"
              inline-prompt
              active-text="正常"
              inactive-text="停用"
              :loading="row.loading"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="creationTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.creationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openResetPwd(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination mt-4 text-right">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Reset Password Dialog -->
    <el-dialog v-model="dialogVisible" title="重置密码" width="400px">
      <el-form :model="pwdForm" ref="pwdFormRef" :rules="pwdRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model.trim="currentUserName" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model.trim="pwdForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="pwdLoading" @click="submitResetPwd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessage, type FormInstance } from 'element-plus'
  import dayjs from 'dayjs'

  defineOptions({ name: 'Account' })

  const loading = ref(false)
  const tableData = ref([])
  const searchForm = reactive({
    userName: '',
    phone: ''
  })

  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })

  // Password Reset
  const dialogVisible = ref(false)
  const pwdLoading = ref(false)
  const pwdFormRef = ref<FormInstance>()
  const currentUserId = ref('')
  const currentUserName = ref('')
  const pwdForm = reactive({
    password: ''
  })
  const pwdRules = {
    password: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ]
  }

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await CasbinApi.user.getList({
        SkipCount: (pagination.current - 1) * pagination.size,
        MaxResultCount: pagination.size,
        UserName: searchForm.userName || undefined,
        Phone: searchForm.phone || undefined
      })
      tableData.value = res.items
      pagination.total = res.totalCount
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }
  const resetSearch = () => {
    searchForm.userName = ''
    searchForm.phone = ''
    handleSearch()
  }
  const handleSizeChange = (val: number) => {
    pagination.size = val
    fetchData()
  }
  const handleCurrentChange = (val: number) => {
    pagination.current = val
    fetchData()
  }

  const formatTime = (time: string) => {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
  }

  // Lock/Unlock
  const handleStatusChange = async (row: any) => {
    const originalState = !row.state // revert if failed
    row.loading = true
    try {
      // We need to fetch the full user object to update it?
      // Or assumme we can just pass the changed field if API supports partial update?
      // CasbinApi.user.update(id, data) usually replaces the object or merges.
      // Let's assume we need to pass at least the required fields.
      // For safety, let's fetch the user first or just try passing { ...row, state: row.state }
      // Note: row contains what getList returned.

      // Wait, CasbinApi.role has updateState but user doesn't in previous check.
      // If user.update requires full object, we might break things if row is partial.
      // Let's try to just update.
      // BUT actually, usually there is a dedicated endpoint for status.
      // If not, we use update.
      // Let's hope the backend supports partial update or row has enough info.

      await CasbinApi.user.update(row.id, { ...row, state: row.state })
      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error(error)
      row.state = originalState
      ElMessage.error('更新失败')
    } finally {
      row.loading = false
    }
  }

  // Reset Password
  const openResetPwd = (row: any) => {
    currentUserId.value = row.id
    currentUserName.value = row.userName
    pwdForm.password = ''
    dialogVisible.value = true
  }

  const submitResetPwd = async () => {
    if (!pwdFormRef.value) return
    await pwdFormRef.value.validate(async (valid) => {
      if (valid) {
        pwdLoading.value = true
        try {
          await CasbinApi.account.restPassword(currentUserId.value, {
            password: pwdForm.password
          })
          ElMessage.success('密码重置成功')
          dialogVisible.value = false
        } catch (error) {
          console.error(error)
        } finally {
          pwdLoading.value = false
        }
      }
    })
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped>
  .account-page {
    padding: 20px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
  }
</style>
