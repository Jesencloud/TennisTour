const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  tennisEvents,
  eventsById,
  eventsByDate,
  eventDates
} = require('../data/tennis_events.js');
const { createStableEventId } = require('../utils/event-id.js');
const { parseDateParts } = require('../utils/date.js');

describe('live tennis_events data', () => {
  it('has unique stable ids and full eventsById coverage', () => {
    const ids = tennisEvents.map(event => event.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(Object.keys(eventsById).length, tennisEvents.length);

    tennisEvents.forEach(event => {
      assert.equal(eventsById[event.id], event);
      const baseId = createStableEventId(event.tour, event.eventName, event.startDate);
      assert.ok(
        event.id === baseId || String(event.id).startsWith(`${baseId}__`),
        `unexpected id ${event.id}`
      );
      assert.ok(parseDateParts(event.startDate));
      assert.ok(parseDateParts(event.endDate));
      assert.ok(event.startDate <= event.endDate);
    });
  });

  it('keeps eventDates and eventsByDate in sync', () => {
    Object.keys(eventDates).forEach(date => {
      assert.ok(eventsByDate[date] && eventsByDate[date].length > 0, date);
      assert.equal(eventDates[date].hasEvent, true);
    });
  });
});
