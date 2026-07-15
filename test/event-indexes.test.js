const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  createEventIndexes,
  createEventsById,
  getDateEventTypeLabel,
  GRAND_SLAM_DATE_BADGE
} = require('../utils/event-indexes.js');
const { assignStableEventIds } = require('../utils/event-id.js');

function makeEvents() {
  const events = [
    {
      tour: 'ATP',
      eventName: 'Sample 250',
      level: '250',
      startDate: '2026-04-01',
      endDate: '2026-04-03'
    },
    {
      tour: 'WTA',
      eventName: 'Sample 1000',
      level: '1000',
      startDate: '2026-04-02',
      endDate: '2026-04-02'
    },
    {
      tour: 'ATP',
      eventName: 'Sample Slam',
      level: 'Grand Slam',
      startDate: '2026-06-01',
      endDate: '2026-06-02'
    },
    {
      tour: 'WTA',
      eventName: 'Sample Slam',
      level: 'Grand Slam',
      startDate: '2026-06-01',
      endDate: '2026-06-02'
    },
    {
      tour: 'ATP/WTA',
      eventName: 'Mixed Cup',
      level: '500',
      startDate: '2026-01-05',
      endDate: '2026-01-05'
    }
  ];
  assignStableEventIds(events);
  return events;
}

describe('getDateEventTypeLabel', () => {
  it('labels mixed, slam, and tour levels', () => {
    assert.equal(getDateEventTypeLabel({ tour: 'ATP/WTA', level: '500' }), 'Mixed');
    assert.equal(
      getDateEventTypeLabel({ tour: 'ATP', level: 'Grand Slam' }),
      GRAND_SLAM_DATE_BADGE
    );
    assert.equal(getDateEventTypeLabel({ tour: 'WTA', level: '1000' }), 'WTA1000');
  });
});

describe('createEventIndexes', () => {
  it('expands multi-day events into eventsByDate', () => {
    const events = makeEvents();
    const { eventsByDate, eventDates } = createEventIndexes(events);

    assert.equal(eventsByDate['2026-04-01'].length, 1);
    assert.equal(eventsByDate['2026-04-02'].length, 2);
    assert.equal(eventsByDate['2026-04-03'].length, 1);

    assert.ok(eventDates['2026-04-02'].hasEvent);
    assert.deepEqual(eventDates['2026-04-02'].badges, ['WTA1000', 'ATP250']);
  });

  it('collapses grand slam badges to trophy', () => {
    const events = makeEvents();
    const { eventDates, eventsByDate } = createEventIndexes(events);

    assert.equal(eventsByDate['2026-06-01'].length, 2);
    assert.deepEqual(eventDates['2026-06-01'].badges, [GRAND_SLAM_DATE_BADGE]);
    assert.equal(eventDates['2026-06-01'].isGrandSlam, true);
  });

  it('marks mixed events as Mixed badge', () => {
    const events = makeEvents();
    const { eventDates } = createEventIndexes(events);
    assert.deepEqual(eventDates['2026-01-05'].badges, ['Mixed']);
  });

  it('orders same-tour and same-level events by start date before name', () => {
    const events = [
      {
        tour: 'ATP',
        eventName: 'Zulu Open',
        city: 'Rome',
        level: '250',
        startDate: '2026-04-01',
        endDate: '2026-04-03'
      },
      {
        tour: 'ATP',
        eventName: 'Alpha Open',
        city: 'Paris',
        level: '250',
        startDate: '2026-04-02',
        endDate: '2026-04-02'
      }
    ];
    assignStableEventIds(events);

    const { eventsByDate } = createEventIndexes(events);

    assert.deepEqual(
      eventsByDate['2026-04-02'].map(event => event.eventName),
      ['Zulu Open', 'Alpha Open']
    );
  });
});

describe('createEventsById', () => {
  it('maps id to event object', () => {
    const events = makeEvents();
    const eventsById = createEventsById(events);
    const first = events[0];
    assert.equal(eventsById[first.id], first);
    assert.equal(Object.keys(eventsById).length, events.length);
  });
});
