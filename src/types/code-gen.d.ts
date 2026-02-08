/**
 * Code Generation Module Type Definitions
 */
declare namespace Api {
  namespace CodeGen {
    /** Field Type Enum */
    enum FieldType {
      String = 'String',
      Int = 'Int',
      Long = 'Long',
      Bool = 'Bool',
      Decimal = 'Decimal',
      DateTime = 'DateTime',
      Guid = 'Guid'
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

    /** Table DTO */
    interface TableDto {
      id: string
      name?: string
      description?: string
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
