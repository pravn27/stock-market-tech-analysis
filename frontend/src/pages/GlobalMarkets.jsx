/**
 * Global Markets Page - Refactored with Reusable Components
 * Shows global market indices in card/table layout grouped by region
 */

import { useState, useEffect } from 'react'
import { Alert } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { getGlobalMarkets, getGlobalMarketsMultiTimeframe } from '../api/scanner'
import {
  PageHeader,
  FilterControls,
  SentimentCards,
  MarketTable,
  MarketGroup,
  LoadingState,
  EmptyState
} from '../components/markets'
import { calculateSentiment, flattenMarketGroups, findSymbol } from '../utils/marketCalculations'

const MARKET_GROUPS = [
  { key: 'us_markets', title: 'US Markets', emoji: '🇺🇸' },
  { key: 'european_markets', title: 'European Markets', emoji: '🇪🇺' },
  { key: 'asian_markets', title: 'Asian Markets', emoji: '🌏' },
  { key: 'india_adrs', title: 'India ADRs', emoji: '🇮🇳' },
]

const VIX_SYMBOLS = ['^VIX', '^INDIAVIX']

const GlobalMarkets = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [timeframe, setTimeframe] = useState('daily')
  const [viewMode, setViewMode] = useState('cards')
  const [multiTimeframe, setMultiTimeframe] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily')

  const fetchData = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      if (multiTimeframe) {
        const result = await getGlobalMarketsMultiTimeframe(signal)
        setData(result)
      } else {
        const result = await getGlobalMarkets(timeframe, signal)
        setData(result)
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err.message || 'Failed to fetch global markets data')
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

  // Flatten all market groups for sentiment calculation (exclude VIX)
  const allIndices = data && !multiTimeframe
    ? flattenMarketGroups(data, ['us_markets', 'european_markets', 'asian_markets', 'india_adrs'], VIX_SYMBOLS)
    : []

  // Calculate sentiment for single timeframe mode
  const sentiment = !multiTimeframe ? calculateSentiment(allIndices, VIX_SYMBOLS) : null

  // Multi-timeframe sentiments from backend
  const multiTimeframeSentiments = multiTimeframe && data?.sentiments ? data.sentiments : null

  // Handle multi-timeframe toggle
  const handleMultiTimeframeChange = (checked) => {
    setMultiTimeframe(checked)
    if (checked) {
      setViewMode('table') // Force table view when multi-timeframe is enabled
    }
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon={GlobalOutlined}
        title="Global Markets"
        subtitle="Real-time world indices & market sentiment analysis"
      />

      {/* Filter Controls */}
      <FilterControls
        showAnalysisMode
        multiTimeframe={multiTimeframe}
        onMultiTimeframeChange={handleMultiTimeframeChange}
        showTimeframeSelector
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
              title="Overall Market Sentiment - All Timeframes"
            />
          )}

          {!multiTimeframe && sentiment && sentiment.total > 0 && (
            <SentimentCards
              sentiment={sentiment}
              total={sentiment.total}
              subtitle={`Based on ${sentiment.total} global indices across ${MARKET_GROUPS.length} regions`}
              regionCount={MARKET_GROUPS.length}
            />
          )}
        </>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Market Data"
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
          title="Loading Global Markets"
          message={`Fetching latest market data for ${timeframe} timeframe...`}
        />
      )}

      {/* Empty State */}
      {!loading && !error && !multiTimeframe && allIndices.length === 0 && (
        <EmptyState
          title="No Market Data Available"
          description="Try refreshing or selecting a different timeframe"
          onRefresh={() => fetchData()}
        />
      )}

      {/* Market Groups - Table View */}
      {!loading && data && viewMode === 'table' && (
        <div>
          {MARKET_GROUPS.map(group => {
            const markets = data[group.key] || []
            const vixSymbol = group.key === 'us_markets' ? '^VIX' : group.key === 'asian_markets' ? '^INDIAVIX' : null
            const vixData = vixSymbol ? findSymbol(markets, vixSymbol) : null

            return (
              <MarketTable
                key={group.key}
                title={group.title}
                icon={group.emoji}
                markets={markets}
                excludeSymbols={VIX_SYMBOLS}
                multiTimeframe={multiTimeframe}
                selectedTimeframe={selectedTimeframe}
                vixData={vixData ? { ...vixData, label: vixSymbol === '^INDIAVIX' ? 'India VIX' : 'US VIX' } : null}
              />
            )
          })}
        </div>
      )}

      {/* Market Groups - Card View */}
      {!loading && data && viewMode === 'cards' && !multiTimeframe && (
        <div>
          {MARKET_GROUPS.map(group => {
            const markets = data[group.key] || []
            const vixSymbol = group.key === 'us_markets' ? '^VIX' : group.key === 'asian_markets' ? '^INDIAVIX' : null
            const vixData = vixSymbol ? findSymbol(markets, vixSymbol) : null

            return (
              <MarketGroup
                key={group.key}
                title={group.title}
                icon={group.emoji}
                markets={markets}
                excludeSymbols={VIX_SYMBOLS}
                vixData={vixData ? { ...vixData, label: vixSymbol === '^INDIAVIX' ? 'India VIX' : 'US VIX' } : null}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GlobalMarkets
