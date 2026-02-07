import request from '@/utils/http'

export const LogApi = {
  login: {
    /**
     * 获取登录日志列表
     */
    getList: (params: Api.Log.LoginLogSearchParams) =>
      request.get<Api.Log.LoginLogList>({ url: '/api/app/login-log', params }),

    /**
     * 获取登录日志详情
     */
    get: (id: string) => request.get<Api.Log.LoginLogDto>({ url: `/api/app/login-log/${id}` }),

    /**
     * 导出登录日志
     */
    export: (params: Api.Log.LoginLogSearchParams) =>
      request.get<Blob>({
        url: '/api/app/login-log/export-excel',
        params,
        responseType: 'blob'
      })
  },

  operation: {
    /**
     * 获取操作日志列表
     */
    getList: (params: Api.Log.OperationLogSearchParams) =>
      request.get<Api.Log.OperationLogList>({ url: '/api/app/operation-log', params }),

    /**
     * 获取操作日志详情
     */
    get: (id: string) =>
      request.get<Api.Log.OperationLogDto>({ url: `/api/app/operation-log/${id}` }),

    /**
     * 删除操作日志
     */
    del: (ids: string[]) => request.del<any>({ url: '/api/app/operation-log', params: { ids } }),

    /**
     * 导出操作日志
     */
    export: (params: Api.Log.OperationLogSearchParams) =>
      request.get<Blob>({
        url: '/api/app/operation-log/export-excel',
        params,
        responseType: 'blob'
      })
  }
}
