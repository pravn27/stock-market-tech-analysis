/**
 * Formatters Utility
 * Contains reusable formatting functions for prices, percentages, numbers
 */

/**
 * Format price with commas and decimals
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, decimals = 2) => {
  if (price === null || price === undefined || isNaN(price)) return '-'
  return price.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format percentage with sign
 * @param {number} pct - Percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {boolean} includeSign - Include + sign for positive (default: true)
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (pct, decimals = 2, includeSign = true) => {
  if (pct === null || pct === undefined || isNaN(pct)) return '-'
  const sign = includeSign && pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(decimals)}%`
}

/**
 * Format change value with sign
 * @param {number} change - Change value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted change
 */
export const formatChange = (change, decimals = 2) => {
  if (change === null || change === undefined || isNaN(change)) return '-'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(decimals)}`
}

/**
 * Get sign for percentage (+ or -)
 * @param {number} value - Numeric value
 * @returns {string} - '+' or ''
 */
export const getSign = (value) => {
  return value > 0 ? '+' : ''
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatLargeNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '-'
  
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

/**
 * Format timestamp to readable date
 * @param {string|Date} timestamp - Timestamp
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} - Formatted date
 */
export const formatDate = (timestamp, locale = 'en-US') => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
