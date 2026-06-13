/**
 * Code Generation Module Type Definitions
 */
declare namespace Api {
  namespace CodeGen {
    /** Field Type Enum (String=1, Int=2, Long=3, Bool=4, Decimal=5, DateTime=6, Guid=7, Float=8, Double=9) */
    enum FieldType {
      String = 'String',
      Int = 'Int',
      Long = 'Long',
      Bool = 'Bool',
      Decimal = 'Decimal',
      DateTime = 'DateTime',
      Guid = 'Guid',
      Float = 'Float',
      Double = 'Double'
    }

    /** Field DTO */
    interface FieldDto {
      id: string
      name?: string
      description?: string
      orderNum?: number
      length?: number
      fieldType?: FieldType
      tableId?: string
      isRequired?: boolean
      isKey?: boolean
      isAutoAdd?: boolean
      isPublic?: boolean
      isQueryField?: boolean
      isListDisplay?: boolean
      isFormItem?: boolean
      htmlType?: string
    }

    /** ABP Pagination Params */
    interface AbpPaginationParams {
      SkipCount?: number
      MaxResultCount?: number
      Sorting?: string
    }

    /** Field Search Params */
    interface FieldSearchParams extends AbpPaginationParams {
      Name?: string
      TableId?: string
    }

    /** Field List Response */
    interface FieldList {
      items: FieldDto[]
      totalCount: number
    }

    /** Template DTO */
    interface TemplateDto {
      id: string
      name?: string
      templateStr?: string
      buildPath?: string
      remarks?: string
    }

    /** Template Search Params */
    interface TemplateSearchParams extends AbpPaginationParams {
      Name?: string
      Sorting?: string
    }

    /** Template List Response */
    interface TemplateList {
      items: TemplateDto[]
      totalCount: number
    }

    /** Table DTO (also used as Create/Update input) */
    interface TableDto {
      id: string
      name?: string
      physicalTableName?: string
      description?: string
      moduleName?: string
      rootNamespace?: string
      isOverwrite?: boolean
      projectName?: string
      lastSyncTime?: string
      lastBuildTime?: string
      fields?: FieldDto[]
    }

    /** Table Search Params */
    interface TableSearchParams extends AbpPaginationParams {
      Sorting?: string
    }

    /** Table List Response */
    interface TableList {
      items: TableDto[]
      totalCount: number
    }
  }
}
