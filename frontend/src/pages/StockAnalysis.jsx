/**
 * Stock Analysis Page - Ant Design Implementation
 * PAPA + SMM Checklist with technical analysis
 */

import React, { useState, useEffect } from 'react'
import { 
  Card, Button, Space, Tag, Typography, Spin, Alert, 
  Row, Col, Tooltip, Descriptions, Grid, Divider, theme
} from 'antd'
import { 
  ArrowLeftOutlined, ReloadOutlined, RiseOutlined, 
  FallOutlined, MinusOutlined
} from '@ant-design/icons'
import { getStockAnalysis } from '../api/scanner'
import { useTheme } from '../context/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

// Color mappings
const getTrendColor = (color) => {
  const map = { green: 'green', lightgreen: 'lime', red: 'red', orange: 'orange', yellow: 'gold' }
  return map[color] || 'default'
}

const getRsiColor = (color) => {
  const map = { green: 'green', lightgreen: 'lime', gray: 'default', yellow: 'gold', orange: 'orange', red: 'red' }
  return map[color] || 'default'
}

const getMacdColor = (color) => {
  const map = { green: 'green', cyan: 'cyan', yellow: 'gold', red: 'red', pink: 'magenta', orange: 'orange' }
  return map[color] || 'default'
}

const getTrendEmoji = (trend) => {
  if (!trend) return '⚪'
  if (trend === 'HH-HL') return '🟢'
  if (trend === 'LL-LH') return '🔴'
  if (trend === 'LL→HL') return '🟡'
  if (trend === 'HH→LH') return '🟠'
  return '⚪'
}

const getMacdEmoji = (signal) => {
  if (!signal) return '⚪'
  if (signal.includes('PCO')) return '🟢'
  if (signal.includes('NCO')) return '🔴'
  if (signal.includes('Up Tick')) return '📈'
  if (signal.includes('Down Tick')) return '📉'
  return '⚪'
}

// Timeframe structure with groups (8 columns total)
// Super TIDE: M, W | TIDE: D, 4H | WAVE: 4H, 1H | RIPPLE: 1H, 15M
const TIMEFRAMES = [
  { key: 'monthly', label: 'M', group: 'Super TIDE' },
  { key: 'weekly', label: 'W', group: 'Super TIDE' },
  { key: 'daily', label: 'D', group: 'TIDE' },
  { key: '4h', label: '4H', group: 'TIDE' },
  { key: '4h', label: '4H', group: 'WAVE' },
  { key: '1h', label: '1H', group: 'WAVE' },
  { key: '1h', label: '1H', group: 'RIPPLE' },
  { key: '15m', label: '15M', group: 'RIPPLE' },
]

const StockAnalysis = ({ symbol, onBack }) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()
  const { token } = theme.useToken()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Theme-aware colors
  const headerBg = isDarkMode ? '#1d1d1d' : '#fafafa'
  const borderColor = isDarkMode ? '#303030' : '#f0f0f0'
  const separatorColor = isDarkMode ? '#434343' : '#d9d9d9'

  useEffect(() => {
    if (symbol) fetchAnalysis()
  }, [symbol])

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getStockAnalysis(symbol)
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading analysis for {symbol}...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
          Back to Scanner
        </Button>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={fetchAnalysis}>Retry</Button>}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
          Back to Scanner
        </Button>
        <Alert message={`No data available for ${symbol}`} type="warning" showIcon />
      </div>
    )
  }

  const dowData = data.checklist?.['1_dow_theory']?.data
  const rsiData = data.checklist?.['6_indicators']?.indicators?.rsi?.data
  const macdData = data.checklist?.['6_indicators']?.indicators?.macd?.data
  const opportunity = data.opportunity

  // Render indicator cell
  const renderTrendCell = (tfKey) => {
    const tf = dowData?.timeframes?.[tfKey]
    if (!tf) return <Tag>-</Tag>
    
    return (
      <Tooltip title={`Trend: ${tf.trend || '-'}`}>
        <Tag color={getTrendColor(tf.color)} style={{ minWidth: 70, textAlign: 'center' }}>
          {getTrendEmoji(tf.trend)} {tf.last_high_label || '-'}/{tf.last_low_label || '-'}
        </Tag>
      </Tooltip>
    )
  }

  const renderRsiCell = (tfKey) => {
    const tf = rsiData?.timeframes?.[tfKey]
    if (!tf) return <Tag>-</Tag>
    
    return (
      <Tooltip title={tf.zone || ''}>
        <Tag color={getRsiColor(tf.color)} style={{ minWidth: 60, textAlign: 'center' }}>
          {tf.value ?? '-'}
        </Tag>
      </Tooltip>
    )
  }

  const renderMacdCell = (tfKey) => {
    const tf = macdData?.timeframes?.[tfKey]
    if (!tf) return <Tag>-</Tag>
    
    const tick = tf.tick === 'UP' ? '↑' : tf.tick === 'DOWN' ? '↓' : ''
    
    return (
      <Tooltip 
        title={
          <div>
            <div>MACD: {tf.macd_value?.toFixed(2) || '-'}</div>
            <div>Signal: {tf.signal_value?.toFixed(2) || '-'}</div>
            <div>Zone: {tf.zone || '-'}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold' }}>{tf.action || '-'}</div>
          </div>
        }
      >
        <Tag color={getMacdColor(tf.color)} style={{ minWidth: 60, textAlign: 'center' }}>
          {getMacdEmoji(tf.signal)} {tf.crossover || ''}{tick}
        </Tag>
      </Tooltip>
    )
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Back
            </Button>
            <div>
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                {data.symbol}
              </Title>
              <Space size="small">
                <Text type="secondary">{data.name}</Text>
                {data.sector && <Tag>{data.sector}</Tag>}
              </Space>
            </div>
          </Space>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={fetchAnalysis}>
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Opportunity Banner */}
      {opportunity && (
        <Card 
          style={{ 
            marginBottom: 24,
            background: isDarkMode 
              ? (opportunity.color === 'green' ? '#162312' : opportunity.color === 'red' ? '#2a1215' : '#2b2111')
              : (opportunity.color === 'green' ? '#f6ffed' : opportunity.color === 'red' ? '#fff2f0' : '#fffbe6'),
            borderColor: opportunity.color === 'green' ? '#52c41a' : 
                        opportunity.color === 'red' ? '#ff4d4f' : '#faad14'
          }}
        >
          <Row gutter={[16, 8]} align="middle">
            <Col xs={24} sm={8}>
              <Text strong style={{ fontSize: 18 }}>
                {opportunity.color === 'green' ? <RiseOutlined style={{ color: '#52c41a' }} /> : 
                 opportunity.color === 'red' ? <FallOutlined style={{ color: '#ff4d4f' }} /> : 
                 <MinusOutlined style={{ color: '#faad14' }} />}
                {' '}{opportunity.type}
              </Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text>{opportunity.strategy}</Text>
            </Col>
            <Col xs={24} sm={8}>
              <Text type="secondary">{opportunity.description}</Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* Analysis Table */}
      <Card title="PAPA + SMM Checklist" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: headerBg }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${borderColor}`, minWidth: 150 }}>
                  Indicator
                </th>
                <th colSpan="2" style={{ padding: '12px 8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>
                  Super TIDE
                </th>
                <th colSpan="2" style={{ padding: '12px 8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>
                  TIDE
                </th>
                <th colSpan="2" style={{ padding: '12px 8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>
                  WAVE
                </th>
                <th colSpan="2" style={{ padding: '12px 8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>
                  RIPPLE
                </th>
              </tr>
              <tr style={{ background: headerBg }}>
                <th style={{ padding: '8px', borderBottom: `2px solid ${borderColor}` }}></th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12 }}>M</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12, borderRight: `2px solid ${separatorColor}` }}>W</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12 }}>D</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12, borderRight: `2px solid ${separatorColor}` }}>4H</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12 }}>4H</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12, borderRight: `2px solid ${separatorColor}` }}>1H</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12 }}>1H</th>
                <th style={{ padding: '8px', textAlign: 'center', borderBottom: `2px solid ${borderColor}`, fontSize: 12 }}>15M</th>
              </tr>
            </thead>
            <tbody>
              {/* Dow Theory Row */}
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>
                  Dow Theory (HH/HL)
                </td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderTrendCell('monthly')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderTrendCell('weekly')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderTrendCell('daily')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderTrendCell('4h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderTrendCell('4h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderTrendCell('1h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderTrendCell('1h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderTrendCell('15m')}</td>
              </tr>

              {/* RSI Row */}
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>
                  RSI (14)
                </td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderRsiCell('monthly')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderRsiCell('weekly')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderRsiCell('daily')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderRsiCell('4h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderRsiCell('4h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderRsiCell('1h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderRsiCell('1h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderRsiCell('15m')}</td>
              </tr>

              {/* MACD Row */}
              <tr>
                <td style={{ padding: '12px 8px', fontWeight: 500, borderBottom: `1px solid ${borderColor}` }}>
                  MACD (12,26,9)
                </td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderMacdCell('monthly')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderMacdCell('weekly')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderMacdCell('daily')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderMacdCell('4h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderMacdCell('4h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}`, borderRight: `2px solid ${separatorColor}` }}>{renderMacdCell('1h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderMacdCell('1h')}</td>
                <td style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>{renderMacdCell('15m')}</td>
              </tr>

              {/* Coming Soon */}
              {['Stochastic', 'DMI (+DI/-DI)', 'ADX', 'Bollinger Band', 'EMAs'].map(indicator => (
                <tr key={indicator}>
                  <td style={{ padding: '12px 8px', fontWeight: 500, borderBottom: `1px solid ${borderColor}`, color: isDarkMode ? '#666' : '#999' }}>
                    {indicator}
                  </td>
                  <td colSpan="8" style={{ padding: '8px', textAlign: 'center', borderBottom: `1px solid ${borderColor}` }}>
                    <Text type="secondary" italic>Coming Soon...</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legends */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small" title="Dow Theory Legend">
            <Space wrap>
              <Tag color="green">🟢 HH-HL (Uptrend)</Tag>
              <Tag color="gold">🟡 LL→HL (Reversal Up)</Tag>
              <Tag>⚪ Sideways</Tag>
              <Tag color="orange">🟠 HH→LH (Reversal Down)</Tag>
              <Tag color="red">🔴 LL-LH (Downtrend)</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" title="RSI Zones">
            <Space wrap>
              <Tag color="red">&gt;78 Overbought</Tag>
              <Tag color="green">&gt;60 Bullish</Tag>
              <Tag>45-55 Neutral</Tag>
              <Tag color="red">&lt;40 Bearish</Tag>
              <Tag color="green">&lt;22 Oversold</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24}>
          <Card size="small" title="MACD Signals">
            <Space wrap>
              <Tag color="green">🟢 PCO (Positive Crossover - Buy)</Tag>
              <Tag color="red">🔴 NCO (Negative Crossover - Sell)</Tag>
              <Tag color="cyan">📈 ↑ Up Tick (Bullish)</Tag>
              <Tag color="magenta">📉 ↓ Down Tick (Bearish)</Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default StockAnalysis
