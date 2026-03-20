<template>
  <el-dialog
    v-model="visible"
    :title="`授权账号 - ${roleData?.roleName || ''}`"
    width="900px"
    @open="handleOpen"
    append-to-body
    destroy-on-close
  >
    <el-tabs v-model="activeName" @tab-change="handleTabChange">
      <!-- 已分配用户 -->
      <el-tab-pane label="已分配用户" name="allocated">
        <div class="filter-container" style="display: flex; gap: 10px; margin-bottom: 12px">
          <el-input
            v-model="allocatedQuery.userName"
            placeholder="用户名"
            style="width: 200px"
            clearable
            @keyup.enter="getAllocatedData"
          />
          <el-input
            v-model="allocatedQuery.phone"
            placeholder="手机号"
            style="width: 200px"
            clearable
            @keyup.enter="getAllocatedData"
          />
          <el-button type="primary" @click="getAllocatedData">搜索</el-button>
          <el-button @click="resetAllocatedQuery">重置</el-button>
          <el-button type="danger" :disabled="!allocatedSelection.length" @click="handleBatchRemove"
            >批量取消分配</el-button
          >
        </div>

        <el-table
          v-loading="allocatedLoading"
          :data="allocatedData"
          border
          @selection-change="handleAllocatedSelection"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="用户名" prop="userName" />
          <el-table-column label="昵称" prop="nickName" />
          <el-table-column label="邮箱" prop="userEmail" />
          <el-table-column label="手机" prop="userPhone" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.status === '1' || row.state || row.isActive ? 'success' : 'danger'"
              >
                {{ row.status === '1' || row.state || row.isActive ? '正常' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleRemove(row)">取消分配</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px">
          <el-pagination
            v-model:current-page="allocatedQuery.current"
            v-model:page-size="allocatedQuery.size"
            :total="allocatedTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @change="getAllocatedData"
          />
        </div>
      </el-tab-pane>

      <!-- 未分配用户 -->
      <el-tab-pane label="未分配用户" name="unallocated">
        <div class="filter-container" style="display: flex; gap: 10px; margin-bottom: 12px">
          <el-input
            v-model="unallocatedQuery.userName"
            placeholder="用户名"
            style="width: 200px"
            clearable
            @keyup.enter="getUnallocatedData"
          />
          <el-input
            v-model="unallocatedQuery.phone"
            placeholder="手机号"
            style="width: 200px"
            clearable
            @keyup.enter="getUnallocatedData"
          />
          <el-button type="primary" @click="getUnallocatedData">搜索</el-button>
          <el-button @click="resetUnallocatedQuery">重置</el-button>
          <el-button type="primary" :disabled="!unallocatedSelection.length" @click="handleBatchAdd"
            >批量分配角色</el-button
          >
        </div>

        <el-table
          v-loading="unallocatedLoading"
          :data="unallocatedData"
          border
          @selection-change="handleUnallocatedSelection"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="用户名" prop="userName" />
          <el-table-column label="昵称" prop="nickName" />
          <el-table-column label="邮箱" prop="userEmail" />
          <el-table-column label="手机" prop="userPhone" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.status === '1' || row.state || row.isActive ? 'success' : 'danger'"
              >
                {{ row.status === '1' || row.state || row.isActive ? '正常' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleAdd(row)">分配角色</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px">
          <el-pagination
            v-model:current-page="unallocatedQuery.current"
            v-model:page-size="unallocatedQuery.size"
            :total="unallocatedTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @change="getUnallocatedData"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    roleData: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['update:modelValue', 'success'])

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const activeName = ref('allocated')

  // 已分配
  const allocatedLoading = ref(false)
  const allocatedData = ref<any[]>([])
  const allocatedTotal = ref(0)
  const allocatedQuery = reactive({
    current: 1,
    size: 10,
    userName: '',
    phone: ''
  })
  const allocatedSelection = ref<any[]>([])

  // 未分配
  const unallocatedLoading = ref(false)
  const unallocatedData = ref<any[]>([])
  const unallocatedTotal = ref(0)
  const unallocatedQuery = reactive({
    current: 1,
    size: 10,
    userName: '',
    phone: ''
  })
  const unallocatedSelection = ref<any[]>([])

  const handleOpen = () => {
    activeName.value = 'allocated'
    resetAllocatedQuery()
    resetUnallocatedQuery()
    getAllocatedData()
  }

  const handleTabChange = (name: any) => {
    if (name === 'allocated') {
      getAllocatedData()
    } else {
      getUnallocatedData()
    }
  }

  // 查询已分配
  const getAllocatedData = async () => {
    if (!props.roleData?.id) return
    allocatedLoading.value = true
    try {
      const res = await CasbinApi.role.getAuthUsers(props.roleData.id, true, {
        SkipCount: (allocatedQuery.current - 1) * allocatedQuery.size,
        MaxResultCount: allocatedQuery.size,
        UserName: allocatedQuery.userName || undefined,
        Phone: allocatedQuery.phone || undefined
      })
      allocatedData.value = res.items || []
      allocatedTotal.value = res.totalCount || 0
    } catch (err) {
      console.error(err)
    } finally {
      allocatedLoading.value = false
    }
  }

  const resetAllocatedQuery = () => {
    allocatedQuery.current = 1
    allocatedQuery.size = 10
    allocatedQuery.userName = ''
    allocatedQuery.phone = ''
    if (visible.value && activeName.value === 'allocated') {
      getAllocatedData()
    }
  }

  const handleAllocatedSelection = (val: any[]) => {
    allocatedSelection.value = val
  }

  // 查询未分配
  const getUnallocatedData = async () => {
    if (!props.roleData?.id) return
    unallocatedLoading.value = true
    try {
      const res = await CasbinApi.role.getAuthUsers(props.roleData.id, false, {
        SkipCount: (unallocatedQuery.current - 1) * unallocatedQuery.size,
        MaxResultCount: unallocatedQuery.size,
        UserName: unallocatedQuery.userName || undefined,
        Phone: unallocatedQuery.phone || undefined
      })
      unallocatedData.value = res.items || []
      unallocatedTotal.value = res.totalCount || 0
    } catch (err) {
      console.error(err)
    } finally {
      unallocatedLoading.value = false
    }
  }

  const resetUnallocatedQuery = () => {
    unallocatedQuery.current = 1
    unallocatedQuery.size = 10
    unallocatedQuery.userName = ''
    unallocatedQuery.phone = ''
    if (visible.value && activeName.value === 'unallocated') {
      getUnallocatedData()
    }
  }

  const handleUnallocatedSelection = (val: any[]) => {
    unallocatedSelection.value = val
  }

  // 移除（单条）
  const handleRemove = async (row: any) => {
    try {
      await ElMessageBox.confirm(`确认取消分配用户 "${row.userName}" 吗？`, '提示', {
        type: 'warning'
      })
      await CasbinApi.role.removeAuthUsers({
        roleId: props.roleData.id,
        userIds: [row.id]
      })
      ElMessage.success('取消分配成功')
      getAllocatedData()
      emit('success')
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '操作失败')
      }
    }
  }

  // 批量移除
  const handleBatchRemove = async () => {
    if (!allocatedSelection.value.length) return
    try {
      await ElMessageBox.confirm(
        `确认取消分配选中的 ${allocatedSelection.value.length} 个用户吗？`,
        '提示',
        { type: 'warning' }
      )
      await CasbinApi.role.removeAuthUsers({
        roleId: props.roleData.id,
        userIds: allocatedSelection.value.map((v) => v.id)
      })
      ElMessage.success('取消分配成功')
      getAllocatedData()
      emit('success')
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error(e.message || '操作失败')
      }
    }
  }

  // 分配（单条）
  const handleAdd = async (row: any) => {
    try {
      await CasbinApi.role.addAuthUsers({
        roleId: props.roleData.id,
        userIds: [row.id]
      })
      ElMessage.success('分配成功')
      getUnallocatedData()
      emit('success')
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    }
  }

  // 批量分配
  const handleBatchAdd = async () => {
    if (!unallocatedSelection.value.length) return
    try {
      await CasbinApi.role.addAuthUsers({
        roleId: props.roleData.id,
        userIds: unallocatedSelection.value.map((v) => v.id)
      })
      ElMessage.success('分配成功')
      getUnallocatedData()
      emit('success')
    } catch (e: any) {
      ElMessage.error(e.message || '操作失败')
    }
  }
</script>
