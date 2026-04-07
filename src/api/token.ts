import request from '@/utils/http'

/**
 * Token 服务 API
 */
export const aiToken = {
  /** 获取Token列表 */
  getList: (params: Api.Token.TokenSearchParams) => {
    return request.get<{ items: Api.Token.TokenGetListOutputDto[]; totalCount: number }>({
      url: '/api/app/token/list',
      params
    })
  },

  /** 创建 Token */
  create: (data: Api.Token.TokenCreateInput) => {
    return request.post<void>({ url: '/api/app/token', data })
  },

  /** 更新 Token */
  update: (data: Api.Token.TokenUpdateInput) => {
    // 根据提取信息 PUT 是由于 /api/app/token 路径
    return request.put<void>({ url: '/api/app/token', data })
  },

  /** 删除 Token */
  delete: (id: string) => {
    return request.del<void>({ url: `/api/app/token/${id}` })
  },

  /** 启用 Token */
  enable: (id: string) => {
    return request.post<void>({ url: `/api/app/token/${id}/enable` })
  },

  /** 禁用 Token */
  disable: (id: string) => {
    return request.post<void>({ url: `/api/app/token/${id}/disable` })
  }
}
