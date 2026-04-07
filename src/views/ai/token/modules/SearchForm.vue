<template>
  <div class="bg-white p-4 rounded shadow-sm">
    <el-form :inline="true" :model="form" class="flex flex-wrap items-center">
      <el-form-item label="关键字">
        <el-input v-model.trim="form.searchKey"
          placeholder="搜索 Token 名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="创建日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const emit = defineEmits(['search', 'reset'])

const form = reactive({
  searchKey: ''
})

const dateRange = ref<[string, string] | null>(null)

const handleSearch = () => {
  const params: any = {
    searchKey: form.searchKey
  }
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = `${dateRange.value[0]}T00:00:00`
    params.endTime = `${dateRange.value[1]}T23:59:59`
  }
  emit('search', params)
}

const handleReset = () => {
  form.searchKey = ''
  dateRange.value = null
  emit('reset')
}
</script>

