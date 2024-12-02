import { createI18n } from 'vue-i18n'

const messages = {
  'zh-CN': {
    app: {
      title: 'LBS Test',
      theme: '主题',
      language: '语言',
      layout: '布局'
    },
    request: {
      send: '发送',
      cancel: '取消',
      sendAndDownload: '发送并下载',
      method: '方法',
      url: '输入 URL 或粘贴 cURL 命令',
      params: '参数',
      headers: '请求头',
      body: '请求体',
      response: '响应',
      parseSuccess: 'cURL 命令解析成功',
      parseError: '解析失败',
      key: '键',
      value: '值',
      action: '操作',
      addParam: '添加参数',
      addHeader: '添加请求头',
      addFormData: '添加表单数据',
      status: '状态',
      time: '耗时',
      prettify: '格式化',
      copy: '复制',
      copySuccess: '复制成功',
      downloadSuccess: '下载成功',
      downloadFailed: '下载失败',
      selectFileType: '选择文件类型',
      json: 'JSON',
      text: '文本',
      binary: '二进制',
      sendTip: '发送请求',
      urlRequired: '请输入 URL',
      invalidJson: 'JSON 格式错误',
      failed: '请求失败',
      cancelled: '请求已取消'
    },
    response: {
      empty: '暂无响应数据',
      loading: '请求中...'
    },
    history: {
      title: '历史记录',
      empty: '暂无历史记录',
      clear: '清空',
      load: '加载',
      loadSuccess: '加载成功',
      save: '保存请求',
      clearSuccess: '历史记录已清空',
      clearConfirm: '确定要清空历史记录吗？',
      clearTitle: '清空历史记录',
      deleteSuccess: '删除成功',
      saveSuccess: '保存成功',
      updateSuccess: '更新成功'
    },
    themes: {
      light: '浅色',
      dark: '深色',
      preset: '预设主题',
      custom: '自定义',
      mode: '主题模式',
      primary: '主色',
      background: '背景色',
      apply: '应用',
      reset: '重置'
    },
    layouts: {
      horizontal: '水平布局',
      vertical: '垂直布局'
    },
    collection: {
      title: '集合',
      search: '搜索集合',
      createNew: '新建集合',
      name: '名称',
      description: '描述',
      create: '创建',
      edit: '编辑',
      delete: '删除',
      confirmDelete: '确认删除',
      deleteConfirm: '确定要删除该集合吗？',
      addFolder: '添加文件夹',
      addRequest: '添加请求',
      folder: '文件夹',
      request: '请求',
      save: '保存',
      saved: '已保存',
      import: '导入',
      export: '导出'
    }
  },
  'en-US': {
    app: {
      title: 'LBS Test',
      theme: 'Theme',
      language: 'Language',
      layout: 'Layout'
    },
    request: {
      send: 'Send',
      cancel: 'Cancel',
      sendAndDownload: 'Send & Download',
      method: 'Method',
      url: 'Enter URL or paste cURL command',
      params: 'Parameters',
      headers: 'Headers',
      body: 'Body',
      response: 'Response',
      parseSuccess: 'cURL command parsed successfully',
      parseError: 'Parse failed',
      key: 'Key',
      value: 'Value',
      action: 'Action',
      addParam: 'Add Parameter',
      addHeader: 'Add Header',
      addFormData: 'Add Form Data',
      status: 'Status',
      time: 'Time',
      prettify: 'Prettify',
      copy: 'Copy',
      copySuccess: 'Copied',
      downloadSuccess: 'Download success',
      downloadFailed: 'Download failed',
      selectFileType: 'Select File Type',
      json: 'JSON',
      text: 'Text',
      binary: 'Binary',
      sendTip: 'Send Request',
      urlRequired: 'Please enter URL',
      invalidJson: 'Invalid JSON format',
      failed: 'Request failed',
      cancelled: 'Request cancelled'
    },
    response: {
      empty: 'No response data',
      loading: 'Requesting...'
    },
    history: {
      title: 'History',
      empty: 'No history records',
      clear: 'Clear',
      load: 'Load',
      loadSuccess: 'Loaded successfully',
      save: 'Save Request',
      clearSuccess: 'History cleared',
      clearConfirm: 'Are you sure you want to clear all history?',
      clearTitle: 'Clear History',
      deleteSuccess: 'Deleted successfully',
      saveSuccess: 'Saved successfully',
      updateSuccess: 'Updated successfully'
    },
    themes: {
      light: 'Light',
      dark: 'Dark',
      preset: 'Preset Themes',
      custom: 'Custom',
      mode: 'Theme Mode',
      primary: 'Primary Color',
      background: 'Background',
      apply: 'Apply',
      reset: 'Reset'
    },
    layouts: {
      horizontal: 'Horizontal',
      vertical: 'Vertical'
    },
    collection: {
      title: 'Collections',
      search: 'Search collections',
      createNew: 'New Collection',
      name: 'Name',
      description: 'Description',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Confirm Delete',
      deleteConfirm: 'Are you sure to delete this collection?',
      addFolder: 'Add Folder',
      addRequest: 'Add Request',
      folder: 'Folder',
      request: 'Request',
      save: 'Save',
      saved: 'Saved',
      import: 'Import',
      export: 'Export'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages
}) 