/**
 * Code Generation Module Type Definitions
 *
 * 模块包含以下子模块：
 * - Field: 字段定义（由反射同步维护，前端仅编辑 UI 配置）
 * - Table: 实体注册表（由反射同步维护，前端仅编辑模块/命名空间等配置）
 * - Template: Scriban 代码生成模板（完整 CRUD）
 * - CodeGen: 代码生成操作（Web→Code / Code→Web / 刷新 / 打开目录）
 */
declare namespace Api {
  namespace CodeGen {
    /** Field Type Enum (String=1, Int=2, Long=3, Bool=4, Decimal=5, DateTime=6, Guid=7, Float=8, Double=9) */
    type FieldType =
      | 'String'
      | 'Int'
      | 'Long'
      | 'Bool'
      | 'Decimal'
      | 'DateTime'
      | 'Guid'
      | 'Float'
      | 'Double'

    // ==================== Field 字段 ====================

    /**
     * 字段 DTO（完整信息）
     * 结构属性由反射同步维护，修改后下次同步可能被覆盖
     */
    interface FieldDto {
      /** 字段 ID */
      id: string
      /** 字段名称（由反射同步，不建议手动修改） */
      name?: string | null
      /** 字段描述/备注 */
      description?: string | null
      /** 字段排序权重 */
      orderNum?: number
      /** 字段长度 */
      length?: number
      /** 字段类型（String/Int/Long/Bool/Decimal/DateTime/Guid/Float/Double） */
      fieldType?: FieldType
      /** 关联表 ID */
      tableId?: string
      /** 所属实体名称（查询时 Join 填充） */
      tableName?: string | null
      /** 所属模块名称（查询时 Join 填充） */
      moduleName?: string | null
      /** 是否必填 */
      isRequired?: boolean
      /** 是否主键 */
      isKey?: boolean
      /** 是否自增 */
      isAutoAdd?: boolean
      /** 是否公共字段 */
      isPublic?: boolean
      /** 是否查询字段：生成查询条件 */
      isQueryField?: boolean
      /** 是否列表显示：在列表 DTO 中生成 */
      isListDisplay?: boolean
      /** 是否表单项：在表单 DTO 中生成 */
      isFormItem?: boolean
      /** 前端控件类型: Input/Select/DatePicker/Textarea/Switch */
      htmlType?: string | null
    }

    /** 字段搜索参数 */
    interface FieldSearchParams {
      /** 字段名称模糊筛选 */
      Name?: string
      /** 关联实体注册表 ID */
      TableId?: string
      Sorting?: string
      SkipCount?: number
      MaxResultCount?: number
    }

    /** 字段分页列表响应 */
    interface FieldList {
      items: FieldDto[]
      totalCount: number
    }

    // ==================== Table 实体注册表 ====================

    /**
     * 实体注册表 DTO
     * 包含实体配置信息及关联的字段列表
     */
    interface TableDto {
      id: string
      /** 实体类名称 (如: SystemUser)，由反射同步维护 */
      name?: string | null
      /** 物理数据库表名 (如: sys_user)，由反射同步维护 */
      physicalTableName?: string | null
      /** 实体描述/备注 */
      description?: string | null
      /** 所属模块名称 */
      moduleName?: string | null
      /** 解决方案根命名空间 */
      rootNamespace?: string | null
      /** 生成代码时是否覆盖已有文件 */
      isOverwrite?: boolean
      /** 所属项目名称 */
      projectName?: string | null
      /** 最后同步时间 */
      lastSyncTime?: string | null
      /** 最后代码生成时间 */
      lastBuildTime?: string | null
      /** 一表多字段（导航属性） */
      fields?: FieldDto[] | null
    }

    /** 实体注册表搜索参数 */
    interface TableSearchParams {
      /** 实体名称模糊筛选 */
      Name?: string
      /** 所属模块精确筛选，值来自搜索栏下拉框 */
      ModuleName?: string
      /** 所属项目精确筛选，值来自搜索栏下拉框 */
      ProjectName?: string
      Sorting?: string
      SkipCount?: number
      MaxResultCount?: number
    }

    /** 实体注册表分页列表响应 */
    interface TableList {
      items: TableDto[]
      totalCount: number
    }

    // ==================== Template 模板 ====================

    /**
     * Scriban 模板 DTO
     * 默认种子模板 (7 个)：GetListInput / GetListOutputDto / GetOutputDto / CreateInput / UpdateInput / IServices / Service
     */
    interface TemplateDto {
      id: string
      /** 模板名称 */
      name: string
      /** 模板内容（Scriban 脚本） */
      content: string
      /** 生成路径规则 */
      buildPath: string
      /** 备注 */
      remarks?: string | null
    }

    /** 模板搜索参数 */
    interface TemplateSearchParams {
      /** 模板名称模糊筛选 */
      Name?: string
      Sorting?: string
      SkipCount?: number
      MaxResultCount?: number
    }

    /** 模板分页列表响应 */
    interface TemplateList {
      items: TemplateDto[]
      totalCount: number
    }
  }
}
