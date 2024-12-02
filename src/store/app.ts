import { defineStore } from 'pinia'
import { themes } from '../styles/themes'
import { i18n } from '../i18n'

type Locale = 'zh-CN' | 'en-US'

interface AppState {
  theme: string
  locale: Locale
  layout: 'horizontal' | 'vertical'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => {
    const locale = (localStorage.getItem('locale') || 'zh-CN') as Locale
    i18n.global.locale.value = locale
    return {
      theme: localStorage.getItem('theme') || 'default',
      locale,
      layout: (localStorage.getItem('layout') || 'vertical') as 'horizontal' | 'vertical'
    }
  },

  actions: {
    setTheme(theme: string) {
      this.theme = theme
      localStorage.setItem('theme', theme)
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