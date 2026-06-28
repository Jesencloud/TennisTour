// components/calendar/calendar.js
const { t } = require('../../utils/i18n.js');

function getCalendarText(lang) {
  return {
    weekdays: t('weekdays', lang),
    months: t('months', lang)
  };
}

Component({
  calendarTouchStartX: null,
  calendarTouchStartY: null,
  calendarTouchLastOffset: 0,
  calendarDidDrag: false,
  calendarSwipeAnimating: false,
  calendarSuppressTapUntil: 0,
  calendarSwipeTimer: null,

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
    swipeOffset: '0px',
    swipeTransition: 'none',
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
    },

    detached() {
      clearTimeout(this.calendarSwipeTimer);
    }
  },

  methods: {
    normalizeEventMarker(marker) {
      if (!marker) {
        return {
          hasEvent: false,
          eventIcons: [],
          eventBadge: ''
        };
      }

      return {
        hasEvent: marker.icons && marker.icons.length > 0,
        eventIcons: marker.icons || [],
        eventBadge: marker.badge || (marker.hasMultiple ? '🥎' : '')
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
      
      // Fill empty slots for previous month
      for (let i = 0; i < firstDay; i++) {
        days.push({ day: '', fullDate: '', dateKey: `empty-${i}`, hasEvent: false });
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
          eventIcons: eventMarker.eventIcons,
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
        selectedDate: date
      }, () => {
        this.generateCalendar();
      });
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

    onCalendarTouchStart(e) {
      if (this.calendarSwipeAnimating) return;

      const touch = e.touches && e.touches[0];
      if (!touch) return;

      clearTimeout(this.calendarSwipeTimer);
      this.calendarTouchStartX = touch.clientX;
      this.calendarTouchStartY = touch.clientY;
      this.calendarTouchLastOffset = 0;
      this.calendarDidDrag = false;
      this.calendarSuppressTapUntil = 0;
      this._lastTouchMoveTime = 0;
      this.setData({ swipeTransition: 'none' });
    },

    onCalendarTouchMove(e) {
      if (this.calendarSwipeAnimating || this.data.showMonthPicker) return;

      const touch = e.touches && e.touches[0];
      if (!touch || this.calendarTouchStartX === null || this.calendarTouchStartY === null) return;

      const deltaX = touch.clientX - this.calendarTouchStartX;
      const deltaY = touch.clientY - this.calendarTouchStartY;
      const isHorizontalDrag = Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY);
      if (!isHorizontalDrag) return;

      // Throttle: restrict setData to at most once per 30ms to prevent lag
      const now = Date.now();
      if (this._lastTouchMoveTime && now - this._lastTouchMoveTime < 30) {
        return;
      }

      if (Math.abs(deltaX - this.calendarTouchLastOffset) < 3) return;

      this._lastTouchMoveTime = now;
      this.calendarTouchLastOffset = deltaX;
      this.calendarDidDrag = true;
      this.setData({ swipeOffset: `${deltaX}px`, swipeTransition: 'none' });
    },

    onCalendarTouchEnd(e) {
      const touch = e.changedTouches && e.changedTouches[0];
      if (
        !touch ||
        this.data.showMonthPicker ||
        this.calendarSwipeAnimating ||
        this.calendarTouchStartX === null ||
        this.calendarTouchStartY === null
      ) {
        this.resetCalendarTouch();
        return;
      }

      const deltaX = touch.clientX - this.calendarTouchStartX;
      const deltaY = touch.clientY - this.calendarTouchStartY;
      const isHorizontalSwipe = Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
      const didDrag = this.calendarDidDrag;

      this.resetCalendarTouch();
      if (didDrag) {
        this.calendarSuppressTapUntil = e.timeStamp + 120;
      }

      if (!isHorizontalSwipe) {
        this.resetSwipePosition(true);
        return;
      }

      if (deltaX < 0) {
        this.animateMonthChange(1);
      } else {
        this.animateMonthChange(-1);
      }
    },

    onCalendarTouchCancel() {
      this.resetCalendarTouch();
      this.resetSwipePosition(true);
    },

    resetCalendarTouch() {
      this.calendarTouchStartX = null;
      this.calendarTouchStartY = null;
      this.calendarTouchLastOffset = 0;
      this.calendarDidDrag = false;
    },

    resetSwipePosition(animated = false) {
      this.setData({
        swipeOffset: '0px',
        swipeTransition: animated ? 'transform 160ms ease-out' : 'none'
      });

      if (animated) {
        clearTimeout(this.calendarSwipeTimer);
        this.calendarSwipeTimer = setTimeout(() => {
          this.setData({ swipeTransition: 'none' });
        }, 160);
      }
    },

    animateMonthChange(offset) {
      this.calendarSwipeAnimating = true;
      this.setData({
        swipeOffset: offset > 0 ? '-33.3333%' : '33.3333%',
        swipeTransition: 'transform 180ms ease-out'
      });

      clearTimeout(this.calendarSwipeTimer);
      this.calendarSwipeTimer = setTimeout(() => {
        this.changeMonth(offset, { autoSelectDate: true, resetSwipe: true });
        this.calendarSwipeAnimating = false;
      }, 180);
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
        ...this.getCalendarState(currentYear, month)
      }, () => {
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

      if (options.resetSwipe) {
        nextData.swipeOffset = '0px';
        nextData.swipeTransition = 'none';
      }

      this.setData(nextData, () => {
        if (options.autoSelectDate) {
          this.triggerEvent('selectdate', { date: selectedDate });
        }
      });
    },

    prevMonth() {
      if (this.calendarSwipeAnimating) return;
      this.changeMonth(-1, { autoSelectDate: true });
    },

    nextMonth() {
      if (this.calendarSwipeAnimating) return;
      this.changeMonth(1, { autoSelectDate: true });
    },

    selectDay(e) {
      if (e.timeStamp <= this.calendarSuppressTapUntil) {
        return;
      }
      this.calendarSuppressTapUntil = 0;

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
