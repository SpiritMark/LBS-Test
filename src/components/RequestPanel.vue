<template>
  <div id="request-panel" class="request-panel">
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

        <a-dropdown>
          <a-button>
            {{ t('request.examples') }}
            <DownOutlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="loadExample('GET')">
                {{ t('request.getExample') }}
              </a-menu-item>
              <a-menu-item @click="loadExample('POST')">
                {{ t('request.postExample') }}
              </a-menu-item>
              <a-menu-item @click="loadExample('PUT')">
                {{ t('request.putExample') }}
              </a-menu-item>
              <a-menu-item @click="loadExample('DELETE')">
                {{ t('request.deleteExample') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
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
                <JsonEditor
                  v-model="jsonBody"
                  @update:content="handleBodyInput"
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

      <div class="response-section">
        <a-spin :spinning="isLoading" tip="Loading...">
          <ResponsePanel
            v-if="response"
            :content="formattedResponse"
            :status="response.status"
            :responseSize="getResponseSize"
            :responseTime="response.time"
          />
          <div v-else class="empty-response">
            <div class="empty-message">{{ t('request.noResponse') }}</div>
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
  height: calc(100vh - 80px);
}

.request-content {
  height: 45%;
  min-height: 400px;
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.request-content :deep(.ant-tabs-tabpane) {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
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
  flex: 1;
  min-height: 400px;
  position: relative;
  border-radius: 16px;
  background: var(--color-bg-container);
  overflow: hidden;
  
  box-shadow: 
    8px 8px 16px rgba(0, 0, 0, 0.1),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
  border: none;
  padding: 2px;
}

.json-input {
  position: relative;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px;
  z-index: 1;
  background: transparent !important;
}

.json-input:deep(.ant-input) {
  font-family: monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  background: transparent !important;
  color: transparent !important;
  caret-color: var(--color-text) !important;
}

.json-input:deep(.ant-input)::selection {
  background: var(--color-primary-bg) !important;
  color: var(--color-text) !important;
}

.json-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 8px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  pointer-events: none;
  color: var(--color-text);
  background: transparent;
  z-index: 0;
}

.editor-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

:deep(.hljs) {
  background: transparent;
  padding: 0;
}

:deep(.hljs-attr) {
  color: #79b8ff;
}

:deep(.hljs-string) {
  color: #9ecbff;
}

:deep(.hljs-number) {
  color: #f8c555;
}

:deep(.hljs-boolean) {
  color: #85e89d;
}

:deep(.hljs-null) {
  color: #f97583;
}

:deep(.hljs-punctuation) {
  color: #9da5b4;
}

.response-section {
  height: 55%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  overflow: auto;
}

.response-section :deep(.ant-spin-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-container);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
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
  align-items: center;
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
  gap: 4px;
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

.json-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100% - 48px);
  padding: 16px;
}

.editor-container {
  height: 100%;
  min-height: 400px;
  background: var(--color-bg-container);
  border-radius: 14px;
  box-shadow: 
    inset 2px 2px 5px rgba(0, 0, 0, 0.05),
    inset -2px -2px 5px rgba(255, 255, 255, 0.5);
}

.line-numbers {
  padding: 8px 8px 8px 0;
  background: var(--color-bg-elevated);
  border-right: 1px solid var(--color-border);
  user-select: none;
  text-align: right;
  color: var(--color-text-quaternary);
}

.line-number {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: v-bind(fontSize + 'px');
  line-height: v-bind(lineHeight + 'px');
  padding: 0 8px;
  min-width: 40px;
}

.code-editor {
  width: 100%;
  height: 100%;
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
  background: transparent;
  border: none;
  resize: none;
}

.code-editor:focus {
  outline: none;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 8px;
}

.editor-actions :deep(.ant-btn) {
  border-radius: 12px;
  border: none;
  padding: 8px 16px;
  background: var(--color-bg-container);
  color: var(--color-text);
  
  box-shadow: 
    5px 5px 10px rgba(0, 0, 0, 0.1),
    -5px -5px 10px rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.editor-actions :deep(.ant-btn:hover) {
  box-shadow: 
    3px 3px 6px rgba(0, 0, 0, 0.1),
    -3px -3px 6px rgba(255, 255, 255, 0.7);
}

.editor-actions :deep(.ant-btn:active) {
  box-shadow: 
    inset 2px 2px 5px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.5);
}

.editor-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--color-text);
}

.editor-content ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-content ::-webkit-scrollbar-track {
  background: transparent;
}

.editor-content ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.editor-content ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.hljs) {
  background: transparent;
  color: var(--color-text);
}

:deep(.hljs-attr) {
  color: #7c4dff;
}

:deep(.hljs-string) {
  color: #00b8d4;
}

:deep(.hljs-number) {
  color: #00bfa5;
}

:deep(.hljs-boolean) {
  color: #7c4dff;
}

:deep(.hljs-null) {
  color: #ff5252;
}

:deep(.hljs-punctuation) {
  color: #78909c;
}

.response-highlight {
  background: transparent;
}

.response-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.response-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.response-status,
.response-time,
.response-size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: var(--color-text-secondary);
}

:deep(.hljs-attr) {
  color: #79b8ff;
}

:deep(.hljs-string) {
  color: #9ecbff;
}

:deep(.hljs-number) {
  color: #f8c555;
}

:deep(.hljs-boolean) {
  color: #85e89d;
}

:deep(.hljs-null) {
  color: #f97583;
}

:deep(.hljs-punctuation) {
  color: #9da5b4;
}

.editor-content {
  position: relative;
  width: 100%;
  height: 300px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.code-editor {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 12px;
  color: transparent;
  caret-color: var(--color-text);
  background: transparent;
  resize: none;
  z-index: 2;
}

.code-editor:focus {
  outline: none;
  border-color: var(--color-primary);
}

.editor-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: var(--color-bg-container);
  z-index: 1;
}

:deep(.hljs) {
  background: transparent;
  padding: 0;
}

:deep(.ant-tabs-content) {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.ant-tabs-tabpane) {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

:deep(.ant-input) {
  font-family: 'Fira Code', monospace;
}

:deep(.ant-input-textarea-show-count::after) {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: var(--color-text-secondary);
  background: var(--color-bg-container);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* 添加滚动条样式 */
.editor-content ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-content ::-webkit-scrollbar-track {
  background: transparent;
}

.editor-content ::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.editor-content ::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* 确保文本区域和高亮层的滚动同步 */
.code-editor, .editor-highlight {
  overflow: auto;
  white-space: pre;
  tab-size: 2;
  -moz-tab-size: 2;
}

.empty-response {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-container);
  border-radius: 8px;
}

.empty-message {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>

<script lang="ts" setup>
import { ref, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import axios, { CancelTokenSource } from 'axios'
import { DeleteOutlined, CopyOutlined, CodeOutlined, LoadingOutlined, PlusOutlined, MinusOutlined, DownloadOutlined, DownOutlined } from '@ant-design/icons-vue'
import { downloadData } from '../utils/download'
import { parseCurl } from '../utils/curlParser'
import { HistoryManager } from '../utils/historyManager'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/atom-one-dark.css'
import type { RequestMethod, ResponseData } from '../types/request'
import ResponsePanel from './ResponsePanel.vue'
import JsonEditor from './JsonEditor/index.vue'

// 初始化代码高亮
hljs.registerLanguage('json', json)

const { t } = useI18n()

// 初始化
const historyManager = new HistoryManager()

// 响应式数据
const method = ref<RequestMethod>('GET')
const url = ref('')
const activeTab = ref('params')
const responseTab = ref('body')
const response = ref<ResponseData | null>(null)
const bodyType = ref<'none' | 'json' | 'form-data'>('none')
const rawFormat = ref<'json'>('json')
const params = ref<{ key: string; value: string }[]>([])
const headers = ref<{ key: string; value: string }[]>([])
const formData = ref<{ key: string; value: string }[]>([])
const jsonBody = ref('')
const isParsingCurl = ref(false)
const isLoading = ref(false)
let currentRequest: CancelTokenSource | null = null

// 定义 loading 图标
const loadingIcon = h(LoadingOutlined, {
  style: {
    fontSize: '16px',
  },
})

// 计算属性 - JSON 数据
const jsonData = computed({
  get: () => {
    try {
      return jsonBody.value ? JSON.parse(jsonBody.value) : {}
    } catch {
      return {}
    }
  },
  set: (value) => {
    try {
      jsonBody.value = JSON.stringify(value, null, 2)
    } catch {
      console.warn('Invalid JSON data')
    }
  }
})

// 处理 JSON 变化
const handleJsonChange = (value: any) => {
  try {
    jsonBody.value = JSON.stringify(value, null, 2)
  } catch (error) {
    console.warn('Invalid JSON format')
  }
}

// 格式化 JSON
const formatJson = () => {
  try {
    const parsed = jsonBody.value ? JSON.parse(jsonBody.value) : {}
    jsonBody.value = JSON.stringify(parsed, null, 2)
    message.success(t('request.prettifySuccess'))
  } catch {
    message.error(t('request.prettifyError'))
  }
}

// 格式化 JSON 字符串
const formatJsonString = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

// 计算属性 - 格式化的响应内容
const formattedResponse = computed(() => {
  if (!response.value?.data) return ''
  try {
    return typeof response.value.data === 'string' 
      ? response.value.data 
      : JSON.stringify(response.value.data, null, 2)
  } catch {
    return String(response.value.data)
  }
})

// 计算属性 - 格式化的请求体
const formattedJsonBody = computed(() => {
  if (!jsonBody.value) return ''
  try {
    const parsed = JSON.parse(jsonBody.value)
    return formatJsonString(parsed)
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

// 改送请求的类型定义
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
    // 如果 URL 解析失，返回原始 URL
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

// 建请求数据
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
    const responseData = {
      status: res.status,
      headers: Object.fromEntries(
        Object.entries(res.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : String(value)
        ])
      ),
      data: res.data,
      time: endTime - startTime
    }

    response.value = responseData

    // 构建历史记录
    const historyRecord: HistoryRecord = {
      method: method.value,
      url: url.value,
      headers: headers.value,
      params: params.value,
      bodyType: bodyType.value,
      ...(bodyType.value === 'json' ? { jsonBody: jsonBody.value } : {}),
      ...(bodyType.value === 'form-data' ? { formData: formData.value } : {}),
      response: responseData,
      timestamp: new Date().toISOString()
    }

    // 保存到历史记录
    historyManager.add(historyRecord)
    console.log('Request saved to history:', historyRecord) // 添加调试日志

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

    // 从响应头中获取文件名
    let filename = ''
    const disposition = res.headers['content-disposition']
    if (disposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
      if (matches?.[1]) {
        filename = matches[1].replace(/['"]/g, '')
      }
    }
    
    // 如果没有文件名，从URL或时间戳生成
    if (!filename) {
      const urlFilename = url.value.split('/').pop()
      filename = urlFilename || `download_${Date.now()}`
    }

    // 从响应头获取正确的 MIME 类型
    const contentType = res.headers['content-type'] || 'application/octet-stream'

    // 创建 Blob 对象
    const blob = new Blob([res.data], { type: contentType })
    
    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
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

const handleJsonInput = () => {
  if (rawFormat.value === 'json') {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonBody.value), null, 2)
      if (formatted !== jsonBody.value) {
        jsonBody.value = formatted
      }
    } catch {
      // JSON 解析错误，保持原样
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

// 加载请求
const loadRequest = (record: HistoryRecord) => {
  // 加载基本信息
  method.value = record.method as RequestMethod
  url.value = record.url
  
  // 加载参数
  params.value = record.params || []
  
  // 加载请求头
  headers.value = record.headers || []
  
  // 加载请求体
  bodyType.value = record.bodyType
  if (record.bodyType === 'json' && record.jsonBody) {
    jsonBody.value = record.jsonBody
  } else if (record.bodyType === 'form-data' && record.formData) {
    formData.value = record.formData
  }
  
  // 切换到对应的标签页
  if (record.bodyType !== 'none') {
    activeTab.value = 'body'
  }

  // 加载响应结果
  if (record.response) {
    response.value = {
      status: record.response.status,
      headers: record.response.headers,
      data: record.response.data,
      time: record.response.time
    }
  }
}

// 字体大小控制
const fontSize = ref(14)
const lineHeight = computed(() => Math.floor(fontSize.value * 1.5))

// 计算行数
const lineCount = computed(() => {
  return jsonBody.value.split('\n').length
})

// 缩放控制
const zoomIn = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
  }
}

const zoomOut = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
  }
}

const resetZoom = () => {
  fontSize.value = 14
}

// 处理输入
const handleBodyInput = () => {
  if (rawFormat.value === 'json') {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonBody.value), null, 2)
      if (formatted !== jsonBody.value) {
        jsonBody.value = formatted
      }
    } catch {
      // JSON 解析错误时保持原样
    }
  }
}

// 获取行数
const getLineCount = (text: string) => {
  return text.split('\n').length
}

// 高亮代码
const highlightCode = (code: string, language = 'json') => {
  try {
    if (language === 'json') {
      const parsed = JSON.parse(code)
      return hljs.highlight(JSON.stringify(parsed, null, 2), { language }).value
    }
    return hljs.highlight(code, { language }).value
  } catch {
    return code
  }
}

// 请求体高亮
const highlightedBody = computed(() => {
  return highlightCode(jsonBody.value)
})

// 响应高亮
const highlightedResponse = computed(() => {
  return highlightCode(formattedResponse.value)
})

// 获取响应大小
const getResponseSize = computed(() => {
  if (!response.value?.data) return '0 B'
  const bytes = new TextEncoder().encode(JSON.stringify(response.value.data)).length
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
})

// 格式化代码
const formatCode = () => {
  if (rawFormat.value === 'json') {
    try {
      const value = jsonBody.value || '{}'
      const parsed = JSON.parse(value)
      jsonBody.value = JSON.stringify(parsed, null, 2)
      message.success(t('request.prettifySuccess'))
    } catch {
      message.error(t('request.prettifyError'))
    }
  }
}

// 下载响应
const downloadResponse = () => {
  if (!response.value?.data) return
  const data = JSON.stringify(response.value.data, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `response_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const loadExample = (methodType: RequestMethod) => {
  method.value = methodType
  
  switch (methodType) {
    case 'GET':
      url.value = 'https://httpbin.org/get'
      bodyType.value = 'none'
      break
    case 'POST':
      url.value = 'https://httpbin.org/post'
      bodyType.value = 'json'
      jsonBody.value = JSON.stringify({
        name: "example",
        time: new Date().toISOString()
      }, null, 2)
      break
    case 'PUT':
      url.value = 'https://httpbin.org/put'
      bodyType.value = 'json'
      jsonBody.value = JSON.stringify({
        id: 1,
        name: "updated example",
        time: new Date().toISOString()
      }, null, 2)
      break
    case 'DELETE':
      url.value = 'https://httpbin.org/delete'
      bodyType.value = 'none'
      break
  }
  
  // 重置其他参数
  params.value = []
  headers.value = []
  formData.value = []
  
  message.success(t('request.exampleLoaded'))
}

defineExpose({
  loadRequest
})
</script> 