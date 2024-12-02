import type { TreeDataItem } from 'ant-design-vue/es/tree/Tree'

export interface CollectionItem extends TreeDataItem {
  key: string
  title: string
  type: 'collection' | 'folder' | 'request'
  method?: string
  url?: string
  children?: CollectionItem[]
  description?: string
  headers?: Record<string, string>
  params?: Record<string, string>
  body?: string
  bodyType?: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded'
  createdAt?: number
  updatedAt?: number
} 