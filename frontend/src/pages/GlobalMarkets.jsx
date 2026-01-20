/**
 * Global Markets Page - Ant Design Implementation
 * Shows global market indices in card layout grouped by region
 */

import { useState, useEffect } from 'react'
import { 
  Card, Select, Button, Space, Tag, Typography, Table,
  Empty, Spin, Alert, Row, Col, Statistic, Progress, Grid, Segmented, Divider
} from 'antd'
import { 
  ReloadOutlined, GlobalOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, RiseOutlined, FallOutlined,
  AppstoreOutlined, TableOutlined
} from '@ant-design/icons'
import { getGlobalMarkets } from '../api/scanner'
import { useTheme } from '../context/ThemeContext'

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
  const { isDarkMode } = useTheme()
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

  // Table columns for table view with enhanced styling
  const tableColumns = [
    {
      title: 'Index',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      fixed: screens.md ? 'left' : false,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{short || record.name?.split(' ')[0]}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 130,
      render: (price) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 15 }}>
          {price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
        </Text>
      ),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      align: 'right',
      width: 110,
      render: (change) => {
        if (change === null || change === undefined) return '-'
        const color = change > 0 ? '#52c41a' : change < 0 ? '#ff4d4f' : '#999'
        const sign = change > 0 ? '+' : ''
        const Icon = change > 0 ? ArrowUpOutlined : ArrowDownOutlined
        return (
          <Space size={4}>
            <Icon style={{ color, fontSize: 12 }} />
            <Text strong style={{ color, fontFamily: 'monospace' }}>
              {sign}{change?.toFixed(2)}
            </Text>
          </Space>
        )
      },
    },
    {
      title: 'Change %',
      dataIndex: 'change_pct',
      key: 'change_pct',
      align: 'center',
      width: 120,
      sorter: (a, b) => (a.change_pct || 0) - (b.change_pct || 0),
      defaultSortOrder: 'descend',
      render: (pct) => {
        if (pct === null || pct === undefined) return '-'
        const color = pct > 0 ? 'green' : pct < 0 ? 'red' : 'default'
        const sign = pct > 0 ? '+' : ''
        const Icon = pct > 0 ? ArrowUpOutlined : pct < 0 ? ArrowDownOutlined : null
        return (
          <Tag 
            color={color} 
            style={{ 
              minWidth: 90, 
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 8px'
            }}
          >
            {Icon && <Icon style={{ marginRight: 4 }} />} {sign}{pct?.toFixed(2)}%
          </Tag>
        )
      },
    },
  ]

  // Render table view for a market group with enhanced styling
  const renderMarketTable = (group) => {
    const markets = data?.[group.key] || []
    if (markets.length === 0) return null

    return (
      <div key={group.key} style={{ marginBottom: 24 }}>
        <Card 
          title={
            <Space size={12}>
              <span style={{ fontSize: 20 }}>{group.emoji}</span>
              <div>
                <Text strong style={{ fontSize: 16 }}>{group.title}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  ({markets.length} indices)
                </Text>
              </div>
            </Space>
          }
          size="small"
          bodyStyle={{ padding: 0 }}
          style={{
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease'
          }}
        >
          <Table
            columns={tableColumns}
            dataSource={markets.map((m, i) => ({ ...m, key: i }))}
            pagination={false}
            size="middle"
            scroll={{ x: 600 }}
            sticky={{ offsetHeader: 64 }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? '' : isDarkMode ? 'ant-table-row-striped-dark' : 'ant-table-row-striped'
            }
          />
        </Card>
      </div>
    )
  }

  // Render individual market card with enhanced styling
  const renderMarketCard = (market) => {
    const isPositive = market.change_pct > 0
    const isNegative = market.change_pct < 0
    const changeColor = isPositive ? '#52c41a' : isNegative ? '#ff4d4f' : '#999'
    const bgColor = isPositive 
      ? (isDarkMode ? 'rgba(82, 196, 26, 0.08)' : 'rgba(82, 196, 26, 0.04)') 
      : isNegative 
        ? (isDarkMode ? 'rgba(255, 77, 79, 0.08)' : 'rgba(255, 77, 79, 0.04)')
        : 'transparent'
    const sign = isPositive ? '+' : ''
    const Icon = isPositive ? ArrowUpOutlined : isNegative ? ArrowDownOutlined : null

    return (
      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={market.symbol}>
        <Card 
          hoverable
          style={{ 
            height: '100%',
            borderLeft: `4px solid ${changeColor}`,
            background: bgColor,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isDarkMode 
              ? '0 1px 4px rgba(0, 0, 0, 0.3)' 
              : '0 1px 4px rgba(0, 0, 0, 0.08)',
          }}
          bodyStyle={{ padding: '16px' }}
          styles={{
            body: {
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.12)'
              }
            }
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.3 }}>
              {market.short || market.name?.split(' ')[0]}
            </Text>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
              {market.symbol}
            </Text>
          </div>
          
          <Text 
            strong 
            style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              display: 'block', 
              marginTop: 8,
              marginBottom: 12,
              fontFamily: 'monospace',
              letterSpacing: '-0.5px'
            }}
          >
            {market.price?.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) || '-'}
          </Text>
          
          <Space size={8} style={{ width: '100%' }} wrap>
            <Tag 
              color={isPositive ? 'green' : isNegative ? 'red' : 'default'}
              style={{ 
                fontSize: 13, 
                fontWeight: 600,
                padding: '2px 8px',
                margin: 0
              }}
            >
              {Icon && <Icon style={{ marginRight: 4 }} />}
              {sign}{market.change_pct?.toFixed(2) || '0.00'}%
            </Tag>
            <Text style={{ color: changeColor, fontSize: 12, fontFamily: 'monospace' }}>
              {sign}{market.change?.toFixed(2) || '0.00'}
            </Text>
          </Space>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Text 
            type="secondary" 
            style={{ 
              fontSize: 11, 
              display: 'block',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={market.name}
          >
            {market.name}
          </Text>
        </Card>
      </Col>
    )
  }

  // Render a market group section with enhanced styling
  const renderMarketGroup = (group) => {
    const markets = data?.[group.key] || []
    if (markets.length === 0) return null

    // Calculate group sentiment
    const groupBullish = markets.filter(m => m.change_pct > 0).length
    const groupPercent = Math.round((groupBullish / markets.length) * 100)

    return (
      <div key={group.key} style={{ marginBottom: 32 }}>
        <Card 
          title={
            <Space size={12} style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space size={12}>
                <span style={{ fontSize: 22 }}>{group.emoji}</span>
                <div>
                  <Text strong style={{ fontSize: 17 }}>{group.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                    {markets.length} indices
                  </Text>
                </div>
              </Space>
              <Tag 
                color={groupPercent >= 50 ? 'green' : 'red'}
                style={{ fontSize: 13, padding: '4px 12px', fontWeight: 600 }}
              >
                {groupPercent >= 50 ? <RiseOutlined /> : <FallOutlined />} {groupPercent}% Bullish
              </Tag>
            </Space>
          }
          bodyStyle={{ padding: 20 }}
          style={{
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            transition: 'all 0.3s ease'
          }}
        >
          <Row gutter={[16, 16]}>
            {markets.map(market => renderMarketCard(market))}
          </Row>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header with Gradient */}
      <div 
        style={{ 
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(24, 144, 255, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(240, 242, 245, 0) 100%)',
          padding: screens.md ? '32px 24px' : '24px 16px',
          borderRadius: 2,
          marginBottom: 24,
          border: isDarkMode ? '1px solid rgba(24, 144, 255, 0.2)' : '1px solid rgba(24, 144, 255, 0.1)',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" size={16}>
              <div 
                style={{ 
                  background: 'rgba(24, 144, 255, 0.1)',
                  borderRadius: 2,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GlobalOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              </div>
              <div>
                <Title level={screens.md ? 2 : 3} style={{ margin: 0, marginBottom: 4 }}>
                  Global Markets
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Real-time world indices & market sentiment analysis
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Enhanced Filters */}
      <Card 
        style={{ 
          marginBottom: 24,
          boxShadow: isDarkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: screens.md ? '16px 24px' : '16px' }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between" wrap>
          <Col xs={24} sm={12} md={16}>
            <Space wrap size={12}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  View Mode
                </Text>
                <Segmented
                  value={viewMode}
                  onChange={setViewMode}
                  size={screens.md ? 'middle' : 'large'}
                  options={[
                    { 
                      value: 'cards', 
                      icon: <AppstoreOutlined />, 
                      label: screens.md ? 'Cards' : '' 
                    },
                    { 
                      value: 'table', 
                      icon: <TableOutlined />, 
                      label: screens.md ? 'Table' : '' 
                    },
                  ]}
                />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Timeframe
                </Text>
                <Select
                  value={timeframe}
                  onChange={setTimeframe}
                  options={TIMEFRAMES}
                  style={{ width: screens.md ? 140 : 120 }}
                  size={screens.md ? 'middle' : 'large'}
                />
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: screens.sm ? 'right' : 'left' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchData}
              loading={loading}
              size={screens.md ? 'middle' : 'large'}
              style={{ minWidth: 120 }}
            >
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Enhanced Sentiment Summary - Only show when not loading */}
      {!loading && allIndices.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={10}>
            <Card 
              style={{
                background: bullishPercent >= 50 
                  ? (isDarkMode 
                      ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.04) 100%)'
                      : 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)')
                  : (isDarkMode 
                      ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.04) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.02) 100%)'),
                borderLeft: `4px solid ${bullishPercent >= 50 ? '#52c41a' : '#ff4d4f'}`,
                height: '100%',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                    Overall Market Sentiment
                  </Text>
                  <Space size={16} align="end">
                    <Statistic
                      value={bullishPercent}
                      suffix="%"
                      prefix={bullishPercent >= 50 ? <RiseOutlined /> : <FallOutlined />}
                      valueStyle={{ 
                        color: bullishPercent >= 50 ? '#52c41a' : '#ff4d4f',
                        fontSize: 40,
                        fontWeight: 700
                      }}
                    />
                    <Tag 
                      color={bullishPercent >= 50 ? 'green' : 'red'}
                      style={{ fontSize: 16, padding: '6px 16px', fontWeight: 600 }}
                    >
                      {bullishPercent >= 50 ? 'BULLISH' : 'BEARISH'}
                    </Tag>
                  </Space>
                </div>
                <Progress 
                  percent={bullishPercent} 
                  strokeColor={{
                    '0%': bullishPercent >= 50 ? '#52c41a' : '#ff4d4f',
                    '100%': bullishPercent >= 50 ? '#73d13d' : '#ff7875',
                  }}
                  trailColor={isDarkMode ? '#262626' : '#f0f0f0'}
                  showInfo={false}
                  strokeWidth={12}
                  style={{ marginBottom: 4 }}
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Based on {total} global indices across {MARKET_GROUPS.length} regions
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={8} lg={5}>
            <Card 
              hoverable
              style={{
                height: '100%',
                borderTop: '3px solid #52c41a',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 13 }}>Bullish</Text>}
                value={sentiment.bullish}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowUpOutlined style={{ fontSize: 24 }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {Math.round((sentiment.bullish / total) * 100)}% of markets
              </Text>
            </Card>
          </Col>
          <Col xs={8} lg={5}>
            <Card 
              hoverable
              style={{
                height: '100%',
                borderTop: '3px solid #999',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 13 }}>Neutral</Text>}
                value={sentiment.neutral}
                valueStyle={{ color: '#999', fontSize: 32, fontWeight: 700 }}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {Math.round((sentiment.neutral / total) * 100)}% of markets
              </Text>
            </Card>
          </Col>
          <Col xs={8} lg={4}>
            <Card 
              hoverable
              style={{
                height: '100%',
                borderTop: '3px solid #ff4d4f',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={<Text strong style={{ fontSize: 13 }}>Bearish</Text>}
                value={sentiment.bearish}
                valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowDownOutlined style={{ fontSize: 24 }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {Math.round((sentiment.bearish / total) * 100)}% of markets
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Market Data"
          description={error}
          type="error"
          showIcon
          closable
          style={{ 
            marginBottom: 24,
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        />
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <Card
          style={{
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ textAlign: 'center', padding: screens.md ? 80 : 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 24 }}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                Loading Global Markets
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Fetching latest market data for {timeframe} timeframe...
              </Text>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Empty State */}
      {!loading && !error && allIndices.length === 0 && (
        <Card
          style={{
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Empty 
            description={
              <Space direction="vertical" size={8}>
                <Text strong style={{ fontSize: 15 }}>No Market Data Available</Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Try refreshing or selecting a different timeframe
                </Text>
              </Space>
            }
            style={{ padding: screens.md ? 60 : 40 }}
          >
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              size="large"
            >
              Refresh Data
            </Button>
          </Empty>
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
