/**
 * i18n utility for the tennis calendar.
 */

const translations = {
  zh: {
    title: '网球赛程',
    subtitle: 'ATP / WTA / 大满贯 2026🎾️',
    navTitle: '网球赛程日历',
    today: '今天',
    events: '赛程',
    noEvents: '这一天没有 ATP、WTA 或大满贯正赛赛程。',
    langToggle: 'EN',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    notSupported: '暂不支持',
    phoneCalendar: '系统日历',
    notSupportedMsg: '当前微信版本或设备不支持添加到系统日历。',
    addCalendar: '添加到系统日历',
    calendarDisclaimer: '注意：赛程可能调整，请以赛事官方信息为准',
    add: '添加',
    ok: '知道了',
    cancel: '取消',
    added: '已添加',
    canceled: '已取消',
    failed: '添加失败',
    invalidDate: '日期无效',
    labelEventDates: '比赛日期',
    labelTour: '巡回赛',
    labelLevel: '赛事级别',
    labelSurface: '场地类型',
    labelLocation: '举办地点'
  },
  en: {
    title: 'Tennis Calendar',
    subtitle: 'ATP / WTA / Grand Slams 2026🎾️',
    navTitle: 'Tennis Calendar',
    today: 'Today',
    events: 'Events',
    noEvents: 'No ATP, WTA, or Grand Slam main-tour events on this day.',
    langToggle: '中',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    notSupported: 'Not Supported',
    phoneCalendar: 'Phone calendar',
    notSupportedMsg: 'This WeChat version or device does not support adding to the phone calendar.',
    addCalendar: 'Add to Phone Calendar',
    calendarDisclaimer: 'Note: schedules can change; confirm with official tournament sources.',
    add: 'Add',
    ok: 'OK',
    cancel: 'Cancel',
    added: 'Added',
    canceled: 'Canceled',
    failed: 'Failed',
    invalidDate: 'Invalid date',
    labelEventDates: 'Tournament Dates',
    labelTour: 'Tour',
    labelLevel: 'Level',
    labelSurface: 'Surface',
    labelLocation: 'Location'
  }
};

function t(key, lang = 'zh') {
  const dict = translations[lang] || translations.zh;
  if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
  if (Object.prototype.hasOwnProperty.call(translations.zh, key)) return translations.zh[key];
  return key;
}

module.exports = {
  translations,
  t
};
