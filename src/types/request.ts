export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export type RequestBodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary' | 'graphql'

export type RawFormat = 'text' | 'javascript' | 'json' | 'html' | 'xml'

export interface RequestBody {
  type: RequestBodyType
  format?: RawFormat
  content?: string | FormData | File | null
}

export interface RequestData {
  method: RequestMethod
  url: string
  headers: { key: string; value: string }[]
  params: { key: string; value: string }[]
  body: RequestBody
}

export interface ResponseData {
  status: number
  data: any
  time: number
  headers?: Record<string, string>
} 