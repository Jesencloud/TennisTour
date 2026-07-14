// components/calendar/calendar.js
const { t } = require('../../utils/i18n.js');
const { eventDates } = require('../../data/tennis_events.js');
const {
  formatLocalYMD,
  parseLocalDate,
  getTodayLocal,
  getShiftedMonth
} = require('../../utils/date.js');

const SWIPER_CENTER_INDEX = 1;
const SWIPER_DURATION_MS = 220;

function getCalendarText(lang) {
  return {
    weekdays: t('weekdays', lang)
  };
}

const badgeCache = {};
function normalizeEventBadge(badge) {
  const label = typeof badge === 'object' && badge !== null
    ? badge.label
    : badge;

  if (!label) return null;

  const text = String(label);
  if (badgeCache[text]) {
    return badgeCache[text];
  }

  let tone = 'other';
  if (text === '🏆️' || text === '🏆') {
    tone = 'crown';
  } else if (text.indexOf('WTA') === 0) {
    tone = 'wta';
  } else if (text.indexOf('ATP') === 0) {
    tone = 'atp';
  } else if (text.indexOf('Mixed') === 0 || text.indexOf('ATP/WTA') === 0) {
    tone = 'mixed';
  }

  const result = { label: text, tone };
  badgeCache[text] = result;
  return result;
}

Component({
  calendarSwipeAnimating: false,
  monthDaysCache: null,
  monthDaysCacheToday: '',

  properties: {
    lang: {
      type: String,
      value: 'zh'
    },
    selectedDate: {
      type: String,
      value: '',
      observer(newVal) {
        if (newVal && newVal !== this.data.selectedDate && this.data.currentYear) {
          this.goToDate(newVal);
        }
      }
    }
  },

  data: {
    monthPanels: [],
    currentMonth: 0,
    currentYear: 0,
    selectedDate: '',
    swiperCurrent: SWIPER_CENTER_INDEX,
    swiperDuration: SWIPER_DURATION_MS,
    weekdays: []
  },

  lifetimes: {
    attached() {
      this.monthDaysCache = Object.create(null);
      this.monthDaysCacheToday = '';

      const todayDate = getTodayLocal();
      const parsedToday = parseLocalDate(todayDate);
      const defaultDate = todayDate;
      const initialDate = this.properties.selectedDate || defaultDate;
      const parsed = parseLocalDate(initialDate) || parsedToday;

      const currentYear = parsed.year;
      const currentMonth = parsed.month;
      const locale = getCalendarText(this.data.lang);
      const calendarState = this.getCalendarState(currentYear, currentMonth);

      this.setData({
        currentYear,
        currentMonth,
        selectedDate: initialDate,
        weekdays: locale.weekdays,
        ...calendarState
      });
    }
  },

  methods: {
    normalizeEventMarker(marker) {
      if (!marker) {
        return {
          hasEvent: false,
          eventBadges: []
        };
      }

      const rawBadges = Array.isArray(marker.badges)
        ? marker.badges
        : [marker.badge].filter(Boolean);
      const eventBadges = rawBadges
        .map(normalizeEventBadge)
        .filter(Boolean);

      return {
        hasEvent: !!marker.hasEvent,
        eventBadges
      };
    },

    getCachedMonthDays(year, month, todayDate) {
      if (!this.monthDaysCache || this.monthDaysCacheToday !== todayDate) {
        this.monthDaysCache = Object.create(null);
        this.monthDaysCacheToday = todayDate;
      }

      const key = `${year}-${month}`;
      if (!this.monthDaysCache[key]) {
        this.monthDaysCache[key] = this.createMonthDays(year, month, todayDate);
      }
      return this.monthDaysCache[key];
    },

    getCalendarState(currentYear, currentMonth) {
      const todayDate = getTodayLocal();
      const prevMonth = getShiftedMonth(currentYear, currentMonth, -1);
      const nextMonth = getShiftedMonth(currentYear, currentMonth, 1);

      const monthPanels = [
        {
          key: `prev-${prevMonth.year}-${prevMonth.month}`,
          days: this.getCachedMonthDays(prevMonth.year, prevMonth.month, todayDate)
        },
        {
          key: `current-${currentYear}-${currentMonth}`,
          days: this.getCachedMonthDays(currentYear, currentMonth, todayDate)
        },
        {
          key: `next-${nextMonth.year}-${nextMonth.month}`,
          days: this.getCachedMonthDays(nextMonth.year, nextMonth.month, todayDate)
        }
      ];

      return { monthPanels };
    },

    createMonthDays(year, month, todayDate) {
      const firstDay = new Date(year, month, 1).getDay();
      const emptyDaysBefore = (firstDay + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = [];

      // Leading empties; fixed viewport height keeps swipe layout stable.
      for (let i = 0; i < emptyDaysBefore; i++) {
        days.push({
          day: '',
          fullDate: '',
          dateKey: `empty-before-${year}-${month}-${i}`,
          hasEvent: false
        });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = formatLocalYMD(year, month, i);
        const eventMarker = this.normalizeEventMarker(eventDates[fullDate]);
        days.push({
          day: i,
          fullDate: fullDate,
          dateKey: fullDate,
          hasEvent: eventMarker.hasEvent,
          eventBadges: eventMarker.eventBadges,
          isPast: fullDate < todayDate
        });
      }

      return days;
    },

    goToDate(date) {
      const parsedDate = parseLocalDate(date);
      if (!parsedDate) return;

      this.setData({
        currentYear: parsedDate.year,
        currentMonth: parsedDate.month,
        selectedDate: date,
        swiperCurrent: SWIPER_CENTER_INDEX,
        swiperDuration: 0,
        ...this.getCalendarState(parsedDate.year, parsedDate.month)
      }, () => this.restoreSwiperDuration());
    },

    onCalendarSwiperFinish(e) {
      const current = e.detail && typeof e.detail.current === 'number'
        ? e.detail.current
        : SWIPER_CENTER_INDEX;

      if (current === SWIPER_CENTER_INDEX) return;

      const offset = current > SWIPER_CENTER_INDEX ? 1 : -1;
      this.calendarSwipeAnimating = true;
      this.changeMonth(offset, { autoSelectDate: true, resetSwiper: true });
    },

    restoreSwiperDuration() {
      if (this.data.swiperDuration === SWIPER_DURATION_MS) return;
      this.setData({ swiperDuration: SWIPER_DURATION_MS });
    },

    slideMonth(offset) {
      if (this.calendarSwipeAnimating) return;

      this.calendarSwipeAnimating = true;
      this.setData({
        swiperCurrent: offset > 0 ? SWIPER_CENTER_INDEX + 1 : SWIPER_CENTER_INDEX - 1,
        swiperDuration: SWIPER_DURATION_MS
      });
    },

    getAutoSelectedDate(year, month) {
      let day = 1;
      const currentSelected = this.data.selectedDate;
      const parsed = parseLocalDate(currentSelected);
      if (parsed) {
        day = parsed.day;
      } else {
        day = new Date().getDate();
      }

      // Keep the same day-of-month when switching months.
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      // If the target month is shorter, clamp to its last day.
      const targetDay = Math.min(day, daysInMonth);
      return formatLocalYMD(year, month, targetDay);
    },

    onMonthPickerChange(e) {
      const val = e.detail.value;
      const parts = val.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;

      wx.vibrateShort({ type: 'light', fail: () => {} });

      const selectedDate = this.getAutoSelectedDate(year, month);
      this.setData({
        currentMonth: month,
        currentYear: year,
        selectedDate,
        swiperCurrent: SWIPER_CENTER_INDEX,
        swiperDuration: 0,
        ...this.getCalendarState(year, month)
      }, () => {
        this.calendarSwipeAnimating = false;
        this.restoreSwiperDuration();
        this.triggerEvent('selectdate', { date: selectedDate });
      });
    },

    changeMonth(offset, options = {}) {
      const shiftedMonth = getShiftedMonth(
        this.data.currentYear,
        this.data.currentMonth,
        offset
      );
      const currentYear = shiftedMonth.year;
      const currentMonth = shiftedMonth.month;

      const selectedDate = options.autoSelectDate
        ? this.getAutoSelectedDate(currentYear, currentMonth)
        : this.data.selectedDate;
      const nextData = {
        currentMonth,
        currentYear,
        selectedDate,
        ...this.getCalendarState(currentYear, currentMonth)
      };

      if (options.resetSwiper) {
        nextData.swiperCurrent = SWIPER_CENTER_INDEX;
        nextData.swiperDuration = 0;
      }

      this.setData(nextData, () => {
        this.calendarSwipeAnimating = false;
        if (options.autoSelectDate) {
          this.triggerEvent('selectdate', { date: selectedDate });
        }
      });
    },

    prevMonth() {
      wx.vibrateShort({ type: 'light', fail: () => {} });
      this.slideMonth(-1);
    },

    nextMonth() {
      wx.vibrateShort({ type: 'light', fail: () => {} });
      this.slideMonth(1);
    },

    selectDay(e) {
      const { date } = e.currentTarget.dataset;
      if (!date) return;

      wx.vibrateShort({ type: 'light', fail: () => {} });

      this.setData({ selectedDate: date });
      this.triggerEvent('selectdate', { date });
    },

    onTouchStart() {
      if (this.data.swiperDuration !== SWIPER_DURATION_MS) {
        this.setData({ swiperDuration: SWIPER_DURATION_MS });
      }
    }
  },

  observers: {
    'lang': function(lang) {
      const locale = getCalendarText(lang);
      this.setData({
        weekdays: locale.weekdays
      });
    }
  }
});
