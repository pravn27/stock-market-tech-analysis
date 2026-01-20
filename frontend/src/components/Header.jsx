/**
 * Header Component - Ant Design Implementation
 * Professional navigation with theme toggle
 */

import React, { useState } from 'react'
import { Layout, Menu, Dropdown, Button, Space, Switch, Typography, Grid } from 'antd'
import {
  MenuOutlined,
  DownOutlined,
  LineChartOutlined,
  BarChartOutlined,
  GlobalOutlined,
  FileSearchOutlined,
  BulbOutlined,
  BulbFilled,
  StockOutlined,
  BankOutlined,
  FundOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const { Header: AntHeader } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

const AppHeader = ({ activePage, onPageChange }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const screens = useBreakpoint()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Performance dropdown items
  const performanceItems = [
    { key: 'overview', label: 'Relative Strength', icon: <LineChartOutlined /> },
    { key: 'nifty50', label: 'Nifty 50', icon: <StockOutlined /> },
    { key: 'banknifty', label: 'Bank Nifty', icon: <BankOutlined /> },
    { key: 'sectors', label: 'Sector Performance', icon: <FundOutlined /> },
    { key: 'stocks', label: 'Sector Stocks', icon: <AppstoreOutlined /> },
  ]

  const isPerformanceActive = performanceItems.some(item => item.key === activePage)

  const handleMenuClick = ({ key }) => {
    onPageChange(key)
    setMobileMenuOpen(false)
  }

  // Performance dropdown menu
  const performanceMenu = {
    items: performanceItems.map(item => ({
      key: item.key,
      label: (
        <Space>
          {item.icon}
          <span style={{ fontWeight: 600 }}>{item.label}</span>
        </Space>
      ),
    })),
    onClick: handleMenuClick,
    selectedKeys: [activePage],
  }

  // Mobile menu items
  const mobileMenuItems = [
    {
      key: 'performance-group',
      label: <span style={{ fontWeight: 600 }}>Performance</span>,
      type: 'group',
      children: performanceItems.map(item => ({
        key: item.key,
        label: <span style={{ fontWeight: 600 }}>{item.label}</span>,
        icon: item.icon,
      })),
    },
    {
      key: 'tools-group',
      label: <span style={{ fontWeight: 600 }}>Tools</span>,
      type: 'group',
      children: [
        { key: 'dow-scanner', label: <span style={{ fontWeight: 600 }}>Checklist Scanner</span>, icon: <FileSearchOutlined /> },
        { key: 'global', label: <span style={{ fontWeight: 600 }}>Global Market</span>, icon: <GlobalOutlined /> },
      ],
    },
  ]

  // Desktop navigation
  const renderDesktopNav = () => (
    <Space size="middle">
      <Dropdown menu={performanceMenu} trigger={['click']}>
        <Button 
          type={isPerformanceActive ? 'primary' : 'text'}
          icon={<BarChartOutlined />}
          style={{ fontWeight: 600 }}
        >
          Performance <DownOutlined style={{ fontSize: 10 }} />
        </Button>
      </Dropdown>

      <Button
        type={activePage === 'dow-scanner' ? 'primary' : 'text'}
        icon={<FileSearchOutlined />}
        onClick={() => onPageChange('dow-scanner')}
        style={{ fontWeight: 600 }}
      >
        Checklist
      </Button>

      <Button
        type={activePage === 'global' ? 'primary' : 'text'}
        icon={<GlobalOutlined />}
        onClick={() => onPageChange('global')}
        style={{ fontWeight: 600 }}
      >
        Global Market
      </Button>
    </Space>
  )

  // Mobile menu dropdown
  const mobileMenu = {
    items: mobileMenuItems,
    onClick: handleMenuClick,
    selectedKeys: [activePage],
    style: { minWidth: 200 },
  }

  return (
    <AntHeader
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: screens.md ? '0 24px' : '0 16px',
        height: 64,
        borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
        background: isDarkMode ? '#141414' : '#ffffff',
      }}
    >
      {/* Logo */}
      <div
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          cursor: 'pointer' 
        }}
        onClick={() => onPageChange('overview')}
      >
        <LineChartOutlined 
          style={{ 
            fontSize: 26, 
            color: '#1890ff' 
          }} 
        />
        <Text 
          strong 
          style={{ 
            fontSize: screens.md ? 18 : 15,
            whiteSpace: 'nowrap'
          }}
        >
          Stock Market <span style={{ color: '#1890ff' }}>TA</span>
        </Text>
      </div>

      {/* Desktop Navigation */}
      {screens.md && renderDesktopNav()}

      {/* Right Side - Theme Toggle & Mobile Menu */}
      <Space>
        {/* Theme Toggle */}
        <Button
          type="text"
          icon={isDarkMode ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />}
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        />

        {/* Mobile Menu */}
        {!screens.md && (
          <Dropdown 
            menu={mobileMenu} 
            trigger={['click']}
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
          >
            <Button type="text" icon={<MenuOutlined />} />
          </Dropdown>
        )}
      </Space>
    </AntHeader>
  )
}

export default AppHeader
