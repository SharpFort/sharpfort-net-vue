<template>
  <ElDialog
    v-model="visibleModel"
    :title="isEdit ? '编辑规则' : '新增规则'"
    width="600px"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="right">
      <ElFormItem label="规则名称" prop="ruleName">
        <ElInput v-model="form.ruleName" placeholder="请输入规则名称" />
      </ElFormItem>
      <ElFormItem label="规则代码" prop="ruleCode">
        <ElInput v-model="form.ruleCode" placeholder="请输入规则代码" :disabled="isEdit" />
      </ElFormItem>
      <ElFormItem label="模板" prop="template">
        <ElInput v-model="form.template" placeholder="例如: {Year}{Month}{Day}{Seq:4}">
          <template #append>
            <el-tooltip content="点击查看可用占位符" placement="top">
              <el-button :icon="InfoFilled" @click="showPlaceholders" />
            </el-tooltip>
          </template>
        </ElInput>
      </ElFormItem>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="步长" prop="step">
            <ElInputNumber
              v-model="form.step"
              :min="1"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="序列长度" prop="seqLength">
            <ElInputNumber
              v-model="form.seqLength"
              :min="1"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="最小值" prop="minValue">
            <ElInputNumber
              v-model="form.minValue"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="最大值" prop="maxValue">
            <ElInputNumber
              v-model="form.maxValue"
              :min="1"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="重置类型" prop="resetType">
        <ElSelect v-model="form.resetType" placeholder="请选择重置类型" style="width: 100%">
          <ElOption label="不重置" value="None" />
          <ElOption label="每天" value="Daily" />
          <ElOption label="每周" value="Weekly" />
          <ElOption label="每月" value="Monthly" />
          <ElOption label="每季度" value="Quarterly" />
          <ElOption label="每年" value="Yearly" />
          <ElOption label="财年" value="FiscalYearly" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
    </template>

    <ElDialog v-model="placeholderDialogVisible" title="可用占位符" width="500px" append-to-body>
      <ElTable :data="placeholders" stripe border height="300px">
        <ElTableColumn prop="key" label="占位符" width="150">
          <template #default="{ row }">
            <ElTag size="small" @click="insertPlaceholder(row.key)" class="cursor-pointer">{{
              row.key
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="label" label="描述" />
      </ElTable>
    </ElDialog>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { ElMessage, FormInstance, FormRules } from 'element-plus'
  import { InfoFilled } from '@element-plus/icons-vue'
  import {
    SequenceApi,
    SequenceRuleDto,
    PlaceholderMetaDto,
    CreateSequenceRuleInput,
    SequenceResetType
  } from '@/api/sequence'

  const props = defineProps<{
    visible: boolean
    editData: SequenceRuleDto | null
  }>()

  const emit = defineEmits(['update:visible', 'submit'])

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const placeholderDialogVisible = ref(false)
  const placeholders = ref<PlaceholderMetaDto[]>([])

  const isEdit = computed(() => !!props.editData)

  const visibleModel = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const form = reactive<CreateSequenceRuleInput & { id: number }>({
    id: 0, // Only for internal reference if needed, usually passed separately to update
    ruleName: '',
    ruleCode: '',
    template: '{Year}{Month}{Day}{Seq:4}',
    step: 1,
    seqLength: 4,
    minValue: 1,
    maxValue: 99999999,
    resetType: 'Daily' as SequenceResetType,
    remark: ''
  })

  const rules: FormRules = {
    ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    ruleCode: [{ required: true, message: '请输入规则代码', trigger: 'blur' }],
    template: [{ required: true, message: '请输入模板', trigger: 'blur' }],
    resetType: [{ required: true, message: '请选择重置类型', trigger: 'change' }]
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.editData) {
          Object.assign(form, props.editData)
        } else {
          // Reset
          form.id = 0
          form.ruleName = ''
          form.ruleCode = ''
          form.template = '{Year}{Month}{Day}{Seq:4}'
          form.step = 1
          form.seqLength = 4
          form.minValue = 1
          form.maxValue = 99999999
          form.resetType = 'Daily'
          form.remark = ''
        }
        // Load placeholders if not loaded
        if (placeholders.value.length === 0) {
          loadPlaceholders()
        }
      }
    }
  )

  const loadPlaceholders = async () => {
    try {
      const res = await SequenceApi.sequenceRule.getPlaceholders()
      placeholders.value = res
    } catch (e) {
      console.error(e)
    }
  }

  const showPlaceholders = () => {
    placeholderDialogVisible.value = true
  }

  const insertPlaceholder = (key: string) => {
    form.template += `{${key}}`
    ElMessage.success(`已插入 ${key}`)
    placeholderDialogVisible.value = false
  }

  const handleClose = () => {
    visibleModel.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          if (isEdit.value && props.editData?.id) {
            await SequenceApi.sequenceRule.update(props.editData.id, form)
            ElMessage.success('更新成功')
          } else {
            await SequenceApi.sequenceRule.create(form)
            ElMessage.success('创建成功')
          }
          emit('submit')
        } catch (e) {
          console.error(e)
        } finally {
          submitting.value = false
        }
      }
    })
  }
</script>
