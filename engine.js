import { Actor, Program, BiddingEvent, StationState } from './models.js';

export const GENRES = ['刑偵','處境劇','宮鬥','科幻','歷史','青春','律政','醫療','家庭','商戰','武俠','奇幻','社會寫實'];
export const THEMES = ['懸疑','喜劇','愛情','恐怖','冒險','家庭','復仇','職場','友情','時空','成長','權力'];
export const DAYS_PER_QUARTER = 90;
export const DAYS_PER_MARKET_MONTH = 30;
export const marketMonthForDay = day => Math.floor((day-1)/DAYS_PER_MARKET_MONTH);
export const EPISODE_COUNTS = [4,8,12,20];
export const WEEKDAYS = ['週一','週二','週三','週四','週五','週六','週日'];
export const EVERY_DAY = [0,1,2,3,4,5,6];
export const weekdayForDay = day => (day-1)%7;
export const daysForBlock = block => block.days??EVERY_DAY;
export const runsOnWeekday = (block,weekday) => daysForBlock(block).includes(weekday);
export const isDailyFormat = kind => kind==='news'||kind==='finance';
export const isOneOffEvent = kind => kind==='charity'||kind==='contest'||kind==='pageant';
export const PRODUCTION_STYLES = [
  {id:'mainstream',label:'大眾路線',description:'穩定收視 +5',factor:1,quality:0,rating:5,buzz:0},
  {id:'prestige',label:'口碑製作',description:'品質 +8，成本 +18%',factor:1.18,quality:8,rating:-3,buzz:2},
  {id:'viral',label:'話題實驗',description:'話題 +20，成本 +12%',factor:1.12,quality:-4,rating:-4,buzz:20}
];
export const PRODUCTION_HOOKS = [
  {id:'none',label:'穩陣製作',description:'唔加額外橋段',cost:0,quality:0,rating:0,buzz:0},
  {id:'location',label:'街頭實景',description:'花 $180k，品質 +5、話題 +3',cost:180_000,quality:5,rating:0,buzz:3},
  {id:'audience',label:'觀眾參與',description:'花 $120k，收視 +4、話題 +10',cost:120_000,quality:0,rating:4,buzz:10},
  {id:'stunt',label:'大膽特技',description:'花 $260k，話題 +18；品質有風險',cost:260_000,quality:0,rating:0,buzz:18}
];
export const CONTENT_TYPES = [
  {id:'drama',label:'劇集'},
  {id:'variety',label:'綜藝',topics:['遊戲競賽','歌唱選秀','真人秀','訪談','飲食'],factor:.92,appeal:5},
  {id:'night',label:'深夜節目',topics:['深夜清談','午夜音樂','都市怪談','情感熱線','午夜喜劇'],factor:.55,appeal:6},
  {id:'news',label:'新聞',topics:['晨間','午間','晚間','國際'],factor:.04,appeal:8},
  {id:'finance',label:'財經',topics:['開市','收市','市場分析','個人理財'],factor:.04,appeal:2},
  {id:'information',label:'資訊',topics:['旅遊','科技','健康','教育','消費'],factor:.68,appeal:2},
  {id:'politics',label:'政治／時事',topics:['政策討論','時事訪談','議會動向','國際局勢'],factor:.70,appeal:-3},
  {id:'social',label:'社會議題',topics:['城市生活','家庭照顧','環境','勞工','房屋'],factor:.74,appeal:0},
  {id:'charity',label:'慈善夜',topics:['全城慈善演唱會','愛心義賣','社區籌款夜'],factor:5,appeal:3},
  {id:'contest',label:'才藝大賽',topics:['全城歌唱賽','新星舞台','街舞爭霸'],factor:4,appeal:8},
  {id:'pageant',label:'選美盛典',topics:['香港小姐選拔','新世代選美','全城佳麗夜'],factor:5,appeal:9}
];
export const BUDGETS = [
  { id:'lean', label:'精簡', cost:120_000, bonus:0 },
  { id:'standard', label:'標準', cost:240_000, bonus:8 },
  { id:'premium', label:'旗艦', cost:420_000, bonus:14 }
];
export const ACTORS = [
  new Actor('sheren','佘詩曼',92,1_100_000,'宮鬥'),
  new Actor('bosco','黃宗澤',87,850_000,'刑偵'),
  new Actor('kenneth','馬國明',84,730_000,'醫療'),
  new Actor('moses','陳豪',88,920_000,'商戰'),
  new Actor('jessica','宣萱',89,960_000,'家庭'),
  new Actor('selena','李施嬅',85,730_000,'懸疑'),
  new Actor('samantha','高海寧',81,610_000,'職場'),
  new Actor('venus','王敏奕',79,520_000,'青春'),
  new Actor('vincent','羅子溢',80,570_000,'刑偵'),
  new Actor('lawrence','吳啟華',84,760_000,'醫療'),
  new Actor('shaun','譚俊彥',83,680_000,'律政'),
  new Actor('hera','陳曉華',77,480_000,'青春'),
  new Actor('elaine','陳瀅',78,490_000,'愛情'),
  new Actor('lam','林嘉華',82,640_000,'歷史'),
  new Actor('chi','梁競徽',78,500_000,'刑偵'),
  new Actor('joyce','蔡潔',79,510_000,'社會寫實'),
  // Cast names have appeared in ViuTV drama credits. Abilities and fees are fictional game values.
  new Actor('wong_tak_bun','黃德斌',87,810_000,'刑偵','viu'),
  new Actor('edaan','呂爵安',81,660_000,'喜劇','viu'),
  new Actor('anson_lo','盧瀚霆',83,750_000,'愛情','viu'),
  new Actor('kan_mo_wah','簡慕華',85,720_000,'家庭','viu'),
  new Actor('ling_man_lung','凌文龍',84,690_000,'社會寫實','viu'),
  new Actor('hanna_chan','陳漢娜',82,610_000,'懸疑','viu'),
  new Actor('lokman','楊樂文',80,630_000,'職場','viu'),
  new Actor('kaki_sham','岑珈其',79,560_000,'喜劇','viu'),
  new Actor('chan_cham_man','陳湛文',82,620_000,'社會寫實','viu'),
  new Actor('stephy_tang','鄧麗欣',86,840_000,'愛情','viu'),
  new Actor('tiger_yau','邱傲然',78,520_000,'青春','viu'),
  new Actor('an_ck','江熚生',82,700_000,'刑偵','viu'),
  new Actor('hedwig_tam','談善言',83,660_000,'社會寫實','viu'),
  new Actor('jeffrey_ngai','魏浚笙',80,600_000,'青春','viu')
];

export const FEMALE_ACTOR_IDS = new Set([
  'sheren','jessica','selena','samantha','venus','hera','elaine','joyce',
  'kan_mo_wah','hanna_chan','stephy_tang','hedwig_tam'
]);

export const BREAKING_EVENTS_POOL = [
  {
    id: 'typhoon',
    title: '全港十號風球強烈襲港',
    scope: 'local',
    icon: '🌀',
    description: '全港停工停課市民留家避風，全台收視普遍上升，新聞時段備受全城關注！',
    duration: 2,
    ratingMods: { all: 12, kinds: { news: 12, social: 6 } }
  },
  {
    id: 'hang-seng-drop',
    title: '恆生指數單日急瀉過千點',
    scope: 'local',
    icon: '📉',
    description: '金融市場劇烈震盪，全城股民瘋狂追看財經與時事動向，娛樂節目微跌。',
    duration: 3,
    ratingMods: { kinds: { finance: 25, news: 10, politics: 10, drama: -5, variety: -5 } }
  },
  {
    id: 'internet-outage',
    title: '全球網絡海底光纖大中斷',
    scope: 'worldwide',
    icon: '🌐',
    description: '網絡串流平台全面癱瘓，數百萬網民重投傳統電視懷抱，電視收視全面逆襲！',
    duration: 3,
    ratingMods: { all: 16, kinds: { drama: 8, variety: 8 } }
  },
  {
    id: 'world-summit',
    title: '環球領袖緊急氣候峰會',
    scope: 'worldwide',
    icon: '🌍',
    description: '各大國歷史性閉門高峰會議召開，國際形勢牽動人心，時事資訊節目大受注目。',
    duration: 3,
    ratingMods: { kinds: { news: 20, politics: 18, information: 8 } }
  },
  {
    id: 'popstar-visit',
    title: '國際流行巨星旋風訪港',
    scope: 'local',
    icon: '🎤',
    description: '啟德體育園萬人空巷！娛樂話題席捲全港，綜藝與音樂時段成為熱話。',
    duration: 4,
    ratingMods: { kinds: { variety: 22, contest: 15 }, genres: { 青春: 10 } }
  },
  {
    id: 'food-safety',
    title: '全城關注連鎖食安風波',
    scope: 'local',
    icon: '🔍',
    description: '熱門食肆爆出食安危機，市民極度重視生活健康真相與消費專題。',
    duration: 3,
    ratingMods: { kinds: { information: 22, social: 14 } }
  },
  {
    id: 'oscar-win',
    title: '香港電影人揚威國際影展',
    scope: 'worldwide',
    icon: '🏆',
    description: '港產片再度名震國際，引爆全城重溫香港電影經典的狂熱！',
    duration: 4,
    ratingMods: { kinds: { catalog: 24 }, genres: { 歷史: 8 } }
  },
  {
    id: 'urban-mystery',
    title: '深夜獅子山驚現奇異天象',
    scope: 'local',
    icon: '🛸',
    description: '市民拍得離奇光芒引發社交媒體瘋傳，深夜時段與都市怪談引爆收聽收視熱潮！',
    duration: 3,
    ratingMods: { kinds: { night: 26 }, genres: { 科幻: 15, 奇幻: 15 } }
  },
  {
    id: 'retro-craze',
    title: '全球掀起九十年代港風復古潮',
    scope: 'worldwide',
    icon: '📼',
    description: '海外社媒廣泛傳播香港懷舊流行文化，經典港產劇集與武俠作品翻紅！',
    duration: 4,
    ratingMods: { kinds: { catalog: 15 }, genres: { 武俠: 20, 刑偵: 12, 歷史: 12 } }
  },
  {
    id: 'policy-address',
    title: '特區公佈重大民生新政藍圖',
    scope: 'local',
    icon: '📜',
    description: '涵蓋全港房屋交通派糖措施，各區市民爭相了解切身政策細節。',
    duration: 3,
    ratingMods: { kinds: { politics: 22, social: 16, news: 10 } }
  }
];

export function getBreakingRatingMod(event, program) {
  if (!event || !program) return 0;
  let mod = event.ratingMods?.all ?? 0;
  if (event.ratingMods?.kinds?.[program.kind]) {
    mod += event.ratingMods.kinds[program.kind];
  }
  if (program.kind === 'drama' && event.ratingMods?.genres?.[program.genre]) {
    mod += event.ratingMods.genres[program.genre];
  }
  return mod;
}

const synergy = {
  '刑偵': { '懸疑':'double-o','喜劇':'x','愛情':'o','恐怖':'o','冒險':'o','家庭':'o' },
  '處境劇': { '懸疑':'x','喜劇':'o','愛情':'o','恐怖':'x','冒險':'x','家庭':'double-o' },
  '宮鬥': { '懸疑':'o','喜劇':'x','愛情':'double-o','恐怖':'x','冒險':'x','家庭':'o' },
  '科幻': { '懸疑':'o','喜劇':'o','愛情':'o','恐怖':'o','冒險':'double-o','家庭':'x' },
  '歷史': { '懸疑':'o','喜劇':'x','愛情':'o','恐怖':'x','冒險':'double-o','家庭':'o' },
  '青春': { '懸疑':'o','喜劇':'o','愛情':'double-o','恐怖':'x','冒險':'o','家庭':'o','成長':'double-o' },
  '律政': { '懸疑':'double-o','職場':'double-o','權力':'o','喜劇':'o','時空':'x' },
  '醫療': { '職場':'double-o','家庭':'o','懸疑':'o','恐怖':'x','成長':'o' },
  '家庭': { '家庭':'double-o','友情':'o','喜劇':'o','復仇':'x','恐怖':'x' },
  '商戰': { '權力':'double-o','復仇':'o','職場':'double-o','愛情':'o','恐怖':'x' },
  '武俠': { '冒險':'double-o','復仇':'o','時空':'o','職場':'x','家庭':'o' },
  '奇幻': { '時空':'double-o','冒險':'double-o','友情':'o','職場':'x' },
  '社會寫實': { '職場':'o','成長':'double-o','家庭':'o','權力':'o','時空':'x' }
};
// Real titles; all prices, availability and performance stats are game fiction.
const filmPool = [
  ['英雄本色','港產警匪',950_000,82,65,61],['無間道','港產警匪',1_400_000,90,72,75],
  ['警察故事','港產動作',1_150_000,84,68,62],['賭神','港產喜劇',1_000_000,78,63,59],
  ['甜蜜蜜','港產愛情',1_050_000,86,66,64],['花樣年華','香港經典',1_300_000,89,62,73],
  ['重慶森林','香港經典',1_120_000,83,59,70],['倩女幽魂','港產奇幻',1_080_000,81,66,64],
  ['黃飛鴻','港產武俠',1_180_000,84,69,65],['秋天的童話','港產愛情',910_000,79,57,53],
  ['金枝玉葉','港產喜劇',970_000,80,62,58],['精武門','港產功夫',1_060_000,82,64,57]
];
const dramaPool = [
  ['大時代','商戰劇',1_100_000,88,68,67],['金枝慾孽','宮廷劇',1_040_000,85,67,65],
  ['男親女愛','處境劇',820_000,81,63,56],['溏心風暴','家庭劇',930_000,83,65,60],
  ['新聞女王','職場劇',1_280_000,87,70,75],['使徒行者','刑偵劇',1_150_000,85,68,66],
  ['衝上雲霄','職場劇',980_000,82,64,61],
  ['法證先鋒','刑偵劇',1_180_000,86,69,66,20],['尋秦記','穿越劇',1_350_000,87,71,71,20],
  ['九五至尊','穿越劇',790_000,82,64,60,12],['大唐雙龍傳','武俠劇',1_160_000,83,66,64,20],
  ['巾幗梟雄','年代劇',1_220_000,89,70,70,20],['瑪嘉烈與大衛系列 綠豆','愛情劇',670_000,84,64,61,8]
];
// User-curated ViuTV originals. The years identify the requested catalogue;
// package episode counts, prices and performance below are fictional game values.
const viuDramaByYear = {
  2020: [
    ['好人好姐','家庭劇'],['二月廿九','奇幻劇'],['打天下','動作劇'],['歎息橋','愛情劇'],
    ['地產仔','職場劇'],['熟女強人','職場劇'],['暖男爸爸','家庭劇'],['男排女將','運動劇']
  ],
  2021: [['大叔的愛','愛情喜劇'],['超感應學園','奇幻劇']],
  2022: [
    ['IT狗','職場喜劇'],['940920','奇幻劇'],['反起跑線聯盟','家庭劇'],['I SWIM','運動劇'],
    ['野人老師','校園劇'],['季前賽','運動劇'],['繩角','運動劇'],['百萬同居計劃','愛情喜劇']
  ],
  2023: [
    ['殺手廢J','黑色喜劇'],['和解在後','社會劇'],['極度俏郎君','喜劇'],['那年盛夏我們綻放如花','青春劇'],
    ['Food Buddies','愛情劇'],['冰上火花','運動劇'],['社內相親','愛情喜劇'],['法與情','律政劇']
  ],
  2024: [
    ['瑪嘉烈與大衛系列','愛情劇'],['打天下2','動作劇'],['無人之境','家庭劇'],['島嶼協奏曲','青春劇'],
    ['反起跑線聯盟2','家庭劇'],['十七年命運週期','奇幻劇'],['出租大叔','家庭劇'],['無用的謊言','愛情劇']
  ],
  2025: [
    ['老是常出現','家庭劇'],['弊傢伙！我要去祓魔','奇幻喜劇'],['三命','懸疑劇'],['麻甩媽咪','家庭劇'],
    ['哪一天我們會紅','青春劇'],['翻盤下半場','運動劇'],['存酒人','都市劇']
  ],
  2026: [
    ['IT狗2.0','職場喜劇'],['COURT!','律政劇'],['喜劇開場','喜劇'],['日落下的彩虹','愛情劇'],
    ['地獄大狀','奇幻律政'],['kiDnap GAME','懸疑劇']
  ]
};
export const VIU_ORIGINALS = Object.entries(viuDramaByYear).flatMap(([year,shows])=>shows.map(([title,subcategory],index)=>({
  id:`viu-original-${year}-${index}`,title,category:'電視劇',subcategory,group:'series',network:'ViuTV',releaseYear:Number(year),origin:'香港',
  cost:Math.round((580_000+(Number(year)-2020)*35_000+(index%5)*65_000)/1_000)*1_000,
  quality:73+(index*3+Number(year))%15,rating:53+(index*4+Number(year))%16,buzz:51+(index*5+Number(year))%22,
  episodes:[8,12,15,20][(index+Number(year))%4]
})));
const varietyPool = [
  ['獎門人','遊戲綜藝',650_000,76,62,56],['中年好聲音','歌唱綜藝',740_000,79,65,63],
  ['全民造星','選秀綜藝',850_000,82,67,72],
  ['聲夢傳奇','歌唱選秀',780_000,80,65,65,12],['囝囝女女730','青春綜藝',410_000,72,55,58,8],
  ['全民造星IV','選秀綜藝',920_000,83,68,74,12],['聲夢1+2','音樂綜藝',380_000,75,56,55,4]
];
const documentaryPool = [
  ['鏗鏘集','紀實專題',520_000,80,56,54],['香港故事：邊境人家','人文紀錄',470_000,76,53,45],
  ['大自然大不同 自然力','生態紀錄',540_000,78,54,50],['大自然零距離','生態紀錄',500_000,75,52,46],
  ['香港故事：創科夢工場 2','科技紀實',510_000,77,53,52,6],['法援之道','法治紀錄',340_000,74,49,44,4],
  ['數字世界','科技紀錄',480_000,75,52,48,6]
];
const informationPool = [
  ['東張西望','生活資訊',610_000,77,62,59],['醫生與你','健康資訊',430_000,74,54,44],
  ['警訊','民生資訊',380_000,72,49,40,8],['氣候全面體','氣候資訊',450_000,74,52,45,8],
  ['南美潮什麼 2','旅遊資訊',650_000,78,59,61,12]
];
const politicsPool = [
  ['議事論事','時事討論',450_000,74,49,45],['盤點政策','政策訪談',470_000,75,50,46,12],
  ['時事摘錄','時事整理',420_000,73,49,43,12],['頭條新聞','時事評論',630_000,79,57,65,12],
  ['城市論壇','公共討論',520_000,74,51,53,12]
];
const koreanDramaPool = [
  ['黑暗榮耀','復仇神劇',1_380_000,90,78,82,16,'韓國'],
  ['愛的迫降','浪漫愛情',1_250_000,88,75,78,16,'韓國'],
  ['魷魚遊戲','生存懸疑',1_450_000,91,80,88,10,'韓國'],
  ['請回答1988','懷舊溫情',1_180_000,89,74,70,20,'韓國'],
  ['太陽的後裔','軍旅浪漫',1_120_000,85,71,72,16,'韓國'],
  ['非常律師禹英禑','律政療癒',1_200_000,87,73,75,16,'韓國'],
  ['信號 Signal','跨時空刑偵',1_320_000,89,76,74,16,'韓國'],
  ['黑道律師文森佐','犯罪喜劇',1_160_000,84,70,69,20,'韓國'],
  ['機智醫生生活','醫療溫情',1_220_000,88,74,73,12,'韓國'],
  ['孤單又燦爛的神－鬼怪','奇幻愛情',1_280_000,88,75,76,16,'韓國']
];
const japaneseDramaPool = [
  ['半澤直樹','商戰復仇',1_350_000,90,78,80,10,'日本'],
  ['First Love 初戀','純愛經典',1_150_000,88,73,76,10,'日本'],
  ['逃避雖可恥但有用','契約喜劇',1_080_000,86,71,72,11,'日本'],
  ['孤獨的美食家','美食療癒',780_000,82,65,60,12,'日本'],
  ['重啟人生','奇幻人生',1_120_000,89,72,75,10,'日本'],
  ['地面師','犯罪懸疑',1_280_000,87,74,77,8,'日本'],
  ['法醫女王 Unnatural','法醫懸疑',1_220_000,89,75,74,10,'日本'],
  ['Grand Maison 東京','熱血料理',1_180_000,86,72,71,11,'日本']
];
const taiwanDramaPool = [
  ['想見你','穿越懸疑',1_180_000,89,74,76,13,'台灣'],
  ['華燈初上','條通懸疑',1_220_000,87,73,75,24,'台灣'],
  ['我們與惡的距離','社會寫實',1_260_000,91,76,74,10,'台灣'],
  ['不良執念清除師','奇幻溫馨',980_000,85,69,68,12,'台灣'],
  ['茶金','年代商戰',1_050_000,86,70,67,12,'台灣'],
  ['俗女養成記','溫馨家庭',860_000,84,67,64,10,'台灣']
];
const westernDramaPool = [
  ['后翼棄兵','天才傳記',1_320_000,90,77,82,8,'歐美'],
  ['新福爾摩斯','現代推理',1_380_000,91,79,84,12,'歐美'],
  ['怪奇物語','科幻冒險',1_420_000,89,78,85,10,'歐美'],
  ['黑鏡','科技驚悚',1_250_000,88,75,78,12,'歐美'],
  ['最後生還者','末日歷險',1_360_000,90,77,80,9,'歐美'],
  ['切爾諾貝爾','歷史災難',1_290_000,92,78,79,5,'歐美']
];
const chineseDramaPool = [
  ['繁花','年代商戰',1_400_000,91,80,84,30,'內地'],
  ['瑯琊榜','權謀古裝',1_320_000,90,77,78,30,'內地'],
  ['延禧攻略','宮廷爽劇',1_280_000,87,75,80,30,'內地'],
  ['三體','硬核科幻',1_260_000,88,74,75,30,'內地'],
  ['慶餘年','架空權謀',1_300_000,88,76,79,30,'內地'],
  ['狂飆','掃黑刑偵',1_350_000,89,78,81,30,'內地']
];
export const ACQUISITION_GROUPS = [
  {id:'film',label:'香港電影',origin:'香港',pool:filmPool,count:5,legacyCount:2,legacyPoolLength:12},
  {id:'series',label:'電視劇',origin:'香港',pool:dramaPool,count:5,legacyCount:2,legacyPoolLength:7},
  {id:'variety',label:'綜藝',origin:'香港',pool:varietyPool,count:3,legacyCount:1,legacyPoolLength:3},
  {id:'documentary',label:'紀錄片',origin:'香港',pool:documentaryPool,count:3,legacyCount:1,legacyPoolLength:4},
  {id:'information',label:'資訊',origin:'香港',pool:informationPool,count:2,legacyCount:1,legacyPoolLength:2},
  {id:'politics',label:'政治／時事',origin:'香港',pool:politicsPool,count:2,legacyCount:1,legacyPoolLength:1},
  {id:'korean',label:'韓劇',origin:'韓國',pool:koreanDramaPool,count:4,legacyCount:0,legacyPoolLength:0},
  {id:'japanese',label:'日劇',origin:'日本',pool:japaneseDramaPool,count:4,legacyCount:0,legacyPoolLength:0},
  {id:'taiwan',label:'台劇',origin:'台灣',pool:taiwanDramaPool,count:3,legacyCount:0,legacyPoolLength:0},
  {id:'western',label:'歐美劇',origin:'歐美',pool:westernDramaPool,count:3,legacyCount:0,legacyPoolLength:0},
  {id:'chinese',label:'內地劇',origin:'內地',pool:chineseDramaPool,count:3,legacyCount:0,legacyPoolLength:0}
];
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const randomInt = (min,max,rng=Math.random) => min + Math.floor(rng() * (max-min+1));
export const quarterLabel = n => `${2028+Math.floor(n/4)} Q${n%4+1}`;
export const money = n => `${n < 0 ? '−' : ''}$${(Math.abs(n)/1_000_000).toFixed(1)}m`;
export const preciseMoney = n => n>=1_000_000?money(n):`$${Math.round(n/1_000).toLocaleString()}k`;
export const exactKey = (genre,themes) => `${genre}|${[...themes].sort().join('+')}`;

export function compatibility(genre, themes) {
  if (themes.length === 2 && genre === '處境劇' && themes.includes('恐怖') && themes.includes('愛情')) return 'x';
  const tiers = themes.map(theme => synergy[genre]?.[theme] ?? 'o');
  if (tiers.includes('x')) return 'x';
  return tiers.includes('double-o') ? 'double-o' : 'o';
}

export function catalogForQuarter(quarter) {
  const rotation=ACQUISITION_GROUPS.flatMap(group=>{
    const offers=[],used=new Set();
    const add=(n,id)=>{
      const [title,subcategory,cost,quality,rating,buzz,packageEpisodes,poolOrigin]=group.pool[n];
      // Package lengths are game rules, not claims about the original release.
      const episodes=packageEpisodes??{film:1,series:20,variety:12,documentary:6,information:12,politics:12,korean:16,japanese:10,taiwan:12,western:10,chinese:30}[group.id]??12;
      const origin=poolOrigin??group.origin??'香港';
      const network=group.id==='series'?(title.startsWith('瑪嘉烈與大衛')?'ViuTV':'TVB'):
        group.id==='korean'?'外購韓劇':
        group.id==='japanese'?'外購日劇':
        group.id==='taiwan'?'外購台劇':
        group.id==='western'?'外購歐美劇':
        group.id==='chinese'?'外購內地劇':
        group.id==='variety'?(['全民造星','全民造星IV','囝囝女女730'].includes(title)?'ViuTV':'TVB'):
        group.id==='information'&&['東張西望','南美潮什麼 2'].includes(title)?'TVB':'其他';
      offers.push({id,title,category:group.label,subcategory,group:group.id,cost,quality,rating,buzz,episodes,network,origin});
      used.add(n);
    };
    // Preserve the old eight offer IDs and titles in existing saves.
    const legacyStep=group.legacyPoolLength%3===0?5:3;
    for(let i=0;i<group.legacyCount;i++) add((quarter*legacyStep+i*5)%group.legacyPoolLength,`catalog-${quarter}-${group.id}-${i}`);
    let n=(group.legacyPoolLength+quarter*(group.count-group.legacyCount))%group.pool.length;
    while(offers.length<group.count){
      if(!used.has(n)) add(n,`catalog-v2-${quarter}-${group.id}-${n}`);
      n=(n+1)%group.pool.length;
    }
    return offers;
  });
  return [...VIU_ORIGINALS, ...rotation];
}

// Each 30-day broadcast month gets its own rotating offers. Keep permanent
// ViuTV catalogue IDs stable so earlier purchases and saved rights remain valid.
export function catalogForMonth(day) {
  const month=marketMonthForDay(day);
  return catalogForQuarter(month).map(item=>item.id.startsWith('viu-original-')?item:{
    ...item,
    id:month===0?item.id:`market-${month}-${item.id}`,
    marketMonth:month
  });
}

const rivalPremierePools={
  city:[['都會追兇','刑偵劇',84],['豪門暗戰','商戰劇',82],['醫院前線','醫療劇',80],['明日審判','律政劇',86],['深宮密令','古裝劇',83],['海港風雲','年代劇',81]],
  local:[['街市一家親','處境劇',70],['港島夜行','都市劇',73],['新手爸爸','家庭劇',72],['鄰里食堂','飲食綜藝',69],['午夜談心','清談節目',74],['城市新聲','音樂節目',71]]
};
export function rivalPremiere(rival,day) {
  const month=marketMonthForDay(day),pool=rivalPremierePools[rival.id]??rivalPremierePools.local;
  const [title,genre,rating]=pool[month%pool.length];
  return {title,genre,rating,month,slot:'19:00–21:00'};
}

export function currentEvent(state) {
  const upcoming = state.events.find(e => !e.resolved && e.quarter >= state.quarter && e.quarter-state.quarter <= 2);
  return upcoming ?? null;
}

function ensureEvents(state) {
  const upcoming = [
    { quarter:2, name:'2028 奧運會', floor:8_000_000, adTarget:11_000_000, id:'games-2028' },
    { quarter:10, name:'2030 世界盃', floor:10_000_000, adTarget:13_000_000, id:'football-2030' },
    { quarter:18, name:'2032 奧運會', floor:11_000_000, adTarget:14_000_000, id:'games-2032' },
    { quarter:26, name:'2034 世界盃', floor:12_000_000, adTarget:16_000_000, id:'football-2034' }
  ];
  for (const ev of upcoming) if (!state.events.some(e=>e.id===ev.id)) state.events.push(new BiddingEvent(ev));
  // After 2034, the same two event types recur every four years.
  const last = state.events.at(-1);
  if (last && state.quarter >= last.quarter-2) {
    const q=last.quarter+8, football=last.id.startsWith('games');
    const year=2028+Math.floor(q/4);
    state.events.push(new BiddingEvent({id:`${football?'football':'games'}-${year}`,name:`${year} ${football?'世界盃':'奧運會'}`,quarter:q,floor:last.floor+1_000_000,adTarget:last.adTarget+1_000_000}));
  }
}

export function refreshMarketRivalBuys(state, rng = Math.random) {
  state.rivalPurchases ??= [];
  state.rivalPurchases = state.rivalPurchases.filter(r => r.expiresDay > state.day);
  const currentMonth = marketMonthForDay(state.day);
  const activeThisMonth = state.rivalPurchases.filter(r => r.marketMonth === currentMonth);
  if (activeThisMonth.length >= 2) return state.rivalPurchases;

  const currentListings = catalogForMonth(state.day);
  const ownedTitles = new Set(state.library.map(p => p.title));
  const rivalOwnedTitles = new Set(state.rivalPurchases.map(r => r.title));

  const candidates = currentListings.filter(item =>
    !item.id.startsWith('viu-original-') &&
    ['korean', 'japanese', 'taiwan', 'western', 'chinese'].includes(item.group) &&
    !ownedTitles.has(item.title) &&
    !rivalOwnedTitles.has(item.title)
  );

  if (!candidates.length) return state.rivalPurchases;

  // City TV buys 1 blockbuster
  const cityExisting = state.rivalPurchases.find(r => r.rivalId === 'city' && r.marketMonth === currentMonth);
  if (!cityExisting) {
    const cityCandidates = [...candidates].sort((a, b) => (b.rating + b.buzz) - (a.rating + a.buzz));
    const cityPick = cityCandidates[0];
    if (cityPick) {
      const buyRecord = {
        id: `rival-buy-${state.day}-${cityPick.id}`,
        marketItemId: cityPick.id,
        marketMonth: currentMonth,
        title: cityPick.title,
        rivalId: 'city',
        rivalName: '全城電視',
        origin: cityPick.origin || '外購',
        category: cityPick.category,
        rating: cityPick.rating,
        cost: cityPick.cost,
        startDay: state.day,
        expiresDay: (currentMonth + 1) * DAYS_PER_MARKET_MONTH + 1
      };
      state.rivalPurchases.push(buyRecord);
      rivalOwnedTitles.add(cityPick.title);
      note(state, `【對手動向】全城電視豪擲 ${money(cityPick.cost)} 搶購${cityPick.origin}話題作《${cityPick.title}》獨家播映權！`, 'neutral');
    }
  }

  // Local 8 buys 1 distinctive/charming title
  const localExisting = state.rivalPurchases.find(r => r.rivalId === 'local' && r.marketMonth === currentMonth);
  if (!localExisting) {
    const localCandidates = candidates.filter(c => !rivalOwnedTitles.has(c.title));
    const preferred = localCandidates.filter(c => ['日本', '台灣'].includes(c.origin));
    const pool = preferred.length ? preferred : localCandidates;
    const localPick = pool[Math.floor(rng() * pool.length)];
    if (localPick) {
      const buyRecord = {
        id: `rival-buy-${state.day}-${localPick.id}`,
        marketItemId: localPick.id,
        marketMonth: currentMonth,
        title: localPick.title,
        rivalId: 'local',
        rivalName: '本地八台',
        origin: localPick.origin || '外購',
        category: localPick.category,
        rating: localPick.rating,
        cost: localPick.cost,
        startDay: state.day,
        expiresDay: (currentMonth + 1) * DAYS_PER_MARKET_MONTH + 1
      };
      state.rivalPurchases.push(buyRecord);
      note(state, `【對手動向】本地八台以 ${money(localPick.cost)} 買入${localPick.origin}口碑作《${localPick.title}》播映權！`, 'neutral');
    }
  }

  return state.rivalPurchases;
}

export function newGame() {
  const state = new StationState();
  for (const actor of ACTORS) state.talent[actor.id]={fame:actor.skill-10,fee:actor.fee};
  ensureEvents(state);
  refreshMarketRivalBuys(state, () => 0.5);
  return state;
}

export function productionQuote(state,{kind='drama',actorIds=[],budgetId='standard',episodeHours=2,episodeCount=8,styleId='mainstream',hookId='none'}) {
  const format=CONTENT_TYPES.find(item=>item.id===kind),budget=BUDGETS.find(item=>item.id===budgetId),style=PRODUCTION_STYLES.find(item=>item.id===styleId),hook=PRODUCTION_HOOKS.find(item=>item.id===hookId);
  if (!format||!budget||!style||!hook||!Number.isInteger(episodeHours)||episodeHours<1||episodeHours>4||!isDailyFormat(kind)&&!isOneOffEvent(kind)&&(!Number.isInteger(episodeCount)||!EPISODE_COUNTS.includes(episodeCount))) throw Error('請選擇有效嘅每集時長、集數、製作預算同拍攝方向。');
  const cast=kind==='drama'?actorIds.map(id=>ACTORS.find(actor=>actor.id===id)):[];
  if (cast.some(actor=>!actor)||new Set(actorIds).size!==actorIds.length) throw Error('演員名單有誤。');
  const perEpisode=Math.round(budget.cost*(kind==='drama'?1:format.factor)*(1+(episodeHours-1)*.45)*style.factor/1_000)*1_000;
  const fees=cast.reduce((sum,actor)=>sum+(state.talent[actor.id]?.fee??actor.fee),0);
  const episodes=isDailyFormat(kind)?0:isOneOffEvent(kind)?1:episodeCount;
  return {perEpisode,episodes,fees,total:perEpisode*(episodes||1)+fees+hook.cost,style,budget,cast,hook};
}

export function rivalAtHour(state,rival,hour,day=state.day) {
  const block=rival.schedule.find(item=>hoursInBlock(item).includes(hour));
  if (!block) return null;
  const premiere=hour>=19&&hour<21?rivalPremiere(rival,day):null;
  const deal=hour>=21&&hour<23?(state.distributionDeals??[]).find(item=>item.rivalId===rival.id&&item.startDay<=day&&day<item.expiresDay):null;
  const rivalMarketBuy=hour>=21&&hour<23&&!deal?(state.rivalPurchases??[]).find(item=>item.rivalId===rival.id&&item.startDay<=day&&day<item.expiresDay):null;
  const title=deal?.title??rivalMarketBuy?.title??premiere?.title??block.rotation?.[state.quarter%block.rotation.length]??block.title;
  const wave=(day*11+hour*3+(rival.id==='city'?0:2))%7-3;
  const base=deal?.rating??(rivalMarketBuy?rivalMarketBuy.rating+2:null)??premiere?.rating??block.rating;
  let eventMod = 0;
  if (state.breakingEvent) {
    if (state.breakingEvent.ratingMods?.all) eventMod += Math.round(state.breakingEvent.ratingMods.all * 0.5);
    if ((hour === 17 || hour === 18) && state.breakingEvent.ratingMods?.kinds?.news) eventMod += Math.round(state.breakingEvent.ratingMods.kinds.news * 0.5);
    if (hour >= 9 && hour <= 10 && state.breakingEvent.ratingMods?.kinds?.finance) eventMod += Math.round(state.breakingEvent.ratingMods.kinds.finance * 0.5);
  }
  return {title,rating:clamp(base+wave+Math.min(state.quarter%3,2)+eventMod,1,98),block,rivalMarketBuy};
}

export function distributionQuote(program,exclusive=false) {
  if(!program || program.id.startsWith('start-') || program.kind==='catalog') throw Error('只有你親自拍攝嘅作品先可以賣埠。');
  if(isDailyFormat(program.kind) && !program.episodes) throw Error('每日新聞同財經係持續製作，冇完整劇集可以賣埠。');
  if(program.soldExclusive) throw Error('呢套節目已經獨家賣斷。');
  const value=(program.episodes||12)*55_000+program.quality*7_000+program.buzz*3_000;
  return Math.round(value*(exclusive?1.35:.55)/10_000)*10_000;
}
export function sellProduction(state,programId,rivalId,exclusive=false) {
  const program=state.library.find(item=>item.id===programId);
  const rival=state.rivals.find(item=>item.id===rivalId);
  if(!rival) throw Error('請揀有效嘅買家電視台。');
  const amount=distributionQuote(program,exclusive);
  state.distributionDeals??=[];
  if(state.distributionDeals.some(item=>item.programId===programId && item.rivalId===rivalId)) throw Error('呢間台已經買咗呢套節目，不能重複賣。');
  if(exclusive && state.distributionDeals.some(item=>item.programId===programId)) throw Error('節目已有其他台播映授權，不能再獨家賣斷。');
  const deal={programId,title:program.title,rivalId,startDay:state.day,expiresDay:state.day+30,exclusive,amount,rating:clamp(program.rating+4,1,98)};
  state.distributionDeals.push(deal);
  state.cash+=amount;
  if(exclusive){program.soldExclusive=true;state.schedule=state.schedule.filter(item=>item.programId!==programId);}
  note(state,`《${program.title}》${exclusive?'獨家賣斷':'聯播授權'}畀${rival.name}，收取 ${money(amount)}；對方未來 30 日晚間播出。`,'good');
  return deal;
}

function note(state,text,type='neutral') {
  state.log.unshift({quarter:state.quarter,text,type});
  state.log = state.log.slice(0,16);
}

export function produce(state,{kind='drama',genre,themes=[],actorIds=[],topic='',budgetId,episodeHours=2,episodeCount=8,styleId='mainstream',hookId='none'},rng=Math.random) {
  const format=CONTENT_TYPES.find(item=>item.id===kind), budget=BUDGETS.find(item=>item.id===budgetId);
  if (!format || !budget) throw Error('請揀節目類型同製作預算。');
  const quote=productionQuote(state,{kind,actorIds,budgetId,episodeHours,episodeCount,styleId,hookId});
  const {style}=quote;
  let cast=[],cost=quote.total,raw,tier='o',key='';
  if (kind==='drama') {
    if (!GENRES.includes(genre) || !Array.isArray(themes) || themes.length<1 || themes.length>2 || new Set(themes).size!==themes.length || !themes.every(t=>THEMES.includes(t))) throw Error('請選擇劇種同一至兩個不同題材。');
    if (!Array.isArray(actorIds) || actorIds.length<2 || actorIds.length>4 || new Set(actorIds).size!==actorIds.length) throw Error('一套劇必須揀 2 至 4 位不同主演。');
    cast=quote.cast;
    tier=compatibility(genre,themes); key=exactKey(genre,themes);
    const average=cast.reduce((sum,actor)=>sum+actor.skill,0)/cast.length;
    const fame=cast.reduce((sum,actor)=>sum+(state.talent[actor.id]?.fame??actor.skill-10),0)/cast.length;
    const matches=cast.filter(actor=>actor.specialty===genre||themes.includes(actor.specialty)).length;
    raw=clamp(Math.round(42+average*.25+budget.bonus+matches*2+(cast.length-2)*2+(fame-70)*.08+style.quality-(episodeHours-1)*Math.max(2,6-budget.bonus/4)-(episodeCount===20?3:0)+randomInt(-5,5,rng)),25,92);
  } else {
    if (!format.topics.includes(topic)) throw Error('請選擇節目內容方向。');
    raw=clamp(Math.round(52+budget.bonus*1.25+format.appeal+style.quality-(episodeHours-1)*Math.max(2,6-budget.bonus/4)-(episodeCount===20&&!isDailyFormat(kind)?3:0)+randomInt(-6,6,rng)),35,89);
  }
  if (state.cash<cost) throw Error('現金不足，未能開拍。');
  let quality, review, rating, buzz, outcome='standard', roll=null;
  if (kind!=='drama') {
    quality=clamp(Math.round(raw*1.08),35,95);
    review=clamp(quality+randomInt(-6,6,rng),20,100);
    rating=clamp(Math.round(quality*.7+format.appeal+style.rating+randomInt(-5,7,rng)),15,90);
    buzz=clamp(Math.round(quality*.65+(kind==='variety'?12:isOneOffEvent(kind)?16:kind==='social'||kind==='politics'?7:0)+style.buzz+randomInt(-3,7,rng)),10,100);
    note(state,`${format.label}節目完成：${topic}，品質 ${quality}。`,'good');
  } else if (tier==='x') {
    roll=randomInt(1,100,rng);
    const cooled=(state.cooldowns[key]??-1)>=state.quarter;
    if (roll>(cooled?99:90)) {
      outcome='cult'; quality=randomInt(75,85,rng);
      review=clamp(quality-12,55,78);
      const baseBuzz=clamp(Math.round(raw*.7+style.buzz+randomInt(4,12,rng)),10,100);
      buzz=baseBuzz*4; // +300% of the base buzz, not 300% of its final value.
      rating=clamp(Math.round(43+randomInt(-5,8,rng)),30,60);
      state.cooldowns[key]=state.quarter+4;
      if (!state.achievements.includes('Cult 片逆襲')) state.achievements.push('Cult 片逆襲');
      if (!state.sponsors.includes('午夜異想特約贊助')) state.sponsors.push('午夜異想特約贊助');
      state.cash+=1_800_000;
      note(state,`《${genre}：${themes.join('與')}》爆成 Cult 劇！話題度 +300%，特約贊助進帳 $1.8m。`,'good');
    } else {
      outcome='disaster'; quality=clamp(Math.round(raw*.4),0,100);
      review=clamp(quality-randomInt(8,18,rng),0,30);
      rating=clamp(Math.round(raw*.68/2),5,45);
      buzz=clamp(Math.round(raw*.3),4,40);
      state.reputation=clamp(state.reputation-6,0,100);
      note(state,`《${genre}：${themes.join('與')}》播出前已經劣評如潮，廣告商要求減價。`,'bad');
    }
  } else {
    quality=clamp(Math.round(raw*(tier==='double-o'?1.3:1.1)),tier==='double-o'?75:0,100);
    review=clamp(quality+randomInt(-5,5,rng),tier==='double-o'?75:0,100);
    rating=clamp(Math.round(quality*.72+style.rating+randomInt(2,12,rng)),10,95);
    buzz=clamp(Math.round(quality*.72+style.buzz+randomInt(0,12,rng)),5,100);
    note(state,`新劇開拍完成：${tier==='double-o'?'完美相性 ◎':'良好相性 O'}，品質 ${quality}。`,'good');
  }
  const hook=quote.hook;
  let filmingStory='';
  if(kind==='contest'&&rng()<.12){rating=clamp(rating+8,1,100);buzz=clamp(buzz+15,1,100);filmingStory='決賽黑馬殺出，現場觀眾起立歡呼。';}
  if(kind==='pageant'&&rng()<.15){rating=clamp(rating-6,1,100);review=clamp(review-8,0,100);buzz=clamp(buzz+12,1,100);filmingStory='賽前評審風波上頭條，話題升溫但口碑受損。';}
  if(hook.id==='stunt'){
    const success=rng()<.58;
    filmingStory+=success?' 特技拍攝一 take 過，現場觀眾拍片瘋傳。':' 特技拍攝遇上意外，要臨時剪走一場重頭戲。';
    quality=clamp(quality+(success?7:-8),0,100);
    rating=clamp(rating+(success?5:-5),1,100);
  }else if(hook.id!=='none') filmingStory+=hook.id==='location'?' 實景拍攝令場面更有香港味。':' 現場觀眾投票改動咗一場關鍵戲。';
  quality=clamp(quality+hook.quality,0,100);
  review=clamp(review+hook.quality,0,100);
  rating=clamp(rating+hook.rating,1,100);
  buzz=clamp(buzz+hook.buzz,1,400);
  const fulfilled=state.audienceBrief && topic===state.audienceBrief;
  if(fulfilled){rating=clamp(rating+6,1,100);buzz=clamp(buzz+8,1,400);state.audienceBrief=null;note(state,`觀眾點名想睇「${topic}」，新節目回應咗來信，預測收視 +6。`,'good');}
  if(state.giftBoost){quality=clamp(quality+state.giftBoost,0,100);review=clamp(review+state.giftBoost,0,100);note(state,'觀眾寄來嘅道具用咗喺新節目，品質提升。','good');state.giftBoost=0;}
  state.cash-=cost;
  state.productionCount++;
  const id=`${kind}-${state.quarter}-${state.library.length}`;
  const dramaTitles={'刑偵':'疑案檔案','處境劇':'街坊日常','宮鬥':'深宮往事','科幻':'明日之城','歷史':'舊日風雲','青春':'我們的夏天','律政':'法庭內外','醫療':'急症線','家庭':'屋企有人','商戰':'交易遊戲','武俠':'江湖路','奇幻':'平行之門','社會寫實':'城市邊緣'};
  const typeTitles={variety:`${topic}大舞台`,night:`${topic}夜線`,news:`${topic}新聞`,finance:`${topic}財經`,information:`${topic}生活誌`,politics:`${topic}對話`,social:`${topic}觀察`,charity:topic,contest:topic,pageant:topic};
  const title=kind==='drama'?(outcome==='cult'?'奇妙的錯配':outcome==='disaster'?'意外現場':dramaTitles[genre]):typeTitles[kind];
  const program=new Program({id,title:`${title} ${state.library.length}`,kind,quality,review,rating,buzz,cost,genre:kind==='drama'?genre:'',themes:kind==='drama'?themes:[],cast:cast.map(actor=>actor.name),castIds:cast.map(actor=>actor.id),topic:kind==='drama'?'':topic,category:format.label,tier,outcome,episodes:quote.episodes,episodeHours,episodeCost:quote.perEpisode,style:style.label});
  program.filmingStory=filmingStory;
  state.library.push(program);
  state.lastProduction={...program,roll,cooldownUntil:state.cooldowns[key]??null};
  return program;
}

export const LICENSE_TERMS = [{days:180,label:'6 個月',factor:1},{days:360,label:'1 年',factor:1.7}];
export const licensePrice = (baseCost,days) => {
  const term=LICENSE_TERMS.find(item=>item.days===days);
  if(!term) throw Error('請選擇 6 個月或 1 年播映權。');
  return Math.round(baseCost*term.factor/1_000)*1_000;
};
export const licenseExpired = (program,day) => program?.kind==='catalog' && Number.isInteger(program.licenseExpiresDay) && day>=program.licenseExpiresDay;
export const isExhausted = program => {
  if (!program || program.kind === 'catalog' || !program.episodes) return false;
  const limit = (Number.isInteger(program.replayCount) && program.replayCount > 0 && Number.isInteger(program.replayEndRuns))
    ? program.replayEndRuns
    : program.episodes;
  return program.runs >= limit;
};

export function canReplayProgram(program, day) {
  if (!program || !program.episodes) return false;
  if (program.kind === 'catalog') {
    return isCatalogCycleComplete(program) && !licenseExpired(program, day);
  }
  return isExhausted(program);
}

export function getFreshnessFactor(program) {
  if (!program) return 1;
  const f = Number.isInteger(program.freshness) ? program.freshness : 100;
  return Math.round((0.45 + (f / 100) * 0.55) * 100) / 100;
}

export function freshnessLabel(freshness, maxFreshness = 100) {
  const f = Math.round(Number.isInteger(freshness) ? freshness : 100);
  const max = Math.round(Number.isInteger(maxFreshness) ? maxFreshness : 100);
  if (f >= 90) return { percent: f, max, text: '極具新鮮感', icon: '🔥', tier: 'high', desc: '首播熱門 · 收視全開' };
  if (f >= 75) return { percent: f, max, text: '回溫良好', icon: '✨', tier: 'good', desc: '經典重溫 · 觀眾期待' };
  if (f >= 50) return { percent: f, max, text: '平穩普通', icon: '☕', tier: 'medium', desc: '尚有口碑 · 收視正常' };
  return { percent: f, max, text: '冷卻沉澱中', icon: '❄️', tier: 'low', desc: '剛播畢不久 · 建議冷卻回溫' };
}

export const isCatalogCycleComplete = program => {
  if (!program || program.kind !== 'catalog' || !program.episodes) return false;
  const limit = (Number.isInteger(program.replayCount) && program.replayCount > 0 && Number.isInteger(program.replayEndRuns))
    ? program.replayEndRuns
    : program.episodes;
  return program.runs >= limit;
};
export function catalogCycleProgress(program) {
  const total=Number.isInteger(program?.episodes)&&program.episodes>0?program.episodes:0;
  const runs=Number.isInteger(program?.runs)&&program.runs>0?program.runs:0;
  const start=Number.isInteger(program?.replayStartRuns)&&program.replayStartRuns>=0?Math.min(runs,program.replayStartRuns):0;
  const aired=Math.min(total,Math.max(0,runs-start));
  return {aired,total,remaining:total-aired};
}
export function catalogCompletedAirings(program) {
  const total=Number.isInteger(program?.episodes)&&program.episodes>0?program.episodes:0;
  const runs=Number.isInteger(program?.runs)&&program.runs>0?program.runs:0;
  return total?Math.floor(runs/total):0;
}
export const isUnavailable = (program,day) => !program || Boolean(program.soldExclusive) || isExhausted(program) || isCatalogCycleComplete(program) || licenseExpired(program,day);
export function migrateLegacyLicenses(state) {
  if(!Number.isInteger(state.liveMinute)||state.liveMinute<0||state.liveMinute>1440)state.liveMinute=0;
  state.distributionDeals??=[];
  state.audienceFeed??=[];
  state.mailbox??=[];
  state.audienceBrief??=null;
  state.giftBoost??=0;
  state.pendingPremieres??=[];
  state.premiereHistory??=[];
  state.broadcastReports??=[];
  state.charityRaised??=0;
  state.breakingEvent??=null;
  state.breakingEventsHistory??=[];
  state.monthBroadcastLog??=[];
  state.monthlyLeaderboards??=[];
  state.lastMonthResult??=null;
  state.pendingCeremony??=null;
  state.awardCeremonies??=[];
  state.viralShowBoost??=null;
  state.rivalPurchases??=[];
  // Old saves had no term. Grant a fresh six-month window without changing cash or runs.
  for (const program of state.library) if (program.kind==='catalog') {
    if (!Number.isInteger(program.licenseExpiresDay)) {
      program.licenseDays=180;
      program.licenseStartDay=state.day;
      program.licenseExpiresDay=state.day+180;
      program.licenseBaseCost=program.id==='start-film'?1_150_000:(program.cost??0);
    }
    if (state.day >= program.licenseExpiresDay) {
      program.licenseExpiredHandled = true;
    }
    if(program.id==='start-film' && !program.licenseBaseCost) program.licenseBaseCost=1_150_000;
    if (program.episodes > 0) {
      const hasActiveManualReplay = Number.isInteger(program.replayCount) && program.replayCount > 0 && Number.isInteger(program.replayEndRuns) && program.runs < program.replayEndRuns;
      if (!hasActiveManualReplay && program.runs >= program.episodes) {
        program.replayEndRuns = null;
        state.schedule = state.schedule.filter(block => block.programId !== program.id);
      }
    }
  }
  for (const program of state.library) {
    program.completedRuns ??= Number.isInteger(program.replayCount) && program.replayCount > 0 ? program.replayCount : (program.runs && program.episodes ? Math.floor(program.runs / program.episodes) : 0);
    program.maxFreshness ??= Math.max(50, Math.round(100 * Math.pow(0.80, program.completedRuns)));
    program.freshness ??= program.runs > 0 && (isExhausted(program) || isCatalogCycleComplete(program))
      ? Math.max(15, Math.round(program.maxFreshness * 0.28))
      : program.maxFreshness;
    program.lastAiredDay ??= null;
  }
  clearCompletedPrograms(state);
  return state;
}
const premiereProfiles={
  drama:{label:'劇集首播',symbol:'★',spotlight:'加拍預告片',improve:'重剪下一集',hook:'劇情懸念成為街坊話題'},
  variety:{label:'綜藝開台',symbol:'✦',spotlight:'安排街頭宣傳',improve:'調整遊戲環節',hook:'現場笑聲帶動社交討論'},
  night:{label:'深夜首播',symbol:'☾',spotlight:'邀請深夜嘉賓',improve:'重整訪談節奏',hook:'夜貓觀眾開始口耳相傳'},
  news:{label:'新聞首播',symbol:'◆',spotlight:'加強突發採訪',improve:'增設事實核查',hook:'觀眾開始留意我台新聞'},
  finance:{label:'財經開市',symbol:'↗',spotlight:'邀請市場專家',improve:'改善數據圖表',hook:'投資觀眾分享開市分析'},
  catalog:{label:'外購節目登場',symbol:'▣',spotlight:'買黃金時段廣告',improve:'製作本地導賞',hook:'觀眾重新發現呢套作品'},
  charity:{label:'慈善夜直播',symbol:'♥',spotlight:'邀請更多善心嘉賓',improve:'改善籌款環節',hook:'善款同口碑都要靠觀眾支持'},
  contest:{label:'才藝決賽',symbol:'✪',spotlight:'推介決賽黑馬',improve:'調整賽制與剪接',hook:'參賽者表現牽動全城討論'},
  pageant:{label:'選美之夜',symbol:'♛',spotlight:'宣傳佳麗故事',improve:'修正評審安排',hook:'佳麗與評審爭奪觀眾焦點'}
};
export function premiereProfile(kind){return premiereProfiles[kind]??{label:'新節目首播',symbol:'●',spotlight:'加強宣傳',improve:'聽取觀眾意見',hook:'新節目引起討論'};}
export function resolvePremiere(state,choice){
  const premiere=state.pendingPremieres?.[0];
  if(!premiere) throw Error('目前冇等待處理嘅首播。');
  if(!['spotlight','improve','steady'].includes(choice)) throw Error('請選擇有效嘅首播決定。');
  const program=state.library.find(item=>item.id===premiere.programId);
  if(!program) throw Error('首播節目已從片庫移除。');
  const cost=choice==='spotlight'?120_000:choice==='improve'?70_000:0;
  if(state.cash<cost) throw Error(`需要 ${preciseMoney(cost)}，現金不足。`);
  state.cash-=cost;
  if(choice==='spotlight') {
    program.rating=clamp(program.rating+3+(program.kind==='night'&&premiere.start>=22?2:0),1,100);
    program.buzz=clamp(program.buzz+8,0,100);
    state.fans=clamp(state.fans+(program.kind==='variety'?3:1),0,100);
  }
  else if(choice==='improve') {
    program.quality=clamp(program.quality+3,1,100);
    program.review=clamp(program.review+4+(program.kind==='drama'?2:0),1,100);
    program.rating=clamp(program.rating+2,1,100);
    state.reputation=clamp(state.reputation+(program.kind==='news'||program.kind==='finance'?3:1),0,100);
  }
  else {state.reputation=clamp(state.reputation+1,0,100);if(premiere.won)state.fans=clamp(state.fans+1,0,100);}
  const settled={...premiere,choice,cost,resolvedDay:state.day};
  state.pendingPremieres.shift();
  state.premiereHistory??=[];state.premiereHistory.unshift(settled);state.premiereHistory=state.premiereHistory.slice(0,20);
  note(state,`《${program.title}》首播後選擇${choice==='spotlight'?'加碼宣傳':choice==='improve'?'改善內容':'維持節奏'}；預測收視現為 ${program.rating}。`,'good');
  return settled;
}
export function replyToLetter(state,id,choiceId=null) {
  const letter=(state.mailbox??[]).find(item=>item.id===id);
  if(!letter||letter.resolved) throw Error('呢封來信已處理。');
  if(letter.options&&letter.options.length){
    const choice=letter.options.find(opt=>opt.id===(choiceId??letter.options[0].id))??letter.options[0];
    const cost=choice.cost??0;
    if(cost>0&&state.cash<cost) throw Error(`需要 ${preciseMoney(cost)}，現金不足。`);
    state.cash-=cost;
    if(choice.effects){
      if(choice.effects.cash) state.cash+=choice.effects.cash;
      if(choice.effects.reputation) state.reputation=clamp(state.reputation+choice.effects.reputation,0,100);
      if(choice.effects.fans) state.fans=clamp(state.fans+choice.effects.fans,0,100);
      if(choice.effects.audienceBrief) state.audienceBrief=choice.effects.audienceBrief;
      if(choice.effects.giftBoost) state.giftBoost=(state.giftBoost??0)+choice.effects.giftBoost;
      if(choice.effects.actorId&&choice.effects.fame&&state.talent[choice.effects.actorId]){
        state.talent[choice.effects.actorId].fame=clamp(state.talent[choice.effects.actorId].fame+choice.effects.fame,15,100);
      }
    }
    letter.resolved=true;
    letter.resolvedChoice=choice.id;
    note(state,choice.feedback,choice.tone??'good');
    return letter;
  }
  if(letter.type==='request'){
    state.audienceBrief=letter.topic;
    note(state,`答應觀眾：下一套「${letter.topic}」節目會有收視加成。`,'good');
  }else if(letter.type==='gift'){
    state.giftBoost=(state.giftBoost??0)+3;
    note(state,'已收下觀眾寄嚟嘅拍攝道具；下一套節目品質 +3。','good');
  }else{
    const cost=50_000;
    if(state.cash<cost) throw Error('公關回信需要 $50k，現金不足。');
    state.cash-=cost;state.reputation=clamp(state.reputation+2,0,100);
    note(state,'回覆批評及改善承諾，花費 $50k，口碑 +2。','good');
  }
  letter.resolved=true;
  return letter;
}
export function buyProgram(state,item,days=180) {
  const listing=catalogForMonth(state.day).find(i=>i.id===item);
  if (!listing) throw Error('本月片單已經更新，請重新揀節目。');
  if (state.library.some(p=>p.id===item)) throw Error('呢套節目已經入庫。');
  const rivalBuy = (state.rivalPurchases ?? []).find(r => r.marketItemId === item && r.expiresDay > state.day);
  if (rivalBuy) throw Error(`《${listing.title}》已被${rivalBuy.rivalName}搶先獨家買入，本月無法購買！`);
  const cost=licensePrice(listing.cost,days);
  if (state.cash<cost) throw Error('現金不足，未能購入版權。');
  state.cash-=cost;
  const program=new Program({...listing,kind:'catalog',cost,licenseBaseCost:listing.cost,licenseDays:days,licenseStartDay:state.day,licenseExpiresDay:state.day+days,licenseExpiredHandled:false});
  state.library.push(program);
  note(state,`購入《${listing.title}》${days===180?'6 個月':'1 年'}播映權，花費 ${money(cost)}。`);
  return program;
}
export function renewLicense(state,programId,days=180) {
  const program=state.library.find(item=>item.id===programId && item.kind==='catalog');
  if (!program) throw Error('片庫搵唔到呢套外購節目。');
  if (!licenseExpired(program,state.day)) throw Error('版權仍然有效，到期後先可以續購。');
  const cost=licensePrice(program.licenseBaseCost??program.cost,days);
  if(state.cash<cost) throw Error('現金不足，未能續購版權。');
  state.cash-=cost;
  program.licenseDays=days;program.licenseStartDay=state.day;program.licenseExpiresDay=state.day+days;
  program.licenseExpiredHandled=false;
  note(state,`續購《${program.title}》${days===180?'6 個月':'1 年'}播映權，花費 ${money(cost)}。`);
  return program;
}

export function startProgramReplay(state,programId) {
  const program=state.library.find(item=>item.id===programId);
  if (!program || !program.episodes) throw Error('片庫搵唔到可重播嘅節目。');
  if (program.kind==='catalog' && licenseExpired(program,state.day)) throw Error('播映權已到期，請先續購。');
  if (program.kind==='catalog' && !isCatalogCycleComplete(program)) throw Error('本輪未播完，毋須開始新一輪。');
  if (program.kind!=='catalog' && !isExhausted(program)) throw Error('本輪未播完，毋須開始新一輪。');
  program.replayCount=(Number.isInteger(program.replayCount)&&program.replayCount>0?program.replayCount:Math.floor(Math.max(0,program.runs-1)/program.episodes))+1;
  program.replayStartRuns=program.runs;
  program.replayEndRuns=program.runs+program.episodes;
  const f = freshnessLabel(program.freshness, program.maxFreshness);
  const label = program.kind==='catalog' ? '外購節目' : '自製經典';
  note(state,`已同意${label}《${program.title}》重播第 ${program.replayCount} 輪（當前新鮮度 ${f.percent}%，上限 ${f.max}%）。請自行安排播映時段；系統唔會自動重排。`);
  return program;
}
export const startCatalogReplay = (state,programId) => startProgramReplay(state,programId);

export const hourLabel = hour => `${String(hour%24).padStart(2,'0')}:00`;
export const hoursInBlock = block => Array.from({length:block.duration},(_,i)=>(block.start+i)%24);
export function clearCompletedPrograms(state) {
  const finished=state.library.filter(p=>isUnavailable(p,state.day));
  if (finished.length) {
    const ids=new Set(finished.map(p=>p.id));
    state.schedule=state.schedule.filter(block=>!ids.has(block.programId));
  }
  return finished;
}
export const programAtHour = (state,hour,day=state.day) => state.schedule.find(block=>runsOnWeekday(block,weekdayForDay(day)) && hoursInBlock(block).includes(hour) && (block.programId.startsWith('event:') || !isUnavailable(state.library.find(p=>p.id===block.programId),day)));
export function episodeForBlock(state,block,day=state.day) {
  if (!block || block.programId.startsWith('event:')) return '';
  const program=state.library.find(item=>item.id===block.programId);
  if (!program) return '';
  if (!program.episodes) return '每日新一期';
  const weekday=weekdayForDay(day);
  const earlier=state.schedule.filter(item=>item!==block && item.programId===block.programId && item.start<block.start && runsOnWeekday(item,weekday)).length;
  const run=program.runs+earlier;
  const current=run-(program.replayStartRuns??0)+1;
  const replay=Number.isInteger(program.replayCount)&&program.replayCount>0?program.replayCount:0;
  if(program.kind==='catalog') {
    if(program.category==='香港電影') return `電影 · 第 ${run+1} 次播映${replay?` · 重映第 ${replay} 輪`:''}`;
    return `第 ${current} / ${program.episodes} 集${replay?` · 重播第 ${replay} 輪`:''}`;
  }
  if(isOneOffEvent(program.kind)) return '一晚限定直播';
  return `第 ${current} / ${program.episodes} 集${replay?` · 重溫第 ${replay} 輪`:''}`;
}

export function advanceBroadcastClock(state,minutes=1) {
  if(!Number.isInteger(minutes)||minutes<0)throw Error('模擬時鐘只接受正整數分鐘。');
  state.liveMinute=Math.min(1440,(state.liveMinute??0)+minutes);
  return state.liveMinute;
}

export function broadcastNow(state) {
  const minute=Math.min(1440,Math.max(0,state.liveMinute??0));
  if(minute===1440)return {clock:'24:00',hour:24,title:'今日節目播映完畢',episode:'按「播出今日」結算',block:null,finished:true};
  const hour=Math.floor(minute/60);
  const clock=`${String(hour).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
  const block=programAtHour(state,hour);
  const program=block && state.library.find(item=>item.id===block.programId);
  const event=block?.programId.startsWith('event:') && state.events.find(item=>`event:${item.id}`===block.programId);
  return {clock,hour,title:program?.title??event?.name??'未排節目',episode:episodeForBlock(state,block),block,finished:false};
}

export function duplicateBooking(state,start,programId,duration,days=EVERY_DAY) {
  return state.schedule.find(block=>block.programId===programId && block.start!==start && daysForBlock(block).some(day=>days.includes(day)))??null;
}

export function scheduleProgram(state,start,programId,duration,{days=EVERY_DAY,allowRepeat=false}={}) {
  if (!Number.isInteger(start) || start<0 || start>23 || !Number.isInteger(duration) || duration<1) throw Error('請選擇有效時間同長度。');
  if (!Array.isArray(days)||!days.length||new Set(days).size!==days.length||days.some(day=>!Number.isInteger(day)||day<0||day>6)) throw Error('請選擇有效嘅播出日子。');
  days=[...days].sort((a,b)=>a-b);
  const special=programId.startsWith('event:');
  if (special) {
    const event=state.events.find(e=>e.id===programId.slice(6) && e.quarter===state.quarter && e.resolved && e.winner==='你的電視台' && (state.day-1)%DAYS_PER_QUARTER<30);
    if (!event || duration>24) throw Error('大型賽事只可喺擁有轉播權嘅賽事季度排播，最長 24 小時。');
    if (days.length!==7) throw Error('大型賽事轉播需維持每日播映。');
  } else {
    const program=state.library.find(p=>p.id===programId);
    if (!program || duration>4) throw Error('普通節目只可連續佔用 1 至 4 小時。');
    if (program.soldExclusive) throw Error('呢套節目已獨家賣斷，不能喺我台排播。');
    if (licenseExpired(program,state.day)) throw Error('呢套節目嘅播映權已到期，請先續購。');
    if (isCatalogCycleComplete(program)) throw Error('呢套外購節目一輪已播完；請先喺片庫揀「重播一輪」。');
    if (isExhausted(program)) throw Error('呢套節目已經播完；請製作新節目。');
    if (program.episodeHours && duration!==program.episodeHours) throw Error(`呢套節目每集固定 ${program.episodeHours} 小時，請調整播映長度。`);
  }
  if (!allowRepeat && duplicateBooking(state,start,programId,duration,days)) throw Error('呢套節目已喺相同日子另一時段排播；如要同日重播，請明確選擇。');
  const next={start,duration,programId,days}, claimed=new Set(hoursInBlock(next));
  const removed=state.schedule.filter(block=>daysForBlock(block).some(day=>days.includes(day)) && hoursInBlock(block).some(hour=>claimed.has(hour)));
  state.schedule=state.schedule.flatMap(block=>{
    if(!removed.includes(block)) return [block];
    const remaining=daysForBlock(block).filter(day=>!days.includes(day));
    return remaining.length?[{...block,days:remaining}]:[];
  });
  state.schedule.push(next);
  state.schedule.sort((a,b)=>a.start-b.start);
  return removed;
}

export function removeScheduledProgram(state,start,{weekday=null,allDays=false}={}) {
  const block=state.schedule.find(item=>item.start===start && (weekday===null||runsOnWeekday(item,weekday)));
  if (!block) throw Error('呢個時段冇節目需要移除。');
  const remaining=weekday===null||allDays?[]:daysForBlock(block).filter(day=>day!==weekday);
  state.schedule=state.schedule.flatMap(item=>item===block?(remaining.length?[{...item,days:remaining}]:[]):[item]);
  return block;
}

export function submitBid(state,amount) {
  const event=currentEvent(state);
  if (!event || event.quarter-state.quarter<1) throw Error('目前沒有開放投標嘅體育賽事。');
  if (!Number.isFinite(amount) || amount<event.floor || amount>100_000_000 || amount%100_000!==0) throw Error(`出價須至少 ${money(event.floor)}，並以 $0.1m 遞增。`);
  const available=state.cash+(event.playerBid??0);
  if (amount>available) throw Error(`可用資金連同原有保證金共 ${money(available)}，唔夠支付新出價。`);
  state.cash=available-amount; // Full bid is held as a refundable guarantee.
  event.playerBid=amount;
  note(state,`已向《${event.name}》提交暗標 ${money(amount)}，全額保證金已凍結；開標前可修改。`);
}

function resolveAuction(state,event,rng) {
  if (event.resolved) return;
  // Rival profiles: large network bids high, regional network near floor,
  // niche channel bid erratically. Bids remain sealed until opening.
  const giant=Math.round(event.floor*(1.38+rng()*.38)/100_000)*100_000;
  const local=Math.round(event.floor*(1.06+rng()*.28)/100_000)*100_000;
  const niche=Math.round(event.floor*(.96+rng()*.55)/100_000)*100_000;
  const bids=[{name:'全城電視',amount:giant},{name:'本地八台',amount:local},{name:'視界台',amount:niche}];
  if (event.playerBid!==null) bids.push({name:'你的電視台',amount:event.playerBid});
  // Stable tie order favors the earlier submitted rival; player needs to beat a rival outright.
  const winner=bids.reduce((best,b)=>b.amount>best.amount?b:best,bids[0]);
  event.bids=bids; event.winner=winner.name; event.resolved=true;
  if (winner.name==='你的電視台') {
    event.replacedBlocks=scheduleProgram(state,18,`event:${event.id}`,8);
    note(state,`《${event.name}》中標！已預排 18:00 至 02:00 嘅大型賽事，可喺節目表調整；保證金 ${money(event.playerBid)} 轉作版權費。`,'good');
    if (!state.achievements.includes('體育版權首勝')) state.achievements.push('體育版權首勝');
  } else {
    if (event.playerBid!==null) state.cash+=event.playerBid;
    note(state,`《${event.name}》由 ${winner.name} 以 ${money(winner.amount)} 中標。你的保證金已退回。`,'neutral');
  }
}

function oneOffBroadcastEffect(state,program,rating,won) {
  if(program.kind==='charity'){
    const raised=Math.round((rating/100)**2*1_800_000/10_000)*10_000;
    const reputation=rating>=75?3:rating>=50?2:1;
    state.charityRaised=(state.charityRaised??0)+raised;
    state.reputation=clamp(state.reputation+reputation,0,100);
    return `募得善款 ${preciseMoney(raised)}（唔計入台現金）· 口碑 +${reputation}`;
  }
  if(program.kind==='contest'){
    const fans=won?3:1;
    state.fans=clamp(state.fans+fans,0,100);
    return `才藝冠軍誕生 · 熱度 +${fans}${won?'，搶贏對台':''}`;
  }
  if(program.kind==='pageant'){
    const fans=won?4:rating>=55?2:1;
    const reputation=rating>=75?2:rating<45?-1:0;
    state.fans=clamp(state.fans+fans,0,100);
    state.reputation=clamp(state.reputation+reputation,0,100);
    return `選美賽果揭曉 · 熱度 +${fans}${reputation?`、口碑 ${reputation>0?'+':''}${reputation}`:''}`;
  }
  return '';
}

export function evaluateMonthlyRatings(state, monthIndex) {
  state.monthBroadcastLog ??= [];
  const monthNum = monthIndex + 1;
  const showStats = new Map();
  for (const entry of state.monthBroadcastLog) {
    const key = `${entry.station}:${entry.title}`;
    const cur = showStats.get(key) ?? {
      title: entry.title,
      station: entry.station,
      kind: entry.kind,
      category: entry.category,
      peakRating: 0,
      totalRating: 0,
      count: 0
    };
    cur.peakRating = Math.max(cur.peakRating, entry.rating);
    cur.totalRating += entry.rating;
    cur.count++;
    showStats.set(key, cur);
  }
  const ranked = [...showStats.values()]
    .map(item => ({
      ...item,
      avgRating: Math.round(item.totalRating / item.count)
    }))
    .sort((a, b) => b.peakRating - a.peakRating || b.avgRating - a.avgRating);

  const champion = ranked[0] ?? {
    title: '暫無節目',
    station: '你的電視台',
    peakRating: 0,
    avgRating: 0,
    category: '節目'
  };

  const ourRanked = ranked.filter(item => item.station === '你的電視台');
  const ourBest = ourRanked[0] ?? champion;
  const ourBestRank = ranked.findIndex(item => item.station === '你的電視台' && item.title === ourBest.title) + 1;
  ourBest.rank = ourBestRank > 0 ? ourBestRank : 1;

  const top5 = ranked.slice(0, 5).map((item, idx) => ({ ...item, rank: idx + 1 }));
  const isOurWin = champion.station === '你的電視台';

  let bonusWon = false;
  if (isOurWin) {
    state.cash += 600_000;
    state.reputation = clamp(state.reputation + 2, 0, 100);
    state.fans = clamp(state.fans + 3, 0, 100);
    bonusWon = true;
    note(state, `【月結戰報】第 ${monthNum} 個月全港最高收視總冠軍：《${champion.title}》（收視 ${champion.peakRating} 分）！為我台勇奪月冠，獲廣告商花紅 $600k！`, 'good');
  } else {
    note(state, `【月結戰報】第 ${monthNum} 個月全港最高收視由${champion.station}《${champion.title}》（${champion.peakRating} 分）奪得；我台最高為《${ourBest.title}》（${ourBest.peakRating} 分，全月第 ${ourBest.rank} 名）。`, 'neutral');
  }

  const result = {
    month: monthNum,
    day: state.day,
    champion,
    top5,
    ourBest,
    isOurWin,
    bonusWon,
    isNew: true
  };

  state.lastMonthResult = result;
  state.monthlyLeaderboards ??= [];
  state.monthlyLeaderboards.unshift(result);
  state.monthlyLeaderboards = state.monthlyLeaderboards.slice(0, 12);
  state.monthBroadcastLog = [];
  return result;
}

export function dismissMonthResult(state) {
  if (state.lastMonthResult) {
    state.lastMonthResult.isNew = false;
  }
}

export function evaluateAnnualAwards(state, year, rng = Math.random) {
  const awards = [];
  let totalPrize = 0;
  let ourWins = 0;

  // 1. 年度最佳劇集
  const dramas = state.library.filter(p => p.kind === 'drama' && p.runs > 0);
  const bestOurDrama = [...dramas].sort((a, b) => (b.quality + b.review + b.rating) - (a.quality + a.review + a.rating))[0];
  const cityDramaScore = 78 + Math.floor(rng() * 10);
  const localDramaScore = 68 + Math.floor(rng() * 12);
  const ourDramaScore = bestOurDrama ? Math.round((bestOurDrama.quality * 0.4 + bestOurDrama.review * 0.3 + bestOurDrama.rating * 0.3)) : 50;

  let dramaWinner;
  if (bestOurDrama && ourDramaScore >= cityDramaScore && ourDramaScore >= localDramaScore) {
    dramaWinner = { title: `《${bestOurDrama.title}》`, station: '你的電視台', score: ourDramaScore, isOurs: true };
    ourWins++;
    totalPrize += 1_500_000;
  } else if (cityDramaScore >= localDramaScore) {
    dramaWinner = { title: '《深宮密令》', station: '全城電視', score: cityDramaScore, isOurs: false };
  } else {
    dramaWinner = { title: '《街市一家親》', station: '本地八台', score: localDramaScore, isOurs: false };
  }
  awards.push({
    category: '年度最佳劇集',
    icon: '🏆',
    winner: dramaWinner.title,
    station: dramaWinner.station,
    isOurs: dramaWinner.isOurs,
    description: '年度最具藝術價值、口碑與收視的大型劇集製作'
  });

  // 2. 最佳男主角（視帝）
  const maleActorIds = ACTORS.filter(a => !FEMALE_ACTOR_IDS.has(a.id)).map(a => a.id);
  const ourMaleCast = [...new Set(dramas.flatMap(d => d.castIds || []))].filter(id => maleActorIds.includes(id));
  let bestActorWinner;
  if (ourMaleCast.length && rng() < 0.70) {
    const topActorId = [...ourMaleCast].sort((a, b) => (state.talent[b]?.fame ?? 50) - (state.talent[a]?.fame ?? 50))[0];
    const actor = ACTORS.find(a => a.id === topActorId);
    state.talent[topActorId].fame = clamp(state.talent[topActorId].fame + 10, 15, 100);
    bestActorWinner = { name: actor.name, station: '你的電視台', isOurs: true };
    ourWins++;
    totalPrize += 1_000_000;
  } else {
    bestActorWinner = { name: rng() < 0.5 ? '陳豪（全城電視）' : '黃宗澤（全城電視）', station: '全城電視', isOurs: false };
  }
  awards.push({
    category: '最佳男主角（視帝）',
    icon: '👑',
    winner: bestActorWinner.name,
    station: bestActorWinner.station,
    isOurs: bestActorWinner.isOurs,
    description: '演技超群、全城熱話的年度最佳男演員'
  });

  // 3. 最佳女主角（視后）
  const femaleActorIds = ACTORS.filter(a => FEMALE_ACTOR_IDS.has(a.id)).map(a => a.id);
  const ourFemaleCast = [...new Set(dramas.flatMap(d => d.castIds || []))].filter(id => femaleActorIds.includes(id));
  let bestActressWinner;
  if (ourFemaleCast.length && rng() < 0.70) {
    const topActressId = [...ourFemaleCast].sort((a, b) => (state.talent[b]?.fame ?? 50) - (state.talent[a]?.fame ?? 50))[0];
    const actor = ACTORS.find(a => a.id === topActressId);
    state.talent[topActressId].fame = clamp(state.talent[topActressId].fame + 10, 15, 100);
    bestActressWinner = { name: actor.name, station: '你的電視台', isOurs: true };
    ourWins++;
    totalPrize += 1_000_000;
  } else {
    bestActressWinner = { name: rng() < 0.5 ? '佘詩曼（全城電視）' : '宣萱（全城電視）', station: '全城電視', isOurs: false };
  }
  awards.push({
    category: '最佳女主角（視后）',
    icon: '👑',
    winner: bestActressWinner.name,
    station: bestActressWinner.station,
    isOurs: bestActressWinner.isOurs,
    description: '風靡萬千觀眾、深入民心的年度最佳女演員'
  });

  // 4. 最佳綜藝資訊節目
  const varieties = state.library.filter(p => (p.kind === 'variety' || p.kind === 'information' || p.kind === 'night' || p.kind === 'social' || isOneOffEvent(p.kind)) && p.runs > 0);
  const bestOurVariety = [...varieties].sort((a, b) => (b.quality + b.buzz + b.rating) - (a.quality + a.buzz + a.rating))[0];
  let varietyWinner;
  if (bestOurVariety && (bestOurVariety.quality + bestOurVariety.rating > 120 || rng() < 0.60)) {
    varietyWinner = { title: `《${bestOurVariety.title}》`, station: '你的電視台', isOurs: true };
    ourWins++;
    totalPrize += 1_000_000;
  } else {
    varietyWinner = { title: '《百萬挑戰》', station: '全城電視', isOurs: false };
  }
  awards.push({
    category: '最佳綜藝資訊節目',
    icon: '🌟',
    winner: varietyWinner.title,
    station: varietyWinner.station,
    isOurs: varietyWinner.isOurs,
    description: '引發全城歡笑與討論的高人氣非戲劇節目'
  });

  // 5. 年度全港最高收視大獎
  const yearLeaderboards = (state.monthlyLeaderboards ?? []).filter(m => m.day > (year - 1) * 360 && m.day <= year * 360);
  let highestProg = null;
  for (const lb of yearLeaderboards) {
    if (!highestProg || lb.champion.peakRating > highestProg.peakRating) {
      highestProg = lb.champion;
    }
  }
  const ratingWinner = highestProg ?? { title: '七點直播', station: '全城電視', peakRating: 84 };
  const isRatingOurs = ratingWinner.station === '你的電視台';
  if (isRatingOurs) {
    ourWins++;
    totalPrize += 1_000_000;
  }
  awards.push({
    category: '年度全港最高收視大獎',
    icon: '🥇',
    winner: `《${ratingWinner.title}》（峰值 ${ratingWinner.peakRating} 分）`,
    station: ratingWinner.station,
    isOurs: isRatingOurs,
    description: '全年度單一節目創下的全港最高瞬間收視紀錄'
  });

  // 6. 年度傑出電視台大獎
  const isBroadcasterOurs = state.reputation >= 65 && ourWins >= 2;
  if (isBroadcasterOurs) {
    ourWins++;
    totalPrize += 1_500_000;
  }
  awards.push({
    category: '年度傑出電視台大獎',
    icon: '🎖️',
    winner: isBroadcasterOurs ? '你的電視台' : '全城電視',
    station: isBroadcasterOurs ? '你的電視台' : '全城電視',
    isOurs: isBroadcasterOurs,
    description: '綜合全年度節目質素、社會口碑與商業影響力'
  });

  state.cash += totalPrize;
  state.reputation = clamp(state.reputation + ourWins * 3, 0, 100);
  state.fans = clamp(state.fans + ourWins * 4, 0, 100);

  const ceremony = {
    year,
    day: state.day,
    awards,
    ourWins,
    totalPrize,
    isNew: true
  };
  state.pendingCeremony = ceremony;
  state.awardCeremonies ??= [];
  state.awardCeremonies.unshift(ceremony);
  note(state, `【年度頒獎典禮】第 ${year} 屆全城電視大獎圓滿落幕！我台榮獲 ${ourWins} 項大獎，獲得台慶獎金 ${money(totalPrize)}，口碑 +${ourWins * 3}、熱度 +${ourWins * 4}！`, 'good');
  return ceremony;
}

export function dismissCeremony(state) {
  if (state.pendingCeremony) {
    state.pendingCeremony = null;
  }
}

export function advanceDay(state,rng=Math.random) {
  // Handle breaking event lifecycle
  if (state.breakingEvent) {
    state.breakingEvent.daysLeft--;
    if (state.breakingEvent.daysLeft <= 0) {
      note(state, `突發事件【${state.breakingEvent.title}】影響已平息。`, 'neutral');
      state.breakingEventsHistory ??= [];
      state.breakingEventsHistory.unshift({ ...state.breakingEvent, endedDay: state.day });
      state.breakingEvent = null;
    }
  } else if ((state.day % 11 === 0 || rng() < 0.08) && state.day > 1) {
    const eventTemplate = BREAKING_EVENTS_POOL[state.day % BREAKING_EVENTS_POOL.length];
    state.breakingEvent = {
      ...eventTemplate,
      daysLeft: eventTemplate.duration,
      totalDays: eventTemplate.duration,
      startDay: state.day
    };
    note(state, `【突發事件·${eventTemplate.scope === 'worldwide' ? '環球' : '本地'}】${eventTemplate.title}！${eventTemplate.description}`, 'good');
  }

  // Expired rights must never air even if an older save still contains their slots.
  clearCompletedPrograms(state);
  const hours=Array(24).fill(null), details=[], firstAirings=[];
  let revenue=0, audience=0, buzz=0;
  let dailyProduction=0;
  const talentBefore=new Map();
  const gameDay=state.day, dayOfQuarter=(gameDay-1)%DAYS_PER_QUARTER+1;
  const sports=state.events.find(e=>e.quarter===state.quarter && e.resolved && e.winner==='你的電視台');
  let sportsRevenue=0, sportsPenalty=0;
  const weekday=weekdayForDay(gameDay);
  const sportsBlocks=state.schedule.filter(block=>block.programId===`event:${sports?.id}` && runsOnWeekday(block,weekday));
  if (sports && dayOfQuarter<=30) {
    const totalHours=sportsBlocks.reduce((sum,b)=>sum+b.duration,0);
    const primeHours=sportsBlocks.flatMap(hoursInBlock).filter(h=>h>=18&&h<=22).length;
    sportsRevenue=totalHours?Math.round((8_000_000+rng()*7_000_000)*(totalHours/8)*(.75+.65*primeHours/totalHours)*(.90+state.reputation/500)/30):0;
  }
  const specialHourCount=sportsBlocks.reduce((sum,b)=>sum+b.duration,0);
  let specialHourIndex=0, allocatedSpecial=0;
  const todayRuns=new Map();
  for (const block of state.schedule) {
    if(!runsOnWeekday(block,weekday)) continue;
    const times=hoursInBlock(block), special=block.programId.startsWith('event:');
    const p=special?null:state.library.find(item=>item.id===block.programId);
    if (!special&&!p) continue;
    const run=p?p.runs+(todayRuns.get(p.id)??0):0;
    const runLimit = (p && Number.isInteger(p.replayCount) && p.replayCount > 0 && Number.isInteger(p.replayEndRuns)) ? p.replayEndRuns : p?.episodes;
    if (!special && (isUnavailable(p,gameDay) || (p.episodes && run>=runLimit))) continue;
    const episode=p?episodeForBlock(state,block,gameDay):'';
    // Each complete pass makes a licensed programme less fresh; cap the decline.
    const decay=p?.kind==='catalog' ? Math.max(.72,Math.pow(p.episodes===1?.96:.90,Number.isInteger(p.replayCount)&&p.replayCount>0?p.replayCount:Math.floor(run/Math.max(1,p.episodes)))) : 1;
    if (p && isDailyFormat(p.kind) && !p.episodes && p.episodeCost && run>0) dailyProduction+=p.episodeCost;
    let blockRevenue=0, ratingTotal=0;
    for (const hour of times) {
      const prime=hour>=18&&hour<=22;
      const factor=p?.kind==='night'?(hour>=22||hour<=2?1.25:.62):p&&isOneOffEvent(p.kind)?(prime?(weekday>=5?1.52:1.42):hour>=7&&hour<=17?.85:.65):(prime?1.3:hour>=7&&hour<=17?1:hour===23?.76:.58);
      const rivals=state.rivals.map(rival=>rivalAtHour(state,rival,hour,gameDay));
      const strongest=Math.max(...rivals.map(item=>item.rating));
      const pressure=Math.round(Math.max(0,strongest-55)*.16-Math.max(0,55-strongest)*.07);
      const eventMod = p ? getBreakingRatingMod(state.breakingEvent, p) : 0;
      const freshFactor = p ? getFreshnessFactor(p) : 1;
      const rating=special?(prime?98:Math.round(76*factor)):clamp(Math.round(p.rating*decay*factor*freshFactor-pressure+eventMod),1,100);
      let ads;
      if (special) {
        specialHourIndex++;
        ads=specialHourIndex===specialHourCount?sportsRevenue-allocatedSpecial:Math.round(sportsRevenue/specialHourCount);
        allocatedSpecial+=ads;
      } else {
        // A completed series earns its ad package over its finite run. Daily
        // evergreen shows pay a much smaller rate because they never expire.
        const rate=p.episodes?({drama:2_700,variety:2_200,night:1_200,charity:5_000,contest:8_000,pageant:9_500,catalog:p.category==='香港電影'?8_000:1_500}[p.kind]??2_000):(p.kind==='finance'?180:p.kind==='news'?130:60);
        const rightsFactor=p.id.startsWith('start-')?.2:1; // Free opening library is non-exclusive syndication.
        ads=Math.round(rate*rating*rating/70*rightsFactor*(p.outcome==='disaster'?.5:1));
      }
      hours[hour]={hour,title:special?sports.name:p.title,episode,rating,revenue:ads,decay,freshness:p?.freshness??100,maxFreshness:p?.maxFreshness??100,special,rivals:rivals.map(item=>item.rating),eventMod,eventTitle:state.breakingEvent?.title};
      blockRevenue+=ads; ratingTotal+=rating; revenue+=ads; audience+=rating;
      buzz+=special?90:Math.round(p.buzz*decay*freshFactor);
    }
    const blockRating=Math.round(ratingTotal/times.length);
    const rivalRating=Math.round(times.reduce((sum,hour)=>sum+Math.max(...hours[hour].rivals),0)/times.length);
    const won=blockRating>rivalRating;
    const effect=p&&isOneOffEvent(p.kind)?oneOffBroadcastEffect(state,p,blockRating,won):'';
    if(effect)note(state,`《${p.title}》播映：收視 ${blockRating}，${effect}。`,won?'good':'neutral');
    const eventMod = p ? getBreakingRatingMod(state.breakingEvent, p) : 0;
    details.push({programId:p?.id??block.programId,kind:p?.kind??'sports',category:p?.category??'大型賽事',start:block.start,duration:block.duration,title:special?sports.name:p.title,episode,rating:blockRating,rivalRating,won,decay,freshness:p?.freshness??100,maxFreshness:p?.maxFreshness??100,revenue:blockRevenue,special,effect,eventMod,eventTitle:state.breakingEvent?.title});
    state.monthBroadcastLog ??= [];
    state.monthBroadcastLog.push({
      programId: p ? p.id : block.programId,
      title: special ? sports.name : (p ? p.title : '未排節目'),
      station: '你的電視台',
      kind: p ? p.kind : 'sports',
      category: p ? p.category : '大型賽事',
      rating: blockRating,
      day: gameDay,
      start: block.start,
      duration: block.duration
    });
    if (p) {
      if(!p.id.startsWith('start-') && p.runs===0 && !todayRuns.has(p.id)) {
        firstAirings.push({id:`premiere-${gameDay}-${p.id}`,programId:p.id,title:p.title,kind:p.kind,category:p.category,day:gameDay,start:block.start,rating:blockRating,rivalRating,won});
      }
      todayRuns.set(p.id,(todayRuns.get(p.id)??0)+1);
      for (const id of p.castIds) {
        const talent=state.talent[id],actor=ACTORS.find(item=>item.id===id);
        if (!talent||!actor) continue;
        if (!talentBefore.has(id)) talentBefore.set(id,{fame:talent.fame,fee:talent.fee});
        talent.fame=clamp(Math.round((talent.fame+(ratingTotal/times.length-48)/90)*10)/10,15,100);
        talent.fee=Math.round(actor.fee*clamp(1+(talent.fame-(actor.skill-10))*.015,.5,1.8)/10_000)*10_000;
      }
    }
  }
  for (const [id,count] of todayRuns) state.library.find(p=>p.id===id).runs+=count;
  for (const rival of state.rivals) {
    const topRivalHour = hours.filter(Boolean).reduce((best, h) => {
      const rivalIdx = rival.id === 'city' ? 0 : 1;
      const score = h.rivals?.[rivalIdx] ?? 0;
      return score > (best?.score ?? -1) ? { hour: h.hour, score } : best;
    }, null);
    if (topRivalHour) {
      const rivalProg = rivalAtHour(state, rival, topRivalHour.hour, gameDay);
      state.monthBroadcastLog ??= [];
      state.monthBroadcastLog.push({
        programId: `rival-${rival.id}-${topRivalHour.hour}`,
        title: rivalProg.title,
        station: rival.name,
        kind: 'drama',
        category: '對台節目',
        rating: topRivalHour.score,
        day: gameDay,
        start: topRivalHour.hour,
        duration: 1
      });
    }
  }
  for(const premiere of firstAirings){
    const p=state.library.find(item=>item.id===premiere.programId),margin=premiere.rating-premiere.rivalRating;
    const ratingChange=margin>=10?2:margin<=-10?-2:0;
    const buzzChange=margin>=10?6:margin>0?3:margin<=-10?-4:-2;
    p.rating=clamp(p.rating+ratingChange,1,100);p.buzz=clamp(p.buzz+buzzChange,0,100);
    if(margin>=10)state.fans=clamp(state.fans+1,0,100);
    premiere.momentum={rating:ratingChange,buzz:buzzChange};
  }
  state.pendingPremieres??=[];
  state.pendingPremieres.push(...firstAirings);
  const finishedPrograms=clearCompletedPrograms(state).filter(p=>todayRuns.has(p.id) && (isExhausted(p)||isCatalogCycleComplete(p)));
  for (const p of finishedPrograms) {
    p.completedRuns = (Number.isInteger(p.completedRuns) ? p.completedRuns : (Number.isInteger(p.replayCount) && p.replayCount > 0 ? p.replayCount : 0)) + 1;
    p.maxFreshness = Math.max(50, Math.round(100 * Math.pow(0.80, p.completedRuns)));
    p.freshness = Math.max(15, Math.round(p.maxFreshness * 0.28));
  }
  for (const p of state.library) {
    p.freshness ??= 100;
    p.maxFreshness ??= 100;
    if (finishedPrograms.includes(p)) continue;
    if (todayRuns.has(p.id)) {
      p.lastAiredDay = gameDay;
      if (p.episodes > 0) {
        const progress = Math.min(1, p.runs / p.episodes);
        p.freshness = Math.max(35, Math.round(p.maxFreshness * (1 - progress * 0.25)));
      } else if (isDailyFormat(p.kind)) {
        p.freshness = Math.max(70, p.freshness - 1);
      }
    } else {
      p.freshness = Math.min(p.maxFreshness, p.freshness + 2);
    }
  }
  const completed=finishedPrograms.map(p=>p.title);
  if (completed.length) note(state,`${completed.map(title=>`《${title}》`).join('、')}一輪播畢（大結局後新鮮度降至冷卻期，隨時間將回溫）；時段已騰空。如要重播重溫，請到片庫手動開新一輪。`,'neutral');
  for (let hour=0;hour<24;hour++) if (!hours[hour]) {
    hours[hour]={hour,title:'未排節目',episode:'',rating:0,revenue:0,decay:1,empty:true,rivals:state.rivals.map(rival=>rivalAtHour(state,rival,hour,gameDay).rating)};
  }
  state.quarterLedger.sportsRevenue+=sportsRevenue;
  if (sports && dayOfQuarter===30) {
    sportsPenalty=Math.max(0,Math.round((sports.adTarget-state.quarterLedger.sportsRevenue)*.55));
    state.quarterLedger.sportsPenalty=sportsPenalty;
    note(state,`《${sports.name}》一個月獨家轉播結束。廣告收入 ${money(state.quarterLedger.sportsRevenue)}${sportsPenalty?`，對賭賠付 ${money(sportsPenalty)}`:''}。`,sportsPenalty?'bad':'good');
    state.schedule=state.schedule.filter(block=>block.programId!==`event:${sports.id}`);
    for (const old of sports.replacedBlocks??[]) {
      const available=daysForBlock(old).filter(day=>state.schedule.every(block=>!runsOnWeekday(block,day)||!hoursInBlock(old).some(hour=>hoursInBlock(block).includes(hour))));
      if (available.length && !isUnavailable(state.library.find(p=>p.id===old.programId),state.day)) state.schedule.push({...old,days:available});
    }
    state.schedule.sort((a,b)=>a.start-b.start);
  }
  revenue-=sportsPenalty;
  const overhead=Math.round(1_650_000/DAYS_PER_QUARTER)+dailyProduction;
  state.cash+=revenue-overhead;
  const talentChanges=[...talentBefore].map(([id,before])=>({name:ACTORS.find(a=>a.id===id).name,before,fame:state.talent[id].fame,fee:state.talent[id].fee}));
  const wins=hours.filter(item=>item.rating>Math.max(...item.rivals)).length;
  state.audienceFeed??=[];state.mailbox??=[];
  const aired=details.filter(item=>!item.special);
  if(aired.length){
    const ranked=[...aired].sort((a,b)=>b.rating-a.rating);
    const standout=ranked[gameDay%Math.min(3,ranked.length)];
    const low=[...aired].sort((a,b)=>a.rating-b.rating)[0];
    const positive=standout.rating>=55,chosen=positive?standout:low;
    const praise=[`「《${chosen.title}》今集好睇，聽日都想追！」`,`「《${chosen.title}》啲橋段令我同屋企人一路傾到廣告時間。」`,`「終於有套《${chosen.title}》值得準時開電視。」`,`「《${chosen.title}》個時段安排得啱，睇完成晚都記得。」`];
    const complaints=[`「《${chosen.title}》呢個時段有啲悶，可唔可以轉吓口味？」`,`「《${chosen.title}》節奏太慢，下次想睇更有新意嘅內容。」`,`「呢集《${chosen.title}》唔夠吸引，廣告一到我就轉台。」`,`「《${chosen.title}》嘅內容同前幾日太似，希望下次改進。」`];
    const chosenProg=state.library.find(p=>p.id===chosen.programId);
    if (!positive && chosenProg && (chosenProg.freshness ?? 100) < 45) {
      complaints.unshift(`「《${chosen.title}》播完冇耐又重播？新鮮度得返 ${chosenProg.freshness}%，睇到背得出啦！」`);
    } else if (positive && chosenProg && (chosenProg.freshness ?? 100) >= 75 && (chosenProg.completedRuns ?? 0) > 0) {
      praise.unshift(`「隔咗咁耐再重溫《${chosen.title}》，新鮮感同情懷都返晒嚟！」`);
    }
    state.audienceFeed.unshift({day:gameDay,title:chosen.title,tone:positive?'good':'bad',text:(positive?praise:complaints)[gameDay%praise.length]});
    state.audienceFeed=state.audienceFeed.slice(0,24);
  }
  if(gameDay%9===0){
    const type=['request','gift','complaint'][Math.floor(gameDay/9)%3],topic=['旅遊','科技','深夜清談','飲食'][Math.floor(gameDay/9)%4];
    const text=type==='request'?`希望你哋拍一套「${topic}」節目，我會叫朋友一齊睇！`:type==='gift'?'我寄咗一件舊電視道具畀片場，拍下一套節目或許啱用。':'最近有幾個時段嘅節目太重複，希望電視台聽吓觀眾意見。';
    state.mailbox.unshift({id:`letter-${gameDay}`,day:gameDay,type,topic,text,resolved:false});
    state.mailbox=state.mailbox.slice(0,18);
    note(state,'觀眾信箱有新來信，請到戰報回覆。','neutral');
  } else if (gameDay%6===0) {
    const specialTypes=['meme','petition','ofca','sponsor','fan_billboard'];
    const sType=specialTypes[Math.floor(gameDay/6)%specialTypes.length];
    let letterData;
    if (sType==='meme') {
      letterData={
        id:`letter-${gameDay}`,day:gameDay,type:'meme',title:'網絡爆紅迷因 Meme',
        text:'網民將我台熱播節目的爆笑對白截圖惡搞，在社交網絡引爆轉發狂潮！',
        options:[
          {id:'humor',label:'官方幽默自嘲玩梗',desc:'不花錢 · 全台熱度 +4',cost:0,effects:{fans:4},feedback:'電視台小編玩梗親民幽默，網民紛紛讚好！熱度 +4。'},
          {id:'serious',label:'發表嚴肅聲明澄清',desc:'花費 $20k · 維持正經口碑 +2',cost:20000,effects:{reputation:2},feedback:'認真澄清維護電視台嚴肅形象，口碑 +2。'}
        ],resolved:false
      };
    } else if (sType==='petition') {
      letterData={
        id:`letter-${gameDay}`,day:gameDay,type:'petition',title:'萬人聯署支持添食',
        text:'劇迷在網絡發起萬人聯署，甚至在電視台外送上花牌應援，強烈要求開拍續集！',
        options:[
          {id:'accept',label:'順應民意！公開承諾籌備續集',desc:'全台熱度 +5',cost:0,effects:{fans:5},feedback:'總監親自回應承諾籌備續集，粉絲歡聲雷動！熱度 +5。'},
          {id:'souvenir',label:'送出特製明信片與周邊',desc:'花費 $30k · 口碑 +3、熱度 +2',cost:30000,effects:{reputation:3,fans:2},feedback:'派發周邊答謝觀眾，口碑與熱度雙收！'}
        ],resolved:false
      };
    } else if (sType==='ofca') {
      letterData={
        id:`letter-${gameDay}`,day:gameDay,type:'ofca',title:'通訊事務管理局轉介投訴',
        text:'保守觀眾投訴我台近期節目「內容過於大膽、對白衝擊」，通訊局發信查詢。',
        options:[
          {id:'defend',label:'堅守創作自由！強硬回應',desc:'罰款 $80k · 年青觀眾盛讚，熱度 +6',cost:80000,effects:{fans:6},tone:'good',feedback:'電視台霸氣捍衛創作自由，年青族群掌聲如雷！熱度 +6。'},
          {id:'apologize',label:'公開致歉並調整時段提示',desc:'公關費 $30k · 口碑 +3，息事寧人',cost:30000,effects:{reputation:3},feedback:'圓滑處理公關危機，家庭觀眾感到安心。口碑 +3。'}
        ],resolved:false
      };
    } else if (sType==='sponsor') {
      letterData={
        id:`letter-${gameDay}`,day:gameDay,type:'sponsor',title:'隱世富豪指名巨額贊助',
        text:'超級富豪影迷來信提供百萬贊助，指定下套節目要有「商戰」元素！',
        options:[
          {id:'sign',label:'簽訂贊助意向書',desc:'即時入帳 $1,200,000 · 承諾商戰題材',cost:0,effects:{cash:1200000,audienceBrief:'商戰'},feedback:'贊助金 $1.2m 到帳！富豪期待下一套商戰大作。'},
          {id:'decline',label:'客氣婉拒，保持創作獨立',desc:'不花錢 · 口碑 +3',cost:0,effects:{reputation:3},feedback:'堅持不接受特定私人干預，電視台公信力大增！口碑 +3。'}
        ],resolved:false
      };
    } else {
      letterData={
        id:`letter-${gameDay}`,day:gameDay,type:'fan_billboard',title:'粉絲後援會包下大屏幕應援',
        text:'人氣主演的粉絲俱樂部自資集資，在銅鑼灣鬧市買下戶外全屏廣告宣傳！',
        options:[
          {id:'flashmob',label:'安排主演驚喜現身打卡',desc:'宣傳費 $20k · 熱度 +5',cost:20000,effects:{fans:5},feedback:'現場引發過千人圍觀，各大媒體頭條報道！熱度 +5。'},
          {id:'repost',label:'電視台官方專頁轉發感謝',desc:'免費 · 熱度 +2',cost:0,effects:{fans:2},feedback:'粉絲感到備受重視，紛紛留言支持電視台！熱度 +2。'}
        ],resolved:false
      };
    }
    state.mailbox.unshift(letterData);
    state.mailbox=state.mailbox.slice(0,18);
    note(state,`觀眾信箱收到特殊突發事件【${letterData.title}】！`,'good');
  }
  const daily={day:gameDay,quarter:state.quarter,label:`第 ${gameDay} 日`,hours,details,revenue,overhead,net:revenue-overhead,sportsRevenue,sportsPenalty,wins,talentChanges,completed};
  state.lastDayResult=daily;
  state.broadcastReports??=[];
  state.broadcastReports.unshift({day:gameDay,details});
  state.broadcastReports=state.broadcastReports.slice(0,7);
  const ledger=state.quarterLedger;
  ledger.revenue+=revenue;ledger.overhead+=overhead;ledger.audience+=audience;ledger.buzz+=buzz;ledger.days++;
  state.day++;
  state.liveMinute=0;
  if(gameDay%DAYS_PER_MARKET_MONTH===0){
    const monthResult=evaluateMonthlyRatings(state,marketMonthForDay(gameDay));
    daily.monthResult=monthResult;
  }
  if(gameDay%(DAYS_PER_QUARTER*4)===0){
    const yearNumber=Math.floor(gameDay/(DAYS_PER_QUARTER*4));
    const ceremony=evaluateAnnualAwards(state,yearNumber,rng);
    daily.ceremony=ceremony;
  }
  const marketRefresh=marketMonthForDay(state.day)!==marketMonthForDay(gameDay);
  if(marketRefresh) {
    note(state,`外購市場第 ${marketMonthForDay(state.day)+1} 個月新片單上架；原有播映權照常有效。`,'good');
    refreshMarketRivalBuys(state, rng);
  }
  const newlyExpired = [];
  for (const p of state.library) {
    if (p.kind === 'catalog' && Number.isInteger(p.licenseExpiresDay)) {
      if (state.day >= p.licenseExpiresDay && !p.licenseExpiredHandled) {
        p.licenseExpiredHandled = true;
        newlyExpired.push(p.title);
      }
    }
  }
  clearCompletedPrograms(state);
  if(newlyExpired.length) note(state,`${newlyExpired.map(title=>`《${title}》`).join('、')}播映權到期，相關時段已騰空。`,'neutral');
  daily.expired=newlyExpired;
  daily.marketRefresh=marketRefresh;
  if (dayOfQuarter===DAYS_PER_QUARTER) {
    state.reputation=clamp(state.reputation+Math.round((ledger.audience/(24*ledger.days)-40)/14),0,100);
    state.fans=clamp(state.fans+Math.round((ledger.buzz/(24*ledger.days)-30)/15),0,100);
    const totalOverhead=ledger.overhead;
    const result={quarter:state.quarter,label:quarterLabel(state.quarter),hours,details,revenue:ledger.revenue,overhead:totalOverhead,net:ledger.revenue-totalOverhead,sportsRevenue:ledger.sportsRevenue,sportsPenalty:ledger.sportsPenalty,cash:state.cash};
    state.history.unshift(result); state.history=state.history.slice(0,12);state.lastResult=result;
    state.quarter++;state.productionCount=0;
    state.quarterLedger={revenue:0,overhead:0,sportsRevenue:0,sportsPenalty:0,audience:0,buzz:0,days:0};
    ensureEvents(state);
    const opening=state.events.find(e=>e.quarter===state.quarter && !e.resolved);
    if (opening) resolveAuction(state,opening,rng);
    note(state,`${result.label} 結算：90 日廣告及節目收益 ${money(result.revenue)}，營運開支 ${money(result.overhead)}。`,result.net>=0?'good':'bad');
    daily.quarterResult=result;
  }
  return daily;
}

export function advanceQuarter(state,rng=Math.random) {
  const current=state.quarter;
  let daily;
  while (state.quarter===current) {
    daily=advanceDay(state,rng);
    if (daily.completed.length || daily.expired.length || daily.marketRefresh || state.pendingPremieres?.length || state.pendingCeremony || state.lastMonthResult?.isNew) break;
  }
  return daily;
}

