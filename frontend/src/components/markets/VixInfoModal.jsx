/**
 * VixInfoModal Component
 * Educational modal explaining VIX and its trading implications
 */

import { Modal, Typography, Space, Divider, Tag, Alert, Card } from 'antd'
import { InfoCircleOutlined, RiseOutlined, FallOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { getVixLevel, getVixImplications } from '../../utils/marketCalculations'

const { Title, Text, Paragraph } = Typography

const VixInfoModal = ({ visible, onClose, vixValue = 0, vixChangePct = 0, vixLabel = 'VIX' }) => {
  // Safety check: ensure vixValue and vixChangePct are valid numbers
  const safeVixValue = vixValue ?? 0
  const safeVixChangePct = vixChangePct ?? 0

  const vixLevel = getVixLevel(safeVixValue)
  const implications = getVixImplications(safeVixValue)
  const isIndiaVix = vixLabel.includes('India')

  return (
    <Modal
      title={
        <Space size={8}>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ fontSize: 16 }}>
            Understanding {vixLabel} - The Fear Gauge
          </Text>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        {/* What is VIX */}
        <div>
          <Title level={5}>📊 What is {vixLabel}?</Title>
          <Paragraph>
            {isIndiaVix 
              ? 'India VIX is the volatility index for the Indian stock market (NSE), measuring expected volatility over the next 30 days based on Nifty 50 options.'
              : 'The VIX (Volatility Index) measures market fear and uncertainty, calculated from S&P 500 options prices. It represents expected volatility over the next 30 days.'
            }
          </Paragraph>
          <Paragraph type="secondary">
            Often called the <Text strong>"Fear Gauge"</Text> - when VIX rises, investors are nervous. When it falls, they're confident.
          </Paragraph>
        </div>

        {/* Current Level */}
        <Card
          size="small"
          style={{
            background: `linear-gradient(135deg, ${vixLevel.color}15 0%, ${vixLevel.color}05 100%)`,
            border: `2px solid ${vixLevel.color}`,
          }}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 16 }}>Current Level</Text>
              <Tag color={vixLevel.color} style={{ fontSize: 14, padding: '4px 12px', fontWeight: 600 }}>
                {vixLevel.emoji} {vixLevel.label}
              </Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 24, color: vixLevel.color }}>
                {safeVixValue.toFixed(2)}
              </Text>
              <Text strong style={{ fontSize: 18, color: safeVixChangePct > 0 ? '#ff4d4f' : '#52c41a' }}>
                {safeVixChangePct > 0 ? '+' : ''}{safeVixChangePct.toFixed(2)}%
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {vixLevel.description} - {vixLevel.tradingMode}
            </Text>
          </Space>
        </Card>

        <Divider style={{ margin: '8px 0' }} />

        {/* VIX Rising - Fear Increasing */}
        <div>
          <Space size={8} style={{ marginBottom: 12 }}>
            <RiseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
            <Title level={5} style={{ margin: 0 }}>{implications.rising.title}</Title>
          </Space>
          
          <Card size="small" style={{ marginBottom: 12, background: '#fff1f0', borderColor: '#ffa39e' }}>
            <Space direction="vertical" size={4}>
              {implications.rising.points.map((point, idx) => (
                <Text key={idx} style={{ fontSize: 13 }}>
                  {point}
                </Text>
              ))}
            </Space>
          </Card>

          <Text strong style={{ fontSize: 14 }}>💡 Trading Implications:</Text>
          <div style={{ marginTop: 8, paddingLeft: 8 }}>
            {implications.rising.actions.map((action, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>{action}</Text>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* VIX Falling - Fear Decreasing */}
        <div>
          <Space size={8} style={{ marginBottom: 12 }}>
            <FallOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <Title level={5} style={{ margin: 0 }}>{implications.falling.title}</Title>
          </Space>
          
          <Card size="small" style={{ marginBottom: 12, background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Space direction="vertical" size={4}>
              {implications.falling.points.map((point, idx) => (
                <Text key={idx} style={{ fontSize: 13 }}>
                  {point}
                </Text>
              ))}
            </Space>
          </Card>

          <Text strong style={{ fontSize: 14 }}>💡 Trading Implications:</Text>
          <div style={{ marginTop: 8, paddingLeft: 8 }}>
            {implications.falling.actions.map((action, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>{action}</Text>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* VIX Levels Guide */}
        <div>
          <Title level={5}>📊 {vixLabel} Levels Guide</Title>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Text>😌 <Text strong>0-15:</Text> Low Fear (Calm markets)</Text>
            </Card>
            <Card size="small" style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
              <Text>🙂 <Text strong>15-20:</Text> Normal (Average volatility)</Text>
            </Card>
            <Card size="small" style={{ background: '#fffbe6', borderColor: '#ffe58f' }}>
              <Text>😰 <Text strong>20-30:</Text> Elevated (Increased caution)</Text>
            </Card>
            <Card size="small" style={{ background: '#fff1f0', borderColor: '#ffa39e' }}>
              <Text>😱 <Text strong>30-40:</Text> High Fear (Defensive mode)</Text>
            </Card>
            <Card size="small" style={{ background: '#fff1f0', borderColor: '#ff4d4f' }}>
              <Text>🚨 <Text strong>40+:</Text> Extreme Panic (Crisis mode)</Text>
            </Card>
          </Space>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Pro Tips */}
        <Alert
          message={
            <Space>
              <ThunderboltOutlined />
              <Text strong>Pro Tips</Text>
            </Space>
          }
          description={
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text style={{ fontSize: 13 }}>
                • <Text strong>VIX Spike ({">"} 20% in a day):</Text> Often signals short-term market bottoms, but wait for confirmation before buying.
              </Text>
              <Text style={{ fontSize: 13 }}>
                • <Text strong>Extremely Low VIX ({"<"} 12):</Text> Market complacency can be dangerous. Stay alert for sudden volatility.
              </Text>
              <Text style={{ fontSize: 13 }}>
                • <Text strong>VIX vs Price:</Text> VIX usually moves opposite to the market. Rising VIX = Falling prices.
              </Text>
              {isIndiaVix && (
                <Text style={{ fontSize: 13 }}>
                  • <Text strong>India VIX vs US VIX:</Text> Compare both to understand if fear is global or India-specific.
                </Text>
              )}
            </Space>
          }
          type="info"
          showIcon
          style={{ fontSize: 13 }}
        />

        {/* Key Takeaway */}
        <Card size="small" style={{ background: '#f0f5ff', borderColor: '#adc6ff' }}>
          <Text strong style={{ fontSize: 14 }}>🎯 Key Takeaway:</Text>
          <Paragraph style={{ fontSize: 13, marginTop: 8, marginBottom: 0 }}>
            {vixLabel} is a risk management tool, not a trading signal. Use it to adjust your position sizes, 
            stop losses, and overall risk exposure. High VIX = Smaller positions. Low VIX = Normal positions (but stay vigilant).
          </Paragraph>
        </Card>
      </Space>
    </Modal>
  )
}

export default VixInfoModal
