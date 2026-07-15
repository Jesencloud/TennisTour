const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidDate,
  parseDateParts,
  parseLocalDate,
  formatLocalYMD,
  formatLocalDate,
  getShiftedMonth,
  expandDateRange,
  getLocalMidnightTimestamp,
  getLocalAllDayEndTimestamp
} = require('../utils/date.js');

describe('isValidDate', () => {
  it('validates leap years and real calendar dates', () => {
    assert.equal(isValidDate(2028, 2, 29), true);
    assert.equal(isValidDate(2026, 2, 29), false);
    assert.equal(isValidDate(2026, 2, 31), false);
    assert.equal(isValidDate(2026, 13, 1), false);
  });
});

describe('parseDateParts', () => {
  it('parses valid YYYY-MM-DD with month 1-12', () => {
    assert.deepEqual(parseDateParts('2026-07-14'), {
      year: 2026,
      month: 7,
      day: 14
    });
  });

  it('rejects invalid strings', () => {
    assert.equal(parseDateParts('2026/07/14'), null);
    assert.equal(parseDateParts('07-14-2026'), null);
    assert.equal(parseDateParts(''), null);
    assert.equal(parseDateParts('2026-02-31'), null);
    assert.equal(parseDateParts('2026-13-01'), null);
  });
});

describe('parseLocalDate / formatLocalYMD', () => {
  it('uses month 0-11 for JS Date compatibility', () => {
    assert.deepEqual(parseLocalDate('2026-01-05'), {
      year: 2026,
      month: 0,
      day: 5
    });
    assert.equal(formatLocalYMD(2026, 0, 5), '2026-01-05');
    assert.equal(formatLocalYMD(2026, 11, 31), '2026-12-31');
  });
});

describe('formatLocalDate', () => {
  it('formats a Date in local timezone', () => {
    const date = new Date(2026, 6, 14);
    assert.equal(formatLocalDate(date), '2026-07-14');
  });
});

describe('getShiftedMonth', () => {
  it('crosses year boundaries', () => {
    assert.deepEqual(getShiftedMonth(2026, 0, -1), { year: 2025, month: 11 });
    assert.deepEqual(getShiftedMonth(2026, 11, 1), { year: 2027, month: 0 });
  });
});

describe('expandDateRange', () => {
  it('expands inclusive UTC day ranges', () => {
    assert.deepEqual(expandDateRange('2026-01-30', '2026-02-01'), [
      '2026-01-30',
      '2026-01-31',
      '2026-02-01'
    ]);
  });

  it('handles single-day events', () => {
    assert.deepEqual(expandDateRange('2026-03-01', '2026-03-01'), ['2026-03-01']);
  });

  it('returns empty for invalid or inverted ranges', () => {
    assert.deepEqual(expandDateRange('bad', '2026-01-01'), []);
    assert.deepEqual(expandDateRange('2026-02-01', '2026-01-01'), []);
  });
});

describe('calendar timestamps', () => {
  it('returns local midnight and exclusive all-day end', () => {
    const start = getLocalMidnightTimestamp('2026-07-14');
    const end = getLocalAllDayEndTimestamp('2026-07-14');
    assert.equal(typeof start, 'number');
    assert.equal(typeof end, 'number');
    assert.equal(end - start, 86400);
  });

  it('uses the next local midnight across DST transitions', () => {
    const originalTimezone = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      const duration = date => (
        getLocalAllDayEndTimestamp(date) - getLocalMidnightTimestamp(date)
      );
      assert.equal(duration('2026-03-08'), 23 * 60 * 60);
      assert.equal(duration('2026-11-01'), 25 * 60 * 60);
    } finally {
      if (originalTimezone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTimezone;
      }
    }
  });
});
