import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh.json'
import enUS from '../locales/en.json'
import jaJP from '../locales/ja.json'
import koKR from '../locales/ko.json'

export const LOCALES = {
  'zh-CN': {
    name: '简体中文',
    icon: '🇨🇳'
  },
  'en-US': {
    name: 'English',
    icon: '🇺🇸'
  },
  'ja-JP': {
    name: '日本語',
    icon: '🇯🇵'
  },
  'ko-KR': {
    name: '한국어',
    icon: '🇰🇷'
  }
} as const

export type LocaleType = keyof typeof LOCALES

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP,
    'ko-KR': koKR
  }
}) 