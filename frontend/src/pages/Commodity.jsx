/**
 * Commodity Markets Page - Refactored with Reusable Components
 * Shows commodity futures grouped by category (Precious Metals, Energy, Agricultural)
 */

import { useState, useEffect } from 'react'
import { Alert } from 'antd'
import {
  DollarCircleOutlined, GoldOutlined, ThunderboltOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { API_BASE_URL } from '../api/config'
import {
  PageHeader,
  FilterControls,
  SentimentCards,
  MarketTable,
  LoadingState,
  EmptyState
} from '../components/markets'

const COMMODITY_GROUPS = [
  {
    key: 'precious_metals',
    title: 'Precious Metals',
    subtitle: 'COMEX - CME Group, New York',
    icon: '🥇',
    color: '#faad14'
  },
  {
    key: 'energy_commodities',
    title: 'Energy',
    subtitle: 'NYMEX - New York Mercantile Exchange',
    icon: '⚡',
    color: '#ff4d4f'
  },
  {
    key: 'agricultural_commodities',
    title: 'Agricultural',
    subtitle: 'CBOT - Chicago Board of Trade',
    icon: '🌾',
    color: '#52c41a'
  }
]

const Commodity = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [multiTimeframe, setMultiTimeframe] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily')

  const fetchData = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE_URL}/markets/commodities`
      const params = multiTimeframe ? { multi: true } : { timeframe }
      const response = await axios.get(url, { params, signal })
      setData(response.data)
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.message || 'Failed to fetch commodity markets data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    fetchData(abortController.signal)
    return () => {
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, multiTimeframe])

  // Sentiment data
  const sentiment = !multiTimeframe && data ? data.sentiment : null
  const multiTimeframeSentiments = multiTimeframe && data ? data.sentiments : null

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon={DollarCircleOutlined}
        title="Commodity Markets"
        subtitle="Major commodity futures & sentiment analysis"
      />

      {/* Filter Controls */}
      <FilterControls
        showAnalysisMode
        multiTimeframe={multiTimeframe}
        onMultiTimeframeChange={setMultiTimeframe}
        showTimeframeSelector
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        showViewMode={false} // Commodity only has table view
        loading={loading}
        onRefresh={() => fetchData()}
      />

      {/* Sentiment Cards */}
      {!loading && (
        <>
          {multiTimeframe && multiTimeframeSentiments && (
            <SentimentCards
              multiTimeframe
              sentiments={multiTimeframeSentiments}
              selectedTimeframe={selectedTimeframe}
              onTimeframeClick={setSelectedTimeframe}
              title="Overall Commodity Sentiment"
            />
          )}

          {!multiTimeframe && sentiment && sentiment.breadth && (
            <SentimentCards
              sentiment={{
                bullish: sentiment.breadth.positive,
                bearish: sentiment.breadth.negative,
                neutral: sentiment.breadth.neutral,
                total: sentiment.breadth.total,
                bullishPercent: sentiment.breadth.percentage
              }}
              total={sentiment.breadth.total}
              subtitle={`${sentiment.breadth.percentage >= 50 ? 'Bullish' : 'Bearish'} • ${sentiment.breadth.total} commodities`}
            />
          )}
        </>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Commodity Data"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <LoadingState
          title="Loading Commodity Markets"
          message="Fetching latest commodity data..."
        />
      )}

      {/* Empty State */}
      {!loading && !error && (!data || !COMMODITY_GROUPS.some(g => data[g.key]?.length > 0)) && (
        <EmptyState
          title="No Commodity Data Available"
          description="Try refreshing or selecting a different timeframe"
          onRefresh={() => fetchData()}
        />
      )}

      {/* Commodity Group Tables */}
      {!loading && data && (
        <div>
          {COMMODITY_GROUPS.map(groupInfo => {
            const groupData = data[groupInfo.key]
            if (!groupData || groupData.length === 0) return null

            return (
              <MarketTable
                key={groupInfo.key}
                title={groupInfo.title}
                subtitle={groupInfo.subtitle}
                icon={groupInfo.icon}
                markets={groupData}
                multiTimeframe={multiTimeframe}
                selectedTimeframe={selectedTimeframe}
                showName={!multiTimeframe} // Only show name column in single timeframe
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Commodity
