/**
 * Performance Overview Page - Ant Design Implementation
 * Shows all sectors across ALL timeframes in one sortable table
 */

import { useState, useMemo } from 'react'
import { 
  Card, Table, Select, InputNumber, Button, Space, Tag, Modal, 
  Typography, Empty, Spin, Alert, Row, Col, Tooltip, Grid
} from 'antd'
import { 
  ReloadOutlined, BarChartOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, MinusOutlined 
} from '@ant-design/icons'
import { getTopPerformers, getSectorStocks } from '../api/scanner'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = ['3M', 'M', 'W', 'D', '4H', '1H']
const TF_KEY_MAP = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' }

const INDEX_GROUPS = [
  { value: 'all', label: 'All Indices' },
  { value: 'sectorial', label: 'Sectorial' },
  { value: 'broad_market', label: 'Broad Market' },
  { value: 'thematic', label: 'Thematic' }
]

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
  const [indexGroup, setIndexGroup] = useState('all')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSector, setModalSector] = useState(null)
  const [stocksData, setStocksData] = useState(null)
  const [stocksLoading, setStocksLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTopPerformers(100, indexGroup, lookback)
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
              values: {}
            })
          }
          sectorsMap.get(item.name).values[tf] = item.rs
        })
      })
    })

    return Array.from(sectorsMap.values())
  }, [data])

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

  // Main table columns
  const columns = [
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center">
            <BarChartOutlined style={{ fontSize: 28, color: '#1890ff' }} />
            <div>
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                Performance Overview
              </Title>
              <Text type="secondary">
                {INDEX_GROUPS.find(g => g.value === indexGroup)?.label || 'All'} vs NIFTY 50
                {data && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    Lookback: {data.lookback || lookback}
                  </Tag>
                )}
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>INDEX GROUP</Text>
              <Select
                value={indexGroup}
                onChange={setIndexGroup}
                options={INDEX_GROUPS}
                style={{ width: '100%' }}
                size={screens.md ? 'middle' : 'large'}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>LOOKBACK</Text>
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
            </Space>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <div style={{ display: 'flex', justifyContent: screens.md ? 'flex-end' : 'flex-start', marginTop: screens.md ? 20 : 0 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined spin={loading} />}
                onClick={fetchData}
                loading={loading}
                size={screens.md ? 'middle' : 'large'}
                style={{ minWidth: 120 }}
              >
                {loading ? 'Loading...' : 'Refresh'}
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

      {/* Data Table */}
      {!loading && data && (
        <>
          <Card bodyStyle={{ padding: screens.md ? 16 : 8 }}>
            <Table
              columns={columns}
              dataSource={allSectors}
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

          {/* Legend */}
          <Card size="small" style={{ marginTop: 16 }}>
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
        </>
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
