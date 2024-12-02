# LBS Test - API 测试工具

一个基于 Electron + Vue 3 开发的现代化 API 测试工具，类似于 Postman 的功能实现。

## 功能特点

- 🚀 支持多种 HTTP 请求方法（GET, POST, PUT, DELETE 等）
- 📝 支持多种请求体格式
  - form-data
  - x-www-form-urlencoded
  - raw (JSON, Text, JavaScript, HTML, XML)
  - binary
  - GraphQL
- 🔍 内置 cURL 命令解析器
- 📦 请求历史记录管理
- 🎨 支持多种主题（浅色、深色、蓝色、绿色）
- 🌍 国际化支持（中文、英文）
- 💾 支持响应数据下载
- 🖥 跨平台支持 (macOS, Windows, Linux)

## 技术栈

- Electron
- Vue 3
- TypeScript
- Vite
- Ant Design Vue
- Pinia
- Axios

## 开发环境要求

- Node.js >= 16
- yarn >= 1.22.0

## 安装和运行

1. 克隆项目
```bash
git clone [项目地址]
cd lbs-test
```

2. 安装依赖
```bash
yarn install
```

3. 开发模式运行
```bash
yarn electron:dev
```

4. 构建应用
```bash
yarn electron:build
```

## 项目结构

```
lbs-test/
├── build/              # 构建资源目录
│   └── icons/         # 应用图标
├── electron/          # Electron 主进程
├── src/
│   ├── components/    # Vue 组件
│   ├── locales/       # 国际化文件
│   ├── store/         # Pinia 状态管理
│   ├── styles/        # 样式文件
│   ├── types/         # TypeScript 类型定义
│   └── utils/         # 工具函数
├── index.html         # 入口 HTML
└── package.json       # 项目配置
```

## 主要功能说明

### 请求发送
- 支持设置请求方法、URL、参数
- 可添加自定义请求头
- 支持多种请求体格式
- 内置格式化工具

### 响应展示
- 显示响应状态码和耗时
- JSON 数据自动格式化和高亮
- 支持响应数据下载
- 支持复制响应内容

### 历史记录
- 自动保存请求历史
- 支持历史记录搜索
- 可从历史记录加载请求
- 支持编辑和删除历史记录

### 其他功能
- cURL 命令解析
- 多主题切换
- 语言切换
- 布局调整

## 打包说明

支持打包为以下格式：
- macOS: DMG, ZIP
- Windows: NSIS 安装包
- Linux: AppImage, DEB

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
