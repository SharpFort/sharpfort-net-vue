import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { logRoutes } from './log'

/**
 * 导出所有模块化路由
 *
 * 注意：在后端模式下，路由从数据库加载，不使用硬编码路由
 * 在前端模式下，使用硬编码路由
 */
export const routeModules: AppRouteRecord[] = (() => {
  const accessMode = import.meta.env.VITE_ACCESS_MODE

  // 后端模式：返回空数组，路由从数据库加载
  if (accessMode === 'backend') {
    return []
  }

  // 前端模式：返回硬编码路由
  return [dashboardRoutes, systemRoutes, resultRoutes, exceptionRoutes, logRoutes]
})()
