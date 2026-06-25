/**
 * Linear regression for rating prediction.
 * Given an array of { x, y } points, returns slope, intercept, and predicted values.
 */

export function linearRegression(points) {
  const n = points.length
  if (n < 2) return null

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const { x, y } of points) {
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R² (coefficient of determination) for confidence
  const meanY = sumY / n
  let ssRes = 0, ssTot = 0
  for (const { x, y } of points) {
    const predicted = slope * x + intercept
    ssRes += (y - predicted) ** 2
    ssTot += (y - meanY) ** 2
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, rSquared }
}

/**
 * Predict future rating values based on rating history.
 * @param {Array} history - Array from rating_history API [{ ratingUpdateTimeSeconds, newRating, ... }]
 * @param {number} futureContests - How many contests ahead to predict (default 5)
 * @returns {Object} { trendline, projections, rSquared }
 *   trendline: [{ contestIndex, date, rating }] — actual data with fitted values
 *   projections: [{ contestIndex, date, rating }] — future predicted points
 *   rSquared: number (0-1, how well the line fits)
 */
export function predictRating(history, futureContests = 5) {
  if (!history || history.length < 2) return null

  // Sort by time ascending
  const sorted = [...history].sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds)

  // Use contest index as X (more stable than timestamps for projection)
  const points = sorted.map((h, i) => ({ x: i, y: h.newRating }))
  const result = linearRegression(points)
  if (!result) return null

  const { slope, intercept, rSquared } = result

  // Trendline: fitted values for existing contests
  const trendline = sorted.map((h, i) => ({
    contestIndex: i,
    date: new Date(h.ratingUpdateTimeSeconds * 1000).toISOString(),
    actualRating: h.newRating,
    fittedRating: Math.round(slope * i + intercept),
    contestName: h.contestName,
  }))

  // Projections: next N contests
  const lastIndex = sorted.length - 1
  const lastDate = new Date(sorted[lastIndex].ratingUpdateTimeSeconds * 1000)
  // Average gap between contests in days
  const avgGap = sorted.length > 1
    ? (sorted[lastIndex].ratingUpdateTimeSeconds - sorted[0].ratingUpdateTimeSeconds) / (sorted.length - 1) / 86400
    : 14

  const projections = []
  for (let i = 1; i <= futureContests; i++) {
    const idx = lastIndex + i
    const projDate = new Date(lastDate.getTime() + avgGap * i * 86400 * 1000)
    projections.push({
      contestIndex: idx,
      date: projDate.toISOString(),
      rating: Math.round(slope * idx + intercept),
      isProjection: true,
    })
  }

  // Confidence band based on standard error
  const residuals = points.map(p => Math.abs(p.y - (slope * p.x + intercept)))
  const stdError = residuals.length > 0
    ? residuals.reduce((a, b) => a + b, 0) / residuals.length
    : 50

  return { trendline, projections, rSquared, stdError }
}
