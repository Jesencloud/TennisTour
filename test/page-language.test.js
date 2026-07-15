const test = require('node:test');
const assert = require('node:assert/strict');

let storedLang = null;
const storageWrites = [];
global.wx = {
  getStorageSync() {
    return storedLang;
  },
  setStorageSync(key, value) {
    storageWrites.push({ key, value });
  },
  vibrateShort() {},
  setNavigationBarTitle() {}
};

let pageDefinition;
const originalPage = global.Page;
try {
  global.Page = definition => {
    pageDefinition = definition;
  };
  require('../pages/index/index.js');
} finally {
  global.Page = originalPage;
}

function createPage() {
  const page = Object.assign({}, pageDefinition);
  page.data = JSON.parse(JSON.stringify(pageDefinition.data));
  page.setData = function(update, callback) {
    Object.assign(this.data, update);
    if (callback) callback();
  };
  return page;
}

test('stored language is used when a share parameter is absent', () => {
  storedLang = 'en';
  storageWrites.length = 0;
  const page = createPage();

  page.onLoad({});

  assert.equal(page.data.lang, 'en');
  assert.deepEqual(storageWrites, []);
});

test('share language affects the session without replacing preference', () => {
  storedLang = 'zh';
  storageWrites.length = 0;
  const page = createPage();

  page.onLoad({ lang: 'en' });

  assert.equal(page.data.lang, 'en');
  assert.deepEqual(storageWrites, []);
});

test('manual language toggle persists the new preference', () => {
  storedLang = 'zh';
  storageWrites.length = 0;
  const page = createPage();
  page.onLoad({});

  page.toggleLang();

  assert.equal(page.data.lang, 'en');
  assert.deepEqual(storageWrites, [{ key: 'tennisTourLang', value: 'en' }]);
});

test('invalid shared date falls back to today', () => {
  storedLang = 'zh';
  storageWrites.length = 0;
  const page = createPage();

  page.onLoad({ date: '2026-02-31' });

  assert.equal(page.data.selectedDate, page.todayDate);
});
