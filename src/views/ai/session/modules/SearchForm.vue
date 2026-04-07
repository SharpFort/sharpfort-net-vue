<template>
  <el-form :inline="true" :model="formData" class="mb-4" @submit.prevent="onSearch">
    <el-form-item label="会话标题" prop="sessionTitle">
      <el-input v-model.trim="formData.sessionTitle" placeholder="请输入会话标题" clearable />
    </el-form-item>
    <el-form-item label="会话类型" prop="sessionType">
      <el-select v-model="formData.sessionType" placeholder="全部类型" clearable style="width: 150px">
        <el-option label="全部" value="" />
        <el-option label="对话 (Chat)" value="Chat" />
        <el-option label="智能体 (Agent)" value="Agent" />
      </el-select>
    </el-form-item>
    <el-form-item label="开始时间" prop="startTime">
      <el-date-picker v-model="formData.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DDTHH:mm:ss" clearable />
    </el-form-item>
    <el-form-item label="结束时间" prop="endTime">
      <el-date-picker v-model="formData.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DDTHH:mm:ss" clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit">查询</el-button>
      <el-button @click="onReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const emit = defineEmits(['search', 'reset'])

const formData = reactive({
  sessionTitle: '',
  sessionType: '',
  startTime: '',
  endTime: ''
})

const onSearch = () => {
  emit('search', { 
    sessionTitle: formData.sessionTitle || undefined,
    sessionType: formData.sessionType || undefined,
    startTime: formData.startTime || undefined,
    endTime: formData.endTime || undefined
  })
}

const onReset = () => {
  formData.sessionTitle = ''
  formData.sessionType = ''
  formData.startTime = ''
  formData.endTime = ''
  emit('reset')
}
</script>
