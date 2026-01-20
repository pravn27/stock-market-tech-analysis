/**
 * Stock Market TA - Technical Analysis Platform
 * Main App Component with Ant Design
 */

import React, { useState } from 'react'
import { Layout } from 'antd'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Header from './components/Header'
import PerformanceOverview from './pages/PerformanceOverview'
import GlobalMarkets from './pages/GlobalMarkets'
import Commodity from './pages/Commodity'
import Nifty50 from './pages/Nifty50'
import BankNifty from './pages/BankNifty'
import SectorPerformance from './pages/SectorPerformance'
import SectorStocks from './pages/SectorStocks'
import DowTheoryScanner from './pages/DowTheoryScanner'
import './index.css'

const { Content, Footer } = Layout

const AppContent = () => {
  const [activePage, setActivePage] = useState('global')
  const { isDarkMode } = useTheme()

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
      case 'sectors':
        return <SectorPerformance />
      case 'stocks':
        return <SectorStocks />
      default:
        return <PerformanceOverview />
    }
  }

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
          padding: '24px',
          maxWidth: 1400,
          width: '100%',
          margin: '64px auto 0',
        }}
      >
        <div style={{ 
          padding: '0 16px',
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
          padding: '16px 24px',
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
