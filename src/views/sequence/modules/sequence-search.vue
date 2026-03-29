<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { SequenceRuleSearchParams } from '@/api/sequence'

  interface Props {
    modelValue: SequenceRuleSearchParams
  }
  interface Emits {
    (e: 'update:modelValue', value: SequenceRuleSearchParams): void
    (e: 'search', params: SequenceRuleSearchParams): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()
  const rules = {}

  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formItems = computed(() => [
    {
      label: '规则名称',
      key: 'RuleName',
      type: 'input',
      placeholder: '请输入规则名称',
      clearable: true
    },
    {
      label: '规则代码',
      key: 'RuleCode',
      type: 'input',
      placeholder: '请输入规则代码',
      clearable: true
    },
    {
      label: '开始时间',
      key: 'StartTime',
      type: 'date-picker',
      props: {
        type: 'datetime',
        placeholder: '请选择开始时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss'
      }
    },
    {
      label: '结束时间',
      key: 'EndTime',
      type: 'date-picker',
      props: {
        type: 'datetime',
        placeholder: '请选择结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss'
      }
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value?.validate()
    emit('search', formData.value)
  }
</script>
