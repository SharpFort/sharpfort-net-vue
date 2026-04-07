<template>
  <el-form inline @submit.prevent>
    <el-form-item label="Search">
      <!-- OpenApi Models endpoint doesn't support pagination or search params currently -->
      <el-input placeholder="Filter by Model ID (Local)" v-model.trim="localSearch" @input="onSearch" clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSearch">Search</el-button>
      <el-button @click="onReset">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['search', 'reset'])

const localSearch = ref('')

const onSearch = () => {
  emit('search', { keyword: localSearch.value })
}

const onReset = () => {
  localSearch.value = ''
  emit('reset')
}
</script>

