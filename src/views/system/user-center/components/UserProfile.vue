<template>
  <div class="user-profile">
    <el-form
      :model="form"
      ref="ruleFormRef"
      :rules="rules"
      label-width="86px"
      label-position="top"
      class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="Select" :disabled="!isEdit">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="昵称" prop="nick">
            <el-input v-model="form.nick" :disabled="!isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" :disabled="!isEdit" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机" prop="phone">
            <el-input v-model="form.phone" :disabled="!isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" :disabled="!isEdit" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="个人介绍" prop="introduction">
        <el-input type="textarea" :rows="4" v-model="form.introduction" :disabled="!isEdit" />
      </el-form-item>

      <div class="flex justify-end mt-4">
        <el-button type="primary" @click="edit">
          {{ isEdit ? '保存' : '编辑' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'
  import { ElMessage, type FormInstance, FormRules } from 'element-plus'

  const props = defineProps<{
    user: any
  }>()

  const emit = defineEmits(['refresh'])

  const isEdit = ref(false)
  const ruleFormRef = ref<FormInstance>()

  const form = reactive({
    name: '',
    nick: '',
    email: '',
    phone: '',
    address: '',
    gender: 0,
    introduction: '',
    icon: ''
  })

  watch(
    () => props.user,
    (newVal) => {
      if (newVal) {
        Object.assign(form, {
          name: newVal.name,
          nick: newVal.nick,
          email: newVal.email,
          phone: newVal.phone,
          address: newVal.address,
          gender: Number(newVal.gender) || 0,
          introduction: newVal.introduction,
          icon: newVal.icon
        })
      }
    },
    { immediate: true, deep: true }
  )

  const rules = reactive<FormRules>({
    nick: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }]
  })

  const options = [
    { value: 0, label: '未知' },
    { value: 1, label: '男' },
    { value: 2, label: '女' }
  ]

  const edit = async () => {
    if (isEdit.value) {
      if (!ruleFormRef.value) return
      await ruleFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            await CasbinApi.user.updateProfile(form)
            ElMessage.success('保存成功')
            isEdit.value = false
            emit('refresh')
          } catch (error) {
            console.error(error)
          }
        }
      })
    } else {
      isEdit.value = true
    }
  }
</script>
