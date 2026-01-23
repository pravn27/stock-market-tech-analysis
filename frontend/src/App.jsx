/**
 * Stock Market TA - Technical Analysis Platform
 * Main App Component with Ant Design and React Router
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Grid } from 'antd'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Header from './components/Header'
import PerformanceOverview from './pages/PerformanceOverview'
import GlobalMarkets from './pages/GlobalMarkets'
import Commodity from './pages/Commodity'
import Nifty50 from './pages/Nifty50'
import BankNifty from './pages/BankNifty'
import DowTheoryScanner from './pages/DowTheoryScanner'
import SectorStockDetail from './pages/SectorStockDetail'
import './index.css'

const { Content, Footer } = Layout
const { useBreakpoint } = Grid

const AppContent = () => {
  const { isDarkMode } = useTheme()
  const screens = useBreakpoint()

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
      <Header />
      
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
          <Routes>
            {/* Default route - redirect to global market */}
            <Route path="/stock-market-tech-analysis" element={<Navigate to="/stock-market-tech-analysis/global-market" replace />} />
            
            {/* Global Markets */}
            <Route path="/stock-market-tech-analysis/global-market" element={<GlobalMarkets />} />
            
            {/* Commodity */}
            <Route path="/stock-market-tech-analysis/commodity" element={<Commodity />} />
            
            {/* India Market Routes */}
            <Route path="/stock-market-tech-analysis/india/relative-performance" element={<PerformanceOverview />} />
            <Route path="/stock-market-tech-analysis/india/sector/:sectorSymbol" element={<SectorStockDetail />} />
            <Route path="/stock-market-tech-analysis/india/nifty-50" element={<Nifty50 />} />
            <Route path="/stock-market-tech-analysis/india/bank-nifty" element={<BankNifty />} />
            
            {/* Checklist Scanner */}
            <Route path="/stock-market-tech-analysis/checklist-scanner" element={<DowTheoryScanner />} />
            
            {/* Catch all - redirect unknown routes to global market */}
            <Route path="*" element={<Navigate to="/stock-market-tech-analysis/global-market" replace />} />
          </Routes>
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
  <BrowserRouter>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </BrowserRouter>
)

export default App
