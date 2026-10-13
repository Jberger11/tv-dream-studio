/** @typedef {'double-o'|'o'|'x'} Compatibility */
/** @typedef {'drama'|'variety'|'night'|'children'|'sitcom'|'talkshow'|'reality'|'travel'|'music'|'news'|'finance'|'information'|'politics'|'social'|'charity'|'contest'|'pageant'|'catalog'} ProgramKind */

export class Actor {
  constructor(id, name, skill, fee, specialty, source = 'tvb', contractType = 'freelance', contractDaysLeft = 0, stamina = 100, trainedCount = 0) {
    Object.assign(this, { id, name, skill, fee, specialty, source, contractType, contractDaysLeft, stamina, trainedCount });
  }
}

export class Program {
  constructor({ id, title, kind, quality, review = quality, rating, buzz, cost = 0, genre = '', themes = [], cast = [], castIds = [], topic = '', tier = 'o', outcome = 'standard', category = '', runs = 0, episodes = 0, episodeHours = null, episodeCost = 0, style = '', licenseDays = null, licenseStartDay = null, licenseExpiresDay = null, licenseBaseCost = null, network = '', releaseYear = null, replayStartRuns = 0, replayEndRuns = null, replayCount = 0, freshness = 100, maxFreshness = 100, lastAiredDay = null, completedRuns = 0, origin = '香港', licenseExpiredHandled = false, deliveredEpisodes = null, projectId = null }) {
    Object.assign(this, { id, title, kind, quality, review, rating, buzz, cost, genre, themes, cast, castIds, topic, tier, outcome, category, runs, episodes, episodeHours, episodeCost, style, licenseDays, licenseStartDay, licenseExpiresDay, licenseBaseCost, network, releaseYear, replayStartRuns, replayEndRuns, replayCount, freshness, maxFreshness, lastAiredDay, completedRuns, origin, licenseExpiredHandled, deliveredEpisodes: deliveredEpisodes ?? episodes, projectId });
  }
}

export class Episode {
  constructor({
    id,
    projectId,
    episodeNumber,
    stage = 'pre_production',
    stageProgress = 0,
    status = 'pending',
    fun = 50,
    originality = 50,
    direction = 50,
    acting = 50,
    technical = 50,
    errors = 0,
    cost = 0,
    days = 0,
    morale = 80,
    expectations = 50,
    eventsHandled = [],
    pendingEvent = null,
    qcReport = null,
    qcDecision = null,
    airedDay = null,
    rating = null,
    revenue = null
  }) {
    Object.assign(this, {
      id, projectId, episodeNumber, stage, stageProgress, status,
      fun, originality, direction, acting, technical, errors, cost, days,
      morale, expectations, eventsHandled, pendingEvent, qcReport, qcDecision,
      airedDay, rating, revenue
    });
  }
}

export class ProductionProject {
  constructor({
    id,
    title,
    genre = '時裝恩怨',
    themes = ['愛情'],
    format = 'drama',
    episodesCount = 8,
    episodeHours = 2,
    targetAudience = 'family',
    budgetPerEpisode = 150_000,
    budgetId = 'standard',
    assignedStudioId = 'studio_1',
    strategy = 'balanced',
    plannedStartDate = 1,
    intendedBroadcastPeriod = 'prime',
    cast = [],
    crew = { directorId: 'dir_lee', writerId: 'wri_cheung' },
    episodes = [],
    status = 'planning',
    createdDay = 1,
    deliveredEpisodesCount = 0,
    totalCostSpent = 0,
    ratingsHistory = [],
    franchiseId = null,
    seasonNumber = 1,
    parentProjectId = null,
    programId = null,
    notes = '',
    autoChoices = {},
    lastManualEventDay = null
  }) {
    Object.assign(this, {
      id, title, genre, themes, format, episodesCount, episodeHours,
      targetAudience, budgetPerEpisode, budgetId, assignedStudioId, strategy,
      plannedStartDate, intendedBroadcastPeriod, cast, crew, episodes,
      status, createdDay, deliveredEpisodesCount, totalCostSpent,
      ratingsHistory, franchiseId, seasonNumber, parentProjectId, programId, notes,
      autoChoices, lastManualEventDay
    });
  }
}

export const DEFAULT_STUDIOS = [
  { id: 'studio_1', name: '1號旗艦電視影城', type: 'drama', level: 1, capacity: 2, efficiency: 1.0, bonus: 0, costPerDay: 8_000, desc: '大型實景影視城，專攻古裝、年代及長篇旗艦大劇，可同時製作 2 集' },
  { id: 'studio_2', name: '2號綜藝多功能棚', type: 'variety', level: 1, capacity: 2, efficiency: 1.1, bonus: 2, costPerDay: 6_000, desc: '先進多機位綜藝大廠，適合遊戲實況、音樂盛典及清談節目' },
  { id: 'studio_3', name: '3號數碼新聞即時廠', type: 'news', level: 1, capacity: 2, efficiency: 1.3, bonus: 0, costPerDay: 4_000, desc: '高速即時直播室，專供每日新聞、開市財經與直播盛事急速出街' },
  { id: 'studio_location', name: '外景及實景攝製組', type: 'location', level: 1, capacity: 2, efficiency: 0.95, bonus: 6, costPerDay: 9_000, desc: '全香港地標實景及海外取景組，真實質感濃厚，大幅提升原創口碑' }
];

export const DEFAULT_CREWS = [
  // 1. 旗艦劇集 (drama)
  { id: 'dir_lee', name: '李添勝', role: 'director', format: 'drama', title: '金牌監製導演', skill: 88, specialty: '古裝武俠', fee: 120_000, desc: '掌控大局能力極強，擅長武俠情義與大河劇集' },
  { id: 'dir_wai', name: '韋家輝', role: 'director', format: 'drama', title: '鬼才編導', skill: 92, specialty: '商戰風雲', fee: 180_000, desc: '破格前衛構思，角色性格極端強烈，收視話題雙高峰' },
  { id: 'dir_to', name: '杜琪峯', role: 'director', format: 'drama', title: '名導巨匠', skill: 95, specialty: '刑偵懸疑', fee: 250_000, desc: '影視巨匠級執導功力，鏡頭調度與氣氛張力頂級' },
  { id: 'dir_young', name: '新銳獨立導演', role: 'director', format: 'drama', title: '新浪潮青年導演', skill: 78, specialty: '青春偶像', fee: 80_000, desc: '貼近年輕一代審美，鏡頭語言清新潮爆' },
  { id: 'wri_cheung', name: '張華標', role: 'writer', format: 'drama', title: '金牌金像編審', skill: 90, specialty: '家族恩怨', fee: 90_000, desc: '善創金句名場面，高潮迭起絕無冷場' },
  { id: 'wri_chan', name: '陳十三', role: 'writer', format: 'drama', title: '奇幻鬼才編劇', skill: 88, specialty: '奇幻靈異', fee: 85_000, desc: '想像力奔放不羈，奇情天馬行空' },
  { id: 'wri_sit', name: '薛家華', role: 'writer', format: 'drama', title: '快手生活編審', skill: 80, specialty: '處境喜劇', fee: 60_000, desc: '貼地市井生活，對白幽默風趣出稿神速' },

  // 2. 自製綜藝 (variety)
  { id: 'dir_var_siu', name: '蕭潮順', role: 'director', format: 'variety', title: '元祖綜藝總監', skill: 89, specialty: '爆笑遊戲', fee: 110_000, desc: 'TVB獎門人背後功臣，節奏緊湊笑料不斷，老少咸宜' },
  { id: 'dir_var_fa', name: '花姐（黃慧君）', role: 'director', format: 'variety', title: '造星金牌監製', skill: 93, specialty: '偶像選秀', fee: 170_000, desc: '現象級偶像選秀教母，善造話題爭議，捧紅新世代偶像' },
  { id: 'dir_var_wilson', name: '錢國偉', role: 'director', format: 'variety', title: '美女廚房金牌編導', skill: 86, specialty: '青春真人騷', fee: 95_000, desc: '經典青春遊戲王，善於炒熱氣氛與捕捉嘉賓尷尬笑點' },
  { id: 'dir_var_mike', name: 'Mike導（劉諾衡）', role: 'director', format: 'variety', title: '無限制瘋狂編導', skill: 90, specialty: '整蠱企劃', fee: 130_000, desc: 'ERROR自肥企劃主腦，天馬行空無底線搞笑，年輕網絡狂潮' },
  { id: 'wri_var_man', name: '文雋', role: 'writer', format: 'variety', title: '殿堂綜藝主筆', skill: 88, specialty: '大型遊戲企劃', fee: 80_000, desc: '幽默包袱設計老手，遊戲環節緊張刺激，台詞幽默逗趣' },
  { id: 'wri_var_ling', name: '鄧潔明', role: 'writer', format: 'variety', title: '生活娛樂編審', skill: 82, specialty: '美食旅遊', fee: 65_000, desc: '貼地治癒系生活，挖掘在地隱世美食與感人溫馨故事' },
  { id: 'wri_var_gag', name: '網絡GAG王企劃組', role: 'writer', format: 'variety', title: '潮流迷因主筆', skill: 85, specialty: '流行梗整蠱', fee: 70_000, desc: '網羅全港社交平台熱梗，製造爆笑迷因與病毒式傳播金句' },

  // 3. 新聞資訊 (news)
  { id: 'dir_news_yuen', name: '袁志偉', role: 'director', format: 'news', title: '資深新聞總監', skill: 91, specialty: '權威客觀', fee: 130_000, desc: '數十年新聞主管經驗，重視權威客觀與黃金時段排播穩定' },
  { id: 'dir_news_au', name: '區家麟', role: 'director', format: 'news', title: '深度調查編採總監', skill: 93, specialty: '深度追蹤', fee: 160_000, desc: '新聞獎大滿貫採訪主任，抽絲剝繭揭露事實真相與社會問題' },
  { id: 'dir_news_fast', name: '港聞突發採訪主任', role: 'director', format: 'news', title: '即時現場指揮', skill: 85, specialty: '突發直擊', fee: 85_000, desc: '全天候24小時機動調度，第一時間直擊重大事故與新聞現場' },
  { id: 'dir_news_fin', name: '財經新聞主編', role: 'director', format: 'news', title: '財經專業拆局', skill: 87, specialty: '政經剖析', fee: 100_000, desc: '精準捕捉港股外匯風向，深度拆解宏觀經濟與樓市走勢' },
  { id: 'wri_news_anchor', name: '首席主播文稿編審', role: 'writer', format: 'news', title: '金牌新聞主筆', skill: 89, specialty: '頭條文稿', fee: 75_000, desc: '字字珠璣嚴謹審核，語速語調精準拿捏，建立觀眾高度信任' },
  { id: 'wri_news_invest', name: '調查報導專題筆鋒', role: 'writer', format: 'news', title: '重磅調查撰稿', skill: 92, specialty: '黑幕調查', fee: 90_000, desc: '扎實數據調查與暗訪求證，重磅調查專題屢獲殊榮' },
  { id: 'wri_news_live', name: '突發快訊首席撰稿', role: 'writer', format: 'news', title: '快手外電主筆', skill: 83, specialty: '全球快訊', fee: 60_000, desc: '全球外電即時編譯，秒速推送破局快訊，搶佔第一發布權' },

  // 4. 深度紀錄 (documentary)
  { id: 'dir_doc_cheung', name: '張堅庭', role: 'director', format: 'documentary', title: '人文紀實導演', skill: 90, specialty: '社會人文', fee: 120_000, desc: '細膩人文鏡頭關懷，深入城市微塵與平民日常，韻味悠長' },
  { id: 'dir_doc_mak', name: '麥海珊', role: 'director', format: 'documentary', title: '獨立紀實先鋒', skill: 88, specialty: '邊緣寫實', fee: 105_000, desc: '大膽深入爭議群體與被遺忘角落，客觀冷靜長鏡頭展現真實' },
  { id: 'dir_doc_nature', name: '極地深海攝製總監', role: 'director', format: 'documentary', title: '自然生態巨匠', skill: 94, specialty: '自然奇觀', fee: 200_000, desc: '遠赴南北極與深海4K微距捕捉，震撼視聽震撼全城' },
  { id: 'dir_doc_hist', name: '香港歷史影像總監', role: 'director', format: 'documentary', title: '回憶口述導演', skill: 86, specialty: '集體回憶', fee: 90_000, desc: '百年香港影像檔案考證，重現九龍城寨與老香港傳奇歲月' },
  { id: 'wri_doc_hist', name: '文史考證首席編審', role: 'writer', format: 'documentary', title: '歷史文獻學者', skill: 91, specialty: '史實考究', fee: 85_000, desc: '翻閱檔案館百萬史料，嚴謹考證每段歷史細節，具學術價值' },
  { id: 'wri_doc_field', name: '田野調查深度主筆', role: 'writer', format: 'documentary', title: '生命故事撰稿', skill: 87, specialty: '人物傳記', fee: 70_000, desc: '駐村數月深度訪談，挖掘平凡人物不屈生命力，催淚動人' },
  { id: 'wri_doc_sci', name: '探索科學專題編審', role: 'writer', format: 'documentary', title: '硬核科普筆觸', skill: 85, specialty: '科普解析', fee: 65_000, desc: '通俗易懂拆解複雜科學原理與前沿科技，開拓全民眼界' },

  // 5. 夜間清談 (talkshow)
  { id: 'dir_talk_to', name: '陶傑', role: 'director', format: 'talkshow', title: '深度訪談才子監製', skill: 92, specialty: '機智辛辣', fee: 150_000, desc: '才子式引導風格，談笑風生間直擊嘉賓心防，妙語連珠' },
  { id: 'dir_talk_cheuk', name: '卓韻芝', role: 'director', format: 'talkshow', title: '前衛夜話導演', skill: 87, specialty: '兩性情感', fee: 100_000, desc: '深夜心事無所顧忌，直言不諱暢聊男女攻防與都市孤獨' },
  { id: 'dir_talk_zen', name: '深夜治癒心靈編導', role: 'director', format: 'talkshow', title: '深夜樹洞導演', skill: 84, specialty: '溫情療癒', fee: 80_000, desc: '溫柔傾聽嘉賓脆弱，打造都市夜歸人溫暖的精神避風港' },
  { id: 'dir_talk_cross', name: '跨界文化沙龍總監', role: 'director', format: 'talkshow', title: '思想交鋒名嘴', skill: 89, specialty: '文藝思想', fee: 120_000, desc: '邀請各界名流深度碰撞，擦出哲學與藝術的燦爛思想火花' },
  { id: 'wri_talk_hot', name: '辛辣話題首席策劃', role: 'writer', format: 'talkshow', title: '熱門爆料編審', skill: 89, specialty: '爭議話題', fee: 80_000, desc: '量身定制犀利提問提綱，善於引導嘉賓吐露心聲猛料' },
  { id: 'wri_talk_love', name: '深夜兩性專題編審', role: 'writer', format: 'talkshow', title: '情書信箱主筆', skill: 85, specialty: '感情心理', fee: 68_000, desc: '深諳當代男女情感痛點，設計扎心又治癒的情感互動環節' },
  { id: 'wri_talk_weird', name: '都市奇聞檔案主筆', role: 'writer', format: 'talkshow', title: '奇聞異事企劃', skill: 83, specialty: '怪談怪聞', fee: 60_000, desc: '網羅都市奇人異事與民間未解之謎，營造神秘引人入勝氛圍' },

  // 6. 直播盛事 (live)
  { id: 'dir_live_wai', name: '衛世輝', role: 'director', format: 'live', title: '殿堂大型盛典總監', skill: 95, specialty: '萬人直播', fee: 220_000, desc: '台慶、港姐與大型籌款第一導播，現場多機位切換零失誤神話' },
  { id: 'dir_live_stephen', name: '陳志雲', role: 'director', format: 'live', title: '盛典舞台總策劃', skill: 92, specialty: '頒獎典禮', fee: 160_000, desc: '掌控舞台宏大視覺節奏，調度全港巨星嘉賓，營造萬眾矚目高潮' },
  { id: 'dir_live_sports', name: '體育直播第一導播', role: 'director', format: 'live', title: '激戰秒速切換', skill: 88, specialty: '體育電競', fee: 120_000, desc: '無縫捕捉進球、衝線瞬間，多角度慢鏡頭回放扣人心弦' },
  { id: 'dir_live_xr', name: '跨屏新媒體直播導演', role: 'director', format: 'live', title: '全景互動技術', skill: 86, specialty: '虛擬舞台', fee: 95_000, desc: '融合XR虛擬舞台與全城互動彈幕，引爆跨世代全民參與' },
  { id: 'wri_live_law', name: '鄭丹瑞', role: 'writer', format: 'live', title: '殿堂司儀稿總撰稿', skill: 93, specialty: '金牌司儀稿', fee: 100_000, desc: '金牌司儀幕後撰稿靈魂，精準鋪排高雅幽默笑話與莊重過場' },
  { id: 'wri_live_show', name: '盛典歌舞秀編審', role: 'writer', format: 'live', title: '高潮節奏策劃', skill: 87, specialty: '文藝匯演', fee: 75_000, desc: '設計開場萬人歌舞與重頭神秘嘉賓驚喜串聯，熱度破表' },
  { id: 'wri_live_quick', name: '現場救場即興文膽', role: 'writer', format: 'live', title: '臨場急智快手', skill: 85, specialty: '臨場補位', fee: 65_000, desc: '應對超時或冷場危機秒速遞紙條，幽默化解任何直播意外' }
];

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
    // Deep TV Production Engine State
    this.productionProjects = [];
    this.studios = DEFAULT_STUDIOS.map(s => ({ ...s }));
    this.crews = DEFAULT_CREWS.map(c => ({ ...c }));
    this.franchises = [];
    this.activeFilmingEvents = [];
    this.log = [{ quarter:0, text:'電視台開台。片庫已有 12 套節目，24 小時時段全部排好。', type:'neutral' }];
  }
}

