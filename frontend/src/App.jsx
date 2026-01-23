/**
 * Stock Market TA - Technical Analysis Platform
 * Main App Component with Ant Design
 */

import React, { useState } from 'react'
import { Layout, Grid } from 'antd'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Header from './components/Header'
import PerformanceOverview from './pages/PerformanceOverview'
import GlobalMarkets from './pages/GlobalMarkets'
import Commodity from './pages/Commodity'
import Nifty50 from './pages/Nifty50'
import BankNifty from './pages/BankNifty'
import DowTheoryScanner from './pages/DowTheoryScanner'
import './index.css'

const { Content, Footer } = Layout
const { useBreakpoint } = Grid

const AppContent = () => {
  const [activePage, setActivePage] = useState('global')
  const { isDarkMode } = useTheme()
  const screens = useBreakpoint()

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <PerformanceOverview />
      case 'dow-scanner':
        return <DowTheoryScanner />
      case 'global':
        return <GlobalMarkets />
      case 'commodity':
        return <Commodity />
      case 'nifty50':
        return <Nifty50 />
      case 'banknifty':
        return <BankNifty />
      default:
        return <PerformanceOverview />
    }
  }

  // Responsive padding: small on mobile, larger on desktop
  const contentPadding = screens.md ? '24px' : '12px'
  const innerPadding = screens.md ? '0 16px' : '0'

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0a0a0a' : '#f5f5f5'
      }}
    >
      <Header activePage={activePage} onPageChange={setActivePage} />

      <Content
        style={{
          marginTop: 64, // Header height
          padding: contentPadding,
          maxWidth: 1400,
          width: '100%',
          margin: '64px auto 0',
        }}
      >
        <div style={{
          padding: innerPadding,
          maxWidth: '100%',
        }}>
          {renderPage()}
        </div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: 'transparent',
          color: isDarkMode ? '#666' : '#999',
          padding: screens.md ? '16px 24px' : '16px 12px',
        }}
      >
        StockMarket TA — Technical Analysis Platform
      </Footer>
    </Layout>
  )
}

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
)

export default App
