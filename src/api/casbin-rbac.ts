import request from '@/utils/http'

/**
 * Casbin-RBAC API Service
 */
export const CasbinApi = {
  // --- Account ---

  account: {
    login: (data: Api.Account.LoginInputVo) =>
      request.post<Api.Account.LoginOutputDto>({ url: '/api/app/account/login', data }),
    register: (data: Api.Account.RegisterDto) =>
      request.post<any>({ url: '/api/app/account/register', data }),
    getCaptcha: () =>
      request.get<Api.Account.CaptchaImageDto>({ url: '/api/app/account/captcha-image' }),
    getPhoneCaptcha: (data: Api.Account.PhoneCaptchaImageDto) =>
      request.post<any>({ url: '/api/app/account/captcha-phone', data }),
    getPhoneCaptchaForReset: (data: Api.Account.PhoneCaptchaImageDto) =>
      request.post<any>({ url: '/api/app/account/captcha-phone/repassword', data }),
    retrievePassword: (data: Api.Account.RetrievePasswordDto) =>
      request.post<any>({ url: '/api/app/account/retrieve-password', data }),
    refreshToken: (refreshToken: string) =>
      request.post<Api.Account.LoginOutputDto>({
        url: '/api/app/account/refresh',
        params: { refresh_token: refreshToken }
      }),
    restPassword: (userId: string | number, data: Api.Account.RestPasswordDto) =>
      request.put<any>({ url: `/api/app/account/rest-password/${userId}`, data }),
    bindPhone: (data: Api.Account.PhoneCaptchaImageDto) =>
      request.post<any>({ url: '/api/app/account/captcha-phone/bind', data }),
    validatePhoneCaptcha: (data: Api.Account.PhoneCaptchaImageDto) =>
      request.post<any>({ url: '/api/app/account/validation-phone-captcha', data }),
    getAccountInfo: () => request.get<Api.Account.AuthOutputDto>({ url: '/api/app/account' }),
    getVue3Router: (routerType: string) =>
      request.get<any>({ url: `/api/app/account/Vue3Router/${routerType}` }),
    logout: () => request.post<any>({ url: '/api/app/account/logout' }),
    updatePassword: (data: Api.Account.UpdatePasswordDto) =>
      request.put<any>({ url: '/api/app/account/password', data }),
    updateIcon: (data: Api.Account.UpdateIconDto) =>
      request.put<any>({ url: '/api/app/account/icon', data })
  },

  // --- User ---
  user: {
    getList: (params: any) => request.get<any>({ url: '/api/app/user', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/user/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/user', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/user/${id}`, data }),
    updateProfile: (data: any) => request.put<any>({ url: '/api/app/user/profile', data }),
    // del: (id: string | number) => request.del<any>({ url: `/api/app/user/${id}` }),
    del: (id: string | number) => request.del<any>({ url: `/api/app/user?ids=${id}` }),
    getRoles: (id: string | number) => request.get<string[]>({ url: `/api/app/user/${id}/role` }),
    setRoles: (id: string | number, roleNames: string[]) =>
      request.put<any>({ url: `/api/app/user/${id}/role`, data: roleNames }),
    export: (params: any) =>
      request.get<any>({ url: '/api/app/user/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/user/import-excel', data }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/user/select-data-list', params: { keywords } }),
    updateState: (id: string | number, state: boolean) =>
      request.put<any>({ url: `/api/app/user/${id}/${state}` })
  },

  // --- Role ---
  role: {
    getList: (params: Api.SystemManage.RoleSearchParams) =>
      request.get<Api.SystemManage.RoleList>({ url: '/api/app/role', params }),
    get: (id: string) =>
      request.get<Api.SystemManage.RoleGetOutputDto>({ url: `/api/app/role/${id}` }),
    create: (data: Api.SystemManage.RoleCreateInputVo) =>
      request.post<Api.SystemManage.RoleGetOutputDto>({ url: '/api/app/role', data }),
    update: (id: string, data: Api.SystemManage.RoleUpdateInputVo) =>
      request.put<Api.SystemManage.RoleGetOutputDto>({ url: `/api/app/role/${id}`, data }),
    del: (ids: string | string[]) => {
      const idStr = Array.isArray(ids) ? ids.join(',') : ids
      return request.del<any>({ url: `/api/app/role?ids=${idStr}` })
    },
    getMenus: (roleId: string) => request.get<string[]>({ url: `/api/app/menu/role-id/${roleId}` }),
    getDepts: (roleId: string) => request.get<string[]>({ url: `/api/app/dept/role-id/${roleId}` }),
    setDataScope: (data: Api.SystemManage.UpdateDataScopeInput) =>
      request.put<any>({ url: '/api/app/role/data-scope', data }),
    updateState: (id: string, state: boolean) =>
      request.put<any>({ url: `/api/app/role/${id}/${state}` }),
    getAuthUsers: (roleId: string, isAllocated: boolean, params?: any) =>
      request.get<any>({ url: `/api/app/role/auth-user/${roleId}/${isAllocated}`, params }),
    addAuthUsers: (data: Api.SystemManage.RoleAuthUserCreateOrDeleteInput) =>
      request.post<any>({ url: '/api/app/role/auth-user', data }),
    removeAuthUsers: (data: Api.SystemManage.RoleAuthUserCreateOrDeleteInput) =>
      request.del<any>({ url: '/api/app/role/auth-user', data }),
    getSelectData: (keywords?: string) =>
      request.get<any>({
        url: '/api/app/role/select-data-list',
        params: { keywords }
      }),
    export: (params: Api.SystemManage.RoleSearchParams) =>
      request.get<any>({ url: '/api/app/role/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/role/import-excel', data })
  },

  // --- Menu ---
  menu: {
    getList: (params: Api.SystemManage.MenuSearchParams) =>
      request.get<Api.SystemManage.MenuList>({ url: '/api/app/menu', params }),
    get: (id: string | number) =>
      request.get<Api.SystemManage.MenuGetOutputDto>({ url: `/api/app/menu/${id}` }),
    create: (data: Api.SystemManage.MenuCreateInputVo) =>
      request.post<Api.SystemManage.MenuGetOutputDto>({ url: '/api/app/menu', data }),
    update: (id: string | number, data: Api.SystemManage.MenuUpdateInputVo) =>
      request.put<Api.SystemManage.MenuGetOutputDto>({ url: `/api/app/menu/${id}`, data }),
    del: (ids: string | string[]) => {
      const idStr = Array.isArray(ids) ? ids.join(',') : ids
      return request.del<any>({ url: `/api/app/menu?ids=${idStr}` })
    },
    getMenusByRoleId: (roleId: string) =>
      request.get<Api.SystemManage.MenuGetListOutputDto[]>({
        url: `/api/app/menu/role-id/${roleId}`
      }),
    getSelectData: (keywords?: string) =>
      request.get<Api.SystemManage.MenuList>({
        url: '/api/app/menu/select-data-list',
        params: { keywords }
      }),
    export: (params: Api.SystemManage.MenuSearchParams) =>
      request.get<any>({ url: '/api/app/menu/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/menu/import-excel', data })
  },

  // --- Dept ---
  dept: {
    getList: (params: any) => request.get<any>({ url: '/api/app/dept', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/dept/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/dept', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/dept/${id}`, data }),
    // del: (id: string | number) => request.del<any>({ url: `/api/app/dept/${id}` })
    del: (id: string | number) => request.del<any>({ url: `/api/app/dept?ids=${id}` }),
    getDeptsByRoleId: (roleId: string | number) =>
      request.get<any[]>({ url: `/api/app/dept/role-id/${roleId}` }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/dept/select-data-list', params: { keywords } }),
    export: (params: any) =>
      request.get<any>({ url: '/api/app/dept/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/dept/import-excel', data })
  },

  // --- Post ---
  post: {
    getList: (params: Api.SystemManage.PostSearchParams) =>
      request.get<Api.SystemManage.PostList>({ url: '/api/app/post', params }),
    get: (id: string) => request.get<Api.SystemManage.PostListItem>({ url: `/api/app/post/${id}` }),
    create: (data: Api.SystemManage.PostCreateInput) =>
      request.post<Api.SystemManage.PostListItem>({ url: '/api/app/post', data }),
    update: (id: string, data: Api.SystemManage.PostUpdateInput) =>
      request.put<Api.SystemManage.PostListItem>({ url: `/api/app/post/${id}`, data }),
    del: (ids: string | string[]) => {
      const idStr = Array.isArray(ids) ? ids.join(',') : ids
      return request.del<any>({ url: `/api/app/post?ids=${idStr}` })
    },
    getSelectData: (keywords?: string) =>
      request.get<Api.SystemManage.PostList>({
        url: '/api/app/post/select-data-list',
        params: { keywords }
      }),
    export: (params: Api.SystemManage.PostSearchParams) =>
      request.get<any>({ url: '/api/app/post/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/post/import-excel', data })
  },

  // --- Dict ---
  dictionary: {
    type: {
      getList: (params: Api.SystemManage.DictionaryTypeSearchParams) =>
        request.get<Api.SystemManage.DictionaryTypeList>({
          url: '/api/app/dictionary-type',
          params
        }),
      get: (id: string) =>
        request.get<Api.SystemManage.DictionaryTypeGetOutputDto>({
          url: `/api/app/dictionary-type/${id}`
        }),
      create: (data: Api.SystemManage.DictionaryTypeCreateInputVo) =>
        request.post<Api.SystemManage.DictionaryTypeGetOutputDto>({
          url: '/api/app/dictionary-type',
          data
        }),
      update: (id: string, data: Api.SystemManage.DictionaryTypeUpdateInputVo) =>
        request.put<Api.SystemManage.DictionaryTypeGetOutputDto>({
          url: `/api/app/dictionary-type/${id}`,
          data
        }),
      del: (ids: string | string[]) => {
        const idStr = Array.isArray(ids) ? ids.join(',') : ids
        return request.del<any>({ url: `/api/app/dictionary-type?ids=${idStr}` })
      },
      getSelectData: (keywords?: string) =>
        request.get<Api.SystemManage.DictionaryTypeList>({
          url: '/api/app/dictionary-type/select-data-list',
          params: { keywords }
        }),
      export: (params: Api.SystemManage.DictionaryTypeSearchParams) =>
        request.get<any>({
          url: '/api/app/dictionary-type/export-excel',
          params,
          responseType: 'blob'
        }),
      import: (data: FormData) =>
        request.post<any>({ url: '/api/app/dictionary-type/import-excel', data })
    },
    data: {
      getList: (params: Api.SystemManage.DictionarySearchParams) =>
        request.get<Api.SystemManage.DictionaryList>({ url: '/api/app/dictionary-data', params }),
      get: (id: string) =>
        request.get<Api.SystemManage.DictionaryGetOutputDto>({
          url: `/api/app/dictionary-data/${id}`
        }),
      create: (data: Api.SystemManage.DictionaryCreateInputVo) =>
        request.post<Api.SystemManage.DictionaryGetOutputDto>({
          url: '/api/app/dictionary-data',
          data
        }),
      update: (id: string, data: Api.SystemManage.DictionaryUpdateInputVo) =>
        request.put<Api.SystemManage.DictionaryGetOutputDto>({
          url: `/api/app/dictionary-data/${id}`,
          data
        }),
      del: (ids: string | string[]) => {
        const idStr = Array.isArray(ids) ? ids.join(',') : ids
        return request.del<any>({ url: `/api/app/dictionary-data?ids=${idStr}` })
      },
      getByType: (type: string) =>
        request.get<Api.SystemManage.DictionaryGetListOutputDto[]>({
          url: `/api/app/dictionary-data/type/${type}`
        }),
      getSelectData: (keywords?: string) =>
        request.get<Api.SystemManage.DictionaryList>({
          url: '/api/app/dictionary-data/select-data-list',
          params: { keywords }
        }),
      export: (params: Api.SystemManage.DictionarySearchParams) =>
        request.get<any>({
          url: '/api/app/dictionary-data/export-excel',
          params,
          responseType: 'blob'
        }),
      import: (data: FormData) =>
        request.post<any>({ url: '/api/app/dictionary-data/import-excel', data })
    }
  },

  // --- Config ---
  config: {
    getList: (params: Api.SystemManage.ConfigSearchParams) =>
      request.get<Api.SystemManage.ConfigList>({ url: '/api/app/config', params }),
    get: (id: string) =>
      request.get<Api.SystemManage.ConfigGetOutputDto>({ url: `/api/app/config/${id}` }),
    create: (data: Api.SystemManage.ConfigCreateInputVo) =>
      request.post<Api.SystemManage.ConfigGetOutputDto>({ url: '/api/app/config', data }),
    update: (id: string, data: Api.SystemManage.ConfigUpdateInputVo) =>
      request.put<Api.SystemManage.ConfigGetOutputDto>({ url: `/api/app/config/${id}`, data }),
    del: (ids: string | string[]) => {
      const idStr = Array.isArray(ids) ? ids.join(',') : ids
      return request.del<any>({ url: `/api/app/config?ids=${idStr}` })
    },
    getSelectData: (keywords?: string) =>
      request.get<Api.SystemManage.ConfigList>({
        url: '/api/app/config/select-data-list',
        params: { keywords }
      }),
    export: (params: Api.SystemManage.ConfigSearchParams) =>
      request.get<any>({ url: '/api/app/config/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/config/import-excel', data })
  },

  // --- Notice ---
  notice: {
    getList: (params: any) => request.get<any>({ url: '/api/app/notice', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/notice/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/notice', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/notice/${id}`, data }),
    // del: (id: string | number) => request.del<any>({ url: `/api/app/notice/${id}` })
    del: (id: string | number) => request.del<any>({ url: `/api/app/notice?ids=${id}` }),
    sendOnlineMessage: (id: string | number) =>
      request.post<any>({ url: `/api/app/notice/online/${id}` }),
    sendOfflineMessage: (id: string | number) =>
      request.post<any>({ url: `/api/app/notice/offline/${id}` }),
    export: (params: any) =>
      request.get<any>({ url: '/api/app/notice/export-excel', params, responseType: 'blob' }),
    import: (data: FormData) => request.post<any>({ url: '/api/app/notice/import-excel', data }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/notice/select-data-list', params: { keywords } })
  },

  // --- Logs ---
  logs: {
    login: (params: any) => request.get<any>({ url: '/api/app/login-log', params }),
    operation: (params: any) => request.get<any>({ url: '/api/app/operation-log', params })
  },

  // --- Online ---
  online: {
    getList: (params: Api.SystemManage.OnlineUserSearchParams) =>
      request.get<Api.SystemManage.OnlineUserList>({ url: '/api/app/online', params }),
    forceLogout: (connectionId: string) =>
      request.del<boolean>({ url: `/api/app/online/${connectionId}` })
  },

  // --- Monitor ---
  monitor: {
    server: () => request.get<any>({ url: '/api/app/monitor/server' }),
    serverInfo: () =>
      request.get<Api.Monitor.MonitorServerInfoDto>({ url: '/api/app/monitor-server/info' }),
    cache: {
      getNames: () =>
        request.get<Api.Monitor.MonitorCacheNameGetListOutputDto[]>({
          url: '/api/app/monitor-cache/name'
        }),
      getKeys: (name: string) =>
        request.get<string[]>({ url: `/api/app/monitor-cache/key/${name}` }),
      getValue: (name: string, key: string) =>
        request.get<Api.Monitor.MonitorCacheGetListOutputDto>({
          url: `/api/app/monitor-cache/value/${name}/${key}`
        }),
      clearName: (name: string) =>
        request.del<boolean>({ url: `/api/app/monitor-cache/key/${name}` }),
      clearKey: (name: string, key: string) =>
        request.del<boolean>({ url: `/api/app/monitor-cache/value/${name}/${key}` }),
      clearAll: () => request.del<boolean>({ url: '/api/app/monitor-cache/clear' })
    }
  },

  // --- Tenant ---
  tenant: {
    getList: (params: any) => request.get<any>({ url: '/api/app/tenant', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/tenant/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/tenant', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/tenant/${id}`, data }),
    del: (id: string | number) => request.del<any>({ url: '/api/app/tenant', params: { id } })
  },

  // --- CodeGen ---
  codegen: {
    webToCode: (tableIds: string[]) =>
      request.post<any>({ url: '/api/app/code-gen/web-build-code', data: tableIds }),
    webToDb: (tableIds: string[]) =>
      request.post<any>({ url: '/api/app/code-gen/web-build-db', data: tableIds }),
    codeToWeb: (tableIds: string[]) =>
      request.post<any>({ url: '/api/app/code-gen/code-build-web', data: tableIds }),
    codeToDb: (tableIds: string[]) =>
      request.post<any>({ url: '/api/app/code-gen/code-build-db', data: tableIds }),
    openDir: (path: string) => request.post<any>({ url: `/api/app/code-gen/dir/${path}` })
  },

  // --- Table ---
  table: {
    getList: (params: any) => request.get<any>({ url: '/api/app/table', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/table/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/table', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/table/${id}`, data }),
    del: (ids: string[]) => request.del<any>({ url: '/api/app/table', params: { ids } }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/table/select-data-list', params: { keywords } })
  },

  // --- Field ---
  field: {
    getList: (params: any) => request.get<any>({ url: '/api/app/field', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/field/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/field', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/field/${id}`, data }),
    del: (ids: string[]) => request.del<any>({ url: '/api/app/field', params: { ids } }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/field/select-data-list', params: { keywords } }),
    getFieldType: () => request.get<string[]>({ url: '/api/app/field/type' })
  },

  // --- Template ---
  template: {
    getList: (params: any) => request.get<any>({ url: '/api/app/template', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/template/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/template', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/template/${id}`, data }),
    del: (ids: string[]) => request.del<any>({ url: '/api/app/template', params: { ids } })
  },

  // --- File ---
  file: {
    // The swagger defines the upload endpoint as POST /api/app/file
    // It expects multipart/form-data with a 'file' field (array of binaries).
    upload: (data: FormData) => request.post<any>({ url: '/api/app/file', data }),

    // GET /api/app/file/{code}/{isThumbnail}
    // Returns a blob (file stream)
    download: (code: string, isThumbnail: boolean = false) =>
      request.get<Blob>({ url: `/api/app/file/${code}/${isThumbnail}`, responseType: 'blob' })
  }
}
