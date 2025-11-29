/**
 * Get next year (current year + 1)
 */
export function getNextYear(): number {
  return new Date().getFullYear() + 1;
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get New Year date for next year
 */
export function getNextNewYearDate(): Date {
  const nextYear = getNextYear();
  return new Date(nextYear, 0, 1, 0, 0, 0);
}

/**
 * Get date for December 28 of current year
 */
export function getDecember28Date(): Date {
  const currentYear = getCurrentYear();
  return new Date(currentYear, 11, 28, 12, 0, 15); // month is 0-indexed, so 11 = December
}

/**
 * Get date for December 24 of current year
 */
export function getDecember24Date(): Date {
  const currentYear = getCurrentYear();
  return new Date(currentYear, 11, 24, 21, 55, 15);
}

/**
 * Get date for December 25 of current year
 */
export function getDecember25Date(): Date {
  const currentYear = getCurrentYear();
  return new Date(currentYear, 11, 25, 10, 0, 15);
}

