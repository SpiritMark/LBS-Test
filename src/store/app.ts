import { defineStore } from 'pinia'
import { themes } from '../styles/themes'
import { i18n } from '../i18n'
import type { Theme } from '../styles/themes'

export type Locale = 'zh-CN' | 'en-US'

interface AppState {
  theme: string
  locale: Locale
  layout: 'horizontal' | 'vertical'
  customTheme: Theme | null
}

export const useAppStore = defineStore('app', {
  state: (): AppState => {
    const locale = (localStorage.getItem('locale') || 'zh-CN') as Locale
    i18n.global.locale.value = locale
    
    let customTheme: Theme | null = null
    try {
      const savedTheme = localStorage.getItem('custom-theme')
      if (savedTheme) {
        customTheme = JSON.parse(savedTheme)
      }
    } catch (error) {
      console.error('Failed to load custom theme:', error)
    }
    
    return {
      theme: localStorage.getItem('theme') || 'default',
      locale,
      layout: (localStorage.getItem('layout') || 'vertical') as 'horizontal' | 'vertical',
      customTheme
    }
  },

  actions: {
    setTheme(theme: string) {
      this.theme = theme
      localStorage.setItem('theme', theme)
    },

    setCustomTheme(theme: Theme) {
      this.customTheme = theme
      this.theme = 'custom'
      localStorage.setItem('custom-theme', JSON.stringify(theme))
      localStorage.setItem('theme', 'custom')
    },

    setLocale(locale: Locale) {
      this.locale = locale
      localStorage.setItem('locale', locale)
      i18n.global.locale.value = locale
    },

    setLayout(layout: 'horizontal' | 'vertical') {
      this.layout = layout
      localStorage.setItem('layout', layout)
    }
  }
}) 