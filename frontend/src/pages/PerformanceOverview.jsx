/**
 * Relative Performance Overview Page - Ant Design Implementation
 * Shows all sectors across ALL timeframes in one sortable table
 */

import { useState, useMemo } from 'react'
import { 
  Card, Table, Select, InputNumber, Button, Space, Tag, Modal, 
  Typography, Empty, Spin, Alert, Row, Col, Tooltip, Grid, Switch, Statistic, Progress
} from 'antd'
import { 
  ReloadOutlined, BarChartOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, MinusOutlined, RiseOutlined, FallOutlined
} from '@ant-design/icons'
import { getTopPerformers, getSectorStocks } from '../api/scanner'
import { useTheme } from '../context/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = ['3M', 'M', 'W', 'D', '4H', '1H']
const TF_KEY_MAP = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' }

const TIMEFRAME_OPTIONS = [
  { value: 'three_month', label: '3 Month' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
  { value: 'four_hour', label: '4 Hour' },
  { value: 'one_hour', label: '1 Hour' },
]

// Index group configurations
const INDEX_GROUPS = [
  { 
    key: 'sectorial', 
    title: 'Sectorial Indices', 
    subtitle: 'Sector-specific indices',
    icon: '📊',
    keywords: ['Auto', 'Bank', 'Financial', 'FMCG', 'IT', 'Metal', 'Pharma', 'PSU', 'Realty', 'Media', 'Infra', 'Energy', 'Commodities', 'Consumption', 'Healthcare', 'Oil', 'Private Bank', 'PSE']
  },
  { 
    key: 'broader_market', 
    title: 'Broader Market', 
    subtitle: 'Broad market indices',
    icon: '📈',
    keywords: ['NIFTY', 'SENSEX', 'Midcap', 'Smallcap', 'Next', 'Microcap', 'LargeMid', 'BSE']
  },
  { 
    key: 'thematic', 
    title: 'Thematic Indices', 
    subtitle: 'Theme-based indices',
    icon: '🎯',
    keywords: ['Alpha', 'Quality', 'Value', 'Growth', 'Momentum', 'Dividend', 'MNC', 'Consumer Durables', 'India Defence', 'Capital Markets', 'India Digital', 'Housing', 'Mobility', 'Manufacturing', 'Total Market', 'Services', 'MidSmall']
  }
]

// Categorize index into a group
const categorizeIndex = (indexName) => {
  const name = indexName.toUpperCase()
  
  for (const group of INDEX_GROUPS) {
    for (const keyword of group.keywords) {
      if (name.includes(keyword.toUpperCase())) {
        return group.key
      }
    }
  }
  
  return 'broader_market' // Default to broader market if no match
}

// Get status tag based on value
const getStatusTag = (value) => {
  if (value === null || value === undefined) return <Text type="secondary">-</Text>
  
  const color = value > 1 ? 'green' : value < -1 ? 'red' : 'default'
  const sign = value > 0 ? '+' : ''
  
  return (
    <Tag color={color} style={{ minWidth: 70, textAlign: 'center', fontFamily: 'monospace' }}>
      {sign}{value.toFixed(2)}%
    </Tag>
  )
}

// Get status icon
const getStatusIcon = (weeklyRs) => {
  if (weeklyRs > 1) return <ArrowUpOutlined style={{ color: '#52c41a' }} />
  if (weeklyRs < -1) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
  return <MinusOutlined style={{ color: '#999' }} />
}

const PerformanceOverview = () => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [lookback, setLookback] = useState(1)
  const [isMultiTimeframe, setIsMultiTimeframe] = useState(false)
  const [timeframe, setTimeframe] = useState('daily')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSector, setModalSector] = useState(null)
  const [stocksData, setStocksData] = useState(null)
  const [stocksLoading, setStocksLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTopPerformers(100, 'all', lookback)
      setData(result)
    } catch (err) {
      const detail = err.response?.data?.detail
      let errorMsg = 'Failed to fetch data'
      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        errorMsg = detail[0].msg
      } else if (err.message) {
        errorMsg = err.message
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Build unified sector list from all categories
  const allSectors = useMemo(() => {
    if (!data || typeof data !== 'object') return []

    const sectorsMap = new Map()
    const categories = ['outperforming', 'neutral', 'underperforming']

    categories.forEach(category => {
      const categoryData = data[category]
      if (!categoryData || typeof categoryData !== 'object') return

      TIMEFRAMES.forEach(tf => {
        const items = categoryData[tf]
        if (!Array.isArray(items)) return
        
        items.forEach(item => {
          if (!item || !item.name) return
          
          if (!sectorsMap.has(item.name)) {
            sectorsMap.set(item.name, {
              key: item.name,
              name: item.name,
              symbol: item.symbol || '',
              values: {},
              group: categorizeIndex(item.name) // Add group categorization
            })
          }
          sectorsMap.get(item.name).values[tf] = item.rs
        })
      })
    })

    return Array.from(sectorsMap.values())
  }, [data])

  // Group sectors by index type
  const groupedSectors = useMemo(() => {
    const grouped = {
      sectorial: [],
      broader_market: [],
      thematic: []
    }

    allSectors.forEach(sector => {
      const groupKey = sector.group || 'broader_market'
      if (grouped[groupKey]) {
        grouped[groupKey].push(sector)
      }
    })

    return grouped
  }, [allSectors])

  const openStocksModal = async (sectorName) => {
    setModalSector(sectorName)
    setModalOpen(true)
    setStocksLoading(true)
    setStocksData(null)

    try {
      const result = await getSectorStocks(sectorName, 'weekly', lookback)
      setStocksData(result)
    } catch (err) {
      console.error('Failed to fetch stocks:', err)
    } finally {
      setStocksLoading(false)
    }
  }

  // Get timeframe label from value
  const getTimeframeLabel = (tfValue) => {
    const mapping = {
      'three_month': '3M',
      'monthly': 'M',
      'weekly': 'W',
      'daily': 'D',
      'four_hour': '4H',
      'one_hour': '1H'
    }
    return mapping[tfValue] || tfValue
  }

  // Single timeframe columns
  const singleTimeframeColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: 'Index / Sector',
      dataIndex: 'name',
      key: 'name',
      width: screens.md ? 280 : 200,
      render: (name, record) => {
        const tfLabel = getTimeframeLabel(timeframe)
        return (
          <Space>
            {getStatusIcon(record.values?.[tfLabel])}
            <Text strong style={{ cursor: 'pointer' }} onClick={() => openStocksModal(name)}>
              {name}
            </Text>
          </Space>
        )
      },
    },
    {
      title: TIMEFRAME_OPTIONS.find(tf => tf.value === timeframe)?.label || 'Timeframe',
      key: 'selected_tf',
      align: 'center',
      width: 120,
      sorter: (a, b) => {
        const tfLabel = getTimeframeLabel(timeframe)
        return (a.values?.[tfLabel] ?? -999) - (b.values?.[tfLabel] ?? -999)
      },
      defaultSortOrder: 'descend',
      render: (_, record) => {
        const tfLabel = getTimeframeLabel(timeframe)
        return getStatusTag(record.values?.[tfLabel])
      },
    },
  ]

  // Multi-timeframe columns
  const multiTimeframeColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: 'Index / Sector',
      dataIndex: 'name',
      key: 'name',
      fixed: screens.md ? false : 'left',
      width: screens.md ? 220 : 150,
      render: (name, record) => (
        <Space>
          {getStatusIcon(record.values?.['W'])}
          <Text strong style={{ cursor: 'pointer' }} onClick={() => openStocksModal(name)}>
            {name}
          </Text>
        </Space>
      ),
    },
    ...TIMEFRAMES.map(tf => ({
      title: tf,
      key: tf,
      align: 'center',
      width: 90,
      sorter: (a, b) => (a.values?.[tf] ?? -999) - (b.values?.[tf] ?? -999),
      defaultSortOrder: tf === 'W' ? 'descend' : null,
      render: (_, record) => getStatusTag(record.values?.[tf]),
    })),
  ]

  // Choose columns based on mode
  const columns = isMultiTimeframe ? multiTimeframeColumns : singleTimeframeColumns

  // Stocks modal columns
  const stockColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: 'Stock',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name, record) => (
        <Space>
          {getStatusIcon(record.relative_strength?.weekly)}
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    ...TIMEFRAMES.map(tf => ({
      title: tf,
      key: tf,
      align: 'center',
      width: 85,
      sorter: (a, b) => {
        const tfKey = TF_KEY_MAP[tf]
        return (a.relative_strength?.[tfKey] ?? -999) - (b.relative_strength?.[tfKey] ?? -999)
      },
      defaultSortOrder: tf === 'W' ? 'descend' : null,
      render: (_, record) => {
        const tfKey = TF_KEY_MAP[tf]
        return getStatusTag(record.relative_strength?.[tfKey])
      },
    })),
  ]

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
              <BarChartOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                  Relative Performance Overview
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Relative Comparision of all major Indices, Sectors v/s Nifty 50
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

              {/* Timeframe - Only in single mode */}
              {!isMultiTimeframe && (
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
                    Timeframe
                  </Text>
                  <Select
                    value={timeframe}
                    onChange={setTimeframe}
                    options={TIMEFRAME_OPTIONS}
                    style={{ width: screens.md ? 140 : 120 }}
                    size={screens.md ? 'middle' : 'large'}
                  />
                </div>
              )}

              {/* Lookback */}
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Lookback
                </Text>
                <Space>
                  <InputNumber
                    min={1}
                    max={99}
                    value={lookback}
                    onChange={(val) => setLookback(val || 1)}
                    style={{ width: 80 }}
                    size={screens.md ? 'middle' : 'large'}
                  />
                  <Text type="secondary">periods</Text>
                </Space>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={6} lg={8} style={{ textAlign: screens.md ? 'right' : 'left' }}>
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

      {/* Overall Sentiment */}
      {!loading && data && allSectors.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={10}>
            <Card
              style={{
                background: (() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                  const totalCount = allSectors.length
                  const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                  const isPositive = bullishPercent >= 50
                  return isPositive
                    ? (isDarkMode
                        ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.04) 100%)'
                        : 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)')
                    : (isDarkMode
                        ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.04) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.02) 100%)')
                })(),
                borderLeft: (() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                  const totalCount = allSectors.length
                  const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                  return `4px solid ${bullishPercent >= 50 ? '#52c41a' : '#ff4d4f'}`
                })(),
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
                    Overall Market Sentiment ({TIMEFRAME_OPTIONS.find(tf => tf.value === (isMultiTimeframe ? 'weekly' : timeframe))?.label})
                  </Text>
                  <Space size={16} align="end">
                    <Statistic
                      value={(() => {
                        const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                        const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                        const totalCount = allSectors.length
                        return Math.round((bullishCount / totalCount) * 100)
                      })()}
                      suffix="%"
                      prefix={(() => {
                        const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                        const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                        const totalCount = allSectors.length
                        const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                        return bullishPercent >= 50 ? <RiseOutlined /> : <FallOutlined />
                      })()}
                      valueStyle={{
                        color: (() => {
                          const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                          const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                          const totalCount = allSectors.length
                          const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                          return bullishPercent >= 50 ? '#52c41a' : '#ff4d4f'
                        })(),
                        fontSize: 40,
                        fontWeight: 700
                      }}
                    />
                    <Tag
                      color={(() => {
                        const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                        const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                        const totalCount = allSectors.length
                        const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                        return bullishPercent >= 50 ? 'green' : 'red'
                      })()}
                      style={{ fontSize: 16, padding: '6px 16px', fontWeight: 600 }}
                    >
                      {(() => {
                        const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                        const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                        const totalCount = allSectors.length
                        const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                        return bullishPercent >= 50 ? 'BULLISH' : 'BEARISH'
                      })()}
                    </Tag>
                  </Space>
                </div>
                <Progress
                  percent={(() => {
                    const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                    const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                    const totalCount = allSectors.length
                    return Math.round((bullishCount / totalCount) * 100)
                  })()}
                  strokeColor={{
                    '0%': (() => {
                      const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                      const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                      const totalCount = allSectors.length
                      const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                      return bullishPercent >= 50 ? '#52c41a' : '#ff4d4f'
                    })(),
                    '100%': (() => {
                      const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                      const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                      const totalCount = allSectors.length
                      const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                      return bullishPercent >= 50 ? '#87d068' : '#f5222d'
                    })(),
                  }}
                  trailColor={isDarkMode ? '#434343' : '#f0f0f0'}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {(() => {
                    const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                    const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                    const totalCount = allSectors.length
                    const bullishPercent = Math.round((bullishCount / totalCount) * 100)
                    return bullishPercent >= 50 ? 'Bullish' : 'Bearish'
                  })()} • {allSectors.length} indices
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
                value={(() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  return allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                })()}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowUpOutlined style={{ fontSize: 24 }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {(() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
                  return Math.round((bullishCount / allSectors.length) * 100)
                })()}% of indices
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
                value={(() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  return allSectors.filter(s => {
                    const val = s.values?.[tfLabel] || 0
                    return val >= -1 && val <= 1
                  }).length
                })()}
                valueStyle={{ color: '#999', fontSize: 32, fontWeight: 700 }}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {(() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  const neutralCount = allSectors.filter(s => {
                    const val = s.values?.[tfLabel] || 0
                    return val >= -0.5 && val <= 0.5
                  }).length
                  return Math.round((neutralCount / allSectors.length) * 100)
                })()}% of indices
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
                value={(() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  return allSectors.filter(s => (s.values?.[tfLabel] || 0) < -0.5).length
                })()}
                valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowDownOutlined style={{ fontSize: 24 }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {(() => {
                  const tfLabel = isMultiTimeframe ? 'W' : getTimeframeLabel(timeframe)
                  const bearishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) < -0.5).length
                  return Math.round((bearishCount / allSectors.length) * 100)
                })()}% of indices
              </Text>
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
          action={
            <Button size="small" onClick={fetchData}>
              Retry
            </Button>
          }
        />
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading all timeframes...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && !data && (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text>No data loaded</Text>
                <Text type="secondary">Click Refresh to load sector performance across all timeframes</Text>
              </Space>
            }
          >
            <Button type="primary" onClick={fetchData}>
              Load Data
            </Button>
          </Empty>
        </Card>
      )}

      {/* Index Group Tables */}
      {!loading && data && (
        <div>
          {INDEX_GROUPS.map(groupInfo => {
            const groupData = groupedSectors[groupInfo.key]
            if (!groupData || groupData.length === 0) return null

            return (
              <div key={groupInfo.key} style={{ marginBottom: 24 }}>
                <Card
                  title={
                    <Space size={12}>
                      <span style={{ fontSize: 20 }}>{groupInfo.icon}</span>
                      <div>
                        <Text strong style={{ fontSize: 16 }}>{groupInfo.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          ({groupData.length} indices)
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
                    dataSource={groupData}
                    pagination={false}
                    scroll={{ x: 800 }}
                    size={screens.md ? 'middle' : 'small'}
                    onRow={(record) => ({
                      onClick: () => openStocksModal(record.name),
                      style: { cursor: 'pointer' },
                    })}
                    rowClassName={(record) => {
                      const w = record.values?.['W']
                      if (w > 1) return 'ant-table-row-success'
                      if (w < -1) return 'ant-table-row-error'
                      return ''
                    }}
                  />
                </Card>
              </div>
            )
          })}

          {/* Legend */}
          <Card size="small">
            <Row justify="center" gutter={[24, 8]}>
              <Col>
                <Space>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  <Text>Outperforming (RS &gt; 1%)</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <MinusOutlined style={{ color: '#999' }} />
                  <Text>Neutral (-1% to +1%)</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                  <Text>Underperforming (RS &lt; -1%)</Text>
                </Space>
              </Col>
            </Row>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                💡 Click any row to see top stocks • Click column headers to sort
              </Text>
            </div>
          </Card>
        </div>
      )}

      {/* Stocks Modal */}
      <Modal
        title={`📈 ${modalSector} - Stocks`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={screens.md ? 1000 : '95%'}
        centered
      >
        {stocksLoading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading stocks...</Text>
            </div>
          </div>
        )}

        {!stocksLoading && stocksData?.stocks?.length > 0 && (
          <>
            <Table
              columns={stockColumns}
              dataSource={stocksData.stocks.map(s => ({ ...s, key: s.symbol }))}
              pagination={{ pageSize: 20, size: 'small' }}
              scroll={{ x: 700 }}
              size="small"
            />
            <Row justify="center" gutter={[16, 8]} style={{ marginTop: 16 }}>
              <Col>
                <Space>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary">Outperforming</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <MinusOutlined style={{ color: '#999' }} />
                  <Text type="secondary">Neutral</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                  <Text type="secondary">Underperforming</Text>
                </Space>
              </Col>
            </Row>
          </>
        )}

        {!stocksLoading && (!stocksData?.stocks || stocksData.stocks.length === 0) && (
          <Empty description="No stocks data available" />
        )}
      </Modal>
    </div>
  )
}

export default PerformanceOverview
