<template>
  <ElDialog
    :title="form.id ? '编辑公告' : '新增公告'"
    v-model="dialogVisible"
    width="900px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="公告标题" prop="title">
        <ElInput v-model.trim="form.title" placeholder="请输入公告标题" />
      </ElFormItem>
      <ElFormItem label="公告类型" prop="noticeType">
        <ElSelect v-model="form.noticeType" placeholder="请选择类型" style="width: 100%">
          <ElOption label="走马灯" :value="10" />
          <ElOption label="提示弹窗" :value="20" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="公告内容" prop="content">
        <ElInput
          v-model.trim="form.content"
          type="textarea"
          :rows="6"
          placeholder="请输入公告内容"
        />
      </ElFormItem>
      <ElFormItem label="显示顺序" prop="orderNum">
        <ElInputNumber v-model.trim="form.orderNum" :min="0" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="状态" prop="state">
        <ElSwitch v-model="form.state" active-text="启用" inactive-text="停用" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    editData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const form = reactive<any>({
    id: undefined,
    title: '',
    noticeType: 10,
    content: '',
    orderNum: 0,
    state: true
  })

  const rules = reactive<FormRules>({
    title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
    noticeType: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
    content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
  })

  // 后端返回字符串枚举名，需要转换为整数值以匹配 ElOption
  const noticeTypeNameToValue: Record<string, number> = {
    MerryGoRound: 10,
    Popup: 20
  }

  const initForm = async () => {
    if (props.editData && props.editData.id) {
      try {
        const detail = await CasbinApi.notice.get(props.editData.id)
        // 将后端返回的字符串枚举名转换为整数值
        if (typeof detail.noticeType === 'string') {
          detail.noticeType = noticeTypeNameToValue[detail.noticeType] ?? 0
        }
        Object.assign(form, {
          ...detail
        })
      } catch (error) {
        console.error('获取公告详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        title: '',
        noticeType: 10,
        content: '',
        orderNum: 0,
        state: true
      })
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true

      const payload = {
        title: form.title,
        noticeType: form.noticeType,
        content: form.content,
        orderNum: form.orderNum,
        state: form.state
      }

      if (form.id) {
        await CasbinApi.notice.update(form.id, payload)
        ElMessage.success('更新成功')
      } else {
        await CasbinApi.notice.create(payload)
        ElMessage.success('添加成功')
      }

      emit('submit', { ...form })
      handleCancel()
    } catch (error) {
      console.error('表单校验失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  const handleClosed = (): void => {
    formRef.value?.resetFields()
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        initForm()
      }
    }
  )
</script>
