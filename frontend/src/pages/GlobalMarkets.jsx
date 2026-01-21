/**
 * Global Markets Page - Ant Design Implementation
 * Shows global market indices in card layout grouped by region
 */

import { useState, useEffect } from 'react'
import {
  Card, Select, Button, Space, Tag, Typography, Table,
  Empty, Spin, Alert, Row, Col, Statistic, Progress, Grid, Segmented, Divider, Switch
} from 'antd'
import {
  ReloadOutlined, GlobalOutlined, ArrowUpOutlined,
  ArrowDownOutlined, RiseOutlined, FallOutlined,
  AppstoreOutlined, TableOutlined
} from '@ant-design/icons'
import { getGlobalMarkets, getGlobalMarketsMultiTimeframe } from '../api/scanner'
import { useTheme } from '../context/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = [
  { value: '3m', label: '3M', fullLabel: '3 Month' },
  { value: 'monthly', label: 'Monthly', fullLabel: 'Monthly' },
  { value: 'weekly', label: 'Weekly', fullLabel: 'Weekly' },
  { value: 'daily', label: 'Daily', fullLabel: 'Daily' },
  { value: '4h', label: '4H', fullLabel: '4 Hour' },
  { value: '1h', label: '1H', fullLabel: '1 Hour' },
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
  const [multiTimeframe, setMultiTimeframe] = useState(false) // Default to single-timeframe
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily') // For highlighting column

  const fetchData = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      if (multiTimeframe) {
        const result = await getGlobalMarketsMultiTimeframe(signal)
        setData(result)
      } else {
        const result = await getGlobalMarkets(timeframe, signal)
        setData(result)
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.message || 'Failed to fetch global markets data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    fetchData(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [timeframe, multiTimeframe])

  // Flatten all market groups - handle both single and multi-timeframe data
  // Exclude VIX indices from sentiment calculation
  const allIndices = data && !multiTimeframe ? [
    ...(data.us_markets || []),
    ...(data.european_markets || []),
    ...(data.asian_markets || []),
    ...(data.india_adrs || []),
  ].filter(idx => idx.symbol !== '^VIX' && idx.symbol !== '^INDIAVIX') : []

  // Calculate sentiment for single timeframe mode (multi-timeframe has its own sentiments)
  // Using ±0.5% threshold for meaningful categorization
  const sentiment = !multiTimeframe && allIndices.length > 0 ? allIndices.reduce((acc, idx) => {
    if (idx.change_pct > 0.5) acc.bullish++
    else if (idx.change_pct < -0.5) acc.bearish++
    else acc.neutral++
    return acc
  }, { bullish: 0, bearish: 0, neutral: 0 }) : { bullish: 0, bearish: 0, neutral: 0 }

  const total = sentiment.bullish + sentiment.bearish + sentiment.neutral
  const bullishPercent = total > 0 ? Math.round((sentiment.bullish / total) * 100) : 0

  // Multi-timeframe sentiments
  const multiTimeframeSentiments = multiTimeframe && data?.sentiments ? data.sentiments : null

  // Multi-timeframe table columns
  const multiTimeframeColumns = [
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 110,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 14 }}>
          {price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
        </Text>
      ),
    },
    ...TIMEFRAMES.map(tf => ({
      title: tf.label,
      key: `tf_${tf.value}`,
      align: 'center',
      width: 100,
      sorter: (a, b) => {
        const aVal = a.timeframes?.[tf.value]?.change_pct || 0
        const bVal = b.timeframes?.[tf.value]?.change_pct || 0
        return aVal - bVal
      },
      render: (_, record) => {
        const tfData = record.timeframes?.[tf.value]
        if (!tfData || tfData.error || tfData.change_pct === null) return '-'

        const pct = tfData.change_pct
        const color = pct > 0 ? 'green' : pct < 0 ? 'red' : 'default'
        const sign = pct > 0 ? '+' : ''
        const Icon = pct > 0 ? ArrowUpOutlined : pct < 0 ? ArrowDownOutlined : null
        const isSelected = tf.value === selectedTimeframe

        return (
          <Tag
            color={color}
            style={{
              minWidth: 75,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: isSelected ? 700 : 500,
              padding: '3px 6px',
              backgroundColor: isSelected && (isDarkMode ? 'rgba(24, 144, 255, 0.15)' : 'rgba(24, 144, 255, 0.08)'),
              borderWidth: isSelected ? 2 : 1,
            }}
          >
            {Icon && <Icon style={{ marginRight: 3, fontSize: 10 }} />}
            {sign}{pct.toFixed(2)}%
          </Tag>
        )
      },
    })),
  ]

  // Single timeframe table columns (original)
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
    const allMarkets = data?.[group.key] || []
    if (allMarkets.length === 0) return null

    const columns = multiTimeframe ? multiTimeframeColumns : tableColumns

    // Extract VIX data for display in header
    const vixData = group.key === 'us_markets'
      ? allMarkets.find(m => m.symbol === '^VIX')
      : null

    const indiaVixData = group.key === 'asian_markets'
      ? allMarkets.find(m => m.symbol === '^INDIAVIX')
      : null

    // Filter out VIX indices from table display
    const markets = allMarkets.filter(m => m.symbol !== '^VIX' && m.symbol !== '^INDIAVIX')

    return (
      <div key={group.key} style={{ marginBottom: 24 }}>
        <Card
          title={
            <Space size={12} style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space size={12}>
                <span style={{ fontSize: 20 }}>{group.emoji}</span>
                <div>
                  <Text strong style={{ fontSize: 16 }}>{group.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    ({markets.length} indices)
                  </Text>
                </div>
              </Space>
              {(vixData || indiaVixData) && (
                <Space size={8} style={{ marginLeft: 'auto' }}>
                  {vixData && (
                    <>
                      <Text type="secondary" style={{ fontSize: 12 }}>VIX:</Text>
                      <Text strong style={{ fontSize: 14, color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {vixData.price?.toFixed(2)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a'
                        }}
                      >
                        ({vixData.change_pct > 0 ? '+' : ''}{vixData.change_pct?.toFixed(2)}%)
                      </Text>
                    </>
                  )}
                  {indiaVixData && (
                    <>
                      <Text type="secondary" style={{ fontSize: 12 }}>India VIX:</Text>
                      <Text strong style={{ fontSize: 14, color: indiaVixData.change_pct > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {indiaVixData.price?.toFixed(2)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: indiaVixData.change_pct > 0 ? '#ff4d4f' : '#52c41a'
                        }}
                      >
                        ({indiaVixData.change_pct > 0 ? '+' : ''}{indiaVixData.change_pct?.toFixed(2)}%)
                      </Text>
                    </>
                  )}
                </Space>
              )}
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
            columns={columns}
            dataSource={markets.map((m, i) => ({ ...m, key: i }))}
            pagination={false}
            size="middle"
            scroll={{ x: multiTimeframe ? 1000 : 600 }}
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
    const allMarkets = data?.[group.key] || []
    if (allMarkets.length === 0) return null

    // Extract VIX data for display in header
    const vixData = group.key === 'us_markets'
      ? allMarkets.find(m => m.symbol === '^VIX')
      : null

    const indiaVixData = group.key === 'asian_markets'
      ? allMarkets.find(m => m.symbol === '^INDIAVIX')
      : null

    // Filter out VIX indices from card display
    const markets = allMarkets.filter(m => m.symbol !== '^VIX' && m.symbol !== '^INDIAVIX')

    // Calculate group sentiment (using ±0.5% threshold, excluding VIX)
    const groupBullish = markets.filter(m => m.change_pct > 0.5).length
    const groupPercent = Math.round((groupBullish / markets.length) * 100)

    return (
      <div key={group.key} style={{ marginBottom: 32 }}>
        <Card
          title={
            <Space size={12} style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Space size={12}>
                <span style={{ fontSize: 22 }}>{group.emoji}</span>
                <div>
                  <Text strong style={{ fontSize: 17 }}>{group.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                    {markets.length} indices
                  </Text>
                  {vixData && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                      | VIX: <Text strong style={{ color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {vixData.price?.toFixed(2)}
                      </Text>
                      <Text style={{ color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a', marginLeft: 4 }}>
                        ({vixData.change_pct > 0 ? '+' : ''}{vixData.change_pct?.toFixed(2)}%)
                      </Text>
                    </Text>
                  )}
                  {indiaVixData && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                      | India VIX: <Text strong style={{ color: indiaVixData.change_pct > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {indiaVixData.price?.toFixed(2)}
                      </Text>
                      <Text style={{ color: indiaVixData.change_pct > 0 ? '#ff4d4f' : '#52c41a', marginLeft: 4 }}>
                        ({indiaVixData.change_pct > 0 ? '+' : ''}{indiaVixData.change_pct?.toFixed(2)}%)
                      </Text>
                    </Text>
                  )}
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
      {/* Page Header */}
      <Card
        style={{
          marginBottom: 24,
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.12) 0%, rgba(24, 144, 255, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.02) 100%)',
          borderLeft: '4px solid #1890ff',
          boxShadow: isDarkMode
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
        bodyStyle={{ padding: screens.md ? 24 : 16 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <GlobalOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                  Global Markets
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Real-time world indices & market sentiment analysis
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

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
          <Col xs={24} md={18} lg={16}>
            <Space wrap size={16}>
              {/* Analysis Mode Toggle */}
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Analysis Mode
                </Text>
                <Space
                  style={{
                    padding: '6px 12px',
                    borderRadius: 2,
                    border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                    background: isDarkMode ? '#1f1f1f' : '#fafafa',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: !multiTimeframe ? 600 : 400,
                      color: !multiTimeframe ? '#1890ff' : (isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')
                    }}
                  >
                    Single
                  </Text>
                  <Switch
                    checked={multiTimeframe}
                    onChange={(checked) => {
                      setMultiTimeframe(checked)
                      if (checked) {
                        setViewMode('table') // Force table view when multi-timeframe is enabled
                      }
                    }}
                    style={{
                      background: multiTimeframe ? '#52c41a' : undefined
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: multiTimeframe ? 600 : 400,
                      color: multiTimeframe ? '#52c41a' : (isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')
                    }}
                  >
                    All Timeframes
                  </Text>
                </Space>
              </div>

              {/* Timeframe - Right next to Analysis Mode, only in single mode */}
              {!multiTimeframe && (
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
                    Timeframe
                  </Text>
                  <Select
                    value={timeframe}
                    onChange={setTimeframe}
                    options={TIMEFRAMES.map(tf => ({ value: tf.value, label: tf.fullLabel }))}
                    style={{ width: screens.md ? 140 : 120 }}
                    size={screens.md ? 'middle' : 'large'}
                  />
                </div>
              )}

              {/* View Mode - After Timeframe */}
              {!multiTimeframe && (
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
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
              )}
            </Space>
          </Col>
          <Col xs={24} md={6} lg={8} style={{ textAlign: screens.md ? 'right' : 'left' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => fetchData()}
              loading={loading}
              size={screens.md ? 'middle' : 'large'}
              style={{ minWidth: 120 }}
            >
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Multi-Timeframe Sentiment Cards */}
      {!loading && multiTimeframe && multiTimeframeSentiments && (
        <div style={{ marginBottom: 32 }}>
          <Text strong style={{ fontSize: 17, display: 'block', marginBottom: 16, fontWeight: 700 }}>
            Overall Market Sentiment - All Timeframes
          </Text>
          <Row gutter={[12, 12]}>
            {TIMEFRAMES.map(tf => {
              const sent = multiTimeframeSentiments[tf.value]
              if (!sent) return null

              const bullish = sent.breadth?.positive || 0
              const bearish = sent.breadth?.negative || 0
              const neutral = sent.breadth?.total - bullish - bearish || 0
              const bullishPercent = sent.breadth?.percentage || 0
              const isBullish = bullishPercent >= 50

              return (
                <Col xs={12} sm={8} md={4} key={tf.value}>
                  <Card
                    size="small"
                    hoverable
                    style={{
                      borderTop: `3px solid ${isBullish ? '#52c41a' : '#ff4d4f'}`,
                      background: isBullish
                        ? (isDarkMode ? 'rgba(82, 196, 26, 0.08)' : 'rgba(82, 196, 26, 0.04)')
                        : (isDarkMode ? 'rgba(255, 77, 79, 0.08)' : 'rgba(255, 77, 79, 0.04)'),
                      height: '100%',
                      transition: 'all 0.3s ease',
                      boxShadow: isDarkMode
                        ? '0 2px 6px rgba(0, 0, 0, 0.3)'
                        : '0 2px 6px rgba(0, 0, 0, 0.08)',
                    }}
                    bodyStyle={{ padding: 12 }}
                    onClick={() => setSelectedTimeframe(tf.value)}
                  >
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                      {tf.fullLabel}
                    </Text>
                    <Space size={4} align="center" style={{ marginBottom: 6 }}>
                      <Text strong style={{ fontSize: 22, color: isBullish ? '#52c41a' : '#ff4d4f' }}>
                        {Math.round(bullishPercent)}%
                      </Text>
                      {isBullish ? <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} /> : <FallOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />}
                    </Space>
                    <Tag
                      color={isBullish ? 'green' : 'red'}
                      style={{ fontSize: 11, padding: '2px 6px', margin: 0, marginBottom: 8 }}
                    >
                      {isBullish ? 'BULLISH' : 'BEARISH'}
                    </Tag>
                    <div style={{ fontSize: 10, lineHeight: 1.4 }}>
                      <Text type="secondary">
                        ↑{bullish} / ↓{bearish} / •{neutral}
                      </Text>
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </div>
      )}

      {/* Single Timeframe Sentiment Summary - Only show when not loading and not in multi-timeframe mode */}
      {!loading && !multiTimeframe && allIndices.length > 0 && (
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
                  <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8, fontWeight: 700 }}>
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
      {!loading && !error && !multiTimeframe && allIndices.length === 0 && (
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
              onClick={() => fetchData()}
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
          {viewMode === 'cards' && !multiTimeframe
            ? MARKET_GROUPS.map(group => renderMarketGroup(group))
            : MARKET_GROUPS.map(group => renderMarketTable(group))
          }
        </div>
      )}
    </div>
  )
}

export default GlobalMarkets
