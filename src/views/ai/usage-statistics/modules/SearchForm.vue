<template>
  <el-form :inline="true" :model="formData" class="mb-4" @submit.prevent="onSearch">
    <el-form-item label="Token ID" prop="tokenId">
      <el-input v-model.trim="formData.tokenId" placeholder="请输入Token ID (选填)" clearable style="width: 300px" />
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
  tokenId: ''
})

const onSearch = () => {
  emit('search', { TokenId: formData.tokenId || undefined })
}

const onReset = () => {
  formData.tokenId = ''
  emit('reset')
}
</script>
