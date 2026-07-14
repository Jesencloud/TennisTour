const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  getLevelMeta,
  getLevelDisplay,
  getLevelPriority,
  getEventIcons
} = require('../utils/levels.js');

describe('getLevelMeta / display / priority', () => {
  it('resolves aliases', () => {
    assert.equal(getLevelMeta('Grand Slam').key, 'grandSlam');
    assert.equal(getLevelMeta('大满贯').key, 'grandSlam');
    assert.equal(getLevelMeta('1000').key, '1000');
    assert.equal(getLevelMeta('Masters 1000').key, '1000');
  });

  it('returns localized display labels', () => {
    assert.equal(getLevelDisplay('Grand Slam', 'zh'), '大满贯');
    assert.equal(getLevelDisplay('Grand Slam', 'en'), 'Grand Slam');
    assert.equal(getLevelDisplay('Unknown Level', 'zh'), 'Unknown Level');
  });

  it('orders higher-level events first', () => {
    assert.ok(getLevelPriority('Grand Slam') < getLevelPriority('1000'));
    assert.ok(getLevelPriority('1000') < getLevelPriority('500'));
    assert.ok(getLevelPriority('500') < getLevelPriority('250'));
  });
});

describe('getEventIcons', () => {
  it('returns dual icons for Grand Slam tour', () => {
    const icons = getEventIcons({
      tour: 'Grand Slam',
      level: 'Grand Slam',
      eventName: 'Australian Open'
    });
    assert.equal(icons.length, 2);
    assert.ok(icons[0].includes('grandslam'));
    assert.ok(icons[1].includes('grandslam'));
  });

  it('returns United Cup icon by name', () => {
    const icons = getEventIcons({
      tour: 'ATP/WTA',
      level: '500',
      eventName: 'United Cup'
    });
    assert.deepEqual(icons, ['/assets/icons/unitedcup.svg']);
  });

  it('returns ATP 1000 icon', () => {
    const icons = getEventIcons({
      tour: 'ATP',
      level: '1000',
      eventName: 'BNP Paribas Open'
    });
    assert.deepEqual(icons, ['/assets/icons/atp-1000.svg']);
  });
});
