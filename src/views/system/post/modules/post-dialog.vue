<template>
  <ElDialog
    :title="form.id ? '编辑岗位' : '新增岗位'"
    v-model="dialogVisible"
    width="800px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 两列布局 -->
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="岗位名称" prop="postName">
            <ElInput v-model="form.postName" placeholder="请输入岗位名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="岗位编码" prop="postCode">
            <ElInput v-model="form.postCode" placeholder="请输入岗位编码" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="显示顺序" prop="orderNum">
            <ElInputNumber v-model="form.orderNum" :min="0" style="width: 100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="state">
            <ElSwitch v-model="form.state" active-text="启用" inactive-text="停用" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
    postName: '',
    postCode: '',
    orderNum: 0,
    state: true,
    remark: ''
  })

  const rules = reactive<FormRules>({
    postName: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
    postCode: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }]
  })

  const initForm = async () => {
    if (props.editData && props.editData.id) {
      try {
        const detail = await CasbinApi.post.get(props.editData.id)
        Object.assign(form, detail)
      } catch (error) {
        console.error('获取岗位详情失败:', error)
      }
    } else {
      Object.assign(form, {
        id: undefined,
        postName: '',
        postCode: '',
        orderNum: 0,
        state: true,
        remark: ''
      })
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true

      if (form.id) {
        await CasbinApi.post.update(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await CasbinApi.post.create(form)
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
