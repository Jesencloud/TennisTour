// components/calendar/calendar.js
const { t } = require('../../utils/i18n.js');

const SWIPER_CENTER_INDEX = 1;
const SWIPER_DURATION_MS = 220;

function getCalendarText(lang) {
  return {
    weekdays: t('weekdays', lang),
    months: t('months', lang)
  };
}

Component({
  calendarSwipeAnimating: false,

  properties: {
    eventDates: {
      type: Object,
      value: {} // Object mapping 'YYYY-MM-DD' strings to event types
    },
    lang: {
      type: String,
      value: 'zh'
    }
  },

  data: {
    monthPanels: [],
    currentMonth: 0,
    currentYear: 0,
    selectedDate: '',
    showMonthPicker: false,
    baseYear: 0,
    pickerYear: 0,
    swiperCurrent: SWIPER_CENTER_INDEX,
    swiperDuration: SWIPER_DURATION_MS,
    weekdays: [],
    monthNames: []
  },

  lifetimes: {
    attached() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const locale = getCalendarText(this.data.lang);
      const selectedDate = this.formatDate(currentYear, currentMonth, now.getDate());
      const calendarState = this.getCalendarState(currentYear, currentMonth, this.data.eventDates);

      this.setData({
        currentYear,
        currentMonth,
        selectedDate,
        baseYear: currentYear,
        pickerYear: currentYear,
        weekdays: locale.weekdays,
        monthNames: locale.months,
        ...calendarState
      });
    }
  },

  methods: {
    normalizeEventMarker(marker) {
      if (!marker) {
        return {
          hasEvent: false,
          eventBadge: ''
        };
      }

      return {
        hasEvent: !!marker.hasEvent,
        eventBadge: marker.badge || ''
      };
    },

    generateCalendar() {
      const { currentYear, currentMonth, eventDates } = this.data;
      if (!currentYear) return;

      this.setData(this.getCalendarState(currentYear, currentMonth, eventDates));
    },

    getCalendarState(currentYear, currentMonth, eventDates = this.data.eventDates) {
      const now = new Date();
      const todayDate = this.formatDate(now.getFullYear(), now.getMonth(), now.getDate());
      const prevMonth = this.getShiftedMonth(currentYear, currentMonth, -1);
      const nextMonth = this.getShiftedMonth(currentYear, currentMonth, 1);

      const monthPanels = [
        {
          key: `prev-${prevMonth.year}-${prevMonth.month}`,
          days: this.createMonthDays(prevMonth.year, prevMonth.month, todayDate, eventDates)
        },
        {
          key: `current-${currentYear}-${currentMonth}`,
          days: this.createMonthDays(currentYear, currentMonth, todayDate, eventDates)
        },
        {
          key: `next-${nextMonth.year}-${nextMonth.month}`,
          days: this.createMonthDays(nextMonth.year, nextMonth.month, todayDate, eventDates)
        }
      ];

      return { monthPanels };
    },

    createMonthDays(year, month, todayDate, eventDates) {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const days = [];
      
      // Keep every month at 6 rows so swiping never changes the calendar height.
      for (let i = 0; i < firstDay; i++) {
        days.push({
          day: '',
          fullDate: '',
          dateKey: `empty-before-${year}-${month}-${i}`,
          hasEvent: false
        });
      }
      
      // Fill current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = this.formatDate(year, month, i);
        const eventMarker = this.normalizeEventMarker(eventDates[fullDate]);
        days.push({
          day: i,
          fullDate: fullDate,
          dateKey: fullDate,
          hasEvent: eventMarker.hasEvent,
          eventBadge: eventMarker.eventBadge,
          isPast: fullDate < todayDate
        });
      }

      return days;
    },

    formatDate(year, month, day) {
      const m = month + 1;
      const mm = m < 10 ? '0' + m : m;
      const dd = day < 10 ? '0' + day : day;
      return `${year}-${mm}-${dd}`;
    },

    parseDate(date) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      if (!match) return null;

      return {
        year: Number(match[1]),
        month: Number(match[2]) - 1,
        day: Number(match[3])
      };
    },

    getShiftedMonth(year, month, offset) {
      const date = new Date(year, month + offset, 1);
      return {
        year: date.getFullYear(),
        month: date.getMonth()
      };
    },

    goToDate(date) {
      const parsedDate = this.parseDate(date);
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

    openMonthPicker() {
      const { baseYear, currentYear } = this.data;
      const pickerYear = currentYear === baseYear || currentYear === baseYear + 1
        ? currentYear
        : baseYear;

      this.setData({
        showMonthPicker: true,
        pickerYear
      });
    },

    closeMonthPicker() {
      this.setData({ showMonthPicker: false });
    },

    stopMonthPickerTap() {},

    selectPickerYear(e) {
      const year = Number(e.currentTarget.dataset.year);
      if (Number.isNaN(year)) return;
      if (year !== this.data.baseYear && year !== this.data.baseYear + 1) return;

      this.setData({ pickerYear: year });
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
      const parsed = this.parseDate(currentSelected);
      if (parsed) {
        day = parsed.day;
      } else {
        day = new Date().getDate();
      }

      // Keep the same day-of-month when switching months.
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      // If the target month is shorter, clamp to its last day.
      const targetDay = Math.min(day, daysInMonth);
      return this.formatDate(year, month, targetDay);
    },

    selectMonth(e) {
      const month = Number(e.currentTarget.dataset.month);
      if (Number.isNaN(month)) return;

      const currentYear = this.data.pickerYear;
      const selectedDate = this.getAutoSelectedDate(currentYear, month);
      this.setData({
        currentMonth: month,
        currentYear,
        selectedDate,
        showMonthPicker: false,
        swiperCurrent: SWIPER_CENTER_INDEX,
        swiperDuration: 0,
        ...this.getCalendarState(currentYear, month)
      }, () => {
        this.calendarSwipeAnimating = false;
        this.restoreSwiperDuration();
        this.triggerEvent('selectdate', { date: selectedDate });
      });
    },

    changeMonth(offset, options = {}) {
      const shiftedMonth = this.getShiftedMonth(
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
        const finishChange = () => {
          this.calendarSwipeAnimating = false;
          if (options.autoSelectDate) {
            this.triggerEvent('selectdate', { date: selectedDate });
          }
        };

        if (options.resetSwiper) {
          this.setData({ swiperDuration: SWIPER_DURATION_MS }, finishChange);
          return;
        }

        finishChange();
      });
    },

    prevMonth() {
      this.slideMonth(-1);
    },

    nextMonth() {
      this.slideMonth(1);
    },

    selectDay(e) {
      const { date } = e.currentTarget.dataset;
      if (!date) return;
      
      wx.vibrateShort({ type: 'light', fail: () => {} });
      
      this.setData({ selectedDate: date });
      this.triggerEvent('selectdate', { date });
    }
  },

  observers: {
    'eventDates': function() {
      this.generateCalendar();
    },
    'lang': function(lang) {
      const locale = getCalendarText(lang);
      this.setData({
        weekdays: locale.weekdays,
        monthNames: locale.months
      });
    }
  }
});
