<template>
  <ElDialog v-model="dialogVisible" title="代码生成" width="500px" align-center>
    <div class="p-4">
      <div class="mb-4 text-sm text-gray-500">
        已选择 {{ tableIds.length }} 个表进行代码生成。
      </div>

      <ElSpace direction="vertical" fill class="w-full">
        <ElButton type="primary" class="w-full" @click="handleBuild('webToCode')">
          生成代码 (Web -> Code)
          <template #icon><ArtSvgIcon icon="ri:code-box-line" /></template>
        </ElButton>
        <ElButton type="success" class="w-full" @click="handleBuild('webToDb')">
          同步到数据库 (Web -> Db)
          <template #icon><ArtSvgIcon icon="ri:database-2-line" /></template>
        </ElButton>
        <ElDivider />
        <ElButton type="warning" class="w-full" @click="handleBuild('codeToWeb')">
          从代码同步 (Code -> Web)
          <template #icon><ArtSvgIcon icon="ri:layout-top-line" /></template>
        </ElButton>
        <ElButton type="danger" class="w-full" @click="handleBuild('codeToDb')">
          从代码同步到数据库 (Code -> Db)
          <template #icon><ArtSvgIcon icon="ri:database-line" /></template>
        </ElButton>
      </ElSpace>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    tableIds: string[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const handleBuild = async (type: 'webToCode' | 'webToDb' | 'codeToWeb' | 'codeToDb') => {
    if (props.tableIds.length === 0) {
      ElMessage.warning('请选择要生成的表')
      return
    }

    const typeLabels = {
      webToCode: '生成代码',
      webToDb: '同步到数据库',
      codeToWeb: '从代码同步',
      codeToDb: '从代码同步到数据库'
    }

    try {
      await ElMessageBox.confirm(`确定要执行 [${typeLabels[type]}] 操作吗？`, '提示', {
        type: 'info'
      })

      switch (type) {
        case 'webToCode':
          await CasbinApi.codegen.webToCode(props.tableIds)
          ElMessage.success('代码生成成功')
          break
        case 'webToDb':
          await CasbinApi.codegen.webToDb(props.tableIds)
          ElMessage.success('数据库同步成功')
          break
        case 'codeToWeb':
          await CasbinApi.codegen.codeToWeb(props.tableIds)
          ElMessage.success('代码同步成功')
          break
        case 'codeToDb':
          await CasbinApi.codegen.codeToDb(props.tableIds)
          ElMessage.success('代码同步到数据库成功')
          break
      }

      dialogVisible.value = false
    } catch (error) {
      if (error !== 'cancel') {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  }
</script>
