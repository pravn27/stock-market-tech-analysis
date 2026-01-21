/**
 * FilterControls Component
 * Reusable filter controls for market pages
 * Includes: Analysis Mode, Timeframe Selector, View Mode, Refresh Button
 */

import { Card, Select, Button, Space, Typography, Row, Col, Segmented, Switch, Grid } from 'antd'
import { ReloadOutlined, AppstoreOutlined, TableOutlined } from '@ant-design/icons'
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

const FilterControls = ({
  // Analysis Mode props
  showAnalysisMode = true,
  multiTimeframe = false,
  onMultiTimeframeChange,
  
  // Timeframe props
  showTimeframeSelector = true,
  timeframe = 'daily',
  onTimeframeChange,
  timeframes = TIMEFRAMES,
  
  // View Mode props
  showViewMode = true,
  viewMode = 'table',
  onViewModeChange,
  
  // Refresh props
  showRefresh = true,
  loading = false,
  onRefresh,
  refreshButtonText = 'Refresh Data',
  
  // Style props
  style = {}
}) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()

  return (
    <Card
      style={{
        marginBottom: 24,
        boxShadow: isDarkMode
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.06)',
        ...style
      }}
      bodyStyle={{ padding: screens.md ? '16px 24px' : '16px' }}
    >
      <Row gutter={[16, 16]} align="middle" justify="space-between" wrap>
        <Col xs={24} md={18} lg={16}>
          <Space wrap size={16}>
            {/* Analysis Mode Toggle */}
            {showAnalysisMode && (
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
                    onChange={(checked) => {
                      onMultiTimeframeChange?.(checked)
                    }}
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
            )}

            {/* Timeframe Selector - Only show in single mode */}
            {showTimeframeSelector && !multiTimeframe && (
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  Timeframe
                </Text>
                <Select
                  value={timeframe}
                  onChange={onTimeframeChange}
                  options={timeframes.map(tf => ({ value: tf.value, label: tf.fullLabel }))}
                  style={{ width: screens.md ? 140 : 120 }}
                  size={screens.md ? 'middle' : 'large'}
                />
              </div>
            )}

            {/* View Mode - Only show in single mode */}
            {showViewMode && !multiTimeframe && (
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4, fontWeight: 600 }}>
                  View Mode
                </Text>
                <Segmented
                  value={viewMode}
                  onChange={onViewModeChange}
                  size={screens.md ? 'middle' : 'large'}
                  options={[
                    {
                      value: 'cards',
                      icon: <AppstoreOutlined />,
                      label: screens.md ? 'Cards' : ''
                    },
                    {
                      value: 'table',
                      icon: <TableOutlined />,
                      label: screens.md ? 'Table' : ''
                    },
                  ]}
                />
              </div>
            )}
          </Space>
        </Col>
        
        {/* Refresh Button */}
        {showRefresh && (
          <Col xs={24} md={6} lg={8} style={{ textAlign: screens.md ? 'right' : 'left' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={loading} />}
              onClick={onRefresh}
              loading={loading}
              size={screens.md ? 'middle' : 'large'}
              style={{ minWidth: 120 }}
            >
              {refreshButtonText}
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  )
}

export default FilterControls
