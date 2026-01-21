/**
 * PageHeader Component
 * Reusable gradient header card for market pages
 */

import { Card, Typography, Space, Row, Col, Grid } from 'antd'
import { useTheme } from '../../context/ThemeContext'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  iconColor = '#1890ff',
  borderColor = '#1890ff',
  gradientColors = {
    light: ['rgba(24, 144, 255, 0.08)', 'rgba(24, 144, 255, 0.02)'],
    dark: ['rgba(24, 144, 255, 0.12)', 'rgba(24, 144, 255, 0.04)']
  },
  extra = null, // Optional extra content on the right
  style = {}
}) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()

  const gradientStart = isDarkMode ? gradientColors.dark[0] : gradientColors.light[0]
  const gradientEnd = isDarkMode ? gradientColors.dark[1] : gradientColors.light[1]

  return (
    <Card
      style={{
        marginBottom: 24,
        background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: isDarkMode
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        ...style
      }}
      bodyStyle={{ padding: screens.md ? 24 : 16 }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Space align="center">
            {Icon && <Icon style={{ fontSize: 32, color: iconColor }} />}
            <div>
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
                {title}
              </Title>
              {subtitle && (
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {subtitle}
                </Text>
              )}
            </div>
          </Space>
        </Col>
        {extra && (
          <Col>
            {extra}
          </Col>
        )}
      </Row>
    </Card>
  )
}

export default PageHeader
