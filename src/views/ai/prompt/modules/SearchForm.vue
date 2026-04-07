<template>
  <el-form :model="query" inline class="search-form bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2">
    <el-form-item label="模糊搜索" class="!mb-0">
      <el-input v-model.trim="query.searchKey" 
        placeholder="搜索编码或描述..." 
        clearable 
        class="w-64"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item class="!mb-0 ml-auto">
      <el-button type="primary" @click="handleSearch" class="shadow-sm">
        <el-icon class="mr-1"><Search /></el-icon> 查询
      </el-button>
      <el-button @click="handleReset" class="shadow-sm">
        <el-icon class="mr-1"><Refresh /></el-icon> 重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(['search', 'reset'])

const query = reactive({
  searchKey: ''
})

const handleSearch = () => {
  emit('search', { ...query })
}

const handleReset = () => {
  query.searchKey = ''
  emit('reset')
}
</script>

