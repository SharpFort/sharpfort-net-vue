<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-4">
    <el-form :inline="true" :model="form" class="flex flex-wrap items-center gap-2 -mb-4">
      <el-form-item label="名称检索" class="!mb-4">
        <el-input v-model.trim="form.SearchKey"
          placeholder="请输入供应商名称"
          clearable
          class="w-64"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
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
import { reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  SearchKey: ''
})

const handleSearch = () => {
  emit('search', { ...form })
}

const handleReset = () => {
  form.SearchKey = ''
  emit('reset')
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
</style>

