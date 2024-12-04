import { ref, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { downloadFile } from '../utils/download'

/**
 * 响应面板状态接口
 */
export interface ResponseState {
  text: string                           // 响应内容
  format: 'json' | 'xml' | 'html' | 'text' // 响应格式
  loading: boolean                       // 加载状态
  editor: any                           // 编辑器实例
  container: HTMLElement | null         // 容器元素
  height: number                        // 面板高度
  isDragging: boolean                   // 是否正在拖拽
  startY: number                        // 拖拽起始位置
  startHeight: number                   // 拖拽起始高度
  showSearch: boolean                   // 是否显示搜索框
  searchQuery: string                   // 搜索查询
  currentMatch: number                   // 当前匹配项
  matchCount: number                    // 匹配项总数
}

/**
 * 响应格式选项
 */
export const formatOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'HTML', value: 'html' },
  { label: 'Text', value: 'text' }
]

/**
 * 响应体接口
 */
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/**
 * 响应面板组合式函数
 */
export function useResponse() {
  // 状态管理
  const state = {
    text: ref(''),
    format: ref<ResponseState['format']>('json'),
    loading: ref(false),
    editor: ref(null),
    container: ref(null),
    height: ref(400),                   // 默认高度
    isDragging: ref(false),
    startY: ref(0),
    startHeight: ref(0),
    showSearch: false,
    searchQuery: '',
    currentMatch: 0,
    matchCount: 0,
  }

  // 拖拽相关方法
  const dragActions = {
    // 开始拖拽
    startDrag: (e: MouseEvent) => {
      state.isDragging.value = true
      state.startY.value = e.clientY
      state.startHeight.value = state.height.value
      
      // 添加拖拽事件监听
      document.addEventListener('mousemove', dragActions.onDrag)
      document.addEventListener('mouseup', dragActions.stopDrag)
      
      // 添加选择禁用样式
      document.body.style.userSelect = 'none'
    },

    // 拖拽中
    onDrag: (e: MouseEvent) => {
      if (!state.isDragging.value) return
      const deltaY = state.startY.value - e.clientY
      const newHeight = Math.max(300, Math.min(800, state.startHeight.value + deltaY))
      state.height.value = newHeight
      
      // 通知编辑器重新布局
      if (state.editor.value?.layout) {
        state.editor.value.layout()
      }
    },

    // 停止拖拽
    stopDrag: () => {
      state.isDragging.value = false
      
      // 移除事件监听
      document.removeEventListener('mousemove', dragActions.onDrag)
      document.removeEventListener('mouseup', dragActions.stopDrag)
      
      // 移除选择禁用样式
      document.body.style.userSelect = ''
    }
  }

  // 响应操作方法
  const actions = {
    // 格式化响应内容
    format: () => {
      if (!state.editor.value?.getAction) return
      const formatAction = state.editor.value.getAction('editor.action.formatDocument')
      if (formatAction) {
        formatAction.run().then(() => {
          message.success({
            content: '格式化成功',
            duration: 1,
            style: { marginTop: '20vh' }
          })
        })
      }
    },

    // 复制响应内容
    copy: () => {
      if (!state.text.value) return
      navigator.clipboard.writeText(state.text.value)
      message.success({
        content: '复制成功',
        duration: 1,
        style: { marginTop: '20vh' }
      })
    },

    // 下载响应内容
    download: () => {
      if (!state.text.value) return
      const format = state.format.value
      const fileName = `response.${format}`
      const mimeTypes = {
        json: 'application/json',
        xml: 'application/xml',
        html: 'text/html',
        text: 'text/plain'
      }
      downloadFile(state.text.value, fileName, mimeTypes[format] || 'text/plain')
      message.success({
        content: '下载成功',
        duration: 1,
        style: { marginTop: '20vh' }
      })
    },

    toggleSearch() {
      state.value.showSearch = !state.value.showSearch
      if (state.value.showSearch) {
        nextTick(() => {
          document.querySelector('.search-input')?.focus()
        })
      } else {
        state.value.searchQuery = ''
        state.value.editor?.getAction('removeSecondaryCursors')?.run()
      }
    },

    findNext() {
      const editor = state.value.editor
      if (!editor) return
      
      const decorations = editor.getModel()?.findMatches(
        state.value.searchQuery,
        false, // searchOnlyEditableRange
        true,  // isRegex
        true,  // matchCase
        null,  // wordSeparators
        true   // captureMatches
      ) || []
      
      state.value.matchCount = decorations.length
      if (state.value.currentMatch >= state.value.matchCount) {
        state.value.currentMatch = 0
      }
      
      if (decorations[state.value.currentMatch]) {
        editor.setSelection(decorations[state.value.currentMatch].range)
        editor.revealLineInCenter(decorations[state.value.currentMatch].range.startLineNumber)
        state.value.currentMatch++
      }
    },

    findPrevious() {
      const editor = state.value.editor
      if (!editor) return
      
      const decorations = editor.getModel()?.findMatches(
        state.value.searchQuery,
        false, true, true, null, true
      ) || []
      
      state.value.matchCount = decorations.length
      state.value.currentMatch--
      
      if (state.value.currentMatch < 0) {
        state.value.currentMatch = state.value.matchCount - 1
      }
      
      if (decorations[state.value.currentMatch]) {
        editor.setSelection(decorations[state.value.currentMatch].range)
        editor.revealLineInCenter(decorations[state.value.currentMatch].range.startLineNumber)
      }
    }
  }

  // 工具方法
  const utils = {
    // 格式化内容
    formatContent: (content: string, format: ResponseState['format']) => {
      try {
        switch (format) {
          case 'json':
            // 改进JSON格式化处理
            if (typeof content === 'string') {
              const parsed = JSON.parse(content)
              return JSON.stringify(parsed, null, 2)
            }
            return JSON.stringify(content, null, 2)
          case 'xml':
            return content.replace(/></g, '>\n<').replace(/>\s+</g, '>\n<')
          case 'html':
            return content.replace(/></g, '>\n<').replace(/>\s+</g, '>\n<')
          default:
            return content
        }
      } catch (e) {
        console.warn('Format error:', e)
        return content
      }
    },

    // 检测响应格式
    detectFormat: (headers: Record<string, string>) => {
      const contentType = headers['content-type'] || ''
      if (contentType.includes('application/json')) return 'json'
      if (contentType.includes('application/xml') || contentType.includes('text/xml')) return 'xml'
      if (contentType.includes('text/html')) return 'html'
      return 'text'
    },

    // 获取状态码文本
    getStatusText: (status?: number) => {
      if (!status) return '-'
      const statusTexts: Record<number, string> = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
      }
      return statusTexts[status] || 'Unknown'
    }
  }

  // 监听响应格式变化
  watch(() => state.format.value, (newFormat) => {
    if (state.text.value) {
      state.text.value = utils.formatContent(state.text.value, newFormat)
    }
  })

  // 处理成功响应
  const handleSuccess = <T>(response: ApiResponse<T>) => {
    if (response.code === 200) {
      return response.data
    }
    throw new Error(response.message)
  }

  // 处理错误响应
  const handleError = (error: any) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    // 可以集成消息提示组件
    console.error(message)
    throw error
  }

  return {
    state,
    actions,
    utils,
    dragActions,
    formatOptions,
    handleSuccess,
    handleError
  }
} 