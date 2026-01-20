/**
 * Commodity Markets Page - Ant Design Implementation
 * Shows commodity futures grouped by category (Precious Metals, Energy, Agricultural)
 */

import { useState, useEffect } from 'react'
import {
  Card, Select, Button, Space, Tag, Typography, Table,
  Empty, Spin, Alert, Row, Col, Statistic, Progress, Grid, Switch, Divider
} from 'antd'
import {
  ReloadOutlined, ArrowUpOutlined,
  ArrowDownOutlined, RiseOutlined, FallOutlined,
  DollarCircleOutlined, GoldOutlined, ThunderboltOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'
import { useTheme } from '../context/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = [
  { value: '1h', label: '1H', fullLabel: '1 Hour' },
  { value: '4h', label: '4H', fullLabel: '4 Hour' },
  { value: 'daily', label: 'Daily', fullLabel: 'Daily' },
  { value: 'weekly', label: 'Weekly', fullLabel: 'Weekly' },
  { value: 'monthly', label: 'Monthly', fullLabel: 'Monthly' },
  { value: '3m', label: '3M', fullLabel: '3 Month' },
]

const COMMODITY_GROUPS = [
  {
    key: 'precious_metals',
    title: 'Precious Metals',
    subtitle: 'COMEX - CME Group, New York',
    icon: <GoldOutlined style={{ fontSize: 20, color: '#faad14' }} />,
    color: '#faad14'
  },
  {
    key: 'energy_commodities',
    title: 'Energy',
    subtitle: 'NYMEX - New York Mercantile Exchange',
    icon: <ThunderboltOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />,
    color: '#ff4d4f'
  },
  {
    key: 'agricultural_commodities',
    title: 'Agricultural',
    subtitle: 'CBOT - Chicago Board of Trade',
    icon: <ExperimentOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
    color: '#52c41a'
  }
]

const Commodity = () => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [isMultiTimeframe, setIsMultiTimeframe] = useState(false)
  const [highlightedTimeframe, setHighlightedTimeframe] = useState('daily')

  const fetchData = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE_URL}/markets/commodities`
      const params = isMultiTimeframe ? { multi: true } : { timeframe }
      const response = await axios.get(url, { params, signal })
      setData(response.data)
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.message || 'Failed to fetch commodity markets data')
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
  }, [timeframe, isMultiTimeframe])

  // Calculate sentiment for single timeframe mode
  const sentiment = !isMultiTimeframe && data ? data.sentiment : null

  // Multi-timeframe sentiments
  const multiTimeframeSentiments = isMultiTimeframe && data ? data.sentiments : {}

  // Single timeframe table columns
  const singleTimeframeTableColumns = [
    {
      title: 'Commodity',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontWeight: 600 }}>{short || record.name?.split(' ')[0]}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 120,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
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
      sorter: (a, b) => (a.change || 0) - (b.change || 0),
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
          <Tag color={color} style={{ minWidth: 80, textAlign: 'center', fontWeight: 600 }}>
            {Icon && <Icon />} {sign}{pct?.toFixed(2)}%
          </Tag>
        )
      },
    },
  ]

  // Multi-timeframe table columns
  const multiTimeframeTableColumns = [
    {
      title: 'Commodity',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontWeight: 600 }}>{short || record.name?.split(' ')[0]}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 120,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
        </Text>
      ),
    },
    ...TIMEFRAMES.map(tf => ({
      title: (
        <Text strong={highlightedTimeframe === tf.value} style={{ color: highlightedTimeframe === tf.value ? '#1890ff' : undefined }}>
          {tf.label}
        </Text>
      ),
      dataIndex: ['timeframes', tf.value, 'change_pct'],
      key: tf.value,
      align: 'center',
      width: 100,
      sorter: (a, b) => (a.timeframes?.[tf.value]?.change_pct || 0) - (b.timeframes?.[tf.value]?.change_pct || 0),
      render: (pct, record) => {
        if (!record.timeframes?.[tf.value] || record.timeframes[tf.value]?.error || pct === null || pct === undefined) return '-'
        const color = pct > 0 ? 'green' : pct < 0 ? 'red' : 'default'
        const sign = pct > 0 ? '+' : ''
        const Icon = pct > 0 ? ArrowUpOutlined : pct < 0 ? ArrowDownOutlined : null
        return (
          <Tag
            color={color}
            style={{
              minWidth: 70,
              textAlign: 'center',
              fontWeight: 600,
              background: highlightedTimeframe === tf.value
                ? (isDarkMode ? 'rgba(24, 144, 255, 0.15)' : 'rgba(24, 144, 255, 0.1)')
                : undefined,
              transition: 'background-color 0.3s ease'
            }}
          >
            {Icon && <Icon />} {sign}{pct?.toFixed(2)}%
          </Tag>
        )
      },
    })),
  ]

  // Render multi-timeframe sentiment card
  const renderMultiTimeframeSentimentCard = (tfValue, sentimentData) => {
    if (!sentimentData) return null

    const bullish = sentimentData.breadth.positive
    const bearish = sentimentData.breadth.negative
    const neutral = sentimentData.breadth.neutral
    const totalTf = sentimentData.breadth.total
    const bullishPct = sentimentData.breadth.percentage
    const isPositive = bullishPct >= 50
    const borderColor = isPositive ? '#52c41a' : '#ff4d4f'
    const bgColor = isPositive
      ? (isDarkMode ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.04) 100%)' : 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)')
      : (isDarkMode ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.04) 100%)' : 'linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.02) 100%)')

    return (
      <Col xs={12} sm={8} md={4} lg={4} xl={4} key={tfValue}>
        <Card
          hoverable
          size="small"
          onClick={() => setHighlightedTimeframe(tfValue)}
          style={{
            height: '100%',
            borderLeft: `4px solid ${borderColor}`,
            background: bgColor,
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4, fontWeight: 600 }}>
            {TIMEFRAMES.find(tf => tf.value === tfValue)?.fullLabel || tfValue}
          </Text>
          <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text
              style={{
                color: isPositive ? '#52c41a' : '#ff4d4f',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {bullishPct}%
            </Text>
            <Tag
              color={isPositive ? 'green' : 'red'}
              style={{ fontWeight: 600, fontSize: 12, padding: '4px 8px' }}
            >
              {isPositive ? 'BULLISH' : 'BEARISH'}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
            {bullish}↑ {bearish}↓ {neutral}• ({totalTf} total)
          </Text>
        </Card>
      </Col>
    )
  }

  // Render commodity group table
  const renderGroupTable = (groupKey, groupData, groupInfo) => {
    if (!groupData || groupData.length === 0) return null

    const columns = isMultiTimeframe ? multiTimeframeTableColumns : singleTimeframeTableColumns
    const dataSource = groupData.map((item, idx) => ({ ...item, key: `${groupKey}_${idx}` }))

    return (
      <div key={groupKey} style={{ marginBottom: 24 }}>
        <Card
          title={
            <Space size={12}>
              {groupInfo.icon}
              <div>
                <Text strong style={{ fontSize: 16 }}>{groupInfo.title}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  ({groupData.length} commodities)
                </Text>
              </div>
            </Space>
          }
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {groupInfo.subtitle}
            </Text>
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
            dataSource={dataSource}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            rowClassName={(record, index) => (isDarkMode ? (index % 2 === 0 ? 'ant-table-row-dark-stripe' : '') : (index % 2 === 0 ? 'ant-table-row-light-stripe' : ''))}
          />
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
              <DollarCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                  Commodity Markets
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Major commodity futures & sentiment analysis
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card 
        style={{ 
          marginBottom: 24,
          boxShadow: isDarkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
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
                      fontWeight: !isMultiTimeframe ? 600 : 400,
                      color: !isMultiTimeframe ? '#1890ff' : (isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')
                    }}
                  >
                    Single
                  </Text>
                  <Switch
                    checked={isMultiTimeframe}
                    onChange={setIsMultiTimeframe}
                    style={{
                      background: isMultiTimeframe ? '#52c41a' : undefined
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isMultiTimeframe ? 600 : 400,
                      color: isMultiTimeframe ? '#52c41a' : (isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')
                    }}
                  >
                    All Timeframes
                  </Text>
                </Space>
              </div>

              {/* Timeframe - Right next to Analysis Mode, only in single mode */}
              {!isMultiTimeframe && (
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

      {/* Multi-Timeframe Sentiment Summary */}
      {!loading && isMultiTimeframe && data && data.sentiments && (
        <div style={{ marginBottom: 32 }}>
          <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 16, fontWeight: 700 }}>
            Overall Commodity Sentiment
          </Text>
          <Row gutter={[16, 16]}>
            {TIMEFRAMES.map(tf => renderMultiTimeframeSentimentCard(tf.value, multiTimeframeSentiments[tf.value]))}
          </Row>
        </div>
      )}

      {/* Single Timeframe Sentiment Summary */}
      {!loading && !isMultiTimeframe && sentiment && (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={10}>
            <Card
              style={{
                background: sentiment.breadth.percentage >= 50
                  ? (isDarkMode
                      ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.04) 100%)'
                      : 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)')
                  : (isDarkMode
                      ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.04) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.02) 100%)'),
                borderLeft: `4px solid ${sentiment.breadth.percentage >= 50 ? '#52c41a' : '#ff4d4f'}`,
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
                    Overall Commodity Sentiment ({TIMEFRAMES.find(tf => tf.value === timeframe)?.fullLabel})
                  </Text>
                  <Space size={16} align="end">
                    <Statistic
                      value={sentiment.breadth.percentage}
                      suffix="%"
                      prefix={sentiment.breadth.percentage >= 50 ? <RiseOutlined /> : <FallOutlined />}
                      valueStyle={{
                        color: sentiment.breadth.percentage >= 50 ? '#52c41a' : '#ff4d4f',
                        fontSize: 40,
                        fontWeight: 700
                      }}
                    />
                    <Tag
                      color={sentiment.breadth.percentage >= 50 ? 'green' : 'red'}
                      style={{ fontSize: 16, padding: '6px 16px', fontWeight: 600 }}
                    >
                      {sentiment.breadth.percentage >= 50 ? 'BULLISH' : 'BEARISH'}
                    </Tag>
                  </Space>
                </div>
                <Progress
                  percent={sentiment.breadth.percentage}
                  strokeColor={{
                    '0%': sentiment.breadth.percentage >= 50 ? '#52c41a' : '#ff4d4f',
                    '100%': sentiment.breadth.percentage >= 50 ? '#87d068' : '#f5222d',
                  }}
                  trailColor={isDarkMode ? '#434343' : '#f0f0f0'}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {sentiment.breadth.percentage >= 50 ? 'Bullish' : 'Bearish'} • {sentiment.breadth.total} commodities
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={8} lg={4}>
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
                value={sentiment.breadth.positive}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowUpOutlined style={{ fontSize: 24 }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {Math.round((sentiment.breadth.positive / sentiment.breadth.total) * 100)}% of commodities
              </Text>
            </Card>
          </Col>
          <Col xs={8} lg={4}>
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
                value={sentiment.breadth.neutral}
                valueStyle={{ color: '#999', fontSize: 32, fontWeight: 700 }}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {Math.round((sentiment.breadth.neutral / sentiment.breadth.total) * 100)}% of commodities
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
                value={sentiment.breadth.negative}
                valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowDownOutlined style={{ fontSize: 24 }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {Math.round((sentiment.breadth.negative / sentiment.breadth.total) * 100)}% of commodities
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Commodity Data"
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

      {/* Loading State */}
      {loading && (
        <Card
          style={{
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading commodity markets...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && (!data || !COMMODITY_GROUPS.some(g => data[g.key]?.length > 0)) && (
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
                <Text strong style={{ fontSize: 15 }}>No Commodity Data Available</Text>
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

      {/* Commodity Group Tables */}
      {!loading && data && (
        <div>
          {COMMODITY_GROUPS.map(groupInfo => {
            const groupData = data[groupInfo.key]
            if (!groupData) return null
            return renderGroupTable(groupInfo.key, groupData, groupInfo)
          })}
        </div>
      )}
    </div>
  )
}

export default Commodity
