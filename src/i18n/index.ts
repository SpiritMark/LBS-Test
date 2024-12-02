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
      status: '状态',
      time: '耗时',
      prettify: '格式化',
      copy: '复制',
      copySuccess: '复制成功',
      downloadSuccess: '下载成功',
      downloadError: '下载失败',
      selectFileType: '选择文件类型',
      json: 'JSON',
      text: '文本',
      binary: '二进制',
      sendTip: '发送请求'
    },
    history: {
      title: '历史记录',
      empty: '暂无历史记录',
      clear: '清空'
    },
    themes: {
      light: '浅色',
      dark: '深色'
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
      status: 'Status',
      time: 'Time',
      prettify: 'Prettify',
      copy: 'Copy',
      copySuccess: 'Copied',
      downloadSuccess: 'Download success',
      downloadError: 'Download failed',
      selectFileType: 'Select File Type',
      json: 'JSON',
      text: 'Text',
      binary: 'Binary',
      sendTip: 'Send Request'
    },
    history: {
      title: 'History',
      empty: 'No history',
      clear: 'Clear'
    },
    themes: {
      light: 'Light',
      dark: 'Dark'
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