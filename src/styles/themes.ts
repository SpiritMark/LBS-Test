import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

export interface Theme {
  key: string
  name: string
  config: ThemeConfig
  style: {
    colorBgContainer: string
    colorBgLayout: string
    colorBgElevated: string
    colorPrimary: string
    colorText: string
    colorTextSecondary: string
    borderRadius: number
    boxShadow: string
    colorBorder: string
  }
}

export const themes: Theme[] = [
  {
    key: 'default',
    name: '默认主题',
    config: {
      token: {
        colorPrimary: '#2F54EB',
        borderRadius: 8
      }
    },
    style: {
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f5f5f5',
      colorBgElevated: '#ffffff',
      colorPrimary: '#2F54EB',
      colorText: 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      colorBorder: '#f0f0f0'
    }
  },
  {
    key: 'dark',
    name: '暗黑主题',
    config: {
      token: {
        colorPrimary: '#597ef7',
        borderRadius: 8
      },
      algorithm: 'dark'
    },
    style: {
      colorBgContainer: '#1f1f1f',
      colorBgLayout: '#141414',
      colorBgElevated: '#1f1f1f',
      colorPrimary: '#597ef7',
      colorText: 'rgba(255, 255, 255, 0.85)',
      colorTextSecondary: 'rgba(255, 255, 255, 0.45)',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
      colorBorder: '#303030'
    }
  },
  {
    key: 'purple',
    name: '紫色主题',
    config: {
      token: {
        colorPrimary: '#722ED1',
        borderRadius: 8
      }
    },
    style: {
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f9f0ff',
      colorBgElevated: '#ffffff',
      colorPrimary: '#722ED1',
      colorText: 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(114, 46, 209, 0.15)',
      colorBorder: '#f0f0f0'
    }
  },
  {
    key: 'green',
    name: '绿色主题',
    config: {
      token: {
        colorPrimary: '#13C2C2',
        borderRadius: 8
      }
    },
    style: {
      colorBgContainer: '#ffffff',
      colorBgLayout: '#e6fffb',
      colorBgElevated: '#ffffff',
      colorPrimary: '#13C2C2',
      colorText: 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(19, 194, 194, 0.15)',
      colorBorder: '#f0f0f0'
    }
  },
  {
    key: 'modern',
    name: '现代主题',
    config: {
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 16
      }
    },
    style: {
      colorBgContainer: '#ffffff',
      colorBgLayout: '#fafafa',
      colorBgElevated: '#ffffff',
      colorPrimary: '#1890ff',
      colorText: 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      colorBorder: '#f0f0f0'
    }
  }
]

export const getThemeConfig = (key: string): Theme => {
  return themes.find(theme => theme.key === key) || themes[0]
} 