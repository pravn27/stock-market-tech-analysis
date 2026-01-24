/**
 * Sector Stock Detail Page
 * Displays all stocks within a specific sector/index with their performance metrics
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Table, Space, Tag, Typography, Breadcrumb, Button, Select, Statistic,
  Row, Col, Spin, Alert, Grid, Segmented, InputNumber, Switch
} from 'antd'
import {
  HomeOutlined, LineChartOutlined, ReloadOutlined, RiseOutlined,
  FallOutlined, MinusOutlined, ArrowLeftOutlined, TableOutlined, AppstoreOutlined,
  ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'
import { PageHeader } from '../components/markets'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAME_OPTIONS = [
  { value: '3m', label: '3 Month', fullLabel: '3 Month' },
  { value: 'monthly', label: 'Monthly', fullLabel: 'Monthly' },
  { value: 'weekly', label: 'Weekly', fullLabel: 'Weekly' },
  { value: 'daily', label: 'Daily', fullLabel: 'Daily' },
  { value: '4h', label: '4 Hour', fullLabel: '4 Hour' },
  { value: '1h', label: '1 Hour', fullLabel: '1 Hour' },
]

const TIMEFRAMES = [
  { value: '3m', label: '3M', fullLabel: '3 Month' },
  { value: 'monthly', label: 'M', fullLabel: 'Monthly' },
  { value: 'weekly', label: 'W', fullLabel: 'Weekly' },
  { value: 'daily', label: 'D', fullLabel: 'Daily' },
  { value: '4h', label: '4H', fullLabel: '4 Hour' },
  { value: '1h', label: '1H', fullLabel: '1 Hour' },
]

const SectorStockDetail = () => {
  const { sectorSymbol } = useParams()
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const screens = useBreakpoint()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [multiTimeframe, setMultiTimeframe] = useState(false)
  const [timeframe, setTimeframe] = useState('daily')
  const [lookback, setLookback] = useState(1)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
  const [sortBy, setSortBy] = useState('rank') // 'rank', 'name', 'price', 'change', 'relative'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'

  useEffect(() => {
    fetchData()
  }, [sectorSymbol, timeframe, lookback, multiTimeframe])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      if (multiTimeframe) {
        // For multi-timeframe, fetch all timeframes data
        // TODO: Create backend endpoint for multi-timeframe sector stocks
        // For now, we'll fetch multiple timeframes individually
        const timeframePromises = TIMEFRAMES.map(tf => 
          axios.get(
            `${API_BASE_URL}/stocks/sector/${sectorSymbol}`,
            { params: { timeframe: tf.value, lookback } }
          )
        )
        
        const responses = await Promise.all(timeframePromises)
        
        // Transform data to multi-timeframe format
        const firstResponse = responses[0].data
        const transformedStocks = firstResponse.stocks.map((stock, idx) => {
          const timeframes = {}
          TIMEFRAMES.forEach((tf, tfIdx) => {
            const tfStock = responses[tfIdx].data.stocks.find(s => s.symbol === stock.symbol)
            if (tfStock) {
              const tfKey = getTimeframeKey(tf.value)
              timeframes[tf.value] = {
                change_pct: tfStock.returns?.[tfKey],
                relative_strength: tfStock.relative_strength?.[tfKey]
              }
            }
          })
          return {
            ...stock,
            timeframes
          }
        })
        
        setData({
          ...firstResponse,
          stocks: transformedStocks
        })
      } else {
        // Single timeframe mode
        const response = await axios.get(
          `${API_BASE_URL}/stocks/sector/${sectorSymbol}`,
          { params: { timeframe, lookback } }
        )
        setData(response.data)
      }
    } catch (err) {
      console.error('Error fetching sector stocks:', err)
      setError(err.response?.data?.detail || 'Failed to load sector stocks data')
    } finally {
      setLoading(false)
    }
  }

  // Handle multi-timeframe toggle
  const handleMultiTimeframeChange = (checked) => {
    setMultiTimeframe(checked)
    if (checked) {
      setViewMode('table') // Force table view when multi-timeframe is enabled
    }
  }

  // Get timeframe key for data access
  const getTimeframeKey = (tf) => {
    const map = {
      '1h': 'one_hour',
      '4h': 'four_hour',
      'daily': 'daily',
      'weekly': 'weekly',
      'monthly': 'monthly',
      '3m': 'three_month'
    }
    return map[tf] || 'daily'
  }

  const tfKey = getTimeframeKey(timeframe)

  // Get status tag color and icon
  const getStatusTag = (value) => {
    if (value >= 0.15) return { color: 'green', icon: <RiseOutlined />, label: 'Bullish' }
    if (value <= -0.15) return { color: 'red', icon: <FallOutlined />, label: 'Bearish' }
    return { color: 'default', icon: <MinusOutlined />, label: 'Neutral' }
  }

  // Format percentage
  const formatPercent = (value) => {
    if (!value && value !== 0) return 'N/A'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  // Calculate sentiment
  const calculateSentiment = () => {
    if (!data?.stocks) return { 
      bullish: 0, 
      bearish: 0, 
      neutral: 0,
      bullishPercent: 0,
      bearishPercent: 0,
      neutralPercent: 0,
      dominantSentiment: 'Neutral',
      dominantPercent: 0,
      dominantColor: 'default',
      dominantIcon: null
    }

    const bullish = data.stocks.filter(s => (s.relative_strength?.[tfKey] || 0) >= 0.15).length
    const bearish = data.stocks.filter(s => (s.relative_strength?.[tfKey] || 0) <= -0.15).length
    const neutral = data.stocks.length - bullish - bearish
    
    const total = data.stocks.length
    const bullishPercent = total > 0 ? Math.round((bullish / total) * 100) : 0
    const bearishPercent = total > 0 ? Math.round((bearish / total) * 100) : 0
    const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0

    // Determine dominant sentiment
    let dominantSentiment = 'Neutral'
    let dominantPercent = neutralPercent
    let dominantColor = 'default'
    let dominantIcon = <MinusOutlined />

    if (bullishPercent >= bearishPercent && bullishPercent >= neutralPercent) {
      dominantSentiment = 'Bullish'
      dominantPercent = bullishPercent
      dominantColor = 'green'
      dominantIcon = <RiseOutlined />
    } else if (bearishPercent >= bullishPercent && bearishPercent >= neutralPercent) {
      dominantSentiment = 'Bearish'
      dominantPercent = bearishPercent
      dominantColor = 'red'
      dominantIcon = <FallOutlined />
    }

    return { 
      bullish, 
      bearish, 
      neutral,
      bullishPercent,
      bearishPercent,
      neutralPercent,
      dominantSentiment,
      dominantPercent,
      dominantColor,
      dominantIcon
    }
  }

  const sentiment = calculateSentiment()
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily')

  // Sort data for card view
  const getSortedStocks = () => {
    if (!data?.stocks) return []
    
    const sorted = [...data.stocks].sort((a, b) => {
      let aVal, bVal
      
      switch (sortBy) {
        case 'rank':
          aVal = a.rank || 0
          bVal = b.rank || 0
          break
        case 'name':
          return sortOrder === 'asc' 
            ? (a.name || '').localeCompare(b.name || '')
            : (b.name || '').localeCompare(a.name || '')
        case 'price':
          aVal = a.price || 0
          bVal = b.price || 0
          break
        case 'change':
          aVal = a.returns?.[tfKey] || 0
          bVal = b.returns?.[tfKey] || 0
          break
        case 'relative':
          aVal = a.relative_strength?.[tfKey] || 0
          bVal = b.relative_strength?.[tfKey] || 0
          break
        default:
          aVal = a.rank || 0
          bVal = b.rank || 0
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return sorted
  }

  // Multi-timeframe columns
  const multiTimeframeColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      align: 'center',
      fixed: screens.md ? 'left' : false,
      sorter: (a, b) => (a.rank || 0) - (b.rank || 0),
      defaultSortOrder: 'ascend',
      render: (rank) => <Text strong>{rank}</Text>
    },
    {
      title: 'Stock',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: screens.md ? 'left' : false,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'right',
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => <Text strong style={{ fontFamily: 'monospace' }}>₹{price?.toFixed(2) || 'N/A'}</Text>
    },
    ...TIMEFRAMES.map(tf => ({
      title: tf.label,
      key: `tf_${tf.value}`,
      align: 'center',
      width: 100,
      sorter: (a, b) => {
        const aVal = a.timeframes?.[tf.value]?.relative_strength || 0
        const bVal = b.timeframes?.[tf.value]?.relative_strength || 0
        return aVal - bVal
      },
      render: (_, record) => {
        const tfData = record.timeframes?.[tf.value]
        if (!tfData || tfData.relative_strength === null) return '-'

        const value = tfData.relative_strength
        const status = getStatusTag(value)
        const isSelected = tf.value === selectedTimeframe

        return (
          <Tag
            color={status.color}
            icon={status.icon}
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
            {formatPercent(value)}
          </Tag>
        )
      },
    })),
  ]

  // Single timeframe columns with sorting
  const singleTimeframeColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      align: 'center',
      sorter: (a, b) => (a.rank || 0) - (b.rank || 0),
      defaultSortOrder: 'ascend',
      render: (rank) => <Text strong>{rank}</Text>
    },
    {
      title: 'Stock',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => <Text>₹{price?.toFixed(2) || 'N/A'}</Text>
    },
    {
      title: 'Change %',
      dataIndex: 'returns',
      key: 'change',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.returns?.[tfKey] || 0) - (b.returns?.[tfKey] || 0),
      render: (returns) => {
        const value = returns?.[tfKey] || 0
        const status = getStatusTag(value)
        return (
          <Tag color={status.color} style={{ minWidth: 70, textAlign: 'center' }}>
            {formatPercent(value)}
          </Tag>
        )
      }
    },
    {
      title: 'Relative Performance',
      dataIndex: 'relative_strength',
      key: 'relative',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.relative_strength?.[tfKey] || 0) - (b.relative_strength?.[tfKey] || 0),
      render: (relative) => {
        const value = relative?.[tfKey] || 0
        const status = getStatusTag(value)
        return (
          <Tag color={status.color} icon={status.icon} style={{ minWidth: 80, textAlign: 'center' }}>
            {formatPercent(value)}
          </Tag>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'relative_strength',
      key: 'status',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.relative_strength?.[tfKey] || 0) - (b.relative_strength?.[tfKey] || 0),
      render: (relative) => {
        const value = relative?.[tfKey] || 0
        const status = getStatusTag(value)
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.label}
          </Tag>
        )
      }
    }
  ]

  // Determine which columns to use
  const columns = multiTimeframe ? multiTimeframeColumns : singleTimeframeColumns

  // Render stock card
  const renderStockCard = (stock) => {
    const relativeValue = stock.relative_strength?.[tfKey] || 0
    const changeValue = stock.returns?.[tfKey] || 0
    const status = getStatusTag(relativeValue)

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={stock.symbol}>
        <Card
          size="small"
          style={{
            borderLeft: `4px solid ${status.color === 'green' ? '#52c41a' : status.color === 'red' ? '#ff4d4f' : '#d9d9d9'}`,
            height: '100%'
          }}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: 14 }}>{stock.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>{stock.symbol}</Text>
            </div>
            
            <Statistic
              value={stock.price}
              precision={2}
              prefix="₹"
              valueStyle={{ fontSize: 16 }}
            />

            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Change:</Text>
                <Tag color={changeValue >= 0 ? 'green' : 'red'} style={{ fontSize: 11 }}>
                  {formatPercent(changeValue)}
                </Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Relative:</Text>
                <Tag color={status.color} icon={status.icon} style={{ fontSize: 11 }}>
                  {formatPercent(relativeValue)}
                </Tag>
              </div>
            </Space>
          </Space>
        </Card>
      </Col>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Spin size="large" tip="Loading sector stocks..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchData}>
            Retry
          </Button>
        }
      />
    )
  }

  if (!data) return null

  return (
    <div style={{ padding: screens.md ? 0 : 8 }}>
      {/* Breadcrumb Navigation */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction={screens.md ? 'horizontal' : 'vertical'} style={{ width: '100%', justifyContent: 'space-between' }}>
          <Breadcrumb
            items={[
              {
                title: <HomeOutlined />,
                href: '/stock-market-tech-analysis/global-market',
              },
              {
                title: (
                  <>
                    <LineChartOutlined />
                    <span>Relative Performance</span>
                  </>
                ),
                href: '/stock-market-tech-analysis/india/relative-performance',
              },
              {
                title: data.sector_name,
              },
            ]}
          />
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/stock-market-tech-analysis/india/relative-performance')}
          >
            Back
          </Button>
        </Space>
      </Card>

      {/* Page Header */}
      <PageHeader
        icon={LineChartOutlined}
        title={data.sector_name}
        subtitle="Stock Performance vs NIFTY 50"
      />

      {/* Filter Controls */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: screens.md ? '16px 24px' : '16px' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between" wrap>
          {/* Left Side: Filters */}
          <Col xs={24} lg={18}>
            <Space wrap size={[16, 12]} align="start">
              {/* Analysis Mode */}
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Analysis Mode
                </Text>
                <Space>
                  <Text style={{ fontSize: 14, color: !multiTimeframe ? '#1890ff' : undefined, fontWeight: !multiTimeframe ? 600 : 400 }}>
                    Single
                  </Text>
                  <Switch
                    checked={multiTimeframe}
                    onChange={handleMultiTimeframeChange}
                  />
                  <Text style={{ fontSize: 14, color: multiTimeframe ? '#1890ff' : undefined, fontWeight: multiTimeframe ? 600 : 400 }}>
                    All Timeframes
                  </Text>
                </Space>
              </div>

              {/* Timeframe (only show in single mode) */}
              {!multiTimeframe && (
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    Timeframe
                  </Text>
                  <Select
                    value={timeframe}
                    onChange={setTimeframe}
                    options={TIMEFRAME_OPTIONS}
                    style={{ width: 140 }}
                    size="middle"
                  />
                </div>
              )}

              {/* Lookback */}
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Lookback
                </Text>
                <Space size={8}>
                  <InputNumber
                    min={1}
                    max={99}
                    value={lookback}
                    onChange={(val) => setLookback(val || 1)}
                    style={{ width: 100 }}
                    size="middle"
                  />
                  <Text type="secondary" style={{ fontSize: 14 }}>periods</Text>
                </Space>
              </div>

              {/* View Mode (hide in multi-timeframe mode) */}
              {!multiTimeframe && (
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    View Mode
                  </Text>
                  <Segmented
                    value={viewMode}
                    onChange={setViewMode}
                    options={[
                      { label: 'Table', value: 'table', icon: <TableOutlined /> },
                      { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
                    ]}
                  />
                </div>
              )}

              {/* Sort Controls (only for cards) */}
              {viewMode === 'cards' && (
                <>
                  <div>
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>
                      Sort By
                    </Text>
                    <Select
                      value={sortBy}
                      onChange={setSortBy}
                      style={{ width: 150 }}
                      size="middle"
                    >
                      <Select.Option value="rank">Rank</Select.Option>
                      <Select.Option value="name">Name</Select.Option>
                      <Select.Option value="price">Price</Select.Option>
                      <Select.Option value="change">Change %</Select.Option>
                      <Select.Option value="relative">Relative Perf.</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600 }}>
                      Order
                    </Text>
                    <Button
                      icon={sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      size="middle"
                    >
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                  </div>
                </>
              )}
            </Space>
          </Col>

          {/* Right Side: Refresh Button */}
          <Col xs={24} lg={6} style={{ textAlign: screens.lg ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block' }}>
              <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600, visibility: screens.lg ? 'hidden' : 'visible' }}>
                &nbsp;
              </Text>
              <Button
                type="primary"
                icon={<ReloadOutlined spin={loading} />}
                onClick={fetchData}
                loading={loading}
                size="middle"
                style={{ minWidth: 140 }}
              >
                Refresh Data
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Sentiment Summary Cards - 37.5% Dominant + 20.8% Each */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Dominant Sentiment Card (37.5% = 9/24) */}
        <Col xs={24} sm={24} md={9}>
          <Card
            style={{
              height: '100%',
              borderLeft: `4px solid ${
                sentiment.dominantColor === 'green' ? '#52c41a' : 
                sentiment.dominantColor === 'red' ? '#ff4d4f' : 
                '#d9d9d9'
              }`
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Dominant Sentiment</Text>
              
              <Space align="center" size={12}>
                {sentiment.dominantIcon && (
                  <span style={{ 
                    fontSize: 32, 
                    color: sentiment.dominantColor === 'green' ? '#52c41a' : 
                           sentiment.dominantColor === 'red' ? '#ff4d4f' : '#8c8c8c'
                  }}>
                    {sentiment.dominantIcon}
                  </span>
                )}
                <Text style={{ fontSize: 32, fontWeight: 700 }}>
                  {sentiment.dominantPercent}%
                </Text>
              </Space>
              
              <Text 
                strong 
                style={{ 
                  fontSize: 16,
                  color: sentiment.dominantColor === 'green' ? '#52c41a' : 
                         sentiment.dominantColor === 'red' ? '#ff4d4f' : '#8c8c8c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {sentiment.dominantSentiment}
              </Text>
              
              <Text type="secondary" style={{ fontSize: 13 }}>
                {sentiment.dominantSentiment} • {data.total_stocks} stocks
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Bullish Card (20.8% = 5/24) */}
        <Col xs={8} sm={8} md={5}>
          <Card 
            style={{ 
              height: '100%',
              borderTop: '3px solid #52c41a'
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Bullish</Text>
              <Space align="center" size={8}>
                <RiseOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
                  {sentiment.bullish}
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {sentiment.bullishPercent}% of stocks
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Neutral Card (20.8% = 5/24) */}
        <Col xs={8} sm={8} md={5}>
          <Card 
            style={{ 
              height: '100%',
              borderTop: '3px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Neutral</Text>
              <Space align="center" size={8}>
                <MinusOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
                <Text strong style={{ fontSize: 24, color: '#8c8c8c' }}>
                  {sentiment.neutral}
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {sentiment.neutralPercent}% of stocks
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Bearish Card (20.8% = 5/24) */}
        <Col xs={8} sm={8} md={5}>
          <Card 
            style={{ 
              height: '100%',
              borderTop: '3px solid #ff4d4f'
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Bearish</Text>
              <Space align="center" size={8}>
                <FallOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                <Text strong style={{ fontSize: 24, color: '#ff4d4f' }}>
                  {sentiment.bearish}
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {sentiment.bearishPercent}% of stocks
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Data Display - Table or Cards */}
      {viewMode === 'table' ? (
        <Card>
          <Table
            columns={columns}
            dataSource={data.stocks}
            rowKey="symbol"
            pagination={false}
            scroll={{ x: 800 }}
            size="small"
            showSorterTooltip={{ title: 'Click to sort' }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {getSortedStocks().map(renderStockCard)}
        </Row>
      )}
    </div>
  )
}

export default SectorStockDetail
