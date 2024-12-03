<template>
  <div class="request-panel">
    <div class="request-header">
      <div class="url-input-group">
        <a-select
          v-model:value="method"
          class="method-select"
          :class="getMethodClass(method)"
          :options="httpMethods.map(m => ({ value: m, label: m }))"
          :dropdown-class-name="'method-dropdown'"
        />
        <a-spin :spinning="isParsingCurl" :indicator="loadingIcon">
          <a-input
            v-model:value="url"
            :placeholder="t('request.url')"
            class="url-input"
            @paste="handleUrlPaste"
          />
        </a-spin>
      </div>
      <div class="action-buttons">
        <a-dropdown-button 
          type="primary" 
          :loading="isLoading"
          @click="isLoading ? cancelRequest() : sendRequest()"
        >
          {{ isLoading ? t('request.cancel') : t('request.send') }}
          <template #overlay>
            <a-menu>
              <a-menu-item @click="sendAndDownload">
                {{ t('request.sendAndDownload') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
      </div>
    </div>

    <div class="main-content">
      <div class="request-content">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="params" :tab="t('request.params')">
            <div class="params-list">
              <div v-for="(param, index) in params" :key="index" class="param-item">
                <a-input v-model:value="param.key" :placeholder="t('request.key')" />
                <a-input v-model:value="param.value" :placeholder="t('request.value')" />
                <a-button type="text" danger @click="() => params.splice(index, 1)">
                  <template #icon><delete-outlined /></template>
                </a-button>
              </div>
              <a-button type="dashed" block @click="params.push({ key: '', value: '' })">
                {{ t('request.addParam') }}
              </a-button>
            </div>
          </a-tab-pane>

          <a-tab-pane key="headers" :tab="t('request.headers')">
            <div class="headers-list">
              <div v-for="(header, index) in headers" :key="index" class="header-item">
                <a-input v-model:value="header.key" :placeholder="t('request.key')" />
                <a-input v-model:value="header.value" :placeholder="t('request.value')" />
                <a-button type="text" danger @click="() => headers.splice(index, 1)">
                  <template #icon><delete-outlined /></template>
                </a-button>
              </div>
              <a-button type="dashed" block @click="headers.push({ key: '', value: '' })">
                {{ t('request.addHeader') }}
              </a-button>
            </div>
          </a-tab-pane>

          <a-tab-pane key="body" :tab="t('request.body')">
            <div class="body-content">
              <div class="body-type-row">
                <a-radio-group v-model:value="bodyType" class="body-type-select">
                  <a-radio-button value="none">None</a-radio-button>
                  <a-radio-button value="json">JSON</a-radio-button>
                  <a-radio-button value="form-data">Form Data</a-radio-button>
                </a-radio-group>

                <a-select
                  v-if="bodyType === 'json'"
                  v-model:value="rawFormat"
                  class="format-select"
                  :options="[
                    { label: 'Text', value: 'text' },
                    { label: 'JavaScript', value: 'javascript' },
                    { label: 'JSON', value: 'json' },
                    { label: 'HTML', value: 'html' },
                    { label: 'XML', value: 'xml' }
                  ]"
                />
              </div>

              <div v-if="bodyType === 'json'" class="json-editor">
                <div class="editor-wrapper">
                  <a-textarea
                    v-model:value="jsonBody"
                    :auto-size="{ minRows: 10, maxRows: 20 }"
                    :placeholder="getFormatPlaceholder(rawFormat)"
                    class="json-input"
                    @input="handleJsonInput"
                  />
                  <pre v-if="jsonBody" class="json-preview" v-html="highlightedBody"></pre>
                </div>
              </div>

              <div v-if="bodyType === 'form-data'" class="form-data-list">
                <div v-for="(item, index) in formData" :key="index" class="form-data-item">
                  <a-input v-model:value="item.key" :placeholder="t('request.key')" />
                  <a-input v-model:value="item.value" :placeholder="t('request.value')" />
                  <a-button type="text" danger @click="() => formData.splice(index, 1)">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                </div>
                <a-button type="dashed" block @click="formData.push({ key: '', value: '' })">
                  {{ t('request.addFormData') }}
                </a-button>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <div class="response-content">
        <a-spin :spinning="isLoading" tip="Loading...">
          <div v-if="response" class="response-info">
            <div class="response-header">
              <div class="response-status">
                <span class="label">{{ t('request.status') }}:</span>
                <a-tag :color="getStatusColor(response.status)">{{ response.status }}</a-tag>
              </div>
              <div class="response-time">
                <span class="label">{{ t('request.time') }}:</span>
                <span>{{ response.time }}ms</span>
              </div>
            </div>

            <div class="response-tabs">
              <a-tabs v-model:activeKey="responseTab">
                <a-tab-pane key="body" :tab="t('request.response')">
                  <div class="response-body">
                    <div class="response-actions">
                      <a-button type="text" @click="copyResponse">
                        <template #icon><copy-outlined /></template>
                        {{ t('request.copy') }}
                      </a-button>
                      <a-button type="text" @click="prettifyResponse">
                        <template #icon><code-outlined /></template>
                        {{ t('request.prettify') }}
                      </a-button>
                    </div>
                    <div class="response-content">
                      <pre v-html="formattedResponse"></pre>
                    </div>
                  </div>
                </a-tab-pane>

                <a-tab-pane key="headers" :tab="t('request.headers')">
                  <div class="response-headers">
                    <div v-for="(value, key) in response.headers" :key="key" class="header-item">
                      <span class="header-key">{{ key }}:</span>
                      <span class="header-value">{{ value }}</span>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </div>
          <div v-else class="empty-response">
            <div class="empty-text">{{ t('response.empty') }}</div>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-panel {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-container);
  border-radius: var(--border-radius);
  padding: 16px;
}

.request-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.request-content {
  height: 45%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.request-content :deep(.ant-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.request-content :deep(.ant-tabs-nav) {
  margin: 0;
  flex-shrink: 0;
}

.request-content :deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow: hidden;
}

.request-content :deep(.ant-tabs-content) {
  height: 100%;
}

.request-content :deep(.ant-tabs-tabpane) {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.params-list,
.headers-list,
.form-data-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100%;
  padding-bottom: 16px;
}

.param-item,
.header-item,
.form-data-item {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.param-item :deep(.ant-input),
.header-item :deep(.ant-input),
.form-data-item :deep(.ant-input) {
  flex: 1;
}

.body-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.body-type-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.format-select {
  width: 120px;
}

.editor-wrapper {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-container);
}

.json-input {
  font-family: monospace;
  resize: none;
  background: transparent !important;
  position: relative;
  z-index: 1;
  color: transparent;
  caret-color: var(--color-text);
}

.json-input::selection {
  background: var(--color-primary-bg);
  color: var(--color-text);
}

.json-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  pointer-events: none;
  padding: 4px 11px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--color-text);
}

:deep(.hljs) {
  background: transparent;
  padding: 0;
}

:deep(.hljs-attr) {
  color: #e06c75;
}

:deep(.hljs-string) {
  color: #98c379;
}

:deep(.hljs-number) {
  color: #d19a66;
}

:deep(.hljs-literal) {
  color: #56b6c2;
}

:deep(.hljs-punctuation) {
  color: #abb2bf;
}

.response-section {
  height: 55%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  min-height: 0;
}

.response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.response-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.response-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.response-actions {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.response-content {
  flex: 1;
  overflow: auto;
  position: relative;
  padding: 0;
  margin: 0;
}

.response-content pre {
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.response-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.response-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.response-content::-webkit-scrollbar-track {
  background-color: transparent;
}

.response-content::-webkit-scrollbar-corner {
  background-color: transparent;
}

.request-header {
  display: flex;
  gap: 16px;
}

.url-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.method-select {
  width: 110px;
}

.method-select.get :deep(.ant-select-selector) {
  color: #61affe !important;
  background: rgba(97, 175, 254, 0.1) !important;
  border-color: #61affe !important;
}

.method-select.post :deep(.ant-select-selector) {
  color: #49cc90 !important;
  background: rgba(73, 204, 144, 0.1) !important;
  border-color: #49cc90 !important;
}

.method-select.put :deep(.ant-select-selector) {
  color: #fca130 !important;
  background: rgba(252, 161, 48, 0.1) !important;
  border-color: #fca130 !important;
}

.method-select.delete :deep(.ant-select-selector) {
  color: #f93e3e !important;
  background: rgba(249, 62, 62, 0.1) !important;
  border-color: #f93e3e !important;
}

.method-select.patch :deep(.ant-select-selector) {
  color: #50e3c2 !important;
  background: rgba(80, 227, 194, 0.1) !important;
  border-color: #50e3c2 !important;
}

.method-select :deep(.ant-select-selector) {
  height: 40px !important;
  padding: 4px 12px !important;
  border-radius: var(--border-radius) !important;
}

.method-select :deep(.ant-select-selection-item) {
  line-height: 30px !important;
  font-weight: 600;
}

:deep(.method-dropdown .ant-select-item-option-selected) {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1) !important;
  font-weight: 600;
}

.url-input {
  flex: 1;
}

.url-input :deep(.ant-input) {
  height: 32px;
  line-height: 32px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons :deep(.ant-btn) {
  height: 40px;
  padding: 4px 16px;
  display: flex;
  align-items: center;
}

.action-buttons :deep(.ant-dropdown-trigger) {
  padding: 4px 8px;
  height: 40px;
  display: flex;
  align-items: center;
}

.json-preview,
.response-content {
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius);
  padding: 16px;
  overflow: auto;
}

.json-preview pre,
.response-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}

.response-status,
.response-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: var(--color-text-secondary);
}

.response-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.response-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.response-headers {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-item {
  display: flex;
  gap: 8px;
}

.header-key {
  color: var(--color-text-secondary);
  min-width: 120px;
}

.header-value {
  color: var(--color-text);
  word-break: break-all;
}

.url-input-group :deep(.ant-spin) {
  flex: 1;
  display: flex;
}

.url-input-group :deep(.ant-spin-container) {
  flex: 1;
  width: 1200px;
  height: 42px;
  display: flex;
}

.url-input {
  flex: 1;
}
</style>

<script lang="ts" setup>
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import axios, { CancelTokenSource } from 'axios'
import { DeleteOutlined, CopyOutlined, CodeOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { downloadData } from '../utils/download'
import { parseCurl } from '../utils/curlParser'
import { HistoryManager } from '../utils/historyManager'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/atom-one-dark.css'
import type { RequestMethod, RequestBodyType, RawFormat, ResponseData } from '../types/request'

const { t } = useI18n()

// 初始化
hljs.registerLanguage('json', json)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
const historyManager = new HistoryManager()

// 响应式数据
const method = ref<RequestMethod>('GET')
const url = ref('')
const activeTab = ref('params')
const responseTab = ref('body')
const response = ref<ResponseData | null>(null)
const bodyType = ref<'none' | 'json' | 'form-data'>('none')
const rawFormat = ref<'text' | 'javascript' | 'json' | 'html' | 'xml'>('json')
const params = ref<{ key: string; value: string }[]>([])
const headers = ref<{ key: string; value: string }[]>([])
const formData = ref<{ key: string; value: string }[]>([])
const jsonBody = ref('')
const isParsingCurl = ref(false)
const isLoading = ref(false)
let currentRequest: CancelTokenSource | null = null

// 格式化并高亮 JSON
const formatAndHighlight = (data: any) => {
  try {
    const formatted = JSON.stringify(data, null, 2)
    return hljs.highlight(formatted, { language: 'json' }).value
  } catch {
    return String(data)
  }
}

// 计算属性 - 格式化的响应内容
const formattedResponse = computed(() => {
  if (!response.value?.data) return ''
  return formatAndHighlight(response.value.data)
})

// 计算属性 - 格式化的请求体
const formattedJsonBody = computed(() => {
  if (!jsonBody.value) return ''
  try {
    const parsed = JSON.parse(jsonBody.value)
    return formatAndHighlight(parsed)
  } catch {
    return jsonBody.value
  }
})

// 获取状态颜色
const getStatusColor = (status: number) => {
  if (status < 300) return 'success'
  if (status < 400) return 'warning'
  return 'error'
}

// 复制响应内容
const copyResponse = async () => {
  try {
    await navigator.clipboard.writeText(formattedResponse.value)
    message.success(t('request.copySuccess'))
  } catch {
    message.error(t('request.copyError'))
  }
}

// 格式化响应内容
const prettifyResponse = () => {
  try {
    if (response.value?.data) {
      response.value.data = JSON.parse(JSON.stringify(response.value.data))
      message.success(t('request.prettifySuccess'))
    }
  } catch {
    message.error(t('request.prettifyError'))
  }
}

// HTTP 方法列表
const httpMethods: RequestMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

// 获取方法类名
const getMethodClass = (methodName: RequestMethod) => {
  return methodName.toLowerCase()
}

// 获取方法颜色
const getMethodColor = (methodName: RequestMethod) => {
  const colors: Record<RequestMethod, string> = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#50e3c2',
    HEAD: '#9012fe',
    OPTIONS: '#0d5aa7'
  }
  return colors[methodName] || '#666'
}

// 修改发送请求的类型定义
interface RequestConfig {
  method: RequestMethod
  url: string
  headers: Record<string, string>
  params: Record<string, string>
  data?: any
}

// 构建请求 URL
const buildUrl = () => {
  try {
    const urlObj = new URL(url.value.startsWith('http') ? url.value : `http://${url.value}`)
    
    // 添加查询参数
    params.value.forEach(({ key, value }) => {
      if (key) {
        urlObj.searchParams.append(key, value)
      }
    })
    
    return urlObj.toString()
  } catch (error) {
    // 如果 URL 解析失败，返回原始 URL
    return url.value
  }
}

// 构建请求头
const buildHeaders = () => {
  const result: Record<string, string> = {}
  headers.value.forEach(({ key, value }) => {
    if (key) {
      result[key] = value
    }
  })
  return result
}

// 构建请求数据
const buildRequestData = () => {
  if (bodyType.value === 'none') {
    return undefined
  }
  
  if (bodyType.value === 'json') {
    try {
      return jsonBody.value ? JSON.parse(jsonBody.value) : undefined
    } catch (error) {
      message.error(t('request.invalidJson'))
      throw new Error('Invalid JSON')
    }
  }
  
  if (bodyType.value === 'form-data') {
    const formDataObj = new FormData()
    formData.value.forEach(({ key, value }) => {
      if (key) {
        formDataObj.append(key, value)
      }
    })
    return formDataObj
  }
}

// 发送请求
const sendRequest = async () => {
  if (!url.value) {
    message.error(t('request.urlRequired'))
    return
  }

  // 如果有正在进行的请求，先取消
  if (currentRequest) {
    currentRequest.cancel('New request started')
  }

  isLoading.value = true
  currentRequest = axios.CancelToken.source()

  try {
    const requestUrl = buildUrl()
    const requestHeaders = buildHeaders()
    const requestData = buildRequestData()

    const startTime = Date.now()
    const res = await axios({
      method: method.value.toLowerCase(),
      url: requestUrl,
      headers: requestHeaders,
      data: requestData,
      cancelToken: currentRequest.token
    })

    const endTime = Date.now()
    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      data: res.data,
      time: endTime - startTime
    }

    // 保存到历史记录
    historyManager.add({
      method: method.value,
      url: url.value,
      headers: headers.value,
      params: params.value,
      bodyType: bodyType.value,
      ...(bodyType.value === 'json' ? { jsonBody: jsonBody.value } : {}),
      ...(bodyType.value === 'form-data' ? { formData: formData.value } : {}),
      response: response.value,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    if (axios.isCancel(error)) {
      message.info(t('request.cancelled'))
    } else {
      message.error(error.message || t('request.failed'))
      if (error.response) {
        response.value = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          time: 0
        }
      }
    }
  } finally {
    isLoading.value = false
    currentRequest = null
  }
}

// 发送并下载
const sendAndDownload = async () => {
  if (!url.value) {
    message.error(t('request.urlRequired'))
    return
  }

  isLoading.value = true
  const source = axios.CancelToken.source()
  currentRequest = source

  try {
    const requestUrl = buildUrl()
    const requestHeaders = buildHeaders()
    const requestData = buildRequestData()

    const res = await axios({
      method: method.value.toLowerCase(),
      url: requestUrl,
      headers: requestHeaders,
      data: requestData,
      responseType: 'blob',
      cancelToken: source.token
    })

    // 从响应头或 URL 中获取文件名
    let filename = ''
    const contentDisposition = res.headers['content-disposition']
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }
    if (!filename) {
      filename = url.value.split('/').pop() || 'download'
    }

    downloadData(res.data, filename, res.headers['content-type'])
    message.success(t('request.downloadSuccess'))
  } catch (error: any) {
    if (axios.isCancel(error)) {
      message.info(t('request.cancelled'))
    } else {
      message.error(error.message || t('request.downloadFailed'))
    }
  } finally {
    isLoading.value = false
    currentRequest = null
  }
}

// URL 粘贴处理
const handleUrlPaste = async (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')
  if (!text) return

  if (text.trim().toLowerCase().startsWith('curl ')) {
    e.preventDefault()
    isParsingCurl.value = true
    try {
      const parsed = parseCurl(text)
      method.value = parsed.method as RequestMethod
      url.value = parsed.url
      headers.value = parsed.headers
      params.value = parsed.params

      if (parsed.data) {
        activeTab.value = 'body'
        try {
          // 尝试解析为 JSON
          JSON.parse(parsed.data)
          bodyType.value = 'json'
          jsonBody.value = parsed.data
        } catch {
          // 如果不是 JSON，则作为 form-data 处理
          bodyType.value = 'form-data'
          // TODO: 解析 form-data
        }
      }
    } catch (error) {
      message.error(t('request.invalidCurl'))
    } finally {
      isParsingCurl.value = false
    }
  }
}

// 定义 loading 图标
const loadingIcon = h(LoadingOutlined, {
  style: {
    fontSize: '16px',
  },
})

const getFormatPlaceholder = (format: string) => {
  switch (format) {
    case 'json':
      return '{\n  "key": "value"\n}'
    case 'javascript':
      return '// JavaScript code here'
    case 'html':
      return '<div>\n  <!-- HTML code here -->\n</div>'
    case 'xml':
      return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <!-- XML code here -->\n</root>'
    default:
      return 'Enter your text here'
  }
}

const highlightedBody = computed(() => {
  if (!jsonBody.value) return ''
  try {
    if (rawFormat.value === 'json') {
      const parsed = JSON.parse(jsonBody.value)
      return hljs.highlight(JSON.stringify(parsed, null, 2), { language: 'json' }).value
    } else {
      return hljs.highlight(jsonBody.value, { language: rawFormat.value }).value
    }
  } catch {
    return hljs.highlight(jsonBody.value, { language: rawFormat.value }).value
  }
})

const handleJsonInput = () => {
  if (rawFormat.value === 'json') {
    try {
      JSON.parse(jsonBody.value)
    } catch {
      // JSON 解析错误，不做处理
    }
  }
}

const cancelRequest = () => {
  if (currentRequest) {
    currentRequest.cancel('Request cancelled by user')
    currentRequest = null
    isLoading.value = false
  }
}
</script> 