<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { CasbinApi } from '@/api/casbin-rbac'

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

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  // 动态 options
  const statusOptions = ref<{ label: string; value: boolean }[]>([])
  const postOptions = ref<{ label: string; value: string }[]>([])
  const roleOptions = ref<{ label: string; value: string }[]>([])

  // 模拟接口返回状态数据
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '正常', value: true },
          { label: '停用', value: false }
        ])
      }, 100)
    })
  }

  onMounted(async () => {
    try {
      statusOptions.value = await fetchStatusOptions()
      // 加载岗位类型
      const postRes = await CasbinApi.post.getList({ SkipCount: 0, MaxResultCount: 1000 })
      if (postRes && postRes.items) {
        postOptions.value = postRes.items.map((p: any) => ({ label: p.postName, value: p.id }))
      }
      // 加载角色类型
      const roleRes = await CasbinApi.role.getSelectData()
      const list = Array.isArray(roleRes) ? roleRes : roleRes?.items || []
      roleOptions.value = list.map((r: any) => ({
        label: r.roleName || r.label,
        value: r.id || r.value
      }))
    } catch (error) {
      console.error('加载选项失败', error)
    }
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '用户名',
      key: 'UserName',
      type: 'input',
      placeholder: '请输入用户名',
      clearable: true
    },
    {
      label: '手机号',
      key: 'Phone',
      type: 'input',
      props: { placeholder: '请输入手机号', maxlength: '11' }
    },
    {
      label: '邮箱',
      key: 'Email',
      type: 'input',
      props: { placeholder: '请输入邮箱' }
    },
    {
      label: '状态',
      key: 'State',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: statusOptions.value
      }
    },
    {
      label: '性别',
      key: 'Gender',
      type: 'select',
      props: {
        placeholder: '请选择性别',
        options: [
          { label: '未知', value: 'Unknown' },
          { label: '男', value: 'Male' },
          { label: '女', value: 'Female' }
        ]
      }
    },
    {
      label: '岗位',
      key: 'PostId',
      type: 'select',
      props: {
        placeholder: '请选择岗位',
        options: postOptions.value
      }
    },
    {
      label: '角色',
      key: 'RoleId',
      type: 'select',
      props: {
        placeholder: '请选择角色',
        options: roleOptions.value
      }
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
