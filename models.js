/** @typedef {'double-o'|'o'|'x'} Compatibility */
/** @typedef {'drama'|'variety'|'night'|'children'|'sitcom'|'talkshow'|'reality'|'travel'|'music'|'news'|'finance'|'information'|'politics'|'social'|'charity'|'contest'|'pageant'|'catalog'} ProgramKind */

export class Actor {
  constructor(id, name, skill, fee, specialty, source = 'tvb', contractType = 'freelance', contractDaysLeft = 0, stamina = 100, trainedCount = 0) {
    Object.assign(this, { id, name, skill, fee, specialty, source, contractType, contractDaysLeft, stamina, trainedCount });
  }
}

export class Program {
  constructor({ id, title, kind, quality, review = quality, rating, buzz, cost = 0, genre = '', themes = [], cast = [], castIds = [], topic = '', tier = 'o', outcome = 'standard', category = '', runs = 0, episodes = 0, episodeHours = null, episodeCost = 0, style = '', licenseDays = null, licenseStartDay = null, licenseExpiresDay = null, licenseBaseCost = null, network = '', releaseYear = null, replayStartRuns = 0, replayEndRuns = null, replayCount = 0, freshness = 100, maxFreshness = 100, lastAiredDay = null, completedRuns = 0, origin = '香港', licenseExpiredHandled = false }) {
    Object.assign(this, { id, title, kind, quality, review, rating, buzz, cost, genre, themes, cast, castIds, topic, tier, outcome, category, runs, episodes, episodeHours, episodeCost, style, licenseDays, licenseStartDay, licenseExpiresDay, licenseBaseCost, network, releaseYear, replayStartRuns, replayEndRuns, replayCount, freshness, maxFreshness, lastAiredDay, completedRuns, origin, licenseExpiredHandled });
  }
}

export class BiddingEvent {
  constructor({ id, name, quarter, floor, adTarget, sport = '', icon = '🏅' }) {
    Object.assign(this, { id, name, quarter, floor, adTarget, sport, icon, playerBid: null, resolved: false, winner: null, bids: null, wonDay: null, wonQuarter: null, settled: false });
  }
}

export class StationState {
  constructor() {
    this.quarter = 0; // 2028 Q1; 90 simulated broadcast days per quarter.
    this.day = 1;
    this.liveMinute = 0; // 1 real second = 1 game minute; manual settlement starts the next day.
    this.quarterLedger = {revenue:0,overhead:0,sportsRevenue:0,sportsPenalty:0,audience:0,buzz:0,days:0};
    this.cash = 30_000_000;
    this.reputation = 55;
    this.fans = 24;
    this.talent = {};
    // Three competing Hong Kong commercial channels: Jade TV, ViuTV, HOY TV. Each line-up fills all 24 hourly slots.
    this.rivals = [
      {id:'jade',name:'翡翠台',profile:'電視廣播（無綫）：黃金檔大劇、處境劇、東張西望與合家歡綜藝',schedule:[
        {start:0,duration:3,title:'無綫午夜劇場',rating:50},{start:3,duration:3,title:'舊劇重溫經典',rating:44},
        {start:6,duration:3,title:'香港早晨',rating:65},{start:9,duration:2,title:'開市財經直擊',rating:57},
        {start:11,duration:2,title:'流行都市生活',rating:55},{start:13,duration:2,title:'午間經典劇場',rating:62},
        {start:15,duration:2,title:'下午合家歡',rating:57},{start:17,duration:1,title:'六點半新聞報道',rating:72},
        {start:18,duration:1,title:'東張西望時事',rating:76},
        {start:19,duration:2,title:'愛·回家之開心速遞',rotation:['愛·回家之開心速遞','年代商戰風雲','律政強人重聚'],rating:82},
        {start:21,duration:2,title:'黃金旗艦大劇',rating:80},{start:23,duration:1,title:'晚間新聞與夜線',rating:62}
      ]},
      {id:'viu',name:'ViuTV',profile:'香港電視娛樂：偶像劇、真人騷綜藝、ERROR/MIRROR 潮流熱話',schedule:[
        {start:0,duration:2,title:'深夜 Chill Club 音樂',rating:55},{start:2,duration:4,title:'音樂漫遊與重播',rating:42},
        {start:6,duration:3,title:'早晨新聞透視',rating:53},{start:9,duration:3,title:'智富通開市資訊',rating:51},
        {start:12,duration:2,title:'亞洲精選人氣劇',rating:56},{start:14,duration:2,title:'潮流生活指南',rating:50},
        {start:16,duration:2,title:'放學青年天地',rating:52},{start:18,duration:1,title:'傍晚新聞報導',rating:60},
        {start:19,duration:1,title:'人氣自製偶像劇',rating:72},
        {start:20,duration:1,title:'爆笑真人實況騷',rotation:['膠戰極限','全員逃走衝擊','ERROR大冒險'],rating:76},
        {start:21,duration:2,title:'Viu 原創旗艦劇',rotation:['大叔的愛甜蜜蜜','社內大激戰','IT狂人奮鬥記'],rating:78},
        {start:23,duration:1,title:'晚吹深度清談',rating:68}
      ]},
      {id:'hoy',name:'HOY TV',profile:'有線寬頻旗下：生活資訊、星級名廚美食、外購高質日韓劇',schedule:[
        {start:0,duration:3,title:'深夜滋味重溫',rating:46},{start:3,duration:3,title:'經典懷舊影院',rating:40},
        {start:6,duration:3,title:'HOY 早晨快訊',rating:50},{start:9,duration:3,title:'財經開市直擊',rating:48},
        {start:12,duration:2,title:'星級大廚煮意',rating:58},{start:14,duration:2,title:'悠閒生活劇場',rating:52},
        {start:16,duration:2,title:'健康養生指南',rating:51},{start:18,duration:1,title:'七點新聞透視',rating:59},
        {start:19,duration:1,title:'開飯喇滋味行',rating:65},
        {start:20,duration:1,title:'外購強檔韓劇',rotation:['宮廷秘辛','豪門恩怨風雲','都市浪漫曲'],rating:71},
        {start:21,duration:2,title:'一線生活搜查',rating:68},{start:23,duration:1,title:'晚間新聞夜話',rating:52}
      ]}
    ];
    this.library = [
      new Program({id:'start-doc',title:'城裡的夜',kind:'information',category:'紀錄片',quality:62,rating:48,buzz:34,episodes:6}),
      new Program({id:'start-walk',title:'城市慢行',kind:'information',category:'資訊',quality:57,rating:44,buzz:28}),
      new Program({id:'start-morning',title:'晨早新聞',kind:'news',category:'新聞',quality:68,rating:55,buzz:36}),
      new Program({id:'start-market',title:'開市焦點',kind:'finance',category:'財經',quality:66,rating:52,buzz:38}),
      new Program({id:'start-life',title:'城市生活指南',kind:'information',category:'資訊',quality:62,rating:50,buzz:34}),
      new Program({id:'start-lunch',title:'午間料理王',kind:'variety',category:'綜藝',quality:61,rating:51,buzz:43,episodes:12}),
      new Program({id:'start-film',title:'警察故事',kind:'catalog',category:'香港電影',quality:79,rating:63,buzz:55,episodes:1,licenseDays:180,licenseStartDay:1,licenseExpiresDay:181,licenseBaseCost:1_150_000}),
      new Program({id:'start-crime',title:'都市夜班',kind:'drama',category:'劇集',quality:68,rating:57,buzz:44,genre:'刑偵',episodes:20}),
      new Program({id:'start-evening',title:'晚間新聞',kind:'news',category:'新聞',quality:70,rating:62,buzz:48}),
      new Program({id:'start-sitcom',title:'鄰里有計',kind:'drama',category:'劇集',quality:64,rating:55,buzz:42,genre:'處境劇',episodes:20}),
      new Program({id:'start-show',title:'今晚開咪',kind:'variety',category:'綜藝',quality:66,rating:58,buzz:52,episodes:12}),
      new Program({id:'start-social',title:'城市議題',kind:'social',category:'社會議題',quality:65,rating:50,buzz:46})
    ];
    // One daily schedule, repeated every simulated broadcast day.
    this.schedule = [
      {start:0,duration:2,programId:'start-doc'},
      {start:2,duration:2,programId:'start-walk'},
      {start:4,duration:4,programId:'start-morning'},
      {start:8,duration:2,programId:'start-market'},
      {start:10,duration:2,programId:'start-life'},
      {start:12,duration:2,programId:'start-lunch'},
      {start:14,duration:2,programId:'start-film'},
      {start:16,duration:2,programId:'start-crime'},
      {start:18,duration:1,programId:'start-evening'},
      {start:19,duration:2,programId:'start-sitcom'},
      {start:21,duration:2,programId:'start-show'},
      {start:23,duration:1,programId:'start-social'}
    ];
    this.events = [];
    this.cooldowns = {}; // exact genre + sorted themes -> last blocked quarter
    this.achievements = [];
    this.sponsors = [];
    this.history = [];
    this.lastResult = null;
    this.lastProduction = null;
    this.productionCount = 0;
    this.distributionDeals = [];
    this.audienceFeed = [];
    this.mailbox = [];
    this.audienceBrief = null;
    this.giftBoost = 0;
    this.pendingPremieres = [];
    this.premiereHistory = [];
    this.broadcastReports = [];
    this.charityRaised = 0;
    this.breakingEvent = null;
    this.breakingEventsHistory = [];
    this.monthBroadcastLog = [];
    this.monthlyLeaderboards = [];
    this.lastMonthResult = null;
    this.pendingCeremony = null;
    this.awardCeremonies = [];
    this.viralShowBoost = null;
    this.rivalPurchases = [];
    this.lastFanMeetingDay = -999;
    // New Feature Systems
    this.adPricingStrategy = 'standard'; // 'budget' | 'standard' | 'premium'
    this.activeAdContracts = [];
    this.adContractsMarket = [];
    this.facilities = { studio: 1, postLab: 1, prDept: 1, newsFleet: 1 };
    this.boardSatisfaction = 75;
    this.boardWarnings = 0;
    this.boardHistory = [];
    this.subChannelUnlocked = false;
    this.subChannelSchedule = [];
    this.log = [{ quarter:0, text:'電視台開台。片庫已有 12 套節目，24 小時時段全部排好。', type:'neutral' }];
  }
}

