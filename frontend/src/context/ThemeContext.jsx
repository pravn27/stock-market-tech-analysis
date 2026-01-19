/**
 * Theme Context - Manages light/dark theme switching
 * Default theme: light (V4 Blue Theme)
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Default to light theme, check localStorage for saved preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  // Update localStorage and body class when theme changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    document.body.classList.toggle('dark', isDarkMode)
    
    // Update body background
    document.body.style.backgroundColor = isDarkMode ? '#141414' : '#f0f2f5'
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  // Ant Design V4 Blue Theme Configuration
  const antTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // V4 Blue Primary Color
      colorPrimary: '#1890ff',
      colorLink: '#1890ff',
      colorLinkHover: '#40a9ff',
      colorLinkActive: '#096dd9',
      
      // Border radius (V4 style - 2px consistent)
      borderRadius: 2,
      borderRadiusLG: 2,
      borderRadiusSM: 2,
      borderRadiusXS: 2,
      
      // Font
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: 14,
      
      // Colors for financial data
      colorSuccess: '#52c41a',
      colorError: '#ff4d4f',
      colorWarning: '#faad14',
      colorInfo: '#1890ff',
      
      // Background colors
      colorBgContainer: isDarkMode ? '#141414' : '#ffffff',
      colorBgElevated: isDarkMode ? '#1f1f1f' : '#ffffff',
      colorBgLayout: isDarkMode ? '#000000' : '#f0f2f5',
      
      // Text colors
      colorText: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      colorTextSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      
      // Border
      colorBorder: isDarkMode ? '#303030' : '#d9d9d9',
      colorBorderSecondary: isDarkMode ? '#303030' : '#f0f0f0',
    },
    components: {
      Layout: {
        headerBg: isDarkMode ? '#141414' : '#ffffff',
        bodyBg: isDarkMode ? '#000000' : '#f0f2f5',
        siderBg: isDarkMode ? '#141414' : '#ffffff',
        headerHeight: 64,
        headerPadding: '0 24px',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: isDarkMode ? '#111b26' : '#e6f7ff',
        itemSelectedColor: '#1890ff',
        itemHoverBg: isDarkMode ? '#1f1f1f' : '#f5f5f5',
      },
      Button: {
        primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
        defaultBorderColor: isDarkMode ? '#434343' : '#d9d9d9',
      },
      Table: {
        headerBg: isDarkMode ? '#1d1d1d' : '#fafafa',
        headerColor: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
        rowHoverBg: isDarkMode ? '#262626' : '#fafafa',
        borderColor: isDarkMode ? '#303030' : '#f0f0f0',
      },
      Card: {
        colorBgContainer: isDarkMode ? '#141414' : '#ffffff',
        boxShadow: isDarkMode ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      Select: {
        optionSelectedBg: isDarkMode ? '#111b26' : '#e6f7ff',
      },
      Input: {
        activeBorderColor: '#1890ff',
        hoverBorderColor: '#40a9ff',
      },
      Tag: {
        defaultBg: isDarkMode ? '#1f1f1f' : '#fafafa',
      },
      Statistic: {
        titleFontSize: 14,
        contentFontSize: 24,
      },
      Progress: {
        defaultColor: '#1890ff',
      },
    },
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={antTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContext
