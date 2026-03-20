/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 账号功能类型 */
  namespace Account {
    interface AuthCreateOrUpdateInputDto {
      userId: string
      openId?: string
      name?: string
      authType?: string
    }

    interface AuthOutputDto {
      id: string
      userId: string
      openId?: string
      name?: string
      authType?: string
      creationTime: string
    }

    interface CaptchaImageDto {
      uuid: string
      img?: string // byte
      isEnableCaptcha: boolean
    }

    interface LoginInputVo {
      userName?: string
      password?: string
      uuid?: string
      code?: string
    }

    interface LoginOutputDto {
      token?: string
      refreshToken?: string
    }

    interface PhoneCaptchaImageDto {
      phone?: string
      uuid?: string
      code?: string
    }

    interface RegisterDto {
      userName?: string
      password?: string
      uuid?: string
      phone?: number
      code?: string
      nick?: string
    }

    interface RestPasswordDto {
      password?: string
    }

    interface RetrievePasswordDto {
      password?: string
      uuid?: string
      phone: number
      code?: string
    }

    interface UpdateIconDto {
      icon?: string
      userId?: string
    }

    interface UpdatePasswordDto {
      newPassword?: string
      oldPassword?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表响应 */
    interface RoleList {
      items: RoleGetOutputDto[]
      totalCount: number
    }

    /** 角色实体信息 */
    interface RoleGetOutputDto {
      id: string
      creationTime: string
      creatorId?: string
      roleName?: string
      roleCode?: string
      remark?: string
      dataScope?: number
      state: boolean
      orderNum: number
    }

    /** 角色搜索参数 */
    interface RoleSearchParams {
      SkipCount?: number
      MaxResultCount?: number
      Sorting?: string
      RoleName?: string
      RoleCode?: string
      State?: boolean
      StartTime?: string
      EndTime?: string
      OrderByColumn?: string
      IsAsc?: string
      IsAscending?: boolean
    }

    /** 角色创建参数 */
    interface RoleCreateInputVo {
      roleName?: string
      roleCode?: string
      remark?: string
      dataScope?: number
      state?: boolean
      orderNum?: number
      departmentIds?: string[]
      menuIds?: string[]
    }

    /** 角色更新参数 */
    interface RoleUpdateInputVo {
      roleName?: string
      roleCode?: string
      remark?: string
      dataScope?: number
      state?: boolean
      orderNum?: number
      departmentIds?: string[]
      menuIds?: string[]
    }

    /** 角色数据权限更新参数 */
    interface UpdateDataScopeInput {
      roleId: string
      departmentIds?: string[]
      dataScope?: string | number // Enum: ALL, CUSTOM, DEPT, etc.
    }
    /** 角色授权用户参数 */
    interface RoleAuthUserCreateOrDeleteInput {
      roleId: string
      userIds: string[]
    }

    /** 在线用户模型 */
    interface OnlineUserModel {
      connnectionId?: string // Note: Typo in backend/swagger
      userId?: string
      userName?: string
      loginTime?: string
      ipaddr?: string
      loginLocation?: string
      os?: string
      browser?: string
    }

    /** 岗位列表响应 */
    interface PostList {
      items: PostListItem[]
      totalCount: number
    }

    /** 岗位列表项 */
    interface PostListItem {
      id: string
      creationTime: string
      state: boolean
      postCode: string
      postName: string
      remark: string
      orderNum: number
    }

    /** 岗位搜索参数 */
    interface PostSearchParams {
      SkipCount?: number
      MaxResultCount?: number
      Sorting?: string
      State?: boolean
      PostName?: string
      PostCode?: string
    }

    /** 岗位创建参数 */
    interface PostCreateInput {
      state?: boolean
      postCode?: string
      postName?: string
      remark?: string
    }

    /** 岗位更新参数 */
    interface PostUpdateInput {
      state?: boolean
      orderNum?: number
      postCode?: string
      postName?: string
      remark?: string
    }
  }
}
