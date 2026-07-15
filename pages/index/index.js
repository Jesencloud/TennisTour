// pages/index/index.js
const { tennisEvents, eventsByDate, eventsById } = require('../../data/tennis_events.js');
const { t } = require('../../utils/i18n.js');
const {
  parseDateParts,
  formatLocalDate,
  getLocalMidnightTimestamp,
  getLocalAllDayEndTimestamp
} = require('../../utils/date.js');
const {
  getEventIcons,
  getLevelDisplay: getLevelLabel
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
const LANG_STORAGE_KEY = 'tennisTourLang';
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

function getLocationDisplayValue(event, lang = 'zh') {
  return lang === 'zh'
    ? `${event.cityCn}，${event.countryCn}`
    : `${event.city}, ${event.country}`;
}

function getFlaggedLocationDisplayValue(event, lang = 'zh') {
  return `${getLocationDisplayValue(event, lang)} ${event.flag}`;
}

function isValidLang(lang) {
  return lang === 'zh' || lang === 'en';
}

function loadStoredLang() {
  try {
    const lang = wx.getStorageSync(LANG_STORAGE_KEY);
    return isValidLang(lang) ? lang : null;
  } catch (e) {
    return null;
  }
}

function saveStoredLang(lang) {
  if (!isValidLang(lang)) return;
  try {
    wx.setStorageSync(LANG_STORAGE_KEY, lang);
  } catch (e) {}
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
        locationDisplay: getLocationDisplayValue(event, lang),
        locationFlaggedDisplay: getFlaggedLocationDisplayValue(event, lang),
        icons
      };
      return displayByLang;
    }, {});
    return displayEventsById;
  }, {});
}

const displayEventsById = createDisplayEventsById(tennisEvents);

function getEventDisplay(eventId, lang = 'zh') {
  const displayByLang = displayEventsById[eventId];
  if (!displayByLang) return null;
  return displayByLang[lang] || displayByLang.zh || null;
}

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
    // Priority: URL param (share link) > stored preference > default zh
    let lang = loadStoredLang() || this.data.lang;
    if (options && isValidLang(options.lang)) {
      lang = options.lang;
    }

    const todayDate = this.getTodayDate();
    this.todayDate = todayDate;

    let selectedDate = todayDate;
    if (options && parseDateParts(options.date)) {
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

  getShareTitle() {
    const { lang, selectedDate, selectedEvents } = this.data;
    const hasEvents = selectedEvents && selectedEvents.length > 0;

    if (lang === 'zh') {
      if (hasEvents) {
        const eventNames = selectedEvents.map(e => e.eventNameDisplay).slice(0, 2).join('、');
        return `网球赛程日历 | ${selectedDate} 有 ${eventNames} 等赛事`;
      }
      return '网球赛程日历 - 全球 ATP / WTA / 大满贯赛事日程指南';
    }

    if (hasEvents) {
      const eventNames = selectedEvents.map(e => e.eventNameDisplay).slice(0, 2).join(', ');
      return `Tennis Calendar | ${eventNames} on ${selectedDate}`;
    }
    return 'Tennis Calendar - ATP / WTA / Grand Slams Schedule Guide';
  },

  onShareAppMessage() {
    const { lang, selectedDate } = this.data;
    return {
      title: this.getShareTitle(),
      path: `/pages/index/index?lang=${lang}&date=${selectedDate}`
    };
  },

  onShareTimeline() {
    const { lang, selectedDate } = this.data;
    return {
      title: this.getShareTitle(),
      query: `lang=${lang}&date=${selectedDate}`
    };
  },

  toggleLang() {
    const nextLang = this.data.lang === 'zh' ? 'en' : 'zh';
    wx.vibrateShort({ type: 'light', fail: () => {} });
    saveStoredLang(nextLang);
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
    return formatLocalDate(new Date());
  },

  getEventsForDate(date) {
    return eventsByDate[date] || [];
  },

  getDisplayEventsForDate(date, lang = this.data.lang) {
    return this.getEventsForDate(date).map(event => (
      Object.assign({}, event, getEventDisplay(event.id, lang) || {})
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
    return eventsById[id] || null;
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
    return getLocalMidnightTimestamp(date);
  },

  getCalendarAllDayEndTimestamp(date) {
    return getLocalAllDayEndTimestamp(date);
  },

  getCalendarDescription(event, display, lang) {
    return [
      `${t('labelEventDates', lang)}: ${this.formatEventDates(event)}`,
      `${t('labelTour', lang)}: ${display.tourDisplay}`,
      `${t('labelLevel', lang)}: ${display.levelDisplay}`,
      `${t('labelSurface', lang)}: ${display.surfaceDisplay}`,
      `${t('labelLocation', lang)}: ${display.locationFlaggedDisplay}`
    ].join('\n');
  },

  // Suppresses the subsequent tap after a long-press on an event row.
  onEventLongPress() {},

  onEventTap(e) {
    const id = e.currentTarget.dataset.id;
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

    const display = getEventDisplay(event.id, lang);
    if (!display) return;

    this.openPrompt({
      type: 'calendar',
      title: t('addCalendar', lang),
      subtitle: t('calendarDisclaimer', lang),
      eventName: display.eventNameDisplay,
      eventNameSecondary: display.eventNameSecondary,
      eventDates: this.formatEventDates(event),
      tour: display.tourDisplay,
      level: display.levelDisplay,
      surface: display.surfaceDisplay,
      location: display.locationFlaggedDisplay,
      confirmText: t('add', lang),
      cancelText: t('cancel', lang),
      showCancel: true,
      eventId: event.id
    });
  },

  addEventToPhoneCalendar(event) {
    if (this.addingToCalendar) return;
    this.addingToCalendar = true;
    const lang = this.data.lang;
    const display = getEventDisplay(event.id, lang);
    const startTime = this.getCalendarTimestamp(event.startDate);
    const endTime = this.getCalendarAllDayEndTimestamp(event.endDate);

    if (!display || !startTime || !endTime || endTime < startTime) {
      wx.showToast({
        title: t('invalidDate', lang),
        icon: 'none'
      });
      this.addingToCalendar = false;
      return;
    }

    wx.addPhoneCalendar({
      title: display.eventNameDisplay,
      startTime,
      endTime,
      allDay: true,
      location: display.locationDisplay,
      description: this.getCalendarDescription(event, display, lang),
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
      },
      complete: () => {
        this.addingToCalendar = false;
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
