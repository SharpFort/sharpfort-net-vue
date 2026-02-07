<template>
  <div class="user-log">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="登录日志" name="login">
        <div class="table-container">
          <el-table :data="loginLogs" v-loading="loadingLogin" style="width: 100%" stripe>
            <el-table-column prop="creationTime" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.creationTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="address" label="地点" min-width="150" show-overflow-tooltip />
            <el-table-column prop="browser" label="浏览器" show-overflow-tooltip />
            <el-table-column prop="os" label="操作系统" show-overflow-tooltip />
            <el-table-column prop="msg" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.msg === '登录成功' ? 'success' : 'danger'">{{ row.msg }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              v-model:current-page="loginParams.pageNum"
              v-model:page-size="loginParams.pageSize"
              :total="loginTotal"
              layout="total, prev, pager, next"
              @current-change="fetchLoginLogs"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="操作日志" name="operation">
        <div class="table-container">
          <el-table :data="opLogs" v-loading="loadingOp" style="width: 100%" stripe>
            <el-table-column prop="creationTime" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.creationTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="title" label="模块" width="120" />
            <el-table-column prop="businessType" label="类型" width="100" />
            <el-table-column prop="method" label="方法" width="100" />
            <el-table-column prop="requestMethod" label="请求方式" width="100" />
            <el-table-column prop="operIp" label="IP" width="140" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{
                  row.status === 0 ? '成功' : '失败'
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operTime" label="耗时(ms)" width="100" />
          </el-table>
          <div class="pagination">
            <el-pagination
              v-model:current-page="opParams.pageNum"
              v-model:page-size="opParams.pageSize"
              :total="opTotal"
              layout="total, prev, pager, next"
              @current-change="fetchOpLogs"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import dayjs from 'dayjs'

  const activeTab = ref('login')

  // Login Logs
  const loginLogs = ref([])
  const loadingLogin = ref(false)
  const loginTotal = ref(0)
  const loginParams = reactive({
    pageNum: 1,
    pageSize: 10
  })

  // Operation Logs
  const opLogs = ref([])
  const loadingOp = ref(false)
  const opTotal = ref(0)
  const opParams = reactive({
    pageNum: 1,
    pageSize: 10
  })

  const formatTime = (time: string) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  const fetchLoginLogs = async () => {
    loadingLogin.value = true
    try {
      // API: logs.login(params)
      // Params: SkipCount, MaxResultCount
      const res = await CasbinApi.logs.login({
        SkipCount: (loginParams.pageNum - 1) * loginParams.pageSize,
        MaxResultCount: loginParams.pageSize
        // Only fetch for current user? The API usually filters by permission or context.
        // If this is user-center, ideally it returns logs for current user.
        // If the API returns ALL logs, we might need a way to filter.
        // Swagger says /api/app/login-log. If it's an admin API, it returns all.
        // If we want "My Logs", usually the backend handles it or we pass userId.
        // Let's assume for now it returns what we have access to.
      })
      loginLogs.value = res.items
      loginTotal.value = res.totalCount
    } catch (error) {
      console.error(error)
    } finally {
      loadingLogin.value = false
    }
  }

  const fetchOpLogs = async () => {
    loadingOp.value = true
    try {
      const res = await CasbinApi.logs.operation({
        SkipCount: (opParams.pageNum - 1) * opParams.pageSize,
        MaxResultCount: opParams.pageSize
      })
      opLogs.value = res.items
      opTotal.value = res.totalCount
    } catch (error) {
      console.error(error)
    } finally {
      loadingOp.value = false
    }
  }

  onMounted(() => {
    fetchLoginLogs()
    fetchOpLogs()
  })
</script>

<style scoped>
  .user-log {
    padding: 10px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
  }
</style>
