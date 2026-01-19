/**
 * Checklist Scanner Page - Ant Design Implementation
 * PAPA + SMM Multi-Timeframe Analysis
 */

import { useState } from 'react'
import { 
  Card, Table, Select, Button, Space, Tag, Input, 
  Typography, Empty, Spin, Alert, Row, Col, AutoComplete, Grid
} from 'antd'
import { 
  ReloadOutlined, FileSearchOutlined, SearchOutlined, ArrowRightOutlined
} from '@ant-design/icons'
import { scanDowTheory } from '../api/scanner'
import StockAnalysis from './StockAnalysis'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const FILTERS = [
  { value: 'all', label: 'All Stocks' },
  { value: 'strong_buy', label: '🟢 Strong Buy' },
  { value: 'pullback_buy', label: '🟡 Pullback Buy' },
  { value: 'intraday_buy', label: '🔵 Intraday Buy' },
  { value: 'bearish', label: '🔴 Bearish' },
  { value: 'wait', label: '⚪ Wait / No Trade' },
]

const STOCK_LIST = [
  { value: 'RELIANCE', label: 'RELIANCE - Reliance Industries' },
  { value: 'TCS', label: 'TCS - Tata Consultancy Services' },
  { value: 'HDFCBANK', label: 'HDFCBANK - HDFC Bank' },
  { value: 'INFY', label: 'INFY - Infosys' },
  { value: 'ICICIBANK', label: 'ICICIBANK - ICICI Bank' },
  { value: 'HINDUNILVR', label: 'HINDUNILVR - Hindustan Unilever' },
  { value: 'SBIN', label: 'SBIN - State Bank of India' },
  { value: 'BHARTIARTL', label: 'BHARTIARTL - Bharti Airtel' },
  { value: 'ITC', label: 'ITC - ITC' },
  { value: 'KOTAKBANK', label: 'KOTAKBANK - Kotak Mahindra Bank' },
  { value: 'LT', label: 'LT - Larsen & Toubro' },
  { value: 'AXISBANK', label: 'AXISBANK - Axis Bank' },
  { value: 'ASIANPAINT', label: 'ASIANPAINT - Asian Paints' },
  { value: 'MARUTI', label: 'MARUTI - Maruti Suzuki' },
  { value: 'HCLTECH', label: 'HCLTECH - HCL Technologies' },
  { value: 'SUNPHARMA', label: 'SUNPHARMA - Sun Pharmaceutical' },
  { value: 'TITAN', label: 'TITAN - Titan Company' },
  { value: 'BAJFINANCE', label: 'BAJFINANCE - Bajaj Finance' },
  { value: 'WIPRO', label: 'WIPRO - Wipro' },
  { value: 'TATAMOTORS', label: 'TATAMOTORS - Tata Motors' },
]

const getTrendEmoji = (trend) => {
  if (!trend) return '⚪'
  if (trend === 'HH-HL') return '🟢'
  if (trend === 'LL-LH') return '🔴'
  if (trend === 'LL→HL') return '🟡'
  if (trend === 'HH→LH') return '🟠'
  return '⚪'
}

const getTrendColor = (color) => {
  const colorMap = {
    green: 'green',
    lightgreen: 'lime',
    red: 'red',
    orange: 'orange',
    yellow: 'gold',
    gray: 'default',
  }
  return colorMap[color] || 'default'
}

const getTrendLabel = (tf) => {
  if (!tf) return '-'
  const high = tf.last_high_label || '-'
  const low = tf.last_low_label || '-'
  return `${high}/${low}`
}

const DowTheoryScanner = () => {
  const screens = useBreakpoint()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('all')
  const [symbolInput, setSymbolInput] = useState('')
  const [viewMode, setViewMode] = useState('scanner')
  const [selectedStock, setSelectedStock] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await scanDowTheory('nifty50', filter, null, 50)
      setData(result)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const analyzeSymbol = (value) => {
    const symbol = (value || symbolInput).trim().toUpperCase()
    if (symbol) {
      setSelectedStock(symbol)
      setViewMode('analysis')
    }
  }

  const backToScanner = () => {
    setViewMode('scanner')
    setSelectedStock(null)
    setSymbolInput('')
  }

  if (viewMode === 'analysis' && selectedStock) {
    return <StockAnalysis symbol={selectedStock} onBack={backToScanner} />
  }

  // Table columns
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: 'Stock',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      fixed: screens.md ? false : 'left',
      render: (symbol) => <Text strong>{symbol}</Text>,
    },
    {
      title: 'M',
      key: 'monthly',
      align: 'center',
      width: 80,
      render: (_, record) => {
        const tf = record.timeframes?.monthly
        return (
          <Tag color={getTrendColor(tf?.color)}>
            {getTrendEmoji(tf?.trend)} {getTrendLabel(tf)}
          </Tag>
        )
      },
    },
    {
      title: 'W',
      key: 'weekly',
      align: 'center',
      width: 80,
      render: (_, record) => {
        const tf = record.timeframes?.weekly
        return (
          <Tag color={getTrendColor(tf?.color)}>
            {getTrendEmoji(tf?.trend)} {getTrendLabel(tf)}
          </Tag>
        )
      },
    },
    {
      title: 'D',
      key: 'daily',
      align: 'center',
      width: 80,
      render: (_, record) => {
        const tf = record.timeframes?.daily
        return (
          <Tag color={getTrendColor(tf?.color)}>
            {getTrendEmoji(tf?.trend)} {getTrendLabel(tf)}
          </Tag>
        )
      },
    },
    {
      title: '4H',
      key: '4h',
      align: 'center',
      width: 80,
      render: (_, record) => {
        const tf = record.timeframes?.['4h']
        return (
          <Tag color={getTrendColor(tf?.color)}>
            {getTrendEmoji(tf?.trend)} {getTrendLabel(tf)}
          </Tag>
        )
      },
    },
    {
      title: '1H',
      key: '1h',
      align: 'center',
      width: 80,
      render: (_, record) => {
        const tf = record.timeframes?.['1h']
        return (
          <Tag color={getTrendColor(tf?.color)}>
            {getTrendEmoji(tf?.trend)} {getTrendLabel(tf)}
          </Tag>
        )
      },
    },
    {
      title: 'Opportunity',
      dataIndex: 'opportunity',
      key: 'opportunity',
      width: 140,
      render: (opp) => (
        <Tag color={getTrendColor(opp?.color)}>
          {opp?.type || '-'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<ArrowRightOutlined />} 
          onClick={() => analyzeSymbol(record.symbol)}
        />
      ),
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center">
            <FileSearchOutlined style={{ fontSize: 28, color: '#fa8c16' }} />
            <div>
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                Checklist Scanner
              </Title>
              <Text type="secondary">
                PAPA + SMM Multi-Timeframe Analysis
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          {/* Symbol Search */}
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>ANALYZE SYMBOL</Text>
              <Space.Compact style={{ width: '100%' }}>
                <AutoComplete
                  value={symbolInput}
                  onChange={setSymbolInput}
                  onSelect={analyzeSymbol}
                  options={STOCK_LIST.filter(s => 
                    s.value.includes(symbolInput.toUpperCase()) || 
                    s.label.toUpperCase().includes(symbolInput.toUpperCase())
                  )}
                  placeholder="Type symbol..."
                  style={{ flex: 1 }}
                  size={screens.md ? 'middle' : 'large'}
                />
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  onClick={() => analyzeSymbol()}
                  disabled={!symbolInput.trim()}
                  size={screens.md ? 'middle' : 'large'}
                >
                  {screens.md ? 'Analyze' : ''}
                </Button>
              </Space.Compact>
            </Space>
          </Col>

          <Col xs={0} sm={2} md={2}>
            <div style={{ textAlign: 'center', paddingTop: 20 }}>
              <Text type="secondary">OR</Text>
            </div>
          </Col>

          {/* Filter */}
          <Col xs={12} sm={5} md={6}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>FILTER</Text>
              <Select
                value={filter}
                onChange={setFilter}
                options={FILTERS}
                style={{ width: '100%' }}
                size={screens.md ? 'middle' : 'large'}
              />
            </Space>
          </Col>

          {/* Scan Button */}
          <Col xs={12} sm={5} md={6}>
            <div style={{ marginTop: screens.md ? 20 : 0 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined spin={loading} />}
                onClick={fetchData}
                loading={loading}
                size={screens.md ? 'middle' : 'large'}
                block
              >
                {loading ? 'Scanning...' : 'Scan Nifty 50'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Scanning all timeframes...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && !data && (
        <Card>
          <Empty
            description={
              <Space direction="vertical" size={4}>
                <Text>No data loaded</Text>
                <Text type="secondary">Click "Scan Nifty 50" or enter a symbol to analyze</Text>
              </Space>
            }
          />
        </Card>
      )}

      {/* Results Table */}
      {!loading && data?.stocks && (
        <>
          <Card 
            title={`Found ${data.total} stocks`}
            extra={<Tag>{FILTERS.find(f => f.value === filter)?.label}</Tag>}
            bodyStyle={{ padding: screens.md ? 16 : 8 }}
          >
            <Table
              columns={columns}
              dataSource={data.stocks.map(s => ({ ...s, key: s.symbol }))}
              pagination={{ pageSize: 20, size: 'small' }}
              scroll={{ x: 700 }}
              size="small"
              onRow={(record) => ({
                onClick: () => analyzeSymbol(record.symbol),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>

          {/* Legend */}
          <Card size="small" style={{ marginTop: 16 }}>
            <Row justify="center" gutter={[16, 8]}>
              <Col><Text>🟢 HH-HL (Uptrend)</Text></Col>
              <Col><Text>🟡 LL→HL (Reversal Up)</Text></Col>
              <Col><Text>⚪ Sideways</Text></Col>
              <Col><Text>🟠 HH→LH (Reversal Down)</Text></Col>
              <Col><Text>🔴 LL-LH (Downtrend)</Text></Col>
            </Row>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                💡 Click any row for detailed analysis
              </Text>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default DowTheoryScanner
