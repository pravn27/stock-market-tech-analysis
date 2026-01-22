/**
 * MarketGroup Component
 * Card layout wrapper for displaying groups of markets/commodities
 */

import { useState } from 'react'
import { Card, Typography, Space, Tag, Row, Button, Tooltip } from 'antd'
import { RiseOutlined, FallOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'
import { calculateGroupSentiment, getVixLevel, getVixAlert } from '../../utils/marketCalculations'
import MarketCard from './MarketCard'
import VixInfoModal from './VixInfoModal'

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
  const [vixModalVisible, setVixModalVisible] = useState(false)

  // Filter out excluded symbols (like VIX)
  const filteredMarkets = markets.filter(m => !excludeSymbols.includes(m.symbol))
  
  if (filteredMarkets.length === 0) return null

  // Calculate group sentiment
  const { dominantPercent, dominantLabel, dominantColor } = calculateGroupSentiment(markets, excludeSymbols)

  // Get VIX level and alert (if VIX data provided)
  const vixLevel = vixData ? getVixLevel(vixData.price) : null
  const vixAlert = vixData ? getVixAlert(vixData.price, vixData.change_pct) : null

  return (
    <>
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
                  <span style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Dynamic VIX Alert Badge (if applicable) */}
                    {vixAlert && (
                      <Tag
                        color={vixAlert.color}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '2px 10px',
                          border: `2px solid ${vixAlert.color}`,
                        }}
                      >
                        {vixAlert.emoji} {vixAlert.title}
                      </Tag>
                    )}
                    
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        | {vixData.label || 'VIX'}:
                      </Text>
                      <Text strong style={{ fontSize: 14, marginLeft: 2, color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a' }}>
                        {vixData.price?.toFixed(2)}
                      </Text>
                      <Text style={{ color: vixData.change_pct > 0 ? '#ff4d4f' : '#52c41a', fontSize: 13, fontWeight: 600 }}>
                        ({vixData.change_pct > 0 ? '+' : ''}{vixData.change_pct?.toFixed(2)}%)
                      </Text>
                      
                      {/* VIX Level Indicator */}
                      {vixLevel && (
                        <Text style={{ fontSize: 14, marginLeft: 2 }}>
                          {vixLevel.emoji}
                        </Text>
                      )}
                      
                      {/* Info Icon to open modal */}
                      <Tooltip title="Learn about VIX & trading implications">
                        <Button
                          type="text"
                          size="small"
                          icon={<InfoCircleOutlined style={{ fontSize: 16, color: '#1890ff' }} />}
                          onClick={() => setVixModalVisible(true)}
                          style={{ padding: 0, height: 'auto', marginLeft: 2 }}
                        />
                      </Tooltip>
                    </span>
                  </span>
                )}
              </div>
            </Space>
            <Tag
              color={dominantColor}
              style={{ fontSize: 13, padding: '4px 12px', fontWeight: 600 }}
            >
              {dominantLabel === 'Bullish' ? <RiseOutlined /> : dominantLabel === 'Bearish' ? <FallOutlined /> : null} {dominantPercent}% {dominantLabel}
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

    {/* VIX Info Modal */}
    {vixData && (
      <VixInfoModal
        visible={vixModalVisible}
        onClose={() => setVixModalVisible(false)}
        vixValue={vixData.price}
        vixChangePct={vixData.change_pct}
        vixLabel={vixData.label || 'VIX'}
      />
    )}
    </>
  )
}

export default MarketGroup
