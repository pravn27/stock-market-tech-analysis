/**
 * Global Markets Page - Ant Design Implementation
 * Shows global market indices in card layout grouped by region
 */

import { useState, useEffect } from 'react'
import { 
  Card, Select, Button, Space, Tag, Typography, Table,
  Empty, Spin, Alert, Row, Col, Statistic, Progress, Grid, Segmented
} from 'antd'
import { 
  ReloadOutlined, GlobalOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, RiseOutlined, FallOutlined,
  AppstoreOutlined, TableOutlined
} from '@ant-design/icons'
import { getGlobalMarkets } from '../api/scanner'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: '3m', label: '3 Month' },
]

// Market group configurations
const MARKET_GROUPS = [
  { key: 'us_markets', title: 'US Markets', emoji: '🇺🇸' },
  { key: 'european_markets', title: 'European Markets', emoji: '🇪🇺' },
  { key: 'asian_markets', title: 'Asian Markets', emoji: '🌏' },
  { key: 'india_adrs', title: 'India ADRs', emoji: '🇮🇳' },
]

const GlobalMarkets = () => {
  const screens = useBreakpoint()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [viewMode, setViewMode] = useState('cards')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getGlobalMarkets(timeframe)
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to fetch global markets data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeframe])

  // Flatten all market groups for sentiment calculation
  const allIndices = data ? [
    ...(data.us_markets || []),
    ...(data.european_markets || []),
    ...(data.asian_markets || []),
    ...(data.india_adrs || []),
  ] : []

  // Calculate sentiment
  const sentiment = allIndices.reduce((acc, idx) => {
    if (idx.change_pct > 0) acc.bullish++
    else if (idx.change_pct < 0) acc.bearish++
    else acc.neutral++
    return acc
  }, { bullish: 0, bearish: 0, neutral: 0 })

  const total = sentiment.bullish + sentiment.bearish + sentiment.neutral
  const bullishPercent = total > 0 ? Math.round((sentiment.bullish / total) * 100) : 0

  // Table columns for table view
  const tableColumns = [
    {
      title: 'Index',
      dataIndex: 'short',
      key: 'short',
      width: 100,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{short || record.name?.split(' ')[0]}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 120,
      render: (price) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
        </Text>
      ),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      align: 'right',
      width: 100,
      render: (change) => {
        if (change === null || change === undefined) return '-'
        const color = change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#999'
        const sign = change > 0 ? '+' : ''
        return (
          <Text style={{ color, fontFamily: 'monospace' }}>
            {sign}{change?.toFixed(2)}
          </Text>
        )
      },
    },
    {
      title: 'Change %',
      dataIndex: 'change_pct',
      key: 'change_pct',
      align: 'center',
      width: 110,
      sorter: (a, b) => (a.change_pct || 0) - (b.change_pct || 0),
      render: (pct) => {
        if (pct === null || pct === undefined) return '-'
        const color = pct > 0 ? 'green' : pct < 0 ? 'red' : 'default'
        const sign = pct > 0 ? '+' : ''
        const Icon = pct > 0 ? ArrowUpOutlined : pct < 0 ? ArrowDownOutlined : null
        return (
          <Tag color={color} style={{ minWidth: 80, textAlign: 'center' }}>
            {Icon && <Icon />} {sign}{pct?.toFixed(2)}%
          </Tag>
        )
      },
    },
  ]

  // Render table view for a market group
  const renderMarketTable = (group) => {
    const markets = data?.[group.key] || []
    if (markets.length === 0) return null

    return (
      <div key={group.key} style={{ marginBottom: 24 }}>
        <Card 
          title={
            <Space>
              <span style={{ fontSize: 18 }}>{group.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{group.title}</span>
            </Space>
          }
          size="small"
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={tableColumns}
            dataSource={markets.map((m, i) => ({ ...m, key: i }))}
            pagination={false}
            size="small"
            scroll={{ x: 500 }}
          />
        </Card>
      </div>
    )
  }

  // Render individual market card
  const renderMarketCard = (market) => {
    const isPositive = market.change_pct > 0
    const isNegative = market.change_pct < 0
    const changeColor = isPositive ? '#52c41a' : isNegative ? '#ff4d4f' : '#999'
    const sign = isPositive ? '+' : ''

    return (
      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={market.symbol}>
        <Card 
          size="small" 
          hoverable
          style={{ 
            borderLeft: `3px solid ${changeColor}`,
            height: '100%'
          }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Text strong style={{ fontSize: 14, display: 'block' }}>
            {market.short || market.name?.split(' ')[0]}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: 600, display: 'block', marginTop: 4 }}>
            {market.price?.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) || '-'}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text style={{ color: changeColor, fontSize: 13, fontFamily: 'monospace' }}>
              {sign}{market.change?.toFixed(2) || '0.00'}
            </Text>
            <Text style={{ color: changeColor, fontSize: 13, fontFamily: 'monospace', marginLeft: 8 }}>
              {sign}{market.change_pct?.toFixed(2) || '0.00'}%
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
            {market.name}
          </Text>
        </Card>
      </Col>
    )
  }

  // Render a market group section
  const renderMarketGroup = (group) => {
    const markets = data?.[group.key] || []
    if (markets.length === 0) return null

    return (
      <div key={group.key} style={{ marginBottom: 24 }}>
        <Card 
          title={
            <Space>
              <span style={{ fontSize: 18 }}>{group.emoji}</span>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{group.title}</span>
            </Space>
          }
          size="small"
          bodyStyle={{ padding: 16 }}
        >
          <Row gutter={[12, 12]}>
            {markets.map(market => renderMarketCard(market))}
          </Row>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center">
            <GlobalOutlined style={{ fontSize: 28, color: '#1890ff' }} />
            <div>
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                Global Markets
              </Title>
              <Text type="secondary">
                World indices & market sentiment
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Space wrap>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'cards', icon: <AppstoreOutlined />, label: 'Cards' },
                  { value: 'table', icon: <TableOutlined />, label: 'Table' },
                ]}
              />
              <Select
                value={timeframe}
                onChange={setTimeframe}
                options={TIMEFRAMES}
                style={{ width: 120 }}
                size={screens.md ? 'middle' : 'large'}
              />
              <Button
                type="primary"
                icon={<ReloadOutlined spin={loading} />}
                onClick={fetchData}
                loading={loading}
                size={screens.md ? 'middle' : 'large'}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Sentiment Summary */}
      {allIndices.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card size="small">
              <Statistic
                title="Market Sentiment"
                value={bullishPercent}
                suffix="%"
                prefix={bullishPercent >= 50 ? <RiseOutlined /> : <FallOutlined />}
                valueStyle={{ color: bullishPercent >= 50 ? '#52c41a' : '#ff4d4f' }}
              />
              <Progress 
                percent={bullishPercent} 
                strokeColor={bullishPercent >= 50 ? '#52c41a' : '#ff4d4f'}
                trailColor={bullishPercent >= 50 ? '#ff4d4f' : '#52c41a'}
                showInfo={false}
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {bullishPercent >= 50 ? 'Bullish' : 'Bearish'} • {total} indices
              </Text>
            </Card>
          </Col>
          <Col xs={8} md={5}>
            <Card size="small">
              <Statistic
                title="Bullish"
                value={sentiment.bullish}
                valueStyle={{ color: '#52c41a', fontSize: 24 }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={8} md={5}>
            <Card size="small">
              <Statistic
                title="Neutral"
                value={sentiment.neutral}
                valueStyle={{ color: '#999', fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col xs={8} md={6}>
            <Card size="small">
              <Statistic
                title="Bearish"
                value={sentiment.bearish}
                valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

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
              <Text type="secondary">Loading global markets...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && allIndices.length === 0 && (
        <Card>
          <Empty description="No market data available" />
        </Card>
      )}

      {/* Market Groups */}
      {!loading && data && (
        <div>
          {viewMode === 'cards' 
            ? MARKET_GROUPS.map(group => renderMarketGroup(group))
            : MARKET_GROUPS.map(group => renderMarketTable(group))
          }
        </div>
      )}
    </div>
  )
}

export default GlobalMarkets
