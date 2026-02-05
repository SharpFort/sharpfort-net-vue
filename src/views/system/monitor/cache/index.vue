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
          v-for="name in cacheNames"
          :key="name"
          class="p-3 cursor-pointer hover:bg-gray-100 rounded flex justify-between items-center group"
          :class="{ 'bg-blue-50 text-blue-600': selectedName === name }"
          @click="selectName(name)"
        >
          <span class="truncate" :title="name">{{ name }}</span>
          <ElPopconfirm title="确定要清空该缓存吗？" @confirm="clearName(name)">
            <template #reference>
              <ElButton v-if="selectedName === name" type="danger" link size="small" @click.stop>
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
      :body-style="{ height: '100%', padding: '0' }"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>缓存内容</span>
          <ElButton type="primary" link :disabled="!selectedKey" @click="fetchValue">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
          </ElButton>
        </div>
      </template>
      <div v-loading="loadingValue" class="h-full p-4 overflow-y-auto">
        <div v-if="selectedKey && cacheValue">
          <pre
            class="bg-gray-50 p-4 rounded text-sm overflow-x-auto break-all whitespace-pre-wrap"
            >{{ formatValue(cacheValue) }}</pre
          >
        </div>
        <ElEmpty v-else-if="!selectedKey" description="请选择键名" />
        <ElEmpty v-else description="暂无内容" />
      </div>
      <div class="p-4 border-t" v-if="cacheNames.length > 0">
        <ElPopconfirm title="确定要清空所有缓存吗？" @confirm="clearAll">
          <template #reference>
            <ElButton type="danger" class="w-full">清空所有缓存</ElButton>
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

  const cacheNames = ref<string[]>([])
  const cacheKeys = ref<string[]>([])
  const cacheValue = ref<any>(null)

  const selectedName = ref('')
  const selectedKey = ref('')

  onMounted(() => {
    fetchNames()
  })

  const fetchNames = async () => {
    loadingNames.value = true
    try {
      const res = await CasbinApi.monitor.cache.getNames()
      // Swagger says returns MonitorCacheGetListOutputDto items, which has cacheName
      // Let's verify data structure. If it's list of objects, map to strings.
      // Based on DTO analysis: [{cacheName: string, ...}]
      if (Array.isArray(res)) {
        cacheNames.value = res.map((item: any) => item.cacheName || item).filter(Boolean)
      } else {
        cacheNames.value = []
      }
      // content reset
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
      // Assuming res is string[] or similar list of keys
      if (Array.isArray(res)) {
        cacheKeys.value = res
      } else {
        cacheKeys.value = []
      }
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
      // DTO field cacheValue
      cacheValue.value = res?.cacheValue !== undefined ? res.cacheValue : res
    } catch (error) {
      console.error(error)
      ElMessage.error('获取缓存内容失败')
    } finally {
      loadingValue.value = false
    }
  }

  const formatValue = (val: any) => {
    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2)
    }
    try {
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
