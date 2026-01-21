/**
 * Relative Performance Overview Page - Refactored with Reusable Components
 * Shows all sectors across ALL timeframes in one sortable table
 */

import { useState, useMemo } from 'react'
import { 
  Card, Table, Select, InputNumber, Button, Space, Tag, Modal, 
  Typography, Row, Col, Tooltip, Grid
} from 'antd'
import { 
  ReloadOutlined, BarChartOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, MinusOutlined
} from '@ant-design/icons'
import { getTopPerformers, getSectorStocks } from '../api/scanner'
import {
  PageHeader,
  FilterControls,
  SentimentCards,
  LoadingState,
  EmptyState
} from '../components/markets'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = ['3M', 'M', 'W', 'D', '4H', '1H']
const TF_KEY_MAP = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' }

const TIMEFRAME_OPTIONS = [
  { value: 'three_month', label: '3 Month', fullLabel: '3 Month' },
  { value: 'monthly', label: 'Monthly', fullLabel: 'Monthly' },
  { value: 'weekly', label: 'Weekly', fullLabel: 'Weekly' },
  { value: 'daily', label: 'Daily', fullLabel: 'Daily' },
  { value: 'four_hour', label: '4 Hour', fullLabel: '4 Hour' },
  { value: 'one_hour', label: '1 Hour', fullLabel: '1 Hour' },
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [lookback, setLookback] = useState(1)
  const [multiTimeframe, setMultiTimeframe] = useState(false)
  const [timeframe, setTimeframe] = useState('daily')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSector, setModalSector] = useState(null)
  const [stocksData, setStocksData] = useState(null)
  const [stocksLoading, setStocksLoading] = useState(false)

  const fetchData = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTopPerformers(100, 'all', lookback, signal)
      setData(result)
    } catch (err) {
      if (err.name !== 'CanceledError') {
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
      }
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
              name: item.name, 
              category: categorizeIndex(item.name),
              values: {} 
            })
          }
          
          sectorsMap.get(item.name).values[tf] = item.rs
        })
      })
    })

    return Array.from(sectorsMap.values())
  }, [data])

  // Group sectors by category
  const groupedSectors = useMemo(() => {
    const grouped = {}
    INDEX_GROUPS.forEach(group => {
      grouped[group.key] = allSectors.filter(s => s.category === group.key)
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

  // Calculate sentiment for selected timeframe
  const calculateSentiment = () => {
    const tfLabel = multiTimeframe ? 'W' : getTimeframeLabel(timeframe)
    const bullishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) > 0.5).length
    const neutralCount = allSectors.filter(s => {
      const val = s.values?.[tfLabel] || 0
      return val >= -0.5 && val <= 0.5
    }).length
    const bearishCount = allSectors.filter(s => (s.values?.[tfLabel] || 0) < -0.5).length
    const totalCount = allSectors.length
    const bullishPercent = Math.round((bullishCount / totalCount) * 100)

    return {
      bullish: bullishCount,
      neutral: neutralCount,
      bearish: bearishCount,
      total: totalCount,
      bullishPercent
    }
  }

  const sentiment = allSectors.length > 0 ? calculateSentiment() : null

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
      title: <Tooltip title={TF_KEY_MAP[tf]}><Text strong>{tf}</Text></Tooltip>,
      dataIndex: ['values', tf],
      key: tf,
      align: 'center',
      width: 100,
      sorter: (a, b) => (a.values?.[tf] ?? -999) - (b.values?.[tf] ?? -999),
      render: (value) => getStatusTag(value),
    })),
  ]

  // Render table for a specific group
  const renderGroupTable = (groupInfo) => {
    const groupData = groupedSectors[groupInfo.key]
    if (!groupData || groupData.length === 0) return null

    return (
      <div key={groupInfo.key} style={{ marginBottom: 24 }}>
        <Card
          title={
            <Space>
              <span style={{ fontSize: 20 }}>{groupInfo.icon}</span>
              <div>
                <Text strong style={{ fontSize: 16 }}>{groupInfo.title}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  ({groupData.length} indices)
                </Text>
              </div>
            </Space>
          }
          size="small"
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={multiTimeframe ? multiTimeframeColumns : singleTimeframeColumns}
            dataSource={groupData.map((item, i) => ({ ...item, key: i }))}
            pagination={false}
            size="small"
            scroll={{ x: multiTimeframe ? 900 : 500 }}
          />
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon={BarChartOutlined}
        title="Relative Performance Overview"
        subtitle="Relative Comparision of all major Indices, Sectors v/s Nifty 50"
      />

      {/* Filter Controls - Custom for this page */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between" wrap>
          <Col xs={24} md={18} lg={16}>
            <Space wrap size={16}>
              <FilterControls
                showAnalysisMode
                multiTimeframe={multiTimeframe}
                onMultiTimeframeChange={setMultiTimeframe}
                showTimeframeSelector
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                timeframes={TIMEFRAME_OPTIONS}
                showViewMode={false}
                showRefresh={false}
                style={{ marginBottom: 0, boxShadow: 'none' }}
              />
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

      {/* Sentiment Cards */}
      {!loading && sentiment && (
        <SentimentCards
          sentiment={sentiment}
          total={sentiment.total}
          subtitle={`${sentiment.bullishPercent >= 50 ? 'Bullish' : 'Bearish'} • ${sentiment.total} indices`}
        />
      )}

      {/* Loading State */}
      {loading && (
        <LoadingState
          title="Loading Performance Data"
          message="Fetching relative performance data..."
        />
      )}

      {/* Empty State */}
      {!loading && error && (
        <EmptyState
          title="Error Loading Data"
          description={error}
          onRefresh={() => fetchData()}
        />
      )}

      {/* Group Tables */}
      {!loading && !error && data && (
        <div>
          {INDEX_GROUPS.map(group => renderGroupTable(group))}
        </div>
      )}

      {/* Stocks Modal */}
      <Modal
        title={<><BarChartOutlined /> Stocks in {modalSector}</>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={screens.lg ? 900 : '95%'}
      >
        {stocksLoading && <div style={{ textAlign: 'center', padding: 40 }}><LoadingState title="Loading Stocks" message="Fetching stock data..." /></div>}
        
        {!stocksLoading && stocksData && (
          <Table
            columns={[
              { title: '#', key: 'idx', width: 50, render: (_, __, i) => i + 1 },
              { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
              { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
              { 
                title: 'RS vs Nifty 50', 
                dataIndex: 'rs', 
                key: 'rs',
                sorter: (a, b) => (a.rs || 0) - (b.rs || 0),
                defaultSortOrder: 'descend',
                render: (rs) => getStatusTag(rs)
              },
            ]}
            dataSource={stocksData.stocks?.map((s, i) => ({ ...s, key: i })) || []}
            pagination={false}
            size="small"
            scroll={{ y: 400 }}
          />
        )}
      </Modal>
    </div>
  )
}

export default PerformanceOverview
