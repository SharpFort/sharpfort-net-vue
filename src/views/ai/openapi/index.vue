<template>
  <div class="p-4 h-full flex flex-col bg-white">
    <!-- Header Actions -->
    <div class="bg-gray-50 p-4 rounded-md shadow-sm mb-4">
      <SearchForm @search="handleSearch" @reset="handleReset" />
    </div>

    <!-- Table -->
    <div class="flex-1 bg-white border border-gray-100 shadow-sm rounded-md overflow-hidden flex flex-col">
      <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <span class="text-sm font-semibold text-gray-700">OpenApi Models List</span>
        <el-button type="success" plain @click="fetchData" :loading="loading">
          <Icon icon="ep:refresh" class="mr-1" /> Refresh Models API
        </el-button>
      </div>

      <el-table
        :data="filteredData"
        v-loading="loading"
        style="width: 100%"
        height="100%"
        stripe
        border
        class="flex-1"
      >
        <el-table-column prop="id" label="Model ID" width="280">
          <template #default="{ row }">
            <span class="font-mono text-blue-600">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="owned_by" label="Owned By" width="150" />
        <el-table-column prop="object" label="Object" width="120" />
        <el-table-column prop="created" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatTimestamp(row.created) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Type" />
        
        <el-table-column label="Actions" fixed="right" width="160">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleTest(row)">
              Test Chat
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <ModelDialog ref="dialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { openApi } from '@/api/openapi'
import SearchForm from './modules/SearchForm.vue'
import ModelDialog from './modules/ModelDialog.vue'

defineOptions({
  name: 'OpenApi'
})

const loading = ref(false)
const rawData = ref<Api.OpenApi.ModelsDataDto[]>([])
const searchKeyword = ref('')
const dialogRef = ref<InstanceType<typeof ModelDialog>>()

const filteredData = computed(() => {
  if (!searchKeyword.value) return rawData.value
  const lower = searchKeyword.value.toLowerCase()
  return rawData.value.filter(m => m.id?.toLowerCase().includes(lower))
})

const fetchData = async () => {
  try {
    loading.value = true
    const res = await openApi.getModels()
    rawData.value = res.data || []
  } catch {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: { keyword: string }) => {
  searchKeyword.value = params.keyword
}

const handleReset = () => {
  searchKeyword.value = ''
  fetchData()
}

const handleTest = (row: Api.OpenApi.ModelsDataDto) => {
  if (row.id) {
    dialogRef.value?.open(row.id)
  }
}

const formatTimestamp = (ts?: number) => {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString()
}

onMounted(() => {
  fetchData()
})
</script>

