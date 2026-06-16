<template>
  <el-dialog v-model="dialogVisible" title="代码生成" width="500px" align-center>
    <div class="p-4">
      <div class="mb-4 text-sm text-gray-500">
        已选择 {{ tableIds.length }} 个实体进行代码生成。
      </div>

      <el-space direction="vertical" fill class="w-full">
        <!-- Web → Code: 用 Scriban 模板生成代码 -->
        <el-button
          type="primary"
          class="w-full"
          :disabled="!tableIds.length"
          @click="handleBuild('webToCode')"
        >
          生成代码 (Web → Code)
          <template #icon><art-svg-icon icon="ri:code-box-line" /></template>
        </el-button>

        <!-- Code → Web: 反射扫描 C# 实体，同步到注册表 -->
        <el-button type="success" class="w-full" @click="handleBuild('codeToWeb')">
          同步实体到注册表 (Code → Web)
          <template #icon><art-svg-icon icon="ri:layout-top-line" /></template>
        </el-button>

        <el-divider />

        <!-- 手动刷新注册表 -->
        <el-button type="warning" class="w-full" @click="handleBuild('refresh')">
          手动刷新注册表
          <template #icon><art-svg-icon icon="ri:refresh-line" /></template>
        </el-button>

        <!-- 打开本地目录 -->
        <el-button class="w-full" @click="handleOpenDir">
          打开本地目录
          <template #icon><art-svg-icon icon="ri:folder-open-line" /></template>
        </el-button>
      </el-space>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { CodeGenApi } from '@/api/code-gen'

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

  const handleBuild = async (type: 'webToCode' | 'codeToWeb' | 'refresh') => {
    if (type === 'webToCode' && props.tableIds.length === 0) {
      ElMessage.warning('请选择要生成代码的实体')
      return
    }

    const typeLabels = {
      webToCode: '生成代码 (Web → Code)',
      codeToWeb: '同步实体到注册表 (Code → Web)',
      refresh: '手动刷新注册表'
    }

    try {
      await ElMessageBox.confirm(`确定要执行 [${typeLabels[type]}] 操作吗？`, '提示', {
        type: 'info'
      })

      switch (type) {
        case 'webToCode':
          await CodeGenApi.codegen.webToCode(props.tableIds)
          ElMessage.success('代码生成成功')
          break
        case 'codeToWeb':
          await CodeGenApi.codegen.codeToWeb()
          ElMessage.success('实体同步成功')
          break
        case 'refresh':
          await CodeGenApi.codegen.refresh()
          ElMessage.success('注册表刷新成功')
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

  const handleOpenDir = () => {
    ElMessageBox.prompt('请输入要打开的目录路径', '打开目录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入目录路径'
    })
      .then(async ({ value }) => {
        if (!value) return
        await CodeGenApi.codegen.openDir(value)
        ElMessage.success('目录已打开')
      })
      .catch(() => {})
  }
</script>
