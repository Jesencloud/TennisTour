// pages/index/index.js
const { tennisEvents, eventsByDate } = require('../../data/tennis_events.js');
const { t } = require('../../utils/i18n.js');
const {
  getEventIcons,
  getLevelDisplay: getLevelLabel,
  getLevelMeta,
  getLevelPriority
} = require('../../utils/levels.js');

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

const DEFAULT_PROMPT = {
  visible: false,
  type: '',
  title: '',
  subtitle: '',
  eventName: '',
  eventNameSecondary: '',
  eventDates: '',
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

const CALENDAR_ALARM_OFFSET = 0;
const DISPLAY_LANGS = ['zh', 'en'];
const TOUR_DISPLAY_NAMES = {
  zh: {
    ATP: 'ATP 男子',
    WTA: 'WTA 女子',
    'Grand Slam': 'Grand Slam 大满贯',
    'ATP/WTA': 'ATP/WTA 联合赛'
  },
  en: {
    ATP: 'ATP Men',
    WTA: 'WTA Women',
    'Grand Slam': 'Grand Slam',
    'ATP/WTA': 'ATP/WTA'
  }
};
const TOUR_LEVEL_DISPLAY_NAMES = {
  zh: {
    ATP: '男子',
    WTA: '女子',
    'ATP/WTA': '联合'
  },
  en: {
    ATP: 'MEN',
    WTA: 'WOMEN',
    'ATP/WTA': 'MIXED'
  }
};

function createDefaultPrompt() {
  return Object.assign({}, DEFAULT_PROMPT);
}

function getText(lang) {
  return PAGE_TEXT_KEYS.reduce((text, key) => {
    text[key] = t(key, lang);
    return text;
  }, {});
}

function parseDateParts(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}



function getTourDisplayValue(event, lang = 'zh') {
  const names = TOUR_DISPLAY_NAMES[lang] || TOUR_DISPLAY_NAMES.zh;
  return names[event.tour] || event.tour;
}

function getLevelDisplayValue(event, lang = 'zh') {
  return getLevelLabel(event.level, lang);
}

function getTourLevelDisplayValue(event, lang = 'zh') {
  const level = getLevelDisplayValue(event, lang);
  const names = TOUR_LEVEL_DISPLAY_NAMES[lang] || TOUR_LEVEL_DISPLAY_NAMES.zh;
  const tour = names[event.tour];
  return tour ? `${tour} ${level}` : level;
}

function getSurfaceDisplayValue(event, lang = 'zh') {
  return lang === 'zh'
    ? event.surfaceCn || event.surface
    : event.surfaceEn || event.surface;
}

function getEventNameDisplayValue(event, lang = 'zh') {
  return lang === 'zh'
    ? event.eventNameCn || event.eventName
    : event.eventName;
}

function getEventNameSecondaryValue(event, lang = 'zh') {
  return lang === 'zh' && event.eventNameCn && event.eventNameCn !== event.eventName
    ? event.eventName
    : '';
}

function createDisplayEventsById(events) {
  return events.reduce((displayEventsById, event) => {
    const icons = getEventIcons(event);
    displayEventsById[event.id] = DISPLAY_LANGS.reduce((displayByLang, lang) => {
      displayByLang[lang] = {
        eventNameDisplay: getEventNameDisplayValue(event, lang),
        eventNameSecondary: getEventNameSecondaryValue(event, lang),
        tourDisplay: getTourDisplayValue(event, lang),
        levelDisplay: getLevelDisplayValue(event, lang),
        tourLevelDisplay: getTourLevelDisplayValue(event, lang),
        surfaceDisplay: getSurfaceDisplayValue(event, lang),
        icons
      };
      return displayByLang;
    }, {});
    return displayEventsById;
  }, {});
}

const displayEventsById = createDisplayEventsById(tennisEvents);

Page({
  todayDate: '',

  data: {
    selectedDate: '',
    selectedEvents: [],
    showTodayButton: false,
    lang: 'zh',
    text: getText('zh'),
    prompt: createDefaultPrompt()
  },

  onLoad(options) {
    let lang = this.data.lang;
    if (options && options.lang && (options.lang === 'zh' || options.lang === 'en')) {
      lang = options.lang;
    }

    const todayDate = this.getTodayDate();
    this.todayDate = todayDate;

    let selectedDate = todayDate;
    if (options && options.date && /^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
      selectedDate = options.date;
    }

    const selectedEvents = this.getDisplayEventsForDate(selectedDate, lang);

    this.setData({
      lang,
      text: getText(lang),
      selectedDate,
      showTodayButton: selectedDate !== todayDate,
      selectedEvents
    });

    this.updateNavigationTitle(lang);
  },

  onReady() {
    this.calendarCtx = this.selectComponent('#calendar');
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

  onShareAppMessage() {
    const { lang, selectedDate, selectedEvents } = this.data;
    let title = '';
    if (lang === 'zh') {
      if (selectedEvents && selectedEvents.length > 0) {
        const eventNames = selectedEvents.map(e => e.eventNameDisplay).slice(0, 2).join('、');
        title = `网球赛程日历 | ${selectedDate} 有 ${eventNames} 等赛事`;
      } else {
        title = '网球赛程日历 - 全球 ATP / WTA / 大满贯赛事日程指南';
      }
    } else {
      if (selectedEvents && selectedEvents.length > 0) {
        const eventNames = selectedEvents.map(e => e.eventNameDisplay).slice(0, 2).join(', ');
        title = `Tennis Calendar | ${eventNames} on ${selectedDate}`;
      } else {
        title = 'Tennis Calendar - ATP / WTA / Grand Slams Schedule Guide';
      }
    }
    return {
      title,
      path: `/pages/index/index?lang=${lang}&date=${selectedDate}`
    };
  },

  onShareTimeline() {
    const { lang, selectedDate, selectedEvents } = this.data;
    let title = '';
    if (lang === 'zh') {
      if (selectedEvents && selectedEvents.length > 0) {
        const eventNames = selectedEvents.map(e => e.eventNameDisplay).slice(0, 2).join('、');
        title = `网球赛程日历 | ${selectedDate} 有 ${eventNames} 等赛事`;
      } else {
        title = '网球赛程日历 - 全球 ATP / WTA / 大满贯赛事日程指南';
      }
    } else {
      if (selectedEvents && selectedEvents.length > 0) {
        const eventNames = selectedEvents.map(e => e.eventNameDisplay).slice(0, 2).join(', ');
        title = `Tennis Calendar | ${eventNames} on ${selectedDate}`;
      } else {
        title = 'Tennis Calendar - ATP / WTA / Grand Slams Schedule Guide';
      }
    }
    return {
      title,
      query: `lang=${lang}&date=${selectedDate}`
    };
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

  getEventsForDate(date) {
    return eventsByDate[date] || [];
  },

  getDisplayEventsForDate(date, lang = this.data.lang) {
    return this.getEventsForDate(date).map(event => (
      Object.assign(
        {},
        event,
        displayEventsById[event.id][lang] || displayEventsById[event.id].zh
      )
    ));
  },

  onDateSelect(e) {
    const { date } = e.detail;
    this.selectDate(date);
  },

  goToday() {
    const todayDate = this.getTodayDate();
    const calendar = this.calendarCtx;
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

  getCalendarTimestamp(date) {
    const parts = parseDateParts(date);
    if (!parts) return null;
    const calendarDate = new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0);
    return Math.floor(calendarDate.getTime() / 1000);
  },

  getCalendarAllDayEndTimestamp(date) {
    const parts = parseDateParts(date);
    if (!parts) return null;
    const nextDay = new Date(parts.year, parts.month - 1, parts.day + 1, 0, 0, 0);
    return Math.floor(nextDay.getTime() / 1000);
  },

  getEventLocation(event) {
    if (this.data.lang === 'zh') {
      return `${event.cityCn}，${event.countryCn}`;
    }

    return `${event.city}, ${event.country}`;
  },

  getFlaggedEventLocation(event) {
    return `${this.getEventLocation(event)} ${event.flag}`;
  },

  getCalendarDescription(event) {
    const lang = this.data.lang;
    return [
      `${t('labelEventDates', lang)}: ${this.formatEventDates(event)}`,
      `${t('labelTour', lang)}: ${getTourDisplayValue(event, lang)}`,
      `${t('labelLevel', lang)}: ${getLevelDisplayValue(event, lang)}`,
      `${t('labelSurface', lang)}: ${getSurfaceDisplayValue(event, lang)}`,
      `${t('labelLocation', lang)}: ${this.getFlaggedEventLocation(event)}`
    ].join('\n');
  },

  onEventLongPress() {
    // Empty handler to natively suppress tap event on long press
  },

  onEventTap(e) {
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
      eventName: getEventNameDisplayValue(event, lang),
      eventNameSecondary: getEventNameSecondaryValue(event, lang),
      eventDates: this.formatEventDates(event),
      tour: getTourDisplayValue(event, lang),
      level: getLevelDisplayValue(event, lang),
      surface: getSurfaceDisplayValue(event, lang),
      location: this.getFlaggedEventLocation(event),
      confirmText: t('add', lang),
      cancelText: t('cancel', lang),
      showCancel: true,
      eventId: event.id
    });
  },

  addEventToPhoneCalendar(event) {
    const lang = this.data.lang;
    const startTime = this.getCalendarTimestamp(event.startDate);
    const endTime = this.getCalendarAllDayEndTimestamp(event.endDate);

    if (!startTime || !endTime || endTime < startTime) {
      wx.showToast({
        title: t('invalidDate', lang),
        icon: 'none'
      });
      return;
    }

    wx.addPhoneCalendar({
      title: getEventNameDisplayValue(event, lang),
      startTime,
      endTime,
      allDay: true,
      location: this.getEventLocation(event),
      description: this.getCalendarDescription(event),
      alarmOffset: CALENDAR_ALARM_OFFSET,
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

  openPrompt(prompt) {
    this.setData({
      prompt: Object.assign(createDefaultPrompt(), prompt, { visible: true })
    });
  },

  closePrompt() {
    this.setData({
      prompt: createDefaultPrompt()
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
      showTodayButton: date !== todayDate,
      selectedEvents: this.getDisplayEventsForDate(date)
    });
  }
});
