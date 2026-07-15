const test = require('node:test');
const assert = require('node:assert/strict');
const { eventDates } = require('../data/tennis_events.js');

let calendarDefinition;
const originalComponent = global.Component;
try {
  global.Component = definition => {
    calendarDefinition = definition;
  };
  require('../components/calendar/calendar.js');
} finally {
  global.Component = originalComponent;
}

function createCalendarInstance() {
  const instance = Object.assign({
    monthDaysCache: null,
    monthDaysCacheToday: '',
    createMonthDaysCallCount: 0
  }, calendarDefinition.methods);
  const createMonthDays = instance.createMonthDays;
  instance.createMonthDays = function(...args) {
    this.createMonthDaysCallCount += 1;
    return createMonthDays.apply(this, args);
  };
  return instance;
}

test('calendar cache uses real component logic and immutable event dates', () => {
  const instance = createCalendarInstance();

  instance.getCachedMonthDays(2026, 0, '2026-01-01');
  instance.getCachedMonthDays(2026, 0, '2026-01-01');
  assert.equal(instance.createMonthDaysCallCount, 1);

  instance.getCachedMonthDays(2026, 0, '2026-01-02');
  assert.equal(instance.createMonthDaysCallCount, 2);
  assert.equal(Object.isFrozen(eventDates), true);
  assert.equal(instance.getCachedMonthDays, calendarDefinition.methods.getCachedMonthDays);
});
