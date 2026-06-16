<template>
  <art-search-bar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

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

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = computed(() => [
    {
      label: '实体名称',
      key: 'Name',
      type: 'input',
      placeholder: '请输入实体名称（模糊筛选）',
      clearable: true
    },
    {
      label: '所属模块',
      key: 'ModuleName',
      type: 'input',
      placeholder: '请输入模块名称（精确筛选）',
      clearable: true
    },
    {
      label: '所属项目',
      key: 'ProjectName',
      type: 'input',
      placeholder: '请输入项目名称（精确筛选）',
      clearable: true
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
