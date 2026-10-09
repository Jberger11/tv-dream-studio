/** @typedef {'double-o'|'o'|'x'} Compatibility */
/** @typedef {'drama'|'variety'|'night'|'children'|'sitcom'|'talkshow'|'reality'|'travel'|'music'|'news'|'finance'|'information'|'politics'|'social'|'charity'|'contest'|'pageant'|'catalog'} ProgramKind */

export class Actor {
  constructor(id, name, skill, fee, specialty, source = 'tvb') {
    Object.assign(this, { id, name, skill, fee, specialty, source });
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
    // Two competing channels. Each line-up fills all 24 hourly slots.
    this.rivals = [
      {id:'city',name:'全城電視',profile:'大台：黃金檔劇集、新聞',schedule:[
        {start:0,duration:3,title:'午夜戲院',rating:49},{start:3,duration:3,title:'舊劇重溫',rating:43},
        {start:6,duration:3,title:'全城早晨',rating:62},{start:9,duration:2,title:'財經追蹤',rating:58},
        {start:11,duration:2,title:'廚房之王',rating:55},{start:13,duration:2,title:'午間劇場',rating:61},
        {start:15,duration:2,title:'青春劇場',rating:57},{start:17,duration:1,title:'傍晚新聞',rating:70},
        {start:18,duration:1,title:'七點直播',rating:74},
        {start:19,duration:2,title:'年代風雲',rotation:['年代風雲','商界內幕','律政風暴'],rating:82},
        {start:21,duration:2,title:'百萬挑戰',rating:77},{start:23,duration:1,title:'夜線檔案',rating:60}
      ]},
      {id:'local',name:'本地八台',profile:'社區台：民生節目、娛樂',schedule:[
        {start:0,duration:2,title:'午夜電影',rating:52},{start:2,duration:3,title:'經典金曲',rating:42},
        {start:5,duration:2,title:'社區早點',rating:48},{start:7,duration:2,title:'早晨香港',rating:55},
        {start:9,duration:2,title:'理財教室',rating:50},{start:11,duration:2,title:'家常料理',rating:52},
        {start:13,duration:3,title:'午後劇場',rating:53},{start:16,duration:2,title:'城市交通',rating:58},
        {start:18,duration:1,title:'社區新聞',rating:60},
        {start:19,duration:2,title:'街坊日記',rotation:['街坊日記','鄰里合拍','屋企有人'],rating:67},
        {start:21,duration:2,title:'明星歌廳',rating:70},{start:23,duration:1,title:'今日話題',rating:53}
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
    this.log = [{ quarter:0, text:'電視台開台。片庫已有 12 套節目，24 小時時段全部排好。', type:'neutral' }];
  }
}

