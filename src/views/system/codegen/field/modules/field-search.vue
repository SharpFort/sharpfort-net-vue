<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const tableOptions = ref<any[]>([])

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {}

  // 表单配置
  const formItems = computed(() => [
    {
      label: '所属表',
      key: 'TableId',
      type: 'select',
      placeholder: '请选择所属表',
      clearable: true,
      options: tableOptions.value
    },
    {
      label: '字段名称',
      key: 'Name',
      type: 'input',
      placeholder: '请输入字段名称',
      clearable: true
    }
  ])

  onMounted(async () => {
    try {
      const tables = await CasbinApi.table.getSelectData()
      tableOptions.value = tables.map((t: any) => ({
        label: t.name,
        value: t.id
      }))
    } catch (error) {
      console.error('获取表列表失败:', error)
    }
  })

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
