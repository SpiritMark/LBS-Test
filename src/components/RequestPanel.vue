<template>
  <div class="request-panel" :class="{ 'layout-horizontal': appStore.layout === 'horizontal' }">
    <div class="main-panel">
      <div class="request-section">
        <!-- 请求头部 -->
        <div class="request-header">
          <a-select v-model:value="requestMethod" class="method-select" :style="{ color: methodColors[requestMethod] || '#666' }">
            <a-select-option v-for="method in httpMethods" :key="method" :value="method" :style="{ color: methodColors[method] || '#666' }">
              {{ method }}
            </a-select-option>
          </a-select>
          <div class="url-input-wrapper">
            <a-input
              v-model:value="url"
              :placeholder="t('request.url')"
              class="url-input"
              :style="{ height: '40px' }"
            />
            <a-button
              class="cmd-button"
              @click="showCommandModal = true"
            >{{ t('request.command') }}</a-button>
          </div>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleSendMenuClick">
                <a-menu-item key="send">{{ t('request.send') }}</a-menu-item>
                <a-menu-item key="download">{{ t('request.sendAndDownload') }}</a-menu-item>
              </a-menu>
            </template>
            <a-button
              type="primary"
              :loading="loading"
              class="send-button"
            >
              {{ t('request.send') }} <down-outlined />
            </a-button>
          </a-dropdown>
        </div>

        <!-- 请求配置区域 -->
        <div class="request-config">
          <a-tabs v-model:activeKey="activeTab" class="request-tabs">
            <a-tab-pane :key="'params'" :tab="t('request.params')">
              <div class="tab-content">
                <a-table
                  :columns="getColumns('params')"
                  :dataSource="params"
                  :pagination="false"
                  :bordered="true"
                  row-key="key"
                >
                  <template #keyCell="{ text, record }">
                    <template v-if="editingKey === record.key && editingType === 'params'">
                      <a-input
                        v-model:value="editingRow.key"
                        class="edit-input"
                        placeholder="请输入键"
                      />
                    </template>
                    <template v-else>
                      {{ text }}
                    </template>
                  </template>
                  <template #valueCell="{ text, record }">
                    <template v-if="editingKey === record.key && editingType === 'params'">
                      <a-input
                        v-model:value="editingRow.value"
                        class="edit-input"
                        placeholder="请输入值"
                      />
                    </template>
                    <template v-else>
                      {{ text }}
                    </template>
                  </template>
                  <template #action="{ record }">
                    <div class="action-buttons">
                      <template v-if="editingKey === record.key && editingType === 'params'">
                        <a-button type="link" @click="saveEdit('params')">
                          <SaveOutlined />
                        </a-button>
                        <a-button type="link" @click="cancelEdit">
                          <CloseOutlined />
                        </a-button>
                      </template>
                      <template v-else>
                        <a-button type="link" @click="startEdit(record, 'params')">
                          <EditOutlined />
                        </a-button>
                        <a-button type="link" @click="removeRow(record.key, 'params')">
                          <DeleteOutlined />
                        </a-button>
                      </template>
                    </div>
                  </template>
                </a-table>
                <a-button
                  type="dashed"
                  block
                  @click="addRow('params')"
                  class="add-button"
                >{{ t('request.addParam') }}</a-button>
              </div>
            </a-tab-pane>

            <a-tab-pane :key="'headers'" :tab="t('request.headers')">
              <div class="tab-content">
                <a-table
                  :columns="getColumns('headers')"
                  :dataSource="headers"
                  :pagination="false"
                  :bordered="true"
                  row-key="key"
                >
                  <template #keyCell="{ text, record }">
                    <template v-if="editingKey === record.key && editingType === 'headers'">
                      <a-input
                        v-model:value="editingRow.key"
                        class="edit-input"
                        placeholder="请输入键"
                      />
                    </template>
                    <template v-else>
                      {{ text }}
                    </template>
                  </template>
                  <template #valueCell="{ text, record }">
                    <template v-if="editingKey === record.key && editingType === 'headers'">
                      <a-input
                        v-model:value="editingRow.value"
                        class="edit-input"
                        placeholder="请输入值"
                      />
                    </template>
                    <template v-else>
                      {{ text }}
                    </template>
                  </template>
                  <template #action="{ record }">
                    <div class="action-buttons">
                      <template v-if="editingKey === record.key && editingType === 'headers'">
                        <a-button type="link" @click="saveEdit('headers')">
                          <SaveOutlined />
                        </a-button>
                        <a-button type="link" @click="cancelEdit">
                          <CloseOutlined />
                        </a-button>
                      </template>
                      <template v-else>
                        <a-button type="link" @click="startEdit(record, 'headers')">
                          <EditOutlined />
                        </a-button>
                        <a-button type="link" @click="removeRow(record.key, 'headers')">
                          <DeleteOutlined />
                        </a-button>
                      </template>
                    </div>
                  </template>
                </a-table>
                <a-button
                  type="dashed"
                  block
                  @click="addRow('headers')"
                  class="add-button"
                >{{ t('request.addHeader') }}</a-button>
              </div>
            </a-tab-pane>

            <a-tab-pane :key="'body'" :tab="t('request.body')">
              <div class="tab-content">
                <div class="body-type-selector-wrapper">
                  <a-radio-group v-model:value="bodyType" class="body-type-selector">
                    <a-radio-button value="none">none</a-radio-button>
                    <a-radio-button value="form-data">form-data</a-radio-button>
                    <a-radio-button value="x-www-form-urlencoded">x-www-form-urlencoded</a-radio-button>
                    <a-radio-button value="raw">raw</a-radio-button>
                    <a-radio-button value="binary">binary</a-radio-button>
                    <a-radio-button value="graphql">GraphQL</a-radio-button>
                  </a-radio-group>

                  <div v-if="bodyType === 'raw'" class="raw-format-selector">
                    <a-select v-model:value="rawFormat" style="width: 120px">
                      <a-select-option value="text">Text</a-select-option>
                      <a-select-option value="javascript">JavaScript</a-select-option>
                      <a-select-option value="json">JSON</a-select-option>
                      <a-select-option value="html">HTML</a-select-option>
                      <a-select-option value="xml">XML</a-select-option>
                    </a-select>
                  </div>
                </div>

                <div class="body-content">
                  <!-- Form Data -->
                  <div v-if="bodyType === 'form-data'" class="form-data-content">
                    <a-table
                      :columns="getColumns('formData')"
                      :dataSource="formData"
                      :pagination="false"
                      :bordered="true"
                      row-key="key"
                    >
                      <template #keyCell="{ text, record }">
                        <template v-if="editingKey === record.key && editingType === 'formData'">
                          <a-input
                            v-model:value="editingRow.key"
                            class="edit-input"
                            placeholder="请输入键"
                          />
                        </template>
                        <template v-else>
                          {{ text }}
                        </template>
                      </template>
                      <template #valueCell="{ text, record }">
                        <template v-if="editingKey === record.key && editingType === 'formData'">
                          <a-input
                            v-model:value="editingRow.value"
                            class="edit-input"
                            placeholder="请输入值"
                          />
                        </template>
                        <template v-else>
                          {{ text }}
                        </template>
                      </template>
                      <template #action="{ record }">
                        <div class="action-buttons">
                          <template v-if="editingKey === record.key && editingType === 'formData'">
                            <a-button type="link" @click="saveEdit('formData')">
                              <SaveOutlined />
                            </a-button>
                            <a-button type="link" @click="cancelEdit">
                              <CloseOutlined />
                            </a-button>
                          </template>
                          <template v-else>
                            <a-button type="link" @click="startEdit(record, 'formData')">
                              <EditOutlined />
                            </a-button>
                            <a-button type="link" @click="removeRow(record.key, 'formData')">
                              <DeleteOutlined />
                            </a-button>
                          </template>
                        </div>
                      </template>
                    </a-table>
                    <a-button type="dashed" block @click="addRow('formData')" class="add-button">
                      添加表单数据
                    </a-button>
                  </div>

                  <!-- URL Encoded -->
                  <div v-if="bodyType === 'x-www-form-urlencoded'" class="urlencoded-content">
                    <a-table
                      :columns="getColumns('urlencoded')"
                      :dataSource="formData"
                      :pagination="false"
                      :bordered="true"
                      row-key="key"
                    >
                      <template #keyCell="{ text, record }">
                        <template v-if="editingKey === record.key && editingType === 'urlencoded'">
                          <a-input
                            v-model:value="editingRow.key"
                            class="edit-input"
                            placeholder="请输入键"
                          />
                        </template>
                        <template v-else>
                          {{ text }}
                        </template>
                      </template>
                      <template #valueCell="{ text, record }">
                        <template v-if="editingKey === record.key && editingType === 'urlencoded'">
                          <a-input
                            v-model:value="editingRow.value"
                            class="edit-input"
                            placeholder="请输入值"
                          />
                        </template>
                        <template v-else>
                          {{ text }}
                        </template>
                      </template>
                      <template #action="{ record }">
                        <div class="action-buttons">
                          <template v-if="editingKey === record.key && editingType === 'urlencoded'">
                            <a-button type="link" @click="saveEdit('urlencoded')">
                              <SaveOutlined />
                            </a-button>
                            <a-button type="link" @click="cancelEdit">
                              <CloseOutlined />
                            </a-button>
                          </template>
                          <template v-else>
                            <a-button type="link" @click="startEdit(record, 'urlencoded')">
                              <EditOutlined />
                            </a-button>
                            <a-button type="link" @click="removeRow(record.key, 'urlencoded')">
                              <DeleteOutlined />
                            </a-button>
                          </template>
                        </div>
                      </template>
                    </a-table>
                    <a-button type="dashed" block @click="addRow('urlencoded')" class="add-button">
                      添加参数
                    </a-button>
                  </div>

                  <!-- Raw Content -->
                  <div v-if="bodyType === 'raw'" class="raw-content">
                    <div class="editor-header">
                      <a-select v-model:value="rawFormat" class="format-selector">
                        <a-select-option value="text">Text</a-select-option>
                        <a-select-option value="javascript">JavaScript</a-select-option>
                        <a-select-option value="json">JSON</a-select-option>
                        <a-select-option value="html">HTML</a-select-option>
                        <a-select-option value="xml">XML</a-select-option>
                      </a-select>
                      <div class="editor-actions">
                        <a-button v-if="rawFormat === 'json'" type="text" @click="formatJson">
                          <CodeOutlined />
                          格式化
                        </a-button>
                      </div>
                    </div>
                    <div class="editor-wrapper">
                      <textarea
                        v-model="rawBody"
                        class="code-editor"
                        :placeholder="getPlaceholder(rawFormat)"
                        spellcheck="false"
                        @keydown.tab.prevent="handleTab"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Binary Content -->
                  <div v-if="bodyType === 'binary'" class="binary-content">
                    <a-upload
                      :beforeUpload="() => false"
                      @change="handleFileUpload"
                      :maxCount="1"
                    >
                      <a-button>
                        <upload-outlined />
                        选择文件
                      </a-button>
                    </a-upload>
                    <div v-if="binaryFile" class="file-info">
                      <p>文件名: {{ binaryFile.name }}</p>
                      <p>大小: {{ (binaryFile.size / 1024).toFixed(2) }} KB</p>
                      <p>类型: {{ binaryFile.type }}</p>
                    </div>
                  </div>

                  <!-- GraphQL Content -->
                  <div v-if="bodyType === 'graphql'" class="graphql-content">
                    <div class="graphql-query">
                      <div class="editor-label">Query</div>
                      <a-input.TextArea
                        v-model:value="graphqlQuery"
                        :rows="8"
                        class="graphql-editor"
                        placeholder="Enter GraphQL query"
                      />
                    </div>
                    <div class="graphql-variables">
                      <div class="editor-label">Variables</div>
                      <a-input.TextArea
                        v-model:value="graphqlVariables"
                        :rows="4"
                        class="graphql-editor"
                        placeholder="Enter variables as JSON"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <!-- 响应区域 -->
        <div v-if="response" class="response-section">
          <div class="response-header">
            <div class="response-header-top">
              <h3 class="response-header-title">{{ t('request.response') }}</h3>
              <div class="response-actions">
                <a-tooltip :title="t('request.prettify')" placement="top">
                  <a-button
                    class="action-button"
                    type="text"
                    @click="prettifyResponse"
                  >
                    <template #icon><CodeOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="t('request.copy')" placement="top">
                  <a-button
                    class="action-button"
                    type="text"
                    @click="copyResponse"
                  >
                    <template #icon><CopyOutlined /></template>
                  </a-button>
                </a-tooltip>
              </div>
            </div>
            <a-descriptions bordered size="small">
              <a-descriptions-item :label="t('request.status')">
                <a-tag :color="getStatusColor(response.status)">{{ response.status }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item :label="t('request.time')">
                {{ response.time }}ms
              </a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="response-body">
            <pre v-html="formatResponse"></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录面板 -->
    <div class="history-wrapper" :class="{ 'layout-horizontal': appStore.layout === 'horizontal' }">
      <history-panel
        :current-request="{
          method: requestMethod,
          url,
          headers,
          params,
          bodyType: bodyType as 'none' | 'json' | 'form-data',
          jsonBody,
          formData
        }"
        @load="loadFromHistory"
      />
    </div>

    <!-- 模态框 -->
    <a-modal
      v-model:visible="showCommandModal"
      :title="t('request.parseCommand')"
      @ok="parseCommand"
      @cancel="showCommandModal = false"
      :okText="t('request.parse')"
      :cancelText="t('request.cancel')"
      class="command-modal"
    >
      <div class="command-input-wrapper">
        <a-textarea
          v-model:value="commandInput"
          :placeholder="t('request.enterCommand')"
          :rows="4"
          class="command-input"
        />
      </div>
    </a-modal>

    <a-modal
      v-model:visible="showDownloadModal"
      :title="t('request.selectFileType')"
      @ok="handleDownload"
      :okText="t('request.send')"
      :cancelText="t('request.cancel')"
      class="download-modal"
    >
      <a-radio-group v-model:value="downloadType">
        <a-radio value="json">{{ t('request.json') }}</a-radio>
        <a-radio value="text">{{ t('request.text') }}</a-radio>
        <a-radio value="binary">{{ t('request.binary') }}</a-radio>
      </a-radio-group>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAppStore } from '../store/app'
import { parseCurl } from '../utils/curlParser'
import { message } from 'ant-design-vue'
import HistoryPanel from './HistoryPanel.vue'
import type { RequestHistory } from '../types/history'
import { DownOutlined, CopyOutlined, CodeOutlined, SaveOutlined, CloseOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { downloadData, getDefaultFilename } from '../utils/download'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/atom-one-dark.css'

// 注册语言
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)

const appStore = useAppStore()
const t = (key: string) => {
  const keys = key.split('.')
  let value = appStore.currentLocale()
  for (const k of keys) {
    value = value[k]
  }
  return value
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const requestMethod = ref('GET')
const url = ref('')
const activeTab = ref('params')
const loading = ref(false)

// 类型定义
interface RequestBody {
  type: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary' | 'graphql'
  format?: 'text' | 'javascript' | 'json' | 'html' | 'xml'
  content: string
}

// 状态管理
const bodyType = ref<RequestBody['type']>('none')
const rawFormat = ref<NonNullable<RequestBody['format']>>('json')
const rawBody = ref('')
const formData = ref<Array<{ key: string; value: string }>>([])
const binaryFile = ref<File | null>(null)
const graphqlQuery = ref('')
const graphqlVariables = ref('')
const response = ref<any>(null)
const showCommandModal = ref(false)
const commandInput = ref('')
const showDownloadModal = ref(false)
const downloadType = ref<'json' | 'text' | 'binary'>('json')
const pendingResponse = ref<any>(null)

// 获取表格列配置
const getColumns = (type: string) => [
  { 
    title: t('request.key'), 
    dataIndex: 'key', 
    key: 'key',
    width: '40%',
    slots: {
      customRender: 'keyCell'
    }
  },
  { 
    title: t('request.value'), 
    dataIndex: 'value', 
    key: 'value',
    width: '40%',
    slots: {
      customRender: 'valueCell'
    }
  },
  { 
    title: t('request.action'), 
    key: 'action', 
    width: '20%',
    slots: {
      customRender: 'action'
    }
  },
]

// 编辑状态管理
const editingKey = ref('')
const editingType = ref('')
const editingRow = ref<{ key: string; value: string }>({ key: '', value: '' })

// 开始编辑
const startEdit = (record: { key: string; value: string }, type: string) => {
  editingKey.value = record.key
  editingType.value = type
  editingRow.value = { ...record }
}

// 保存编辑
const saveEdit = (type: string) => {
  if (!editingRow.value.key.trim()) {
    message.error('键不能为空')
    return
  }

  if (type === 'params') {
    const index = params.value.findIndex(item => item.key === editingKey.value)
    if (index > -1) {
      params.value[index] = { ...editingRow.value }
    }
  } else if (type === 'headers') {
    const index = headers.value.findIndex(item => item.key === editingKey.value)
    if (index > -1) {
      headers.value[index] = { ...editingRow.value }
    }
  } else if (type === 'formData') {
    const index = formData.value.findIndex(item => item.key === editingKey.value)
    if (index > -1) {
      formData.value[index] = { ...editingRow.value }
    }
  } else if (type === 'urlencoded') {
    const index = formData.value.findIndex(item => item.key === editingKey.value)
    if (index > -1) {
      formData.value[index] = { ...editingRow.value }
    }
  }
  
  editingKey.value = ''
  editingType.value = ''
  editingRow.value = { key: '', value: '' }
}

// 取消编辑
const cancelEdit = () => {
  editingKey.value = ''
  editingType.value = ''
  editingRow.value = { key: '', value: '' }
}

// 添加新行
const addRow = (type: string) => {
  const newRow = { key: '', value: '' }
  if (type === 'params') {
    params.value.push(newRow)
    startEdit(newRow, type)
  } else if (type === 'headers') {
    headers.value.push(newRow)
    startEdit(newRow, type)
  } else if (type === 'formData') {
    formData.value.push(newRow)
    startEdit(newRow, type)
  } else if (type === 'urlencoded') {
    formData.value.push(newRow)
    startEdit(newRow, type)
  }
}

// 删除行
const removeRow = (key: string, type: string) => {
  if (type === 'params') {
    params.value = params.value.filter(item => item.key !== key)
  } else if (type === 'headers') {
    headers.value = headers.value.filter(item => item.key !== key)
  } else if (type === 'formData') {
    formData.value = formData.value.filter(item => item.key !== key)
  } else if (type === 'urlencoded') {
    formData.value = formData.value.filter(item => item.key !== key)
  }
}

// 参数相关
const params = ref<Array<{ key: string; value: string }>>([])
const headers = ref<Array<{ key: string; value: string }>>([])

// 加载历史记录
const loadFromHistory = (request: RequestHistory) => {
  requestMethod.value = request.method
  url.value = request.url
  headers.value = request.headers
  params.value = request.params
  
  if (request.bodyType === 'json') {
    bodyType.value = 'raw'
    rawFormat.value = 'json'
    rawBody.value = request.jsonBody || ''
  } else {
    bodyType.value = request.bodyType as RequestBody['type']
    if (request.bodyType === 'form-data' && request.formData) {
      formData.value = request.formData
    }
  }
}

// 解析命令
const parseCommand = () => {
  try {
    const parsed = parseCurl(commandInput.value)
    
    requestMethod.value = parsed.method
    url.value = parsed.url
    
    // 清空现有数据
    params.value = []
    headers.value = []
    
    // 设置参数
    if (parsed.params && parsed.params.length > 0) {
      params.value = parsed.params.map(param => ({
        key: param.key,
        value: param.value
      }))
    }
    
    // 设置请求头
    if (parsed.headers && parsed.headers.length > 0) {
      headers.value = parsed.headers.map(header => ({
        key: header.key,
        value: header.value
      }))
    }

    // 处理请求体
    if (parsed.data) {
      try {
        // 尝试解析为 JSON
        JSON.parse(parsed.data)
        bodyType.value = 'raw'
        rawFormat.value = 'json'
        rawBody.value = JSON.stringify(JSON.parse(parsed.data), null, 2)
      } catch {
        // 如果不是 JSON，尝试解析为表单数据
        bodyType.value = 'x-www-form-urlencoded'
        formData.value = []
        const formDataPairs = parsed.data.split('&')
        formDataPairs.forEach(pair => {
          const [key, value = ''] = pair.split('=').map(decodeURIComponent)
          formData.value.push({ key, value })
        })
      }
    } else {
      bodyType.value = 'none'
      rawBody.value = ''
      formData.value = []
    }

    showCommandModal.value = false
    commandInput.value = ''
    message.success(t('request.parseCommand'))
  } catch (error) {
    console.error('Parse error:', error)
    message.error(t('request.parseError'))
  }
}

// 处理发送菜单点击
const handleSendMenuClick = ({ key }: { key: string }) => {
  if (key === 'send') {
    sendRequest()
  } else if (key === 'download') {
    showDownloadModal.value = true
    sendRequest(true)
  }
}

// 处理发送请求
const sendRequest = async (forDownload = false) => {
  try {
    loading.value = true
    const startTime = Date.now()

    const config: any = {
      method: requestMethod.value,
      url: url.value,
      headers: {},
      responseType: forDownload && downloadType.value === 'binary' ? 'blob' : 'json',
    }

    // 设置请求头
    headers.value.forEach(header => {
      if (header.key && header.value) {
        config.headers[header.key] = header.value
      }
    })

    // 处理请求体
    if (bodyType.value === 'raw') {
      if (rawFormat.value === 'json') {
        try {
          config.data = JSON.parse(rawBody.value)
          config.headers['Content-Type'] = 'application/json'
        } catch (e) {
          throw new Error('Invalid JSON body')
        }
      } else {
        config.data = rawBody.value
        switch (rawFormat.value) {
          case 'javascript':
            config.headers['Content-Type'] = 'application/javascript'
            break
          case 'html':
            config.headers['Content-Type'] = 'text/html'
            break
          case 'xml':
            config.headers['Content-Type'] = 'application/xml'
            break
          default:
            config.headers['Content-Type'] = 'text/plain'
        }
      }
    } else if (bodyType.value === 'form-data') {
      const formDataObj = new FormData()
      formData.value.forEach(item => {
        if (item.key && item.value) {
          formDataObj.append(item.key, item.value)
        }
      })
      config.data = formDataObj
    } else if (bodyType.value === 'x-www-form-urlencoded') {
      const params = new URLSearchParams()
      formData.value.forEach(item => {
        if (item.key && item.value) {
          params.append(item.key, item.value)
        }
      })
      config.data = params.toString()
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    } else if (bodyType.value === 'binary' && binaryFile.value) {
      config.data = binaryFile.value
      config.headers['Content-Type'] = binaryFile.value.type || 'application/octet-stream'
    } else if (bodyType.value === 'graphql') {
      config.data = {
        query: graphqlQuery.value,
        variables: graphqlVariables.value ? JSON.parse(graphqlVariables.value) : undefined
      }
      config.headers['Content-Type'] = 'application/json'
    }

    const res = await axios(config)
    const endTime = Date.now()

    const responseData = {
      status: res.status,
      data: res.data,
      time: endTime - startTime,
    }

    if (forDownload) {
      pendingResponse.value = responseData
    } else {
      response.value = responseData
    }
  } catch (error: any) {
    const errorResponse = {
      status: error.response?.status || 'Error',
      data: error.response?.data || error.message,
      time: 0,
    }

    if (forDownload) {
      pendingResponse.value = errorResponse
    } else {
      response.value = errorResponse
    }
    message.error(error.message)
  } finally {
    if (!forDownload) {
      loading.value = false
    }
  }
}

// 处理下载
const handleDownload = () => {
  if (!pendingResponse.value) return

  try {
    const filename = getDefaultFilename(url.value)
    downloadData(
      pendingResponse.value.data,
      filename,
      downloadType.value
    )
    message.success(t('request.downloadSuccess'))
  } catch (error) {
    console.error('Download error:', error)
    message.error(t('request.downloadError'))
  } finally {
    loading.value = false
    showDownloadModal.value = false
    pendingResponse.value = null
  }
}

// 添加方法颜色映射
const methodColors = {
  GET: '#00B167',
  POST: '#FF8C00',
  PUT: '#0077FF',
  DELETE: '#FF0000',
  PATCH: '#9B59B6',
  HEAD: '#8D6E63',
  OPTIONS: '#795548'
}

const getStatusColor = (status: number | string) => {
  if (typeof status === 'string') return 'error';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'warning';
  if (status >= 400 && status < 500) return 'error';
  if (status >= 500) return 'error';
  return 'default';
};

const copyResponse = () => {
  const text = JSON.stringify(response.value.data, null, 2)
  const input = document.createElement('textarea')
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  message.success(t('request.copySuccess'))
}

const formatResponse = computed(() => {
  if (!response.value?.data) return ''
  try {
    const formatted = JSON.stringify(response.value.data, null, 2)
    return hljs.highlight(formatted, { language: 'json' }).value
  } catch (e) {
    return JSON.stringify(response.value.data, null, 2)
  }
})

const prettifyResponse = () => {
  if (!response.value?.data) return
  try {
    const formatted = JSON.stringify(response.value.data, null, 2)
    const prettified = hljs.highlight(formatted, { language: 'json' }).value
    response.value.data = JSON.parse(prettified)
  } catch (e) {
    console.error('Prettify error:', e)
  }
}

// 格式化 JSON
const formatJson = () => {
  try {
    const parsed = JSON.parse(rawBody.value)
    rawBody.value = JSON.stringify(parsed, null, 2)
  } catch (error) {
    message.error('JSON 格式错误')
  }
}

// 处理二进制文件上传
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    binaryFile.value = target.files[0]
  }
}

// 获取编辑器占位符
const getPlaceholder = (format: string) => {
  switch (format) {
    case 'json':
      return '{\n  "key": "value"\n}'
    case 'xml':
      return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <element>value</element>\n</root>'
    case 'html':
      return '<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>'
    case 'javascript':
      return '// JavaScript code here\nconst example = "hello";'
    default:
      return '请输入内容'
  }
}

// 格式化并高亮代码
const formatAndHighlight = (code: string, language: string) => {
  try {
    if (language === 'json') {
      const parsed = JSON.parse(code)
      return hljs.highlight(JSON.stringify(parsed, null, 2), { language }).value
    }
    return hljs.highlight(code, { language }).value
  } catch (error) {
    return hljs.highlight(code, { language }).value
  }
}

// 处理 Tab 键
const handleTab = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement
  const start = target.selectionStart
  const end = target.selectionEnd

  // 在光标位置插入两个空格
  const spaces = '  '
  rawBody.value = rawBody.value.substring(0, start) + spaces + rawBody.value.substring(end)

  // 移动光标到插入空格后的位置
  nextTick(() => {
    target.selectionStart = target.selectionEnd = start + 2
  })
}
</script>

<style scoped>
.request-panel {
  display: flex;
  gap: 24px;
  padding: 24px;
  height: 100%;
  overflow: hidden;
  background: transparent;
  position: relative;
  transition: all 0.3s ease;
}

.request-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(47, 84, 235, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: -1;
}

.theme-dark .request-panel::before {
  background: linear-gradient(135deg, rgba(47, 84, 235, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
}

.request-panel.layout-horizontal {
  flex-direction: row;
  .main-panel {
    min-width: 60%;
    max-width: calc(100% - 424px);
  }
  .history-wrapper {
    min-width: 400px;
  }
}

.main-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.request-header {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(47, 84, 235, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.request-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(47, 84, 235, 0.15);
}

.theme-dark .request-header {
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.method-select {
  width: 120px;
}

.method-select :deep(.ant-select-selector) {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease !important;
}

.url-input-wrapper {
  position: relative;
  flex: 1;
}

.url-input {
  width: 100%;
  border-radius: 8px !important;
}

.url-input:hover {
  transform: translateY(-1px);
}

.cmd-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
  background: rgba(47, 84, 235, 0.1);
  color: #2F54EB;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cmd-button:hover {
  background: rgba(47, 84, 235, 0.2);
}

.theme-dark .cmd-button {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.send-button {
  min-width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 84, 235, 0.2);
}

.request-config {
  flex: 1;
  min-height: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(47, 84, 235, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.request-config:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(47, 84, 235, 0.15);
}

.theme-dark .request-config {
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.request-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.request-tabs :deep(.ant-tabs-nav) {
  margin: 0;
  padding: 0 16px;
  background: rgba(47, 84, 235, 0.05);
}

.request-tabs :deep(.ant-tabs-tab) {
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.request-tabs :deep(.ant-tabs-tab:hover) {
  color: #2F54EB;
}

.request-tabs :deep(.ant-tabs-content) {
  flex: 1;
  overflow: auto;
}

.tab-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.response-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(47, 84, 235, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.response-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(47, 84, 235, 0.15);
}

.theme-dark .response-section {
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.response-header {
  padding: 20px;
  border-bottom: 1px solid rgba(47, 84, 235, 0.1);
  background: rgba(47, 84, 235, 0.05);
}

.response-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.response-header-title {
  margin: 0;
  color: #2F54EB;
  font-weight: 600;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(47, 84, 235, 0.1);
  color: #2F54EB;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-button:hover {
  background: rgba(47, 84, 235, 0.2);
}

.theme-dark .copy-button {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.theme-dark .copy-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.response-body {
  padding: 20px;
  overflow: auto;
  flex: 1;
  background: #282c34;
  font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
  border-radius: 0 0 12px 12px;
}

.response-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #abb2bf;
  font-size: 14px;
  line-height: 1.6;
}

.theme-dark .response-body {
  background: #1a1a1a;
}

/* 高亮样式覆盖 */
.hljs {
  background: transparent !important;
  padding: 0 !important;
}

.hljs-attr {
  color: #e06c75 !important;
}

.hljs-string {
  color: #98c379 !important;
}

.hljs-number {
  color: #d19a66 !important;
}

.hljs-boolean {
  color: #56b6c2 !important;
}

.hljs-null {
  color: #56b6c2 !important;
}

/* 添加滚动条样式 */
.response-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.response-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.response-body::-webkit-scrollbar-thumb {
  background: rgba(47, 84, 235, 0.3);
  border-radius: 4px;
}

.response-body::-webkit-scrollbar-thumb:hover {
  background: rgba(47, 84, 235, 0.5);
}

.theme-dark .response-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.theme-dark .response-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.theme-dark .response-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.response-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.response-actions .action-button {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2F54EB;
  transition: all 0.3s ease;
}

.theme-dark .response-actions .action-button {
  color: rgba(255, 255, 255, 0.85);
}

.response-actions .action-button:hover {
  background: rgba(47, 84, 235, 0.1);
}

.theme-dark .response-actions .action-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.history-wrapper {
  width: 360px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(47, 84, 235, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.history-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(47, 84, 235, 0.15);
}

.theme-dark .history-wrapper {
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.layout-horizontal .history-wrapper {
  width: 400px;
}

/* 添加动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.request-panel > * {
  animation: fadeIn 0.5s ease-out forwards;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .request-panel {
    flex-direction: column;
  }

  .history-wrapper {
    width: 100%;
  }

  .request-header {
    flex-direction: column;
    gap: 12px;
  }

  .method-select,
  .url-input-wrapper,
  .send-button {
    width: 100%;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.add-button {
  margin-top: 16px;
}

.body-type-selector-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.raw-format-selector {
  margin-left: 16px;
}

.binary-content {
  padding: 24px;
  background: #fafafa;
  border-radius: 4px;
  text-align: center;
}

.file-info {
  margin-top: 16px;
  text-align: left;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.file-info p {
  margin-bottom: 8px;
}

.graphql-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
}

.graphql-editor {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  border-radius: 4px;
  background: #f8f9fa;
  resize: vertical;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.format-selector {
  width: 120px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-wrapper {
  flex: 1;
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #1e1e1e;
  min-height: 250px;
  height: 100%;
}

.code-editor {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  height: 100%;
  min-height: 250px;
  width: 100%;
}

:deep(.code-editor .ant-input) {
  background: #1e1e1e;
  color: #d4d4d4;
  height: 100% !important;
  min-height: 250px;
  resize: none;
  border: none;
  box-shadow: none;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
}

:deep(.code-editor .ant-input:focus) {
  border: none;
  box-shadow: none;
  outline: none;
}

.tab-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 400px;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

/* 语法高亮样式 */
:deep(.hljs) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 0;
  height: 100%;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-number) {
  color: #b5cea8;
}

:deep(.hljs-boolean) {
  color: #569cd6;
}

:deep(.hljs-null) {
  color: #569cd6;
}

:deep(.hljs-keyword) {
  color: #c586c0;
}

:deep(.hljs-property) {
  color: #9cdcfe;
}

/* 滚动条样式 */
.code-editor::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-editor::-webkit-scrollbar-track {
  background: #1e1e1e;
  border-radius: 4px;
}

.code-editor::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
}

.code-editor::-webkit-scrollbar-thumb:hover {
  background: #888;
}

.raw-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.editor-wrapper {
  flex: 1;
  position: relative;
  min-height: 300px;
  background: #1e1e1e;
}

.code-editor {
  width: 100%;
  height: 100%;
  min-height: 300px;
  padding: 16px;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #d4d4d4;
  background: #1e1e1e;
  border: none;
  resize: none;
  outline: none;
  tab-size: 2;
}

.code-editor:focus {
  outline: none;
  box-shadow: none;
}

/* 滚动条样式 */
.code-editor::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.code-editor::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.code-editor::-webkit-scrollbar-thumb {
  background: #666;
  border: 3px solid #1e1e1e;
  border-radius: 6px;
}

.code-editor::-webkit-scrollbar-thumb:hover {
  background: #888;
}

/* 选中文本的样式 */
.code-editor::selection {
  background: rgba(97, 175, 239, 0.3);
}

/* 占位符文本样式 */
.code-editor::placeholder {
  color: #666;
  opacity: 0.8;
}
</style> 