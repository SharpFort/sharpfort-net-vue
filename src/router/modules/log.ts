import { AppRouteRecord } from '@/types/router'

export const logRoutes: AppRouteRecord = {
  path: '/log',
  name: 'Log',
  component: '/index/index',
  meta: {
    title: '日志管理',
    icon: 'ri:file-list-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'login',
      name: 'LoginLog',
      component: '/log/login/index', // This maps to src/views/log/login/index.vue if the loader supports it
      meta: {
        title: '登录日志',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'operation',
      name: 'OperationLog',
      component: '/log/Operation/index',
      meta: {
        title: '操作日志',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}

export default logRoutes
