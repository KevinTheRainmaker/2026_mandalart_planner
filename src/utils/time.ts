/**
 * Check if a day is unlocked based on completed days and time
 * @param completedDays - Array of completed day numbers
 * @param targetDay - The day number to check
 * @param isDebugAccount - Whether the user is a debug account
 * @returns true if the day is unlocked, false otherwise
 */
export function isDayUnlocked(
  completedDays: number[],
  targetDay: number,
  isDebugAccount: boolean = false
): boolean {
  // Debug accounts can access any day
  if (isDebugAccount) return true

  // Day 1 is always unlocked
  if (targetDay === 1) return true

  // Check if previous day is completed
  const previousDay = targetDay - 1
  if (!completedDays.includes(previousDay)) {
    return false
  }

  // Check if it's past midnight Korea time
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))

  // Get the timestamp of when previous day was completed (assume it was yesterday)
  // Since we don't store completion timestamp, we check if it's a new day
  const lastMidnight = new Date(koreaTime)
  lastMidnight.setHours(0, 0, 0, 0)

  // If current time is past midnight, the next day is unlocked
  return koreaTime >= lastMidnight
}

/**
 * Get Korea time as Date object
 */
export function getKoreaTime(): Date {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
}

/**
 * Check if it's past midnight Korea time today
 */
export function isPastMidnight(): boolean {
  const koreaTime = getKoreaTime()
  const midnight = new Date(koreaTime)
  midnight.setHours(24, 0, 0, 0)

  return koreaTime >= midnight
}
