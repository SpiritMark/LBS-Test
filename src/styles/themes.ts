import { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

export const themes: Record<string, ThemeConfig> = {
  light: {
    token: {
      colorPrimary: '#2F54EB',
      colorInfo: '#2F54EB',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      borderRadius: 8,
      wireframe: false,
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      colorTextBase: '#1f1f1f',
    },
  },
  dark: {
    token: {
      colorPrimary: '#2F54EB',
      colorInfo: '#2F54EB',
      colorBgContainer: '#1a1a1a',
      colorBgElevated: '#242424',
      colorText: '#ffffff',
      colorTextSecondary: 'rgba(255, 255, 255, 0.75)',
      borderRadius: 8,
      wireframe: false,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
  },
  blue: {
    token: {
      colorPrimary: '#2F54EB',
      colorInfo: '#2F54EB',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      borderRadius: 8,
      wireframe: false,
      colorBgContainer: '#f0f5ff',
      colorBgElevated: '#ffffff',
      boxShadow: '0 4px 12px rgba(47, 84, 235, 0.1)',
      colorTextBase: '#1f1f1f',
    },
  },
  green: {
    token: {
      colorPrimary: '#52c41a',
      colorInfo: '#52c41a',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      borderRadius: 8,
      wireframe: false,
      colorBgContainer: '#f6ffed',
      colorBgElevated: '#ffffff',
      boxShadow: '0 4px 12px rgba(82, 196, 26, 0.1)',
      colorTextBase: '#1f1f1f',
    },
  },
} 