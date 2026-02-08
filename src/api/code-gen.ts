import request from '@/utils/http'

export const CodeGenApi = {
  field: {
    getList: (params: Api.CodeGen.FieldSearchParams) =>
      request.get<Api.CodeGen.FieldList>({ url: '/api/app/field', params }),
    get: (id: string) => request.get<Api.CodeGen.FieldDto>({ url: `/api/app/field/${id}` }),
    create: (data: Api.CodeGen.FieldDto) =>
      request.post<Api.CodeGen.FieldDto>({ url: '/api/app/field', data }),
    update: (id: string, data: Api.CodeGen.FieldDto) =>
      request.put<Api.CodeGen.FieldDto>({ url: `/api/app/field/${id}`, data }),
    del: (ids: string[]) => request.del<any>({ url: '/api/app/field', params: { ids } }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/field/select-data-list', params: { keywords } }),
    getFieldType: () => request.get<string[]>({ url: '/api/app/field/type' }),
    export: (params: Api.CodeGen.FieldSearchParams) =>
      request.get<any>({ url: '/api/app/field/export-excel', params, responseType: 'blob' }),
    import: (data: Api.CodeGen.FieldDto[]) =>
      request.post<any>({ url: '/api/app/field/import-excel', data })
  },
  template: {
    getList: (params: Api.CodeGen.TemplateSearchParams) =>
      request.get<Api.CodeGen.TemplateList>({ url: '/api/app/template', params }),
    get: (id: string) => request.get<Api.CodeGen.TemplateDto>({ url: `/api/app/template/${id}` }),
    create: (data: Api.CodeGen.TemplateDto) =>
      request.post<Api.CodeGen.TemplateDto>({ url: '/api/app/template', data }),
    update: (id: string, data: Api.CodeGen.TemplateDto) =>
      request.put<Api.CodeGen.TemplateDto>({ url: `/api/app/template/${id}`, data }),
    del: (ids: string[]) => request.del<any>({ url: '/api/app/template', params: { ids } }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/template/select-data-list', params: { keywords } }),
    export: (params: Api.CodeGen.TemplateSearchParams) =>
      request.get<any>({ url: '/api/app/template/export-excel', params, responseType: 'blob' }),
    import: (data: Api.CodeGen.TemplateDto[]) =>
      request.post<any>({ url: '/api/app/template/import-excel', data })
  },
  table: {
    getList: (params: Api.CodeGen.TableSearchParams) =>
      request.get<Api.CodeGen.TableList>({ url: '/api/app/table', params }),
    get: (id: string) => request.get<Api.CodeGen.TableDto>({ url: `/api/app/table/${id}` }),
    create: (data: Api.CodeGen.TableDto) =>
      request.post<Api.CodeGen.TableDto>({ url: '/api/app/table', data }),
    update: (id: string, data: Api.CodeGen.TableDto) =>
      request.put<Api.CodeGen.TableDto>({ url: `/api/app/table/${id}`, data }),
    del: (ids: string[]) => request.del<any>({ url: '/api/app/table', params: { ids } }),
    getSelectData: (keywords?: string) =>
      request.get<any>({ url: '/api/app/table/select-data-list', params: { keywords } }),
    export: (params: Api.CodeGen.TableSearchParams) =>
      request.get<any>({ url: '/api/app/table/export-excel', params, responseType: 'blob' }),
    import: (data: Api.CodeGen.TableDto[]) =>
      request.post<any>({ url: '/api/app/table/import-excel', data })
  },
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
  }
}
