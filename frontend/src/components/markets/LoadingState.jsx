/**
 * LoadingState Component
 * Reusable loading spinner with message
 */

import { Card, Spin, Typography, Grid } from 'antd'
import { useTheme } from '../../context/ThemeContext'

const { Text } = Typography
const { useBreakpoint } = Grid

const LoadingState = ({
  title = 'Loading Data',
  message = 'Fetching latest data...',
  size = 'large',
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
      <div style={{ textAlign: 'center', padding: screens.md ? 80 : 60 }}>
        <Spin size={size} />
        <div style={{ marginTop: 24 }}>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {message}
          </Text>
        </div>
      </div>
    </Card>
  )
}

export default LoadingState
