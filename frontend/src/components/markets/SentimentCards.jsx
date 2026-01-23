/**
 * SentimentCards Component
 * Reusable sentiment display for both multi-timeframe and single-timeframe modes
 */

import { Card, Space, Tag, Typography, Row, Col, Statistic, Progress, Grid } from 'antd'
import {
  RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'

const { Text } = Typography
const { useBreakpoint } = Grid

const TIMEFRAMES = [
  { value: '3m', label: '3M', fullLabel: '3 Month' },
  { value: 'monthly', label: 'Monthly', fullLabel: 'Monthly' },
  { value: 'weekly', label: 'Weekly', fullLabel: 'Weekly' },
  { value: 'daily', label: 'Daily', fullLabel: 'Daily' },
  { value: '4h', label: '4H', fullLabel: '4 Hour' },
  { value: '1h', label: '1H', fullLabel: '1 Hour' },
]

/**
 * Multi-Timeframe Sentiment Cards (6 small cards)
 */
export const MultiTimeframeSentimentCards = ({
  sentiments,
  selectedTimeframe,
  onTimeframeClick,
  title = 'Overall Market Sentiment - All Timeframes',
  timeframes = TIMEFRAMES,
  style = {}
}) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()

  if (!sentiments) return null

  return (
    <div style={{ marginBottom: 32, ...style }}>
      <Text strong style={{ fontSize: 17, display: 'block', marginBottom: 16, fontWeight: 700 }}>
        {title}
      </Text>
      <Row gutter={[12, 12]}>
        {timeframes.map(tf => {
          const sent = sentiments[tf.value]
          if (!sent) return null

          const bullish = sent.breadth?.positive || 0
          const bearish = sent.breadth?.negative || 0
          const neutral = (sent.breadth?.total || 0) - bullish - bearish
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
                  cursor: onTimeframeClick ? 'pointer' : 'default'
                }}
                bodyStyle={{ padding: 12 }}
                onClick={() => onTimeframeClick?.(tf.value)}
              >
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  {tf.fullLabel}
                </Text>
                <Space size={4} align="center" style={{ marginBottom: 6 }}>
                  <Text strong style={{ fontSize: 22, color: isBullish ? '#52c41a' : '#ff4d4f' }}>
                    {Math.round(bullishPercent)}%
                  </Text>
                  {isBullish ? (
                    <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                  ) : (
                    <FallOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                  )}
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
  )
}

/**
 * Single Timeframe Sentiment Cards (1 large + 3 mini cards)
 */
export const SingleTimeframeSentimentCards = ({
  sentiment,
  total = 0,
  subtitle,
  regionCount,
  style = {}
}) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()

  if (!sentiment || total === 0) return null

  const { bullish = 0, bearish = 0, neutral = 0, bullishPercent = 0 } = sentiment
  const isBullish = bullishPercent >= 50

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32, ...style }}>
      {/* Dominant Sentiment Card (40%) */}
      <Col xs={24} sm={24} md={10}>
        <Card
          style={{
            background: isBullish
              ? (isDarkMode
                ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%)')
              : (isDarkMode
                ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.02) 100%)'),
            borderLeft: `4px solid ${isBullish ? '#52c41a' : '#ff4d4f'}`,
            height: '100%',
            boxShadow: isDarkMode
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                Dominant Sentiment
              </Text>
              <Space size={16} align="end">
                <Statistic
                  value={bullishPercent}
                  suffix="%"
                  prefix={isBullish ? <RiseOutlined /> : <FallOutlined />}
                  valueStyle={{
                    color: isBullish ? '#52c41a' : '#ff4d4f',
                    fontSize: 40,
                    fontWeight: 700
                  }}
                />
                <Tag
                  color={isBullish ? 'green' : 'red'}
                  style={{ fontSize: 16, padding: '6px 16px', fontWeight: 600 }}
                >
                  {isBullish ? 'BULLISH' : 'BEARISH'}
                </Tag>
              </Space>
            </div>
            <Progress
              percent={bullishPercent}
              strokeColor={{
                '0%': isBullish ? '#52c41a' : '#ff4d4f',
                '100%': isBullish ? '#73d13d' : '#ff7875',
              }}
              trailColor={isDarkMode ? '#262626' : '#f0f0f0'}
              showInfo={false}
              strokeWidth={12}
              style={{ marginBottom: 4 }}
            />
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle || `Based on ${total} items${regionCount ? ` across ${regionCount} regions` : ''}`}
            </Text>
          </Space>
        </Card>
      </Col>

      {/* Bullish Card (20%) */}
      <Col xs={8} sm={8} md={14/3}>
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
            value={bullish}
            valueStyle={{ color: '#52c41a', fontSize: 32, fontWeight: 700 }}
            prefix={<ArrowUpOutlined style={{ fontSize: 24 }} />}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            {Math.round((bullish / total) * 100)}% of markets
          </Text>
        </Card>
      </Col>

      {/* Neutral Card (20%) */}
      <Col xs={8} sm={8} md={14/3}>
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
            value={neutral}
            valueStyle={{ color: '#999', fontSize: 32, fontWeight: 700 }}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            {Math.round((neutral / total) * 100)}% of markets
          </Text>
        </Card>
      </Col>

      {/* Bearish Card (20%) */}
      <Col xs={8} sm={8} md={14/3}>
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
            value={bearish}
            valueStyle={{ color: '#ff4d4f', fontSize: 32, fontWeight: 700 }}
            prefix={<ArrowDownOutlined style={{ fontSize: 24 }} />}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            {Math.round((bearish / total) * 100)}% of markets
          </Text>
        </Card>
      </Col>
    </Row>
  )
}

// Default export wrapper that chooses the right component based on mode
const SentimentCards = ({
  multiTimeframe = false,
  // Multi-timeframe props
  sentiments,
  selectedTimeframe,
  onTimeframeClick,
  timeframes = TIMEFRAMES,
  // Single-timeframe props
  sentiment,
  total,
  subtitle,
  regionCount,
  // Common props
  title,
  style = {}
}) => {
  if (multiTimeframe) {
    return (
      <MultiTimeframeSentimentCards
        sentiments={sentiments}
        selectedTimeframe={selectedTimeframe}
        onTimeframeClick={onTimeframeClick}
        title={title}
        timeframes={timeframes}
        style={style}
      />
    )
  }

  return (
    <SingleTimeframeSentimentCards
      sentiment={sentiment}
      total={total}
      subtitle={subtitle}
      regionCount={regionCount}
      style={style}
    />
  )
}

export default SentimentCards
