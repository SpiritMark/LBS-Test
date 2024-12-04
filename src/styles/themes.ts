import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import { theme } from 'ant-design-vue'

// 辅助函数：转换颜色为 RGBA
export const hexToRgba = (hex: string, alpha: number): string => {
  try {
    const color = String(hex).replace('#', '')
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  } catch (e) {
    console.warn('Invalid color value:', hex)
    return 'rgba(0, 0, 0, 0.1)'
  }
}

// 辅助函数：确保颜色值是有效的十六进制颜色
const normalizeColor = (color: string | null | undefined): string => {
  if (!color) return '#1890ff'
  try {
    const normalized = String(color).toLowerCase()
    if (normalized.startsWith('#') && normalized.length === 7) {
      return normalized
    }
    if (normalized.startsWith('#') && normalized.length === 4) {
      const r = normalized[1]
      const g = normalized[2]
      const b = normalized[3]
      return `#${r}${r}${g}${g}${b}${b}`
    }
    return '#1890ff'
  } catch (e) {
    console.warn('Invalid color value:', color)
    return '#1890ff'
  }
}

// 主题配置接口
export interface ThemeOptions {
  key?: string
  name?: string
  colorPrimary: string
  colorBg: string
  colorBgLayout: string
  isDark?: boolean
  style?: Partial<Theme['style']>
}

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
    colorBorder: string
    colorBgBlur: string
    colorBgGlass: string
    borderRadius: number
    backdropFilter: string
    motionDurationSlow: string
    motionEaseInOut: string
    boxShadow: string
    boxShadowSecondary: string
    boxShadowTertiary: string
  }
}

// 主题配置生成器
const createThemeConfig = (options: ThemeOptions): Theme => {
  const { colorPrimary, colorBg, colorBgLayout, isDark = false, style = {}, key, name } = options
  const baseStyle = isDark ? {
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.45)',
    colorBorder: '#303030',
    colorBgBlur: 'rgba(0, 0, 0, 0.8)',
    colorBgGlass: 'rgba(255, 255, 255, 0.05)',
    boxShadow: `0 8px 24px ${hexToRgba(colorPrimary, 0.2)}`,
    boxShadowSecondary: `0 12px 24px ${hexToRgba(colorPrimary, 0.3)}`,
    boxShadowTertiary: `0 20px 32px ${hexToRgba(colorPrimary, 0.4)}`
  } : {
    colorText: 'rgba(0, 0, 0, 0.85)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
    colorBorder: '#f0f0f0',
    colorBgBlur: 'rgba(255, 255, 255, 0.8)',
    colorBgGlass: hexToRgba(colorPrimary, 0.1),
    boxShadow: `0 8px 24px ${hexToRgba(colorPrimary, 0.12)}`,
    boxShadowSecondary: `0 12px 24px ${hexToRgba(colorPrimary, 0.16)}`,
    boxShadowTertiary: `0 20px 32px ${hexToRgba(colorPrimary, 0.2)}`
  }

  return {
    key: key || 'custom',
    name: name || '自定义主题',
    config: {
      token: {
        colorPrimary,
        borderRadius: 8,
        colorBgContainer: colorBg,
        colorBgElevated: colorBg,
        colorBgLayout
      },
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm
    },
    style: {
      colorBgContainer: colorBg,
      colorBgLayout,
      colorBgElevated: colorBg,
      colorPrimary,
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
      motionDurationSlow: '0.3s',
      motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      ...baseStyle,
      ...style
    }
  }
}

// 预设主题列表
export const themes: Theme[] = [
  createThemeConfig({
    key: 'default',
    name: '默认主题',
    colorPrimary: '#1890ff',
    colorBg: '#ffffff',
    colorBgLayout: '#f5f5f5'
  }),
  createThemeConfig({
    key: 'dark',
    name: '暗黑主题',
    colorPrimary: '#177ddc',
    colorBg: '#1f1f1f',
    colorBgLayout: '#141414',
    isDark: true
  }),
  createThemeConfig({
    key: 'cyberpunk',
    name: '赛博朋克',
    colorPrimary: '#f542e6',
    colorBg: '#0c0c1f',
    colorBgLayout: '#06061a',
    isDark: true,
    style: {
      colorText: '#00ffff',
      colorTextSecondary: '#ff00ff',
      colorBorder: '#2a1f6d',
      colorBgBlur: 'rgba(12, 12, 31, 0.8)',
      colorBgGlass: 'rgba(245, 66, 230, 0.1)',
      boxShadow: '0 8px 24px rgba(245, 66, 230, 0.2)',
      boxShadowSecondary: '0 12px 24px rgba(0, 255, 255, 0.2)'
    }
  }),
  createThemeConfig({
    key: 'volcano',
    name: '火山主题',
    colorPrimary: '#fa541c',
    colorBg: '#2b1d1d',
    colorBgLayout: '#1f1414',
    isDark: true,
    style: {
      colorBgBlur: 'rgba(43, 29, 29, 0.8)',
      colorBgGlass: 'rgba(250, 84, 28, 0.1)',
      boxShadow: '0 8px 24px rgba(250, 84, 28, 0.2)'
    }
  }),
  createThemeConfig({
    key: 'geekblue',
    name: '极客蓝',
    colorPrimary: '#2f54eb',
    colorBg: '#f0f5ff',
    colorBgLayout: '#e6f7ff',
    style: {
      colorBgBlur: 'rgba(240, 245, 255, 0.8)',
      colorBgGlass: 'rgba(47, 84, 235, 0.1)',
      boxShadow: '0 8px 24px rgba(47, 84, 235, 0.15)'
    }
  }),
  createThemeConfig({
    key: 'forest',
    name: '森林主题',
    colorPrimary: '#52c41a',
    colorBg: '#162312',
    colorBgLayout: '#0f1a0c',
    isDark: true,
    style: {
      colorBgBlur: 'rgba(22, 35, 18, 0.8)',
      colorBgGlass: 'rgba(82, 196, 26, 0.1)',
      boxShadow: '0 8px 24px rgba(82, 196, 26, 0.2)'
    }
  }),
  createThemeConfig({
    key: 'magenta',
    name: '马젠塔',
    colorPrimary: '#eb2f96',
    colorBg: '#291321',
    colorBgLayout: '#1f0f19',
    isDark: true,
    style: {
      colorBgBlur: 'rgba(41, 19, 33, 0.8)',
      colorBgGlass: 'rgba(235, 47, 150, 0.1)',
      boxShadow: '0 8px 24px rgba(235, 47, 150, 0.2)'
    }
  }),
  createThemeConfig({
    key: 'yellow',
    name: '明黄主题',
    colorPrimary: '#faad14',
    colorBg: '#fff7e6',
    colorBgLayout: '#fff1d6',
    style: {
      colorBgBlur: 'rgba(255, 247, 230, 0.8)',
      colorBgGlass: 'rgba(250, 173, 20, 0.1)',
      boxShadow: '0 8px 24px rgba(250, 173, 20, 0.15)'
    }
  }),
  createThemeConfig({
    key: 'ocean',
    name: '深海主题',
    colorPrimary: '#13c2c2',
    colorBg: '#162329',
    colorBgLayout: '#0f1a1f',
    isDark: true,
    style: {
      colorBgBlur: 'rgba(22, 35, 41, 0.8)',
      colorBgGlass: 'rgba(19, 194, 194, 0.1)',
      boxShadow: '0 8px 24px rgba(19, 194, 194, 0.2)'
    }
  })
]

// 获取主题配置
export const getThemeConfig = (key: string): Theme => {
  return themes.find(theme => theme.key === key) || themes[0]
}

// 创建自定义主题
export const createCustomTheme = (color: string | null | undefined, isDark = false): Theme => {
  const baseColor = normalizeColor(color)
  const alpha = isDark ? 0.8 : 0.1
  const colorBg = isDark ? '#1f1f1f' : '#ffffff'
  const colorBgLayout = isDark ? '#141414' : '#f5f5f5'

  return createThemeConfig({
    key: 'custom',
    name: '自定义主题',
    colorPrimary: baseColor,
    colorBg,
    colorBgLayout,
    isDark,
    style: {
      colorBgBlur: isDark ? 'rgba(0, 0, 0, 0.8)' : hexToRgba(baseColor, 0.05),
      colorBgGlass: isDark ? hexToRgba(baseColor, 0.1) : hexToRgba(baseColor, 0.08),
      boxShadow: `0 8px 24px ${hexToRgba(baseColor, alpha)}`,
      boxShadowSecondary: `0 12px 24px ${hexToRgba(baseColor, alpha + 0.1)}`,
      boxShadowTertiary: `0 20px 32px ${hexToRgba(baseColor, alpha + 0.2)}`,
      colorBorder: isDark ? hexToRgba(baseColor, 0.2) : hexToRgba(baseColor, 0.1)
    }
  })
} 