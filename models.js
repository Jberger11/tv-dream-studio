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
      {
        id:'jade',
        name:'翡翠台',
        englishName:'Jade TV',
        network:'電視廣播（無綫電視）',
        channelNo: 81,
        themeColor: '#10b981',
        profile:'財雄勢大，全天候 24 小時王牌劇集與長壽綜藝排播，體育版權出價高。',
        stars: ['馬國明', '陳豪', '高海寧', '陳曉華', '王浩信', '譚俊彥'],
        schedule:[
          {start:0,duration:3,title:'無綫午夜劇場',category:'經典劇集',desc:'深宵重溫歷年經典大劇，忠實劇迷深宵追劇',rating:50},
          {start:3,duration:3,title:'舊劇重溫經典',category:'經典劇集',desc:'深夜時段循環播映無綫片庫藏品',rating:44},
          {start:6,duration:3,title:'香港早晨',category:'新聞資訊',desc:'陪伴全港市民上班上學的晨間新聞直播',rating:65},
          {start:9,duration:2,title:'開市財經直擊',category:'財經資訊',desc:'港股開市第一手即時報價與專家分析',rating:57},
          {start:11,duration:2,title:'流行都市生活',category:'生活資訊',desc:'長壽婦女生活資訊、家庭烹飪與健康養生',rating:55},
          {start:13,duration:2,title:'午間經典劇場',category:'經典劇集',desc:'午飯時間合家歡重溫經典時裝恩怨劇',rating:62},
          {start:15,duration:2,title:'下午合家歡',category:'少兒動漫',desc:'兒童節目、卡通片與合家歡休閒資訊',rating:57},
          {start:17,duration:1,title:'六點半新聞報道',category:'新聞報道',desc:'無綫旗艦黃金時段新聞，全港收視最高新聞節目',rating:72},
          {start:18,duration:1,title:'東張西望時事',category:'時事熱話',desc:'緊貼香港民生熱話與社會奇聞，話題收視雙高峰',rating:76},
          {start:19,duration:2,title:'愛·回家之開心速遞',category:'王牌處境劇',rotation:['愛·回家之開心速遞','年代商戰風雲','律政強人重聚'],desc:'收視穩居榜首的皇牌長壽處境喜劇，全港晚飯首選',rating:82},
          {start:21,duration:2,title:'黃金旗艦大劇',category:'旗艦大劇',desc:'全台重金打造之合拍旗艦商戰懸疑大劇',rating:80},
          {start:23,duration:1,title:'晚間新聞與夜線',category:'晚間新聞',desc:'總結全日要聞、體育動態與深宵天氣預測',rating:62}
        ]
      },
      {
        id:'viu',
        name:'ViuTV',
        englishName:'ViuTV',
        network:'香港電視娛樂',
        channelNo: 99,
        themeColor: '#0ea5e9',
        profile:'主打年輕偶像、原創劇集與大型運動賽事。',
        stars: ['楊樂文', '江𤒹生', '岑珈其', '陳漢娜', '凌文龍', '邱傲然'],
        schedule:[
          {start:0,duration:2,title:'深夜 Chill Club 音樂',category:'音樂節目',desc:'香港獨立音樂與主流人氣歌手現場音樂會',rating:55},
          {start:2,duration:4,title:'音樂漫遊與重播',category:'音樂重播',desc:'清晨深宵無間斷香港流行音樂 MV 漫遊',rating:42},
          {start:6,duration:3,title:'早晨新聞透視',category:'晨間新聞',desc:'晨早新聞報導與青年社群焦點議題',rating:53},
          {start:9,duration:3,title:'智富通開市資訊',category:'財經開市',desc:'金融理財與年輕創業投資資訊',rating:51},
          {start:12,duration:2,title:'亞洲精選人氣劇',category:'精選外購',desc:'緊貼潮流之高質日劇與話題韓劇精選',rating:56},
          {start:14,duration:2,title:'潮流生活指南',category:'潮流生活',desc:'文青潮流、潮人穿搭與特色小店探秘',rating:50},
          {start:16,duration:2,title:'放學青年天地',category:'青年社群',desc:'放學後青年社群綜藝與動漫時段',rating:52},
          {start:18,duration:1,title:'傍晚新聞報導',category:'傍晚新聞',desc:'重點新聞、國際時事與社會脈搏',rating:60},
          {start:19,duration:1,title:'人氣自製偶像劇',category:'自製偶像劇',desc:'人氣偶像男團女團主演之青春愛情偶像劇',rating:72},
          {start:20,duration:1,title:'爆笑真人實況騷',category:'真人實況騷',rotation:['膠戰極限','全員逃走衝擊','ERROR大冒險'],desc:'無底線爆笑遊戲挑戰與偶像冒險，年輕族群熱捧',rating:76},
          {start:21,duration:2,title:'Viu 原創旗艦劇',category:'原創劇集',rotation:['大叔的愛甜蜜蜜','社內大激戰','IT狂人奮鬥記'],desc:'突破傳統港劇框框，引爆社交網絡洗版狂潮',rating:78},
          {start:23,duration:1,title:'晚吹深度清談',category:'清談節目',desc:'大膽辛辣訪談節目，話題貼地無禁忌',rating:68}
        ]
      },
      {
        id:'hoy',
        name:'HOY TV',
        englishName:'HOY TV',
        network:'有線寬頻開電視',
        channelNo: 77,
        themeColor: '#f43f5e',
        profile:'綜藝生活與焦點大賽爆冷突襲。',
        stars: ['鄭丹瑞', '簡慕華', '林敏驄', '陳秀珠'],
        schedule:[
          {start:0,duration:3,title:'深夜滋味重溫',category:'美食生活',desc:'名廚深宵廚房料理重播，引發深宵食慾',rating:46},
          {start:3,duration:3,title:'經典懷舊影院',category:'懷舊影院',desc:'經典華語與外國老電影放映',rating:40},
          {start:6,duration:3,title:'HOY 早晨快訊',category:'早晨新聞',desc:'開電視早晨新聞快訊與天氣交通直擊',rating:50},
          {start:9,duration:3,title:'財經開市直擊',category:'財經資訊',desc:'專業財經團隊即時分析港股及環球市況',rating:48},
          {start:12,duration:2,title:'星級大廚煮意',category:'名廚烹飪',desc:'香港頂級米芝蓮星廚親授家常名菜秘笈',rating:58},
          {start:14,duration:2,title:'悠閒生活劇場',category:'生活休閒',desc:'慢活品味與大灣區旅遊休閒節目',rating:52},
          {start:16,duration:2,title:'健康養生指南',category:'健康養生',desc:'名醫坐鎮解構都市健康問題與養生食療',rating:51},
          {start:18,duration:1,title:'七點新聞透視',category:'重點新聞',desc:'客觀專業深入之晚間新聞專題',rating:59},
          {start:19,duration:1,title:'開飯喇滋味行',category:'飲食生活',desc:'全港隱世美食、街坊小店與米芝蓮打卡推介',rating:65},
          {start:20,duration:1,title:'外購強檔韓劇',category:'精選韓劇',rotation:['宮廷秘辛','豪門恩怨風雲','都市浪漫曲'],desc:'高收視正版引進之大製作宮廷與豪門愛情劇',rating:71},
          {start:21,duration:2,title:'一線生活搜查',category:'民生時事',desc:'直擊民生痛點、消費陷阱與社會熱點搜查',rating:68},
          {start:23,duration:1,title:'晚間新聞夜話',category:'夜間新聞',desc:'專業透視夜間新聞與兩岸國際脈搏',rating:52}
        ]
      }
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

