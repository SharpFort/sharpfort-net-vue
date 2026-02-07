import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:user-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: 'menus.system.role',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
    {
      path: 'menu',
      name: 'Menus',
      component: '/system/menu',
      meta: {
        title: 'menus.system.menu',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'tenant',
      name: 'Tenant',
      component: '/system/tenant',
      meta: {
        title: '租户管理',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'auth',
      name: 'SystemAuth',
      component: '/system/auth/index', // Maps to src/views/system/auth/index.vue
      meta: {
        title: '三方账号', // Or 'menus.system.auth' if i18n key exists, using literal for now
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'codegen',
      name: 'CodeGen',
      meta: {
        title: '代码生成',
        icon: 'ri:code-s-slash-line',
        roles: ['R_SUPER']
      },
      children: [
        {
          path: 'table',
          name: 'CodeGenTable',
          component: '/system/codegen/table',
          meta: {
            title: '表管理',
            keepAlive: true
          }
        },
        {
          path: 'field',
          name: 'CodeGenField',
          component: '/system/codegen/field',
          meta: {
            title: '字段管理',
            keepAlive: true,
            isHide: true
          }
        },
        {
          path: 'template',
          name: 'CodeGenTemplate',
          component: '/system/codegen/template',
          meta: {
            title: '模板管理',
            keepAlive: true
          }
        }
      ]
    }
  ]
}
