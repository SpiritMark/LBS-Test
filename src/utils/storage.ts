export interface UserSettings {
  theme: string
  language: string
  layout: string
  sidebarCollapsed: boolean
  editor: {
    fontSize: number
  }
}

const STORAGE_KEYS = {
  SETTINGS: 'lbs_settings'
} as const

class StorageManager {
  private storage: Storage

  constructor(storage: Storage = localStorage) {
    this.storage = storage
  }

  // 用户设置相关
  getSettings(): UserSettings {
    const data = this.storage.getItem(STORAGE_KEYS.SETTINGS)
    const defaultSettings: UserSettings = {
      theme: 'light',
      language: 'zh-CN',
      layout: 'default',
      sidebarCollapsed: false,
      editor: {
        fontSize: 14
      }
    }
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  }

  saveSettings(settings: Partial<UserSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    this.storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings))
  }

  // 清除所有数据
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.storage.removeItem(key)
    })
  }
}

export const storageManager = new StorageManager() 