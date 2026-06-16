import request from '@/utils/http'

export const CodeGenApi = {
  /** 字段管理（Field）— 结构由反射同步维护，前端只编辑 UI 配置 */
  field: {
    /** 分页查询字段列表 */
    getList: (params: Api.CodeGen.FieldSearchParams) =>
      request.get<Api.CodeGen.FieldList>({ url: '/api/app/field', params }),

    /** 获取字段详情 */
    get: (id: string) => request.get<Api.CodeGen.FieldDto>({ url: `/api/app/field/${id}` }),

    /** 更新字段 UI 配置（仅 isQueryField / isListDisplay / isFormItem / htmlType / orderNum / description） */
    update: (id: string, data: Api.CodeGen.FieldDto) =>
      request.put<Api.CodeGen.FieldDto>({ url: `/api/app/field/${id}`, data }),

    /** 获取字段类型枚举列表 */
    getFieldType: () => request.get<string[]>({ url: '/api/app/field/type' })
  },

  /** 模板管理（Template）— 完整 CRUD */
  template: {
    /** 分页查询模板列表 */
    getList: (params: Api.CodeGen.TemplateSearchParams) =>
      request.get<Api.CodeGen.TemplateList>({ url: '/api/app/template', params }),

    /** 获取模板详情 */
    get: (id: string) => request.get<Api.CodeGen.TemplateDto>({ url: `/api/app/template/${id}` }),

    /** 创建新模板 */
    create: (data: Api.CodeGen.TemplateDto) =>
      request.post<Api.CodeGen.TemplateDto>({ url: '/api/app/template', data }),

    /** 更新模板 */
    update: (id: string, data: Api.CodeGen.TemplateDto) =>
      request.put<Api.CodeGen.TemplateDto>({ url: `/api/app/template/${id}`, data }),

    /** 批量删除模板 */
    del: (ids: string[]) => request.del<void>({ url: '/api/app/template', params: { ids } }),

    /**
     * 导入模板（本地 → DB）：扫描本地 Templates/*.scriban 文件，增量同步到 gen_template 表
     * 规则（Upsert by Name）：
     * - 本地存在 + DB 不存在 → INSERT 新模板
     * - 本地存在 + DB 已存在 → UPDATE Content（保留用户 Remarks）
     * - 本地不存在 + DB 存在 → 跳过（不删除，由用户手动管理）
     */
    importTemplates: () => request.post<void>({ url: '/api/app/template/import-templates' }),

    /**
     * 导出模板（DB → 本地）：遍历数据库中所有模板，写入本地 Templates/{Name}.scriban 文件
     * 规则：
     * - DB 存在 + 本地不存在 → 写入本地文件（补全缺失）
     * - DB 存在 + 本地存在   → 覆写本地文件（保持一致）
     */
    exportTemplates: () => request.post<void>({ url: '/api/app/template/export-templates' })
  },

  /** 实体注册表（Table）— 由 Code→Web 反射同步维护，前端只编辑配置 */
  table: {
    /** 分页查询实体注册表列表 */
    getList: (params: Api.CodeGen.TableSearchParams) =>
      request.get<Api.CodeGen.TableList>({ url: '/api/app/table', params }),

    /** 获取实体注册表详情（含关联字段列表） */
    get: (id: string) => request.get<Api.CodeGen.TableDto>({ url: `/api/app/table/${id}` }),

    /** 更新实体注册表配置（ModuleName / RootNamespace / IsOverwrite / ProjectName / Description） */
    update: (id: string, data: Api.CodeGen.TableDto) =>
      request.put<Api.CodeGen.TableDto>({ url: `/api/app/table/${id}`, data }),

    /** 获取搜索栏下拉框数据（按 ModuleName/ProjectName 分组去重） */
    getSelectData: (keywords?: string) =>
      request.get<Api.CodeGen.TableList>({
        url: '/api/app/table/select-data-list',
        params: { keywords }
      })
  },

  /** 代码生成操作 */
  codegen: {
    /** 生成代码 (Web → Code)：根据选中的实体注册表 ID 列表，使用 Scriban 模板生成 DTO / IService / Service 代码 */
    webToCode: (tableIds: string[]) =>
      request.post<void>({ url: '/api/app/code-gen/web-build-code', data: tableIds }),

    /** 同步实体到注册表 (Code → Web)：反射扫描所有带 [SugarTable] 特性的 C# Entity 类，增量合并到 YiTable */
    codeToWeb: () => request.post<void>({ url: '/api/app/code-gen/code-build-web' }),

    /** 手动刷新实体注册表：重新扫描所有实体类并增量同步到 YiTable */
    refresh: () => request.post<void>({ url: '/api/app/code-gen/refresh' }),

    /** 打开本地目录 */
    openDir: (path: string) => request.post<void>({ url: `/api/app/code-gen/dir/${path}` })
  }
}
