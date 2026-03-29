<template>
  <ElDialog v-model="visibleModel" title="测试生成" width="400px" @close="handleClose">
    <ElForm :model="form" class="mt-4">
      <ElFormItem label="规则代码">
        <ElInput v-model.trim="form.ruleCode" placeholder="请输入规则代码" />
      </ElFormItem>
      <ElFormItem label="生成结果">
        <div class="result-box">{{ result || '点击生成查看结果' }}</div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleGenerate">生成</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { SequenceApi } from '@/api/sequence'
  import { ElMessage } from 'element-plus'

  const props = defineProps<{
    visible: boolean
  }>()

  const emit = defineEmits(['update:visible'])

  const visibleModel = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const loading = ref(false)
  const result = ref('')
  const form = reactive({
    ruleCode: ''
  })

  const handleClose = () => {
    visibleModel.value = false
    result.value = ''
    form.ruleCode = ''
  }

  const handleGenerate = async () => {
    if (!form.ruleCode) {
      ElMessage.warning('请输入规则代码')
      return
    }
    loading.value = true
    try {
      const res = await SequenceApi.sequenceRule.testGenerate(form.ruleCode)
      result.value = typeof res === 'string' ? res : JSON.stringify(res)
    } catch (e) {
      console.error(e)
      result.value = '生成失败'
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  .result-box {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 40px;
    padding: 10px;
    font-family: monospace;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
</style>
