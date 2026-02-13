import request from '@/utils/http'

export interface PagedResultDto<T> {
  items: T[]
  totalCount: number
}

export interface RemoteServiceErrorInfo {
  code?: string
  message?: string
  details?: string
  data?: any
  validationErrors?: RemoteServiceValidationErrorInfo[]
}

export interface RemoteServiceErrorResponse {
  error?: RemoteServiceErrorInfo
}

export interface RemoteServiceValidationErrorInfo {
  message?: string
  members?: string[]
}

export interface DirectoryDescriptorCreateInput {
  name?: string
  parentId?: string
}

export interface DirectoryDescriptorGetOutputDto {
  id?: string
  name?: string
  parentId?: string
  creationTime?: string
  creatorId?: string
}

export interface DirectoryDescriptorUpdateInput {
  name?: string
}

export interface FileDescriptorGetListOutputDto {
  id?: string
  directoryId?: string
  name?: string
  mimeType?: string
  size?: number
  fileType?: FileType
  providerName?: string
  url?: string
  thumbnailUrl?: string
  isPublic?: boolean
  sizeInfo?: string
  creationTime?: string
  creatorId?: string
}

export interface FileDescriptorGetOutputDto {
  id?: string
  directoryId?: string
  name?: string
  blobName?: string
  mimeType?: string
  size?: number
  hash?: string
  fileType?: FileType
  providerName?: string
  url?: string
  thumbnailUrl?: string
  isPublic?: boolean
  sizeInfo?: string
  creationTime?: string
  creatorId?: string
}

export interface FileStorageProviderCreateInput {
  name?: string
  providerType?: StorageProviderType
  bucketName?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  region?: string
  customDomain?: string
  isEnableHttps?: boolean
  remark?: string
}

export interface FileStorageProviderGetListOutputDto {
  id?: string
  name?: string
  providerType?: StorageProviderType
  bucketName?: string
  endpoint?: string
  isEnabled?: boolean
  isDefault?: boolean
  orderNum?: number
  remark?: string
  creationTime?: string
}

export interface FileStorageProviderGetOutputDto {
  id?: string
  name?: string
  providerType?: StorageProviderType
  bucketName?: string
  accessKey?: string
  endpoint?: string
  region?: string
  customDomain?: string
  isEnableHttps?: boolean
  isEnabled?: boolean
  isDefault?: boolean
  orderNum?: number
  remark?: string
  creationTime?: string
}

export interface FileStorageProviderUpdateInput {
  name?: string
  bucketName?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  region?: string
  customDomain?: string
  isEnableHttps?: boolean
  remark?: string
}

export type FileType = 'File' | 'Image' | 'Video' | 'Audio' | 'Document' | 'Archive'

export type StorageProviderType = 'Local' | 'S3Compatible' | 'Aliyun' | 'TencentCloud'

export const FileApi = {
  directory: {
    create: (data: DirectoryDescriptorCreateInput) =>
      request.post<DirectoryDescriptorGetOutputDto>({ url: `/api/app/directory-descriptor`, data }),
    getList: (params?: any) =>
      request.get<DirectoryDescriptorGetOutputDto[]>({
        url: `/api/app/directory-descriptor`,
        params
      }),
    get: (id: string) =>
      request.get<DirectoryDescriptorGetOutputDto>({ url: `/api/app/directory-descriptor/${id}` }),
    update: (id: string, data: DirectoryDescriptorUpdateInput) =>
      request.put<DirectoryDescriptorGetOutputDto>({
        url: `/api/app/directory-descriptor/${id}`,
        data
      }),
    del: (id: string) => request.delete<any>({ url: `/api/app/directory-descriptor/${id}` }),
    move: (id: string, newParentId: string) =>
      request.post<any>({ url: `/api/app/directory-descriptor/${id}/move/${newParentId}` })
  },
  file: {
    upload: (directoryId: string, data: FormData) =>
      request.post<FileDescriptorGetOutputDto[]>({
        url: `/api/app/file-descriptor/upload/${directoryId}`,
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    download: (id: string) =>
      request.post<Blob>({ url: `/api/app/file-descriptor/${id}/download`, responseType: 'blob' }),
    get: (id: string) =>
      request.get<FileDescriptorGetOutputDto>({ url: `/api/app/file-descriptor/${id}` }),
    del: (id: string) => request.delete<any>({ url: `/api/app/file-descriptor/${id}` }),
    getList: (params?: any) =>
      request.get<PagedResultDto<FileDescriptorGetListOutputDto>>({
        url: `/api/app/file-descriptor`,
        params
      }),
    deleteMany: (ids?: string[]) =>
      request.delete<any>({ url: `/api/app/file-descriptor/many`, params: { ids } }),
    move: (id: string, directoryId: string) =>
      request.post<any>({ url: `/api/app/file-descriptor/${id}/move/${directoryId}` }),
    rename: (id: string, newName?: string) =>
      request.post<any>({ url: `/api/app/file-descriptor/${id}/rename`, params: { newName } })
  },
  storageProvider: {
    getList: (params?: any) =>
      request.get<PagedResultDto<FileStorageProviderGetListOutputDto>>({
        url: `/api/app/file-storage-provider`,
        params
      }),
    create: (data: FileStorageProviderCreateInput) =>
      request.post<FileStorageProviderGetOutputDto>({
        url: `/api/app/file-storage-provider`,
        data
      }),
    del: (ids?: string[]) =>
      request.delete<any>({ url: `/api/app/file-storage-provider`, params: { ids } }),
    setDefault: (id: string) =>
      request.post<any>({ url: `/api/app/file-storage-provider/${id}/set-default` }),
    update: (id: string, data: FileStorageProviderUpdateInput) =>
      request.put<FileStorageProviderGetOutputDto>({
        url: `/api/app/file-storage-provider/${id}`,
        data
      }),
    get: (id: string) =>
      request.get<FileStorageProviderGetOutputDto>({ url: `/api/app/file-storage-provider/${id}` }),
    getSelectDataList: (params?: any) =>
      request.get<PagedResultDto<FileStorageProviderGetListOutputDto>>({
        url: `/api/app/file-storage-provider/select-data-list`,
        params
      }),
    exportExcel: (params?: any) =>
      request.get<any>({ url: `/api/app/file-storage-provider/export-excel`, params }),
    importExcel: (data: FileStorageProviderCreateInput[]) =>
      request.post<any>({ url: `/api/app/file-storage-provider/import-excel`, data })
  }
}
