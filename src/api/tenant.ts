/* eslint-disable @typescript-eslint/no-namespace */
import request from '@/utils/http'

// Use the namespace from the analysis directly or redefine if needed.
// Ideally we should move the types to src/types/tenant.ts, but for now I will define them here or import if I can.
// Actually, I will define the interfaces here to be self-contained as per common practice in this repo (or use a types file).
// Looking at auth.ts, it imports from '@/types/auth'.
// I will create specific interfaces here to match the swagger analysis.

export namespace TenantDto {
  export interface TenantCreateInput {
    name?: string
    tenantConnectionString?: string
    dbType?: SqlSugar.DbType
  }

  export interface TenantUpdateInput {
    name?: string
    entityVersion?: number
    tenantConnectionString?: string
    dbType?: SqlSugar.DbType
  }

  export interface TenantGetListOutputDto {
    id?: string
    name?: string
    entityVersion?: number
    tenantConnectionString?: string
    dbType?: SqlSugar.DbType
    creationTime?: string
  }

  export interface TenantGetOutputDto {
    id?: string
    name?: string
    entityVersion?: number
    tenantConnectionString?: string
    dbType?: SqlSugar.DbType
    creationTime?: string
  }

  export interface TenantSelectOutputDto {
    id?: string
    name?: string
  }

  export interface TenantGetListInput {
    Name?: string
    StartTime?: string
    EndTime?: string
    OrderByColumn?: string
    IsAsc?: string
    IsAscending?: boolean
    Sorting?: string
    SkipCount?: number
    MaxResultCount?: number
  }
}

export namespace SqlSugar {
  export enum DbType {
    MySql = 'MySql',
    SqlServer = 'SqlServer',
    Sqlite = 'Sqlite',
    Oracle = 'Oracle',
    PostgreSQL = 'PostgreSQL',
    Dm = 'Dm',
    Kdbndp = 'Kdbndp',
    Oscar = 'Oscar',
    MySqlConnector = 'MySqlConnector',
    Access = 'Access',
    OpenGauss = 'OpenGauss',
    QuestDB = 'QuestDB',
    HG = 'HG',
    ClickHouse = 'ClickHouse',
    GBase = 'GBase',
    Odbc = 'Odbc',
    OceanBaseForOracle = 'OceanBaseForOracle',
    TDengine = 'TDengine',
    GaussDB = 'GaussDB',
    OceanBase = 'OceanBase',
    Tidb = 'Tidb',
    Vastbase = 'Vastbase',
    PolarDB = 'PolarDB',
    Doris = 'Doris',
    Xugu = 'Xugu',
    GoldenDB = 'GoldenDB',
    TDSQLForPGODBC = 'TDSQLForPGODBC',
    TDSQL = 'TDSQL',
    HANA = 'HANA',
    DB2 = 'DB2',
    GaussDBNative = 'GaussDBNative',
    DuckDB = 'DuckDB',
    MongoDb = 'MongoDb',
    Custom = 'Custom'
  }
}

export const TenantApi = {
  getList: (params: TenantDto.TenantGetListInput) =>
    request.get<{ items: TenantDto.TenantGetListOutputDto[]; totalCount: number }>({
      url: '/api/app/tenant',
      params
    }),
  get: (id: string | number) =>
    request.get<TenantDto.TenantGetOutputDto>({ url: `/api/app/tenant/${id}` }),
  create: (data: TenantDto.TenantCreateInput) =>
    request.post<TenantDto.TenantGetOutputDto>({ url: '/api/app/tenant', data }),
  update: (id: string | number, data: TenantDto.TenantUpdateInput) =>
    request.put<TenantDto.TenantGetOutputDto>({ url: `/api/app/tenant/${id}`, data }),
  del: (ids: string | number | string[] | number[]) =>
    request.del<void>({ url: '/api/app/tenant', params: { id: ids } }),

  // New endpoints
  select: () => request.get<TenantDto.TenantSelectOutputDto[]>({ url: '/api/app/tenant/select' }),
  init: (id: string | number) => request.put<void>({ url: `/api/app/tenant/init/${id}` }),
  selectDataList: (keywords?: string) =>
    request.get<{ items: TenantDto.TenantGetListOutputDto[]; totalCount: number }>({
      url: '/api/app/tenant/select-data-list',
      params: { keywords }
    }),
  exportExcel: (params: TenantDto.TenantGetListInput) =>
    request.get<Blob>({ url: '/api/app/tenant/export-excel', params, responseType: 'blob' }),
  importExcel: (data: TenantDto.TenantCreateInput[]) =>
    request.post<void>({ url: '/api/app/tenant/import-excel', data })
}
