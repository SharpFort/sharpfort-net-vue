<template>
  <el-dialog
    v-model="dialogVisible"
    title="实体详情"
    width="900px"
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-descriptions title="实体基本信息" :column="2" border class="mb-4">
        <el-descriptions-item label="实体类名" :span="1">
          {{ detail.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="物理表名" :span="1">
          {{ detail.physicalTableName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ detail.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="所属模块" :span="1">
          {{ detail.moduleName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="所属项目" :span="1">
          {{ detail.projectName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="根命名空间" :span="2">
          {{ detail.rootNamespace || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="覆盖已有文件" :span="1">
          <el-tag :type="detail.isOverwrite ? 'success' : 'info'" size="small">
            {{ detail.isOverwrite ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后同步时间" :span="1">
          {{ formatTime(detail.lastSyncTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后生成时间" :span="2">
          {{ formatTime(detail.lastBuildTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联字段列表 -->
      <el-divider content-position="left">
        关联字段列表
        <span class="text-sm text-gray-400 ml-2">（共 {{ fields.length }} 个）</span>
      </el-divider>
      <el-table :data="fields" border stripe max-height="400" size="small">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="字段名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="fieldType" label="类型" width="90" align="center" />
        <el-table-column prop="length" label="长度" width="70" align="center" />
        <el-table-column label="主键" width="60" align="center">
          <template #default="{ row: f }">
            <el-tag :type="f.isKey ? 'danger' : 'info'" size="small">{{
              f.isKey ? '是' : '否'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="必填" width="60" align="center">
          <template #default="{ row: f }">
            <el-tag :type="f.isRequired ? 'warning' : 'info'" size="small">{{
              f.isRequired ? '是' : '否'
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="查询" width="60" align="center">
          <template #default="{ row: f }">
            <span :class="f.isQueryField ? 'text-green-600' : 'text-gray-400'">{{
              f.isQueryField ? '✓' : '✗'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="列表" width="60" align="center">
          <template #default="{ row: f }">
            <span :class="f.isListDisplay ? 'text-green-600' : 'text-gray-400'">{{
              f.isListDisplay ? '✓' : '✗'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="表单" width="60" align="center">
          <template #default="{ row: f }">
            <span :class="f.isFormItem ? 'text-green-600' : 'text-gray-400'">{{
              f.isFormItem ? '✓' : '✗'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="htmlType" label="控件" width="80" align="center" />
        <el-table-column prop="description" label="描述" min-width="120" show-overflow-tooltip />
      </el-table>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { CodeGenApi } from '@/api/code-gen'
  import { ElMessage } from 'element-plus'
  import dayjs from 'dayjs'

  interface Props {
    visible: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const detail = reactive<Record<string, any>>({})
  const fields = ref<Api.CodeGen.FieldDto[]>([])

  const formatTime = (time?: string | null) => {
    if (!time) return '-'
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
  }

  const open = async (id: string) => {
    loading.value = true
    try {
      const res = await CodeGenApi.table.get(id)
      Object.assign(detail, {
        id: res.id,
        name: res.name || '',
        physicalTableName: res.physicalTableName || '',
        description: res.description || '',
        moduleName: res.moduleName || '',
        projectName: res.projectName || '',
        rootNamespace: res.rootNamespace || '',
        isOverwrite: res.isOverwrite ?? false,
        lastSyncTime: res.lastSyncTime || '',
        lastBuildTime: res.lastBuildTime || ''
      })
      fields.value = res.fields || []
    } catch (e: any) {
      ElMessage.error(e.message || '获取实体详情失败')
    } finally {
      loading.value = false
    }
  }

  const handleClosed = () => {
    Object.assign(detail, {})
    fields.value = []
  }

  defineExpose({ open })
</script>
