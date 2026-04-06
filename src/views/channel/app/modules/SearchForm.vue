<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4">
    <el-form :inline="true" :model="form" class="flex flex-wrap items-center gap-2 -mb-4">
      <el-form-item label="应用检索" class="!mb-4">
        <el-input
          v-model="form.SearchKey"
          placeholder="请输入应用名称"
          clearable
          class="w-64"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="时间范围" class="!mb-4">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="!w-64"
        />
      </el-form-item>

      <el-form-item class="!mb-4 ml-auto">
        <el-button type="primary" @click="handleSearch" class="shadow-sm">
          <el-icon class="mr-1"><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon class="mr-1"><Refresh /></el-icon> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  SearchKey: '',
  StartTime: '',
  EndTime: ''
})

const dateRange = ref<[string, string] | null>(null)

const handleSearch = () => {
  const query = { ...form }
  if (dateRange.value && dateRange.value.length === 2) {
    query.StartTime = `${dateRange.value[0]}T00:00:00`
    query.EndTime = `${dateRange.value[1]}T23:59:59`
  } else {
    query.StartTime = ''
    query.EndTime = ''
  }
  emit('search', query)
}

const handleReset = () => {
  form.SearchKey = ''
  form.StartTime = ''
  form.EndTime = ''
  dateRange.value = null
  emit('reset')
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
</style>
