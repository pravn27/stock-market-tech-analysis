/**
 * MarketGroup Component
 * Card layout wrapper for displaying groups of markets/commodities
 */

import { Card, Typography, Space, Tag, Row } from 'antd'
import { RiseOutlined, FallOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'
import { calculateGroupSentiment } from '../../utils/marketCalculations'
import MarketCard from './MarketCard'

const { Text } = Typography

const MarketGroup = ({
  title,
  subtitle,
  icon,
  markets = [],
  excludeSymbols = [],
  vixData = null, // Optional VIX data to display in header
  onMarketClick,
  cardColSpan = { xs: 12, sm: 8, md: 6, lg: 4, xl: 3 },
  style = {}
}) => {
  const { isDarkMode } = useTheme()

  // Filter out excluded symbols (like VIX)
  const filteredMarkets = markets.filter(m => !excludeSymbols.includes(m.symbol))
  
  if (filteredMarkets.length === 0) return null

  // Calculate group sentiment
  const { bullishPercent } = calculateGroupSentiment(markets, excludeSymbols)
  const isBullish = bullishPercent >= 50

  return (
    <div style={{ marginBottom: 32, ...style }}>
      <Card
        title={
          <Space size={12} style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Space size={12}>
              {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
              <div>
                <Text strong style={{ fontSize: 17 }}>{title}</Text>
                {subtitle && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                    {subtitle}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                  {filteredMarkets.length} {filteredMarkets.length === 1 ? 'item' : 'items'}
                </Text>
                {vixData && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                    | VIX: <Text strong style={{ color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a' }}>
                      {vixData.price?.toFixed(2)}
                    </Text>
                    <Text style={{ color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a', marginLeft: 4 }}>
                      ({vixData.change_pct > 0 ? '+' : ''}{vixData.change_pct?.toFixed(2)}%)
                    </Text>
                  </Text>
                )}
              </div>
            </Space>
            <Tag
              color={isBullish ? 'green' : 'red'}
              style={{ fontSize: 13, padding: '4px 12px', fontWeight: 600 }}
            >
              {isBullish ? <RiseOutlined /> : <FallOutlined />} {bullishPercent}% Bullish
            </Tag>
          </Space>
        }
        bodyStyle={{ padding: 20 }}
        style={{
          boxShadow: isDarkMode
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
          transition: 'all 0.3s ease'
        }}
      >
        <Row gutter={[16, 16]}>
          {filteredMarkets.map(market => (
            <MarketCard
              key={market.symbol}
              market={market}
              colSpan={cardColSpan}
              onClick={() => onMarketClick?.(market)}
            />
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default MarketGroup
