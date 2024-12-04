import { defineStore } from 'pinia'
import { ref } from 'vue'
import { themes, type Theme, getThemeConfig, createCustomTheme } from '../styles/themes'
import { i18n } from '../i18n'

export type LocaleType = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'
export type LayoutType = 'horizontal' | 'vertical'

export const useAppStore = defineStore('app', () => {
  // 从 localStorage 获取设置
  const savedTheme = localStorage.getItem('theme') || 'default'
  const savedCustomColor = localStorage.getItem('customThemeColor')
  const savedLocale = (localStorage.getItem('locale') || 'zh-CN') as LocaleType
  const savedLayout = (localStorage.getItem('layout') || 'vertical') as LayoutType
  const savedIsDark = localStorage.getItem('isDark') === 'true'
  
  // 状态定义
  const theme = ref(savedTheme)
  const customThemeColor = ref(savedCustomColor || '#1890ff')
  const currentTheme = ref<Theme>(getThemeConfig(savedTheme))
  const locale = ref<LocaleType>(savedLocale)
  const layout = ref<LayoutType>(savedLayout)
  const isDark = ref(savedIsDark)

  // 应用主题样式
  const applyThemeStyles = (themeConfig: Theme) => {
    // 更新 document 的 data-theme 属性
    document.documentElement.setAttribute('data-theme', themeConfig.style.colorBgContainer === '#1f1f1f' ? 'dark' : 'default')
    
    // 应用 CSS 变量
    Object.entries(themeConfig.style).forEach(([key, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(`--${key}`, value)
      } else if (typeof value === 'number') {
        document.documentElement.style.setProperty(`--${key}`, `${value}px`)
      }
    })
  }

  // 设置主题
  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    currentTheme.value = getThemeConfig(newTheme)
    localStorage.setItem('theme', newTheme)
    applyThemeStyles(currentTheme.value)
  }

  // 设置自定义主题
  const setCustomTheme = async (color: string, dark = false) => {
    customThemeColor.value = color
    isDark.value = dark
    localStorage.setItem('customThemeColor', color)
    localStorage.setItem('isDark', dark.toString())
    
    // 创建并应用自定义主题
    const customTheme = createCustomTheme(color, dark)
    currentTheme.value = customTheme
    theme.value = 'custom'
    localStorage.setItem('theme', 'custom')
    applyThemeStyles(customTheme)
  }

  // 设置语言
  const setLocale = (newLocale: LocaleType) => {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
    i18n.global.locale.value = newLocale
  }

  // 设置布局
  const setLayout = (newLayout: LayoutType) => {
    layout.value = newLayout
    localStorage.setItem('layout', newLayout)
  }

  // 重置主题
  const resetTheme = () => {
    setTheme('default')
    customThemeColor.value = '#1890ff'
    isDark.value = false
    localStorage.removeItem('customThemeColor')
    localStorage.removeItem('isDark')
  }

  // 初始化主题
  const initTheme = () => {
    if (savedCustomColor) {
      setCustomTheme(savedCustomColor, savedIsDark)
    } else {
      setTheme(theme.value)
    }
    setLocale(locale.value)
  }

  return {
    theme,
    customThemeColor,
    currentTheme,
    locale,
    layout,
    isDark,
    setTheme,
    setCustomTheme,
    setLocale,
    setLayout,
    resetTheme,
    initTheme
  }
}) 