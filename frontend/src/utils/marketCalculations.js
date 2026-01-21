/**
 * Market Calculations Utility
 * Contains reusable calculation functions for market sentiment and statistics
 */

/**
 * Calculate sentiment breakdown using ±0.5% threshold
 * @param {Array} items - Array of market items with change_pct
 * @param {Array} excludeSymbols - Symbols to exclude (e.g., VIX indices)
 * @returns {Object} - { bullish, bearish, neutral, total, bullishPercent }
 */
export const calculateSentiment = (items = [], excludeSymbols = []) => {
  const validItems = items.filter(
    item => 
      item.change_pct !== null && 
      item.change_pct !== undefined && 
      !item.error &&
      !excludeSymbols.includes(item.symbol)
  )

  const sentiment = validItems.reduce((acc, item) => {
    if (item.change_pct > 0.5) acc.bullish++
    else if (item.change_pct < -0.5) acc.bearish++
    else acc.neutral++
    return acc
  }, { bullish: 0, bearish: 0, neutral: 0 })

  const total = sentiment.bullish + sentiment.bearish + sentiment.neutral
  const bullishPercent = total > 0 ? Math.round((sentiment.bullish / total) * 100) : 0

  return {
    ...sentiment,
    total,
    bullishPercent
  }
}

/**
 * Calculate group sentiment for a specific market group
 * @param {Array} markets - Array of markets in the group
 * @param {Array} excludeSymbols - Symbols to exclude
 * @returns {Object} - { bullishCount, bearishCount, neutralCount, total, bullishPercent }
 */
export const calculateGroupSentiment = (markets = [], excludeSymbols = []) => {
  const filtered = markets.filter(m => !excludeSymbols.includes(m.symbol))
  const bullishCount = filtered.filter(m => m.change_pct > 0.5).length
  const bearishCount = filtered.filter(m => m.change_pct < -0.5).length
  const neutralCount = filtered.filter(m => {
    const val = m.change_pct || 0
    return val >= -0.5 && val <= 0.5
  }).length
  const total = filtered.length
  const bullishPercent = total > 0 ? Math.round((bullishCount / total) * 100) : 0

  return {
    bullishCount,
    bearishCount,
    neutralCount,
    total,
    bullishPercent
  }
}

/**
 * Determine if overall sentiment is bullish
 * @param {number} bullishPercent - Percentage of bullish items
 * @returns {boolean}
 */
export const isBullishSentiment = (bullishPercent) => bullishPercent >= 50

/**
 * Get sentiment color based on change percentage
 * @param {number} changePct - Change percentage
 * @returns {string} - Color code
 */
export const getSentimentColor = (changePct) => {
  if (changePct > 0) return '#52c41a' // green
  if (changePct < 0) return '#ff4d4f' // red
  return '#999' // neutral
}

/**
 * Get sentiment tag color for Ant Design
 * @param {number} changePct - Change percentage
 * @returns {string} - Ant Design color name
 */
export const getSentimentTagColor = (changePct) => {
  if (changePct > 0) return 'green'
  if (changePct < 0) return 'red'
  return 'default'
}

/**
 * Filter out specific symbols from array (e.g., VIX indices)
 * @param {Array} items - Array of items
 * @param {Array} symbolsToRemove - Symbols to filter out
 * @returns {Array} - Filtered array
 */
export const filterSymbols = (items = [], symbolsToRemove = []) => {
  return items.filter(item => !symbolsToRemove.includes(item.symbol))
}

/**
 * Find specific symbol data from array
 * @param {Array} items - Array of items
 * @param {string} symbol - Symbol to find
 * @returns {Object|null} - Found item or null
 */
export const findSymbol = (items = [], symbol) => {
  return items.find(item => item.symbol === symbol) || null
}

/**
 * Flatten market groups into single array
 * @param {Object} data - Market data object with groups
 * @param {Array} groupKeys - Keys of groups to flatten
 * @param {Array} excludeSymbols - Symbols to exclude
 * @returns {Array} - Flattened array
 */
export const flattenMarketGroups = (data = {}, groupKeys = [], excludeSymbols = []) => {
  const flattened = []
  groupKeys.forEach(key => {
    const groupData = data[key] || []
    flattened.push(...groupData)
  })
  return excludeSymbols.length > 0 ? filterSymbols(flattened, excludeSymbols) : flattened
}
