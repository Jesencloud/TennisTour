// 2026 tour-level tennis calendar for ATP, WTA, and Grand Slam events.
// WTA dates are based on the public WTA tournaments API. ATP dates are based on
// the published 2026 ATP Tour calendar; placeholder/TBD events are intentionally
// excluded until city and tournament names are announced.

const { getLevelPriority, levelOrder } = require('../utils/levels.js');

const countryCnMap = {
  Argentina: '阿根廷',
  Australia: '澳大利亚',
  Austria: '奥地利',
  Belgium: '比利时',
  Brazil: '巴西',
  Canada: '加拿大',
  Chile: '智利',
  China: '中国',
  Colombia: '哥伦比亚',
  Croatia: '克罗地亚',
  'Czech Republic': '捷克',
  France: '法国',
  Germany: '德国',
  Greece: '希腊',
  India: '印度',
  Italy: '意大利',
  Japan: '日本',
  Kazakhstan: '哈萨克斯坦',
  Mexico: '墨西哥',
  Monaco: '摩纳哥',
  Morocco: '摩洛哥',
  Netherlands: '荷兰',
  'New Zealand': '新西兰',
  Portugal: '葡萄牙',
  Qatar: '卡塔尔',
  Romania: '罗马尼亚',
  'Saudi Arabia': '沙特阿拉伯',
  Singapore: '新加坡',
  'South Korea': '韩国',
  Spain: '西班牙',
  Sweden: '瑞典',
  Switzerland: '瑞士',
  'United Arab Emirates': '阿联酋',
  'United Kingdom': '英国',
  'United States': '美国'
};

const cityCnMap = {
  '\'s-Hertogenbosch': '斯海尔托亨博斯',
  'Abu Dhabi': '阿布扎比',
  Acapulco: '阿卡普尔科',
  Adelaide: '阿德莱德',
  Almaty: '阿拉木图',
  Athens: '雅典',
  Auckland: '奥克兰',
  Austin: '奥斯汀',
  'Bad Homburg': '巴特洪堡',
  Barcelona: '巴塞罗那',
  Basel: '巴塞尔',
  Bastad: '巴斯塔德',
  Beijing: '北京',
  Berlin: '柏林',
  Bogota: '波哥大',
  Bologna: '博洛尼亚',
  Brisbane: '布里斯班',
  Brussels: '布鲁塞尔',
  Bucharest: '布加勒斯特',
  'Buenos Aires': '布宜诺斯艾利斯',
  Charleston: '查尔斯顿',
  Chengdu: '成都',
  Chennai: '钦奈',
  Cincinnati: '辛辛那提',
  'Cluj-Napoca': '克卢日-纳波卡',
  Dallas: '达拉斯',
  'Delray Beach': '德尔雷比奇',
  Doha: '多哈',
  Dubai: '迪拜',
  Eastbourne: '伊斯特本',
  Estoril: '埃斯托里尔',
  Geneva: '日内瓦',
  Gstaad: '格施塔德',
  Guadalajara: '瓜达拉哈拉',
  Guangzhou: '广州',
  Halle: '哈雷',
  Hamburg: '汉堡',
  Hangzhou: '杭州',
  Hobart: '霍巴特',
  'Hong Kong': '香港',
  Houston: '休斯敦',
  Iasi: '雅西',
  'Indian Wells': '印第安维尔斯',
  Jeddah: '吉达',
  Kitzbuhel: '基茨比厄尔',
  Linz: '林茨',
  London: '伦敦',
  'Los Cabos': '洛斯卡沃斯',
  Lyon: '里昂',
  Madrid: '马德里',
  Mallorca: '马略卡',
  Marrakech: '马拉喀什',
  Marseille: '马赛',
  Melbourne: '墨尔本',
  Memphis: '孟菲斯',
  Merida: '梅里达',
  Miami: '迈阿密',
  'Monte-Carlo': '蒙特卡洛',
  Monterrey: '蒙特雷',
  Montpellier: '蒙彼利埃',
  Montreal: '蒙特利尔',
  Munich: '慕尼黑',
  'Multiple Locations': '多地',
  'New York': '纽约',
  Ningbo: '宁波',
  Nottingham: '诺丁汉',
  Osaka: '大阪',
  Ostrava: '俄斯特拉发',
  Paris: '巴黎',
  Perth: '珀斯',
  'Perth + Sydney': '珀斯 + 悉尼',
  Prague: '布拉格',
  Rabat: '拉巴特',
  'Rio de Janeiro': '里约热内卢',
  Riyadh: '利雅得',
  Rome: '罗马',
  Rotterdam: '鹿特丹',
  Rouen: '鲁昂',
  Santiago: '圣地亚哥',
  'Sao Paulo': '圣保罗',
  Seoul: '首尔',
  Shanghai: '上海',
  Singapore: '新加坡',
  Sydney: '悉尼',
  Stockholm: '斯德哥尔摩',
  Strasbourg: '斯特拉斯堡',
  Stuttgart: '斯图加特',
  Tokyo: '东京',
  Toronto: '多伦多',
  Turin: '都灵',
  Umag: '乌马格',
  Vienna: '维也纳',
  Washington: '华盛顿',
  'Washington, D.C.': '华盛顿',
  Wimbledon: '温布尔登',
  'Winston-Salem': '温斯顿-塞勒姆',
  Wuhan: '武汉'
};

const flagMap = {
  Argentina: '🇦🇷',
  Australia: '🇦🇺',
  Austria: '🇦🇹',
  Belgium: '🇧🇪',
  Brazil: '🇧🇷',
  Canada: '🇨🇦',
  Chile: '🇨🇱',
  China: '🇨🇳',
  Colombia: '🇨🇴',
  Croatia: '🇭🇷',
  'Czech Republic': '🇨🇿',
  France: '🇫🇷',
  Germany: '🇩🇪',
  Greece: '🇬🇷',
  India: '🇮🇳',
  Italy: '🇮🇹',
  Japan: '🇯🇵',
  Kazakhstan: '🇰🇿',
  Mexico: '🇲🇽',
  Monaco: '🇲🇨',
  Morocco: '🇲🇦',
  Netherlands: '🇳🇱',
  'New Zealand': '🇳🇿',
  Portugal: '🇵🇹',
  Qatar: '🇶🇦',
  Romania: '🇷🇴',
  'Saudi Arabia': '🇸🇦',
  Singapore: '🇸🇬',
  'South Korea': '🇰🇷',
  Spain: '🇪🇸',
  Sweden: '🇸🇪',
  Switzerland: '🇨🇭',
  'United Arab Emirates': '🇦🇪',
  'United Kingdom': '🇬🇧',
  'United States': '🇺🇸'
};

const surfaceDisplayMap = {
  Hard: {
    zh: '硬地',
    en: 'HARD'
  },
  Clay: {
    zh: '红土',
    en: 'CLAY'
  },
  Grass: {
    zh: '草地',
    en: 'GRASS'
  },
  'Hard-Outdoor': {
    zh: '室外硬地',
    en: 'OUTDOOR HARD'
  },
  'Hard-Indoor': {
    zh: '室内硬地',
    en: 'INDOOR HARD'
  },
  'Clay-Outdoor': {
    zh: '室外红土',
    en: 'OUTDOOR CLAY'
  },
  'Grass-Outdoor': {
    zh: '室外草地',
    en: 'OUTDOOR GRASS'
  }
};

const getSurfaceDisplay = (tour, surface) => {
  const displaySurface = tour === 'WTA'
    ? surface.replace(/-(Indoor|Outdoor)$/, '')
    : surface;
  return surfaceDisplayMap[displaySurface] || {
    zh: surface,
    en: surface
  };
};

const rawEvents = [
// ATP 2026 赛季完整赛事数据
// 数据格式: [巡回赛组织, 赛事名称, 举办城市, 国家, 级别, 场地信息, 开始日期, 结束日期]
  // ========== 一月：澳大利亚赛季 ==========
  ['ATP', 'United Cup', 'Perth + Sydney', 'Australia', 'Team', 'Hard-Outdoor', '2026-01-02', '2026-01-11'],
  ['ATP', 'Brisbane International presented by ANZ', 'Brisbane', 'Australia', '250', 'Hard-Outdoor', '2026-01-04', '2026-01-11'],
  ['ATP', 'Bank of China Hong Kong Tennis Open', 'Hong Kong', 'China', '250', 'Hard-Outdoor', '2026-01-05', '2026-01-11'],
  ['ATP', 'Adelaide International', 'Adelaide', 'Australia', '250', 'Hard-Outdoor', '2026-01-12', '2026-01-17'],
  ['ATP', 'ASB Classic', 'Auckland', 'New Zealand', '250', 'Hard-Outdoor', '2026-01-12', '2026-01-17'],
  ['ATP', 'Australian Open', 'Melbourne', 'Australia', 'Grand Slam', 'Hard-Outdoor', '2026-01-18', '2026-02-01'],
  
  // ========== 二月：欧洲+中东+南美 ==========
  ['ATP', 'Open Occitanie', 'Montpellier', 'France', '250', 'Hard-Indoor', '2026-02-02', '2026-02-08'],
  ['ATP', 'Davis Cup Qualifiers 1st Rd', 'Multiple Locations', 'Multiple', 'Davis Cup', 'Hard-Indoor', '2026-02-05', '2026-02-08'],
  ['ATP', 'Nexo Dallas Open', 'Dallas', 'United States', '250', 'Hard-Indoor', '2026-02-09', '2026-02-15'],
  ['ATP', 'ABN AMRO Open', 'Rotterdam', 'Netherlands', '500', 'Hard-Indoor', '2026-02-09', '2026-02-15'],
  ['ATP', 'IEB+ Argentina Open', 'Buenos Aires', 'Argentina', '250', 'Clay-Outdoor', '2026-02-09', '2026-02-15'],
  ['ATP', 'Qatar ExxonMobil Open', 'Doha', 'Qatar', '250', 'Hard-Outdoor', '2026-02-16', '2026-02-21'],
  ['ATP', 'Rio Open presented by Claro', 'Rio de Janeiro', 'Brazil', '500', 'Clay-Outdoor', '2026-02-16', '2026-02-22'],
  ['ATP', 'Delray Beach Open', 'Delray Beach', 'United States', '250', 'Hard-Outdoor', '2026-02-16', '2026-02-22'],
  ['ATP', 'Dubai Duty Free Tennis Championships', 'Dubai', 'United Arab Emirates', '500', 'Hard-Outdoor', '2026-02-23', '2026-02-28'],
  ['ATP', 'Abierto Mexicano Telcel presentado por HSBC', 'Acapulco', 'Mexico', '500', 'Hard-Outdoor', '2026-02-23', '2026-02-28'],
  ['ATP', 'BCI Seguros Chile Open', 'Santiago', 'Chile', '250', 'Clay-Outdoor', '2026-02-23', '2026-03-01'],
  
  // ========== 三月：北美阳光双赛 ==========
  ['ATP', 'BNP Paribas Open', 'Indian Wells', 'United States', '1000', 'Hard-Outdoor', '2026-03-04', '2026-03-15'],
  ['ATP', 'Miami Open presented by Itau', 'Miami', 'United States', '1000', 'Hard-Outdoor', '2026-03-18', '2026-03-29'],
  ['ATP', "Fayez Sarofim & Co. U.S. Men's Clay Court Championship", 'Houston', 'United States', '250', 'Clay-Outdoor', '2026-03-30', '2026-04-05'],
  ['ATP', 'Grand Prix Hassan II', 'Marrakech', 'Morocco', '250', 'Clay-Outdoor', '2026-03-30', '2026-04-05'],
  ['ATP', 'Tiriac Open presented by UniCredit Bank', 'Bucharest', 'Romania', '250', 'Clay-Outdoor', '2026-03-30', '2026-04-05'],
  
  // ========== 四月：欧洲红土赛季 ==========
  ['ATP', 'Rolex Monte-Carlo Masters', 'Monte-Carlo', 'Monaco', '1000', 'Clay-Outdoor', '2026-04-05', '2026-04-12'],
  ['ATP', 'Barcelona Open Banc Sabadell', 'Barcelona', 'Spain', '500', 'Clay-Outdoor', '2026-04-13', '2026-04-19'],
  ['ATP', 'BMW Open by Bitpanda', 'Munich', 'Germany', '250', 'Clay-Outdoor', '2026-04-13', '2026-04-19'],
  ['ATP', 'Mutua Madrid Open', 'Madrid', 'Spain', '1000', 'Clay-Outdoor', '2026-04-22', '2026-05-03'],
  
  // ========== 五月：欧洲红土赛季 + 法网 ==========
  ['ATP', "Internazionali BNL d'Italia", 'Rome', 'Italy', '1000', 'Clay-Outdoor', '2026-05-06', '2026-05-17'],
  ['ATP', 'Bitpanda Hamburg Open', 'Hamburg', 'Germany', '500', 'Clay-Outdoor', '2026-05-17', '2026-05-23'],
  ['ATP', 'Gonet Geneva Open', 'Geneva', 'Switzerland', '250', 'Clay-Outdoor', '2026-05-17', '2026-05-23'],
  ['ATP', 'Roland Garros', 'Paris', 'France', 'Grand Slam', 'Clay-Outdoor', '2026-05-24', '2026-06-07'],
  
  // ========== 六月：草地赛季 ==========
  ['ATP', 'BOSS OPEN', 'Stuttgart', 'Germany', '250', 'Grass-Outdoor', '2026-06-08', '2026-06-14'],
  ['ATP', 'Libema Open', "'s-Hertogenbosch", 'Netherlands', '250', 'Grass-Outdoor', '2026-06-08', '2026-06-14'],
  ['ATP', 'HSBC Championships', 'London', 'United Kingdom', '500', 'Grass-Outdoor', '2026-06-15', '2026-06-21'],
  ['ATP', 'Terra Wortmann Open', 'Halle', 'Germany', '500', 'Grass-Outdoor', '2026-06-15', '2026-06-21'],
  ['ATP', 'Vanda Pharmaceuticals Mallorca Championships', 'Mallorca', 'Spain', '250', 'Grass-Outdoor', '2026-06-21', '2026-06-27'],
  ['ATP', 'Lexus Eastbourne Open', 'Eastbourne', 'United Kingdom', '250', 'Grass-Outdoor', '2026-06-22', '2026-06-27'],
  ['ATP', 'Wimbledon', 'London', 'United Kingdom', 'Grand Slam', 'Grass-Outdoor', '2026-06-29', '2026-07-12'],
  
  // ========== 七月：红土+硬地过渡 ==========
  ['ATP', 'Nordea Open', 'Bastad', 'Sweden', '250', 'Clay-Outdoor', '2026-07-13', '2026-07-19'],
  ['ATP', 'EFG Swiss Open Gstaad', 'Gstaad', 'Switzerland', '250', 'Clay-Outdoor', '2026-07-13', '2026-07-19'],
  ['ATP', 'Plava Laguna Croatia Open Umag', 'Umag', 'Croatia', '250', 'Clay-Outdoor', '2026-07-13', '2026-07-18'],
  ['ATP', 'Generali Open', 'Kitzbuhel', 'Austria', '250', 'Clay-Outdoor', '2026-07-20', '2026-07-25'],
  ['ATP', 'Millennium Estoril Open', 'Estoril', 'Portugal', '250', 'Clay-Outdoor', '2026-07-20', '2026-07-26'],
  ['ATP', 'Mubadala DC Open', 'Washington', 'United States', '500', 'Hard-Outdoor', '2026-07-27', '2026-08-02'],
  ['ATP', 'Mifel Tennis Open by Telcel Oppo', 'Los Cabos', 'Mexico', '250', 'Hard-Outdoor', '2026-07-27', '2026-08-01'],
  
  // ========== 八月：北美硬地赛季 + 美网 ==========
  ['ATP', 'National Bank Open presented by Rogers', 'Montreal', 'Canada', '1000', 'Hard-Outdoor', '2026-08-02', '2026-08-13'],
  ['ATP', 'Cincinnati Open', 'Cincinnati', 'United States', '1000', 'Hard-Outdoor', '2026-08-13', '2026-08-23'],
  ['ATP', 'Winston-Salem Open', 'Winston-Salem', 'United States', '250', 'Hard-Outdoor', '2026-08-23', '2026-08-29'],
  ['ATP', 'US Open', 'New York', 'United States', 'Grand Slam', 'Hard-Outdoor', '2026-08-31', '2026-09-13'],
  
  // ========== 九月：亚洲赛季开始 ==========
  ['ATP', 'Davis Cup Qualifiers 2nd Rd', 'Multiple Locations', 'Multiple', 'Davis Cup', 'Hard-Indoor', '2026-09-17', '2026-09-20'],
  ['ATP', 'Chengdu Open', 'Chengdu', 'China', '250', 'Hard-Outdoor', '2026-09-23', '2026-09-29'],
  ['ATP', 'Lynk & Co Hangzhou Open', 'Hangzhou', 'China', '250', 'Hard-Outdoor', '2026-09-23', '2026-09-29'],
  ['ATP', 'Laver Cup', 'London', 'United Kingdom', 'Laver Cup', 'Hard-Indoor', '2026-09-25', '2026-09-27'],
  ['ATP', 'China Open', 'Beijing', 'China', '500', 'Hard-Outdoor', '2026-09-30', '2026-10-06'],
  ['ATP', 'Kinoshita Group Japan Open Tennis Championships', 'Tokyo', 'Japan', '500', 'Hard-Outdoor', '2026-09-30', '2026-10-06'],
  
  // ========== 十月：亚洲+欧洲室内赛季 ==========
  ['ATP', 'Rolex Shanghai Masters', 'Shanghai', 'China', '1000', 'Hard-Outdoor', '2026-10-07', '2026-10-18'],
  ['ATP', 'Almaty Open', 'Almaty', 'Kazakhstan', '250', 'Hard-Indoor', '2026-10-19', '2026-10-25'],
  ['ATP', 'Grand Prix Auvergne-Rhone-Alpes', 'Lyon', 'France', '250', 'Hard-Indoor', '2026-10-19', '2026-10-25'],
  ['ATP', 'BNP Paribas Fortis European Open', 'Brussels', 'Belgium', '250', 'Hard-Indoor', '2026-10-19', '2026-10-25'],
  ['ATP', 'Erste Bank Open', 'Vienna', 'Austria', '500', 'Hard-Indoor', '2026-10-26', '2026-11-01'],
  ['ATP', 'Swiss Indoors Basel', 'Basel', 'Switzerland', '500', 'Hard-Indoor', '2026-10-26', '2026-11-01'],
  
  // ========== 十一月：欧洲室内赛季 + 年终 ==========
  ['ATP', 'Rolex Paris Masters', 'Paris', 'France', '1000', 'Hard-Indoor', '2026-11-02', '2026-11-08'],
  ['ATP', 'Bybit Stockholm Open', 'Stockholm', 'Sweden', '250', 'Hard-Indoor', '2026-11-08', '2026-11-14'],
  ['ATP', 'Nitto ATP Finals', 'Turin', 'Italy', 'ATP Finals', 'Hard-Indoor', '2026-11-15', '2026-11-22'],
  ['ATP', 'Davis Cup Finals', 'Bologna', 'Italy', 'Davis Cup', 'Hard-Indoor', '2026-11-23', '2026-11-29'],


  
    // January 2026
    ['WTA', 'United Cup', 'Perth + Sydney', 'Australia', '500', 'Hard', '2026-01-04', '2026-01-11'],
    ['WTA', 'Brisbane International', 'Brisbane', 'Australia', '500', 'Hard', '2026-01-04', '2026-01-11'],
    ['WTA', 'ASB Classic', 'Auckland', 'New Zealand', '250', 'Hard', '2026-01-05', '2026-01-11'],
    ['WTA', 'Adelaide International', 'Adelaide', 'Australia', '500', 'Hard', '2026-01-12', '2026-01-17'],
    ['WTA', 'Hobart International', 'Hobart', 'Australia', '250', 'Hard', '2026-01-12', '2026-01-17'],
    ['WTA', 'Australian Open', 'Melbourne', 'Australia', 'Grand Slam', 'Hard', '2026-01-18', '2026-02-01'],
    
    // February 2026
    ['WTA', 'Mubadala Abu Dhabi Open presented by Abu Dhabi Sports Council', 'Abu Dhabi', 'United Arab Emirates', '500', 'Hard', '2026-02-01', '2026-02-07'],
    ['WTA', 'Ostrava Open', 'Ostrava', 'Czech Republic', '250', 'Hard', '2026-02-01', '2026-02-07'],
    ['WTA', 'Transylvania Open powered by Kaufland', 'Cluj-Napoca', 'Romania', '250', 'Hard', '2026-02-01', '2026-02-07'],
    ['WTA', 'Qatar TotalEnergies Open 2026', 'Doha', 'Qatar', '1000', 'Hard', '2026-02-08', '2026-02-14'],
    ['WTA', 'Dubai Duty Free Tennis Championships', 'Dubai', 'United Arab Emirates', '1000', 'Hard', '2026-02-15', '2026-02-21'],
    ['WTA', 'MÉRIDA OPEN', 'Merida', 'Mexico', '500', 'Hard', '2026-02-23', '2026-03-01'],
    ['WTA', 'ATX Open', 'Austin', 'United States', '250', 'Hard', '2026-02-23', '2026-03-01'],
    
    // March 2026
    ['WTA', 'BNP Paribas Open', 'Indian Wells', 'United States', '1000', 'Hard', '2026-03-04', '2026-03-15'],
    ['WTA', 'Miami Open presented by Itaú', 'Miami', 'United States', '1000', 'Hard', '2026-03-17', '2026-03-29'],
    ['WTA', 'Credit One Charleston Open', 'Charleston', 'United States', '500', 'Clay', '2026-03-30', '2026-04-05'],
    ['WTA', 'Copa Colsanitas Colsubsidio', 'Bogota', 'Colombia', '250', 'Clay', '2026-03-30', '2026-04-05'],
    
    // April 2026
    ['WTA', 'Upper Austria Ladies Linz', 'Linz', 'Austria', '500', 'Clay', '2026-04-06', '2026-04-12'],
    ['WTA', 'Porsche Tennis Grand Prix', 'Stuttgart', 'Germany', '500', 'Clay', '2026-04-13', '2026-04-19'],
    ['WTA', 'Open Capfinances Rouen Métropole', 'Rouen', 'France', '250', 'Clay', '2026-04-13', '2026-04-19'],
    ['WTA', 'Mutua Madrid Open', 'Madrid', 'Spain', '1000', 'Clay', '2026-04-21', '2026-05-03'],
    
    // May 2026
    ['WTA', 'Internazionali BNL d\'Italia', 'Rome', 'Italy', '1000', 'Clay', '2026-05-05', '2026-05-17'],
    ['WTA', 'Internationaux de Strasbourg presented by Mammotion', 'Strasbourg', 'France', '500', 'Clay', '2026-05-17', '2026-05-23'],
    ['WTA', 'Grand Prix Son Altesse Royale La Princesse Lalla Meryem', 'Rabat', 'Morocco', '250', 'Clay', '2026-05-18', '2026-05-23'],
    ['WTA', 'Roland Garros', 'Paris', 'France', 'Grand Slam', 'Clay', '2026-05-24', '2026-06-07'],
    
    // June 2026
    ['WTA', 'The HSBC Championships', 'London', 'United Kingdom', '500', 'Grass', '2026-06-08', '2026-06-14'],
    ['WTA', 'Libéma Open', "'s-Hertogenbosch", 'Netherlands', '250', 'Grass', '2026-06-08', '2026-06-14'],
    ['WTA', 'VANDA Pharmaceuticals Berlin Tennis Open', 'Berlin', 'Germany', '500', 'Grass', '2026-06-15', '2026-06-21'],
    ['WTA', 'Lexus Nottingham Open', 'Nottingham', 'United Kingdom', '250', 'Grass', '2026-06-15', '2026-06-21'],
    ['WTA', 'Bad Homburg Open powered by Solarwatt', 'Bad Homburg', 'Germany', '500', 'Grass', '2026-06-21', '2026-06-27'],
    ['WTA', 'Lexus Eastbourne Open', 'Eastbourne', 'United Kingdom', '250', 'Grass', '2026-06-22', '2026-06-27'],
    ['WTA', 'The Championships, Wimbledon', 'Wimbledon', 'United Kingdom', 'Grand Slam', 'Grass', '2026-06-29', '2026-07-12'],
    
    // July 2026
    ['WTA', 'UniCredit Iasi Open', 'Iasi', 'Romania', '250', 'Clay', '2026-07-13', '2026-07-19'],
    ['WTA', 'Vanda Pharmaceuticals Athens Open', 'Athens', 'Greece', '250', 'Hard', '2026-07-20', '2026-07-26'],
    ['WTA', 'Livesport Prague Open 2026', 'Prague', 'Czech Republic', '250', 'Hard', '2026-07-20', '2026-07-26'],
    ['WTA', 'MSC Hamburg Ladies Open', 'Hamburg', 'Germany', '250', 'Clay', '2026-07-27', '2026-08-02'],
    ['WTA', 'Mubadala DC Open', 'Washington', 'United States', '500', 'Hard', '2026-07-27', '2026-08-02'],
    ['WTA', 'The Memphis Classic', 'Memphis', 'United States', '250', 'Hard', '2026-07-27', '2026-08-02'],
    
    // August 2026
    ['WTA', 'National Bank Open presented by Rogers', 'Toronto', 'Canada', '1000', 'Hard', '2026-08-02', '2026-08-13'],
    ['WTA', 'Cincinnati Open', 'Cincinnati', 'United States', '1000', 'Hard', '2026-08-13', '2026-08-23'],
    ['WTA', 'Abierto GNP Seguros', 'Monterrey', 'Mexico', '500', 'Hard', '2026-08-23', '2026-08-29'],
    ['WTA', 'US Open', 'New York', 'United States', 'Grand Slam', 'Hard', '2026-08-30', '2026-09-13'],
    
    // September 2026
    ['WTA', 'Guadalajara Open presentado por Santander', 'Guadalajara', 'Mexico', '500', 'Hard', '2026-09-13', '2026-09-19'],
    ['WTA', 'SP Open', 'Sao Paulo', 'Brazil', '250', 'Hard', '2026-09-14', '2026-09-20'],
    ['WTA', 'Singapore Tennis Open', 'Singapore', 'Singapore', '500', 'Hard', '2026-09-21', '2026-09-27'],
    ['WTA', 'Korea Open', 'Seoul', 'South Korea', '250', 'Hard', '2026-09-21', '2026-09-27'],
    ['WTA', 'China Open', 'Beijing', 'China', '1000', 'Hard', '2026-09-30', '2026-10-11'],
    
    // October 2026
    ['WTA', 'Wuhan Open', 'Wuhan', 'China', '1000', 'Hard', '2026-10-12', '2026-10-18'],
    ['WTA', 'Ningbo Open', 'Ningbo', 'China', '500', 'Hard', '2026-10-19', '2026-10-25'],
    ['WTA', 'Kinoshita Group Japan Open', 'Osaka', 'Japan', '250', 'Hard', '2026-10-19', '2026-10-25'],
    ['WTA', 'Toray Pan Pacific Open Tennis', 'Tokyo', 'Japan', '500', 'Hard', '2026-10-26', '2026-11-01'],
    ['WTA', 'Guangzhou Open', 'Guangzhou', 'China', '250', 'Hard', '2026-10-26', '2026-11-01'],
    
    // November 2026
    ['WTA', 'Chennai Open', 'Chennai', 'India', '250', 'Hard', '2026-11-02', '2026-11-08'],
    ['WTA', 'Prudential Hong Kong Tennis Open', 'Hong Kong', 'China', '250', 'Hard', '2026-11-02', '2026-11-08'],
    ['WTA', 'WTA Finals Riyadh', 'Riyadh', 'Saudi Arabia', 'Finals', 'Hard-Indoor', '2026-11-07', '2026-11-14']

];

const tennisEvents = rawEvents
  .map(([tour, eventName, city, country, level, surface, startDate, endDate], index) => {
    const surfaceDisplay = getSurfaceDisplay(tour, surface);
    const cityCn = cityCnMap[city] || city;
    const countryCn = countryCnMap[country] || country;
    return {
      id: index + 1,
      tour,
      eventName,
      city,
      cityCn,
      country,
      countryCn,
      location: `${city}, ${country}`,
      locationCn: `${cityCn}，${countryCn}`,
      flag: flagMap[country] || '🎾',
      level,
      surface,
      surfaceCn: surfaceDisplay.zh,
      surfaceEn: surfaceDisplay.en,
      startDate,
      endDate,
      eventDates: startDate === endDate ? startDate : `${startDate} - ${endDate}`
    };
  })
  .sort((a, b) => (
    a.startDate.localeCompare(b.startDate) ||
    getLevelPriority(a.level, 9) - getLevelPriority(b.level, 9) ||
    a.tour.localeCompare(b.tour) ||
    a.eventName.localeCompare(b.eventName)
  ))
  .map((event, index) => ({ ...event, id: index + 1 }));

module.exports = {
  tennisEvents,
  levelOrder
};
