import request from '@/utils/http'

// ========================
// Enums
// ========================

export type SequenceResetType =
  | 'None'
  | 'Daily'
  | 'Monthly'
  | 'Yearly'
  | 'Weekly'
  | 'Quarterly'
  | 'FiscalYearly'

// ========================
// DTOs
// ========================

/** 创建序号规则输入 */
export interface CreateSequenceRuleInput {
  /** 规则名称 (maxLength: 50, required) */
  ruleName: string
  /** 规则代码 (maxLength: 50, required) */
  ruleCode: string
  /** 模板 (maxLength: 100, required) 例: {Year}{Month}{Day}{Seq:4} */
  template: string
  /** 步长 */
  step?: number
  /** 序列长度 */
  seqLength?: number
  /** 最小值 */
  minValue?: number
  /** 最大值 */
  maxValue?: number
  /** 重置类型 */
  resetType?: SequenceResetType
  /** 备注 */
  remark?: string
  /** 扩展属性 */
  extensionProps?: Record<string, unknown>
}

/** 更新序号规则输入 */
export interface UpdateSequenceRuleInput {
  /** 规则名称 (maxLength: 50, required) */
  ruleName: string
  /** 规则代码 (maxLength: 50, required) */
  ruleCode: string
  /** 模板 (maxLength: 100, required) */
  template: string
  /** 步长 */
  step?: number
  /** 序列长度 */
  seqLength?: number
  /** 最小值 */
  minValue?: number
  /** 最大值 */
  maxValue?: number
  /** 重置类型 */
  resetType?: SequenceResetType
  /** 备注 */
  remark?: string
  /** 扩展属性 */
  extensionProps?: Record<string, unknown>
}

/** 序号规则 DTO */
export interface SequenceRuleDto {
  /** 主键 ID (int64) */
  id: number
  /** 创建时间 */
  creationTime?: string
  /** 创建者 ID */
  creatorId?: string
  /** 最后修改时间 */
  lastModificationTime?: string
  /** 最后修改者 ID */
  lastModifierId?: string
  /** 规则名称 */
  ruleName?: string
  /** 规则代码 */
  ruleCode?: string
  /** 模板 */
  template?: string
  /** 当前序号值 */
  currentValue?: number
  /** 步长 */
  step?: number
  /** 序列长度 */
  seqLength?: number
  /** 最小值 */
  minValue?: number
  /** 最大值 */
  maxValue?: number
  /** 重置类型 */
  resetType?: SequenceResetType
  /** 最后重置时间 */
  lastResetTime?: string
  /** 备注 */
  remark?: string
  /** 扩展属性 */
  extensionProps?: Record<string, unknown>
}

/** 占位符元数据 DTO */
export interface PlaceholderMetaDto {
  /** 占位符 Key */
  key?: string
  /** 显示标签 */
  label?: string
  /** 分组 */
  group?: string
}

/** 分页结果 */
export interface PagedResultDto<T> {
  items: T[]
  totalCount: number
}

/** 序号规则列表查询参数 */
export interface SequenceRuleSearchParams {
  /** 规则名称（模糊搜索） */
  RuleName?: string
  /** 规则代码（模糊搜索） */
  RuleCode?: string
  /** 查询开始时间 */
  StartTime?: string
  /** 查询结束时间 */
  EndTime?: string
  /** 排序列名 */
  OrderByColumn?: string
  /** 是否升序 */
  IsAscending?: boolean
  /** 排序表达式 */
  Sorting?: string
  /** 跳过条数 */
  SkipCount?: number
  /** 每页条数 */
  MaxResultCount?: number
}

// ========================
// API
// ========================

export const SequenceApi = {
  sequenceRule: {
    /** 分页查询序号规则列表 */
    getList: (params?: SequenceRuleSearchParams) =>
      request.get<PagedResultDto<SequenceRuleDto>>({ url: `/api/app/sequence-rule`, params }),

    /** 获取单条序号规则 */
    get: (id: number) => request.get<SequenceRuleDto>({ url: `/api/app/sequence-rule/${id}` }),

    /** 创建序号规则 */
    create: (data: CreateSequenceRuleInput) =>
      request.post<SequenceRuleDto>({ url: `/api/app/sequence-rule`, data }),

    /** 更新序号规则 */
    update: (id: number, data: UpdateSequenceRuleInput) =>
      request.put<SequenceRuleDto>({ url: `/api/app/sequence-rule/${id}`, data }),

    /** 删除序号规则（支持批量，传入单个 ID 或 ID 数组） */
    del: (ids: number | number[]) => {
      const idStr = Array.isArray(ids) ? ids.join(',') : String(ids)
      return request.del<void>({ url: `/api/app/sequence-rule?ids=${idStr}` })
    },

    /** 测试生成序号 */
    testGenerate: (ruleCode: string, context?: Record<string, string>) =>
      request.post<string>({
        url: `/api/app/sequence-rule/test-generate`,
        params: { ruleCode },
        data: context ?? {}
      }),

    /** 获取可用占位符列表 */
    getPlaceholders: () =>
      request.get<PlaceholderMetaDto[]>({ url: `/api/app/sequence-rule/placeholders` }),

    /** 动态下拉框数据 */
    getSelectData: (keywords?: string) =>
      request.get<PagedResultDto<SequenceRuleDto>>({
        url: `/api/app/sequence-rule/select-data-list`,
        params: keywords ? { keywords } : undefined
      }),

    /** 导出 Excel */
    export: (params?: SequenceRuleSearchParams) =>
      request.get<Blob>({
        url: `/api/app/sequence-rule/export-excel`,
        params,
        responseType: 'blob'
      }),

    /** 导入 Excel */
    import: (data: CreateSequenceRuleInput[]) =>
      request.post<void>({ url: `/api/app/sequence-rule/import-excel`, data })
  }
}
