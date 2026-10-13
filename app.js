import { ACTORS, BUDGETS, GENRES, THEMES, CONTENT_TYPES, DAYS_PER_QUARTER, DAYS_PER_MARKET_MONTH, EPISODE_COUNTS, PRODUCTION_STYLES, PRODUCTION_HOOKS, ACQUISITION_GROUPS, WEEKDAYS, EVERY_DAY, LICENSE_TERMS, VIU_ORIGINALS, money, preciseMoney, quarterLabel, hourLabel, compatibility, exactKey, catalogForMonth, marketMonthForDay, rivalPremiere, currentEvent, activeBiddingEvents, isSportsActive, getActiveSportsEvents, buyoutSportsEvent, revealAuctionNow, programAtHour, episodeForBlock, broadcastNow, advanceBroadcastClock, rivalAtHour, productionQuote, distributionQuote, sellProduction, replyToLetter, rejectLetter, dismissLetter, holdFanMeeting, launchAudiencePoll, hoursInBlock, isDailyFormat, isOneOffEvent, clearCompletedPrograms, migrateLegacyLicenses, licensePrice, licenseExpired, isCatalogCycleComplete, catalogCycleProgress, catalogCompletedAirings, startCatalogReplay, startProgramReplay, canReplayProgram, freshnessLabel, getFreshnessFactor, isUnavailable, duplicateBooking, daysForBlock, runsOnWeekday, weekdayForDay, premiereProfile, resolvePremiere, newGame, produce, buyProgram, renewLicense, scheduleProgram, removeScheduledProgram, submitBid, advanceDay, advanceQuarter, BREAKING_EVENTS_POOL, getBreakingRatingMod, evaluateMonthlyRatings, evaluateAnnualAwards, dismissCeremony, dismissMonthResult, generateSuggestedTitles, getSportsConfig, isEuropeanFootballSummerBreak, isUclMatchWeek, isPlPausedWeek, AD_CONTRACT_TEMPLATES, FACILITY_CONFIGS, signAdContract, setAdPricingStrategy, upgradeFacility, signExclusiveTalent, trainTalent, restTalent, unlockSubChannel, contractTargetDesc, SHOP_TOOLS, buyShopTool, isToolActive, getToolTimeRemaining, signArtist, renewArtistContract, getStationName, artistSignCost, artistRenewCost, DEFAULT_STUDIOS, DEFAULT_CREWS, getAllCrews, getCrewsForFormat, TARGET_AUDIENCES, PRODUCTION_STRATEGIES, PRODUCTION_STAGES, createProductionProject, advanceProduction, deliverEpisode, syncProjectToLibrary, handleFilmingEventChoice, resetProjectAutoChoices, handleQualityControlDecision, setProjectQCStrategy, createSeasonOrSpinOff, cancelProductionProject, upgradeStudioFacility, checkPerformerAvailability, getFormatStages } from './engine.js?v=20261013-auto-qc-v8';

const SAVE_KEY='tv-dream-studio-v1';
function loadGame(){
  try {
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){
      const value=JSON.parse(raw);
      if(value&&Number.isInteger(value.day)&&value.day>0&&Number.isInteger(value.quarter)&&value.quarter>=0&&Number.isFinite(value.cash)&&Array.isArray(value.schedule)&&Array.isArray(value.library)&&Array.isArray(value.rivals)&&value.talent&&typeof value.talent==='object'&&Array.isArray(value.events)&&Array.isArray(value.log)&&Array.isArray(value.history)&&Array.isArray(value.achievements)&&Array.isArray(value.sponsors)&&value.cooldowns&&value.quarterLedger&&Number.isInteger(value.productionCount)){
        migrateLegacyLicenses(value);
        clearCompletedPrograms(value);
        value.productionProjects ??= [];
        value.studios ??= [...DEFAULT_STUDIOS];
        if (value.crews) {
          const existingIds = new Set(value.crews.map(c => c.id));
          for (const def of DEFAULT_CREWS) {
            if (!existingIds.has(def.id)) {
              value.crews.push({ ...def });
            }
          }
        } else {
          value.crews = DEFAULT_CREWS.map(c => ({ ...c }));
        }
        value.franchises ??= [];
        value.activeFilmingEvents ??= [];
        (value.productionProjects ?? []).forEach(p => {
          p.autoChoices ??= {};
          p.autoQCDecision ??= null;
        });
        return value;
      }
    }
  } catch {}
  return newGame();
}
let state=loadGame();
let tab='schedule';
let editorOpen=false;
let resetScroll=false;
let runSummary=null;
let selectedBroadcastDay=null;
let reportFilter='all';
let selected={kind:'drama',genre:'青春',themes:['友情'],actorIds:['edaan','anson_lo'],topic:'遊戲競賽',budgetId:'standard',episodeHours:2,episodeCount:8,styleId:'mainstream',hookId:'none',customTitle:''};
let editor={start:19,duration:2,programId:'start-sitcom',days:[...EVERY_DAY],recurrence:'daily',allowRepeat:false};
let editorProgramGroup='all';
let editorProgramSearch='';
function resetProgramPicker(){editorProgramGroup='all';editorProgramSearch='';}
let scheduleDay=null;
let schedulePeriod='early';
let scheduleChannel=1; // 1 = 翡翠台旗艦主台, 2 = 數碼二台 (J2/體育副台)
let talentSubTab='all';
let catalogSubTab='market';
let catalogFilter='all';
let catalogSort='featured';
let catalogAvailableOnly=false;
let catalogNetwork='all';
let catalogYear='all';
let catalogQuery='';
let licenseDays=180;
let replayFilter='all';
let replaySearch='';
let dismissedAlerts={completed:false,replay:false,expired:false};
let expandedCompleted=false;
let actorFilter='viu';
let actorPickerOpen=false;
let actorSearch='';
let notice='';
let showReset=false;
let showTransfer=false;
let selectedLeaderboardMonth=null;
let rivalsTab='all';
let studioSubTab='active'; // 'active' | 'create' | 'studios' | 'franchises' | 'talent'
let activeEventModal=null; // { projectId, episodeNumber }
let activeQCModal=null; // { projectId, episodeNumber }
let newProjCastFilter='all'; // 'all' | 'avail' | 'mine' | 'free'
let crewFormatFilter='all'; // 'all' | 'drama' | 'variety' | 'news' | 'documentary' | 'talkshow' | 'live'
let newProjState={
  title: '',
  format: 'drama',
  genre: '時裝恩怨',
  themes: ['愛情'],
  targetAudience: 'family',
  episodesCount: 8,
  episodeHours: 2,
  budgetId: 'standard',
  assignedStudioId: 'studio_1',
  strategy: 'balanced',
  directorId: 'dir_lee',
  writerId: 'wri_cheung',
  actorIds: []
};
const app=document.getElementById('app');
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hourlyMoney=n=>{const amount=Math.abs(n),sign=n<0?'−':'';return amount>=1_000_000?`${sign}${money(amount)}`:amount>=1_000?`${sign}$${(amount/1_000).toFixed(amount<10_000?1:0)}k`:`${sign}$${Math.round(amount).toLocaleString()}`};
const catalogPrice=n=>n>=1_000_000?`$${(n/1_000_000).toFixed(2)}m`:`$${Math.round(n/1_000)}k`;
const icon={schedule:'▦',studio:'◈',ads:'💼',facilities:'🏢',catalog:'▤',sports:'◆',shop:'🧰',rivals:'♟',reports:'▥'};
const timeRange=(start,duration)=>`${hourLabel(start)}–${hourLabel(start+duration)}${start+duration>=24?'（翌日）':''}`;
const dayPattern=days=>days.length===7?'每日':days.length===5&&days.every((d,i)=>d===i)?'週一至五':days.length===2&&days[0]===5&&days[1]===6?'週六日':days.length===2&&days[0]===1&&days[1]===2?'週二三':days.length===1?`每週${WEEKDAYS[days[0]].slice(1)}`:days.map(day=>WEEKDAYS[day]).join('、');
const initialDays=p=>p?.category==='香港電影'||p?.kind==='variety'||p?.kind==='night'||p?.kind==='children'||isOneOffEvent(p?.kind)?[weekdayForDay(state.day)]:p?.kind==='drama'||isDailyFormat(p?.kind)?[0,1,2,3,4]:[...EVERY_DAY];
const initialRecurrence=p=>(isOneOffEvent(p?.kind)||p?.episodes===1||p?.category==='香港電影')?'once':(p?.kind==='drama'||isDailyFormat(p?.kind))?'weekday':(p?.kind==='variety'||p?.kind==='night'||p?.kind==='children')?'weekly':'daily';
const catalogProgressLabel=p=>p.episodes===1?`已放映 ${catalogCompletedAirings(p)} 次`:`已完整播出 ${catalogCompletedAirings(p)} 次`;

function transferModalView() {
  const currentSave=localStorage.getItem(SAVE_KEY)??JSON.stringify(state);
  return `<div class="modal-backdrop"><div class="modal transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-title"><div class="transfer-head"><h2 id="transfer-title">⇄ 存檔備份與跨站轉移</h2><button class="editor-dismiss" data-action="close-transfer" aria-label="關閉">✕</button></div><p class="transfer-desc">你可以將此存檔複製至新網站，或貼上先前的存檔代碼無痛復原進度！</p><div class="transfer-block"><div class="transfer-label"><strong>目前遊戲存檔（第 ${state.day} 日 · ${money(state.cash)} · 口碑 ${state.reputation}）</strong><button class="copy-pill-btn" data-action="copy-save">📋 複製存檔代碼</button></div><textarea readonly class="transfer-text" id="export-save-box" onclick="this.select()">${safe(currentSave)}</textarea></div><div class="transfer-block"><div class="transfer-label"><strong>匯入新存檔（貼上存檔代碼）</strong></div><textarea class="transfer-text" id="import-save-box" placeholder="在此處貼上存檔 JSON 字串..."></textarea><div class="modal-actions"><button class="soft-button" data-action="close-transfer">取消</button><button class="primary-button import-btn" data-action="confirm-import">匯入並立即載入 →</button></div></div></div></div>`;
}

function breakingEventBannerView() {
  const event=state.breakingEvent;
  if (!event) return '';
  const isWorld=event.scope==='worldwide';
  const tag=isWorld?'全球大事':'本地突發';
  return `<div class="breaking-banner ${isWorld?'worldwide':'local'}" role="region" aria-label="突發事件速報">
    <div class="breaking-banner-badge">
      <span class="breaking-dot"></span>
      <strong>${safe(event.icon||'⚡')} ${safe(tag)}</strong>
      <span class="breaking-timer">尚餘 ${event.daysLeft} 日</span>
    </div>
    <div class="breaking-banner-body">
      <h3 class="breaking-title">【${safe(event.title)}】</h3>
      <p class="breaking-desc">${safe(event.description)}</p>
    </div>
  </div>`;
}

function monthResultModalView() {
  const result=state.lastMonthResult;
  if (!result || !result.isNew) return '';
  return `<div class="modal-backdrop month-modal-backdrop">
    <div class="modal month-result-modal" role="dialog" aria-modal="true" aria-labelledby="month-result-title">
      <div class="month-modal-header">
        <span class="gold-badge">MONTHLY RATINGS REPORT</span>
        <h2 id="month-result-title">第 ${result.month} 個月 · 全港電視收視龍虎榜</h2>
        <span class="month-date-tag">結算於第 ${result.day} 日</span>
      </div>
      <div class="month-champion-card ${result.isOurWin?'our-win':'rival-win'}">
        <div class="champion-crown">👑</div>
        <div class="champion-info">
          <span class="champion-label">${result.isOurWin?'🎉 恭喜我台勇奪全港月度最高收視總冠軍！':'⚔️ 本月全港最高收視節目'}</span>
          <strong class="champion-title">${safe(result.champion.title)}</strong>
          <span class="champion-station">${safe(result.champion.station)} · ${safe(result.champion.category||'電視節目')}</span>
        </div>
        <div class="champion-rating-box">
          <small>峰值收視</small>
          <strong>${result.champion.peakRating}</strong>
          <small>平均 ${result.champion.avgRating} 點</small>
        </div>
      </div>
      ${result.isOurWin?`
        <div class="champion-bonus-callout">
          <span class="bonus-icon">💰</span>
          <div>
            <strong>廣告商特別花紅獎金 +$600,000 已入帳！</strong>
            <small>電視台口碑 +2 · 觀眾熱度 +3</small>
          </div>
        </div>
      `:`
        <div class="champion-encourage-callout">
          <span>我台本月最高：<strong>《${safe(result.ourBest.title)}》</strong>（收視 ${result.ourBest.peakRating} 點 · 全港第 ${result.ourBest.rank} 名）</span>
        </div>
      `}
      <div class="month-top5-table-box">
        <h3>全港收視排行榜 Top 5</h3>
        <table class="month-top5-table">
          <thead>
            <tr>
              <th>名次</th>
              <th>節目名稱</th>
              <th>電視台</th>
              <th>最高收視</th>
              <th>平均收視</th>
            </tr>
          </thead>
          <tbody>
            ${result.top5.map(item=>`
              <tr class="${item.station==='你的電視台'?'is-ours':''}">
                <td class="rank-cell"><span class="rank-badge rank-${item.rank}">${item.rank}</span></td>
                <td class="title-cell"><strong>${safe(item.title)}</strong></td>
                <td class="station-cell"><span class="station-tag ${item.station==='你的電視台'?'tag-ours':''}">${safe(item.station)}</span></td>
                <td class="rating-cell"><strong>${item.peakRating}</strong></td>
                <td class="avg-cell">${item.avgRating}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="modal-actions">
        <button class="primary-button month-dismiss-btn" data-action="dismiss-month-result">確認月結戰報 ➔</button>
      </div>
    </div>
  </div>`;
}

function ceremonyModalView() {
  const ceremony=state.pendingCeremony;
  if (!ceremony || state.lastMonthResult?.isNew) return '';
  return `<div class="modal-backdrop ceremony-modal-backdrop">
    <div class="modal ceremony-modal" role="dialog" aria-modal="true" aria-labelledby="ceremony-title">
      <div class="ceremony-modal-header">
        <div class="ceremony-banner-tag">ANNUAL TV AWARDS GALA</div>
        <h2 id="ceremony-title">🏆 ${ceremony.year} 年度電視頒獎盛典</h2>
        <p class="ceremony-subtitle">全港觀眾與業界專業評審聯合評選 · 總結 360 日電視風雲</p>
      </div>
      <div class="ceremony-summary-strip">
        <div><span>我台獲獎數</span><strong class="gold-text">${ceremony.ourWins} / ${ceremony.awards.length} 項</strong></div>
        <div><span>盛典總獎金</span><strong>+${money(ceremony.totalPrize)}</strong></div>
        <div><span>聲望回報</span><strong>口碑 +${ceremony.ourWins*3} · 熱度 +${ceremony.ourWins*4}</strong></div>
      </div>
      <div class="ceremony-awards-grid">
        ${ceremony.awards.map(award=>`
          <div class="award-card ${award.isOurs?'is-ours':'is-rival'}">
            <div class="award-header">
              <span class="award-icon">${award.icon}</span>
              <div class="award-title-box">
                <h4>${safe(award.category)}</h4>
                <small>${safe(award.description)}</small>
              </div>
              <span class="award-status-pill ${award.isOurs?'pill-ours':'pill-rival'}">${award.isOurs?'★ 我台榮獲':safe(award.station)}</span>
            </div>
            <div class="award-winner-box">
              <span class="winner-label">得獎者 / 作品</span>
              <strong class="winner-name">${safe(award.winner)}</strong>
              <span class="winner-station">${safe(award.station)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions">
        <button class="primary-button ceremony-dismiss-btn" data-action="dismiss-ceremony">全體祝賀 · 接受榮譽 ➔</button>
      </div>
    </div>
  </div>`;
}

function render() {
  const event=currentEvent(state);
  const live=broadcastNow(state);
  const scroll=resetScroll?0:(app.querySelector('main')?.scrollTop??0);
  const editorScroll=app.querySelector('.schedule-editor.open')?.scrollTop??0;
  const editorWasOpen=Boolean(app.querySelector('.schedule-editor.open'));
  const activeEditorField=document.activeElement?.closest('.schedule-editor')?document.activeElement.dataset.action:null;
  resetScroll=false;
  app.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <div class="brand"><div class="brand-mark"><span>▶</span></div><div><div class="eyebrow">STATION MANAGER</div><strong>電視夢工場<span>：新世代</span></strong></div></div>
        <div class="season"><span class="season-dot"></span><span>模擬第 ${state.day} 日</span><b>${quarterLabel(state.quarter)}</b></div>
        <div class="topbar-actions">
          <button class="transfer-link" data-action="open-transfer" aria-label="存檔備份與轉移">⇄ 存檔轉移</button>
          <button class="reset-link" data-action="reset-prompt" aria-label="重新開局">重新開局</button>
        </div>
      </header>
      <div class="game-hud"><div class="hud-stats"><span>資金 <b class="${state.cash<0?'danger':''}">${money(state.cash)}</b></span><span>口碑 <b>${state.reputation}</b></span><span>熱度 <b>${state.fans}</b></span></div><div class="hud-broadcast"><span class="broadcast-clock"><span class="broadcast-clock-line"><i></i> <span id="broadcast-status">${live.finished?'今日播畢':'正在播映'}</span> <b id="live-clock">${live.clock}</b></span><small class="clock-rate">現實 30 秒＝遊戲 1 小時</small></span><strong id="now-title">${safe(live.title)}</strong><small id="now-episode">${safe(live.episode||'每日時段')}</small><small>下一節目 <b id="next-title"></b></small></div></div>
      ${breakingEventBannerView()}
      <nav class="tabs" aria-label="遊戲功能">
        ${[['schedule','排播'],['studio','製作'],['ads','招商'],['facilities','大樓'],['catalog','片庫'],['sports','體育'],['shop','道具'],['rivals','對手'],['reports','戰報']].map(([id,label])=>{
          const pendingAlert = id==='studio' && (state.productionProjects??[]).some(p => p.episodes?.some(e => e.pendingEvent || e.status === 'qc_ready'));
          return `<button data-action="tab" data-tab="${id}" class="tab ${tab===id?'active':''}" ${tab===id?'aria-current="page"':''}><span aria-hidden="true">${icon[id]}</span>${label}${pendingAlert ? '<span class="studio-sub-tab-badge" style="margin-left:4px; font-size:0.65rem; padding:1px 5px;">!</span>' : ''}</button>`;
        }).join('')}
      </nav>
      <main>
        ${tab==='schedule'?scheduleHome():tab==='studio'?studioView():tab==='ads'?adsView():tab==='facilities'?facilitiesView():tab==='rivals'?rivalsView():tab==='catalog'?catalogView():tab==='sports'?sportsView():tab==='shop'?shopView():reportsView()}
      </main>
      <footer>電視夢工場：新世代 <span>進度自動保存在此瀏覽器</span></footer>
      ${notice?`<div class="toast" role="status">${safe(notice)}</div>`:''}
      ${premiereView()}
      ${monthResultModalView()}
      ${ceremonyModalView()}
      ${activeEventModal ? renderFilmingEventModal() : ''}
      ${activeQCModal ? renderQCModal() : ''}
      ${showReset?`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">重新開局？</h2><p>目前電視台嘅進度會清除。</p><div class="modal-actions"><button class="soft-button" data-action="reset-cancel">取消</button><button class="danger-button" data-action="reset-confirm">重新開局</button></div></div></div>`:''}
      ${showTransfer?transferModalView():''}
    </div>`;
  const mainEl = app.querySelector('main');
  if (mainEl) mainEl.scrollTop = scroll;
  if(editorOpen)app.querySelector('.schedule-editor.open')?.scrollTo(0,editorScroll);
  if(editorOpen){
    const target=activeEditorField?app.querySelector(`.schedule-editor [data-action="${activeEditorField}"]`):!editorWasOpen?app.querySelector('.editor-dismiss'):null;
    target?.focus({preventScroll:true});
  }
  if(state.pendingPremieres?.length)app.querySelector('.premiere-decisions button:not(:disabled)')?.focus({preventScroll:true});
  try {localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch {app.querySelector('.game-hud').insertAdjacentHTML('beforeend','<div class="save-warning" role="status">進度未能儲存；請檢查瀏覽器儲存空間。</div>');}
  lastLiveHour=null;
  refreshLive();
}

let lastLiveHour=null;
function refreshLive() {
  const now=broadcastNow(state);
  const clock=app.querySelector('#live-clock');
  if (!clock) return;
  clock.textContent=now.clock;
  app.querySelector('#broadcast-status').textContent=now.finished?'今日播畢':'正在播映';
  app.querySelector('#now-title').textContent=now.title;
  app.querySelector('#now-episode').textContent=now.episode||'每日時段';
  const nextHour=now.finished?0:now.block?(now.block.start+now.block.duration)%24:(now.hour+1)%24;
  const nextBlock=now.finished?null:programAtHour(state,nextHour);
  const next=nextBlock&&(state.library.find(p=>p.id===nextBlock.programId)||state.events.find(e=>`event:${e.id}`===nextBlock.programId));
  app.querySelector('#next-title').textContent=now.finished?'按「播出今日」開始下一日':`${hourLabel(nextHour)} ${next?.title??next?.name??'未排節目'}`;
  if (lastLiveHour!==now.hour) {
    app.querySelectorAll('.hour-row,.matchup-row').forEach(row=>row.classList.toggle('is-now',Number(row.dataset.hour)===now.hour));
    lastLiveHour=now.hour;
  }
}
setInterval(()=>{
  if(document.hidden||state.pendingPremieres?.length||showReset||state.liveMinute>=1440)return;
  advanceBroadcastClock(state);
  refreshLive();
  if(state.liveMinute%10===0){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{}}
},500);

function talentManagementView() {
  const ourCount = ACTORS.filter(a => state.talent[a.id]?.station === 'player').length;
  const filtered = ACTORS.filter(a => {
    const station = state.talent[a.id]?.station ?? 'free';
    if (talentSubTab === 'mine') return station === 'player';
    if (talentSubTab === 'free') return station === 'free';
    if (talentSubTab === 'rival') return station !== 'player' && station !== 'free';
    if (talentSubTab === 'viu') return a.source === 'viu';
    if (talentSubTab === 'tvb') return a.source === 'tvb';
    return true;
  });

  return `<section class="panel talent-management-panel" id="talent-agency-section">
    <div class="section-heading">
      <div>
        <div class="eyebrow gold">ARTIST CONTRACTS · 1-YEAR DEALS & TRAINING</div>
        <h2>旗下與自由身藝人合約管理及培訓部</h2>
        <p>藝人合約為期 1 年（360 日）。簽下獨家合約可享 40% 單集片酬減免！合約屆滿前 1 個月（30 日）系統將提醒續約；若逾期未續，對手台（翡翠台、ViuTV、HOY TV）將強勢搶簽！旗下藝人可報讀大師班深造演技與知名度。</p>
      </div>
      <div class="actor-filters" aria-label="篩選藝人分類">
        ${[['all','全部藝人'],['mine',`我台 (${ourCount})`],['free','自由身'],['rival','對手旗下'],['viu','ViuTV'],['tvb','TVB']].map(([id,label])=>`
          <button data-action="talent-filter" data-value="${id}" class="${talentSubTab===id?'active':''}">
            ${label}
          </button>
        `).join('')}
      </div>
    </div>
    <div class="talent-roster-grid">
      ${filtered.map(a => {
        const talent = state.talent[a.id];
        const station = talent?.station ?? 'free';
        const isMine = station === 'player';
        const isRival = station !== 'player' && station !== 'free';
        const daysLeft = talent?.contractExpiresDay ? Math.max(0, talent.contractExpiresDay - state.day) : null;
        const isExpiring = isMine && daysLeft !== null && daysLeft <= 30;
        const signCost = artistSignCost(talent, a);
        const renewCost = artistRenewCost(talent, a);
        const stamina = talent?.stamina ?? 100;
        const canTrain = state.cash >= 180_000 && stamina >= 15;
        const canRest = state.cash >= 50_000 && stamina < 100;

        return `<div class="talent-roster-card ${isMine ? 'mine' : isRival ? 'rival' : 'free'} ${isExpiring ? 'expiring' : ''}">
          <div class="talent-card-top">
            <span class="avatar">${a.name.slice(0, 1)}</span>
            <div class="talent-card-meta">
              <strong>${a.name}</strong>
              <small>${a.specialty} · 演技 ${talent?.skill ?? a.skill} · 知名度 ${(talent?.fame ?? (a.skill - 10)).toFixed(1)}</small>
            </div>
            <span class="talent-badge ${isMine ? (isExpiring ? 'expiring' : 'mine') : isRival ? 'rival' : 'free'}">
              ${isMine ? (isExpiring ? `⚠️ 尚餘 ${daysLeft} 日` : `我台旗下 (${daysLeft}日)`) : isRival ? `${getStationName(station)}旗下` : '自由身'}
            </span>
          </div>
          <div class="talent-card-fees">
            <div><small>常規單集片酬</small><span>${preciseMoney(talent?.fee ?? a.fee)}</span></div>
            <div><small>我台演出成本</small><strong>${preciseMoney(isMine ? Math.round(a.fee * 0.6) : (talent?.fee ?? a.fee))}${isMine ? '<small class="tag-60">6折</small>' : ''}</strong></div>
          </div>
          ${isMine ? `
            <div class="stamina-box" style="margin: 6px 0;">
              <div class="stamina-label" style="display:flex; justify-content:space-between; font-size:0.75rem;">
                <span>體力狀態</span>
                <b class="${stamina < 40 ? 'danger' : stamina < 70 ? 'warning' : 'good'}">${stamina}% ${stamina < 40 ? '（過勞！）' : ''}</b>
              </div>
              <div class="stamina-track" style="height:4px; background:#1b2430; border-radius:2px; overflow:hidden; margin-top:2px;">
                <div class="stamina-fill ${stamina < 40 ? 'danger' : stamina < 70 ? 'warning' : 'good'}" style="height:100%; width:${stamina}%; background:${stamina < 40 ? '#ef4444' : stamina < 70 ? '#f59e0b' : '#10b981'};"></div>
              </div>
            </div>
          ` : ''}
          <div class="talent-card-foot">
            ${isMine ? `
              <button class="talent-action-btn renew ${isExpiring ? 'urgent' : ''}" data-action="renew-artist" data-actor-id="${a.id}" ${state.cash < renewCost ? 'disabled' : ''}>
                ${isExpiring ? '⚠️ 約滿在即！' : ''}續約 1 年 (${money(renewCost)})
              </button>
              <div class="train-buttons-row" style="display:flex; gap:4px; margin-top:6px;">
                <button class="agency-action-btn train-btn" data-action="train-talent" data-actor-id="${a.id}" data-type="acting" ${canTrain ? '' : 'disabled'} title="安排演技大師班（$180k，演技+3，體力-10）">
                  🎭 演技班 ($180k)
                </button>
                <button class="agency-action-btn train-btn" data-action="train-talent" data-actor-id="${a.id}" data-type="fame" ${canTrain ? '' : 'disabled'} title="安排形象公關訓練（$180k，知名度+4，體力-10）">
                  🎤 綜藝班 ($180k)
                </button>
                <button class="agency-action-btn rest-btn" data-action="rest-talent" data-actor-id="${a.id}" ${canRest ? '' : 'disabled'} title="安排休假充電（$50k，體力+50%）">
                  🌴 休假 ($50k)
                </button>
              </div>
            ` : isRival ? `
              <button class="talent-action-btn rival-locked" disabled>
                ${getStationName(station)}獨家（尚餘 ${daysLeft} 日）
              </button>
            ` : `
              <button class="talent-action-btn sign" data-action="sign-artist" data-actor-id="${a.id}" ${state.cash < signCost ? 'disabled' : ''}>
                簽約 1 年 (${money(signCost)})
              </button>
            `}
          </div>
        </div>`;
      }).join('')}
    </div>
  </section>`;
}

const STAGE_NAMES = {
  pre_production: '前期籌備',
  script_writing: '劇本編審',
  set_preparation: '置景道具',
  rehearsal: '排練試戲',
  filming: '實景拍攝',
  post_production: '後期剪輯',
  quality_control: '質量把關',
  delivery: '母帶交付'
};

const STATUS_NAMES = {
  pending: '排隊入棚',
  in_progress: '製作推進中',
  qc_ready: '🔍 審片就緒',
  delivered: '✓ 母帶已交付',
  aired: '📺 已播映',
  cancelled: '已腰斬'
};

function studioView() {
  const pendingEventsCount = (state.activeFilmingEvents ?? []).length;
  const qcReadyCount = (state.productionProjects ?? []).flatMap(p => (p.episodes || []).filter(e => e.status === 'qc_ready')).length;
  const activeProjsCount = (state.productionProjects ?? []).filter(p => p.status === 'in_production').length;
  const completedProjsCount = (state.productionProjects ?? []).filter(p => p.status === 'completed' || p.status === 'delivered').length;

  return `<div class="studio-main-container">
    <div class="studio-sub-tabs">
      <button class="studio-sub-tab-btn ${studioSubTab==='active'?'active':''}" data-action="studio-subtab" data-value="active">
        🎬 製作中企劃 (${activeProjsCount})
        ${(pendingEventsCount + qcReadyCount) > 0 ? `<span class="studio-sub-tab-badge">${pendingEventsCount + qcReadyCount} 待決策</span>` : ''}
      </button>
      <button class="studio-sub-tab-btn ${studioSubTab==='create'?'active':''}" data-action="studio-subtab" data-value="create">
        ➕ 影視企劃立項
      </button>
      <button class="studio-sub-tab-btn ${studioSubTab==='studios'?'active':''}" data-action="studio-subtab" data-value="studios">
        🏢 影視城片廠與主創 (${(state.studios??DEFAULT_STUDIOS).length}廠)
      </button>
      <button class="studio-sub-tab-btn ${studioSubTab==='franchises'?'active':''}" data-action="studio-subtab" data-value="franchises">
        🏆 歷年系列與續集 (${completedProjsCount})
      </button>
      <button class="studio-sub-tab-btn ${studioSubTab==='talent'?'active':''}" data-action="studio-subtab" data-value="talent">
        👥 藝人經理人管理 (${Object.values(state.talent??{}).filter(t=>t.station==='player').length}人)
      </button>
    </div>

    ${studioSubTab === 'active' ? renderActiveProjectsView()
      : studioSubTab === 'create' ? renderCreateProjectView()
      : studioSubTab === 'studios' ? renderStudiosCrewView()
      : studioSubTab === 'franchises' ? renderFranchisesView()
      : talentManagementView()}
  </div>`;
}

function renderActiveProjectsView() {
  const active = (state.productionProjects ?? []).filter(p => p.status === 'in_production');
  if (!active.length) {
    return `<div class="panel" style="text-align: center; padding: 48px 24px;">
      <div style="font-size: 2.5rem; margin-bottom: 12px;">🎬</div>
      <h2>目前沒有製作中之影視企劃</h2>
      <p style="color: #94a3b8; max-width: 500px; margin: 8px auto 20px;">
        立即開啟全新企劃！自訂劇種、主創編導、演出陣容、片廠與製作策略，體驗多集並行製作與質量把關。
      </p>
      <button class="primary-button" style="width: auto; margin: 0 auto; padding: 10px 24px;" data-action="studio-subtab" data-value="create">
        ➕ 前往影視企劃立項
      </button>
    </div>`;
  }

  return `<div class="projects-container">
    ${active.map(proj => {
      const studio = (state.studios ?? DEFAULT_STUDIOS).find(s => s.id === proj.assignedStudioId);
      const strat = PRODUCTION_STRATEGIES.find(s => s.id === proj.strategy);
      const aud = TARGET_AUDIENCES.find(a => a.id === proj.targetAudience);
      const dir = getAllCrews(state).find(c => c.id === proj.crew?.directorId);
      const wri = getAllCrews(state).find(c => c.id === proj.crew?.writerId);

      return `<div class="project-card">
        <div class="project-header">
          <div class="project-title-area">
            <div class="project-title">
              《${safe(proj.title)}》
              ${proj.seasonNumber > 1 ? `<span style="font-size:0.75rem; background:#3b82f630; color:#60a5fa; padding:2px 8px; border-radius:10px;">Season ${proj.seasonNumber}</span>` : ''}
              <span class="project-format-pill">${{ drama: '旗艦劇集', variety: '自製綜藝', news: '新聞即時', documentary: '深度紀錄', talkshow: '清談節目', live: '大型直播' }[proj.format] || proj.format}</span>
            </div>
            <div class="project-meta-pills">
              <span class="project-meta-tag">片廠：${safe(studio?.name || '專用影棚')}</span>
              <span class="project-meta-tag">策略：${safe(strat?.name || strat?.label || '平衡')}</span>
              <span class="project-meta-tag">受眾：${safe(aud?.name || aud?.label || '全家歡')}</span>
              <span class="project-meta-tag">導演：${safe(dir?.name || '自聘')}</span>
              <span class="project-meta-tag">編審：${safe(wri?.name || '自聘')}</span>
              <span class="project-meta-tag">時長：${proj.episodeHours}小時/集</span>
              <button type="button" class="project-meta-tag qc-strat-btn" style="background:${proj.autoQCDecision === 'manual' ? 'rgba(239, 68, 68, 0.15)' : proj.autoQCDecision === 'fix_errors' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)'}; color:${proj.autoQCDecision === 'manual' ? '#f87171' : proj.autoQCDecision === 'fix_errors' ? '#34d399' : '#38bdf8'}; border:1px solid ${proj.autoQCDecision === 'manual' ? 'rgba(239, 68, 68, 0.35)' : proj.autoQCDecision === 'fix_errors' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(56, 189, 248, 0.35)'}; cursor:pointer; font-size:0.75rem;" title="點擊切換本企劃審片策略 (原樣直接交付 / 自動修復瑕疵 / 逐集手動詢問)" data-action="toggle-project-qc-strategy" data-project-id="${proj.id}">
                ${proj.autoQCDecision === 'fix_errors' ? '🛠️ 審片：自動修復瑕疵' : proj.autoQCDecision === 'manual' ? '📋 審片：逐集手動詢問' : '⚡ 審片：原樣直接交付 (免彈窗)'} (點擊切換)
              </button>
              ${proj.episodes.some(e => e.status === 'qc_ready') ? `
                <button type="button" class="project-meta-tag" style="background:rgba(245, 158, 11, 0.2); color:#fbbf24; border:1px solid rgba(245, 158, 11, 0.5); cursor:pointer; font-size:0.75rem; font-weight:bold;" data-action="batch-deliver-qc" data-project-id="${proj.id}">
                  ⚡ 一鍵全數通過交付 (${proj.episodes.filter(e => e.status === 'qc_ready').length} 集待審)
                </button>
              ` : ''}
              ${proj.autoChoices && Object.keys(proj.autoChoices).length > 0 ? `
                <button type="button" class="project-meta-tag" style="background:rgba(16, 185, 129, 0.15); color:#34d399; border:1px solid rgba(16, 185, 129, 0.35); cursor:pointer; font-size:0.75rem;" title="點擊可清除此企劃已記住的自動決策設定" data-action="reset-project-auto-choices" data-project-id="${proj.id}">
                  🤖 已記住 ${Object.keys(proj.autoChoices).length} 項事件自動依循（點擊重設）
                </button>
              ` : ''}
            </div>
          </div>
          <div class="project-cost-summary">
            <span class="project-cost-label">累積花費 / 每集預算</span>
            <span class="project-cost-val">${money(proj.totalCostSpent)} <small style="font-size:0.75rem; color:#94a3b8;">/ 每集 ${money(proj.budgetPerEpisode)}</small></span>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:6px;">
              <span style="font-size:0.78rem; font-weight:700; color:#10b981;">已交付 ${proj.deliveredEpisodesCount} / ${proj.episodesCount} 集</span>
              <button class="remove-button" data-action="cancel-project" data-project-id="${proj.id}">腰斬</button>
            </div>
          </div>
        </div>

        <div class="ep-stage-strip">
          ${proj.episodes.map(ep => {
            const hasEvent = Boolean(ep.pendingEvent);
            const isQC = ep.status === 'qc_ready';
            const isDelivered = ep.status === 'delivered';
            const isAired = ep.status === 'aired';

            return `<div class="ep-stage-card ${hasEvent ? 'has-event' : ''} ${isQC ? 'qc-ready' : ''} ${isDelivered || isAired ? 'delivered' : ''}">
              <div class="ep-card-header">
                <span class="ep-card-title">第 ${ep.episodeNumber} 集</span>
                <span class="ep-stage-badge ${ep.stage}">${STAGE_NAMES[ep.stage] || ep.stage}</span>
              </div>
              <div class="ep-progress-bar">
                <div class="ep-progress-fill" style="width: ${Math.min(100, isDelivered || isAired ? 100 : ep.stageProgress)}%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.7rem;">
                <span style="color:#94a3b8;">進度 ${ep.stageProgress}%</span>
                <span style="font-weight:700; color:${isAired ? '#38bdf8' : isDelivered ? '#10b981' : isQC ? '#f59e0b' : '#cbd5e1'};">
                  ${STATUS_NAMES[ep.status] || ep.status}
                </span>
              </div>

              <div class="attr-mini-grid">
                <div class="attr-mini-col"><span>趣味</span><strong>${ep.fun}</strong></div>
                <div class="attr-mini-col"><span>演技</span><strong>${ep.acting}</strong></div>
                <div class="attr-mini-col"><span>執導</span><strong>${ep.direction}</strong></div>
                <div class="attr-mini-col"><span>特效</span><strong>${ep.technical}</strong></div>
                <div class="attr-mini-col ${ep.errors > 0 ? 'danger' : ''}"><span>瑕疵</span><strong>${ep.errors}</strong></div>
                <div class="attr-mini-col"><span>士氣</span><strong>${ep.morale}</strong></div>
                <div class="attr-mini-col"><span>期待</span><strong>${ep.expectations}</strong></div>
                <div class="attr-mini-col"><span>天數</span><strong>${ep.days}日</strong></div>
                <div class="attr-mini-col" style="grid-column: span 2;"><span>成本</span><strong>${money(ep.cost)}</strong></div>
              </div>

              ${hasEvent ? `
                <div class="ep-card-action">
                  <button class="ep-action-btn event-btn" data-action="open-event-modal" data-project-id="${proj.id}" data-episode="${ep.episodeNumber}">
                    ⚡ 片場突發：${safe(ep.pendingEvent.title)}
                  </button>
                </div>
              ` : ''}

              ${isQC ? `
                <div class="ep-card-action">
                  <button class="ep-action-btn qc-btn" data-action="open-qc-modal" data-project-id="${proj.id}" data-episode="${ep.episodeNumber}">
                    🔍 審片報告就緒 · 把關決策
                  </button>
                </div>
              ` : ''}

              ${isDelivered ? `
                <div style="font-size:0.7rem; color:#10b981; font-weight:700; text-align:center; padding:3px 0;">
                  ✓ 母帶已交，可於排播表播出
                </div>
              ` : ''}

              ${isAired ? `
                <div style="font-size:0.7rem; color:#38bdf8; font-weight:700; text-align:center; padding:3px 0;">
                  📺 已播映 · 收視 ${ep.rating}點
                </div>
              ` : ''}
            </div>`;
          }).join('')}
        </div>

        ${proj.ratingsHistory?.length ? `
          <div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #1e293b;">
            <div style="font-size:0.78rem; font-weight:800; color:#f8fafc; margin-bottom:8px;">
              📊 已播集數收視戰報（獨立核算）：
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${proj.ratingsHistory.map(h => `
                <span class="ep-rating-pill">
                  第 ${h.episodeNumber} 集：<strong>${h.rating}點</strong> (對手 ${h.rivalRating}點 · ${h.won ? '🏆 勝出' : '持平/落後'} · 廣告 ${money(h.revenue || 0)})
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function renderCreateProjectView() {
  const isDrama = newProjState.format === 'drama';
  const isNewsOrDoc = newProjState.format === 'news' || newProjState.format === 'documentary';
  const isVarietyOrLive = newProjState.format === 'variety' || newProjState.format === 'live';
  const studio = (state.studios ?? DEFAULT_STUDIOS).find(s => s.id === newProjState.assignedStudioId) || DEFAULT_STUDIOS[0];
  const strat = PRODUCTION_STRATEGIES.find(s => s.id === newProjState.strategy) || PRODUCTION_STRATEGIES[1];
  const budgetTier = BUDGETS.find(b => b.id === newProjState.budgetId) || BUDGETS[1];
  const suggestedTitles = generateSuggestedTitles(newProjState.format, newProjState.genre, '', newProjState.themes);

  const minCast = isDrama ? 2 : isNewsOrDoc ? 0 : 1;
  const maxCast = isDrama ? 4 : isVarietyOrLive ? 3 : 2;

  // Upfront pre-production commitment (25%) calculation & validation
  const perEpisodeBudget = Math.round(budgetTier.cost * (isDrama ? 1 : 0.85) * (1 + (newProjState.episodeHours - 1) * 0.45));
  const totalCost = perEpisodeBudget * newProjState.episodesCount;
  let upfrontCost = Math.round(totalCost * 0.25);
  const scriptDiscount = isToolActive(state, 'script_workshop');
  if (scriptDiscount) upfrontCost = Math.round(upfrontCost * 0.90);
  const hasCash = state.cash >= upfrontCost;
  const hasMinCast = newProjState.actorIds.length >= minCast;
  const canSubmit = hasCash && hasMinCast;

  const crewLabels = {
    drama: { director: '監製／執導導演', writer: '編審／金牌編劇' },
    variety: { director: '綜藝監製／節目編導', writer: '編審／節目企劃' },
    news: { director: '新聞總監／採訪主任', writer: '主筆編審／首席記者' },
    documentary: { director: '紀錄片總監／執行導演', writer: '專題編審／調研編劇' },
    talkshow: { director: '清談節目監製／現場編導', writer: '題目編審／主筆企劃' },
    live: { director: '大會總監製／導播導演', writer: '流程編審／大會撰稿' }
  }[newProjState.format] || { director: '監製／執導導演', writer: '編審／金牌編劇' };

  const formatCrews = getCrewsForFormat(newProjState.format, state);
  const formatDirectors = formatCrews.filter(c => c.role === 'director');
  const formatWriters = formatCrews.filter(c => c.role === 'writer');

  if (!formatDirectors.some(d => d.id === newProjState.directorId)) {
    newProjState.directorId = formatDirectors[0]?.id || 'dir_lee';
  }
  if (!formatWriters.some(w => w.id === newProjState.writerId)) {
    newProjState.writerId = formatWriters[0]?.id || 'wri_cheung';
  }

  const allActors = ACTORS;
  const filteredActors = allActors.filter(a => {
    const avail = checkPerformerAvailability(state, a.id);
    const talent = state.talent[a.id];
    const isMine = talent?.station === 'player' && talent?.contractExpiresDay > state.day;
    const isCompetitorLocked = talent?.station && talent.station !== 'player' && talent.station !== 'free' && Number.isInteger(talent.contractExpiresDay) && talent.contractExpiresDay > state.day;

    if (newProjCastFilter === 'avail') {
      return avail.available && !isCompetitorLocked;
    }
    if (newProjCastFilter === 'mine') {
      return isMine;
    }
    if (newProjCastFilter === 'free') {
      return !isCompetitorLocked && !isMine;
    }
    return true;
  });

  return `<div class="create-proj-form">
    <div class="panel-heading">
      <div>
        <div class="eyebrow gold">PROGRAMME PRODUCTION ENGINE</div>
        <h1>影視企劃立項</h1>
      </div>
      <span class="quota">全深度製作流程 · 支持多集並行、片場決策與審片驗收</span>
    </div>

    <!-- Title -->
    <div class="form-group">
      <label class="form-label">節目片名</label>
      <div class="title-input-row">
        <input class="form-input" style="flex:1;" type="text" placeholder="輸入企劃片名（如留空將自動生成）" value="${safe(newProjState.title)}" data-action="new-proj-title-input" />
        <button class="suggest-title-btn" data-action="new-proj-suggest-title">🎲 劇名靈感</button>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
        ${suggestedTitles.map(t => `<button class="title-chip ${newProjState.title === t ? 'chosen' : ''}" data-action="new-proj-pick-title" data-value="${safe(t)}">${safe(t)}</button>`).join('')}
      </div>
    </div>

    <!-- Format -->
    <div class="form-group">
      <label class="form-label">節目類型與形態</label>
      <div class="choice-grid" style="grid-template-columns: repeat(6, 1fr);">
        ${[
          { id: 'drama', label: '旗艦劇集' },
          { id: 'variety', label: '自製綜藝' },
          { id: 'news', label: '新聞資訊' },
          { id: 'documentary', label: '深度紀錄' },
          { id: 'talkshow', label: '夜間清談' },
          { id: 'live', label: '直播盛事' }
        ].map(fmt => `
          <button class="choice ${newProjState.format === fmt.id ? 'chosen' : ''}" data-action="new-proj-format" data-value="${fmt.id}">
            ${fmt.label}
          </button>
        `).join('')}
      </div>
    </div>

    ${isDrama ? `
      <!-- Genre & Themes -->
      <div class="form-grid-2col">
        <div class="form-group">
          <label class="form-label">核心劇種</label>
          <div class="choice-grid" style="grid-template-columns: repeat(4, 1fr);">
            ${GENRES.slice(0, 12).map(g => `
              <button class="choice ${newProjState.genre === g ? 'chosen' : ''}" data-action="new-proj-genre" data-value="${g}">
                ${g}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">搭配題材 (選 1 至 2 個)</label>
          <div class="choice-grid" style="grid-template-columns: repeat(4, 1fr);">
            ${THEMES.slice(0, 12).map(t => `
              <button class="choice ${newProjState.themes.includes(t) ? 'chosen' : ''}" data-action="new-proj-theme" data-value="${t}">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Target Audience & Strategy -->
    <div class="form-grid-2col">
      <div class="form-group">
        <label class="form-label">定位目標受眾</label>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${TARGET_AUDIENCES.map(aud => `
            <button class="style-choice ${newProjState.targetAudience === aud.id ? 'chosen' : ''}" data-action="new-proj-audience" data-value="${aud.id}">
              <strong>${safe(aud.name || aud.label)}</strong>
              <small>${safe(aud.desc)}</small>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">製作管理策略</label>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${PRODUCTION_STRATEGIES.map(st => `
            <button class="style-choice ${newProjState.strategy === st.id ? 'chosen' : ''}" data-action="new-proj-strategy" data-value="${st.id}">
              <strong>${safe(st.name || st.label)}</strong>
              <small>${safe(st.desc)}</small>
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Episodes, Runtime, Budget, Studio -->
    <div class="form-grid-2col">
      <div class="form-group">
        <label class="form-label">集數規劃與每集時長</label>
        <div style="display:flex; gap:8px; margin-bottom:8px;">
          <span style="font-size:0.75rem; color:#94a3b8; align-self:center;">總集數：</span>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${[1, 2, 4, 8, 12, 15, 20, 25, 30].map(cnt => `
              <button class="choice ${newProjState.episodesCount === cnt ? 'chosen' : ''}" style="min-width:44px;" data-action="new-proj-ep-count" data-value="${cnt}">
                ${cnt}集
              </button>
            `).join('')}
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <span style="font-size:0.75rem; color:#94a3b8; align-self:center;">每集時長：</span>
          <div style="display:flex; gap:6px;">
            ${[1, 2, 3, 4].map(h => `
              <button class="choice ${newProjState.episodeHours === h ? 'chosen' : ''}" style="min-width:44px;" data-action="new-proj-ep-hours" data-value="${h}">
                ${h}小時
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">預算級別與指派片廠</label>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
          ${BUDGETS.map(b => `
            <button class="choice ${newProjState.budgetId === b.id ? 'chosen' : ''}" data-action="new-proj-budget" data-value="${b.id}">
              ${b.label} (${money(b.cost)})
            </button>
          `).join('')}
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${(state.studios ?? DEFAULT_STUDIOS).map(s => `
            <button class="choice ${newProjState.assignedStudioId === s.id ? 'chosen' : ''}" data-action="new-proj-studio" data-value="${s.id}">
              ${s.name} (Lv${s.level} · 容納${s.capacity}集)
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Crew: Director & Writer -->
    <div class="form-grid-2col">
      <div class="form-group">
        <label class="form-label">${crewLabels.director}</label>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${formatDirectors.map(d => `
            <button class="style-choice ${newProjState.directorId === d.id ? 'chosen' : ''}" data-action="new-proj-director" data-value="${d.id}">
              <strong>${safe(d.name)} (${safe(d.title)}) · 能力 ${d.skill}</strong>
              <small>擅長：${safe(d.specialty)} · 聘用費 ${money(d.fee)} · ${safe(d.desc)}</small>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${crewLabels.writer}</label>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${formatWriters.map(w => `
            <button class="style-choice ${newProjState.writerId === w.id ? 'chosen' : ''}" data-action="new-proj-writer" data-value="${w.id}">
              <strong>${safe(w.name)} (${safe(w.title)}) · 能力 ${w.skill}</strong>
              <small>擅長：${safe(w.specialty)} · 編審費 ${money(w.fee)} · ${safe(w.desc)}</small>
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Casting Selection with Conflict Checks & Filters -->
    <div class="form-group">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
        <label class="form-label" style="margin-bottom:0;">
          ${isDrama ? '領銜主演陣容' : isNewsOrDoc ? '特約主持／記者嘉賓（選填）' : '主持／嘉賓陣容'} (已選 ${newProjState.actorIds.length} / ${maxCast} 位${minCast > 0 ? `，最少 ${minCast} 位` : '，內部團隊主理'})
        </label>
        <div class="cast-filter-row" style="margin-bottom:0;">
          <button class="choice mini ${newProjCastFilter === 'all' ? 'chosen' : ''}" data-action="new-proj-cast-filter" data-value="all">全部 (${allActors.length})</button>
          <button class="choice mini ${newProjCastFilter === 'avail' ? 'chosen' : ''}" data-action="new-proj-cast-filter" data-value="avail">檔期可用</button>
          <button class="choice mini ${newProjCastFilter === 'mine' ? 'chosen' : ''}" data-action="new-proj-cast-filter" data-value="mine">旗下專屬</button>
          <button class="choice mini ${newProjCastFilter === 'free' ? 'chosen' : ''}" data-action="new-proj-cast-filter" data-value="free">自由身可聘</button>
        </div>
      </div>

      ${isNewsOrDoc && newProjState.actorIds.length === 0 ? `
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; font-size: 0.78rem; color: #93c5fd;">
          📰 <strong>內部編採製作：</strong>新聞及紀錄片默認由電視台全職編採記者與新聞主播負責，無需額外聘請明星藝人。如需特約主持，亦可於下方挑選 1 至 2 位。
        </div>
      ` : ''}

      <div class="cast-select-container">
        ${filteredActors.length === 0 ? `
          <div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
            此篩選條件下無符合藝人。可切換至「全部」或「檔期可用」，或前往【藝人台柱中心】簽約專屬藝人。
          </div>
        ` : filteredActors.map(a => {
          const avail = checkPerformerAvailability(state, a.id);
          const isSelected = newProjState.actorIds.includes(a.id);
          const talent = state.talent[a.id];
          const isMine = talent?.station === 'player' && talent?.contractExpiresDay > state.day;
          const isCompetitorLocked = talent?.station && talent.station !== 'player' && talent.station !== 'free' && Number.isInteger(talent.contractExpiresDay) && talent.contractExpiresDay > state.day;

          return `<div class="cast-pick-card ${isSelected ? 'selected' : ''} ${(!avail.available || isCompetitorLocked) ? 'busy' : ''}" data-action="new-proj-actor" data-value="${a.id}">
            <div>
              <div class="cast-pick-name">${a.name} ${isMine ? '<span style="color:#10b981; font-size:0.65rem;">(旗下)</span>' : ''}</div>
              <div style="font-size:0.68rem; color:#94a3b8;">知名度 ${(talent?.fame ?? (a.skill - 10)).toFixed(1)} · 演技 ${a.skill}</div>
            </div>
            <div>
              ${isCompetitorLocked ? `
                <span class="cast-pick-status busy" title="正與${getStationName(talent.station)}簽署專屬約">🔒 ${getStationName(talent.station)}</span>
              ` : !avail.available ? `
                <span class="cast-pick-status busy" title="${safe(avail.reason)}">⚠️ 檔期衝突</span>
              ` : isSelected ? `
                <span class="cast-pick-status free">✓ 已選</span>
              ` : `
                <span style="font-size:0.7rem; color:#f59e0b; font-weight:700;">+ 挑選</span>
              `}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Budget Summary Bar -->
    <div class="project-budget-summary-bar">
      <div class="summary-metric">
        <small>單集製作預算</small>
        <strong>${money(perEpisodeBudget)} / 集</strong>
      </div>
      <div class="summary-metric">
        <small>全劇 ${newProjState.episodesCount} 集總預算</small>
        <strong>${money(totalCost)}</strong>
      </div>
      <div class="summary-metric">
        <small>前期啟動金 (25% 籌備款${scriptDiscount ? ' · 編劇坊 9折' : ''})</small>
        <strong class="${hasCash ? 'gold-text' : 'danger'}">${money(upfrontCost)}</strong>
      </div>
      <div class="summary-metric">
        <small>電視台當前可用資金</small>
        <strong class="${hasCash ? '' : 'danger'}">${money(state.cash)}</strong>
      </div>
    </div>

    <button class="primary-button project-submit-btn" style="margin-top:12px; width:100%; font-size:1.05rem; padding:12px;" data-action="new-proj-submit" ${!canSubmit ? 'disabled' : ''}>
      ${!hasCash
        ? `資金不足 · 需前期啟動準備金 ${money(upfrontCost)}（現有資金 ${money(state.cash)}）`
        : !hasMinCast
          ? (minCast === 1 ? '最少須挑選 1 位節目主持或司儀' : `最少須挑選 ${minCast} 位主要主演`)
          : `正式開機立項《${safe(newProjState.title || (isDrama ? `${newProjState.genre}新劇` : '精選節目'))}》· 扣除前期款 ${money(upfrontCost)} ↗`
      }
    </button>
  </div>`;
}

function renderStudiosCrewView() {
  const studios = state.studios ?? DEFAULT_STUDIOS;
  const allCrews = getAllCrews(state);
  const filteredCrews = crewFormatFilter === 'all'
    ? allCrews
    : allCrews.filter(c => (c.format || 'drama') === crewFormatFilter);

  const formatNames = {
    drama: '旗艦劇集',
    variety: '自製綜藝',
    news: '新聞資訊',
    documentary: '深度紀錄',
    talkshow: '夜間清談',
    live: '直播盛事'
  };

  return `<div class="studios-crew-grid">
    <div class="studios-list">
      <div class="panel-heading small">
        <div>
          <div class="eyebrow gold">PRODUCTION FACILITIES</div>
          <h2>電視影城各片廠設施</h2>
        </div>
      </div>
      ${studios.map(s => {
        const canUpgrade = s.level < 3;
        const upgradeCost = s.level === 1 ? 1_500_000 : 3_500_000;
        return `<div class="studio-card">
          <div class="studio-card-info">
            <div class="studio-card-name">
              ${safe(s.name)}
              <span class="studio-card-level">Level ${s.level}</span>
            </div>
            <div class="studio-card-desc">${safe(s.desc)}</div>
            <div class="studio-card-metrics">
              <span>並行製作容量：<strong>${s.capacity} 集</strong></span>
              <span>製作效率：<strong>${Math.round(s.efficiency * 100)}%</strong></span>
              <span>品質加成：<strong>+${s.bonus} 點</strong></span>
            </div>
          </div>
          ${canUpgrade ? `
            <button class="studio-upgrade-btn" data-action="upgrade-studio" data-studio-id="${s.id}" ${state.cash < upgradeCost ? 'disabled' : ''}>
              擴建升級 Lv${s.level + 1} (${money(upgradeCost)})
            </button>
          ` : `
            <span style="font-size:0.75rem; color:#10b981; font-weight:800; white-space:nowrap;">已升滿最高級</span>
          `}
        </div>`;
      }).join('')}
    </div>

    <div class="crews-list panel" style="padding: 20px;">
      <div class="panel-heading small">
        <div>
          <div class="eyebrow muted">CREATIVE MASTERS</div>
          <h2>全台金牌編導與編審企劃班底</h2>
        </div>
      </div>

      <!-- Format Filter Row -->
      <div class="cast-filter-row" style="margin-bottom:12px;">
        <button class="choice mini ${crewFormatFilter === 'all' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="all">全部 (${allCrews.length})</button>
        <button class="choice mini ${crewFormatFilter === 'drama' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="drama">劇集</button>
        <button class="choice mini ${crewFormatFilter === 'variety' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="variety">綜藝</button>
        <button class="choice mini ${crewFormatFilter === 'news' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="news">新聞</button>
        <button class="choice mini ${crewFormatFilter === 'documentary' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="documentary">紀錄</button>
        <button class="choice mini ${crewFormatFilter === 'talkshow' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="talkshow">清談</button>
        <button class="choice mini ${crewFormatFilter === 'live' ? 'chosen' : ''}" data-action="crew-format-filter" data-value="live">盛事</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; max-height:480px; overflow-y:auto; padding-right:4px;">
        ${filteredCrews.map(c => `
          <div style="background:#0f172a; padding:10px 12px; border-radius:8px; border:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.85rem; font-weight:800; color:#f8fafc;">
                ${safe(c.name)} <span style="font-size:0.7rem; color:#f59e0b; margin-left:6px;">${safe(c.title)}</span>
                <span style="font-size:0.65rem; background:#1e293b; color:#93c5fd; padding:1px 6px; border-radius:4px; margin-left:6px;">${formatNames[c.format] || '全能'}</span>
              </div>
              <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
                專長：${safe(c.specialty)} · 能力 ${c.skill} · ${c.role === 'director' ? '導演／總監' : '編審／企劃'}
              </div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.78rem; font-weight:800; color:#fbbf24;">${money(c.fee)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function renderFranchisesView() {
  const completed = (state.productionProjects ?? []).filter(p => p.status === 'completed' || p.status === 'delivered');
  if (!completed.length) {
    return `<div class="panel" style="text-align: center; padding: 48px 24px;">
      <div style="font-size: 2.5rem; margin-bottom: 12px;">🏆</div>
      <h2>暫未有歷年殺青系列</h2>
      <p style="color: #94a3b8; max-width: 500px; margin: 8px auto 20px;">
        當你的影視作品全部集數製作交付並播映後，將會在此處歸檔為經典 IP。可一鍵立項續作（Season 2）或外傳，傳承口碑與收視期待！
      </p>
    </div>`;
  }

  return `<div class="franchises-list">
    ${completed.map(p => {
      const avgRating = p.ratingsHistory?.length
        ? (p.ratingsHistory.reduce((s, r) => s + r.rating, 0) / p.ratingsHistory.length).toFixed(1)
        : '尚未播出';

      return `<div class="franchise-card">
        <div class="franchise-card-header">
          <div>
            <div class="franchise-title">《${safe(p.title)}》</div>
            <div style="font-size:0.75rem; color:#94a3b8; margin-top:3px;">
              ${p.genre} · 共 ${p.episodesCount} 集 · 均值收視 ${avgRating}點
            </div>
          </div>
          <div>
            <span style="background:#10b98120; color:#34d399; padding:3px 10px; border-radius:10px; font-size:0.75rem; font-weight:800; border:1px solid #10b98150;">
              已殺青入庫
            </span>
          </div>
        </div>

        ${p.ratingsHistory?.length ? `
          <div class="franchise-ep-ratings">
            ${p.ratingsHistory.map(h => `
              <span class="ep-rating-pill">第 ${h.episodeNumber} 集: <strong>${h.rating}點</strong></span>
            `).join('')}
          </div>
        ` : ''}

        <div class="franchise-actions">
          <button class="franchise-btn" data-action="create-sequel" data-project-id="${p.id}" data-type="next_season">
            🎬 立項第 ${(p.seasonNumber || 1) + 1} 季 (Season ${(p.seasonNumber || 1) + 1})
          </button>
          <button class="franchise-btn" data-action="create-sequel" data-project-id="${p.id}" data-type="spin_off">
            🌟 開拍外傳前傳 (Spin-off)
          </button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderFilmingEventModal() {
  if (!activeEventModal) return '';
  const project = (state.productionProjects ?? []).find(p => p.id === activeEventModal.projectId);
  const ep = project?.episodes.find(e => e.episodeNumber === activeEventModal.episodeNumber);
  const ev = ep?.pendingEvent;
  if (!ev) return '';

  return `<div class="studio-modal-backdrop">
    <div class="studio-modal-card">
      <div class="studio-modal-header">
        <div class="studio-modal-title">
          <span>⚡</span>
          <span>片場突發事件：${safe(ev.title)}</span>
        </div>
        <button class="studio-modal-close" data-action="close-event-modal">✕</button>
      </div>

      <div class="studio-modal-desc">
        《${safe(project.title)}》第 ${ep.episodeNumber} 集正在片場實景攝製中！${safe(ev.description)}
      </div>

      <label class="modal-auto-choice-tick" style="display:flex; align-items:center; gap:10px; margin: 12px 0 16px; padding: 10px 14px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; cursor: pointer;">
        <input type="checkbox" id="filming-event-remember-tick" checked style="width:16px; height:16px; accent-color:#3b82f6; cursor:pointer;" />
        <span style="font-size:0.85rem; color:#e2e8f0; user-select:none;">
          <strong>☑️ 記住此選擇</strong>：本企劃往後若遇相同突發問題，自動以此方案解決（不再打斷）
        </span>
      </label>

      <div class="modal-choices-list">
        ${ev.choices.map(c => `
          <button class="modal-choice-card" data-action="filming-event-choice" data-choice-id="${c.id}">
            <div class="modal-choice-info">
              <span class="modal-choice-label">${safe(c.text)}</span>
              <span class="modal-choice-desc">
                ${c.acting ? `演技 +${c.acting} ` : ''}
                ${c.direction ? `執導 +${c.direction} ` : ''}
                ${c.fun ? `趣味 +${c.fun} ` : ''}
                ${c.technical ? `特效 +${c.technical} ` : ''}
                ${c.errors ? `瑕疵 +${c.errors} ` : ''}
                ${c.morale ? `士氣 ${c.morale > 0 ? '+' : ''}${c.morale} ` : ''}
                ${c.expectations ? `期待 +${c.expectations} ` : ''}
              </span>
            </div>
            <div>
              ${c.cost ? `<span class="modal-choice-cost">${money(c.cost)}</span>` : '<span class="modal-choice-cost" style="color:#10b981;">免費</span>'}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function renderQCModal() {
  if (!activeQCModal) return '';
  const project = (state.productionProjects ?? []).find(p => p.id === activeQCModal.projectId);
  const ep = project?.episodes.find(e => e.episodeNumber === activeQCModal.episodeNumber);
  const report = ep?.qcReport;
  if (!report) return '';

  return `<div class="studio-modal-backdrop">
    <div class="studio-modal-card">
      <div class="studio-modal-header">
        <div class="studio-modal-title">
          <span>🔍</span>
          <span>質量把關審片檢驗報告（第 ${ep.episodeNumber} 集）</span>
        </div>
        <button class="studio-modal-close" data-action="close-qc-modal">✕</button>
      </div>

      <div class="studio-modal-desc">
        《${safe(project.title)}》第 ${ep.episodeNumber} 集後期初剪已經完成！審片委員會提交質量驗收報告，請管理層決定交付策略：
      </div>

      <div class="qc-stats-summary">
        <div class="qc-stats-col"><span>趣味橋段</span><strong>${ep.fun}</strong></div>
        <div class="qc-stats-col"><span>演員演出</span><strong>${ep.acting}</strong></div>
        <div class="qc-stats-col"><span>執導調度</span><strong>${ep.direction}</strong></div>
        <div class="qc-stats-col"><span>聲光特效</span><strong>${ep.technical}</strong></div>
        <div class="qc-stats-col" style="grid-column: span 2; ${ep.errors > 0 ? 'color:#f87171;' : ''}">
          <span>製作瑕疵</span><strong style="${ep.errors > 0 ? 'color:#f87171;' : ''}">${ep.errors} 處毛病</strong>
        </div>
        <div class="qc-stats-col" style="grid-column: span 2;"><span>觀眾期待值</span><strong>${ep.expectations} 點</strong></div>
      </div>

      <div style="margin: 12px 0 16px; padding: 10px 14px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; color: #f8fafc; user-select: none;">
          <input type="checkbox" id="qc-remember-tick" checked style="width: 16px; height: 16px; cursor: pointer; accent-color: #38bdf8;" />
          <span>☑️ 記住此審片策略：本企劃往後各集自動以此方案驗收交付（不再逐集彈出詢問）</span>
        </label>
      </div>

      <div class="modal-choices-list">
        ${report.choices.map(c => `
          <button class="modal-choice-card" data-action="qc-decision" data-decision-id="${c.id}" ${c.cost > state.cash ? 'disabled' : ''}>
            <div class="modal-choice-info">
              <span class="modal-choice-label">${safe(c.label)}</span>
              <span class="modal-choice-desc">${safe(c.desc)}</span>
            </div>
            <div>
              ${c.cost ? `<span class="modal-choice-cost">${money(c.cost)}</span>` : '<span class="modal-choice-cost" style="color:#10b981;">免費交付</span>'}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function scheduleHome(){
  const result=runSummary??(state.lastDayResult?{days:1,net:state.lastDayResult.net,wins:state.lastDayResult.wins}:null);
  const completed=runSummary?.completed??state.lastDayResult?.completed??[];
  const expired=runSummary?.expired??state.lastDayResult?.expired??[];
  const replayReady=state.library.filter(p=>canReplayProgram(p,state.day));
  const completedSummary = completed.length <= 3
    ? completed.map(name => `《${safe(name)}》`).join('、')
    : `《${safe(completed[0])}》、《${safe(completed[1])}》等共 ${completed.length} 套節目`;
  const isSubChannel = state.subChannelUnlocked && scheduleChannel === 2;

  return `<div class="schedule-home">
    ${state.subChannelUnlocked ? `
      <div class="channel-switch-bar">
        <button class="channel-tab ${scheduleChannel===1?'active':''}" data-action="switch-channel" data-channel="1">
          📺 1台 · 翡翠主台 (旗艦頻道 · 24小時自選排播)
        </button>
        <button class="channel-tab ${scheduleChannel===2?'active':''}" data-action="switch-channel" data-channel="2">
          📺 2台 · 數碼二台 (J2 / 體育外購副台 · 每日副線廣告 +28%)
        </button>
      </div>
    ` : `
      <div class="subchannel-unlock-banner">
        <div class="banner-icon">📺</div>
        <div class="banner-body">
          <strong>開辦「數碼二台」（雙頻道雙線營運）</strong>
          <p>解鎖第 2 條 24 小時頻道（明珠台/J2/外購體育副台），每日額外賺取主台 28% 之副線廣告收入！</p>
          <div class="banner-reqs">
            <span class="${state.cash >= 35_000_000 || (state.boardSatisfaction ?? 70) >= 80 ? 'met' : 'unmet'}">
              ✓ 門檻：資金 $3,500 萬 或 董事會滿意度 80 分
            </span>
            <span>牌照及基建費：${money(10_000_000)}</span>
          </div>
        </div>
        <button class="gold-button" data-action="unlock-subchannel" ${state.cash >= 10_000_000 && (state.cash >= 35_000_000 || (state.boardSatisfaction ?? 70) >= 80 || (state.history ?? []).some(h => h.net > 6_000_000)) ? '' : 'disabled'}>
          申請開辦數碼二台 ($10.0m) →
        </button>
      </div>
    `}
    ${result?`<div class="day-result-strip" role="status"><span>最近 ${result.days} 日營運</span><strong class="${result.net<0?'danger':''}">${result.net>=0?'+':''}${money(result.net)}</strong><span>對台勝出 ${result.wins} / ${24*result.days} 小時</span>${state.lastDayResult?.highlights?.top?`<span class="highlight-strip-pill top">🏆 今日焦點：《${safe(state.lastDayResult.highlights.top.title)}》（${state.lastDayResult.highlights.top.rating}分）</span>`:''}<button data-action="tab" data-tab="reports">逐套節目成績 →</button></div>`:''}
    ${completed.length && !dismissedAlerts.completed?`
      <div class="completion-alert has-dismiss" role="status">
        <div class="alert-content">
          <strong>${completedSummary}已播完</strong>
          <span>原有時段已騰空。請即刻補上新節目，空檔冇廣告收入。</span>
          ${completed.length > 3 ? `<button class="inline-link-btn" data-action="toggle-completed-expand">${expandedCompleted ? '收起名單 ▴' : `展開全部 ${completed.length} 套名單 ▾`}</button>` : ''}
          ${expandedCompleted && completed.length > 3 ? `<div class="alert-expanded-list">${completed.map(name => `<span>《${safe(name)}》</span>`).join('')}</div>` : ''}
        </div>
        <button class="alert-dismiss-btn" data-action="dismiss-alert" data-alert="completed" title="關閉提示" aria-label="關閉提示">✕</button>
      </div>`:''}
    ${expired.length && !dismissedAlerts.expired?`
      <div class="completion-alert has-dismiss" role="status">
        <div class="alert-content">
          <strong>${expired.map(name=>`《${safe(name)}》`).join('、')}播映權到期</strong>
          <span>時段已騰空。可去片庫續購，或換其他節目。</span>
          <button data-action="open-renew-tab">去續約 →</button>
        </div>
        <button class="alert-dismiss-btn" data-action="dismiss-alert" data-alert="expired" title="關閉提示" aria-label="關閉提示">✕</button>
      </div>`:''}
    ${isSubChannel ? subChannelView() : scheduleView()}
  </div>`;
}

function broadcastResultsView(){
  const reports=state.broadcastReports?.length?state.broadcastReports:state.lastDayResult?[{day:state.lastDayResult.day,details:state.lastDayResult.details??[],highlights:state.lastDayResult.highlights}]:[];
  if(!reports.length)return '';
  const report=reports.find(item=>item.day===selectedBroadcastDay)??reports[0];
  const entries=[...report.details].sort((a,b)=>a.start-b.start);
  const charity=entries.filter(item=>item.kind==='charity').length;
  const currentHighlights=report.highlights || (state.lastDayResult?.day===report.day ? state.lastDayResult.highlights : null);
  return `<section class="panel broadcast-results" aria-label="逐套節目播映成績"><div class="section-heading"><div><div class="eyebrow gold">ON AIR RESULTS</div><h2>逐套節目成績戰報</h2></div><span class="report-meta-tag">第 ${report.day} 日 · ${entries.length} 個播映時段</span></div><p class="broadcast-results-help">即時播映成效報告：收視指數（0–100）與同時段最強對手比拼，廣告收入即日入帳。</p><div class="broadcast-days" aria-label="選擇播映日">${reports.map(item=>`<button data-action="broadcast-day" data-day="${item.day}" class="${item.day===report.day?'active':''}" aria-pressed="${item.day===report.day}">第 ${item.day} 日</button>`).join('')}</div>${dailyHighlightsView(currentHighlights, report.day)}${charity?`<p class="charity-summary">累計慈善籌款 ${hourlyMoney(state.charityRaised??0)} · 款項不屬電視台資金</p>`:''}<div class="broadcast-result-grid">${entries.length?entries.map(item=>{const rival=Number.isFinite(item.rivalRating)?item.rivalRating:state.lastDayResult?.day===report.day?Math.max(...(state.lastDayResult.hours??[]).filter(hour=>hour&&hour.title===item.title&&hour.hour>=item.start&&hour.hour<item.start+item.duration).flatMap(hour=>hour.rivals??[0])):null;const won=Number.isFinite(rival)?item.rating>rival:null;const diff=Number.isFinite(rival)?item.rating-rival:0;const diffText=diff>0?`+${diff}`:`${diff}`;const totalRatings=Math.max(1,(item.rating+(rival||0)));const ourShare=Math.min(95,Math.max(5,Math.round((item.rating/totalRatings)*100)));return `<article class="broadcast-result-card ${won===true?'won':won===false?'lost':''}"><div class="broadcast-result-top"><span class="broadcast-time-tag">${hourLabel(item.start)}–${hourLabel(item.start+item.duration)}</span>${item.freshness!==undefined?(()=>{const f=freshnessLabel(item.freshness,item.maxFreshness);return `<span class="freshness-result-pill ${f.tier}" title="新鮮度 ${f.percent}% (上限 ${f.max}%) · ${f.desc}">${f.icon} ${f.percent}%</span>`;})():''}${item.eventMod?`<span class="event-mod-tag ${item.eventMod>0?'boost':'debuff'}">${item.eventMod>0?`▲ 突發 +${item.eventMod}`:`▼ 突發 ${item.eventMod}`}</span>`:''}<b class="battle-badge ${won===true?'won':won===false?'lost':''}">${won===null?'成績':won?`搶贏對台 ${diffText}`:`未能勝出 ${diffText}`}</b></div><div class="broadcast-title-row"><h3>《${safe(item.title)}》</h3><span class="broadcast-cat-tag">${safe(item.category||'節目')}</span></div><p class="broadcast-ep-line">${safe(item.episode||item.category||'節目播映')}</p><div class="battle-bar-box" title="我台 ${item.rating} : 對手 ${Number.isFinite(rival)?rival:'—'}"><div class="battle-bar-labels"><span>我台 <b>${item.rating}</b></span><span>對手 <b>${Number.isFinite(rival)?rival:'—'}</b></span></div><div class="battle-bar-track"><div class="battle-bar-fill" style="width:${ourShare}%"></div></div></div><div class="broadcast-result-stats"><div><small>我台收視</small><strong>${item.rating}</strong></div><div><small>最強對手</small><strong>${Number.isFinite(rival)?rival:'—'}</strong></div><div><small>廣告收入</small><strong class="gold-text">${hourlyMoney(item.revenue??0)}</strong></div></div>${item.effect?`<p class="broadcast-result-effect">★ ${safe(item.effect)}</p>`:''}${item.eventMod&&item.eventTitle?`<p class="event-mod-note">${item.eventMod>0?'🔥':'⚡'} 突發效應【${safe(item.eventTitle)}】：收視 ${item.eventMod>0?`+${item.eventMod}`:item.eventMod} 點</p>`:''}</article>`}).join(''):'<p class="empty">當日冇節目播映，排檔後先有逐套成績。</p>'}</div></section>`;
}

function premiereView(){
  const item=state.pendingPremieres?.[0];
  if(!item)return '';
  const profile=premiereProfile(item.kind);
  const difference=item.rating-item.rivalRating;
  const mood=item.won?'hit':'struggle';
  const spotlightExtra=item.kind==='night'&&item.start>=22?'、深夜檔收視額外 +2':item.kind==='variety'?'、熱度額外 +2':'';
  const improveExtra=item.kind==='drama'?'、劇集口碑額外 +2':item.kind==='news'||item.kind==='finance'?'、電視台口碑額外 +2':'';
  const momentum=item.momentum?`首播聲勢：下集預測收視 ${item.momentum.rating>0?'+':''}${item.momentum.rating}、話題 ${item.momentum.buzz>0?'+':''}${item.momentum.buzz}。`:'';
  return `<div class="premiere-backdrop"><section class="premiere-modal ${mood} kind-${safe(item.kind)}" role="dialog" aria-modal="true" aria-labelledby="premiere-title"><div class="premiere-light" aria-hidden="true"></div><div class="premiere-top"><span>${safe(profile.symbol)} ON AIR · ${safe(profile.label)}</span><b>第 ${item.day} 日 · ${hourLabel(item.start)}</b></div><div class="premiere-stage"><span class="premiere-beam" aria-hidden="true">${safe(profile.symbol)}</span><p>全城同步見證</p><h2 id="premiere-title">《${safe(item.title)}》</h2><strong>${item.won?'首播搶贏對台！':'首播遇上強敵'}</strong></div><div class="premiere-score"><div><small>我台首播收視</small><b>${item.rating}</b></div><span>VS</span><div><small>最強對手</small><b>${item.rivalRating}</b></div><em class="${item.won?'win':'lose'}">${difference>0?'+':''}${difference}</em></div><p class="premiere-reaction">${safe(profile.hook)}。${safe(momentum)}${item.won?'觀眾有反應，趁勢決定下一步。':'觀眾有保留，下一集仍有反擊機會。'}</p><div class="premiere-decisions"><button data-action="premiere-choice" data-value="spotlight" ${state.cash<120_000?'disabled':''}><strong>${safe(profile.spotlight)}</strong><small>花 $120k · 後續收視 +3、話題 +8、熱度 +1${spotlightExtra}</small></button><button data-action="premiere-choice" data-value="improve" ${state.cash<70_000?'disabled':''}><strong>${safe(profile.improve)}</strong><small>花 $70k · 後續收視 +2、品質 +3、口碑 +4${improveExtra}</small></button><button data-action="premiere-choice" data-value="steady"><strong>按原定節奏播落去</strong><small>免費 · 電視台口碑 +1${item.won?'、熱度 +1':''}</small></button></div><p class="premiere-foot">首播選擇會改變節目之後嘅表現；處理完先繼續播出下一日。</p></section></div>`;
}

function productionResult() {
  const p=state.lastProduction;
  const label=p.outcome==='cult'?'CULT CLASSIC':p.outcome==='disaster'?'BOX OFFICE DISASTER':isOneOffEvent(p.kind)?'LIVE EVENT':p.tier==='double-o'&&p.kind==='drama'?'PERFECT MATCH':'NEW PRODUCTION';
  return `<div class="result-card ${p.outcome}"><div class="result-head"><span>${label}</span><b>${safe(p.title)}</b></div><div class="result-spec">${isOneOffEvent(p.kind)?'一晚限定直播 · ':p.episodes?`${p.episodes} 集 · `:'每日更新 · '}${p.episodeHours} 小時${isOneOffEvent(p.kind)?'':'／集'} · ${safe(p.style)} · ${isOneOffEvent(p.kind)?'基礎':'每集'} ${preciseMoney(p.episodeCost)}</div><div class="result-stats"><div><small>節目品質</small><strong>${p.quality}</strong></div><div><small>口碑評分</small><strong>${p.review}</strong></div><div><small>預測收視</small><strong>${p.rating}</strong></div><div><small>網絡話題</small><strong>${p.buzz}</strong></div></div><p>${p.filmingStory?`${safe(p.filmingStory)} `:''}${p.outcome==='cult'?`隱藏骰子擲出 ${p.roll}！解鎖成就、特別贊助；相同組合未來四季成功率降至 1%。`:p.outcome==='disaster'?`隱藏骰子擲出 ${p.roll}。品質減 60%，傳統收視腰斬。`:`${p.cast.length?`主演：${p.cast.map(safe).join('、')}。`:''}節目已加入片庫，可安排播映時間。`}</p><button class="inline-button" data-action="schedule-new" data-id="${safe(p.id)}">安排播映時間 →</button></div>`;
}

function distributionView() {
  const originals=state.library.filter(p=>!p.id.startsWith('start-')&&p.kind!=='catalog'&&!(isDailyFormat(p.kind)&&!p.episodes)).slice(-5).reverse();
  return `<section class="panel distribution-panel"><div class="eyebrow cyan">DISTRIBUTION</div><h2>自製節目賣埠</h2><p>聯播授權：我台可繼續播；對手亦會喺未來 30 日晚間播出。獨家賣斷：收更多錢，但我台即時落畫。每台每套只可交易一次。</p>${originals.length?originals.map(p=>{const deals=(state.distributionDeals??[]).filter(d=>d.programId===p.id);return `<article class="sale-item"><strong>${safe(p.title)}</strong><small>投入 ${money(p.cost)} · 已售 ${deals.length} 間</small><div class="sale-actions">${state.rivals.map(r=>`<button data-action="sell" data-id="${safe(p.id)}" data-rival="${r.id}" ${p.soldExclusive||deals.some(d=>d.rivalId===r.id)?'disabled':''}>授權${safe(r.name)} ${preciseMoney(distributionQuote(p.soldExclusive?{...p,soldExclusive:false}:p,false))}</button>`).join('')}${!p.soldExclusive&&!deals.length?`<button data-action="sell-exclusive" data-id="${safe(p.id)}" data-rival="${state.rivals[0].id}">獨家賣斷 ${preciseMoney(distributionQuote(p,true))}</button>`:''}</div></article>`}).join(''):'<p class="empty">拍第一套自製節目之後，可以考慮賣畀其他台。</p>'}</section>`;
}

function adsView() {
  const strategy = state.adPricingStrategy ?? 'standard';
  const activeContracts = state.activeAdContracts ?? [];
  const market = state.adContractsMarket?.length ? state.adContractsMarket : AD_CONTRACT_TEMPLATES;

  return `<div class="game-grid ads-layout">
    <section class="panel ads-panel">
      <div class="panel-heading">
        <div>
          <div class="eyebrow gold">COMMERCIAL SPONSORSHIPS & PRICING</div>
          <h1>💼 動態廣告招商與定價</h1>
        </div>
        <span class="quota">進行中合約 ${activeContracts.length} / 3 份 · 現有資金 ${money(state.cash)}</span>
      </div>

      <!-- 1. 動態定價策略 -->
      <div class="pricing-strategy-box">
        <div class="section-title">
          <h3>📈 全台廣告定價策略 (Dynamic Pricing)</h3>
          <small>調整各時段廣告底價策略，直接改變每集廣播廣告收入倍率</small>
        </div>
        <div class="strategy-choices">
          <button class="strategy-card ${strategy === 'budget' ? 'active' : ''}" data-action="set-pricing-strategy" data-strategy="budget">
            <div class="strategy-head">
              <strong>特價推廣</strong>
              <span class="badge">薄利多銷</span>
            </div>
            <p>廣告費 -15%，吸引大量中小型品牌贊助，觀眾反感減少。</p>
          </button>
          <button class="strategy-card ${strategy === 'standard' ? 'active' : ''}" data-action="set-pricing-strategy" data-strategy="standard">
            <div class="strategy-head">
              <strong>標準定價</strong>
              <span class="badge">平衡穩健</span>
            </div>
            <p>按市場標準收視公式結算，兼顧收益與品牌客戶承接力。</p>
          </button>
          <button class="strategy-card ${strategy === 'premium' ? 'active' : ''}" data-action="set-pricing-strategy" data-strategy="premium">
            <div class="strategy-head">
              <strong>黃金檔溢價</strong>
              <span class="badge highlight">高價招商</span>
            </div>
            <p>18:00–24:00 黃金檔廣告費爆增 +30%！非黃金檔微跌 -5%。</p>
          </button>
        </div>
      </div>

      <!-- 2. 進行中品牌合約 -->
      <div class="active-contracts-box">
        <div class="section-title">
          <h3>📋 執行中品牌特約合約 (${activeContracts.length} / 3)</h3>
          <small>每日營運自動追蹤時段收視，合約期滿達標派發花紅，未達標扣付違約金</small>
        </div>
        ${activeContracts.length === 0 ? `
          <div class="empty-contract-callout">
            <p>現時尚未簽署品牌贊助合約。請在下方「各大品牌贊助名錄」挑選合約，簽約先收大筆預付款！</p>
          </div>
        ` : `
          <div class="contracts-grid">
            ${activeContracts.map(c => {
              const daysLeft = Math.max(0, (c.durationDays ?? 30) - (c.daysElapsed ?? 0));
              const currentAvg = c.ratings?.length ? (c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length) : 0;
              const progressPct = Math.min(100, Math.round(((c.daysElapsed ?? 0) / (c.durationDays ?? 30)) * 100));
              const isPassing = currentAvg >= c.targetRating;
              return `
                <div class="contract-card active">
                  <div class="contract-header">
                    <span class="contract-icon">${c.icon}</span>
                    <div class="contract-title-wrap">
                      <strong>${safe(c.name)}</strong>
                      <span class="contract-cat">${safe(c.category)}</span>
                    </div>
                    <span class="contract-status-pill ${isPassing ? 'passing' : 'warning'}">
                      ${isPassing ? '✓ 達標中' : '⚠️ 未達標'}
                    </span>
                  </div>
                  <p class="contract-target-line"><strong>目標要求：</strong>${safe(contractTargetDesc(c))}</p>
                  <div class="contract-metric-row">
                    <div>
                      <small>目前平均收視</small>
                      <strong class="${isPassing ? 'gold-text' : 'danger'}">${currentAvg.toFixed(1)} <span class="muted">/ 目標 ${c.targetRating}</span></strong>
                    </div>
                    <div>
                      <small>合約期尚餘</small>
                      <strong>${daysLeft} 日</strong>
                    </div>
                    <div>
                      <small>達標花紅</small>
                      <strong class="gold-text">+${money(c.bonusPayment)}</strong>
                    </div>
                  </div>
                  <div class="contract-progress-bar">
                    <div class="progress-fill" style="width: ${progressPct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- 3. 贊助商招商名錄 -->
      <div class="market-contracts-box">
        <div class="section-title">
          <h3>🏢 各大品牌贊助商招商名錄</h3>
          <small>名車、名錶、金融、豪宅等特定廣告合約，簽約先收大筆預付款</small>
        </div>
        <div class="contracts-grid">
          ${market.map(c => {
            const isSigned = activeContracts.some(ac => ac.id === c.id);
            const canSign = !isSigned && activeContracts.length < 3;
            return `
              <div class="contract-card ${isSigned ? 'signed' : ''}">
                <div class="contract-header">
                  <span class="contract-icon">${c.icon}</span>
                  <div class="contract-title-wrap">
                    <strong>${safe(c.name)}</strong>
                    <span class="contract-cat">${safe(c.category)}</span>
                  </div>
                  ${isSigned ? `<span class="badge signed-badge">已簽約</span>` : ''}
                </div>
                <p class="contract-desc">${safe(c.description)}</p>
                <div class="contract-target-spec">
                  <div class="spec-item"><small>合約期</small><b>${c.durationDays} 日</b></div>
                  <div class="spec-item"><small>簽約即收預付</small><b class="gold-text">+${money(c.advancePayment)}</b></div>
                  <div class="spec-item"><small>達標花紅</small><b class="gold-text">+${money(c.bonusPayment)}</b></div>
                  <div class="spec-item"><small>對賭違約賠付</small><b class="danger">-${money(c.penalty)}</b></div>
                </div>
                <p class="contract-req"><span class="req-icon">🎯</span> ${safe(contractTargetDesc(c))}</p>
                <div class="contract-actions">
                  <button class="primary-button" data-action="sign-ad-contract" data-contract-id="${c.id}" ${canSign ? '' : 'disabled'}>
                    ${isSigned ? '合約進行中' : activeContracts.length >= 3 ? '最多同時簽 3 份合約' : `簽署合約 (即收預付款 ${money(c.advancePayment)})`}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  </div>`;
}

function facilitiesView() {
  const facilities = state.facilities ?? { studio: 1, postLab: 1, prDept: 1, newsFleet: 1 };
  const configs = FACILITY_CONFIGS;

  return `<div class="game-grid facilities-layout">
    <section class="panel facilities-panel">
      <div class="panel-heading">
        <div>
          <div class="eyebrow gold">STATION HEADQUARTERS & UPGRADES</div>
          <h1>🏢 電視大樓設施與攝影棚擴建</h1>
        </div>
        <span class="quota">電視台現有資金 ${money(state.cash)}</span>
      </div>
      <p class="facilities-intro">
        電視台賺取盈利後投資擴建電視台各部門設施，長遠提升自製劇品質上限、首播口碑與突發事件收視！
      </p>

      <div class="facilities-grid">
        ${Object.keys(configs).map(key => {
          const cfg = configs[key];
          const curLvl = facilities[key] ?? 1;
          const curLvlConfig = cfg.levels.find(l => l.level === curLvl) ?? cfg.levels[0];
          const nextLvlConfig = cfg.levels.find(l => l.level === curLvl + 1);
          const isMax = !nextLvlConfig;
          const canAfford = nextLvlConfig && state.cash >= nextLvlConfig.cost;

          return `
            <div class="facility-card">
              <div class="facility-head">
                <span class="facility-icon">${cfg.icon}</span>
                <div>
                  <h3>${safe(cfg.name)}</h3>
                  <div class="facility-level-badge">Lv.${curLvl} ${safe(curLvlConfig.name)}</div>
                </div>
                ${isMax ? `<span class="badge max-badge">已達最高規格</span>` : ''}
              </div>

              <div class="facility-level-ladder">
                ${cfg.levels.map(l => `
                  <div class="ladder-step ${l.level <= curLvl ? 'achieved' : ''}">
                    <span class="step-num">Lv.${l.level}</span>
                    <span class="step-name">${safe(l.name)}</span>
                  </div>
                `).join('')}
              </div>

              <div class="facility-body">
                <div class="facility-cur-perk">
                  <small>目前部門規格效益：</small>
                  <p>${safe(curLvlConfig.desc)}</p>
                </div>
                ${nextLvlConfig ? `
                  <div class="facility-next-perk">
                    <small>下一級升級效益（Lv.${nextLvlConfig.level}）：</small>
                    <p>${safe(nextLvlConfig.desc)}</p>
                    <div class="upgrade-cost-row">
                      <span>擴建升級費用：</span>
                      <strong class="${canAfford ? 'gold-text' : 'danger'}">${money(nextLvlConfig.cost)}</strong>
                    </div>
                  </div>
                ` : ''}
              </div>

              <div class="facility-actions">
                ${isMax ? `
                  <button class="soft-button" disabled>已達到最高規格等級</button>
                ` : `
                  <button class="primary-button" data-action="upgrade-facility" data-facility="${key}" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? `擴建升級至 Lv.${nextLvlConfig.level} (${money(nextLvlConfig.cost)})` : `資金不足 (需要 ${money(nextLvlConfig.cost)})`}
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  </div>`;
}

function subChannelView() {
  const sched = state.subChannelSchedule?.length ? state.subChannelSchedule : [
    { start: 0, duration: 6, programId: 'sub-rerun', label: '深宵精選重溫 (經典劇集及自製綜藝)' },
    { start: 6, duration: 6, programId: 'sub-news', label: '晨間新聞財經副台 (全天候財經與生活資訊)' },
    { start: 12, duration: 6, programId: 'sub-doc', label: '環球紀錄精選 (大自然、科技與世界探索)' },
    { start: 18, duration: 6, programId: 'sub-prime', label: '外購影視與體育分流 (外購劇集與英超歐聯分流直播)' }
  ];
  return `
    <section class="panel subchannel-panel">
      <div class="panel-heading">
        <div>
          <div class="eyebrow cyan">DIGITAL CHANNEL 2 · 24-HOUR BROADCAST</div>
          <h2>📺 數碼二台（J2 / 外購體育副台）</h2>
          <p class="subtitle">雙頻道雙線營運中！副台全天候自動播放精選重溫、外購節目與體育分流，每日創造主台 28% 之額外副頻道廣告收益！</p>
        </div>
        <span class="quota highlight">副頻道運作正常 · 每日自動營運</span>
      </div>

      <div class="subchannel-stats-row">
        <div class="sub-stat-card">
          <small>頻道牌照定位</small>
          <strong>青年活力 · 體育外購副台</strong>
        </div>
        <div class="sub-stat-card">
          <small>每日副台廣告收益貢獻</small>
          <strong class="gold-text">+28% 主台收入</strong>
        </div>
        <div class="sub-stat-card">
          <small>運作模式</small>
          <strong>全天候自動排播分流</strong>
        </div>
      </div>

      <div class="subchannel-schedule-grid">
        ${sched.map(slot => `
          <div class="subchannel-slot-card">
            <span class="slot-time">${timeRange(slot.start, slot.duration)}</span>
            <div class="slot-content">
              <strong>${safe(slot.label)}</strong>
              <small>自動分流主台觀眾，填補各時段小眾與垂直市場需求</small>
            </div>
            <span class="slot-status">✓ 播映中</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function talentAgencyView() {
  return talentManagementView();
}

function scheduleView() {
  const wonSports = getActiveSportsEvents(state);
  const viewing=weekdayForDay(state.day),selectedDay=scheduleDay??viewing;
  const previewDay=state.day+(selectedDay-viewing+7)%7;
  const options=[...state.library.filter(p=>!isUnavailable(p,state.day)).map(p=>({id:p.id,title:p.title})),...wonSports.map(s=>({id:`event:${s.id}`,title:`🏆 ${s.name}（體育直播）`}))];
  if (!options.some(p=>p.id===editor.programId)) editor.programId=options[0]?.id??'';
  const fixed=state.library.find(p=>p.id===editor.programId)?.episodeHours;
  const max=editor.programId.startsWith('event:')?24:4;
  editor.duration=fixed??Math.min(editor.duration,max);
  const occupied=new Set(state.schedule.filter(block=>runsOnWeekday(block,selectedDay)).flatMap(hoursInBlock));
  const requested=new Set(Array.from({length:editor.duration},(_,i)=>(editor.start+i)%24));
  const conflicts=state.schedule.filter(block=>daysForBlock(block).some(day=>editor.days.includes(day))&&hoursInBlock(block).some(h=>requested.has(h)));
  const duplicate=duplicateBooking(state,editor.start,editor.programId,editor.duration,editor.days);
  const duplicateDetails=duplicate?`${dayPattern(daysForBlock(duplicate))} ${timeRange(duplicate.start,duplicate.duration)}`:'';
  const dayOfQuarter=(state.day-1)%DAYS_PER_QUARTER+1;
  const groupFor=(p,optId)=>optId?.startsWith('event:')?'sports':p?.kind==='catalog'?'catalog':p?.id?.startsWith('start-')?'starter':isDailyFormat(p?.kind)?'daily':'original';
  const filterTabs=[['all','全部'],['unbooked','未排'],...(wonSports.length>0?[['sports',`⚽ 體育 (${wonSports.length})`]]:[]),['original','自製'],['catalog','外購'],['daily','每日'],['starter','開台片庫']];
  const query=editorProgramSearch.trim().toLocaleLowerCase('zh-HK');
  const visibleOptions=options.filter(option=>{const p=state.library.find(item=>item.id===option.id),group=groupFor(p,option.id),booked=state.schedule.some(block=>block.programId===option.id);return (editorProgramGroup==='all'||editorProgramGroup==='unbooked'&&!booked||editorProgramGroup===group)&&(!query||`${option.title} ${p?.category??''} ${p?.genre??''} ${p?.topic??''}`.toLocaleLowerCase('zh-HK').includes(query))});
  const selectedProgram=options.find(option=>option.id===editor.programId);
  const selectedItem=state.library.find(p=>p.id===editor.programId);
  const selectedEvent=editor.programId.startsWith('event:')?(state.events??[]).find(e=>`event:${e.id}`===editor.programId):null;
  const sportsCfg=getSportsConfig(selectedEvent);
  const isOneOffItem=isOneOffEvent(selectedItem?.kind) || selectedItem?.episodes === 1 || selectedItem?.category === '香港電影';
  editor.recurrence ??= isOneOffItem ? 'once' : (editor.days.length === 1 ? 'weekly' : editor.days.length === 5 ? 'weekday' : editor.days.length === 2 && editor.days[0] === 1 ? 'midweek' : editor.days.length === 2 ? 'weekend' : 'daily');
  const primeHours=[18,19,20,21,22];
  const primeOccupied=primeHours.filter(h=>occupied.has(h)).length;
  const DAYPARTS=[
    {id:'dawn',name:'深夜與清晨',hours:[0,1,2,3,4,5],icon:'🌙',desc:'00:00–06:00 · 慢活及晨前休閒時段'},
    {id:'morning',name:'晨早焦點',hours:[6,7,8,9,10,11],icon:'🌅',desc:'06:00–12:00 · 新聞晨報、開市財經與生活指南'},
    {id:'afternoon',name:'午後時段',hours:[12,13,14,15,16,17],icon:'☀️',desc:'12:00–18:00 · 午間料理、下午劇場與理財速報'},
    {id:'prime',name:'黃金時段',hours:[18,19,20,21,22,23],icon:'👑',desc:'18:00–24:00 · 晚間新聞、重頭劇與王牌綜藝'}
  ];
  return `<section class="panel schedule-panel" id="schedule-panel">
    <div class="panel-heading">
      <div>
        <div class="eyebrow cyan">WEEKLY CHANNEL · MASTER CONTROL</div>
        <h2>第 ${state.day} 日 · 排播大廳</h2>
        <p class="schedule-subtitle">本季第 ${dayOfQuarter} / ${DAYS_PER_QUARTER} 日 · ${WEEKDAYS[selectedDay]}已排 ${occupied.size}/24 小時 · 黃金檔滿載 ${primeOccupied}/5</p>
      </div>
      <div class="panel-heading-actions">
        <button class="slot-add" data-action="open-editor">＋ 安排新時段</button>
      </div>
    </div>
    <div class="weekday-tabs" role="group" aria-label="查看每週節目表">${WEEKDAYS.map((name,day)=>`<button data-action="schedule-day" data-day="${day}" class="${selectedDay===day?'active':''}" aria-pressed="${selectedDay===day}">${name}${day===viewing?'<span>今日</span>':''}</button>`).join('')}</div>
    <p class="schedule-tip">每個星期幾可以有唔同節目；點時段改排播。現在查看第 ${previewDay} 日。</p>
    ${editorOpen?'<button class="schedule-scrim" data-action="close-editor" aria-label="關閉時段編輯"></button>':''}
    <div class="schedule-editor ${editorOpen?'open':''}" ${editorOpen?'role="dialog" aria-modal="true" aria-label="安排播映時段"':'hidden'}><div class="schedule-editor-heading">安排 ${timeRange(editor.start,editor.duration)} <button class="editor-dismiss" data-action="close-editor" aria-label="關閉時段編輯">✕</button></div>
      <div class="schedule-fields"><label>開始時間<select data-action="editor-start">${Array.from({length:24},(_,i)=>`<option value="${i}" ${editor.start===i?'selected':''}>${hourLabel(i)}</option>`).join('')}</select></label><label>播映長度<select data-action="editor-duration" ${fixed?'disabled':''}>${(fixed?[fixed]:Array.from({length:max},(_,i)=>i+1)).map(n=>`<option value="${n}" ${editor.duration===n?'selected':''}>${n} 小時</option>`).join('')}</select></label></div>
      <div class="program-picker"><div class="picker-heading"><strong>選擇節目</strong><span>已揀：${safe(selectedProgram?.title??'未選')}${(()=>{const sp=options.find(o=>o.id===editor.programId);const it=sp?state.library.find(p=>p.id===sp.id):null;if(!it)return '';const sf=freshnessLabel(it.freshness,it.maxFreshness);return ` · <b class="sel-freshness-tag ${sf.tier}">${sf.icon} 新鮮度 ${sf.percent}%</b>`;})()}</span></div><input type="search" data-action="editor-program-search" value="${safe(editorProgramSearch)}" placeholder="搜尋節目名、類型或題材" aria-label="搜尋排播節目" autocomplete="off"><div class="picker-filters" aria-label="節目分類">${filterTabs.map(([id,label])=>`<button data-action="editor-program-group" data-value="${id}" aria-pressed="${editorProgramGroup===id}" class="${editorProgramGroup===id?'active':''}">${label}</button>`).join('')}</div><div class="program-choices" aria-label="可排播節目">${visibleOptions.length?visibleOptions.map(option=>{const item=state.library.find(p=>p.id===option.id),bookings=state.schedule.filter(block=>block.programId===option.id),booked=bookings.map(block=>`${dayPattern(daysForBlock(block))} ${hourLabel(block.start)}`).join('、');const subtitle=booked?`已排 ${booked}`:'未排';const episodes=item?.episodes?(item.kind==='catalog'?`${catalogCycleProgress(item).remaining} 集可播`:item.deliveredEpisodes!=null&&item.deliveredEpisodes<item.episodes?`已交付 ${item.deliveredEpisodes}/${item.episodes} 集（製作中）`:`${Math.max(0,item.episodes-item.runs)} 集可播`):isDailyFormat(item?.kind)?'每日新一期':option.id.startsWith('event:')?'全季直播賽事':'常規播放';const f=item?freshnessLabel(item.freshness,item.maxFreshness):null;return `<button data-action="editor-program-card" data-id="${safe(option.id)}" class="program-choice ${editor.programId===option.id?'chosen':''}" aria-pressed="${editor.programId===option.id}"><span class="program-choice-icon">${safe(option.id.startsWith('event:')?'⚽':premiereProfile(item?.kind).symbol)}</span><span class="program-choice-text"><strong>${safe(option.title)}</strong><small>${safe(item?.category??'體育直播')} · ${safe(episodes)}</small></span><span class="program-choice-status">${f?`<span class="choice-fresh-tag ${f.tier}" title="新鮮度 ${f.percent}% (上限 ${f.max}%) · ${f.desc}">${f.icon} ${f.percent}%</span>`:'<span class="choice-fresh-tag high">🏆 體育</span>'}<span>${safe(subtitle)}</span></span></button>`}).join(''):'<p class="picker-empty">搵唔到節目。試吓清除搜尋或轉分類。</p>'}</div></div>
      <div class="recurrence">
        <div class="recurrence-head-row">
          <strong>播出日子</strong>
          ${isOneOffItem ? '<span class="one-off-pill">⭐ 一晚限定／單集節目</span>' : ''}
        </div>
        <div class="recurrence-choices">${[
          ['once','⭐ 單次播映（只播一次）',[selectedDay]],
          ['weekly','每週一次',[selectedDay]],
          ['weekend','週六日',[5,6]],
          ['midweek','週二三（週中快車／歐聯）',[1,2]],
          ['weekday','週一至五',[0,1,2,3,4]],
          ['daily','每日',EVERY_DAY]
        ].map(([id,label,days])=>`<button data-action="recurrence" data-value="${id}" class="${editor.recurrence===id?'chosen':''} ${id==='once'?'once-btn':''}" aria-pressed="${editor.recurrence===id}">${label}</button>`).join('')}</div>
        ${sportsCfg ? `
          <div class="sports-preset-box">
            <div class="sports-preset-title">${sportsCfg.icon} <strong>${safe(sportsCfg.name)} · 官方推薦時區排播</strong></div>
            <div class="sports-preset-buttons">
              ${sportsCfg.defaultSlots.map(slot => `
                <button type="button" class="sports-slot-btn" data-action="apply-sports-slot" data-start="${slot.start}" data-duration="${slot.duration}" data-days="${slot.days.join(',')}">
                  ${sportsCfg.type === 'racing' ? (slot.days[0] === 2 ? '🏇 跑馬地夜馬直播' : '🏇 沙田日馬直播') : (slot.days.length === 2 && slot.days[0] === 5 ? '⚽ 週末焦點直播' : slot.days.length === 2 && slot.days[0] === 1 ? '⭐ 歐聯週中深夜大戰' : '🏆 賽事直播')}
                  <small>${slot.label}</small>
                </button>
              `).join('')}
            </div>
            <p class="sports-preset-tip">💡 ${sportsCfg.type === 'racing' ? '賽馬日逢週三晚 19:00–23:00（跑馬地）及週日 13:00–18:00（沙田）直播，7月、8月暑期休季停跑。收視穩定約 61–66 點！' : sportsCfg.type === 'pl' ? '英超賽事專屬週末焦點直播（週六、日 19:00–24:00），絕不佔用週二三深夜。逢歐聯比賽週英超全週休戰暫停；7、8月暑期休季。' : sportsCfg.type === 'ucl' ? '歐聯賽事嚴格只在週二、三深夜 01:00–05:00 進行（隔週比賽週），週末絕無賽事，與英超時段完全獨立互不重疊！' : '大賽期間請在賽事時段內密集直播。'}</p>
          </div>
        ` : ''}
        ${editor.recurrence==='once'?`<p class="recurrence-note once-note">⭐ 單次播映：只在 ${WEEKDAYS[editor.days[0]]} 播出 1 次，播畢後自動騰空時段。</p>`:isOneOffItem?`<p class="recurrence-note warn-note">💡 自製大型活動／電影為單次播映作品，強烈建議選擇「⭐ 單次播映（只播一次）」。</p>`:''}
        ${(editor.recurrence==='once'||editor.days.length===1)?`<label class="weekday-select-label">指定播出星期幾 <select data-action="editor-weekday">${WEEKDAYS.map((name,day)=>`<option value="${day}" ${editor.days[0]===day?'selected':''}>${name}${day===viewing?'（今日）':''}</option>`).join('')}</select></label>`:''}
      </div>
      <div class="schedule-preview">${editor.recurrence==='once'?`⭐ 單次播映（只在 ${WEEKDAYS[editor.days[0]]} 播 1 次，播畢自動騰空）`:dayPattern(editor.days)} ${timeRange(editor.start,editor.duration)}${conflicts.length?` · 會替換 ${conflicts.length} 個原有排播設定`:''}</div>
      ${duplicate?`<div class="booking-warning" role="status">《${safe(options.find(p=>p.id===editor.programId)?.title??'節目')}》已排喺 ${safe(duplicateDetails)}。如想同日重播，請明確開啟。</div><label class="repeat-opt"><input type="checkbox" data-action="editor-repeat" ${editor.allowRepeat?'checked':''}/> 容許同日重播呢套節目</label>`:''}
      <div class="schedule-actions"><button class="catalog-button" data-action="place" ${!editor.programId||duplicate&&!editor.allowRepeat?'disabled':''}>${conflicts.length?'替換時段':'加入節目表'} →</button><button class="remove-button" data-action="remove" ${!programAtHour(state,editor.start,previewDay)?'disabled':''}>移除${WEEKDAYS[selectedDay]}時段</button></div>
    </div>
    <div class="schedule-deck-layout">
      <div class="schedule-timeline-flow">
        ${DAYPARTS.map(part=>`
          <div class="daypart-block ${part.id==='prime'?'is-prime-block':''}">
            <div class="daypart-header">
              <div class="daypart-title-line">
                <span class="daypart-badge">${part.icon} ${part.name}</span>
                <span class="daypart-desc">${part.desc}</span>
              </div>
              ${part.id==='prime'?'<span class="prime-multiplier-pill">🔥 廣告收益 x1.5~x2.5 · 核心決戰區</span>':''}
            </div>
            <div class="daypart-grid">
              ${part.hours.map(hour=>{
                const block=programAtHour(state,hour,previewDay);
                const item=block&&(block.programId.startsWith('event:')?(state.events??[]).find(e=>`event:${e.id}`===block.programId):state.library.find(p=>p.id===block.programId));
                const title=item?.name??item?.title??'未排節目';
                const episode=episodeForBlock(state,block,previewDay);
                const prime=hour>=18&&hour<=22;
                const isStart=block&&block.start===hour;
                const hourOffset=block?hour-block.start:0;
                const isFocused=editor.start===hour;
                if(!block){
                  return `<button class="hour-row empty ${prime?'prime':''} ${isFocused?'focused':''}" data-action="select-hour" data-hour="${hour}" aria-label="${hourLabel(hour)}至${hourLabel(hour+1)}：未排節目">
                    <div class="hour-row-top">
                      <span class="hour-clock">${hourLabel(hour)}</span>
                      <span class="empty-badge">空檔</span>
                      <span class="hour-indicator">＋</span>
                    </div>
                    <span class="hour-content">
                      <strong class="empty-title">未排節目</strong>
                      <small class="hour-meta empty-meta">點擊排檔</small>
                    </span>
                  </button>`;
                }
                if(isStart){
                  return `<button class="hour-row filled is-start ${prime?'prime':''} ${block?.programId.startsWith('event:')?'event-row':''} ${block?.once?'once-row':''} ${isFocused?'focused':''}" data-action="select-hour" data-hour="${hour}" aria-label="${hourLabel(hour)}至${hourLabel(hour+1)}：${safe(title)} ${safe(episode)}">
                    <div class="hour-row-top">
                      <span class="hour-clock">${hourLabel(hour)}</span>
                      <span class="hour-duration-badge">${block.duration}h 全長</span>
                      ${block?.once?'<span class="hour-once-badge">⭐ 單次</span>':''}
                      <span class="hour-indicator">●</span>
                    </div>
                    <span class="hour-content">
                      <strong class="show-title">《${safe(title)}》</strong>
                      <small class="hour-meta">${episode?safe(episode):isDailyFormat(item?.kind)?'每日新一期':'特別播映'}</small>
                    </span>
                  </button>`;
                }
                return `<button class="hour-row filled is-cont ${prime?'prime':''} ${block?.programId.startsWith('event:')?'event-row':''} ${isFocused?'focused':''}" data-action="select-hour" data-hour="${hour}" aria-label="${hourLabel(hour)}至${hourLabel(hour+1)}：${safe(title)} 續播">
                  <div class="hour-row-top">
                    <span class="hour-clock">${hourLabel(hour)}</span>
                    <span class="cont-pill">↳ 續播</span>
                    <span class="hour-indicator">↳</span>
                  </div>
                  <span class="hour-content">
                    <strong class="show-title cont-title">《${safe(title)}》</strong>
                    <small class="hour-meta cont-meta">第 ${hourOffset+1} / ${block.duration} 小時</small>
                  </span>
                </button>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <aside class="schedule-actions-dock">
        <div class="dock-card command-card">
          <div class="dock-eyebrow">STATION CONTROLS</div>
          <h3>主控室指令</h3>
          <button class="settle-button primary-settle" data-action="advance-day">
            <span class="settle-main-text">播出今日 ➔</span>
            <span class="settle-sub-text">00:00 – 24:00 全日播映結算</span>
          </button>
          <button class="skip-button secondary-skip" data-action="advance-week">
            ⚡ 營運最多 7 日
          </button>
          <button class="quarter-skip text-skip" data-action="advance">
            快進至下一件事（空檔／到期）→
          </button>
        </div>
        <div class="dock-card intel-card">
          <div class="dock-eyebrow">BROADCAST INTEL</div>
          <div class="intel-item">
            <span>全日排播滿載度</span>
            <strong class="${occupied.size===24?'text-green':'text-amber'}">${occupied.size} / 24 小時</strong>
          </div>
          <div class="intel-bar-track">
            <div class="intel-bar-fill" style="width:${Math.round((occupied.size/24)*100)}%"></div>
          </div>
          <div class="intel-item">
            <span>黃金時段滿載 (18–22)</span>
            <strong class="${primeOccupied===5?'text-gold':'text-rose'}">${primeOccupied} / 5 小時</strong>
          </div>
          ${primeOccupied<5?`<p class="dock-warn">⚠️ 黃金檔有 ${5-primeOccupied} 小時空檔，會錯失核心廣告收入！</p>`:''}
        </div>
        <div class="dock-card quick-tools">
          <button class="slot-add tool-btn" data-action="open-editor">＋ 安排新時段</button>
          <button class="transfer-btn tool-btn" data-action="open-transfer">⇄ 存檔匯出／匯入</button>
        </div>
      </aside>
    </div>
  </section>`;
}

function ratingTierClass(rating) {
  if (rating >= 80) return 'tier-s';
  if (rating >= 70) return 'tier-a';
  if (rating >= 60) return 'tier-b';
  if (rating >= 50) return 'tier-c';
  return 'tier-d';
}

function ratingTierLabel(rating) {
  if (rating >= 80) return 'S 王牌';
  if (rating >= 70) return 'A 強檔';
  if (rating >= 60) return 'B 穩固';
  if (rating >= 50) return 'C 常規';
  return 'D 深宵';
}

function renderRivalDetail(rival, live) {
  if (!rival) return `<div class="panel"><p>找不到該電視台資料。</p></div>`;
  const now = rivalAtHour(state, rival, live.hour, state.day);
  const premiere = rivalPremiere(rival, state.day);
  const nextPremiere = rivalPremiere(rival, state.day + DAYS_PER_MARKET_MONTH);
  const deal = (state.distributionDeals ?? []).find(d => d.rivalId === rival.id && d.startDay <= state.day && state.day < d.expiresDay);
  const rivalBuy = (state.rivalPurchases ?? []).find(r => r.rivalId === rival.id && r.startDay <= state.day && state.day < r.expiresDay);

  const myLiveBlock = programAtHour(state, live.hour);
  const myLiveProg = myLiveBlock && state.library.find(p => p.id === myLiveBlock.programId);
  const myLiveEvent = myLiveBlock?.programId.startsWith('event:') && state.events.find(e => `event:${e.id}` === myLiveBlock.programId);
  const myLiveTitle = myLiveProg?.title ?? myLiveEvent?.name ?? '未排節目';

  return `
    <article class="channel-detail-header ${rival.id}">
      <div class="channel-header-top">
        <div class="channel-brand-badge">
          <span class="channel-number ${rival.id}">${rival.channelNo || (rival.id === 'jade' ? 81 : rival.id === 'viu' ? 99 : 77)}</span>
          <h2 class="channel-header-title">${safe(rival.name)} <small class="channel-network-tag">（${safe(rival.englishName || rival.name)} · ${safe(rival.network || '')}）</small></h2>
        </div>
        <button type="button" class="soft-button" data-action="rivals-tab" data-value="matchup">⚔️ 查看四台同步對決表 →</button>
      </div>
      <div class="channel-user-profile-quote ${rival.id}">
        <strong>【台格定位】</strong>${safe(rival.profile)}
      </div>
      <div class="channel-stars-row">
        <span class="channel-stars-label">旗下重點藝人：</span>
        ${(rival.stars || []).map(star => `<span class="star-pill">⭐ ${safe(star)}</span>`).join('')}
      </div>
    </article>

    <div class="channel-live-strip">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span class="channel-live-status-tag"><span class="live-pulse-dot"></span> LIVE 播映中（${hourLabel(live.hour)}）</span>
        <strong style="color:#f8fafc;font-size:1.05rem;">《${safe(now.title)}》</strong>
        <span class="epg-category-badge">${safe(now.category || '常規節目')}</span>
        <span class="rating-pill ${ratingTierClass(now.rating)}">${now.rating} 點</span>
      </div>
      <div style="color:#94a3b8;font-size:0.78rem;">
        我台同時段：<strong style="color:#38bdf8;">《${safe(myLiveTitle)}》</strong>
      </div>
    </div>

    <section class="panel" style="margin-bottom:20px;">
      <div class="section-heading">
        <h2>📅 24 小時全日節目表與收視情報</h2>
        <span>詳細節目故事大綱 · 實時預測收視</span>
      </div>
      <div class="epg-container">
        ${rival.schedule.map(block => {
          const isCurrentSlot = live.hour >= block.start && live.hour < (block.start + block.duration);
          const isPrime = block.start >= 18 && block.start < 23;
          const show = rivalAtHour(state, rival, block.start, state.day);
          const isPremiere = block.start === 19;
          const isDeal = (block.start === 21 || block.start === 22) && deal;
          const isRivalBuy = (block.start === 21 || block.start === 22) && !deal && rivalBuy;

          const myBlock = programAtHour(state, block.start);
          const myProg = myBlock && state.library.find(p => p.id === myBlock.programId);
          const myEvent = myBlock?.programId.startsWith('event:') && state.events.find(e => `event:${e.id}` === myBlock.programId);
          const myTitle = myProg?.title ?? myEvent?.name ?? '未排節目';

          return `
            <div class="epg-row-card ${isCurrentSlot ? 'is-now' : ''} ${isPrime ? 'prime-slot' : ''}">
              <div class="epg-time-col">
                <span class="epg-time-range">${timeRange(block.start, block.duration)}</span>
                <span class="epg-duration">${block.duration} 小時時段${isPrime ? ' · 黃金時段' : ''}</span>
              </div>
              <div class="epg-content-col">
                <div class="epg-title-line">
                  <strong class="epg-title">《${safe(show.title)}》</strong>
                  <span class="epg-category-badge">${safe(show.category || block.category || '節目')}</span>
                  ${isPremiere ? '<span class="epg-special-pill premiere">⭐ 本月重點首播</span>' : ''}
                  ${isDeal ? '<span class="epg-special-pill deal">🤝 購自我台播映權</span>' : ''}
                  ${isRivalBuy ? '<span class="epg-special-pill market">🛒 外購市場搶購作品</span>' : ''}
                  ${isCurrentSlot ? '<span class="channel-live-status-tag" style="padding:2px 8px;font-size:0.65rem;"><span class="live-pulse-dot"></span> LIVE 正播</span>' : ''}
                </div>
                <p class="epg-desc">${safe(show.desc || block.desc || '暫無節目簡介')}</p>
                <div style="font-size:0.72rem;color:#64748b;margin-top:2px;">
                  我台同期對抗：<span style="color:#93c5fd;">《${safe(myTitle)}》</span>
                </div>
              </div>
              <div class="epg-rating-col">
                <span class="rating-pill ${ratingTierClass(show.rating)}">${show.rating} 點</span>
                <span class="rating-label">${ratingTierLabel(show.rating)}收視</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
      <article class="panel">
        <div class="eyebrow cyan">MONTHLY PREMIERE · 本月首播王牌</div>
        <h3>《${safe(premiere.title)}》</h3>
        <p style="font-size:0.8rem;color:#94a3b8;">類型：${safe(premiere.genre)} · 播映時段：${safe(premiere.slot)}</p>
      </article>
      <article class="panel">
        <div class="eyebrow gold">NEXT MONTH PREVIEW · 下月預告大作</div>
        <h3>《${safe(nextPremiere.title)}》</h3>
        <p style="font-size:0.8rem;color:#94a3b8;">類型：${safe(nextPremiere.genre)} · 預計下月開播</p>
      </article>
    </div>
  `;
}

function renderRivalsOverview(live) {
  return `
    <div class="rival-overview-grid">
      ${state.rivals.map(rival => {
        const now = rivalAtHour(state, rival, live.hour, state.day);
        const prime = rivalAtHour(state, rival, 19, state.day);
        const late = rivalAtHour(state, rival, 21, state.day);
        const premiere = rivalPremiere(rival, state.day);
        const deal = (state.distributionDeals ?? []).find(d => d.rivalId === rival.id && d.startDay <= state.day && state.day < d.expiresDay);
        const rivalBuy = (state.rivalPurchases ?? []).find(r => r.rivalId === rival.id && r.startDay <= state.day && state.day < r.expiresDay);

        return `
          <article class="rival-summary-card ${rival.id}">
            <div class="rival-card-header">
              <div>
                <span class="channel-number ${rival.id}" style="font-size:0.85rem;padding:2px 8px;">${rival.channelNo || (rival.id === 'jade' ? 81 : rival.id === 'viu' ? 99 : 77)}</span>
                <h3 class="rival-card-title" style="display:inline;margin-left:6px;">${safe(rival.name)}</h3>
              </div>
              <span class="rival-card-network">${safe(rival.network || '')}</span>
            </div>
            <div class="rival-card-quote">
              ${safe(rival.profile)}
            </div>
            <div class="channel-stars-row" style="margin-top:4px;">
              ${(rival.stars || []).slice(0, 4).map(star => `<span class="star-pill" style="font-size:0.68rem;padding:2px 6px;">${safe(star)}</span>`).join('')}
            </div>
            <div class="rival-card-stats">
              <div class="rival-stat-row">
                <span>此刻正在播映：</span>
                <strong>《${safe(now.title)}》 <span class="rating-pill ${ratingTierClass(now.rating)}" style="padding:2px 6px;font-size:0.75rem;">${now.rating} 點</span></strong>
              </div>
              <div class="rival-stat-row">
                <span>19:00 王牌劇集：</span>
                <strong>《${safe(prime.title)}》 (${prime.rating} 點)</strong>
              </div>
              <div class="rival-stat-row">
                <span>21:00 旗艦劇場：</span>
                <strong>《${safe(late.title)}》 (${late.rating} 點)</strong>
              </div>
              <div class="rival-stat-row">
                <span>本月重點首播：</span>
                <strong>《${safe(premiere.title)}》· ${safe(premiere.genre)}</strong>
              </div>
              ${deal ? `
                <div class="rival-stat-row" style="color:#34d399;">
                  <span>買入我台作品：</span>
                  <strong>《${safe(deal.title)}》</strong>
                </div>
              ` : ''}
              ${rivalBuy ? `
                <div class="rival-stat-row" style="color:#fdba74;">
                  <span>外購市場搶購：</span>
                  <strong>《${safe(rivalBuy.title)}》</strong>
                </div>
              ` : ''}
            </div>
            <button type="button" class="soft-button" style="margin-top:auto;" data-action="rivals-tab" data-value="${rival.id}">
              查看 24 小時完整節目表 →
            </button>
          </article>
        `;
      }).join('')}
    </div>

    <section class="panel matchup-panel">
      <div class="section-heading">
        <h2>⚡ 此刻四台同步收視即時戰況（${hourLabel(live.hour)}）</h2>
        <span>即時對抗概況 · 點擊切換完整對決矩陣</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:12px;background:#172230;border-radius:8px;border:1px solid #2a3c54;">
        ${(() => {
          const myBlock = programAtHour(state, live.hour);
          const myProg = myBlock && state.library.find(p => p.id === myBlock.programId);
          const myEvent = myBlock?.programId.startsWith('event:') && state.events.find(e => `event:${e.id}` === myBlock.programId);
          const myTitle = myProg?.title ?? myEvent?.name ?? '未排節目';
          const myRating = state.lastDayResult?.hours?.[live.hour]?.rating ?? (myProg?.rating ?? 45);
          return `
            <div style="flex:1;min-width:180px;">
              <small style="color:#94a3b8;display:block;">我台（你的電視台）</small>
              <strong style="color:#38bdf8;">《${safe(myTitle)}》</strong>
              <span class="rating-pill tier-a" style="margin-left:6px;padding:2px 7px;font-size:0.75rem;">${myRating} 點</span>
            </div>
          `;
        })()}
        ${state.rivals.map(rival => {
          const show = rivalAtHour(state, rival, live.hour, state.day);
          return `
            <div style="flex:1;min-width:180px;">
              <small style="color:#94a3b8;display:block;">${safe(rival.name)}（${rival.channelNo || ''}台）</small>
              <strong style="color:#f1f5f9;">《${safe(show.title)}》</strong>
              <span class="rating-pill ${ratingTierClass(show.rating)}" style="margin-left:6px;padding:2px 7px;font-size:0.75rem;">${show.rating} 點</span>
            </div>
          `;
        }).join('')}
        <button type="button" class="primary-button" data-action="rivals-tab" data-value="matchup">
          進入 24 小時全日對決矩陣 →
        </button>
      </div>
    </section>
  `;
}

function renderRivalsMatchup(live) {
  let playerWins = 0, jadeWins = 0, viuWins = 0, hoyWins = 0;

  const rowsHtml = Array.from({ length: 24 }, (_, hour) => {
    const isNow = hour === live.hour;
    const isPrime = hour >= 18 && hour <= 22;
    const block = programAtHour(state, hour);
    const prog = block && state.library.find(item => item.id === block.programId);
    const event = block?.programId.startsWith('event:') && state.events.find(e => `event:${e.id}` === block.programId);
    const title = prog?.title ?? event?.name ?? '未排節目';
    const episode = episodeForBlock(state, block);
    const playerRating = state.lastDayResult?.hours?.[hour]?.rating ?? (prog?.rating ?? 45);

    const jade = state.rivals.find(r => r.id === 'jade') || state.rivals[0];
    const viu = state.rivals.find(r => r.id === 'viu') || state.rivals[1];
    const hoy = state.rivals.find(r => r.id === 'hoy') || state.rivals[2];

    const jadeShow = rivalAtHour(state, jade, hour, state.day);
    const viuShow = rivalAtHour(state, viu, hour, state.day);
    const hoyShow = rivalAtHour(state, hoy, hour, state.day);

    const ratings = [
      { name: 'player', label: '我台', val: playerRating },
      { name: 'jade', label: '翡翠台', val: jadeShow.rating },
      { name: 'viu', label: 'ViuTV', val: viuShow.rating },
      { name: 'hoy', label: 'HOY TV', val: hoyShow.rating }
    ];
    ratings.sort((a, b) => b.val - a.val);
    const winner = ratings[0];
    if (winner.name === 'player') playerWins++;
    else if (winner.name === 'jade') jadeWins++;
    else if (winner.name === 'viu') viuWins++;
    else if (winner.name === 'hoy') hoyWins++;

    return `
      <div class="matchup-row ${isPrime ? 'prime' : ''} ${isNow ? 'is-now' : ''}" data-hour="${hour}" style="grid-template-columns: 80px minmax(160px,1.2fr) minmax(130px,1fr) minmax(130px,1fr) minmax(130px,1fr) 110px;">
        <strong>${hourLabel(hour)}</strong>
        <span>
          ${safe(title)}${episode ? `<small>${safe(episode)}</small>` : ''}
          <b>${playerRating} 點</b>
        </span>
        <span>${safe(jadeShow.title)}<b>${jadeShow.rating} 點</b></span>
        <span>${safe(viuShow.title)}<b>${viuShow.rating} 點</b></span>
        <span>${safe(hoyShow.title)}<b>${hoyShow.rating} 點</b></span>
        <span>
          <span class="matchup-winner-badge ${winner.name}">
            ${winner.name === 'player' ? '🏆 我台領先' : `${winner.label}領先`}
          </span>
        </span>
      </div>
    `;
  }).join('');

  return `
    <section class="panel matchup-panel">
      <div class="section-heading">
        <h2>⚔️ 24 小時四台逐小時同步對決表</h2>
        <span>我台（你的電視台）對陣 81 翡翠台、99 ViuTV、77 HOY TV</span>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px;background:#172230;padding:10px 14px;border-radius:8px;font-size:0.8rem;">
        <span style="color:#94a3b8;">當日領先統計：</span>
        <strong style="color:#6ee7b7;">我台領先 ${playerWins} 時段</strong> · 
        <strong style="color:#86efac;">翡翠台領先 ${jadeWins} 時段</strong> · 
        <strong style="color:#7dd3fc;">ViuTV領先 ${viuWins} 時段</strong> · 
        <strong style="color:#fda4af;">HOY TV領先 ${hoyWins} 時段</strong>
      </div>
      <div class="matchup-scroll">
        <div class="matchup-table" style="min-width:920px;">
          <div class="matchup-head" style="grid-template-columns: 80px minmax(160px,1.2fr) minmax(130px,1fr) minmax(130px,1fr) minmax(130px,1fr) 110px;">
            <span>時段</span>
            <span>我台節目 · 預測收視</span>
            <span>81 翡翠台 · 收視</span>
            <span>99 ViuTV · 收視</span>
            <span>77 HOY TV · 收視</span>
            <span>時段盟主</span>
          </div>
          ${rowsHtml}
        </div>
      </div>
      <p class="footnote">💡 對手節目與收視為即時情資預測。按「結算今日」後，實際我台收視與藝人人氣將全面更新！黃金時段（18:00–23:00）為收視定奪關鍵戰場。</p>
    </section>
  `;
}

function rivalsView() {
  const live = broadcastNow(state);
  const selectedRival = state.rivals.find(r => r.id === rivalsTab) || null;

  return `
    <div class="page-head">
      <div>
        <div class="eyebrow cyan">CHANNEL INTELLIGENCE · 香港商營免費電視台情報專頁</div>
        <h1>香港三大電視台節目表與收視情報</h1>
        <p>全景監察 <strong>81 翡翠台</strong>、<strong>99 ViuTV</strong>、<strong>77 HOY TV</strong> 全日 24 小時節目編排、實時預測收視、旗下王牌藝人及競爭策略。</p>
      </div>
      <div class="legend">
        昨日戰績：<strong>${state.lastDayResult ? `${state.lastDayResult.wins} / 24 小時時段勝出` : '等待第一日結算'}</strong>
      </div>
    </div>

    <div class="rival-tab-bar" role="tablist">
      <button type="button" class="rival-tab-btn ${rivalsTab === 'all' ? 'active' : ''}" data-action="rivals-tab" data-value="all">
        📺 三台總覽一覽
      </button>
      <button type="button" class="rival-tab-btn ${rivalsTab === 'jade' ? 'active tab-jade' : ''}" data-action="rivals-tab" data-value="jade">
        <span class="rival-tab-badge tab-badge-jade">81</span> 翡翠台（Jade TV）
      </button>
      <button type="button" class="rival-tab-btn ${rivalsTab === 'viu' ? 'active tab-viu' : ''}" data-action="rivals-tab" data-value="viu">
        <span class="rival-tab-badge tab-badge-viu">99</span> ViuTV
      </button>
      <button type="button" class="rival-tab-btn ${rivalsTab === 'hoy' ? 'active tab-hoy' : ''}" data-action="rivals-tab" data-value="hoy">
        <span class="rival-tab-badge tab-badge-hoy">77</span> HOY TV
      </button>
      <button type="button" class="rival-tab-btn ${rivalsTab === 'matchup' ? 'active' : ''}" data-action="rivals-tab" data-value="matchup">
        ⚔️ 24 小時四台對決表
      </button>
    </div>

    ${rivalsTab === 'all' ? renderRivalsOverview(live) : rivalsTab === 'matchup' ? renderRivalsMatchup(live) : renderRivalDetail(selectedRival, live)}
  `;
}

function replayQueueView() {
  const ready = state.library.filter(p => canReplayProgram(p, state.day));
  const query = replaySearch.trim().toLocaleLowerCase('zh-HK');
  const filtered = ready.filter(p => {
    if (replayFilter === 'drama' && p.kind === 'catalog') return false;
    if (replayFilter === 'catalog' && p.kind !== 'catalog') return false;
    if (query && !`${p.title} ${p.category} ${p.origin||''}`.toLocaleLowerCase('zh-HK').includes(query)) return false;
    return true;
  });

  return `<section class="renewal-list replay-list">
    <div class="subview-header">
      <div>
        <h2>🔄 經典重播庫 (${ready.length} 套待機)</h2>
        <p>播畢一輪後進入片庫冷卻。未排播每日回溫 +2% 新鮮度（上限為該輪上限）。可隨時在此開新一輪重播！</p>
      </div>
      <div class="replay-filter-bar">
        <div class="btn-group" role="group">
          <button class="filter-chip ${replayFilter==='all'?'active':''}" data-action="replay-filter" data-value="all">全部 ${ready.length}</button>
          <button class="filter-chip ${replayFilter==='drama'?'active':''}" data-action="replay-filter" data-value="drama">自製經典 ${ready.filter(p=>p.kind!=='catalog').length}</button>
          <button class="filter-chip ${replayFilter==='catalog'?'active':''}" data-action="replay-filter" data-value="catalog">外購節目 ${ready.filter(p=>p.kind==='catalog').length}</button>
        </div>
      </div>
    </div>
    ${filtered.length ? `
      <div class="replay-grid">
        ${filtered.map(p => {
          const f = freshnessLabel(p.freshness, p.maxFreshness);
          const rightsInfo = p.kind === 'catalog' ? ` · 播映權至第 ${p.licenseExpiresDay-1} 日` : ' · 自製永久版權';
          const isCooling = f.percent < 50;
          return `<article class="replay-card ${isCooling ? 'is-cooling' : 'is-ready'}">
            <div class="replay-card-main">
              <div class="replay-title-row">
                <strong>${safe(p.title)}</strong>
                <span class="replay-type-tag">${p.kind==='catalog'?'外購':'自製'} · ${safe(p.category||'劇集')}</span>
              </div>
              <small>${catalogProgressLabel(p)}${rightsInfo}</small>
              <div class="replay-fresh-row">
                <span class="freshness-badge ${f.tier}">${f.icon} 新鮮度 ${f.percent}% (上限 ${f.max}%)</span>
                <span class="freshness-note">${isCooling ? '❄️ 剛播畢沉澱中（+2%/日），建議等待回溫後再排' : '✨ 回溫良好，隨時適合安排重溫！'}</span>
              </div>
            </div>
            <button class="catalog-button" data-action="start-replay" data-id="${safe(p.id)}">開新一輪重播 ↳</button>
          </article>`;
        }).join('')}
      </div>
    ` : `<p class="empty">${ready.length ? '搵唔到符合篩選嘅重播節目。' : '片庫暫時未有播畢一輪嘅節目。已播完嘅節目會自動喺呢度待機。'}</p>`}
  </section>`;
}

function catalogView() {
  const listings = catalogForMonth(state.day);
  const month = marketMonthForDay(state.day) + 1;
  const nextRefresh = month * DAYS_PER_MARKET_MONTH + 1;
  const expiredLicenses = state.library.filter(p => p.kind === 'catalog' && licenseExpired(p, state.day));
  const readyToReplay = state.library.filter(p => canReplayProgram(p, state.day));
  const rivalBuys = (state.rivalPurchases ?? []).filter(r => r.expiresDay > state.day);
  const rivalBuysMap = new Map(rivalBuys.map(r => [r.marketItemId, r]));
  const rivalBuysTitleMap = new Map(rivalBuys.map(r => [r.title, r]));
  const getOwned = (p) => state.library.find(item => (item.id === p.id || item.title === p.title) && item.kind === 'catalog');
  const isOwnedActive = (p) => {
    const owned = getOwned(p);
    return Boolean(owned && !licenseExpired(owned, state.day));
  };

  const categoryFilters = [
    { id: 'all', label: '全部作品', count: listings.length },
    { id: 'korean', label: '🇰🇷 韓劇', count: listings.filter(p => p.group === 'korean').length },
    { id: 'japanese', label: '🇯🇵 日劇', count: listings.filter(p => p.group === 'japanese').length },
    { id: 'taiwan', label: '🇹🇼 台劇', count: listings.filter(p => p.group === 'taiwan').length },
    { id: 'western', label: '🇺🇸 歐美劇', count: listings.filter(p => p.group === 'western').length },
    { id: 'chinese', label: '🇨🇳 陸劇', count: listings.filter(p => p.group === 'chinese').length },
    { id: 'series', label: '🇭🇰 港劇', count: listings.filter(p => p.group === 'series' && p.network !== 'ViuTV').length },
    { id: 'film', label: '🎬 香港電影', count: listings.filter(p => p.group === 'film').length },
    { id: 'viu', label: '📺 ViuTV 原創', count: listings.filter(p => p.network === 'ViuTV').length },
    { id: 'other', label: '🎪 綜藝／資訊', count: listings.filter(p => ['variety', 'documentary', 'information', 'politics'].includes(p.group)).length }
  ];

  const query = catalogQuery.trim().toLocaleLowerCase('zh-HK');
  const shown = listings.filter(p => {
    if (catalogFilter === 'viu') {
      if (p.network !== 'ViuTV') return false;
    } else if (catalogFilter === 'other') {
      if (!['variety', 'documentary', 'information', 'politics'].includes(p.group)) return false;
    } else if (catalogFilter === 'series') {
      if (p.group !== 'series' || p.network === 'ViuTV') return false;
    } else if (catalogFilter !== 'all') {
      if (p.group !== catalogFilter) return false;
    }
    if (catalogNetwork !== 'all' && p.network !== catalogNetwork) return false;
    if (catalogYear !== 'all' && p.releaseYear !== Number(catalogYear)) return false;
    if (query && !`${p.title} ${p.subcategory} ${p.network||''} ${p.origin||''}`.toLocaleLowerCase('zh-HK').includes(query)) return false;
    if (catalogAvailableOnly && (isOwnedActive(p) || rivalBuysMap.has(p.id) || rivalBuysTitleMap.has(p.title))) return false;
    return true;
  });

  if (catalogSort === 'price') shown.sort((a, b) => a.cost - b.cost || b.rating - a.rating);
  if (catalogSort === 'rating') shown.sort((a, b) => b.rating - a.rating || a.cost - b.cost);
  if (catalogSort === 'buzz') shown.sort((a, b) => b.buzz - a.buzz || b.rating - a.rating);
  if (catalogSort === 'episodes') shown.sort((a, b) => b.episodes - a.episodes || a.cost - b.cost);

  return `<div class="page-head">
    <div>
      <div class="eyebrow gold">ACQUISITIONS · 第 ${month} 個月</div>
      <h1>外購節目市場與片庫管理</h1>
      <p>每 30 個遊戲日更換新片單，對手電視台亦會搶購熱門外購作品！已購入節目在合約期內享有播映權。價錢、供應與收視均為遊戲模擬。</p>
    </div>
    <div class="legend">本月片單 <strong>第 ${month} 個月 · 尚餘 ${nextRefresh - state.day} 日換月</strong></div>
  </div>

  ${(()=>{
    const activeSports = getActiveSportsEvents(state);
    if (!activeSports.length) return '';
    return `<div class="catalog-sports-bar">
      <span class="sports-badge">🏆 體育轉播權</span>
      <div class="sports-bar-text">
        ${activeSports.map(s => {
          const cfg = getSportsConfig(s);
          const isFullSeason = cfg?.type === 'pl' || cfg?.type === 'ucl' || (s.name && s.name.includes('全季'));
          const wonDay = s.wonDay ?? Math.max(1, (s.wonQuarter ?? (s.quarter - 1)) * DAYS_PER_QUARTER + 1);
          const validDuration = isFullSeason ? (DAYS_PER_QUARTER * 4) : DAYS_PER_QUARTER;
          const daysLeft = Math.max(0, wonDay + validDuration - state.day);
          return `<strong>${safe(s.name)}</strong>（尚餘 ${daysLeft} 天）`;
        }).join(' · ')}
      </div>
      <button class="primary-button" data-action="go-schedule">前往節目表排播 →</button>
    </div>`;
  })()}

  <div class="catalog-subnav" role="tablist" aria-label="片庫分頁">
    <button class="subnav-tab ${catalogSubTab==='market'?'active':''}" data-action="catalog-subtab" data-value="market" role="tab" aria-selected="${catalogSubTab==='market'}">
      🛒 外購節目市場 <span class="subnav-count">${listings.length}</span>
    </button>
    <button class="subnav-tab ${catalogSubTab==='replay'?'active':''}" data-action="catalog-subtab" data-value="replay" role="tab" aria-selected="${catalogSubTab==='replay'}">
      🔄 經典重播庫 ${readyToReplay.length ? `<span class="badge-count">${readyToReplay.length}</span>` : ''}
    </button>
    ${expiredLicenses.length ? `
      <button class="subnav-tab ${catalogSubTab==='renew'?'active':''}" data-action="catalog-subtab" data-value="renew" role="tab" aria-selected="${catalogSubTab==='renew'}">
        ⏰ 到期續約 <span class="badge-count danger">${expiredLicenses.length}</span>
      </button>
    ` : ''}
  </div>

  ${catalogSubTab === 'replay' ? replayQueueView() : catalogSubTab === 'renew' ? `
    <section class="renewal-list">
      <div class="subview-header">
        <div>
          <h2>⏰ 到期外購播映權 · 續約續期</h2>
          <p>以下外購節目播映期已滿，續約後保留原有播映紀錄與輪次。</p>
        </div>
      </div>
      <div class="license-picker" role="group" aria-label="選擇續購播映權期限">
        <strong>續約期限</strong>
        ${LICENSE_TERMS.map(term => `<button data-action="license-term" data-value="${term.days}" class="${licenseDays===term.days?'active':''}" aria-pressed="${licenseDays===term.days}">${term.label}${term.days===360?' · 1.7 倍價':''}</button>`).join('')}
      </div>
      <div>
        ${expiredLicenses.map(p => {
          const cost = licensePrice(p.licenseBaseCost ?? p.cost, licenseDays);
          const canAfford = state.cash >= cost;
          return `<article class="renewal-item">
            <div>
              <strong>《${safe(p.title)}》</strong>
              <small>${catalogProgressLabel(p)} · 原有成本 ${money(p.licenseBaseCost ?? p.cost)}</small>
            </div>
            <button class="catalog-button" data-action="renew" data-id="${safe(p.id)}" ${!canAfford?'disabled':''}>
              ${canAfford ? `續購 ${licenseDays===180?'6 個月':'1 年'} · ${catalogPrice(cost)}` : '資金不足'}
            </button>
          </article>`;
        }).join('')}
      </div>
    </section>
  ` : `
    <div class="license-picker" role="group" aria-label="選擇外購播映權期限">
      <strong>播映權期限</strong>
      ${LICENSE_TERMS.map(term=>`<button data-action="license-term" data-value="${term.days}" class="${licenseDays===term.days?'active':''}" aria-pressed="${licenseDays===term.days}">${term.label}${term.days===360?' · 1.7 倍價':''}</button>`).join('')}
      <small>6 個月＝180 遊戲日；1 年＝360 遊戲日。價格按所選期限即時換算。</small>
    </div>

    <div class="catalog-filters country-filters" role="group" aria-label="外購節目地區與分類">
      ${categoryFilters.map(g => `<button data-action="catalog-filter" data-value="${g.id}" class="${catalogFilter===g.id?'active':''}" aria-pressed="${catalogFilter===g.id}">${g.label} <small>${g.count}</small></button>`).join('')}
    </div>

    <div class="catalog-tools">
      <span aria-live="polite">顯示 ${shown.length} / ${listings.length} 套</span>
      <label>搜尋片名／地區 <input data-action="catalog-search" type="search" value="${safe(catalogQuery)}" placeholder="例如 黑暗榮耀、半澤直樹、IT狗" aria-label="搜尋外購節目" /></label>
      ${catalogFilter === 'viu' ? `
        <label>年份 <select data-action="catalog-year"><option value="all">全部年份</option>${[2020,2021,2022,2023,2024,2025,2026].map(year=>`<option value="${year}" ${catalogYear===String(year)?'selected':''}>${year}</option>`).join('')}</select></label>
      ` : ''}
      <button data-action="catalog-available" aria-pressed="${catalogAvailableOnly}" class="${catalogAvailableOnly?'active':''}">只睇未購</button>
      <label>排序 <select data-action="catalog-sort">
        <option value="featured" ${catalogSort==='featured'?'selected':''}>本月推薦</option>
        <option value="rating" ${catalogSort==='rating'?'selected':''}>收視高至低</option>
        <option value="buzz" ${catalogSort==='buzz'?'selected':''}>話題高至低</option>
        <option value="price" ${catalogSort==='price'?'selected':''}>價錢低至高</option>
        <option value="episodes" ${catalogSort==='episodes'?'selected':''}>集數多至少</option>
      </select></label>
    </div>

    <div class="catalog-grid">
      ${shown.length ? shown.map((p, i) => {
        const owned = getOwned(p);
        const ownedActive = isOwnedActive(p);
        const cost = licensePrice(p.cost, licenseDays);
        const f = owned ? freshnessLabel(owned.freshness, owned.maxFreshness) : null;
        const rivalBuy = rivalBuysMap.get(p.id) ?? rivalBuysTitleMap.get(p.title);
        const isRival = Boolean(rivalBuy);
        const originFlag = p.origin === '韓國' ? '🇰🇷' : p.origin === '日本' ? '🇯🇵' : p.origin === '台灣' ? '🇹🇼' : p.origin === '歐美' ? '🇺🇸' : p.origin === '內地' ? '🇨🇳' : '🇭🇰';

        return `<article class="program-card ${p.network==='ViuTV'?'viu-card':''} ${isRival?'rival-card':''}">
          <div class="program-art art-${(i + ACQUISITION_GROUPS.findIndex(g=>g.id===p.group))%4}">
            <span>${originFlag} ${safe(p.origin||'香港')} · ${safe(p.network || p.category)}${p.releaseYear?` · ${p.releaseYear}`:''}</span>
            <strong>${String(listings.indexOf(p)+1).padStart(2,'0')}</strong>
            <div class="art-lines"></div>
          </div>
          <div class="program-body">
            <div class="program-heading">
              <h2>${safe(p.title)}</h2>
              <b>${catalogPrice(cost)}</b>
            </div>
            <div class="program-spec">
              <span class="spec-tag">${safe(p.subcategory)}</span>
              <span>${p.episodes===1?'電影':`全劇 ${p.episodes} 集`}</span>
              <span class="rating-tag">預測收視 ${p.rating}</span>
              <span>話題 ${p.buzz}</span>
              ${owned ? `<span class="freshness-spec ${f.tier}" title="新鮮度 ${f.percent}% (上限 ${f.max}%) · ${f.desc}">${f.icon} ${f.percent}%</span>` : ''}
            </div>
            ${isRival ? `
              <div class="rival-bought-notice ${rivalBuy.rivalId}">
                <span>⚔️ ${safe(rivalBuy.rivalName)} 獨家搶購（至第 ${rivalBuy.expiresDay-1} 日）</span>
              </div>
            ` : owned ? `
              <p class="license-status">
                ${licenseExpired(owned, state.day)
                  ? `播映權已到期 · ${catalogProgressLabel(owned)}`
                  : isCatalogCycleComplete(owned)
                  ? `${catalogProgressLabel(owned)} · 可到重播庫安排重溫`
                  : `播映權有效至第 ${owned.licenseExpiresDay-1} 日（尚餘 ${Math.max(0, owned.licenseExpiresDay - state.day)} 日） · ${catalogProgressLabel(owned)}`}
              </p>
            ` : ''}
            <button class="catalog-button ${isRival?'is-rival-btn':''}"
              data-action="${isRival ? '' : owned && licenseExpired(owned, state.day) ? 'renew' : 'buy'}"
              data-id="${owned ? owned.id : p.id}"
              ${isRival || ownedActive || state.cash < cost ? 'disabled' : ''}>
              ${isRival ? '對手已買入' : ownedActive ? `已在片庫（尚餘 ${Math.max(0, owned.licenseExpiresDay - state.day)} 日）` : state.cash < cost ? '資金不足' : owned ? '續購版權 →' : '購買播映權 →'}
            </button>
          </div>
        </article>`;
      }).join('') : '<p class="empty">搵唔到相符節目。試吓更換篩選條件或搜尋關鍵字。</p>'}
    </div>
    <div class="footnote">外購節目一輪播完即騰空時段。播映權仍有效時，可在「經典重播庫」手動開新一輪並自行排檔；對手亦會在黃金時段播出其搶購作品。</div>
  `}
  `;
}

function sportsView() {
  const activeSports=getActiveSportsEvents(state);
  const events=activeBiddingEvents(state);
  const recentList=(state.events??[]).filter(e=>e.resolved).slice(-4).reverse();
  return `<div class="page-head"><div><div class="eyebrow gold">SPORTS BROADCAST RIGHTS</div><h1>體育版權中心 · 競投與買斷</h1><p>涵蓋英超、歐聯等全季轉播權及奧運、世界盃等頂級盛事。可選擇【一口價即時買斷】即買即播，亦可透過【暗標競投】比拼對台！</p></div></div>
    ${activeSports.length ? `
      <section class="panel sports-active-section">
        <div class="section-heading">
          <h2>🏆 已持有轉播權賽事（現正熱播）</h2>
          <span>即時直播資產 · 隨時可排播</span>
        </div>
        <div class="sports-active-grid">
          ${activeSports.map(s => {
            const cfg = getSportsConfig(s);
            const isFullSeason = cfg?.type === 'pl' || cfg?.type === 'ucl' || cfg?.type === 'racing' || (s.name && s.name.includes('全季'));
            const wonDay = s.wonDay ?? Math.max(1, (s.wonQuarter ?? (s.quarter - 1)) * DAYS_PER_QUARTER + 1);
            const validDuration = isFullSeason ? (DAYS_PER_QUARTER * 4) : DAYS_PER_QUARTER;
            const daysLeft = Math.max(0, wonDay + validDuration - state.day);
            const bookedBlocks = state.schedule.filter(b => b.programId === `event:${s.id}`);
            const bookedSummary = bookedBlocks.length ? bookedBlocks.map(b => `${dayPattern(daysForBlock(b))} ${hourLabel(b.start)}`).join('、') : '尚未排播';
            return `<div class="sports-owned-card">
              <div class="sports-owned-info">
                <span class="sports-icon-badge">${s.icon || '🏅'}</span>
                <div>
                  <strong>${safe(s.name)}</strong>
                  <p>轉播權有效中（至第 ${wonDay + validDuration - 1} 日，尚餘 ${daysLeft} 天） · 當前排播：<b>${safe(bookedSummary)}</b></p>
                </div>
              </div>
              <button class="primary-button" data-action="go-schedule">前往節目表排播 →</button>
            </div>`;
          }).join('')}
        </div>
      </section>
    ` : ''}
    <div class="sports-bidding-grid">
      ${events.length?events.map(event=>{
        const isReadyToBid=event.quarter>state.quarter;
        const quartersUntil=event.quarter-state.quarter;
        const buyoutCost=Math.round(event.floor*1.35/100_000)*100_000;
        const existingBid=event.playerBid??0;
        const neededBuyout=buyoutCost-existingBid;
        const cfg = getSportsConfig(event);
        const desc = cfg?.type === 'racing'
          ? '🏇 香港賽馬：跑馬地夜馬（週三 19:00–23:00）及沙田日馬（週日 13:00–18:00）全季直播；7、8月暑期休季停跑。收視率不追求超高但基本盤極穩定（約 61–66 點），忠實馬迷固定收看！'
          : cfg?.type === 'pl'
          ? '⚽ 英超聯賽：真實亞洲時區轉播。買斷或中標後預排【週末焦點（週六日 19:00–24:00）】直播；時段與歐聯週中深夜完全獨立絕不重疊。逢歐聯比賽週英超全週休戰暫停；7、8月暑期休季；直播收視高達 98 點！'
          : cfg?.type === 'ucl'
          ? '⭐ 歐聯賽事：歐聯賽事嚴格於【週二三深夜 01:00–05:00】直播（隔週比賽週進行），週末絕無賽事。歐聯週期間英超自動休戰，雙方時段完全互不重疊，深夜收視震撼爆燈！'
          : '依真實賽程排播焦點直播，直播收視可達 98 點；廣告收入達唔到目標需賠付差額。';
        return `<section class="panel sports-bid-card ${event.playerBid!==null?'has-bid':''}">
          <div class="sports-card-top">
            <span class="sports-icon-badge">${event.icon||'🏅'}</span>
            <div>
              <div class="sports-overline">${event.sport||'大型賽事'} · ${quarterLabel(event.quarter)} 開標（尚餘 ${quartersUntil} 季）</div>
              <h2>${safe(event.name)}</h2>
            </div>
          </div>
          <div class="sports-metrics">
            <div><small>競投底價</small><b>${money(event.floor)}</b></div>
            <div><small>一口價買斷</small><b class="gold-text">${money(buyoutCost)}</b></div>
            <div><small>廣告對賭目標</small><b>${money(event.adTarget)}</b></div>
            <div><small>我的暗標</small><b class="${event.playerBid!==null?'gold-text':'muted'}">${event.playerBid!==null?money(event.playerBid):'未出價'}</b></div>
          </div>
          <p class="sports-card-desc">${desc}</p>
          <div class="sports-action-box">
            ${event.playerBid!==null ? `
              <div class="bid-current-status">
                <span class="status-tag gold">🕒 已提交暗標：${money(event.playerBid)}（保證金已凍結）</span>
                <div class="sports-fast-actions">
                  <button type="button" class="primary-button" data-action="sports-reveal-now" data-event="${safe(event.id)}">⚡ 立即提前揭曉底牌</button>
                  <button type="button" class="gold-button" data-action="sports-buyout" data-event="${safe(event.id)}" ${state.cash < neededBuyout ? 'disabled' : ''}>⚡ 補足 ${money(neededBuyout)} 一口價買斷（即買即播）</button>
                </div>
              </div>
              <form class="bid-form inline-bid-form" data-event="${safe(event.id)}">
                <label for="bid-${safe(event.id)}">修改暗標</label>
                <div class="bid-input">
                  <span>$</span>
                  <input id="bid-${safe(event.id)}" name="amount" type="number" step="0.1" min="${event.floor/1_000_000}" max="100" required value="${(event.playerBid/1_000_000).toFixed(1)}"/>
                  <span>m</span>
                </div>
                <button class="soft-button bid-submit-btn" type="submit">更新暗標</button>
              </form>
            ` : `
              <div class="sports-fast-actions">
                <button type="button" class="gold-button buyout-btn" data-action="sports-buyout" data-event="${safe(event.id)}" ${state.cash < buyoutCost ? 'disabled' : ''}>⚡ 一口價買斷全季轉播權（${money(buyoutCost)} · 即買即播）</button>
              </div>
              <div class="or-divider"><span>或選擇暗標競投</span></div>
              <form class="bid-form" data-event="${safe(event.id)}">
                <div class="bid-input-row">
                  <label for="bid-${safe(event.id)}">暗標出價</label>
                  <div class="bid-input">
                    <span>$</span>
                    <input id="bid-${safe(event.id)}" name="amount" type="number" step="0.1" min="${event.floor/1_000_000}" max="100" required value="${(event.floor*1.35/1_000_000).toFixed(1)}"/>
                    <span>m</span>
                  </div>
                  <button class="primary-button bid-submit-btn" type="submit">封標投出 <span>↗</span></button>
                </div>
                <div class="bid-note">暗標出價凍結保證金 · 開標日揭曉對手底牌</div>
              </form>
            `}
          </div>
        </section>`;
      }).join(''):'<p class="empty panel">目前未有開放投標或買斷嘅體育版權賽事，請繼續推進季度。</p>'}
    </div>
    <div class="rivals"><div class="section-heading"><h2>競爭電視台競投風格</h2><span>三間對手會在開標日同時掀開底牌</span></div><div class="rival-grid"><div><span class="rival-icon">01</span><strong>翡翠台</strong><small>電視廣播（無綫）· 財雄勢大，出價通常高出底價 35%–75%</small></div><div><span class="rival-icon">02</span><strong>ViuTV</strong><small>香港電視娛樂 · 瞄準青年與國際盛事，出價貼近市場</small></div><div><span class="rival-icon">03</span><strong>HOY TV</strong><small>有線寬頻 · 偶爾爆冷高價搶奪焦點大賽</small></div></div></div>
    ${recentList.length?`<section class="panel auction-results-history"><div class="section-heading"><h2>近期賽事開標紀錄</h2><span>揭曉結果</span></div><div class="recent-auctions-grid">${recentList.map(recent=>`<article class="recent-auction-item ${recent.winner==='你的電視台'?'we-won':''}"><div class="recent-auction-header"><strong>${safe(recent.name)}</strong><span class="winner-tag ${recent.winner==='你的電視台'?'gold':''}">得標者：${safe(recent.winner)}</span></div><div class="bid-list">${(recent.bids??[]).sort((a,b)=>b.amount-a.amount).map((b,i)=>`<div class="${b.name==='你的電視台'?'is-our-bid':''}"><span>${String(i+1).padStart(2,'0')} · ${safe(b.name)}</span><strong>${money(b.amount)}</strong></div>`).join('')}</div></article>`).join('')}</div></section>`:''}`;
}

function hourlyComparisonView() {
  const result=state.lastDayResult;
  const visible=result.hours.filter(h=>reportFilter==='prime'?h.hour>=18&&h.hour<=22:reportFilter==='behind'?h.rating<=Math.max(...h.rivals):true);
  const filters=[['all','全日 24 小時'],['prime','黃金檔 18–22'],['behind','落後時段']];
  return `<section class="panel history-panel comparison-panel">
    <div class="section-heading"><h2>逐小時收視對比</h2><span>我台勝出 ${result.wins} / 24 小時</span></div>
    <p class="score-explainer">收視指數係遊戲內 0–100 分，唔係收視率百分比。我台分數高過<strong>三間對手（翡翠台、ViuTV、HOY TV）</strong>先算勝出；廣告收入係該小時賺到嘅錢。</p>
    <div class="report-filters" role="group" aria-label="篩選收視時段">${filters.map(([id,label])=>`<button data-action="report-filter" data-value="${id}" class="${reportFilter===id?'active':''}" aria-pressed="${reportFilter===id}">${label}</button>`).join('')}</div>
    <div class="hour-report">${visible.length?visible.map(h=>{
      const strongest=Math.max(...h.rivals),outcome=h.rating>strongest?'勝出':h.rating===strongest?'打和':'落後';
      const stations=[['我台',h.rating,'ours'],...state.rivals.map((r,idx)=>[r.name,h.rivals[idx]??0,r.id])];
      return `<article class="hour-match ${outcome==='勝出'?'is-win':'is-behind'} ${h.hour>=18&&h.hour<=22?'is-prime':''}">
        <div class="hour-match-title"><strong>${hourLabel(h.hour)}</strong><span>${safe(h.title)}${h.episode?` · ${safe(h.episode)}`:''}${h.freshness!==undefined?(()=>{const f=freshnessLabel(h.freshness,h.maxFreshness);return ` · <small class="match-freshness ${f.tier}">${f.icon} ${f.percent}%</small>`;})():''}</span><b>${outcome}</b></div>
        <div class="score-cards">${stations.map(([name,score,kind])=>`<div class="score-card ${kind}"><div><span>${safe(name)}</span><strong>${score}</strong></div><span class="score-meter" aria-hidden="true"><i style="width:${Math.max(0,Math.min(100,Number(score)||0))}%"></i></span></div>`).join('')}</div>
        <div class="hour-match-revenue"><span>每小時廣告收入</span><strong>${hourlyMoney(h.revenue)}</strong></div>
      </article>`;
    }).join(''):'<p class="empty">呢個篩選暫時冇時段。</p>'}</div>
  </section>`;
}

function audienceView() {
  const letters=(state.mailbox??[]).slice(0,10),comments=(state.audienceFeed??[]).slice(0,6);
  return `<div class="audience-grid">
    <section class="panel">
      <div class="section-heading"><h2>觀眾留言</h2><span>按每日播映收視生成嘅遊戲模擬評語</span></div>
      ${comments.length?comments.map(item=>`<article class="audience-item ${item.tone}"><small>第 ${item.day} 日 · 《${safe(item.title)}》</small><p>${safe(item.text)}</p></article>`).join(''):'<p class="empty">播出第一日之後，觀眾先會留言。</p>'}
    </section>
    <section class="panel">
      <div class="section-heading"><div><h2>觀眾信箱與特別互動</h2><span>觀眾點播、狂熱粉絲與監管機構來信</span></div>${letters.some(l=>l.resolved)?`<button class="inline-link-btn" data-action="clear-resolved-letters">清理已處理信件 ✕</button>`:''}</div>
      <div class="audience-campaign-box">
        <div class="campaign-card">
          <div class="campaign-info">
            <strong>🎉 舉辦全港粉絲見面會</strong>
            <small>花費 $100k · 全台熱度 +4、口碑 +2、下一套道具品質 +2、台柱人氣提升</small>
          </div>
          <button class="campaign-btn" data-action="fan-meeting" ${state.cash<100_000?'disabled':''}>立即舉辦</button>
        </div>
        <div class="campaign-card">
          <div class="campaign-info">
            <strong>🗳️ 發起全港節目民意公投</strong>
            <small>花費 $30k · 全台熱度 +2 · 鎖定全港觀眾最敲碗題材加成</small>
          </div>
          <button class="campaign-btn" data-action="poll-audience" ${state.cash<30_000?'disabled':''}>發起公投</button>
        </div>
      </div>
      ${letters.length?letters.map(item=>{
        const isSpecial=Boolean(item.options&&item.options.length);
        const typeLabel=item.title?`【${item.title}】`:item.type==='request'?'節目點播':item.type==='gift'?'觀眾禮物':'意見投訴';
        return `<article class="audience-item ${isSpecial?'is-special-audience':''}">
          <div class="audience-item-head">
            <small>第 ${item.day} 日 · ${safe(typeLabel)}</small>
            ${item.resolved?`<span class="letter-done">✓ 已處理</span><button class="letter-dismiss-btn" data-action="dismiss-letter" data-id="${safe(item.id)}" title="移除紀錄">✕ 移除</button>`:''}
          </div>
          <p>${safe(item.text)}</p>
          ${item.resolved?`
            <div class="resolved-note">${item.resolvedChoice==='rejected'?'已婉拒／忽略處理':item.resolvedChoiceLabel?`已選擇：<strong>${safe(item.resolvedChoiceLabel)}</strong>`:'已回覆觀眾'}</div>
          `:isSpecial?`
            <div class="letter-choices-box">
              ${item.options.map(opt=>`
                <button class="letter-choice-btn" data-action="reply-letter-choice" data-id="${safe(item.id)}" data-choice="${safe(opt.id)}" ${opt.cost&&state.cash<opt.cost?'disabled':''}>
                  <div class="choice-top"><strong>${safe(opt.label)}</strong>${opt.cost?`<b class="${state.cash<opt.cost?'danger':''}">${money(opt.cost)}</b>`:''}</div>
                  <small>${safe(opt.desc)}</small>
                </button>
              `).join('')}
              <button class="letter-reject-btn" data-action="reject-letter" data-id="${safe(item.id)}">婉拒／忽略 ✕</button>
            </div>
          `:`
            <div class="letter-action-row">
              <button class="letter-accept-btn" data-action="reply-letter" data-id="${safe(item.id)}">${item.type==='request'?'接納點播':item.type==='gift'?'收下禮物':'回覆及改善 · $50k'}</button>
              <button class="letter-reject-btn" data-action="reject-letter" data-id="${safe(item.id)}">婉拒／忽略 ✕</button>
            </div>
          `}
        </article>`;
      }).join(''):'<p class="empty">信箱暫時冇信；繼續播映會收到觀眾回應。</p>'}
    </section>
  </div>`;
}

function premiereHistoryView(){
  const items=(state.premiereHistory??[]).slice(0,5);
  return items.length?`<section class="panel premiere-history"><div class="section-heading"><h2>首播戰績</h2><span>最近 ${items.length} 套 · 決策已生效</span></div><div class="premiere-history-list">${items.map(item=>`<article><span class="history-symbol">${safe(premiereProfile(item.kind).symbol)}</span><div><strong>《${safe(item.title)}》</strong><small>第 ${item.day} 日 · ${safe(premiereProfile(item.kind).label)} · ${item.won?'勝出':'落後'} ${Math.abs(item.rating-item.rivalRating)} 分</small></div><b>${item.rating} : ${item.rivalRating}</b></article>`).join('')}</div></section>`:'';
}

function monthlyLeaderboardView() {
  const leaderboards = state.monthlyLeaderboards ?? [];
  if (!leaderboards.length) return '';
  const current = leaderboards.find(l => l.month === selectedLeaderboardMonth) ?? leaderboards[0];
  return `<section class="panel monthly-leaderboard-panel">
    <div class="section-heading">
      <div>
        <div class="eyebrow gold">MONTHLY RATINGS ARCHIVE</div>
        <h2>全港電視月度收視龍虎榜</h2>
      </div>
      <span class="report-meta-tag">第 ${current.month} 個月（第 ${current.day} 日結算）</span>
    </div>
    <div class="month-selector-tabs" role="group" aria-label="選擇查看月份">
      ${leaderboards.map(l => `<button data-action="leaderboard-month" data-month="${l.month}" class="${l.month === current.month ? 'active' : ''}" aria-pressed="${l.month === current.month}">第 ${l.month} 個月${l.isOurWin ? ' 👑' : ''}</button>`).join('')}
    </div>
    <div class="month-champion-strip ${current.isOurWin ? 'our-win' : 'rival-win'}">
      <div class="strip-main">
        <span class="strip-crown">👑</span>
        <div>
          <span class="strip-sub">全港月度最高收視總冠軍</span>
          <strong class="strip-title">《${safe(current.champion.title)}》</strong>
          <span class="strip-station">${safe(current.champion.station)} · 最高收視 <b>${current.champion.peakRating}</b> 點 · 平均 ${current.champion.avgRating} 點</span>
        </div>
      </div>
      ${current.isOurWin ? '<span class="strip-badge gold">我台奪冠 · 花紅 $600k 入帳</span>' : `<span class="strip-badge neutral">我台最高：《${safe(current.ourBest.title)}》（${current.ourBest.peakRating} 點 · 第 ${current.ourBest.rank} 名）</span>`}
    </div>
    <div class="month-top5-table-box">
      <table class="month-top5-table">
        <thead>
          <tr>
            <th>名次</th>
            <th>節目名稱</th>
            <th>電視台</th>
            <th>最高收視</th>
            <th>平均收視</th>
          </tr>
        </thead>
        <tbody>
          ${current.top5.map(item => `
            <tr class="${item.station === '你的電視台' ? 'is-ours' : ''}">
              <td class="rank-cell"><span class="rank-badge rank-${item.rank}">${item.rank}</span></td>
              <td class="title-cell"><strong>${safe(item.title)}</strong></td>
              <td class="station-cell"><span class="station-tag ${item.station === '你的電視台' ? 'tag-ours' : ''}">${safe(item.station)}</span></td>
              <td class="rating-cell"><strong>${item.peakRating}</strong></td>
              <td class="avg-cell">${item.avgRating}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </section>`;
}

function annualAwardsHistoryView() {
  const ceremonies = state.awardCeremonies ?? [];
  const daysUntilNext = 360 - ((state.day - 1) % 360);
  return `<section class="panel ceremonies-history-panel">
    <div class="section-heading">
      <div>
        <div class="eyebrow gold">HALL OF FAME</div>
        <h2>榮譽殿堂 · 歷屆年度電視頒獎盛典</h2>
      </div>
      <span>距下屆盛典仲有 ${daysUntilNext} 日</span>
    </div>
    ${ceremonies.length ? `
    <div class="ceremonies-list">
      ${ceremonies.map(c => `
        <article class="ceremony-history-card">
          <div class="ceremony-history-header">
            <h3>🏆 ${c.year} 年度電視頒獎盛典</h3>
            <span class="ceremony-wins-tag">我台勇奪 ${c.ourWins} / ${c.awards.length} 項大獎 · 獲頒盛典獎金 ${money(c.totalPrize)}</span>
          </div>
          <div class="ceremony-history-grid">
            ${c.awards.map(a => `
              <div class="ceremony-history-item ${a.isOurs ? 'is-ours' : ''}">
                <div class="item-cat-line">
                  <span class="item-icon">${a.icon}</span>
                  <span class="item-cat">${safe(a.category)}</span>
                  ${a.isOurs ? '<span class="item-badge-ours">我台得獎</span>' : ''}
                </div>
                <strong class="item-winner">${safe(a.winner)}</strong>
                <small class="item-station">${safe(a.station)}</small>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </div>` : `
    <div class="trophy-empty-state">
      <div class="trophy-empty-icon">🏆</div>
      <strong>尚未有歷屆大獎紀錄</strong>
      <p>首屆年度電視頒獎盛典將於第 360 日盛大舉行。拍好自製節目、搶贏黃金檔收視，全力衝擊年度大獎！</p>
    </div>`}
  </section>`;
}

function boardroomReportView() {
  const satisfaction = state.boardSatisfaction ?? 75;
  const warnings = state.boardWarnings ?? 0;
  const history = state.boardHistory ?? [];
  const latest = history[0] ?? null;

  return `
    <section class="panel boardroom-panel">
      <div class="panel-heading">
        <div>
          <div class="eyebrow gold">BOARD OF DIRECTORS & SHAREHOLDERS</div>
          <h2>👔 董事會總裁審批與大股東增資</h2>
          <p class="subtitle">每季（90 日）向大老闆及董事會交代業績；評核優秀獲無償注資，虧損會收到整改警告！</p>
        </div>
        <div class="board-indicators">
          <span class="board-meter-pill">
            滿意度 <b>${satisfaction} / 100</b>
          </span>
          ${warnings > 0 ? `<span class="board-warning-pill danger">⚠️ 關注函 ${warnings} 次</span>` : '<span class="board-warning-pill good">無警告紀錄</span>'}
        </div>
      </div>

      <div class="board-overview-grid">
        <div class="board-satisfaction-card">
          <small>大股東及董事會滿意度指數</small>
          <div class="satisfaction-bar-box">
            <div class="satisfaction-track">
              <div class="satisfaction-fill ${satisfaction >= 80 ? 'good' : satisfaction >= 50 ? 'warning' : 'danger'}" style="width: ${satisfaction}%"></div>
            </div>
            <strong>${satisfaction}%</strong>
          </div>
          <p class="satisfaction-hint">${satisfaction >= 85 ? '🌟 大股東高度信賴管理層，樂於發放擴充基金！' : satisfaction >= 60 ? '穩健運作，繼續保持季度盈利。' : '⚠️ 董事會滿意度偏低，請盡快減虧增收！'}</p>
        </div>

        <div class="board-latest-card">
          <small>最近一季董事會評核評級</small>
          ${latest ? `
            <div class="board-grade-row">
              <span class="grade-badge grade-${latest.rank}">${latest.rank} 級</span>
              <div class="grade-details">
                <strong>${latest.netProfit >= 0 ? `淨盈利 +${money(latest.netProfit)}` : `虧損 ${money(latest.netProfit)}`}</strong>
                ${latest.boardBonus > 0 ? `<span class="bonus-tag gold-text">🎉 大股東增資 +${money(latest.boardBonus)}</span>` : '<span class="bonus-tag">無注資</span>'}
              </div>
            </div>
            <p class="board-comment">「${safe(latest.comment)}」</p>
          ` : `
            <p class="empty">第一季尚未完成結算。每 90 日將進行董事會大會。</p>
          `}
        </div>
      </div>

      ${history.length > 0 ? `
        <div class="board-history-box">
          <h3>歷季董事會審批紀錄</h3>
          <div class="board-history-list">
            ${history.map(h => `
              <div class="board-history-item">
                <span class="history-quarter">第 ${h.quarter} 季</span>
                <span class="grade-badge mini grade-${h.rank}">${h.rank} 級</span>
                <span class="history-net ${h.netProfit >= 0 ? 'good' : 'danger'}">${h.netProfit >= 0 ? '+' : ''}${money(h.netProfit)}</span>
                ${h.boardBonus > 0 ? `<span class="history-bonus gold-text">+${money(h.boardBonus)} 注資</span>` : '<span class="history-bonus muted">—</span>'}
                <span class="history-comment">${safe(h.comment)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}


function dailyHighlightsView(highlights, day) {
  if (!highlights?.top || !highlights?.lowest) return '';
  const { top, lowest } = highlights;
  const topDiff = top.diff >= 0 ? `+${top.diff}` : `${top.diff}`;
  const lowDiff = lowest.diff >= 0 ? `+${lowest.diff}` : `${lowest.diff}`;
  return `<section class="panel daily-highlights-box">
    <div class="highlights-head">
      <div>
        <div class="eyebrow gold">DAILY BROADCAST HIGHLIGHTS</div>
        <h2>第 ${day} 日 · 節目收視焦點與警戒</h2>
      </div>
      <span class="highlights-legend">收視 vs 最強對手差距</span>
    </div>
    <div class="highlights-grid">
      <div class="highlight-card top-card">
        <div class="highlight-badge-pill gold">🏆 今日最高收視焦點</div>
        <div class="highlight-body">
          <div class="highlight-title-row">
            <strong>《${safe(top.title)}》</strong>
            <span class="highlight-time">${hourLabel(top.start)}–${hourLabel(top.start + top.duration)}</span>
          </div>
          <div class="highlight-stats-row">
            <div class="stat-unit">
              <small>我台收視</small>
              <strong class="stat-high">${top.rating}</strong>
            </div>
            <div class="stat-unit">
              <small>對手收視</small>
              <strong>${top.rivalRating}</strong>
            </div>
            <div class="stat-unit">
              <small>領先差距</small>
              <strong class="${top.won ? 'stat-won' : 'stat-lost'}">${topDiff}</strong>
            </div>
            <div class="stat-unit">
              <small>單日廣告收入</small>
              <strong class="gold-text">${hourlyMoney(top.revenue || 0)}</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="highlight-card low-card">
        <div class="highlight-badge-pill gray">⚠️ 今日最低收視警戒</div>
        <div class="highlight-body">
          <div class="highlight-title-row">
            <strong>《${safe(lowest.title)}》</strong>
            <span class="highlight-time">${hourLabel(lowest.start)}–${hourLabel(lowest.start + lowest.duration)}</span>
          </div>
          <div class="highlight-stats-row">
            <div class="stat-unit">
              <small>我台收視</small>
              <strong class="stat-low">${lowest.rating}</strong>
            </div>
            <div class="stat-unit">
              <small>對手收視</small>
              <strong>${lowest.rivalRating}</strong>
            </div>
            <div class="stat-unit">
              <small>勝負差距</small>
              <strong class="${lowest.won ? 'stat-won' : 'stat-lost'}">${lowDiff}</strong>
            </div>
            <div class="stat-unit">
              <small>單日廣告收入</small>
              <strong class="gold-text">${hourlyMoney(lowest.revenue || 0)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function shopView() {
  const activeCount = (state.activeTools ?? []).filter(t => t.expiresDay > state.day).length;
  return `<div class="page-head">
    <div>
      <div class="eyebrow cyan">EQUIPMENT & PRODUCTION BOOSTERS</div>
      <h1>道具與升級商城</h1>
      <p>租用頂尖拍攝器材、聘請名牌編劇導師或進行跨平台全城宣傳。每項道具租約為期 30 日，全方位強化自製節目、藝人表現與全台指標！</p>
    </div>
    <div class="legend">目前生效中道具：<strong>${activeCount} 件</strong></div>
  </div>
  ${activeCount ? `
    <section class="panel active-tools-panel">
      <div class="section-heading">
        <h2>⚡ 生效中道具狀態</h2>
        <span>剩餘租期屆滿後自動失效，可隨時續租延長 30 日</span>
      </div>
      <div class="active-tools-grid">
        ${(state.activeTools ?? []).filter(t => t.expiresDay > state.day).map(t => {
          const daysLeft = t.expiresDay - state.day;
          return `<div class="active-tool-chip">
            <span class="active-tool-icon">${t.icon}</span>
            <div class="active-tool-info">
              <strong>${safe(t.name)}</strong>
              <small class="tool-effect-badge">${safe(t.effectBadge || '')}</small>
              <span class="tool-timer ${daysLeft <= 5 ? 'urgent' : ''}">尚餘 ${daysLeft} 日（第 ${t.expiresDay} 日到期）</span>
            </div>
            <button class="tool-renew-btn" data-action="buy-tool" data-tool-id="${t.id}" ${state.cash < (SHOP_TOOLS.find(st=>st.id===t.id)?.price??0)?'disabled':''}>續租 30 日</button>
          </div>`;
        }).join('')}
      </div>
    </section>
  ` : ''}
  <div class="shop-grid">
    ${SHOP_TOOLS.map(tool => {
      const active = isToolActive(state, tool.id);
      const daysLeft = getToolTimeRemaining(state, tool.id);
      return `<article class="panel tool-card ${active ? 'is-active' : ''}">
        <div class="tool-card-head">
          <span class="tool-card-icon">${tool.icon}</span>
          <div class="tool-card-titles">
            <div class="eyebrow cyan">30-DAY LEASE · 有效 30 日</div>
            <h2>${safe(tool.name)}</h2>
          </div>
          <span class="tool-price">${money(tool.price)}</span>
        </div>
        <p class="tool-card-desc">${safe(tool.description)}</p>
        <div class="tool-card-meta">
          <span class="tool-effect-pill">${safe(tool.effectBadge)}</span>
          ${active ? `<span class="tool-status-pill active">生效中 · 尚餘 ${daysLeft} 日</span>` : `<span class="tool-status-pill idle">未租用</span>`}
        </div>
        <button class="primary-button tool-action-btn ${active ? 'renew-style' : ''}" data-action="buy-tool" data-tool-id="${tool.id}" ${state.cash < tool.price ? 'disabled' : ''}>
          ${state.cash < tool.price ? `資金不足 (${money(tool.price)})` : active ? `續約延長 30 日 (${money(tool.price)})` : `立即租用 (${money(tool.price)})`}
        </button>
      </article>`;
    }).join('')}
  </div>`;
}

function reportsView() {
  return `<div class="page-head"><div><div class="eyebrow gold">BOARDROOM</div><h1>每日與季度報告</h1><p>每日節目表會逐日播映，每 90 日結算一季；報告按每小時收視計廣告收益。</p></div></div>${state.lastDayResult?`<section class="panel day-report"><div class="section-heading"><h2>最近一日 · ${state.lastDayResult.label}</h2><span>${quarterLabel(state.lastDayResult.quarter)}</span></div><div class="report-total"><div><small>當日廣告收入</small><strong>${hourlyMoney(state.lastDayResult.revenue)}</strong></div><div><small>當日營運開支</small><strong>${hourlyMoney(state.lastDayResult.overhead)}</strong></div><div><small>當日淨額</small><strong>${hourlyMoney(state.lastDayResult.net)}</strong></div></div><div class="day-episodes">${state.lastDayResult.details.filter(d=>d.episode && d.episode!=='每日新一期').map(d=>`<span>${safe(d.title)} · ${safe(d.episode)}</span>`).join('')}</div></section>`:''}
  ${dailyHighlightsView(state.lastDayResult?.highlights, state.lastDayResult?.day)}
  <div class="report-grid"><section class="panel"><div class="section-heading"><h2>最近季度結算</h2><span>${state.lastResult?.label??'尚未結算'}</span></div>${state.lastResult?`<div class="report-total"><div><small>90 日節目及廣告收益</small><strong>${money(state.lastResult.revenue)}</strong></div><div><small>營運開支</small><strong>−${money(state.lastResult.overhead)}</strong></div><div><small>季度淨額</small><strong class="${state.lastResult.net<0?'danger':''}">${money(state.lastResult.net)}</strong></div></div>${state.lastResult.sportsPenalty?`<div class="report-row"><span>體育廣告對賭賠付</span><b>−${money(state.lastResult.sportsPenalty)}</b></div>`:''}`:'<p class="empty">結算第一季之後，就會睇到完整數據。</p>'}</section><section class="panel"><div class="section-heading"><h2>電視台紀錄</h2><span>${state.library.length} 套節目入庫</span></div><div class="achievement"><small>已解鎖成就</small>${state.achievements.length?state.achievements.map(a=>`<span>★ ${safe(a)}</span>`).join(''):'<p>仲未解鎖。試吓挑戰危險錯配，或者贏得一場版權暗標。</p>'}</div><div class="achievement"><small>贊助商</small>${state.sponsors.length?state.sponsors.map(s=>`<span>✦ ${safe(s)}</span>`).join(''):'<p>特殊贊助商會喺 Cult 片爆紅後出現。</p>'}</div></section></div>
  ${state.lastDayResult?.talentChanges?.length?`<section class="panel talent-report">
    <div class="section-heading"><h2>主演知名度與片酬變動</h2><span>依照昨日播映收視與市場期待動態調整（有升有跌）</span></div>
    <div class="talent-changes">${state.lastDayResult.talentChanges.map(t=>{
      const fameDiff = t.diff ?? Math.round((t.fame - t.before.fame)*10)/10;
      const feeDiff = t.feeDiff ?? (t.fee - t.before.fee);
      const isUp = fameDiff > 0, isDown = fameDiff < 0;
      return `<div>
        <strong>${safe(t.name)}</strong>
        <span>知名度 ${t.before.fame.toFixed(1)} → ${t.fame.toFixed(1)} <b class="${isUp?'trend-up':isDown?'trend-down':'trend-flat'}">${isUp?`▲ +${fameDiff.toFixed(1)}`:isDown?`▼ ${fameDiff.toFixed(1)}`:'― 0.0'}</b></span>
        <b>${preciseMoney(t.before.fee)} → ${preciseMoney(t.fee)} ${feeDiff>0?`(+${preciseMoney(feeDiff)})`:feeDiff<0?`(−${preciseMoney(Math.abs(feeDiff))})`:''}</b>
        ${t.reason?`<small class="talent-reason">${safe(t.reason)}</small>`:''}
      </div>`;
    }).join('')}</div>
  </section>`:''}
  ${boardroomReportView()}
  ${audienceView()}
  ${premiereHistoryView()}
  ${broadcastResultsView()}
  ${monthlyLeaderboardView()}
  ${annualAwardsHistoryView()}
  ${state.lastDayResult?hourlyComparisonView():''}
  <section class="panel history-panel"><div class="section-heading"><h2>季度帳目</h2><span>最近 12 季</span></div>${state.history.length?state.history.map(h=>`<div class="history-row"><strong>${h.label}</strong><span>收益 ${money(h.revenue)}</span><span>營運 ${money(h.overhead)}</span><b class="${h.net<0?'danger':''}">${money(h.net)}</b></div>`).join(''):'<p class="empty">第一季播完之後，就會有每季收支對比。</p>'}</section>`;
}

function flash(message){notice=message;render();setTimeout(()=>{if(notice===message){notice='';render();}},3600)}

app.addEventListener('click',e=>{
  const button=e.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action, value=button.dataset.value;
  try {
    if(action==='set-pricing-strategy'){setAdPricingStrategy(state,button.dataset.strategy);flash('已調整廣告定價策略！');render();return;}
    if(action==='sign-ad-contract'){const c=signAdContract(state,button.dataset.contractId);flash(`成功簽署《${c.name}》贊助合約！預付款已入帳。`);render();return;}
    if(action==='upgrade-facility'){const cfg=upgradeFacility(state,button.dataset.facility);flash(`成功擴建升級【${cfg.name}】！`);render();return;}
    if(action==='sign-exclusive-talent'){signExclusiveTalent(state,button.dataset.actorId,Number(button.dataset.days||90));flash('成功簽約旗下專屬台柱！拍攝自製劇片酬 $0，並每季貢獻代言收益！');render();return;}
    if(action==='train-talent'){trainTalent(state,button.dataset.actorId,button.dataset.type);flash('藝人完成培訓課程，能力大幅提升！');render();return;}
    if(action==='rest-talent'){restTalent(state,button.dataset.actorId);flash('已安排藝人休假充電，體力充分恢復！');render();return;}
    if(action==='unlock-subchannel'){unlockSubChannel(state);scheduleChannel=2;flash('恭喜獲發牌照！數碼二台正式開台，每日享有 28% 副台廣告收益！');render();return;}
    if(action==='switch-channel'){scheduleChannel=Number(button.dataset.channel);render();return;}
    if(action==='talent-filter'){talentSubTab=value;render();return;}
    if(action==='rivals-tab'){rivalsTab=value;render();return;}
    if(action==='studio-subtab'){studioSubTab=value;resetScroll=true;render();return;}
    if(action==='crew-format-filter'){crewFormatFilter=value;render();return;}
    if(action==='new-proj-format'){
      newProjState.format=value;
      if(value!=='drama'){
        newProjState.genre=value==='variety'?'綜藝生活':value==='news'?'港聞焦點':value==='documentary'?'社會實況':value==='talkshow'?'午夜深情':'大型盛事';
      }
      const maxAllowed = value === 'drama' ? 4 : (value === 'variety' || value === 'live') ? 3 : 2;
      if (newProjState.actorIds.length > maxAllowed) {
        newProjState.actorIds = newProjState.actorIds.slice(0, maxAllowed);
      }
      const fmtCrews = getCrewsForFormat(value, state);
      const fmtDirs = fmtCrews.filter(c => c.role === 'director');
      const fmtWris = fmtCrews.filter(c => c.role === 'writer');
      if (fmtDirs.length) newProjState.directorId = fmtDirs[0].id;
      if (fmtWris.length) newProjState.writerId = fmtWris[0].id;
      render();
      return;
    }
    if(action==='new-proj-genre'){newProjState.genre=value;render();return;}
    if(action==='new-proj-theme'){
      if(newProjState.themes.includes(value)){
        if(newProjState.themes.length>1)newProjState.themes=newProjState.themes.filter(t=>t!==value);
      } else if(newProjState.themes.length<2){
        newProjState.themes.push(value);
      } else {
        newProjState.themes=[newProjState.themes[1],value];
      }
      render();
      return;
    }
    if(action==='new-proj-audience'){newProjState.targetAudience=value;render();return;}
    if(action==='new-proj-strategy'){newProjState.strategy=value;render();return;}
    if(action==='new-proj-ep-count'){newProjState.episodesCount=Number(value);render();return;}
    if(action==='new-proj-ep-hours'){newProjState.episodeHours=Number(value);render();return;}
    if(action==='new-proj-budget'){newProjState.budgetId=value;render();return;}
    if(action==='new-proj-studio'){newProjState.assignedStudioId=value;render();return;}
    if(action==='new-proj-director'){newProjState.directorId=value;render();return;}
    if(action==='new-proj-writer'){newProjState.writerId=value;render();return;}
    if(action==='new-proj-cast-filter'){newProjCastFilter=value;render();return;}
    if(action==='new-proj-actor'){
      const isDrama = newProjState.format === 'drama';
      const isVarietyOrLive = newProjState.format === 'variety' || newProjState.format === 'live';
      const maxCast = isDrama ? 4 : isVarietyOrLive ? 3 : 2;
      if(newProjState.actorIds.includes(value)){
        newProjState.actorIds=newProjState.actorIds.filter(id=>id!==value);
      } else {
        const avail=checkPerformerAvailability(state,value);
        if(!avail.available)throw Error(avail.reason||'該藝人目前正在其他片場實景攝製中，檔期衝突！');
        const talent=state.talent[value];
        if(talent?.station&&talent.station!=='player'&&talent.station!=='free'&&Number.isInteger(talent.contractExpiresDay)&&talent.contractExpiresDay>state.day){
          const actor=ACTORS.find(a=>a.id===value);
          throw Error(`【${actor?.name}】正與${getStationName(talent.station)}簽署獨家合約中，無法參演！`);
        }
        if(newProjState.actorIds.length<maxCast){
          newProjState.actorIds.push(value);
        } else {
          throw Error(`此形態節目最多選 ${maxCast} 位演職人員。`);
        }
      }
      render();
      return;
    }
    if(action==='new-proj-suggest-title'){
      const titles=generateSuggestedTitles(newProjState.format,newProjState.genre,'',newProjState.themes);
      if(titles.length){
        newProjState.title=titles[Math.floor(Math.random()*titles.length)];
        render();
      }
      return;
    }
    if(action==='new-proj-pick-title'){newProjState.title=value;render();return;}
    if(action==='new-proj-submit'){
      const proj=createProductionProject(state,{
        ...newProjState,
        crew: { directorId: newProjState.directorId, writerId: newProjState.writerId }
      });
      newProjState={
        title: '',
        format: 'drama',
        genre: '時裝恩怨',
        themes: ['愛情'],
        targetAudience: 'family',
        episodesCount: 8,
        episodeHours: 2,
        budgetId: 'standard',
        assignedStudioId: 'studio_1',
        strategy: 'balanced',
        directorId: 'dir_lee',
        writerId: 'wri_cheung',
        actorIds: []
      };
      newProjCastFilter='all';
      studioSubTab='active';
      resetScroll=true;
      flash(`《${proj.title}》已成功立項開機！片廠現正全力投入第 1 階段前期製作。`);
      return;
    }
    if(action==='open-event-modal'){
      activeEventModal={projectId:button.dataset.projectId,episodeNumber:Number(button.dataset.episode)};
      render();
      return;
    }
    if(action==='close-event-modal'){
      activeEventModal=null;
      render();
      return;
    }
    if(action==='filming-event-choice'){
      if(activeEventModal){
        const tick = document.getElementById('filming-event-remember-tick');
        const remember = tick ? tick.checked : true;
        const res = handleFilmingEventChoice(state, activeEventModal.projectId, activeEventModal.episodeNumber, button.dataset.choiceId, Math.random, remember);
        activeEventModal = null;
        flash(`【片場決策落實】${res.choiceText}${res.cost ? `（花費 ${money(res.cost)}）` : ''}${remember ? ' · ☑️ 已記住此企劃自動依循處理' : ''}`);
      }
      return;
    }
    if(action==='reset-project-auto-choices'){
      resetProjectAutoChoices(state, button.dataset.projectId);
      flash('已清除該企劃的自動記憶決策，後續突發事件將重新向你請示。');
      render();
      return;
    }
    if(action==='open-qc-modal'){
      activeQCModal={projectId:button.dataset.projectId,episodeNumber:Number(button.dataset.episode)};
      render();
      return;
    }
    if(action==='close-qc-modal'){
      activeQCModal=null;
      render();
      return;
    }
    if(action==='qc-decision'){
      if(activeQCModal){
        const tick = document.getElementById('qc-remember-tick');
        const remember = tick ? tick.checked : true;
        const res = handleQualityControlDecision(state, activeQCModal.projectId, activeQCModal.episodeNumber, button.dataset.decisionId, Math.random, remember);
        activeQCModal = null;
        const extraNote = res.batchDeliveredCount > 0 ? `（並已為另外 ${res.batchDeliveredCount} 個待審集數自動完成驗收）` : '';
        const rememberNote = remember ? '，後續集數將自動依此策略交付，不再逐集彈窗打擾！' : '。';
        flash(`【審片驗收完成】第 ${res.episode?.episodeNumber ?? res.episodeNumber} 集以「${res.choiceLabel}」順利交付母帶入庫${rememberNote}${extraNote}`);
        render();
      }
      return;
    }
    if(action==='toggle-project-qc-strategy'){
      const project = (state.productionProjects ?? []).find(p => p.id === button.dataset.projectId);
      if(project){
        const cur = project.autoQCDecision ?? 'release_as_is';
        const next = cur === 'release_as_is' ? 'fix_errors' : cur === 'fix_errors' ? 'manual' : 'release_as_is';
        const res = setProjectQCStrategy(state, project.id, next);
        const name = next === 'release_as_is' ? '原樣直接交付 (免彈窗)' : next === 'fix_errors' ? '自動修復瑕疵' : '逐集手動詢問';
        flash(`已切換《${project.title}》審片策略為「${name}」${res.batchCount ? `，即時交付了 ${res.batchCount} 集！` : ''}`);
        render();
      }
      return;
    }
    if(action==='batch-deliver-qc'){
      const project = (state.productionProjects ?? []).find(p => p.id === button.dataset.projectId);
      if(project){
        const res = setProjectQCStrategy(state, project.id, project.autoQCDecision || 'release_as_is');
        flash(`【批量交付】《${project.title}》已將待審集數全數驗收交付入庫（共交付 ${res.batchCount} 集）！`);
        render();
      }
      return;
    }
    if(action==='upgrade-studio'){
      const s=upgradeStudioFacility(state,button.dataset.studioId);
      flash(`【片廠擴建落成】${s.name} 成功擴充至 Lv${s.level}！並行製作容量增至 ${s.capacity} 集。`);
      render();
      return;
    }
    if(action==='create-sequel'){
      const p=createSeasonOrSpinOff(state,button.dataset.projectId,button.dataset.type);
      studioSubTab='active';
      resetScroll=true;
      flash(`【經典 IP 啟動】《${p.title}》正式立項！承接原作口碑，期待值高達 ${p.episodes[0].expectations} 點。`);
      return;
    }
    if(action==='cancel-project'){
      const p=cancelProductionProject(state,button.dataset.projectId);
      flash(`【企劃腰斬】《${p.title}》已終止製作，騰出片廠與演職人員。`);
      render();
      return;
    }
    if(state.pendingPremieres?.length&&['advance-day','advance-week','advance'].includes(action))throw Error('先處理首播戰報，然後再繼續營運。');
    if(action==='premiere-choice'){const result=resolvePremiere(state,value);flash(`《${result.title}》首播決策完成，後續集數會受影響。`);return;}
    if(action==='tab'){tab=button.dataset.tab;editorOpen=false;resetScroll=true;notice='';render();}
    if(action==='broadcast-day'){selectedBroadcastDay=Number(button.dataset.day);render();}
    if(action==='kind'){selected.kind=value;const format=CONTENT_TYPES.find(item=>item.id===value);if(format.topics&&!format.topics.includes(selected.topic))selected.topic=format.topics[0];render();}
    if(action==='genre'){selected.genre=value;render();}
    if(action==='theme'){if(selected.themes.includes(value)){if(selected.themes.length>1)selected.themes=selected.themes.filter(t=>t!==value)}else if(selected.themes.length<2)selected.themes.push(value);else selected.themes=[selected.themes[1],value];render();}
    if(action==='topic'){selected.topic=value;render();}
    if(action==='actor'){
      if(selected.actorIds.includes(value)){
        selected.actorIds=selected.actorIds.filter(id=>id!==value);
      } else {
        const talent=state.talent[value];
        if(talent?.station&&talent.station!=='player'&&talent.station!=='free'&&Number.isInteger(talent.contractExpiresDay)&&talent.contractExpiresDay>state.day){
          const actor=ACTORS.find(a=>a.id===value);
          throw Error(`【${actor?.name}】正與${getStationName(talent.station)}簽署獨家合約中，無法參演！`);
        }
        if(selected.actorIds.length<4)selected.actorIds.push(value);
        else throw Error('一套劇最多 4 位主演。');
      }
      render();
    }
    if(action==='actor-filter'){actorFilter=value;render();}
    if(action==='actor-toggle'){actorPickerOpen=!actorPickerOpen;render();}
    if(action==='sign-artist'){const t=signArtist(state,button.dataset.actorId);const actor=ACTORS.find(a=>a.id===button.dataset.actorId);flash(`成功與【${actor?.name}】簽下 1 年合約（至第 ${t.contractExpiresDay} 日）！`);return;}
    if(action==='renew-artist'){const t=renewArtistContract(state,button.dataset.actorId);const actor=ACTORS.find(a=>a.id===button.dataset.actorId);flash(`成功與【${actor?.name}】續約 1 年（至第 ${t.contractExpiresDay} 日）！`);return;}
    if(action==='buy-tool'){const t=buyShopTool(state,button.dataset.toolId);flash(`成功購入／續租「${t.name}」，有效至第 ${t.expiresDay} 日！`);return;}
    if(action==='budget'){selected.budgetId=value;render();}
    if(action==='episode-hours'){selected.episodeHours=Number(value);render();}
    if(action==='episode-count'){selected.episodeCount=Number(value);render();}
    if(action==='style'){selected.styleId=value;render();}
    if(action==='hook'){selected.hookId=value;render();}
    if(action==='pick-title'){selected.customTitle=value;render();return;}
    if(action==='produce'){const p=produce(state,selected);selected.actorIds=[];selected.customTitle='';actorPickerOpen=false;actorSearch='';resetProgramPicker();editor={start:p.kind==='night'?22:p.kind==='children'?16:20,duration:p.episodeHours,programId:p.id,days:initialDays(p),recurrence:initialRecurrence(p),allowRepeat:false};tab='schedule';editorOpen=true;resetScroll=true;flash(`《${p.title}》拍好咗，揀時段播出。`);}
    if(action==='sell'||action==='sell-exclusive'){const deal=sellProduction(state,button.dataset.id,button.dataset.rival,action==='sell-exclusive');flash(`《${deal.title}》${deal.exclusive?'獨家賣斷':'聯播授權'}成交，進帳 ${preciseMoney(deal.amount)}。`);}
    if(action==='reply-letter'){const letter=replyToLetter(state,button.dataset.id);flash(letter.type==='request'?'已接納節目點播，去製作頁拍攝。':letter.type==='gift'?'已收下道具，下一套節目品質提升。':'已回覆觀眾意見，口碑提升。');}
    if(action==='reply-letter-choice'){const letter=replyToLetter(state,button.dataset.id,button.dataset.choice);flash(`已處理觀眾特殊互動：${letter.resolvedChoiceLabel||'已落實決策'}`);}
    if(action==='reject-letter'){rejectLetter(state,button.dataset.id);flash('已婉拒／忽略該封觀眾來信。');}
    if(action==='dismiss-letter'){dismissLetter(state,button.dataset.id);flash('已移除來信紀錄。');}
    if(action==='clear-resolved-letters'){state.mailbox=(state.mailbox??[]).filter(l=>!l.resolved);flash('已清理所有已處理信件。');}
    if(action==='fan-meeting'){holdFanMeeting(state);flash('全港粉絲見面會圓滿成功！熱度與口碑雙收。');}
    if(action==='poll-audience'){const poll=launchAudiencePoll(state);flash(`公投揭曉！觀眾最敲碗「${poll.topic}」，開拍將獲首播加成！`);}
    if(action==='dismiss-month-result'){dismissMonthResult(state);render();return;}
    if(action==='dismiss-ceremony'){dismissCeremony(state);render();return;}
    if(action==='leaderboard-month'){selectedLeaderboardMonth=Number(button.dataset.month);render();return;}
    if(action==='schedule-new'){const p=state.library.find(item=>item.id===button.dataset.id);resetProgramPicker();editor={start:p?.kind==='night'?22:p?.kind==='children'?16:20,duration:p?.episodeHours??2,programId:button.dataset.id,days:initialDays(p),recurrence:initialRecurrence(p),allowRepeat:false};tab='schedule';editorOpen=true;resetScroll=true;render();}
    if(action==='dismiss-alert'){dismissedAlerts[button.dataset.alert]=true;render();return;}
    if(action==='toggle-completed-expand'){expandedCompleted=!expandedCompleted;render();return;}
    if(action==='catalog-subtab'){catalogSubTab=value;resetScroll=true;render();return;}
    if(action==='open-replay-tab'){tab='catalog';catalogSubTab='replay';resetScroll=true;render();return;}
    if(action==='open-renew-tab'){tab='catalog';catalogSubTab='renew';resetScroll=true;render();return;}
    if(action==='replay-filter'){replayFilter=value;render();return;}
    if(action==='schedule-day'){scheduleDay=Number(button.dataset.day);render();}
    if(action==='schedule-period'){schedulePeriod=value;render();}
    if(action==='editor-program-group'){editorProgramGroup=value;render();return;}
    if(action==='editor-program-card'){
      editor.programId=button.dataset.id;
      if (editor.programId.startsWith('event:')) {
        const ev=(state.events??[]).find(e=>`event:${e.id}`===editor.programId);
        const cfg=getSportsConfig(ev);
        const primarySlot=cfg?.defaultSlots?.[0];
        editor.start=primarySlot?.start??18;
        editor.duration=primarySlot?.duration??6;
        editor.days=primarySlot?.days?[...primarySlot.days]:[...EVERY_DAY];
        editor.recurrence=editor.days.length===2&&editor.days[0]===5?'weekend':editor.days.length===2&&editor.days[0]===1?'midweek':editor.days.length===7?'daily':'weekly';
      } else {
        const p=state.library.find(item=>item.id===editor.programId);
        editor.duration=p?.episodeHours??Math.min(editor.duration,4);
        editor.recurrence=initialRecurrence(p);
        editor.days=initialDays(p);
      }
      editor.allowRepeat=false;
      render();
    }
    if(action==='go-sports'){tab='sports';resetScroll=true;render();return;}
    if(action==='go-schedule'){tab='schedule';resetScroll=true;render();return;}
    if(action==='sports-buyout'){
      const ev=buyoutSportsEvent(state,button.dataset.event);
      flash(`成功買斷《${ev.name}》全季轉播權！已自動預排直播時段。`);
      tab='schedule';resetScroll=true;render();return;
    }
    if(action==='sports-reveal-now'){
      const ev=revealAuctionNow(state,button.dataset.event,Math.random);
      if(ev.winner==='你的電視台'){
        flash(`恭喜中標《${ev.name}》！已自動預排直播時段。`);
        tab='schedule';resetScroll=true;render();
      }else{
        flash(`很遺憾，《${ev.name}》由 ${ev.winner} 得標，保證金已全額退回。`);
        render();
      }
      return;
    }
    if(action==='apply-sports-slot'){
      editor.start=Number(button.dataset.start);
      editor.duration=Number(button.dataset.duration);
      editor.days=button.dataset.days.split(',').map(Number);
      editor.recurrence=editor.days.length===2&&editor.days[0]===5?'weekend':editor.days.length===2&&editor.days[0]===1?'midweek':editor.days.length===7?'daily':'weekly';
      editor.allowRepeat=false;
      render();
    }
    if(action==='recurrence'){editor.recurrence=value;editor.days=(value==='once'||value==='weekly')?[scheduleDay??weekdayForDay(state.day)]:value==='weekday'?[0,1,2,3,4]:value==='weekend'?[5,6]:value==='midweek'?[1,2]:[...EVERY_DAY];editor.allowRepeat=false;render();}
    if(action==='catalog-filter'){catalogFilter=value;if(!['all','series','variety'].includes(value))catalogNetwork='all';resetScroll=true;render();}
    if(action==='catalog-network'){catalogNetwork=value;catalogFilter='all';catalogYear='all';resetScroll=true;render();}
    if(action==='catalog-available'){catalogAvailableOnly=!catalogAvailableOnly;resetScroll=true;render();}
    if(action==='report-filter'){reportFilter=value;render();}
    if(action==='license-term'){licenseDays=Number(value);render();}
    if(action==='buy'){const p=buyProgram(state,button.dataset.id,licenseDays);resetProgramPicker();editor={start:p.category==='香港電影'?21:20,duration:p.episodeHours??2,programId:p.id,days:initialDays(p),recurrence:initialRecurrence(p),allowRepeat:false};tab='schedule';editorOpen=true;resetScroll=true;flash(`已購入${licenseDays===180?'6 個月':'1 年'}播映權，可喺有效期內重播。`);}
    if(action==='renew'){const p=renewLicense(state,button.dataset.id,licenseDays);flash(`《${p.title}》已續購；如本輪已播完，請先揀「重播一輪」。`);}
    if(action==='start-replay'){const p=startCatalogReplay(state,button.dataset.id);resetProgramPicker();editor={start:p.category==='香港電影'?21:19,duration:p.episodeHours??2,programId:p.id,days:initialDays(p),recurrence:initialRecurrence(p),allowRepeat:false};tab='schedule';editorOpen=true;resetScroll=true;flash(`《${p.title}》重播已準備好，請你自行揀時段。`);}
    if(action==='open-editor'){resetProgramPicker();editorOpen=true;render();}
    if(action==='close-editor'){editorOpen=false;render();}
    if(action==='select-hour'){const hour=Number(button.dataset.hour),day=state.day+((scheduleDay??weekdayForDay(state.day))-weekdayForDay(state.day)+7)%7,block=programAtHour(state,hour,day);resetProgramPicker();if(block){editor={start:block.start,duration:block.duration,programId:block.programId,days:[...daysForBlock(block)],recurrence:block.once?'once':(daysForBlock(block).length===7?'daily':daysForBlock(block).length===5?'weekday':daysForBlock(block).length===2?'weekend':'weekly'),allowRepeat:false};}else{const curProg=state.library.find(p=>p.id===editor.programId);editor={start:hour,duration:curProg?.episodeHours??1,programId:editor.programId,days:[scheduleDay??weekdayForDay(state.day)],recurrence:initialRecurrence(curProg),allowRepeat:false};}editorOpen=true;render();}
    if(action==='place'){const removed=scheduleProgram(state,editor.start,editor.programId,editor.duration,{days:editor.days,allowRepeat:editor.allowRepeat,once:editor.recurrence==='once'});editorOpen=false;flash(`已安排 ${editor.recurrence==='once'?'單次播映 ':''}${dayPattern(editor.days)} ${timeRange(editor.start,editor.duration)}${removed.length?`，替換 ${removed.length} 個原有時段`:''}。`);}
    if(action==='remove'){const day=scheduleDay??weekdayForDay(state.day),block=programAtHour(state,editor.start,state.day+(day-weekdayForDay(state.day)+7)%7);if(!block)throw Error('所選時間冇節目。');removeScheduledProgram(state,block.start,{weekday:day});editorOpen=false;flash(`已移除${WEEKDAYS[day]}呢個時段。`);}
    if(action==='advance-day'){dismissedAlerts={completed:false,replay:false,expired:false};expandedCompleted=false;const result=advanceDay(state);scheduleDay=null;selectedBroadcastDay=null;tab='reports';resetScroll=true;runSummary={days:1,net:result.net,wins:result.wins,completed:result.completed,expired:result.expired};render();}
    if(action==='advance-week'){dismissedAlerts={completed:false,replay:false,expired:false};expandedCompleted=false;let net=0,wins=0,days=0,completed=[],expired=[],marketRefresh=false;for(let i=0;i<7;i++){const result=advanceDay(state);net+=result.net;wins+=result.wins;days++;completed=result.completed;expired=result.expired;marketRefresh=result.marketRefresh;if(completed.length||expired.length||marketRefresh||state.pendingPremieres?.length)break;}scheduleDay=null;selectedBroadcastDay=null;tab='reports';resetScroll=true;runSummary={days,net,wins,completed,expired};if(marketRefresh)flash('外購市場已經換月，新片單上架。');else render();}
    if(action==='advance'){dismissedAlerts={completed:false,replay:false,expired:false};expandedCompleted=false;const result=advanceQuarter(state);runSummary=result.completed.length||result.expired.length?{days:1,net:result.net,wins:result.wins,completed:result.completed,expired:result.expired}:null;tab=result.marketRefresh?'catalog':result.completed.length||result.expired.length?'schedule':'reports';scheduleDay=null;selectedBroadcastDay=null;resetScroll=true;if(result.marketRefresh)flash('外購市場已經換月，新片單上架。');else render();}
    if(action==='open-transfer'){showTransfer=true;render();return;}
    if(action==='close-transfer'){showTransfer=false;render();return;}
    if(action==='copy-save'){
      const text=document.getElementById('export-save-box')?.value||localStorage.getItem(SAVE_KEY);
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(()=>{flash('存檔代碼已複製到剪貼簿！');}).catch(()=>{
          document.getElementById('export-save-box')?.select();
          flash('請手動複製選取的存檔代碼。');
        });
      } else {
        document.getElementById('export-save-box')?.select();
        flash('請手動複製選取的存檔代碼。');
      }
      return;
    }
    if(action==='confirm-import'){
      const raw=document.getElementById('import-save-box')?.value?.trim();
      if(!raw)throw Error('請先貼上存檔代碼。');
      let val;
      try{val=JSON.parse(raw);}catch{throw Error('存檔代碼不是合法的 JSON 格式。');}
      if(!val||!Number.isInteger(val.day)||val.day<=0||!Number.isFinite(val.cash)||!Array.isArray(val.schedule)||!Array.isArray(val.library)){
        throw Error('存檔格式不符合遊戲標準，無法載入。');
      }
      migrateLegacyLicenses(val);
      clearCompletedPrograms(val);
      state=val;
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      showTransfer=false;
      resetScroll=true;
      flash(`成功匯入存檔！目前為第 ${state.day} 日，資金 ${money(state.cash)}。`);
      return;
    }
    if(action==='reset-prompt'){showReset=true;render();}
    if(action==='reset-cancel'){showReset=false;render();}
    if(action==='reset-confirm'){
      state=newGame();
      selected={kind:'drama',genre:'青春',themes:['友情'],actorIds:['edaan','anson_lo'],topic:'遊戲競賽',budgetId:'standard',episodeHours:2,episodeCount:8,styleId:'mainstream',hookId:'none',customTitle:''};
      editor={start:19,duration:2,programId:'start-sitcom',days:[...EVERY_DAY],allowRepeat:false};
      resetProgramPicker();
      scheduleDay=null;
      catalogFilter='all';
      catalogSort='featured';
      catalogAvailableOnly=false;
      catalogNetwork='ViuTV';
      catalogYear='all';
      catalogQuery='';
      licenseDays=180;
      reportFilter='all';
      actorFilter='viu';
      actorPickerOpen=false;
      actorSearch='';
      tab='schedule';
      editorOpen=false;
      runSummary=null;
      selectedBroadcastDay=null;
      selectedLeaderboardMonth=null;
      resetScroll=true;
      showReset=false;
      notice='';
      studioSubTab='active';
      activeEventModal=null;
      activeQCModal=null;
      newProjCastFilter='all';
      crewFormatFilter='all';
      newProjState={
        title: '',
        format: 'drama',
        genre: '時裝恩怨',
        themes: ['愛情'],
        targetAudience: 'family',
        episodesCount: 8,
        episodeHours: 2,
        budgetId: 'standard',
        assignedStudioId: 'studio_1',
        strategy: 'balanced',
        directorId: 'dir_lee',
        writerId: 'wri_cheung',
        actorIds: []
      };
      render();
    }
  }catch(error){flash(error.message)}
});
app.addEventListener('input',e=>{
  if(e.target.dataset.action==='new-proj-title-input'){newProjState.title=e.target.value;}
  if(e.target.dataset.action==='custom-title'){selected.customTitle=e.target.value;}
  if(e.target.dataset.action==='actor-search'){actorSearch=e.target.value;app.querySelectorAll('.actor-grid .actor').forEach(button=>{button.hidden=!button.textContent.includes(actorSearch.trim())});}
  if(e.target.dataset.action==='editor-program-search'&&!e.isComposing){const pos=e.target.selectionStart;editorProgramSearch=e.target.value;render();const input=app.querySelector('[data-action="editor-program-search"]');input?.focus({preventScroll:true});input?.setSelectionRange(pos,pos);}
  if(e.target.dataset.action==='catalog-search'&&!e.isComposing){const pos=e.target.selectionStart;catalogQuery=e.target.value;render();const input=app.querySelector('[data-action="catalog-search"]');input?.focus({preventScroll:true});input?.setSelectionRange(pos,pos);}
});
app.addEventListener('compositionend',e=>{if(e.target.dataset.action==='editor-program-search'){editorProgramSearch=e.target.value;render();app.querySelector('[data-action="editor-program-search"]')?.focus({preventScroll:true});}if(e.target.dataset.action==='catalog-search'){catalogQuery=e.target.value;render();app.querySelector('[data-action="catalog-search"]')?.focus({preventScroll:true});}});
app.addEventListener('change',e=>{const action=e.target.dataset.action;if(action==='catalog-sort'){catalogSort=e.target.value;resetScroll=true;render()}if(action==='catalog-year'){catalogYear=e.target.value;resetScroll=true;render()}if(action==='editor-start'){editor.start=Number(e.target.value);editor.allowRepeat=false;render()}if(action==='editor-duration'){editor.duration=Number(e.target.value);render()}if(action==='editor-program'){editor.programId=e.target.value;const p=state.library.find(p=>p.id===editor.programId);editor.duration=p?.episodeHours??Math.min(editor.duration,editor.programId.startsWith('event:')?24:4);editor.days=initialDays(p);editor.recurrence=initialRecurrence(p);editor.allowRepeat=false;render()}if(action==='editor-weekday'){editor.days=[Number(e.target.value)];render()}if(action==='editor-repeat'){editor.allowRepeat=e.target.checked;render()}});
app.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&activeEventModal){e.preventDefault();activeEventModal=null;render();return;}
  if(e.key==='Escape'&&activeQCModal){e.preventDefault();activeQCModal=null;render();return;}
  if(e.key==='Escape'&&editorOpen){e.preventDefault();editorOpen=false;render();app.querySelector('[data-action="open-editor"]')?.focus({preventScroll:true});}
  if(e.key==='Tab'&&editorOpen){
    const controls=[...app.querySelectorAll('.schedule-editor.open button:not(:disabled),.schedule-editor.open select:not(:disabled)')];
    if(!controls.length)return;
    const first=controls[0],last=controls.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
app.addEventListener('submit',e=>{if(e.target.matches('.bid-form, #bid-form')){e.preventDefault();try{const eventId=e.target.dataset.event||null;const amount=Math.round(Number(new FormData(e.target).get('amount')??e.target.querySelector('input').value)*1_000_000);submitBid(state,amount,eventId);flash('暗標已封好，等開標日。')}catch(error){flash(error.message)}}});
render();

