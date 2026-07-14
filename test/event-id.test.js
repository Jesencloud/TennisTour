const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  slugifyPart,
  createStableEventId,
  assignStableEventIds
} = require('../utils/event-id.js');

describe('slugifyPart', () => {
  it('normalizes names for ids', () => {
    assert.equal(slugifyPart('Australian Open'), 'australian-open');
    assert.equal(slugifyPart('ATP/WTA'), 'atp-wta');
    assert.equal(slugifyPart("Internazionali BNL d'Italia"), 'internazionali-bnl-d-italia');
  });
});

describe('createStableEventId', () => {
  it('builds tour__name__startDate ids', () => {
    assert.equal(
      createStableEventId('ATP', 'Australian Open', '2026-01-18'),
      'atp__australian-open__2026-01-18'
    );
    assert.equal(
      createStableEventId('WTA', 'Australian Open', '2026-01-18'),
      'wta__australian-open__2026-01-18'
    );
  });
});

describe('assignStableEventIds', () => {
  it('assigns unique ids and suffixes collisions', () => {
    const events = [
      { tour: 'ATP', eventName: 'Demo Open', startDate: '2026-05-01' },
      { tour: 'ATP', eventName: 'Demo Open', startDate: '2026-05-01' },
      { tour: 'WTA', eventName: 'Demo Open', startDate: '2026-05-01' }
    ];

    assignStableEventIds(events);

    assert.equal(events[0].id, 'atp__demo-open__2026-05-01');
    assert.equal(events[1].id, 'atp__demo-open__2026-05-01__2');
    assert.equal(events[2].id, 'wta__demo-open__2026-05-01');
  });
});
