/**
 * Returns the current month (e.g. "04").
 */
export function getCurrentMonth() {
  return String(new Date().getMonth() + 1).padStart(2, '0')
}

/**
 * Returns the current year (e.g. "2026").
 */
export function getCurrentYear() {
  return String(new Date().getFullYear())
}

/**
 * Returns today's date in D/M/YYYY Format (e.g. "30/4/2026").
 */
export function getTodayFormatted() {
  const now = new Date()
  return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
}
