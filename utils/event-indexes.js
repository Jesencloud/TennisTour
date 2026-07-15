/**
 * Build calendar/list indexes from a normalized event list.
 */

const { expandDateRange } = require('./date.js');
const { getLevelMeta, getLevelPriority } = require('./levels.js');

const GRAND_SLAM_DATE_BADGE = '🏆️';
const DATE_LEVEL_LABELS = {
  '1000': '1000',
  '500': '500',
  '250': '250',
  finals: 'Finals',
  laverCup: 'Laver',
  davisCup: 'Davis'
};
const TOUR_DISPLAY_ORDER = {
  'ATP/WTA': 1,
  WTA: 2,
  ATP: 3,
  'Grand Slam': 4
};

function getDateEventTypeLabel(event) {
  if (event.tour === 'ATP/WTA') {
    return 'Mixed';
  }

  const levelMeta = getLevelMeta(event.level);
  if (!levelMeta) {
    return event.tour ? `${event.tour}${event.level}` : event.level;
  }
  if (levelMeta.key === 'grandSlam') return GRAND_SLAM_DATE_BADGE;

  const levelLabel = DATE_LEVEL_LABELS[levelMeta.key] || event.level;
  return event.tour ? `${event.tour}${levelLabel}` : levelLabel;
}

function getDateBadgeSortValue(label) {
  const tourMatch = /^(WTA|ATP)/.exec(label);
  const tour = tourMatch ? tourMatch[1] : '';
  const level = tour ? label.slice(tour.length) : label;

  return [
    getLevelPriority(level, 99),
    TOUR_DISPLAY_ORDER[tour] || 9,
    label
  ];
}

function sortDateBadges(a, b) {
  const aParts = getDateBadgeSortValue(a);
  const bParts = getDateBadgeSortValue(b);
  return (
    aParts[0] - bParts[0] ||
    aParts[1] - bParts[1] ||
    aParts[2].localeCompare(bParts[2])
  );
}

function compareEventsForDate(a, b) {
  return (
    (TOUR_DISPLAY_ORDER[a.tour] || 9) - (TOUR_DISPLAY_ORDER[b.tour] || 9) ||
    getLevelPriority(a.level, 9) - getLevelPriority(b.level, 9) ||
    String(a.startDate || '').localeCompare(String(b.startDate || '')) ||
    String(a.eventName || '').localeCompare(String(b.eventName || '')) ||
    String(a.city || '').localeCompare(String(b.city || ''))
  );
}

function createEventIndexes(events) {
  const eventDates = {};
  const eventsByDate = {};

  events.forEach(event => {
    const levelMeta = getLevelMeta(event.level);
    const isGrandSlam = levelMeta && levelMeta.key === 'grandSlam';
    const range = expandDateRange(event.startDate, event.endDate || event.startDate);

    range.forEach(date => {
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);

      if (!eventDates[date]) {
        eventDates[date] = {
          hasEvent: true,
          badges: []
        };
      }

      if (isGrandSlam) {
        eventDates[date].isGrandSlam = true;
        eventDates[date].badges = [GRAND_SLAM_DATE_BADGE];
        return;
      }

      if (!eventDates[date].isGrandSlam) {
        const badge = getDateEventTypeLabel(event);
        if (!eventDates[date].badges.includes(badge)) {
          eventDates[date].badges.push(badge);
        }
      }
    });
  });

  Object.keys(eventsByDate).forEach(date => {
    eventsByDate[date].sort(compareEventsForDate);

    if (eventDates[date] && !eventDates[date].isGrandSlam) {
      eventDates[date].badges.sort(sortDateBadges);
    }
  });

  return { eventDates, eventsByDate };
}

function createEventsById(events) {
  return events.reduce((eventsById, event) => {
    eventsById[event.id] = event;
    return eventsById;
  }, {});
}

module.exports = {
  GRAND_SLAM_DATE_BADGE,
  DATE_LEVEL_LABELS,
  TOUR_DISPLAY_ORDER,
  getDateEventTypeLabel,
  sortDateBadges,
  compareEventsForDate,
  createEventIndexes,
  createEventsById
};
