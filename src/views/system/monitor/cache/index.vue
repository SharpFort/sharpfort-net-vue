<template>
  <div class="h-full flex gap-4 p-4">
    <!-- Cache Names List -->
    <ElCard
      shadow="never"
      class="w-1/3 flex flex-col"
      :body-style="{ height: '100%', padding: '0' }"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>缓存名称</span>
          <ElButton type="primary" link @click="fetchNames">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
          </ElButton>
        </div>
      </template>
      <div v-loading="loadingNames" class="h-full overflow-y-auto p-2">
        <div
          v-for="item in cacheNames"
          :key="item.cacheName!"
          class="p-3 cursor-pointer hover:bg-gray-100 rounded flex justify-between items-center group"
          :class="{ 'bg-blue-50 text-blue-600': selectedName === item.cacheName }"
          @click="selectName(item.cacheName!)"
        >
          <div class="flex flex-col overflow-hidden w-full pr-2">
            <span class="truncate text-sm font-medium" :title="item.cacheName">{{ item.cacheName }}</span>
            <span v-if="item.remark" class="text-xs text-gray-500 truncate" :title="item.remark">{{ item.remark }}</span>
          </div>
          <ElPopconfirm title="确定要清空该缓存吗？" @confirm="clearName(item.cacheName!)">
            <template #reference>
              <ElButton v-if="selectedName === item.cacheName" type="danger" link size="small" @click.stop>
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </ElButton>
            </template>
          </ElPopconfirm>
        </div>
        <ElEmpty v-if="!loadingNames && cacheNames.length === 0" description="暂无缓存" />
      </div>
    </ElCard>

    <!-- Cache Keys List -->
    <ElCard
      shadow="never"
      class="w-1/3 flex flex-col"
      :body-style="{ height: '100%', padding: '0' }"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>键名列表</span>
          <ElButton type="primary" link :disabled="!selectedName" @click="fetchKeys">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
          </ElButton>
        </div>
      </template>
      <div v-loading="loadingKeys" class="h-full overflow-y-auto p-2">
        <div
          v-for="key in cacheKeys"
          :key="key"
          class="p-3 cursor-pointer hover:bg-gray-100 rounded flex justify-between items-center group"
          :class="{ 'bg-blue-50 text-blue-600': selectedKey === key }"
          @click="selectKey(key)"
        >
          <span class="truncate" :title="key">{{ key }}</span>
          <ElPopconfirm title="确定要删除该键吗？" @confirm="clearKey(key)">
            <template #reference>
              <ElButton v-if="selectedKey === key" type="danger" link size="small" @click.stop>
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </ElButton>
            </template>
          </ElPopconfirm>
        </div>
        <ElEmpty v-if="!selectedName" description="请选择缓存名称" />
        <ElEmpty v-else-if="!loadingKeys && cacheKeys.length === 0" description="暂无键名" />
      </div>
    </ElCard>

    <!-- Cache Value -->
    <ElCard
      shadow="never"
      class="w-1/3 flex flex-col"
      :body-style="{ height: '100%', padding: '0', display: 'flex', flexDirection: 'column' }"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>缓存内容</span>
          <ElButton type="primary" link :disabled="!selectedKey" @click="fetchValue">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
          </ElButton>
        </div>
      </template>
      <div v-loading="loadingValue" class="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
        <template v-if="selectedKey && cacheValue">
          <ElDescriptions border :column="1" size="small" class="mb-4 flex-shrink-0">
            <ElDescriptionsItem label="缓存名称">{{ cacheValue.cacheName }}</ElDescriptionsItem>
            <ElDescriptionsItem label="键名">{{ cacheValue.cacheKey }}</ElDescriptionsItem>
            <ElDescriptionsItem label="备注" v-if="cacheValue.remark">{{ cacheValue.remark }}</ElDescriptionsItem>
          </ElDescriptions>
          <div class="flex-1 overflow-y-auto w-full">
            <pre class="bg-gray-50 p-4 rounded text-sm break-all whitespace-pre-wrap m-0 min-h-full">{{ formatValue(cacheValue.cacheValue) }}</pre>
          </div>
        </template>
        <ElEmpty v-else-if="!selectedKey" description="请选择键名" />
        <ElEmpty v-else-if="!loadingValue" description="暂无内容" />
      </div>
      <div class="p-4 border-t flex-shrink-0" v-if="cacheNames.length > 0">
        <ElPopconfirm title="确定要清空所有缓存吗？" @confirm="clearAll">
          <template #reference>
            <ElButton type="danger" class="w-full">
              <template #icon><ArtSvgIcon icon="ri:delete-bin-line" /></template>
              清空所有缓存
            </ElButton>
          </template>
        </ElPopconfirm>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'MonitorCache' })

  const loadingNames = ref(false)
  const loadingKeys = ref(false)
  const loadingValue = ref(false)

  const cacheNames = ref<Api.Monitor.MonitorCacheNameGetListOutputDto[]>([])
  const cacheKeys = ref<string[]>([])
  const cacheValue = ref<Api.Monitor.MonitorCacheGetListOutputDto | null>(null)

  const selectedName = ref('')
  const selectedKey = ref('')

  onMounted(() => {
    fetchNames()
  })

  const fetchNames = async () => {
    loadingNames.value = true
    try {
      const res = await CasbinApi.monitor.cache.getNames()
      cacheNames.value = res || []
      // Reset content
      selectedName.value = ''
      cacheKeys.value = []
      selectedKey.value = ''
      cacheValue.value = null
    } catch (error) {
      console.error(error)
      ElMessage.error('获取缓存名称失败')
    } finally {
      loadingNames.value = false
    }
  }

  const selectName = (name: string) => {
    if (selectedName.value === name) return
    selectedName.value = name
    selectedKey.value = ''
    cacheValue.value = null
    fetchKeys()
  }

  const fetchKeys = async () => {
    if (!selectedName.value) return
    loadingKeys.value = true
    try {
      const res = await CasbinApi.monitor.cache.getKeys(selectedName.value)
      cacheKeys.value = res || []
    } catch (error) {
      console.error(error)
      ElMessage.error('获取键名失败')
    } finally {
      loadingKeys.value = false
    }
  }

  const selectKey = (key: string) => {
    if (selectedKey.value === key) return
    selectedKey.value = key
    fetchValue()
  }

  const fetchValue = async () => {
    if (!selectedName.value || !selectedKey.value) return
    loadingValue.value = true
    try {
      const res = await CasbinApi.monitor.cache.getValue(selectedName.value, selectedKey.value)
      cacheValue.value = res || null
    } catch (error) {
      console.error(error)
      ElMessage.error('获取缓存内容失败')
    } finally {
      loadingValue.value = false
    }
  }

  const formatValue = (val: string | undefined | null) => {
    if (!val) return ''
    try {
      // Handle the case where the value itself is an object (unexpected as DTO returns string, but just in case)
      if (typeof val === 'object') {
        return JSON.stringify(val, null, 2)
      }
      return JSON.stringify(JSON.parse(val), null, 2)
    } catch {
      return val
    }
  }

  const clearName = async (name: string) => {
    try {
      await CasbinApi.monitor.cache.clearName(name)
      ElMessage.success('清空缓存成功')
      if (selectedName.value === name) {
        selectedName.value = ''
        cacheKeys.value = []
        selectedKey.value = ''
        cacheValue.value = null
      }
      fetchNames()
    } catch (error) {
      console.error(error)
    }
  }

  const clearKey = async (key: string) => {
    try {
      await CasbinApi.monitor.cache.clearKey(selectedName.value, key)
      ElMessage.success('删除键成功')
      if (selectedKey.value === key) {
        selectedKey.value = ''
        cacheValue.value = null
      }
      fetchKeys()
    } catch (error) {
      console.error(error)
    }
  }

  const clearAll = async () => {
    try {
      await CasbinApi.monitor.cache.clearAll()
      ElMessage.success('清空所有缓存成功')
      fetchNames()
    } catch (error) {
      console.error(error)
    }
  }
</script>

<style scoped>
  :deep(.el-card__header) {
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
  }
</style>
