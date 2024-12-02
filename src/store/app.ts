import { defineStore } from 'pinia'
import { ref } from 'vue'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

type LocaleType = 'zh-CN' | 'en-US'
type ThemeType = 'light' | 'dark'
type LayoutType = 'vertical' | 'horizontal'

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeType>('light')
  const layout = ref<LayoutType>('vertical')
  const locale = ref<LocaleType>('zh-CN')

  const currentLocale = () => locales[locale.value]

  const setTheme = (newTheme: ThemeType) => {
    theme.value = newTheme
  }

  const setLayout = (newLayout: LayoutType) => {
    layout.value = newLayout
  }

  const setLocale = (newLocale: LocaleType) => {
    locale.value = newLocale
  }

  return {
    theme,
    layout,
    locale,
    currentLocale,
    setTheme,
    setLayout,
    setLocale,
  }
}) 