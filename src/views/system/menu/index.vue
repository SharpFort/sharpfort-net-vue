<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增菜单</ElButton>
            <ElButton @click="handleExport" type="warning" v-ripple>导出菜单</ElButton>
            <ElUpload
              action="#"
              :show-file-list="false"
              :http-request="handleImport"
              accept=".xlsx,.xls"
            >
              <ElButton v-ripple>导入菜单</ElButton>
            </ElUpload>
            <ElButton @click="handleDownloadTemplate" v-ripple>下载模板</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :border="true"
        :indent="12"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      >
        <template #menuName="{ row }">
          <div class="menu-name-cell" :style="{ paddingLeft: `${(row.level || 0) * 24}px` }">
            <ArtSvgIcon
              v-if="row.menuIcon && row.menuType !== 'Button'"
              :icon="row.menuIcon"
              :size="18"
            />
            <span class="menu-title">{{ row.menuName }}</span>
          </div>
        </template>

        <template #menuType="{ row }">
          <ElTag v-if="row.menuType === 'Catalogue'" type="primary">目录</ElTag>
          <ElTag v-else-if="row.menuType === 'Menu'" type="success">菜单</ElTag>
          <ElTag v-else-if="row.menuType === 'Button'" type="warning">按钮</ElTag>
          <ElTag v-else type="info">{{ row.menuType }}</ElTag>
        </template>

        <template #isShow="{ row }">
          <ElSwitch v-model="row.isShow" disabled />
        </template>

        <template #isCache="{ row }">
          <ElSwitch v-model="row.isCache" disabled />
        </template>

        <template #isLink="{ row }">
          <ElSwitch v-model="row.isLink" disabled />
        </template>

        <template #isAffix="{ row }">
          <ElSwitch v-model="row.isAffix" disabled />
        </template>

        <template #operate="{ row }">
          <ElSpace>
            <ElButton link type="primary" @click="showDialog('add', row)">新增下级</ElButton>
            <ElButton link type="primary" @click="showDialog('edit', row)">编辑</ElButton>
            <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
          </ElSpace>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 菜单弹窗 -->
    <MenuDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :menu-data="currentMenuData"
      :menu-list="tableData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { CasbinApi } from '@/api/casbin-rbac'
  import MenuDialog from './modules/menu-dialog.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ElSwitch, ElMessage, ElMessageBox } from 'element-plus'
  import * as XLSX from 'xlsx'
  import FileSaver from 'file-saver'
  import { useMenuStore } from '@/store/modules/menu'
  import { MenuProcessor } from '@/router/core'

  defineOptions({ name: 'MenuManage' })

  // 扩展树形节点属性
  type MenuTableNode = Api.SystemManage.MenuGetListOutputDto & {
    children?: MenuTableNode[]
    level?: number
    indexText?: string
  }

  // 状态管理
  const loading = ref(false)
  const tableData = ref<MenuTableNode[]>([])
  const filteredTableData = ref<MenuTableNode[]>([])

  // 搜索相关
  const formFilters = reactive({
    MenuName: '',
    MenuType: undefined
  })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'MenuName',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '菜单类型',
      key: 'MenuType',
      type: 'select',
      options: [
        { label: '目录', value: 'Catalogue' },
        { label: '菜单', value: 'Menu' },
        { label: '按钮', value: 'Button' }
      ],
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  /**
   * 获取菜单列表
   */
  const getMenuList = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await CasbinApi.menu.getList({
        SkipCount: 0,
        MaxResultCount: 1000
      })
      tableData.value = handleTree(res.items || [])
      filteredTableData.value = tableData.value
    } catch (error) {
      console.error('获取菜单列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'indexText',
      label: '序号',
      width: 140,
      fixed: 'left'
    },
    {
      prop: 'menuName',
      label: '菜单名称',
      width: 260,
      useSlot: true
    },
    {
      prop: 'menuType',
      label: '菜单类型',
      width: 90,
      useSlot: true
    },
    {
      prop: 'router',
      label: '路由地址',
      minWidth: 160,
      formatter: (row: MenuTableNode) => row.router || ''
    },
    {
      prop: 'component',
      label: '组件路径',
      minWidth: 200,
      formatter: (row: MenuTableNode) => row.component || ''
    },
    {
      prop: 'routerName',
      label: '路由名称',
      width: 160,
      formatter: (row: MenuTableNode) => row.routerName || ''
    },
    {
      prop: 'orderNum',
      label: '排序',
      width: 80
    },
    {
      prop: 'permissionCode',
      label: '权限标识',
      width: 200
    },
    {
      prop: 'apiUrl',
      label: 'ApiUrl',
      width: 200
    },
    {
      prop: 'apiMethod',
      label: 'ApiMethod',
      width: 120
    },
    {
      prop: 'isShow',
      label: '显示',
      width: 80,
      useSlot: true
    },
    {
      prop: 'isCache',
      label: '缓存',
      width: 80,
      useSlot: true
    },
    {
      prop: 'isLink',
      label: '外链',
      width: 80,
      useSlot: true
    },
    {
      prop: 'isAffix',
      label: '固定',
      width: 80,
      useSlot: true
    },
    {
      prop: 'creationTime',
      label: '创建时间',
      width: 180
    },
    {
      prop: 'operate',
      label: '操作',
      width: 240,
      useSlot: true,
      fixed: 'right'
    }
  ])

  /**
   * 构造树型结构
   */
  const handleTree = (data: Api.SystemManage.MenuGetListOutputDto[]) => {
    const res: MenuTableNode[] = []
    const map = new Map<string, MenuTableNode>()
    data.forEach((item) => {
      map.set(item.id, { ...item, children: [] })
    })
    data.forEach((item) => {
      const parent = map.get(item.parentId)
      if (parent && parent.children) {
        parent.children.push(map.get(item.id)!)
      } else {
        res.push(map.get(item.id)!)
      }
    })

    // 递归计算序号和层级
    const setIndexText = (nodes: MenuTableNode[], parentIndex = '', level = 0) => {
      nodes.forEach((node, index) => {
        const currentIndex = parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`
        node.indexText = currentIndex
        node.level = level
        if (node.children && node.children.length > 0) {
          setIndexText(node.children, currentIndex, level + 1)
        }
      })
    }

    setIndexText(res)
    return res
  }

  const handleReset = (): void => {
    Object.assign(formFilters, {
      MenuName: '',
      MenuType: undefined
    })
    filteredTableData.value = tableData.value
  }

  const handleSearch = (): void => {
    let result = tableData.value

    // 根据菜单名称筛选
    if (formFilters.MenuName) {
      const filterByName = (items: any[]): any[] => {
        return items.reduce((acc: any[], item) => {
          const match = item.menuName?.toLowerCase().includes(formFilters.MenuName.toLowerCase())
          const filteredChildren = item.children ? filterByName(item.children) : []

          if (match || filteredChildren.length > 0) {
            acc.push({
              ...item,
              children: filteredChildren
            })
          }
          return acc
        }, [])
      }
      result = filterByName(result)
    }

    // 根据菜单类型筛选
    if (formFilters.MenuType) {
      const filterByType = (items: any[]): any[] => {
        return items.reduce((acc: any[], item) => {
          const match = item.menuType === formFilters.MenuType
          const filteredChildren = item.children ? filterByType(item.children) : []

          if (match || filteredChildren.length > 0) {
            acc.push({
              ...item,
              children: filteredChildren
            })
          }
          return acc
        }, [])
      }
      result = filterByType(result)
    }

    filteredTableData.value = result
  }

  const handleRefresh = (): void => {
    getMenuList()
  }

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentMenuData = ref<
    Api.SystemManage.MenuUpdateInputVo | { parentId: string; parentName: string } | null
  >(null)

  const showDialog = (type: 'add' | 'edit', row?: MenuTableNode): void => {
    dialogType.value = type
    if (type === 'add' && row) {
      // 新增下级，传递父级信息
      currentMenuData.value = { parentId: row.id, parentName: row.menuName || '' }
    } else if (type === 'edit' && row) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { level: _level, children: _children, indexText: _indexText, ...menuProps } = row
      currentMenuData.value = { ...menuProps }
    } else {
      currentMenuData.value = null
    }
    dialogVisible.value = true
  }

  const refreshSystemMenuStore = async (): Promise<void> => {
    try {
      const menuStore = useMenuStore()
      const menuProcessor = new MenuProcessor()
      const newMenuList = await menuProcessor.getMenuList()
      menuStore.setMenuList(newMenuList)
    } catch (error) {
      console.error('动态刷新侧边栏菜单失败:', error)
    }
  }

  const handleDialogSubmit = async (
    formData: Api.SystemManage.MenuCreateInputVo | Api.SystemManage.MenuUpdateInputVo
  ): Promise<void> => {
    try {
      if (dialogType.value === 'add') {
        await CasbinApi.menu.create(formData)
        ElMessage.success('新增成功')
      } else {
        await CasbinApi.menu.update(
          (currentMenuData.value as any).id,
          formData as Api.SystemManage.MenuUpdateInputVo
        )
        ElMessage.success('修改成功')
      }
      dialogVisible.value = false
      getMenuList()
      refreshSystemMenuStore()
    } catch (error) {
      ElMessage.error('操作失败，请稍后重试')
      console.error('操作失败:', error)
    }
  }

  const handleDelete = async (row: MenuTableNode): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除配置 "${row.menuName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      })
      await CasbinApi.menu.del(row.id)
      ElMessage.success('删除成功')
      getMenuList()
      refreshSystemMenuStore()
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return
      }
      ElMessage.error('删除失败，请稍后重试')
      console.error('删除失败:', error)
    }
  }

  /**
   * 下载导入模板（仅含表头，无数据）
   * 排除系统自动生成字段：Id/CreationTime/CreatorId/MenuSource
   */
  const handleDownloadTemplate = (): void => {
    // 导入模板列定义：按 MenuCreateInputVo 用户可填字段（PascalCase 匹配后端 DTO）
    const templateColumns: Record<string, string> = {
      MenuName: '菜单名称（必填）',
      MenuType: '菜单类型：Catalogue=目录 / Menu=菜单 / Button=按钮',
      ParentId: '父级菜单ID（GUID，顶级菜单为空）',
      PermissionCode: '权限标识',
      MenuIcon: '菜单图标',
      Router: '路由地址',
      RouterName: '路由名称',
      Component: '组件路径',
      IsLink: '是否外链：TRUE/FALSE',
      IsCache: '是否缓存：TRUE/FALSE',
      IsShow: '是否显示：TRUE/FALSE',
      OrderNum: '排序（数字）',
      Query: '路由参数',
      ApiUrl: 'API地址',
      ApiMethod: 'API方法：GET/POST/PUT/DELETE',
      Remark: '备注'
    }

    const headers = Object.keys(templateColumns)
    const descriptions = Object.values(templateColumns)

    // 创建工作簿
    const workbook = XLSX.utils.book_new()

    // Sheet1: 模板（表头行）
    const templateSheet = XLSX.utils.aoa_to_sheet([headers])
    templateSheet['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }))
    XLSX.utils.book_append_sheet(workbook, templateSheet, '导入模板')

    // Sheet2: 字段说明
    const descSheet = XLSX.utils.aoa_to_sheet([
      ['列名', '说明'],
      ...headers.map((h, i) => [h, descriptions[i]])
    ])
    descSheet['!cols'] = [{ wch: 18 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(workbook, descSheet, '字段说明')

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    FileSaver.saveAs(blob, '菜单导入模板.xlsx')
  }

  const handleImport = async (options: any): Promise<void> => {
    try {
      const file = options.file
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const results = XLSX.utils.sheet_to_json<any>(worksheet)

          if (results.length === 0) {
            ElMessage.warning('文件内容为空')
            return
          }

          // 1. 字段映射与数据格式化，确保符合 MenuCreateInputVo 的 camelCase 结构，并支持英文与中文说明作为 key
          const menuList: Api.SystemManage.MenuCreateInputVo[] = results.map((row: any) => {
            const rawApiUrl = row.ApiUrl || row['API地址'] || undefined
            const apiUrlVal = rawApiUrl ? String(rawApiUrl).trim() : undefined

            return {
              menuName: row.MenuName || row['菜单名称（必填）'] || undefined,
              menuType:
                row.MenuType ||
                row['菜单类型：Catalogue=目录 / Menu=菜单 / Button=按钮'] ||
                undefined,
              parentId:
                row.ParentId ||
                row['父级菜单ID（GUID，顶级菜单为空）'] ||
                '00000000-0000-0000-0000-000000000000',
              permissionCode: row.PermissionCode || row['权限标识'] || undefined,
              menuIcon: row.MenuIcon || row['菜单图标'] || undefined,
              router: row.Router || row['路由地址'] || undefined,
              routerName: row.RouterName || row['路由名称'] || undefined,
              component: row.Component || row['组件路径'] || undefined,
              isLink:
                row.IsLink === true ||
                String(row.IsLink).toUpperCase() === 'TRUE' ||
                row['是否外链：TRUE/FALSE'] === true ||
                String(row['是否外链：TRUE/FALSE']).toUpperCase() === 'TRUE',
              isCache:
                row.IsCache === true ||
                String(row.IsCache).toUpperCase() === 'TRUE' ||
                row['是否缓存：TRUE/FALSE'] === true ||
                String(row['是否缓存：TRUE/FALSE']).toUpperCase() === 'TRUE',
              isShow:
                row.IsShow === true ||
                String(row.IsShow).toUpperCase() === 'TRUE' ||
                row['是否显示：TRUE/FALSE'] === true ||
                String(row['是否显示：TRUE/FALSE']).toUpperCase() === 'TRUE',
              orderNum: Number(row.OrderNum || row['排序（数字）']) || 0,
              query: row.Query || row['路由参数'] || undefined,
              apiUrl: apiUrlVal,
              apiMethod: row.ApiMethod || row['API方法：GET/POST/PUT/DELETE'] || undefined,
              remark: row.Remark || row['备注'] || undefined,
              state: true // 默认状态为正常
            }
          })

          // 2. 前端拦截式校验数据格式（例如 ApiUrl 中的 {param} 占位符）
          for (let i = 0; i < menuList.length; i++) {
            const menu = menuList[i]
            if (menu.apiUrl && /\{([^}]+)\}/.test(menu.apiUrl)) {
              ElMessage.error({
                message: `第 ${i + 1} 行菜单 "${menu.menuName || '未命名'}" 的 API地址 不支持 {param} 格式，请在 Excel 中修改为 :param 格式后重新上传！`,
                duration: 6000
              })
              return
            }
          }

          await CasbinApi.menu.import(menuList)
          ElMessage.success('导入成功')
          getMenuList()
          refreshSystemMenuStore()
        } catch (error) {
          console.error('解析或导入失败:', error)
          ElMessage.error('导入失败，请检查文件格式及数据')
        }
      }
      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('导入失败:', error)
      ElMessage.error('导入失败')
    }
  }

  const handleExport = async (): Promise<void> => {
    try {
      loading.value = true
      const blob = await CasbinApi.menu.export({
        MenuName: formFilters.MenuName || undefined
      })
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '菜单数据.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .menu-page {
    padding: 20px;
    background-color: var(--art-bg-color);
  }

  .menu-name-cell {
    display: flex;
    gap: 8px;
    align-items: center;

    .menu-title {
      flex: 1;
    }
  }
</style>
