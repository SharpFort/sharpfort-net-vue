<template>
  <ElDialog
    :title="form.id ? '编辑目录' : '新增目录'"
    v-model="dialogVisible"
    width="500px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
      <ElFormItem label="上级目录" prop="parentId">
        <ElTreeSelect
          v-model="form.parentId"
          :data="directoryOptions"
          :props="{ label: 'name', children: 'children' }"
          value-key="id"
          placeholder="选择上级目录"
          check-strictly
          clearable
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="目录名称" prop="name">
        <ElInput v-model="form.name" placeholder="请输入目录名称" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { FileApi } from '@/api/file'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    parentId?: string
    editData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const directoryOptions = ref<any[]>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const form = reactive({
    id: '',
    parentId: '',
    name: ''
  })

  const rules = reactive<FormRules>({
    name: [{ required: true, message: '请输入目录名称', trigger: 'blur' }]
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        initForm()
        loadDirectoryTree()
      }
    }
  )

  const initForm = () => {
    if (props.editData) {
      form.id = props.editData.id
      form.name = props.editData.name
      form.parentId = props.editData.parentId
    } else {
      form.id = ''
      form.name = ''
      form.parentId = props.parentId || ''
    }
  }

  const loadDirectoryTree = async () => {
    try {
      const res = await FileApi.directory.getList()
      directoryOptions.value = handleTree(res || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleTree = (data: any[]) => {
    const res: any[] = []
    const map = new Map()
    data.forEach((item) => {
      map.set(item.id, { ...item, children: [] })
    })
    data.forEach((item) => {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children.push(map.get(item.id))
      } else {
        res.push(map.get(item.id))
      }
    })
    return res
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    form.id = ''
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitLoading.value = true
        try {
          if (form.id) {
            await FileApi.directory.update(form.id, { name: form.name })
            ElMessage.success('更新成功')
          } else {
            await FileApi.directory.create({
              name: form.name,
              parentId: form.parentId || undefined
            })
            ElMessage.success('创建成功')
          }
          emit('success')
          dialogVisible.value = false
        } catch (error) {
          console.error(error)
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>
