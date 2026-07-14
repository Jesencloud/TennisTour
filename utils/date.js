/**
 * Date utilities for TennisTour.
 *
 * Local helpers use the device timezone (calendar UI, phone calendar).
 * UTC helpers expand multi-day tournament ranges without DST drift.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86400000;

function pad2(value) {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Parse YYYY-MM-DD into { year, month, day } where month is 1-12.
 */
function parseDateParts(date) {
  if (!DATE_RE.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

/**
 * Parse YYYY-MM-DD into { year, month, day } where month is 0-11 (JS Date style).
 */
function parseLocalDate(date) {
  const parts = parseDateParts(date);
  if (!parts) return null;
  return {
    year: parts.year,
    month: parts.month - 1,
    day: parts.day
  };
}

/** Format local calendar fields: month is 0-11. */
function formatLocalYMD(year, month0, day) {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

/** Format a Date using local timezone as YYYY-MM-DD. */
function formatLocalDate(date) {
  return formatLocalYMD(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTodayLocal() {
  return formatLocalDate(new Date());
}

function getShiftedMonth(year, month0, offset) {
  const date = new Date(year, month0 + offset, 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth()
  };
}

/** Parse YYYY-MM-DD as UTC midnight (stable multi-day range expansion). */
function parseUtcDate(date) {
  const parts = parseDateParts(date);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatUtcDate(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/**
 * Inclusive list of YYYY-MM-DD strings from start to end (UTC day steps).
 */
function expandDateRange(startDate, endDate) {
  const start = parseUtcDate(startDate);
  const end = parseUtcDate(endDate || startDate);
  if (!start || !end || end.getTime() < start.getTime()) return [];

  const dates = [];
  for (let time = start.getTime(); time <= end.getTime(); time += MS_PER_DAY) {
    dates.push(formatUtcDate(new Date(time)));
  }
  return dates;
}

/** Unix seconds at local midnight for a YYYY-MM-DD date. */
function getLocalMidnightTimestamp(date) {
  const parts = parseDateParts(date);
  if (!parts) return null;
  return Math.floor(new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0).getTime() / 1000);
}

/**
 * Unix seconds at local midnight of the day after YYYY-MM-DD.
 * Useful as exclusive all-day calendar end.
 */
function getLocalAllDayEndTimestamp(date) {
  const parts = parseDateParts(date);
  if (!parts) return null;
  return Math.floor(new Date(parts.year, parts.month - 1, parts.day + 1, 0, 0, 0).getTime() / 1000);
}

module.exports = {
  parseDateParts,
  parseLocalDate,
  formatLocalYMD,
  formatLocalDate,
  getTodayLocal,
  getShiftedMonth,
  parseUtcDate,
  formatUtcDate,
  expandDateRange,
  getLocalMidnightTimestamp,
  getLocalAllDayEndTimestamp
};
