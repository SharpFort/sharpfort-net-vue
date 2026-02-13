import request from '@/utils/http'

export type SequenceResetType =
  | 'None'
  | 'Daily'
  | 'Monthly'
  | 'Yearly'
  | 'Weekly'
  | 'Quarterly'
  | 'FiscalYearly'

export interface CreateSequenceRuleInput {
  ruleName: string
  ruleCode: string
  template: string
  step?: number
  seqLength?: number
  minValue?: number
  maxValue?: number
  resetType?: SequenceResetType
  remark?: string
  extensionProps?: any
}

export interface UpdateSequenceRuleInput {
  ruleName: string
  ruleCode: string
  template: string
  step?: number
  seqLength?: number
  minValue?: number
  maxValue?: number
  resetType?: SequenceResetType
  remark?: string
  extensionProps?: any
}

export interface SequenceRuleDto {
  id: number
  creationTime?: string
  creatorId?: string
  lastModificationTime?: string
  lastModifierId?: string
  ruleName?: string
  ruleCode?: string
  template?: string
  currentValue?: number
  step?: number
  seqLength?: number
  minValue?: number
  maxValue?: number
  resetType?: SequenceResetType
  lastResetTime?: string
  remark?: string
  extensionProps?: any
}

export interface PlaceholderMetaDto {
  key?: string
  label?: string
  group?: string
}

export interface PagedResultDto<T> {
  items: T[]
  totalCount: number
}

export const SequenceApi = {
  sequenceRule: {
    getList: (params?: any) =>
      request.get<PagedResultDto<SequenceRuleDto>>({ url: `/api/app/sequence-rule`, params }),
    get: (id: number) => request.get<SequenceRuleDto>({ url: `/api/app/sequence-rule/${id}` }),
    create: (data: CreateSequenceRuleInput) =>
      request.post<SequenceRuleDto>({ url: `/api/app/sequence-rule`, data }),
    update: (id: number, data: UpdateSequenceRuleInput) =>
      request.put<SequenceRuleDto>({ url: `/api/app/sequence-rule/${id}`, data }),
    del: (id: number) => request.del<any>({ url: `/api/app/sequence-rule`, params: { id } }), // Adjusted param structure for delete typically expecting ids in specific way or just query params

    testGenerate: (data: any, params?: any) =>
      request.post<string>({ url: `/api/app/sequence-rule/test-generate`, data, params }),
    getPlaceholders: () =>
      request.get<PlaceholderMetaDto[]>({ url: `/api/app/sequence-rule/placeholders` }),

    // Custom/Specific methods renamed to avoid duplicates
    getSelectData: (params?: any) =>
      request.get<PagedResultDto<SequenceRuleDto>>({
        url: `/api/app/sequence-rule/select-data-list`,
        params
      }),
    export: (params?: any) =>
      request.get<any>({
        url: `/api/app/sequence-rule/export-excel`,
        params,
        responseType: 'blob'
      }),
    import: (data: any) => request.post<any>({ url: `/api/app/sequence-rule/import-excel`, data })
  }
}
