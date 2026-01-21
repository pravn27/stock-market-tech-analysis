/**
 * MarketCard Component
 * Individual market/commodity card for card view layout
 */

import { Card, Typography, Space, Tag, Divider, Col } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'
import { formatPrice, formatChange, formatPercentage } from '../../utils/formatters'
import { getSentimentColor, getSentimentTagColor } from '../../utils/marketCalculations'

const { Text } = Typography

const MarketCard = ({ 
  market,
  colSpan = { xs: 12, sm: 8, md: 6, lg: 4, xl: 3 },
  onClick,
  style = {}
}) => {
  const { isDarkMode } = useTheme()

  const isPositive = market.change_pct > 0
  const isNegative = market.change_pct < 0
  const changeColor = getSentimentColor(market.change_pct)
  const bgColor = isPositive
    ? (isDarkMode ? 'rgba(82, 196, 26, 0.08)' : 'rgba(82, 196, 26, 0.04)')
    : isNegative
      ? (isDarkMode ? 'rgba(255, 77, 79, 0.08)' : 'rgba(255, 77, 79, 0.04)')
      : 'transparent'
  const sign = isPositive ? '+' : ''
  const Icon = isPositive ? ArrowUpOutlined : isNegative ? ArrowDownOutlined : null

  return (
    <Col {...colSpan}>
      <Card
        hoverable
        onClick={onClick}
        style={{
          height: '100%',
          borderLeft: `4px solid ${changeColor}`,
          background: bgColor,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isDarkMode
            ? '0 1px 4px rgba(0, 0, 0, 0.3)'
            : '0 1px 4px rgba(0, 0, 0, 0.08)',
          cursor: onClick ? 'pointer' : 'default',
          ...style
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
          {formatPrice(market.price)}
        </Text>

        <Space size={8} style={{ width: '100%' }} wrap>
          <Tag
            color={getSentimentTagColor(market.change_pct)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '2px 8px',
              margin: 0
            }}
          >
            {Icon && <Icon style={{ marginRight: 4 }} />}
            {formatPercentage(market.change_pct)}
          </Tag>
          <Text style={{ color: changeColor, fontSize: 12, fontFamily: 'monospace' }}>
            {formatChange(market.change)}
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

export default MarketCard
