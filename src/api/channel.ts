import request from '@/utils/http'

/**
 * 渠道商 AI 应用服务 API
 */
export const aiApp = {
  /** 获取应用列表 */
  getList: (params: Api.Channel.AiAppSearchParams) => {
    return request.get<{ items: Api.Channel.AiAppDto[]; totalCount: number }>({
      url: '/api/app/channel/app',
      params
    })
  },

  /** 根据ID获取单个应用 */
  get: (id: string) => {
    return request.get<Api.Channel.AiAppDto>({ url: `/api/app/channel/app/${id}` })
  },

  /** 创建应用 */
  create: (data: Api.Channel.AiAppCreateInput) => {
    return request.post<Api.Channel.AiAppDto>({ url: '/api/app/channel/app', data })
  },

  /** 更新应用 */
  update: (id: string, data: Api.Channel.AiAppUpdateInput) => {
    return request.put<Api.Channel.AiAppDto>({ url: `/api/app/channel/app/${id}`, data })
  },

  /** 删除应用 */
  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/channel/app/${id}` })
  }
}
