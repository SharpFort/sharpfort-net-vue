<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
    width="680px"
    align-center
    class="el-dialog-border"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="上级菜单" prop="parentId">
            <ElTreeSelect
              v-model="form.parentId"
              :data="menuTreeData"
              :props="{ label: 'menuName', value: 'id' }"
              placeholder="请选择上级菜单（留空为根菜单）"
              clearable
              check-strictly
              :render-after-expand="false"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="菜单类型" prop="menuType">
            <ElRadioGroup v-model="form.menuType">
              <ElRadio label="Catalogue">目录</ElRadio>
              <ElRadio label="Menu">菜单</ElRadio>
              <ElRadio label="Button">按钮</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="菜单名称" prop="menuName">
            <ElInput v-model="form.menuName" placeholder="请输入菜单名称" clearable />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12" v-if="form.menuType !== 'Button'">
          <ElFormItem label="菜单图标" prop="menuIcon">
            <ElPopover trigger="click" width="400">
              <template #reference>
                <ElInput v-model="form.menuIcon" placeholder="点击选择图标" clearable>
                  <template #prefix>
                    <ArtSvgIcon v-if="form.menuIcon" :icon="form.menuIcon" />
                  </template>
                </ElInput>
              </template>
              <div
                style="
                  display: grid;
                  grid-template-columns: repeat(8, 1fr);
                  gap: 8px;
                  max-height: 300px;
                  overflow-y: auto;
                "
              >
                <div
                  v-for="icon in iconList"
                  :key="icon"
                  @click="form.menuIcon = icon"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    border: 1px solid #dcdfe6;
                    border-radius: 4px;
                  "
                  :style="{ borderColor: form.menuIcon === icon ? '#409eff' : '#dcdfe6' }"
                >
                  <ArtSvgIcon :icon="icon" :size="20" />
                </div>
              </div>
            </ElPopover>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="排序" prop="orderNum">
            <ElInputNumber
              v-model="form.orderNum"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12" v-if="form.menuType !== 'Button'">
          <ElFormItem label="路由地址" prop="router">
            <ElInput v-model="form.router" placeholder="请输入路由地址" clearable />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12" v-if="form.menuType !== 'Button'">
          <ElFormItem label="路由名称" prop="routeName">
            <ElInput v-model="form.routeName" placeholder="请输入路由名称" clearable />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12" v-if="form.menuType === 'Menu'">
          <ElFormItem label="组件路径" prop="component">
            <ElInput v-model="form.component" placeholder="请输入组件路径" clearable />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="权限标识" prop="permissionCode">
            <ElInput v-model="form.permissionCode" placeholder="请输入权限标识" clearable />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24" v-if="form.menuType !== 'Button'">
          <ElFormItem label="菜单配置">
            <ElSpace>
              <ElCheckbox v-model="form.isShow" label="显示" />
              <ElCheckbox v-model="form.isCache" label="缓存" />
              <ElCheckbox v-model="form.isLink" label="外链" />
              <ElCheckbox v-model="form.isAffix" label="固定" />
            </ElSpace>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    menuData?: any
    menuList: any[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: any): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'add',
    menuData: null,
    menuList: () => []
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const submitLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  // 图标列表
  const iconList = [
    'ri:home-line',
    'ri:user-line',
    'ri:settings-line',
    'ri:file-list-line',
    'ri:folder-line',
    'ri:dashboard-line',
    'ri:bar-chart-line',
    'ri:pie-chart-line',
    'ri:database-line',
    'ri:server-line',
    'ri:code-s-slash-line',
    'ri:terminal-box-line',
    'ri:shield-user-line',
    'ri:lock-line',
    'ri:key-line',
    'ri:menu-line',
    'ri:layout-line',
    'ri:pages-line',
    'ri:article-line',
    'ri:file-text-line',
    'ri:inbox-line',
    'ri:mail-line',
    'ri:notification-line',
    'ri:message-line',
    'ri:question-line',
    'ri:information-line',
    'ri:error-warning-line',
    'ri:checkbox-circle-line',
    'ri:close-circle-line',
    'ri:add-circle-line',
    'ri:indeterminate-circle-line',
    'ri:star-line'
  ]

  const form = reactive({
    parentId: '',
    menuType: 'Menu',
    menuName: '',
    menuIcon: '',
    orderNum: 0,
    router: '',
    routeName: '',
    component: '',
    permissionCode: '',
    isShow: true,
    isCache: true,
    isLink: false,
    isAffix: false,
    menuSource: 'Ruoyi'
  })

  const rules = {
    menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
  }

  // 构造菜单树数据
  const menuTreeData = computed(() => {
    return props.menuList
  })

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.type === 'edit' && props.menuData) {
          Object.assign(form, props.menuData)
        } else if (props.type === 'add' && props.menuData?.parentId) {
          // 新增下级
          form.parentId = props.menuData.parentId
        } else {
          // 重置表单
          Object.assign(form, {
            parentId: '',
            menuType: 'Menu',
            menuName: '',
            menuIcon: '',
            orderNum: 0,
            router: '',
            routeName: '',
            component: '',
            permissionCode: '',
            isShow: true,
            isCache: true,
            isLink: false,
            isAffix: false,
            menuSource: 'Ruoyi'
          })
        }
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      submitLoading.value = true

      // 处理 parentId：如果为空，设置为零 GUID
      const submitData = {
        ...form,
        parentId: form.parentId || '00000000-0000-0000-0000-000000000000'
      }

      emit('submit', submitData)
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      submitLoading.value = false
    }
  }
</script>
