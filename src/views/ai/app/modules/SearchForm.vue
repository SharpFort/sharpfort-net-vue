<template>
  <el-form :model="form" inline class="bg-white p-4 rounded shadow-sm mb-4">
    <el-form-item label="关键字">
      <el-input v-model.trim="form.keyword" placeholder="搜索应用名称" clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  const emit = defineEmits<{
    search: [params: Record<string, any>]
    reset: []
  }>()

  const getInitialForm = () => ({
    keyword: ''
  })

  const form = reactive(getInitialForm())

  const handleSearch = () => {
    emit('search', { ...form })
  }

  const handleReset = () => {
    Object.assign(form, getInitialForm())
    emit('reset')
  }
</script>
