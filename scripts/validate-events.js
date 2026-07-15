#!/usr/bin/env node
/**
 * Validate tennis event data integrity.
 *
 * Usage: node scripts/validate-events.js
 */

const path = require('path');
const {
  tennisEvents,
  eventsById,
  eventDates,
  eventsByDate
} = require(path.join(__dirname, '..', 'data', 'tennis_events.js'));
const { parseDateParts, expandDateRange } = require(path.join(__dirname, '..', 'utils', 'date.js'));
const { createStableEventId } = require(path.join(__dirname, '..', 'utils', 'event-id.js'));
const { getLevelMeta } = require(path.join(__dirname, '..', 'utils', 'levels.js'));

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (!Array.isArray(tennisEvents) || tennisEvents.length === 0) {
  fail('tennisEvents is empty');
}

const ids = new Set();
tennisEvents.forEach((event, index) => {
  const label = `#${index + 1} ${event.tour} ${event.eventName}`;

  if (!event.id) fail(`${label}: missing id`);
  if (ids.has(event.id)) fail(`${label}: duplicate id ${event.id}`);
  ids.add(event.id);

  if (!eventsById[event.id]) fail(`${label}: missing from eventsById`);

  if (!parseDateParts(event.startDate)) fail(`${label}: invalid startDate ${event.startDate}`);
  if (!parseDateParts(event.endDate)) fail(`${label}: invalid endDate ${event.endDate}`);
  if (event.startDate > event.endDate) fail(`${label}: startDate after endDate`);

  if (!event.tour) fail(`${label}: missing tour`);
  if (!event.eventName) fail(`${label}: missing eventName`);
  if (!event.level) fail(`${label}: missing level`);
  if (!getLevelMeta(event.level)) warn(`${label}: unknown level "${event.level}"`);

  const expectedId = createStableEventId(event.tour, event.eventName, event.startDate);
  const suffixedIdPattern = new RegExp(`^${escapeRegExp(expectedId)}__(?:[2-9]|[1-9]\\d+)$`);
  if (event.id !== expectedId && !suffixedIdPattern.test(String(event.id))) {
    fail(`${label}: id ${event.id} does not match stable form ${expectedId}`);
  }
});

const sampleDate = Object.keys(eventsByDate)[0];
if (!sampleDate) {
  fail('eventsByDate is empty');
} else if (!Array.isArray(eventsByDate[sampleDate])) {
  fail('eventsByDate entries should be arrays');
}

Object.keys(eventDates).forEach(date => {
  if (!eventsByDate[date] || eventsByDate[date].length === 0) {
    fail(`eventDates has ${date} but eventsByDate is empty`);
  }
});

// Spot-check range expansion consistency
const sample = tennisEvents[0];
if (sample) {
  const range = expandDateRange(sample.startDate, sample.endDate);
  range.forEach(date => {
    if (!eventsByDate[date] || !eventsByDate[date].some(e => e.id === sample.id)) {
      fail(`sample event missing from eventsByDate[${date}]`);
    }
  });
}

console.log('TennisTour event validation');
console.log(`  events: ${tennisEvents.length}`);
console.log(`  unique ids: ${ids.size}`);
console.log(`  dates with events: ${Object.keys(eventsByDate).length}`);
console.log(`  calendar markers: ${Object.keys(eventDates).length}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach(message => console.log(`  - ${message}`));
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach(message => console.error(`  - ${message}`));
  process.exit(1);
}

console.log('\nOK');
