export interface FileItem {
  id: string
  fileName?: string
  fileType?: string // e.g., 'image/png', 'application/pdf'
  size?: number // in bytes
  creationTime?: string
  creatorId?: string
  remark?: string
  // If the API returns 'url' or similar
  url?: string
}
