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
 * @returns {Object} - { bullishCount, bearishCount, neutralCount, total, bullishPercent, dominantSentiment, dominantPercent, dominantLabel }
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
  const bearishPercent = total > 0 ? Math.round((bearishCount / total) * 100) : 0
  const neutralPercent = total > 0 ? Math.round((neutralCount / total) * 100) : 0

  // Determine dominant sentiment
  let dominantSentiment = 'neutral'
  let dominantPercent = neutralPercent
  let dominantLabel = 'Neutral'
  let dominantColor = 'default'

  if (bullishPercent >= bearishPercent && bullishPercent >= neutralPercent) {
    dominantSentiment = 'bullish'
    dominantPercent = bullishPercent
    dominantLabel = 'Bullish'
    dominantColor = 'green'
  } else if (bearishPercent >= bullishPercent && bearishPercent >= neutralPercent) {
    dominantSentiment = 'bearish'
    dominantPercent = bearishPercent
    dominantLabel = 'Bearish'
    dominantColor = 'red'
  }

  return {
    bullishCount,
    bearishCount,
    neutralCount,
    total,
    bullishPercent,
    bearishPercent,
    neutralPercent,
    dominantSentiment,
    dominantPercent,
    dominantLabel,
    dominantColor
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

/**
 * VIX Level Classification
 * @param {number} vixValue - Current VIX value
 * @returns {Object} - { level, emoji, label, description, color }
 */
export const getVixLevel = (vixValue) => {
  if (vixValue < 15) {
    return {
      level: 'low',
      emoji: '😌',
      label: 'LOW FEAR',
      description: 'Calm markets',
      color: '#52c41a',
      tradingMode: 'Normal trading conditions'
    }
  } else if (vixValue < 20) {
    return {
      level: 'normal',
      emoji: '🙂',
      label: 'NORMAL',
      description: 'Average volatility',
      color: '#1890ff',
      tradingMode: 'Standard volatility'
    }
  } else if (vixValue < 30) {
    return {
      level: 'elevated',
      emoji: '😰',
      label: 'ELEVATED',
      description: 'Increased caution',
      color: '#faad14',
      tradingMode: 'Heightened risk'
    }
  } else if (vixValue < 40) {
    return {
      level: 'high',
      emoji: '😱',
      label: 'HIGH FEAR',
      description: 'Defensive mode',
      color: '#ff4d4f',
      tradingMode: 'High volatility - Trade carefully'
    }
  } else {
    return {
      level: 'extreme',
      emoji: '🚨',
      label: 'EXTREME PANIC',
      description: 'Crisis mode',
      color: '#cf1322',
      tradingMode: 'Extreme volatility - High risk'
    }
  }
}

/**
 * Check if VIX warrants an alert
 * @param {number} vixValue - Current VIX value
 * @param {number} vixChangePct - VIX change percentage
 * @returns {Object|null} - Alert object or null if no alert needed
 */
export const getVixAlert = (vixValue, vixChangePct) => {
  // VIX spike (>15% increase in a day)
  if (vixChangePct > 15) {
    return {
      type: 'spike',
      emoji: '⚠️',
      title: 'VIX SPIKE',
      message: `VIX jumped ${vixChangePct.toFixed(1)}%! Fear rising rapidly.`,
      action: 'Consider reducing risk exposure',
      color: '#ff4d4f'
    }
  }
  
  // Very high VIX (panic levels)
  if (vixValue >= 30) {
    return {
      type: 'high',
      emoji: '🚨',
      title: 'HIGH FEAR',
      message: `VIX at ${vixValue.toFixed(1)} - Panic levels`,
      action: 'Trade defensively or stay in cash',
      color: '#cf1322'
    }
  }
  
  // Very low VIX (complacency warning)
  if (vixValue < 12) {
    return {
      type: 'complacency',
      emoji: '⚡',
      title: 'LOW VOLATILITY',
      message: `VIX at ${vixValue.toFixed(1)} - Market complacency`,
      action: 'Stay alert - potential volatility ahead',
      color: '#faad14'
    }
  }
  
  // VIX falling after spike (fear subsiding)
  if (vixValue > 20 && vixChangePct < -10) {
    return {
      type: 'cooling',
      emoji: '✅',
      title: 'FEAR SUBSIDING',
      message: `VIX down ${Math.abs(vixChangePct).toFixed(1)}%`,
      action: 'Market may be stabilizing',
      color: '#52c41a'
    }
  }
  
  return null
}

/**
 * Get VIX trading implications based on level
 * @param {number} vixValue - Current VIX value
 * @returns {Object} - Trading implications
 */
export const getVixImplications = (vixValue) => {
  if (vixValue < 15) {
    return {
      rising: {
        title: '📈 When VIX Rises (Fear Increasing)',
        points: [
          '⚠️ Market uncertainty growing',
          '• Investors expect bigger price swings',
          '• Options getting more expensive',
          '• Possible market correction coming'
        ],
        actions: [
          '✓ Reduce position sizes',
          '✓ Tighten stop losses',
          '✓ Consider hedging positions',
          '✓ Be cautious with new entries',
          '✓ Hold more cash'
        ]
      },
      falling: {
        title: '📉 When VIX Falls (Fear Decreasing)',
        points: [
          '✅ Market stability/complacency',
          '• Investors confident',
          '• Lower volatility expected',
          '• Smoother market conditions'
        ],
        actions: [
          '✓ Normal position sizing okay',
          '✓ Good environment for trend following',
          '✓ Consider buying dips',
          '⚠️ BUT: Extremely low VIX = complacency = risk!'
        ]
      }
    }
  } else if (vixValue >= 30) {
    return {
      rising: {
        title: '📈 VIX Still Rising (Panic Mode)',
        points: [
          '🚨 Extreme fear in the market',
          '• Major institutional selling',
          '• Flight to safety (bonds, gold)',
          '• Wide intraday price swings'
        ],
        actions: [
          '✓ DEFENSIVE MODE - Protect capital first',
          '✓ Reduce positions to minimum',
          '✓ Use wide stop losses or exit',
          '✓ Wait for stabilization',
          '⚠️ Do not try to catch falling knives'
        ]
      },
      falling: {
        title: '📉 VIX Falling from Panic (Recovery)',
        points: [
          '✅ Fear starting to subside',
          '• Bargain hunters entering',
          '• Potential reversal signals',
          '• Volatility still elevated'
        ],
        actions: [
          '✓ Start small with high conviction trades',
          '✓ Wait for trend confirmation',
          '✓ Still use defensive position sizing',
          '✓ Be ready for false breakouts',
          '⚠️ Full recovery takes time'
        ]
      }
    }
  } else {
    return {
      rising: {
        title: '📈 When VIX Rises (Fear Increasing)',
        points: [
          '⚠️ Market uncertainty growing',
          '• Increased volatility expected',
          '• Risk-off sentiment building',
          '• Potential correction ahead'
        ],
        actions: [
          '✓ Reduce position sizes by 30-50%',
          '✓ Tighten stop losses',
          '✓ Consider hedging with puts',
          '✓ Focus on quality stocks',
          '✓ Increase cash allocation'
        ]
      },
      falling: {
        title: '📉 When VIX Falls (Fear Decreasing)',
        points: [
          '✅ Market confidence returning',
          '• Volatility normalizing',
          '• Risk appetite improving',
          '• Trend following favorable'
        ],
        actions: [
          '✓ Gradually increase position sizes',
          '✓ Look for breakout opportunities',
          '✓ Follow established trends',
          '✓ Still maintain proper risk management',
          '⚠️ Stay disciplined'
        ]
      }
    }
  }
}
