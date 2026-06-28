// pages/index/index.js
const { tennisEvents, levelOrder } = require('../../data/tennis_events.js');
const { t } = require('../../utils/i18n.js');

const ATP_LEVEL_ICONS = {
  'Masters 1000': '/assets/icons/categorystamps_1000.png',
  '500': '/assets/icons/categorystamps_500.png',
  '250': '/assets/icons/categorystamps_250.png'
};

const WTA_LEVEL_ICONS = {
  '1000': '/assets/icons/1000k-tag.svg',
  '500': '/assets/icons/500k-tag.svg',
  '250': '/assets/icons/250k-tag.svg'
};

function getEventIcon(event) {
  if (event.tour === 'Grand Slam') return '/assets/icons/categorystamps_grandslam.png';
  if (event.level === '年终总决赛') return '/assets/icons/finals-tag.svg';
  if (event.tour === 'ATP') return ATP_LEVEL_ICONS[event.level] || '';
  if (event.tour === 'WTA') return WTA_LEVEL_ICONS[event.level] || '';
  return '';
}

const PAGE_TEXT_KEYS = [
  'title',
  'subtitle',
  'today',
  'events',
  'noEvents',
  'langToggle',
  'labelEventDates',
  'labelTour',
  'labelLevel',
  'labelSurface',
  'labelLocation'
];

function getText(lang) {
  return PAGE_TEXT_KEYS.reduce((text, key) => {
    text[key] = t(key, lang);
    return text;
  }, {});
}

function parseDateValue(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateValue(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getEventDateRange(event) {
  const startDate = parseDateValue(event.startDate);
  const endDate = parseDateValue(event.endDate || event.startDate);
  if (!startDate || !endDate) return [];

  const dates = [];
  for (let d = startDate.getTime(); d <= endDate.getTime(); d += 86400000) {
    dates.push({
      date: formatDateValue(new Date(d))
    });
  }
  return dates;
}

function createEventDates(events) {
  const eventDateMap = {};
  events.forEach(event => {
    getEventDateRange(event).forEach(obj => {
      const marker = {
        icon: getEventIcon(event),
        priority: levelOrder[event.level] || 99
      };
      const existingMarker = eventDateMap[obj.date];
      if (!existingMarker) {
        eventDateMap[obj.date] = marker;
        return;
      }

      if (marker.priority < existingMarker.priority) {
        eventDateMap[obj.date] = marker;
      }
    });
  });
  return eventDateMap;
}

const eventDates = createEventDates(tennisEvents);

Page({
  touchStartTime: 0,
  touchEndTime: 0,
  todayDate: '',

  data: {
    eventDates: [],
    selectedDate: '',
    selectedEvents: [],
    showTodayButton: false,
    lang: 'zh',
    text: getText('zh'),
    prompt: {
      visible: false,
      type: '',
      title: '',
      subtitle: '',
      eventName: '',
      eventDates: '',
      flag: '',
      tour: '',
      level: '',
      surface: '',
      location: '',
      message: '',
      confirmText: '',
      cancelText: '',
      showCancel: true,
      eventId: null
    }
  },

  onLoad() {
    const todayDate = this.getTodayDate();
    this.todayDate = todayDate;
    const selectedEvents = this.getDisplayEventsForDate(todayDate);

    this.setData({
      eventDates,
      selectedDate: todayDate,
      showTodayButton: false,
      selectedEvents
    });

    this.updateNavigationTitle(this.data.lang);
  },

  onShow() {
    const todayDate = this.getTodayDate();
    if (todayDate !== this.todayDate) {
      this.todayDate = todayDate;
      this.setData({
        showTodayButton: this.data.selectedDate !== todayDate
      });
    }
  },

  toggleLang() {
    const nextLang = this.data.lang === 'zh' ? 'en' : 'zh';
    wx.vibrateShort({ type: 'light', fail: () => {} });
    this.setData({
      lang: nextLang,
      text: getText(nextLang),
      selectedEvents: this.getDisplayEventsForDate(this.data.selectedDate, nextLang)
    });
    this.updateNavigationTitle(nextLang);
  },

  updateNavigationTitle(lang) {
    wx.setNavigationBarTitle({
      title: t('navTitle', lang)
    });
  },

  getTodayDate() {
    return this.formatDate(new Date());
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  isDateInEventRange(date, event) {
    return date >= event.startDate && date <= event.endDate;
  },

  getEventsForDate(date) {
    return tennisEvents.filter(event => this.isDateInEventRange(date, event));
  },

  getDisplayEventsForDate(date, lang = this.data.lang) {
    return this.getEventsForDate(date).map(event => Object.assign({}, event, {
      tourDisplay: this.getTourDisplay(event, lang),
      levelDisplay: this.getLevelDisplay(event, lang),
      surfaceDisplay: this.getSurfaceDisplay(event, lang)
    }));
  },

  onDateSelect(e) {
    const { date } = e.detail;
    this.selectDate(date);
  },

  goToday() {
    const todayDate = this.getTodayDate();
    const calendar = this.selectComponent('#calendar');
    if (calendar && calendar.goToDate) {
      wx.vibrateShort({ type: 'light', fail: () => {} });
      calendar.goToDate(todayDate);
    }

    this.selectDate(todayDate, todayDate);
  },

  getEventById(id) {
    return tennisEvents.find(event => event.id === id);
  },

  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    if (!dateStr.includes(' - ')) return dateStr.replace(/-/g, '.');

    const [start, end] = dateStr.split(' - ');
    const dottedStart = start.replace(/-/g, '.');
    const dottedEnd = end.replace(/-/g, '.');

    return dottedStart.substring(0, 4) === dottedEnd.substring(0, 4)
      ? `${dottedStart} - ${dottedEnd.substring(5)}`
      : `${dottedStart} - ${dottedEnd}`;
  },

  formatEventDates(event) {
    const rawDates = event.eventDates || `${event.startDate} - ${event.endDate}`;
    return this.formatDisplayDate(rawDates);
  },

  getCalendarEventRange(event) {
    return {
      startDate: event.startDate,
      endDate: event.endDate
    };
  },

  getCalendarAlarmOffset() {
    return 0;
  },

  getCalendarTimestamp(date, endOfDay = false) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const [year, month, day] = date.split('-').map(Number);
    const calendarDate = endOfDay
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day, 0, 0, 0);

    return Math.floor(calendarDate.getTime() / 1000);
  },

  getCalendarAllDayEndTimestamp(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const [year, month, day] = date.split('-').map(Number);
    const nextDay = new Date(year, month - 1, day + 1, 0, 0, 0);
    return Math.floor(nextDay.getTime() / 1000);
  },

  getEventLocation(event) {
    if (this.data.lang === 'zh') {
      return `${event.cityCn}，${event.countryCn}`;
    }

    return `${event.city}, ${event.country}`;
  },

  getFlaggedEventLocation(event) {
    return `${event.flag} ${this.getEventLocation(event)}`;
  },

  getTourDisplay(event, lang = this.data.lang) {
    const tourNames = {
      zh: {
        ATP: 'ATP 男子',
        WTA: 'WTA 女子',
        'Grand Slam': 'Grand Slam 大满贯'
      },
      en: {
        ATP: 'ATP Men',
        WTA: 'WTA Women',
        'Grand Slam': 'Grand Slam'
      }
    };
    const names = tourNames[lang] || tourNames.zh;
    return names[event.tour] || event.tour;
  },

  getLevelDisplay(event, lang = this.data.lang) {
    const levelNames = {
      zh: {
        '大满贯': '大满贯',
        '年终总决赛': '年终总决赛',
        'Masters 1000': 'Masters 1000',
        '1000': '1000',
        '500': '500',
        '250': '250'
      },
      en: {
        '大满贯': 'Grand Slam',
        '年终总决赛': 'Finals',
        'Masters 1000': 'Masters 1000',
        '1000': '1000',
        '500': '500',
        '250': '250'
      }
    };
    const names = levelNames[lang] || levelNames.zh;
    return names[event.level] || event.level;
  },

  getSurfaceDisplay(event, lang = this.data.lang) {
    return lang === 'zh'
      ? event.surfaceCn || event.surface
      : event.surfaceEn || event.surface;
  },

  getCalendarDescription(event) {
    const lang = this.data.lang;
    return [
      `${t('labelEventDates', lang)}: ${this.formatEventDates(event)}`,
      `${t('labelTour', lang)}: ${this.getTourDisplay(event)}`,
      `${t('labelLevel', lang)}: ${this.getLevelDisplay(event)}`,
      `${t('labelSurface', lang)}: ${this.getSurfaceDisplay(event)}`,
      `${t('labelLocation', lang)}: ${this.getFlaggedEventLocation(event)}`
    ].join('\n');
  },

  onEventTouchStart(e) {
    this.touchStartTime = e.timeStamp;
  },

  onEventTouchEnd(e) {
    this.touchEndTime = e.timeStamp;
  },

  onEventTouchCancel() {
    this.touchStartTime = 0;
    this.touchEndTime = 0;
  },

  onEventTap(e) {
    const touchDuration = this.touchStartTime && this.touchEndTime
      ? this.touchEndTime - this.touchStartTime
      : 0;
    if (touchDuration > 350) {
      this.touchStartTime = 0;
      this.touchEndTime = 0;
      return;
    }

    this.touchStartTime = 0;
    this.touchEndTime = 0;

    const id = Number(e.currentTarget.dataset.id);
    const event = this.getEventById(id);
    if (!event) return;

    const lang = this.data.lang;
    if (typeof wx.addPhoneCalendar !== 'function') {
      this.openPrompt({
        type: 'calendar',
        title: t('notSupported', lang),
        subtitle: t('phoneCalendar', lang),
        message: t('notSupportedMsg', lang),
        confirmText: t('ok', lang),
        showCancel: false
      });
      return;
    }

    this.openPrompt({
      type: 'calendar',
      title: t('addCalendar', lang),
      subtitle: t('calendarDisclaimer', lang),
      eventName: event.eventName,
      eventDates: this.formatEventDates(event),
      flag: event.flag,
      tour: this.getTourDisplay(event),
      level: this.getLevelDisplay(event),
      surface: this.getSurfaceDisplay(event),
      location: this.getFlaggedEventLocation(event),
      confirmText: t('add', lang),
      cancelText: t('cancel', lang),
      showCancel: true,
      eventId: event.id
    });
  },

  addEventToPhoneCalendar(event) {
    const lang = this.data.lang;
    const { startDate, endDate } = this.getCalendarEventRange(event);
    const startTime = this.getCalendarTimestamp(startDate);
    const endTime = this.getCalendarAllDayEndTimestamp(endDate);
    const alarmOffset = this.getCalendarAlarmOffset(startDate);

    if (!startTime || !endTime || endTime < startTime) {
      wx.showToast({
        title: t('invalidDate', lang),
        icon: 'none'
      });
      return;
    }

    wx.addPhoneCalendar({
      title: event.eventName,
      startTime,
      endTime,
      allDay: true,
      location: this.getEventLocation(event),
      description: this.getCalendarDescription(event),
      alarmOffset,
      success: () => {
        wx.vibrateShort({ type: 'medium', fail: () => {} });
        wx.showToast({
          title: t('added', lang),
          icon: 'success'
        });
      },
      fail: (err) => {
        const message = err && err.errMsg ? err.errMsg : '';
        const isCancel = message.includes('cancel');
        wx.showToast({
          title: t(isCancel ? 'canceled' : 'failed', lang),
          icon: 'none'
        });
      }
    });
  },

  getDefaultPrompt() {
    return {
      visible: false,
      type: '',
      title: '',
      subtitle: '',
      eventName: '',
      eventDates: '',
      flag: '',
      tour: '',
      level: '',
      surface: '',
      location: '',
      message: '',
      confirmText: '',
      cancelText: '',
      showCancel: true,
      eventId: null
    };
  },

  openPrompt(prompt) {
    const defaultPrompt = this.getDefaultPrompt();
    this.setData({
      prompt: Object.assign({}, defaultPrompt, prompt, { visible: true })
    });
  },

  closePrompt() {
    this.setData({
      prompt: this.getDefaultPrompt()
    });
  },

  stopPromptTap() {},

  confirmPrompt() {
    const { prompt } = this.data;
    this.closePrompt();

    if (prompt.type === 'calendar' && prompt.eventId !== null) {
      const event = this.getEventById(prompt.eventId);
      if (event) this.addEventToPhoneCalendar(event);
    }
  },

  selectDate(date, todayDate = this.todayDate || this.getTodayDate()) {
    this.todayDate = todayDate;
    this.setData({
      selectedDate: date,
      showTodayButton: date !== todayDate
    });
    this.filterEvents(date);
  },

  filterEvents(date) {
    this.setData({ selectedEvents: this.getDisplayEventsForDate(date) });
  }
});
