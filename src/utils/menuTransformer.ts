/**
 * 菜单数据转换器
 *
 * 将数据库菜单格式转换为前端路由格式
 *
 * @module utils/menuTransformer
 */

import { AppRouteRecord } from '@/types/router'

/**
 * 数据库菜单接口
 */
interface DbMenu {
  id: string
  menuName: string
  menuType: 'Catalogue' | 'Menu' | 'Component' | 'Button'
  menuIcon: string
  router: string
  routerName?: string
  component: string
  permissionCode: string
  parentId: string
  orderNum: number
  state: boolean
  children?: DbMenu[]
}

/**
 * 将单个数据库菜单转换为路由记录
 * @param dbMenu 数据库菜单对象
 * @returns 转换后的路由记录，如果菜单无效则返回 null
 */
export function transformMenuToRoute(dbMenu: DbMenu): AppRouteRecord | null {
  // 过滤掉按钮类型和禁用的菜单
  if (dbMenu.menuType === 'Button' || !dbMenu.state) {
    return null
  }

  // 确定组件路径
  let component = dbMenu.component || '/index/index'

  // 如果是目录类型且没有指定组件，使用默认布局
  if (dbMenu.menuType === 'Catalogue' && !dbMenu.component) {
    component = '/index/index'
  }

  // 规范化组件路径：确保以 / 开头，ComponentLoader 需要以 / 开头的路径
  if (component && !component.startsWith('/')) {
    component = '/' + component
  }

  const route: AppRouteRecord = {
    path: dbMenu.router || '/',
    name: dbMenu.routerName || dbMenu.id,
    component: component,
    meta: {
      title: dbMenu.menuName,
      icon: dbMenu.menuIcon || undefined,
      isHide: false,
      keepAlive: true,
      orderNum: dbMenu.orderNum
    }
  }

  // 递归转换子菜单
  if (dbMenu.children && dbMenu.children.length > 0) {
    route.children = dbMenu.children
      .map(transformMenuToRoute)
      .filter((item): item is AppRouteRecord => item !== null)
      .sort((a, b) => (Number(a.meta.orderNum) || 0) - (Number(b.meta.orderNum) || 0))
  }

  return route
}

/**
 * 构建菜单树形结构
 * @param flatMenus 扁平的菜单列表
 * @returns 树形结构的菜单列表
 */
function buildMenuTree(flatMenus: DbMenu[]): DbMenu[] {
  const menuMap = new Map<string, DbMenu>()
  const rootMenus: DbMenu[] = []

  // 第一遍：创建所有菜单的副本并建立 id -> menu 的映射
  flatMenus.forEach((menu) => {
    menuMap.set(menu.id, { ...menu, children: [] })
  })

  // 第二遍：建立父子关系
  flatMenus.forEach((menu) => {
    const menuNode = menuMap.get(menu.id)
    if (!menuNode) return

    // 如果有父级ID且不为空字符串/null，则添加到父级的children中
    if (
      menu.parentId &&
      menu.parentId !== '' &&
      menu.parentId !== '00000000-0000-0000-0000-000000000000'
    ) {
      const parent = menuMap.get(menu.parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(menuNode)
      } else {
        // 父级不存在，作为根节点
        rootMenus.push(menuNode)
      }
    } else {
      // 没有父级ID，作为根节点
      rootMenus.push(menuNode)
    }
  })

  // 递归排序所有层级的菜单
  const sortMenus = (menus: DbMenu[]): DbMenu[] => {
    return menus
      .sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))
      .map((menu) => {
        if (menu.children && menu.children.length > 0) {
          menu.children = sortMenus(menu.children)
        }
        return menu
      })
  }

  return sortMenus(rootMenus)
}

/**
 * 将数据库菜单列表转换为路由记录数组
 * @param dbMenus 数据库菜单响应对象
 * @returns 转换后的路由记录数组
 */
export function transformMenuList(dbMenus: { items: DbMenu[] }): AppRouteRecord[] {
  if (!dbMenus || !dbMenus.items) {
    console.warn('菜单数据为空或格式不正确')
    return []
  }

  // 先构建树形结构
  const treeMenus = buildMenuTree(dbMenus.items)

  // 再转换为路由格式
  return treeMenus.map(transformMenuToRoute).filter((item): item is AppRouteRecord => item !== null)
}
