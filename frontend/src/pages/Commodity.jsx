/**
 * Commodity Page - Ant Design Implementation
 * Shows commodity futures prices and analysis
 */

import { useState, useEffect } from 'react'
import { 
  Card, Select, Button, Space, Tag, Typography, Table,
  Empty, Spin, Alert, Row, Col, Statistic, Grid, Switch
} from 'antd'
import { 
  ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RiseOutlined, FallOutlined, DollarOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'
import { useTheme } from '../context/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint} = Grid

const TIMEFRAMES = [
  { value: '1h', label: '1H', fullLabel: '1 Hour' },
  { value: '4h', label: '4H', fullLabel: '4 Hour' },
  { value: 'daily', label: 'Daily', fullLabel: 'Daily' },
  { value: 'weekly', label: 'Weekly', fullLabel: 'Weekly' },
  { value: 'monthly', label: 'Monthly', fullLabel: 'Monthly' },
  { value: '3m', label: '3M', fullLabel: '3 Month' },
]

const Commodity = () => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [multiTimeframe, setMultiTimeframe] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE_URL}/markets/commodities`
      const params = multiTimeframe ? { multi: true } : { timeframe }
      const response = await axios.get(url, { params })
      setData(response.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch commodity data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeframe, multiTimeframe])

  // Single timeframe data
  const commodities = !multiTimeframe && data?.commodities ? data.commodities : []
  const sentiment = !multiTimeframe && data?.sentiment ? data.sentiment : null

  // Multi-timeframe data
  const multiTimeframeSentiments = multiTimeframe && data?.sentiments ? data.sentiments : null
  const multiCommodities = multiTimeframe && data?.commodities ? data.commodities : []

  // Multi-timeframe table columns
  const multiTimeframeColumns = [
    {
      title: 'Commodity',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      fixed: screens.md ? 'left' : false,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{short}</Text>
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

  // Single timeframe table columns
  const tableColumns = [
    {
      title: 'Commodity',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{short}</Text>
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
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 130,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
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
      sorter: (a, b) => (a.change || 0) - (b.change || 0),
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

  return (
    <div>
      {/* Page Header */}
      <div 
        style={{ 
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(250, 173, 20, 0.15) 0%, rgba(250, 173, 20, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(250, 173, 20, 0.08) 0%, rgba(240, 242, 245, 0) 100%)',
          padding: screens.md ? '32px 24px' : '24px 16px',
          borderRadius: 2,
          marginBottom: 24,
          border: isDarkMode ? '1px solid rgba(250, 173, 20, 0.2)' : '1px solid rgba(250, 173, 20, 0.1)',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center" size={16}>
              <div 
                style={{ 
                  background: 'rgba(250, 173, 20, 0.1)',
                  borderRadius: 2,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarOutlined style={{ fontSize: 32, color: '#faad14' }} />
              </div>
              <div>
                <Title level={screens.md ? 2 : 3} style={{ margin: 0, marginBottom: 4 }}>
                  Commodity Markets
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Precious metals, energy & agricultural commodities
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filters */}
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
                    onChange={setMultiTimeframe}
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

              {/* Timeframe Selector */}
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

      {/* Multi-Timeframe Sentiment Cards */}
      {!loading && multiTimeframe && multiTimeframeSentiments && (
        <div style={{ marginBottom: 32 }}>
          <Text strong style={{ fontSize: 17, display: 'block', marginBottom: 16, fontWeight: 700 }}>
            Commodity Market Sentiment - All Timeframes
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

      {/* Single Timeframe Sentiment */}
      {!loading && !multiTimeframe && sentiment && commodities.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
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
              <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 12, fontWeight: 700 }}>
                Overall Commodity Sentiment
              </Text>
              <Space size={16} align="end">
                <Statistic
                  value={Math.round(sentiment.breadth.percentage)}
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
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 12 }}>
                Based on {sentiment.breadth.total} commodity instruments
              </Text>
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
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={<Text strong>Bullish</Text>}
                value={sentiment.breadth.positive}
                valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowUpOutlined />}
              />
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
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={<Text strong>Neutral</Text>}
                value={sentiment.breadth.neutral}
                valueStyle={{ color: '#999', fontSize: 32, fontWeight: 700 }}
              />
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
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Statistic
                title={<Text strong>Bearish</Text>}
                value={sentiment.breadth.negative}
                valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 700 }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Error */}
      {error && (
        <Alert
          message="Error Loading Commodity Data"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: screens.md ? 80 : 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 24 }}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                Loading Commodity Markets
              </Text>
              <Text type="secondary">Fetching latest commodity prices...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && !multiTimeframe && commodities.length === 0 && (
        <Card>
          <Empty description="No commodity data available" />
        </Card>
      )}

      {/* Commodity Table */}
      {!loading && ((multiTimeframe && multiCommodities.length > 0) || (!multiTimeframe && commodities.length > 0)) && (
        <Card 
          title={
            <Space size={12}>
              <DollarOutlined style={{ fontSize: 20, color: '#faad14' }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>Commodity Instruments</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  ({multiTimeframe ? multiCommodities.length : commodities.length} commodities)
                </Text>
              </div>
            </Space>
          }
          style={{
            boxShadow: isDarkMode 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={multiTimeframe ? multiTimeframeColumns : tableColumns}
            dataSource={(multiTimeframe ? multiCommodities : commodities).map((c, i) => ({ ...c, key: i }))}
            pagination={false}
            size="middle"
            scroll={{ x: multiTimeframe ? 1000 : 600 }}
            sticky={{ offsetHeader: 64 }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? '' : isDarkMode ? 'ant-table-row-striped-dark' : 'ant-table-row-striped'
            }
          />
        </Card>
      )}
    </div>
  )
}

export default Commodity
