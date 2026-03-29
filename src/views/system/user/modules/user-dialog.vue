<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="800px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="用户名" prop="userName">
            <ElInput v-model.trim="formData.userName" placeholder="请输入用户名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="昵称" prop="nick">
            <ElInput v-model.trim="formData.nick" placeholder="请输入昵称" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="姓名" prop="name">
            <ElInput v-model.trim="formData.name" placeholder="请输入姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="性别" prop="gender">
            <ElSelect v-model="formData.gender" placeholder="请选择性别" style="width: 100%">
              <ElOption label="未知" value="Unknown" />
              <ElOption label="男" value="Male" />
              <ElOption label="女" value="Female" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="手机号" prop="phone">
            <ElInput v-model.trim="formData.phone" placeholder="请输入手机号" type="number" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model.trim="formData.email" placeholder="请输入邮箱" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="年龄" prop="age">
            <ElInput v-model.trim="formData.age" placeholder="请输入年龄" type="number" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="部门" prop="departmentId">
            <ElSelect
              v-model="formData.departmentId"
              placeholder="请选择部门"
              filterable
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.deptName"
                :value="dept.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="岗位" prop="postIds">
            <ElSelect
              v-model="formData.postIds"
              placeholder="请选择岗位"
              multiple
              filterable
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="post in postList"
                :key="post.id"
                :label="post.postName"
                :value="post.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="角色" prop="roleIds">
            <ElSelect
              v-model="formData.roleIds"
              placeholder="请选择角色"
              multiple
              filterable
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="role in roleList"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="状态" prop="state">
            <ElSwitch v-model="formData.state" active-text="正常" inactive-text="停用" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="密码" prop="password" v-if="dialogType === 'add'">
            <ElInput
              v-model.trim="formData.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="地址" prop="address">
            <ElInput v-model.trim="formData.address" placeholder="请输入地址" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="个人简介" prop="introduction">
            <ElInput
              v-model.trim="formData.introduction"
              type="textarea"
              :rows="3"
              placeholder="请输入个人简介"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model.trim="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitLoading">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { CasbinApi } from '@/api/casbin-rbac'

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  // 部门列表
  const deptList = ref<any[]>([])
  // 岗位列表
  const postList = ref<any[]>([])
  // 角色列表
  const roleList = ref<any[]>([])

  // 表单数据
  const formData = reactive({
    id: '',
    userName: '',
    nick: '',
    name: '',
    gender: 'Unknown' as 'Unknown' | 'Male' | 'Female',
    phone: null as number | null,
    email: '',
    age: null as number | null,
    departmentId: '',
    postIds: [] as string[],
    roleIds: [] as string[],
    state: true,
    password: '',
    address: '',
    introduction: '',
    remark: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    nick: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    name: [{ max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  }

  /**
   * 加载部门列表
   */
  const loadDeptList = async () => {
    try {
      const res = await CasbinApi.dept.getList({ SkipCount: 0, MaxResultCount: 1000 })
      deptList.value = res.items || []
    } catch (error) {
      console.error('加载部门列表失败:', error)
    }
  }

  /**
   * 加载岗位列表
   */
  const loadPostList = async () => {
    try {
      const res = await CasbinApi.post.getList({ SkipCount: 0, MaxResultCount: 1000 })
      postList.value = res.items || []
    } catch (error) {
      console.error('加载岗位列表失败:', error)
    }
  }

  /**
   * 加载角色列表
   */
  const loadRoleList = async () => {
    try {
      const res = await CasbinApi.role.getSelectData()
      roleList.value = Array.isArray(res) ? res : res?.items || []
    } catch (error) {
      console.error('加载角色列表失败:', error)
    }
  }

  /**
   * 初始化表单数据
   */
  const initFormData = async () => {
    if (props.type === 'edit' && props.userData?.id) {
      try {
        // 获取用户详细信息
        const userDetail = await CasbinApi.user.get(props.userData.id)

        Object.assign(formData, {
          id: userDetail.id,
          userName: userDetail.userName || '',
          nick: userDetail.nick || '',
          name: userDetail.name || '',
          gender: userDetail.gender || 'Unknown',
          phone: userDetail.phone || null,
          email: userDetail.email || '',
          age: userDetail.age || null,
          departmentId: userDetail.departmentId || '',
          postIds: userDetail.posts?.map((p: any) => p.id) || [],
          roleIds: userDetail.roles?.map((r: any) => r.id) || [],
          state: userDetail.state ?? true,
          password: '',
          address: userDetail.address || '',
          introduction: userDetail.introduction || '',
          remark: userDetail.remark || ''
        })
      } catch (error) {
        console.error('加载用户详情失败:', error)
        ElMessage.error('加载用户详情失败')
      }
    } else {
      // 新增时重置表单
      Object.assign(formData, {
        id: '',
        userName: '',
        nick: '',
        name: '',
        gender: 'Unknown',
        phone: null,
        email: '',
        age: null,
        departmentId: '',
        postIds: [],
        roleIds: [],
        state: true,
        password: '',
        address: '',
        introduction: '',
        remark: ''
      })
    }
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        // 加载下拉列表数据
        await Promise.all([loadDeptList(), loadPostList(), loadRoleList()])
        // 初始化表单数据
        await initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          submitLoading.value = true

          const submitData = {
            ...formData,
            // 如果是编辑且密码为空，则不传密码字段
            ...(dialogType.value === 'edit' && !formData.password ? { password: undefined } : {})
          }

          if (dialogType.value === 'add') {
            await CasbinApi.user.create(submitData)
            ElMessage.success('添加成功')
          } else {
            await CasbinApi.user.update(formData.id, submitData)
            ElMessage.success('更新成功')
          }

          dialogVisible.value = false
          emit('submit')
        } catch (error) {
          console.error('提交失败:', error)
          ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
        } finally {
          submitLoading.value = false
        }
      }
    })
  }
</script>
