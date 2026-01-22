/**
 * MarketTable Component
 * Reusable table for displaying markets with single or multi-timeframe data
 */

import { useState } from 'react'
import { Card, Table, Typography, Space, Tag, Grid, Button, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, RiseOutlined, FallOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'
import { formatPrice, formatChange, formatPercentage } from '../../utils/formatters'
import { getSentimentColor, getSentimentTagColor, calculateGroupSentiment, getVixLevel, getVixAlert } from '../../utils/marketCalculations'
import VixInfoModal from './VixInfoModal'

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

const MarketTable = ({
  title,
  subtitle,
  icon,
  markets = [],
  excludeSymbols = [],
  multiTimeframe = false,
  selectedTimeframe = 'daily',
  timeframes = TIMEFRAMES,
  vixData = null, // Optional VIX data to display in header
  showName = true, // Show full name column in single timeframe
  style = {}
}) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()
  const [vixModalVisible, setVixModalVisible] = useState(false)

  // Filter out excluded symbols
  const filteredMarkets = markets.filter(m => !excludeSymbols.includes(m.symbol))
  
  if (filteredMarkets.length === 0) return null

  // Calculate group sentiment for single timeframe
  const sentimentData = !multiTimeframe 
    ? calculateGroupSentiment(markets, excludeSymbols)
    : { dominantPercent: 0, dominantLabel: 'Neutral', dominantColor: 'default' }

  // Get VIX level and alert (if VIX data provided)
  const vixLevel = vixData ? getVixLevel(vixData.price) : null
  const vixAlert = vixData ? getVixAlert(vixData.price, vixData.change_pct) : null

  // Single timeframe columns
  const singleTimeframeColumns = [
    {
      title: 'Index',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      fixed: screens.md ? 'left' : false,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{short || record.name?.split(' ')[0]}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.symbol}</Text>
        </Space>
      ),
    },
    ...(showName ? [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    }] : []),
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 130,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: 15 }}>
          {formatPrice(price)}
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
        const color = getSentimentColor(change)
        const Icon = change > 0 ? ArrowUpOutlined : ArrowDownOutlined
        return (
          <Space size={4}>
            <Icon style={{ color, fontSize: 12 }} />
            <Text strong style={{ color, fontFamily: 'monospace' }}>
              {formatChange(change)}
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
        const Icon = pct > 0 ? ArrowUpOutlined : pct < 0 ? ArrowDownOutlined : null
        return (
          <Tag
            color={getSentimentTagColor(pct)}
            style={{
              minWidth: 90,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 8px'
            }}
          >
            {Icon && <Icon style={{ marginRight: 4 }} />} {formatPercentage(pct)}
          </Tag>
        )
      },
    },
  ]

  // Multi-timeframe columns
  const multiTimeframeColumns = [
    {
      title: 'Index',
      dataIndex: 'short',
      key: 'short',
      width: 120,
      fixed: screens.md ? 'left' : false,
      render: (short, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>{short || record.name?.split(' ')[0]}</Text>
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
          {formatPrice(price)}
        </Text>
      ),
    },
    ...timeframes.map(tf => ({
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
        const color = getSentimentTagColor(pct)
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
            {formatPercentage(pct, 2, true)}
          </Tag>
        )
      },
    })),
  ]

  const columns = multiTimeframe ? multiTimeframeColumns : singleTimeframeColumns

  return (
    <>
      <div style={{ marginBottom: 24, ...style }}>
        <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Space size={12}>
              {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
              <div>
                <Text strong style={{ fontSize: 16 }}>{title}</Text>
                {subtitle && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {subtitle}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  ({filteredMarkets.length} {filteredMarkets.length === 1 ? 'index' : 'indices'})
                </Text>
                {vixData && (
                  <span style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
                      <Tag
                        color={vixData.change_pct > 0 ? 'red' : 'green'}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '2px 8px',
                          marginLeft: 4
                        }}
                      >
                        {vixData.change_pct > 0 ? <ArrowUpOutlined style={{ marginRight: 4 }} /> : <ArrowDownOutlined style={{ marginRight: 4 }} />}
                        {vixData.change_pct > 0 ? '+' : ''}{vixData.change_pct?.toFixed(2)}%
                      </Tag>
                      
                      {/* VIX Level Indicator */}
                      {vixLevel && (
                        <Text style={{ fontSize: 14, marginLeft: 4 }}>
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
                          style={{ padding: 0, height: 'auto', marginLeft: 4 }}
                        />
                      </Tooltip>
                    </span>
                  </span>
                )}
              </div>
            </Space>
            {!multiTimeframe && (
              <Tag
                color={sentimentData.dominantColor}
                icon={sentimentData.dominantLabel === 'Bullish' ? <RiseOutlined /> : sentimentData.dominantLabel === 'Bearish' ? <FallOutlined /> : null}
                style={{ fontSize: 13, padding: '4px 12px', fontWeight: 600 }}
              >
                {sentimentData.dominantPercent}% {sentimentData.dominantLabel}
              </Tag>
            )}
          </div>
        }
        size="small"
        bodyStyle={{ padding: 0 }}
        style={{
          boxShadow: isDarkMode
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredMarkets.map((m, i) => ({ ...m, key: i }))}
          pagination={false}
          size="middle"
          scroll={{ x: multiTimeframe ? 1000 : 600 }}
          sticky={{ offsetHeader: 64 }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? '' : isDarkMode ? 'ant-table-row-striped-dark' : 'ant-table-row-striped'
          }
        />
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

export default MarketTable
