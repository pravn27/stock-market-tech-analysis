/**
 * EmptyState Component
 * Reusable empty state with action button
 */

import { Card, Empty, Button, Space, Typography, Grid } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useTheme } from '../../context/ThemeContext'

const { Text } = Typography
const { useBreakpoint } = Grid

const EmptyState = ({
  title = 'No Data Available',
  description = 'Try refreshing or selecting a different timeframe',
  onRefresh,
  buttonText = 'Refresh Data',
  buttonIcon = <ReloadOutlined />,
  style = {}
}) => {
  const screens = useBreakpoint()
  const { isDarkMode } = useTheme()

  return (
    <Card
      style={{
        boxShadow: isDarkMode
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        ...style
      }}
    >
      <Empty
        description={
          <Space direction="vertical" size={8}>
            <Text strong style={{ fontSize: 15 }}>{title}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {description}
            </Text>
          </Space>
        }
        style={{ padding: screens.md ? 60 : 40 }}
      >
        {onRefresh && (
          <Button
            type="primary"
            icon={buttonIcon}
            onClick={onRefresh}
            size="large"
          >
            {buttonText}
          </Button>
        )}
      </Empty>
    </Card>
  )
}

export default EmptyState
