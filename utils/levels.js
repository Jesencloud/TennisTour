const LEVEL_DEFINITIONS = [
  {
    key: 'grandSlam',
    aliases: ['Grand Slam', '大满贯', '🏆️', '🏆'],
    priority: 1,
    display: {
      zh: '大满贯',
      en: 'Grand Slam'
    },
    icons: {
      ATP: '/assets/icons/atp-grandslam.svg',
      WTA: '/assets/icons/wta-grandslam.svg'
    }
  },
  {
    key: 'finals',
    aliases: ['ATP Finals', 'Finals', '年终总决赛'],
    priority: 2,
    display: {
      zh: '年终总决赛',
      en: 'Finals'
    },
    icons: {
      ATP: '/assets/icons/atp-finals.svg',
      WTA: '/assets/icons/wta-finals.svg'
    }
  },
  {
    key: 'mixed',
    aliases: ['Mixed'],
    priority: 3,
    display: {
      zh: '混合',
      en: 'Mixed'
    },
    icons: {}
  },
  {
    key: 'laverCup',
    aliases: ['Laver Cup', 'Laver'],
    priority: 4,
    display: {
      zh: 'Laver Cup',
      en: 'Laver Cup'
    },
    icons: {
      ATP: '/assets/icons/atp-lvr.svg'
    }
  },
  {
    key: 'davisCup',
    aliases: ['Davis Cup', 'ITF', 'Davis'],
    priority: 5,
    display: {
      zh: 'Davis Cup',
      en: 'Davis Cup'
    },
    icons: {
      ATP: '/assets/icons/atp-ITF.svg'
    }
  },
  {
    key: '1000',
    aliases: ['1000', 'Masters 1000'],
    priority: 6,
    display: {
      zh: '1000',
      en: '1000'
    },
    icons: {
      ATP: '/assets/icons/atp-1000.svg',
      WTA: '/assets/icons/wta-1000.svg'
    }
  },
  {
    key: '500',
    aliases: ['500'],
    priority: 7,
    display: {
      zh: '500',
      en: '500'
    },
    icons: {
      ATP: '/assets/icons/atp-500.svg',
      WTA: '/assets/icons/wta-500.svg'
    }
  },
  {
    key: '250',
    aliases: ['250'],
    priority: 8,
    display: {
      zh: '250',
      en: '250'
    },
    icons: {
      ATP: '/assets/icons/atp-250.svg',
      WTA: '/assets/icons/wta-250.svg'
    }
  }
];

const levelMetaMap = {};
const levelOrder = {};

LEVEL_DEFINITIONS.forEach(meta => {
  meta.aliases.forEach(alias => {
    levelMetaMap[alias] = meta;
    levelOrder[alias] = meta.priority;
  });
});

function getLevelMeta(level) {
  return levelMetaMap[level] || null;
}

function getLevelDisplay(level, lang = 'zh') {
  const meta = getLevelMeta(level);
  if (!meta) return level;
  return meta.display[lang] || meta.display.zh || level;
}

function getLevelPriority(level, fallback = 99) {
  const meta = getLevelMeta(level);
  return meta ? meta.priority : fallback;
}

function getEventIcons(event) {
  if (event.eventName === 'United Cup') {
    return ['/assets/icons/unitedcup.svg'];
  }
  const meta = getLevelMeta(event.level);
  if (!meta) return [];

  if (event.tour === 'Grand Slam' && meta.key === 'grandSlam') {
    return [meta.icons.ATP, meta.icons.WTA].filter(Boolean);
  }

  return [meta.icons[event.tour]].filter(Boolean);
}

module.exports = {
  LEVEL_DEFINITIONS,
  levelOrder,
  getLevelDisplay,
  getLevelMeta,
  getLevelPriority,
  getEventIcons
};
