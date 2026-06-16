<template>
  <div class="p-6 h-full flex flex-col space-y-4 bg-gray-50">
    <div class="bg-white p-4 rounded shadow-sm flex-1 flex flex-col">
      <div class="mb-4 flex space-x-2">
        <el-button type="primary" @click="handleAdd">新增任务</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        class="w-full flex-1"
        height="100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip />
        <el-table-column
          prop="content"
          label="任务内容(Prompt)"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column
          prop="cronExpression"
          label="Cron表达式"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleTrigger(row)">立即执行</el-button>
            <el-popconfirm title="确定要删除该任务吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <ModelDialog ref="dialogRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { aiTask } from '@/api/ai'
  import { ElMessage } from 'element-plus'
  import ModelDialog from './modules/ModelDialog.vue'

  defineOptions({ name: 'AiTask' })

  const loading = ref(false)
  const tableData = ref<Api.AiTask.AiTaskItem[]>([])
  const dialogRef = ref<InstanceType<typeof ModelDialog> | null>(null)

  const getList = async () => {
    loading.value = true
    try {
      const tasks = await aiTask.getList()
      if (Array.isArray(tasks)) {
        tableData.value = tasks.map((name) => ({
          name,
          content: '',
          cronExpression: ''
        }))
      }
    } catch (e: any) {
      ElMessage.error(e.message || '获取任务列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    dialogRef.value?.open()
  }

  const handleEdit = (row: Api.AiTask.AiTaskItem) => {
    dialogRef.value?.open(row)
  }

  const handleTrigger = async (row: Api.AiTask.AiTaskItem) => {
    try {
      await aiTask.trigger(row.name)
      ElMessage.success('任务已触发执行')
    } catch (e: any) {
      ElMessage.error(e.message || '触发失败')
    }
  }

  const handleDelete = async (row: Api.AiTask.AiTaskItem) => {
    try {
      await aiTask.delete(row.name)
      ElMessage.success('删除成功')
      getList()
    } catch (e: any) {
      ElMessage.error(e.message || '删除失败')
    }
  }

  onMounted(() => {
    getList()
  })
</script>
