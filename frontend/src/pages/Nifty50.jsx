/**
 * Nifty 50 Page - Ant Design Implementation
 * Shows Nifty 50 heavyweight stocks performance
 */

import { useState, useEffect } from 'react'
import { 
  Card, Table, Select, InputNumber, Button, Space, Tag, 
  Typography, Empty, Spin, Alert, Row, Col, Grid
} from 'antd'
import { 
  ReloadOutlined, StockOutlined, ArrowUpOutlined, 
  ArrowDownOutlined, MinusOutlined 
} from '@ant-design/icons'
import { getNifty50Stocks } from '../api/scanner'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = ['3M', 'M', 'W', 'D', '4H', '1H']
const TF_KEY_MAP = { '3M': 'three_month', 'M': 'monthly', 'W': 'weekly', 'D': 'daily', '4H': 'four_hour', '1H': 'one_hour' }

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

const getStatusIcon = (weeklyRs) => {
  if (weeklyRs > 1) return <ArrowUpOutlined style={{ color: '#52c41a' }} />
  if (weeklyRs < -1) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
  return <MinusOutlined style={{ color: '#999' }} />
}

const Nifty50 = () => {
  const screens = useBreakpoint()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [lookback, setLookback] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getNifty50Stocks(lookback)
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to fetch Nifty 50 data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
      dataIndex: 'name',
      key: 'name',
      fixed: screens.md ? false : 'left',
      width: screens.md ? 200 : 120,
      render: (name, record) => (
        <Space>
          {getStatusIcon(record.relative_strength?.weekly)}
          <div>
            <Text strong>{name}</Text>
            <div><Text type="secondary" style={{ fontSize: 11 }}>{record.symbol}</Text></div>
          </div>
        </Space>
      ),
    },
    ...TIMEFRAMES.map(tf => ({
      title: tf,
      key: tf,
      align: 'center',
      width: 90,
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
            <StockOutlined style={{ fontSize: 28, color: '#1890ff' }} />
            <div>
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                Nifty 50
              </Title>
              <Text type="secondary">
                Heavyweight stocks relative strength vs NIFTY 50
                {data?.stocks && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>{data.stocks.length} stocks</Tag>
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
          <Col xs={24} sm={12} md={18}>
            <div style={{ display: 'flex', justifyContent: screens.md ? 'flex-end' : 'flex-start', marginTop: screens.md ? 20 : 0 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined spin={loading} />}
                onClick={fetchData}
                loading={loading}
                size={screens.md ? 'middle' : 'large'}
              >
                Refresh
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
              <Text type="secondary">Loading Nifty 50 stocks...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && (!data?.stocks || data.stocks.length === 0) && (
        <Card>
          <Empty description="No stocks data available" />
        </Card>
      )}

      {/* Data Table */}
      {!loading && data?.stocks?.length > 0 && (
        <Card bodyStyle={{ padding: screens.md ? 16 : 8 }}>
          <Table
            columns={columns}
            dataSource={data.stocks.map(s => ({ ...s, key: s.symbol }))}
            pagination={{ 
              pageSize: 50,
              showTotal: (total) => `Total ${total} stocks`,
              size: 'small',
            }}
            scroll={{ x: 800 }}
            size={screens.md ? 'middle' : 'small'}
          />
        </Card>
      )}
    </div>
  )
}

export default Nifty50
