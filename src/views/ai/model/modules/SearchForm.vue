<template>
  <el-form :model="form" inline class="bg-white p-4 rounded shadow-sm mb-4">
    <el-form-item label="关键字">
      <el-input v-model.trim="form.SearchKey" placeholder="搜索名称或ID" clearable />
    </el-form-item>
    <el-form-item label="供应商ID">
      <el-input v-model.trim="form.AiProviderId" placeholder="供应商的UUID" clearable />
    </el-form-item>
    <el-form-item label="创建日期">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['search', 'reset'])

const getInitialForm = (): Api.AiModel.AiModelSearchParams => ({
  SearchKey: '',
  AiProviderId: '',
  StartTime: '',
  EndTime: ''
})

const form = reactive(getInitialForm())
const dateRange = ref<[string, string] | null>(null)

const handleSearch = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    form.StartTime = dateRange.value[0] + 'T00:00:00'
    form.EndTime = dateRange.value[1] + 'T23:59:59'
  } else {
    form.StartTime = ''
    form.EndTime = ''
  }
  emit('search', { ...form })
}

const handleReset = () => {
  Object.assign(form, getInitialForm())
  dateRange.value = null
  emit('reset')
}
</script>

