/**
 * Stable event IDs that survive sort-order and list-length changes.
 * Format: {tour}__{event-name}__{startDate}  e.g. atp__australian-open__2026-01-18
 */

function slugifyPart(value) {
  const slug = String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'unknown';
}

function createStableEventId(tour, eventName, startDate) {
  return `${slugifyPart(tour)}__${slugifyPart(eventName)}__${startDate}`;
}

/**
 * Assign unique stable ids onto event objects (mutates in place).
 * Collisions get a numeric suffix: ...__2, ...__3, ...
 */
function assignStableEventIds(events) {
  const seen = Object.create(null);

  events.forEach(event => {
    let id = createStableEventId(event.tour, event.eventName, event.startDate);
    if (seen[id]) {
      let suffix = 2;
      while (seen[`${id}__${suffix}`]) {
        suffix += 1;
      }
      id = `${id}__${suffix}`;
    }
    seen[id] = true;
    event.id = id;
  });

  return events;
}

module.exports = {
  slugifyPart,
  createStableEventId,
  assignStableEventIds
};
