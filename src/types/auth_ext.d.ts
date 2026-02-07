/**
 * 认证扩展类型定义
 */
declare namespace Api {
  namespace Auth {
    /** 认证输出 DTO */
    interface AuthOutputDto {
      id: string
      userId: string
      openId?: string
      name?: string
      authType?: string
      creationTime: string
    }

    /** 认证搜索参数 */
    interface AuthSearchParams extends Api.Log.AbpPaginationParams {
      UserId?: string
      OpenId?: string
      AuthType?: string
      StartTime?: string
      EndTime?: string
      OrderByColumn?: string
      IsAsc?: string
      IsAscending?: boolean
    }

    /** 认证创建或更新输入 DTO */
    interface AuthCreateOrUpdateInputDto {
      userId?: string
      openId?: string
      name?: string
      authType?: string
    }
  }
}
