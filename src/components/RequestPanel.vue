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
        <a-input
          v-model:value="url"
          :placeholder="t('request.url')"
          class="url-input"
          @paste="handleUrlPaste"
        />
      </div>
      <div class="action-buttons">
        <a-dropdown-button type="primary" @click="sendRequest">
          {{ t('request.send') }}
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
            <a-radio-group v-model:value="bodyType" class="body-type-select">
              <a-radio-button value="none">None</a-radio-button>
              <a-radio-button value="json">JSON</a-radio-button>
              <a-radio-button value="form-data">Form Data</a-radio-button>
            </a-radio-group>

            <div v-if="bodyType === 'json'" class="json-editor">
              <a-textarea
                v-model:value="jsonBody"
                :auto-size="{ minRows: 6, maxRows: 12 }"
                :placeholder="'{\n  \n}'"
              />
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

    <div v-if="response" class="response-panel">
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
            <a-textarea
              v-model:value="formattedResponse"
              :auto-size="{ minRows: 10, maxRows: 20 }"
              readonly
            />
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
</template>

<style scoped>
.request-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--color-bg-container);
  border-radius: var(--border-radius);
  padding: 16px;
}

.request-header {
  display: flex;
  gap: 16px;
}

.url-input-group {
  flex: 1;
  display: flex;
  gap: 8px;
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
  height: 40px;
  border-radius: var(--border-radius);
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

.params-list,
.headers-list,
.form-data-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.param-item,
.header-item,
.form-data-item {
  display: flex;
  gap: 8px;
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

.body-type-select {
  margin-bottom: 16px;
}

.json-editor {
  flex: 1;
}

.response-panel {
  margin-top: 16px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
</style>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import axios, { type AxiosResponseHeaders, type RawAxiosResponseHeaders } from 'axios'
import { DeleteOutlined, CopyOutlined, CodeOutlined } from '@ant-design/icons-vue'
import { downloadData } from '../utils/download'
import { parseCurl } from '../utils/curlParser'
import type { RequestMethod, RequestBodyType, RawFormat, ResponseData } from '../types/request'

const { t } = useI18n()

// 响应式数据
const method = ref<RequestMethod>('GET')
const url = ref('')
const activeTab = ref('params')
const responseTab = ref('body')
const response = ref<ResponseData | null>(null)
const bodyType = ref<'none' | 'json' | 'form-data'>('none')
const rawFormat = ref<RawFormat>('json')
const params = ref<{ key: string; value: string }[]>([])
const headers = ref<{ key: string; value: string }[]>([])
const formData = ref<{ key: string; value: string }[]>([])
const jsonBody = ref('')

// 计算属性
const formattedResponse = computed(() => {
  if (!response.value?.data) return ''
  try {
    return JSON.stringify(response.value.data, null, 2)
  } catch {
    return String(response.value.data)
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

// 发送请求
const sendRequest = async () => {
  try {
    // 构建请求配置
    const config = {
      method: method.value,
      url: url.value,
      headers: headers.value.reduce((acc, { key, value }) => {
        if (key) acc[key] = value
        return acc
      }, {} as Record<string, string>),
      params: params.value.reduce((acc, { key, value }) => {
        if (key) acc[key] = value
        return acc
      }, {} as Record<string, string>)
    }

    const startTime = Date.now()
    const res = await axios(config)
    const endTime = Date.now()

    response.value = {
      status: res.status,
      data: res.data,
      time: endTime - startTime,
      headers: Object.fromEntries(
        Object.entries(res.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : String(value)
        ])
      )
    }
  } catch (error: any) {
    message.error(error.message || t('request.error'))
  }
}

// 发送并下载
const sendAndDownload = async () => {
  try {
    await sendRequest()
    if (response.value) {
      const fileName = `response_${new Date().getTime()}`
      downloadData(response.value.data, fileName, 'json')
    }
  } catch (error: any) {
    message.error(error.message || t('request.error'))
  }
}

// URL 粘贴处理
const handleUrlPaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')
  if (!text?.trim().startsWith('curl ')) return
  
  e.preventDefault()
  try {
    const parsed = parseCurl(text)
    method.value = parsed.method as RequestMethod
    url.value = parsed.url
    headers.value = parsed.headers
    params.value = parsed.params
    if (parsed.data) {
      try {
        const jsonData = JSON.parse(parsed.data)
        bodyType.value = 'json'
        rawFormat.value = 'json'
        // 处理 JSON 数据
      } catch {
        // 如果不是 JSON，则作为普通文本处理
        bodyType.value = 'form-data'
      }
    }
    message.success(t('request.parseSuccess'))
  } catch (error) {
    message.error(t('request.parseError'))
  }
}
</script> 