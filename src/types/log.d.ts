/**
 * 日志模块类型定义
 */
declare namespace Api {
  namespace Log {
    /** 登录日志列表项 */
    interface LoginLogDto {
      id: string
      creationTime: string
      loginUser?: string
      loginLocation?: string
      loginIp?: string
      browser?: string
      os?: string
      logMsg?: string
      creatorId?: string
    }

    /** ABP分页响应结构 */
    interface AbpPaginatedResponse<T = any> {
      items: T[]
      totalCount: number
    }

    /** ABP分页请求参数 */
    interface AbpPaginationParams {
      SkipCount?: number
      MaxResultCount?: number
      Sorting?: string
    }

    /** 登录日志搜索参数 */
    interface LoginLogSearchParams extends AbpPaginationParams {
      LoginUser?: string
      LoginIp?: string
      StartTime?: string
      EndTime?: string
      OrderByColumn?: string
      IsAsc?: string
      IsAscending?: boolean
    }

    /** 登录日志列表响应 */
    type LoginLogList = AbpPaginatedResponse<LoginLogDto>

    /** 操作类型枚举 */
    enum OperationType {
      Other = 0,
      Insert = 1,
      Update = 2,
      Delete = 3,
      Auth = 4,
      Export = 5,
      Import = 6,
      Force = 7,
      GenerateCode = 8,
      Clean = 9
    }

    /** 操作日志列表项 */
    interface OperationLogDto {
      id: string
      creationTime: string
      title?: string
      operationType?: OperationType
      requestMethod?: string
      operUser?: string
      operIp?: string
      operLocation?: string
      method?: string
      requestParam?: string
      requestResult?: string
    }

    /** 操作日志搜索参数 */
    interface OperationLogSearchParams extends AbpPaginationParams {
      OperationType?: string // 后端枚举序列化为字符串: Other/Insert/Update/Delete/Auth/Export/Import/Force/GenerateCode/Clean
      OperUser?: string
      StartTime?: string
      EndTime?: string
      OrderByColumn?: string
      IsAsc?: string
      IsAscending?: boolean
    }

    /** 操作日志列表响应 */
    type OperationLogList = AbpPaginatedResponse<OperationLogDto>
  }
}
