import request from '@/utils/http'

/**
 * Casbin-RBAC API Service
 */
export const CasbinApi = {
  // --- Account ---

  account: {
    login: (data: any) => request.post<any>({ url: '/api/app/account/login', data }),
    register: (data: any) => request.post<any>({ url: '/api/app/account/register', data }),
    getCaptcha: () => request.get<any>({ url: '/api/app/account/captcha-image' }),
    getPhoneCaptcha: (data: any) =>
      request.post<any>({ url: '/api/app/account/captcha-phone', data }),
    getPhoneCaptchaForReset: (data: any) =>
      request.post<any>({ url: '/api/app/account/captcha-phone/repassword', data }),
    retrievePassword: (data: any) =>
      request.post<any>({ url: '/api/app/account/retrieve-password', data }),
    refreshToken: (refreshToken: string) =>
      request.post<any>({
        url: '/api/app/account/refresh',
        params: { refresh_token: refreshToken }
      }),
    restPassword: (userId: string | number, data: { password: string }) =>
      request.put<any>({ url: `/api/app/account/rest-password/${userId}`, data }),
    bindPhone: (data: any) =>
      request.post<any>({ url: '/api/app/account/captcha-phone/bind', data }),
    validatePhoneCaptcha: (data: any) =>
      request.post<any>({ url: '/api/app/account/validation-phone-captcha', data }),
    getAccountInfo: () => request.get<any>({ url: '/api/app/account' }),
    getVue3Router: (routerType: string) =>
      request.get<any>({ url: `/api/app/account/Vue3Router/${routerType}` }),
    logout: () => request.post<any>({ url: '/api/app/account/logout' }),
    updatePassword: (data: any) => request.put<any>({ url: '/api/app/account/password', data }),
    updateIcon: (data: any) => request.put<any>({ url: '/api/app/account/icon', data })
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
    getList: (params: any) => request.get<any>({ url: '/api/app/role', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/role/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/role', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/role/${id}`, data }),
    // del: (id: string | number) => request.del<any>({ url: `/api/app/role/${id}` }),
    del: (id: string | number) => request.del<any>({ url: `/api/app/role?ids=${id}` }),
    getMenus: (roleId: string | number) =>
      request.get<string[]>({ url: `/api/app/menu/role-id/${roleId}` }),
    getDepts: (roleId: string | number) =>
      request.get<string[]>({ url: `/api/app/dept/role-id/${roleId}` }),
    setDataScope: (data: any) => request.put<any>({ url: '/api/app/role/data-scope', data }),
    updateState: (id: string | number, state: boolean) =>
      request.put<any>({ url: `/api/app/role/${id}/${state}` })
  },

  // --- Menu ---
  menu: {
    getList: (params: any) => request.get<any>({ url: '/api/app/menu', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/menu/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/menu', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/menu/${id}`, data }),
    // del: (id: string | number) => request.del<any>({ url: `/api/app/menu/${id}` })
    del: (id: string | number) => request.del<any>({ url: `/api/app/menu?ids=${id}` })
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
      getList: (params: any) => request.get<any>({ url: '/api/app/dictionary-type', params }),
      get: (id: string | number) => request.get<any>({ url: `/api/app/dictionary-type/${id}` }),
      create: (data: any) => request.post<any>({ url: '/api/app/dictionary-type', data }),
      update: (id: string | number, data: any) =>
        request.put<any>({ url: `/api/app/dictionary-type/${id}`, data }),
      // del: (id: string | number) => request.del<any>({ url: `/api/app/dictionary-type/${id}` })
      del: (id: string | number) => request.del<any>({ url: `/api/app/dictionary-type?ids=${id}` })
    },
    data: {
      getList: (params: any) => request.get<any>({ url: '/api/app/dictionary-data', params }),
      get: (id: string | number) => request.get<any>({ url: `/api/app/dictionary-data/${id}` }),
      create: (data: any) => request.post<any>({ url: '/api/app/dictionary-data', data }),
      update: (id: string | number, data: any) =>
        request.put<any>({ url: `/api/app/dictionary-data/${id}`, data }),
      // del: (id: string | number) => request.del<any>({ url: `/api/app/dictionary-data/${id}` }),
      del: (id: string | number) => request.del<any>({ url: `/api/app/dictionary-data?ids=${id}` }),
      getByType: (type: string) =>
        request.get<any[]>({ url: `/api/app/dictionary-data/type/${type}` })
    }
  },

  // --- Config ---
  config: {
    getList: (params: any) => request.get<any>({ url: '/api/app/config', params }),
    get: (id: string | number) => request.get<any>({ url: `/api/app/config/${id}` }),
    create: (data: any) => request.post<any>({ url: '/api/app/config', data }),
    update: (id: string | number, data: any) =>
      request.put<any>({ url: `/api/app/config/${id}`, data }),
    // del: (id: string | number) => request.del<any>({ url: `/api/app/config/${id}` })
    del: (id: string | number) =>
      request.del<any>({
        url: `/api/app/config?ids=${id}`
      })
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

  // --- Monitor ---
  monitor: {
    online: (params: any) =>
      request.get<Api.SystemManage.OnlineUserModel[]>({ url: '/api/app/online', params }),
    forceLogout: (connectionId: string) =>
      request.del<any>({ url: `/api/app/online/${connectionId}` }),
    server: () => request.get<any>({ url: '/api/app/monitor/server' }),
    serverInfo: () =>
      request.get<Api.Monitor.MonitorServerInfoDto>({ url: '/api/app/monitor-server/info' }),
    cache: {
      getNames: () => request.get<any>({ url: '/api/app/monitor-cache/name' }),
      getKeys: (name: string) => request.get<any>({ url: `/api/app/monitor-cache/key/${name}` }),
      getValue: (name: string, key: string) =>
        request.get<any>({ url: `/api/app/monitor-cache/value/${name}/${key}` }),
      clearName: (name: string) => request.del<any>({ url: `/api/app/monitor-cache/key/${name}` }),
      clearKey: (name: string, key: string) =>
        request.del<any>({ url: `/api/app/monitor-cache/value/${name}/${key}` }),
      clearAll: () => request.del<any>({ url: '/api/app/monitor-cache/clear' })
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
