import { ACTORS, BUDGETS, GENRES, THEMES, CONTENT_TYPES, DAYS_PER_QUARTER, DAYS_PER_MARKET_MONTH, EPISODE_COUNTS, PRODUCTION_STYLES, PRODUCTION_HOOKS, ACQUISITION_GROUPS, WEEKDAYS, EVERY_DAY, LICENSE_TERMS, VIU_ORIGINALS, money, preciseMoney, quarterLabel, hourLabel, compatibility, exactKey, catalogForMonth, marketMonthForDay, rivalPremiere, currentEvent, activeBiddingEvents, isSportsActive, getActiveSportsEvents, buyoutSportsEvent, revealAuctionNow, programAtHour, episodeForBlock, broadcastNow, advanceBroadcastClock, rivalAtHour, productionQuote, distributionQuote, sellProduction, replyToLetter, rejectLetter, dismissLetter, holdFanMeeting, launchAudiencePoll, hoursInBlock, isDailyFormat, isOneOffEvent, clearCompletedPrograms, migrateLegacyLicenses, licensePrice, licenseExpired, isCatalogCycleComplete, catalogCycleProgress, catalogCompletedAirings, startCatalogReplay, startProgramReplay, canReplayProgram, freshnessLabel, getFreshnessFactor, isUnavailable, duplicateBooking, daysForBlock, runsOnWeekday, weekdayForDay, premiereProfile, resolvePremiere, newGame, produce, buyProgram, renewLicense, scheduleProgram, removeScheduledProgram, submitBid, advanceDay, advanceQuarter, BREAKING_EVENTS_POOL, getBreakingRatingMod, evaluateMonthlyRatings, evaluateAnnualAwards, dismissCeremony, dismissMonthResult, generateSuggestedTitles, getSportsConfig } from './engine.js';

const SAVE_KEY='tv-dream-studio-v1';
function loadGame(){
  try {
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw){
      const value=JSON.parse(raw);
      if(value&&Number.isInteger(value.day)&&value.day>0&&Number.isInteger(value.quarter)&&value.quarter>=0&&Number.isFinite(value.cash)&&Array.isArray(value.schedule)&&Array.isArray(value.library)&&Array.isArray(value.rivals)&&value.talent&&typeof value.talent==='object'&&Array.isArray(value.events)&&Array.isArray(value.log)&&Array.isArray(value.history)&&Array.isArray(value.achievements)&&Array.isArray(value.sponsors)&&value.cooldowns&&value.quarterLedger&&Number.isInteger(value.productionCount)){migrateLegacyLicenses(value);clearCompletedPrograms(value);return value;}
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
const app=document.getElementById('app');
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hourlyMoney=n=>{const amount=Math.abs(n),sign=n<0?'−':'';return amount>=1_000_000?`${sign}${money(amount)}`:amount>=1_000?`${sign}$${(amount/1_000).toFixed(amount<10_000?1:0)}k`:`${sign}$${Math.round(amount).toLocaleString()}`};
const catalogPrice=n=>n>=1_000_000?`$${(n/1_000_000).toFixed(2)}m`:`$${Math.round(n/1_000)}k`;
const icon={schedule:'▦',studio:'◈',rivals:'♟',catalog:'▤',sports:'◆',reports:'▥'};
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
        ${[['schedule','排播'],['studio','製作'],['catalog','片庫'],['rivals','對手'],['sports','體育'],['reports','戰報']].map(([id,label])=>`<button data-action="tab" data-tab="${id}" class="tab ${tab===id?'active':''}" ${tab===id?'aria-current="page"':''}><span aria-hidden="true">${icon[id]}</span>${label}</button>`).join('')}
      </nav>
      <main>
        ${tab==='schedule'?scheduleHome():tab==='studio'?studioView():tab==='rivals'?rivalsView():tab==='catalog'?catalogView():tab==='sports'?sportsView():reportsView()}
      </main>
      <footer>電視夢工場：新世代 <span>進度自動保存在此瀏覽器</span></footer>
      ${notice?`<div class="toast" role="status">${safe(notice)}</div>`:''}
      ${premiereView()}
      ${monthResultModalView()}
      ${ceremonyModalView()}
      ${showReset?`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">重新開局？</h2><p>目前電視台嘅進度會清除。</p><div class="modal-actions"><button class="soft-button" data-action="reset-cancel">取消</button><button class="danger-button" data-action="reset-confirm">重新開局</button></div></div></div>`:''}
      ${showTransfer?transferModalView():''}
    </div>`;
  app.querySelector('main').scrollTop=scroll;
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

function studioView() {
  const isDrama=selected.kind==='drama';
  const dailyFormat=isDailyFormat(selected.kind);
  const oneOff=isOneOffEvent(selected.kind);
  const format=CONTENT_TYPES.find(item=>item.id===selected.kind);
  const tier=isDrama?compatibility(selected.genre,selected.themes):'o';
  const cooldown=(state.cooldowns[exactKey(selected.genre,selected.themes)]??-1)>=state.quarter;
  const quote=productionQuote(state,selected);
  const cast=ACTORS.filter(actor=>selected.actorIds.includes(actor.id));
  const availableActors=ACTORS.filter(actor=>(actorFilter==='all'||actor.source===actorFilter)&&actor.name.includes(actorSearch.trim()));
  const cost=quote.total;
  const ready=!isDrama||cast.length>=2;
  const suggestedTitles=generateSuggestedTitles(selected.kind,selected.genre,selected.topic,selected.themes);
  return `<div class="game-grid production-layout">
    <section class="panel studio-panel">
      <div class="panel-heading"><div><div class="eyebrow gold">PRODUCTION DESK</div><h1>節目製作</h1></div><span class="quota">今季已製作 ${state.productionCount} 套 · 資金足夠即可繼續</span></div>
      <div class="field"><div class="field-label"><span>01 / 節目類型</span></div><div class="format-grid">${CONTENT_TYPES.filter(item=>!isOneOffEvent(item.id)).map(item=>`<button class="choice ${selected.kind===item.id?'chosen':''}" data-action="kind" data-value="${item.id}" aria-pressed="${selected.kind===item.id}">${item.label}</button>`).join('')}</div><div class="event-format-title">★ 自製大型活動 <small>一晚限定 · 燒錢換收視、熱度或口碑</small></div><div class="format-grid event-format-grid">${CONTENT_TYPES.filter(item=>isOneOffEvent(item.id)).map(item=>`<button class="choice event-choice ${selected.kind===item.id?'chosen':''}" data-action="kind" data-value="${item.id}" aria-pressed="${selected.kind===item.id}">${item.label}</button>`).join('')}</div></div>
      <div class="field"><div class="field-label"><span>節目片名</span><small>可自行輸入或挑選以下靈感</small></div><input class="custom-title-input" data-action="custom-title" type="text" placeholder="自訂片名（如留空將自動生成）" value="${safe(selected.customTitle||'')}" maxlength="24" /><div class="title-suggestions-chips" role="group" aria-label="片名建議">${suggestedTitles.map(t=>`<button class="title-chip ${selected.customTitle===t?'chosen':''}" data-action="pick-title" data-value="${safe(t)}" type="button">${safe(t)}</button>`).join('')}</div></div>
      ${isDrama?`
        <div class="field"><div class="field-label"><span>02 / 劇種</span></div><div class="choice-grid">${GENRES.map(g=>`<button class="choice ${selected.genre===g?'chosen':''}" data-action="genre" data-value="${g}" aria-pressed="${selected.genre===g}">${g}</button>`).join('')}</div></div>
        <div class="field"><div class="field-label"><span>03 / 題材</span><small>選 1 至 2 個</small></div><div class="choice-grid">${THEMES.map(t=>`<button class="choice ${selected.themes.includes(t)?'chosen':''}" data-action="theme" data-value="${t}" aria-pressed="${selected.themes.includes(t)}">${t}</button>`).join('')}</div></div>
        <div class="field"><div class="field-label"><span>04 / 主演</span><small>已選 ${cast.length} / 4 位，最少 2 位</small></div><div class="cast-summary">已選：${cast.length?cast.map(a=>safe(a.name)).join('、'):'未揀主演'}</div><button class="actor-toggle" data-action="actor-toggle" aria-expanded="${actorPickerOpen}">${actorPickerOpen?'收起演員名單':'選擇／更換主演'} <span>${ACTORS.length} 位 ▾</span></button>${actorPickerOpen?`<div class="actor-picker"><p class="actor-note">分類按參演劇集；能力同片酬均屬遊戲設定。</p><div class="actor-filters" aria-label="篩選演員">${[['viu','ViuTV 劇集'],['all','全部'],['tvb','TVB 劇集']].map(([id,label])=>`<button data-action="actor-filter" data-value="${id}" class="${actorFilter===id?'active':''}" aria-pressed="${actorFilter===id}">${label} <span>${id==='all'?ACTORS.length:ACTORS.filter(a=>a.source===id).length}</span></button>`).join('')}</div><input class="actor-search" data-action="actor-search" type="search" placeholder="搜尋演員姓名" aria-label="搜尋演員姓名" value="${safe(actorSearch)}" /><div class="actor-grid">${availableActors.map(a=>`<button class="actor ${selected.actorIds.includes(a.id)?'chosen':''}" data-action="actor" data-value="${a.id}" aria-pressed="${selected.actorIds.includes(a.id)}"><span class="avatar">${a.name.slice(0,1)}</span><span><strong>${a.name}</strong><small>${a.specialty} · 知名度 ${state.talent[a.id].fame.toFixed(1)} · 能力 ${a.skill}</small></span><b>${preciseMoney(state.talent[a.id].fee)}</b></button>`).join('')}</div></div>`:''}</div>
      `:`<div class="field"><div class="field-label"><span>02 / 內容方向</span></div><div class="topic-grid">${format.topics.map(topic=>`<button class="choice ${selected.topic===topic?'chosen':''}" data-action="topic" data-value="${topic}" aria-pressed="${selected.topic===topic}">${topic}</button>`).join('')}</div><p class="actor-note">${selected.kind==='night'?'深夜節目喺 22:00–02:00 有收視加成；日間播映會明顯失利。':selected.kind==='children'?'兒童節目喺放學時段（16:00–18:00）及週末早晨特別受歡迎；深夜時段收視低迷。':oneOff?'大型活動只播一晚，黃金檔尤其週末有收視優勢；播後會影響台口碑或熱度。':`${format.label}節目由製作團隊完成，毋須揀劇集主演。`}</p></div>`}
      <div class="field"><div class="field-label"><span>${isDrama?'05':'03'} / ${oneOff?'活動':'每集'}基礎預算</span><small>時長與方向會改變實際成本</small></div><div class="budget-grid">${BUDGETS.map(b=>`<button class="budget ${selected.budgetId===b.id?'chosen':''}" data-action="budget" data-value="${b.id}" aria-pressed="${selected.budgetId===b.id}"><strong>${b.label}</strong><small>${preciseMoney(Math.round(b.cost*(isDrama?1:format.factor)/1_000)*1_000)}</small></button>`).join('')}</div></div>
      <div class="field"><div class="field-label"><span>${isDrama?'06':'04'} / ${oneOff?'直播':'每集'}時長</span><small>拍完後排播長度固定</small></div><div class="production-choices">${[1,2,3,4].map(hours=>`<button class="choice ${selected.episodeHours===hours?'chosen':''}" data-action="episode-hours" data-value="${hours}" aria-pressed="${selected.episodeHours===hours}">${hours} 小時</button>`).join('')}</div></div>
      ${dailyFormat?`<p class="actor-note">${format.label}每日製作新一期，毋須設定總集數；首期預算即時支付，其後每播一期再支付一集成本。</p>`:oneOff?`<p class="event-note">一晚限定，只製作一次。首播後即落畫；慈善籌款不計入電視台現金。</p>`:`<div class="field"><div class="field-label"><span>${isDrama?'07':'05'} / 總集數</span><small>集數越多，總投資越大</small></div><div class="production-choices">${EPISODE_COUNTS.map(episodes=>`<button class="choice ${selected.episodeCount===episodes?'chosen':''}" data-action="episode-count" data-value="${episodes}" aria-pressed="${selected.episodeCount===episodes}">${episodes} 集</button>`).join('')}</div></div>`}
      <div class="field"><div class="field-label"><span>${isDrama?'08':dailyFormat?'05':'06'} / 拍攝方向</span></div><div class="style-grid">${PRODUCTION_STYLES.map(style=>`<button class="style-choice ${selected.styleId===style.id?'chosen':''}" data-action="style" data-value="${style.id}" aria-pressed="${selected.styleId===style.id}"><strong>${style.label}</strong><small>${style.description}</small></button>`).join('')}</div></div>
      <div class="field"><div class="field-label"><span>企劃橋段</span><small>加錢換不同效果；大膽特技可能出事</small></div><div class="hook-grid">${PRODUCTION_HOOKS.map(hook=>`<button class="style-choice ${selected.hookId===hook.id?'chosen':''}" data-action="hook" data-value="${hook.id}" aria-pressed="${selected.hookId===hook.id}"><strong>${hook.label}</strong><small>${hook.description}</small></button>`).join('')}</div></div>
      ${state.audienceBrief?`<p class="audience-brief">觀眾委託：拍一套「${safe(state.audienceBrief)}」內容，預測收視 +6、話題 +8。</p>`:''}
      <div class="production-quote"><span>${oneOff?'一晚直播':`每集 ${preciseMoney(quote.perEpisode)} × ${dailyFormat?'首期':`${quote.episodes} 集`}`}${oneOff?` · 基礎 ${preciseMoney(quote.perEpisode)}`:''}</span><span>${isDrama?`主演簽約 ${money(quote.fees)}`:'製作團隊負責'}</span><strong>${dailyFormat?'首期投入':'總投資'} ${preciseMoney(cost)}</strong></div>
      <div class="decision ${isDrama&&tier==='x'?'risk':''}"><div><span class="tier-symbol">${isDrama?(tier==='double-o'?'◎':tier==='o'?'○':'×'):oneOff?'★':'◈'}</span><div><strong>${isDrama?(tier==='double-o'?'完美相性':tier==='o'?'良好相性':'危險錯配'):`${format.label} · ${selected.topic}`}</strong><small>${isDrama?(tier==='double-o'?'品質加成 30%，口碑最低 75':tier==='o'?'品質加成 10%':`90% 暴死 · 10% Cult 劇逆襲${cooldown?' · 冷卻中，成功率 1%':''}`):oneOff?'單晚高投入，黃金檔同週末較有利':'新節目可安排到每日節目表'} · ${quote.style.label}</small></div></div><span>${selected.episodeHours} 小時${oneOff?'直播':'／集'}</span></div>
      <button class="primary-button" data-action="produce" ${state.cash<cost||!ready?'disabled':''}>${!ready?'最少揀 2 位主演':state.cash<cost?'資金不足':`製作${format.label}節目`} <span>↗</span></button>
      ${state.lastProduction?productionResult():''}
    </section>
    <aside class="side-stack"><section class="panel feed-panel"><div class="panel-heading small"><div><div class="eyebrow muted">NEWSROOM</div><h2>電視台快訊</h2></div></div>${state.log.slice(0,3).map(l=>`<div class="news"><span class="news-dot ${l.type}"></span><div><small>${quarterLabel(l.quarter)}</small><p>${safe(l.text)}</p></div></div>`).join('')}</section>${distributionView()}</aside>
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

  return `<div class="schedule-home">
    ${result?`<div class="day-result-strip" role="status"><span>最近 ${result.days} 日營運</span><strong class="${result.net<0?'danger':''}">${result.net>=0?'+':''}${money(result.net)}</strong><span>對台勝出 ${result.wins} / ${24*result.days} 小時</span><button data-action="tab" data-tab="reports">逐套節目成績 →</button></div>`:''}
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
    ${scheduleView()}
  </div>`;
}

function broadcastResultsView(){
  const reports=state.broadcastReports?.length?state.broadcastReports:state.lastDayResult?[{day:state.lastDayResult.day,details:state.lastDayResult.details??[]}]:[];
  if(!reports.length)return '';
  const report=reports.find(item=>item.day===selectedBroadcastDay)??reports[0];
  const entries=[...report.details].sort((a,b)=>a.start-b.start);
  const charity=entries.filter(item=>item.kind==='charity').length;
  return `<section class="panel broadcast-results" aria-label="逐套節目播映成績"><div class="section-heading"><div><div class="eyebrow gold">ON AIR RESULTS</div><h2>逐套節目成績戰報</h2></div><span class="report-meta-tag">第 ${report.day} 日 · ${entries.length} 個播映時段</span></div><p class="broadcast-results-help">即時播映成效報告：收視指數（0–100）與同時段最強對手比拼，廣告收入即日入帳。</p><div class="broadcast-days" aria-label="選擇播映日">${reports.map(item=>`<button data-action="broadcast-day" data-day="${item.day}" class="${item.day===report.day?'active':''}" aria-pressed="${item.day===report.day}">第 ${item.day} 日</button>`).join('')}</div>${charity?`<p class="charity-summary">累計慈善籌款 ${hourlyMoney(state.charityRaised??0)} · 款項不屬電視台資金</p>`:''}<div class="broadcast-result-grid">${entries.length?entries.map(item=>{const rival=Number.isFinite(item.rivalRating)?item.rivalRating:state.lastDayResult?.day===report.day?Math.max(...(state.lastDayResult.hours??[]).filter(hour=>hour&&hour.title===item.title&&hour.hour>=item.start&&hour.hour<item.start+item.duration).flatMap(hour=>hour.rivals??[0])):null;const won=Number.isFinite(rival)?item.rating>rival:null;const diff=Number.isFinite(rival)?item.rating-rival:0;const diffText=diff>0?`+${diff}`:`${diff}`;const totalRatings=Math.max(1,(item.rating+(rival||0)));const ourShare=Math.min(95,Math.max(5,Math.round((item.rating/totalRatings)*100)));return `<article class="broadcast-result-card ${won===true?'won':won===false?'lost':''}"><div class="broadcast-result-top"><span class="broadcast-time-tag">${hourLabel(item.start)}–${hourLabel(item.start+item.duration)}</span>${item.freshness!==undefined?(()=>{const f=freshnessLabel(item.freshness,item.maxFreshness);return `<span class="freshness-result-pill ${f.tier}" title="新鮮度 ${f.percent}% (上限 ${f.max}%) · ${f.desc}">${f.icon} ${f.percent}%</span>`;})():''}${item.eventMod?`<span class="event-mod-tag ${item.eventMod>0?'boost':'debuff'}">${item.eventMod>0?`▲ 突發 +${item.eventMod}`:`▼ 突發 ${item.eventMod}`}</span>`:''}<b class="battle-badge ${won===true?'won':won===false?'lost':''}">${won===null?'成績':won?`搶贏對台 ${diffText}`:`未能勝出 ${diffText}`}</b></div><div class="broadcast-title-row"><h3>《${safe(item.title)}》</h3><span class="broadcast-cat-tag">${safe(item.category||'節目')}</span></div><p class="broadcast-ep-line">${safe(item.episode||item.category||'節目播映')}</p><div class="battle-bar-box" title="我台 ${item.rating} : 對手 ${Number.isFinite(rival)?rival:'—'}"><div class="battle-bar-labels"><span>我台 <b>${item.rating}</b></span><span>對手 <b>${Number.isFinite(rival)?rival:'—'}</b></span></div><div class="battle-bar-track"><div class="battle-bar-fill" style="width:${ourShare}%"></div></div></div><div class="broadcast-result-stats"><div><small>我台收視</small><strong>${item.rating}</strong></div><div><small>最強對手</small><strong>${Number.isFinite(rival)?rival:'—'}</strong></div><div><small>廣告收入</small><strong class="gold-text">${hourlyMoney(item.revenue??0)}</strong></div></div>${item.effect?`<p class="broadcast-result-effect">★ ${safe(item.effect)}</p>`:''}${item.eventMod&&item.eventTitle?`<p class="event-mod-note">${item.eventMod>0?'🔥':'⚡'} 突發效應【${safe(item.eventTitle)}】：收視 ${item.eventMod>0?`+${item.eventMod}`:item.eventMod} 點</p>`:''}</article>`}).join(''):'<p class="empty">當日冇節目播映，排檔後先有逐套成績。</p>'}</div></section>`;
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

function scheduleView() {
  const wonSports = getActiveSportsEvents(state);
  const pendingSports = (state.events ?? []).filter(e => !e.resolved && e.playerBid !== null);
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
    ${pendingSports.length ? `
      <div class="pending-sports-banner">
        <span class="banner-icon">⚽</span>
        <div class="banner-text">
          <strong>你已提交體育暗標：${pendingSports.map(s => `《${safe(s.name)}》（保證金 ${money(s.playerBid)}）`).join('、')}</strong>
          <p>賽事暗標尚未開標。想即時排播英超／歐聯？前往體育專區可【⚡ 立即提前開標】或【⚡ 補足一口價買斷】即買即播！</p>
        </div>
        <button class="primary-button banner-btn" data-action="go-sports">前往體育專區開播 →</button>
      </div>
    ` : ''}
    <div class="weekday-tabs" role="group" aria-label="查看每週節目表">${WEEKDAYS.map((name,day)=>`<button data-action="schedule-day" data-day="${day}" class="${selectedDay===day?'active':''}" aria-pressed="${selectedDay===day}">${name}${day===viewing?'<span>今日</span>':''}</button>`).join('')}</div>
    <p class="schedule-tip">每個星期幾可以有唔同節目；點時段改排播。現在查看第 ${previewDay} 日。</p>
    ${editorOpen?'<button class="schedule-scrim" data-action="close-editor" aria-label="關閉時段編輯"></button>':''}
    <div class="schedule-editor ${editorOpen?'open':''}" ${editorOpen?'role="dialog" aria-modal="true" aria-label="安排播映時段"':'hidden'}><div class="schedule-editor-heading">安排 ${timeRange(editor.start,editor.duration)} <button class="editor-dismiss" data-action="close-editor" aria-label="關閉時段編輯">✕</button></div>
      <div class="schedule-fields"><label>開始時間<select data-action="editor-start">${Array.from({length:24},(_,i)=>`<option value="${i}" ${editor.start===i?'selected':''}>${hourLabel(i)}</option>`).join('')}</select></label><label>播映長度<select data-action="editor-duration" ${fixed?'disabled':''}>${(fixed?[fixed]:Array.from({length:max},(_,i)=>i+1)).map(n=>`<option value="${n}" ${editor.duration===n?'selected':''}>${n} 小時</option>`).join('')}</select></label></div>
      <div class="program-picker"><div class="picker-heading"><strong>選擇節目</strong><span>已揀：${safe(selectedProgram?.title??'未選')}${(()=>{const sp=options.find(o=>o.id===editor.programId);const it=sp?state.library.find(p=>p.id===sp.id):null;if(!it)return '';const sf=freshnessLabel(it.freshness,it.maxFreshness);return ` · <b class="sel-freshness-tag ${sf.tier}">${sf.icon} 新鮮度 ${sf.percent}%</b>`;})()}</span></div><input type="search" data-action="editor-program-search" value="${safe(editorProgramSearch)}" placeholder="搜尋節目名、類型或題材" aria-label="搜尋排播節目" autocomplete="off"><div class="picker-filters" aria-label="節目分類">${filterTabs.map(([id,label])=>`<button data-action="editor-program-group" data-value="${id}" aria-pressed="${editorProgramGroup===id}" class="${editorProgramGroup===id?'active':''}">${label}</button>`).join('')}</div><div class="program-choices" aria-label="可排播節目">${visibleOptions.length?visibleOptions.map(option=>{const item=state.library.find(p=>p.id===option.id),bookings=state.schedule.filter(block=>block.programId===option.id),booked=bookings.map(block=>`${dayPattern(daysForBlock(block))} ${hourLabel(block.start)}`).join('、');const subtitle=booked?`已排 ${booked}`:'未排';const episodes=item?.episodes?`${item.kind==='catalog'?catalogCycleProgress(item).remaining:Math.max(0,item.episodes-item.runs)} 集可播`:isDailyFormat(item?.kind)?'每日新一期':option.id.startsWith('event:')?'全季直播賽事':'常規播放';const f=item?freshnessLabel(item.freshness,item.maxFreshness):null;return `<button data-action="editor-program-card" data-id="${safe(option.id)}" class="program-choice ${editor.programId===option.id?'chosen':''}" aria-pressed="${editor.programId===option.id}"><span class="program-choice-icon">${safe(option.id.startsWith('event:')?'⚽':premiereProfile(item?.kind).symbol)}</span><span class="program-choice-text"><strong>${safe(option.title)}</strong><small>${safe(item?.category??'體育直播')} · ${safe(episodes)}</small></span><span class="program-choice-status">${f?`<span class="choice-fresh-tag ${f.tier}" title="新鮮度 ${f.percent}% (上限 ${f.max}%) · ${f.desc}">${f.icon} ${f.percent}%</span>`:'<span class="choice-fresh-tag high">🏆 體育</span>'}<span>${safe(subtitle)}</span></span></button>`}).join(''):'<p class="picker-empty">搵唔到節目。試吓清除搜尋或轉分類。</p>'}</div></div>
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
                  ${slot.days.length === 2 && slot.days[0] === 5 ? '⚽ 週末黃金大戰' : slot.days.length === 2 && slot.days[0] === 1 ? (sportsCfg.type === 'ucl' ? '⭐ 歐聯週中深夜大戰' : '⚽ 週中快車深夜直播') : '🏆 賽事直播'}
                  <small>${slot.label}</small>
                </button>
              `).join('')}
            </div>
            <p class="sports-preset-tip">💡 ${sportsCfg.type === 'pl' ? '英超賽事集中於週六日晚間及週二三深夜，週一、四、五通常沒有賽事。' : sportsCfg.type === 'ucl' ? '歐聯賽事嚴格只在週二、三深夜 01:00–05:00 進行，週末絕無賽事，與英超互不衝突！' : '大賽期間請在賽事時段內密集直播。'}</p>
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

function rivalsView() {
  const live=broadcastNow(state);
  return `<div class="page-head"><div><div class="eyebrow cyan">CHANNEL INTELLIGENCE</div><h1>兩間對手台嘅每日節目表</h1><p>對手每個遊戲月推出新節目，19:00–21:00 會直接搶走我台觀眾。外購市場搶購作品或收購我台作品後亦會喺 21:00–23:00 播出。</p></div><div class="legend">最近一日勝出 <strong>${state.lastDayResult?`${state.lastDayResult.wins} / 24 小時`:'等待第一日結算'}</strong></div></div>
    <div class="rival-cards">${state.rivals.map(rival=>{
      const now=rivalAtHour(state,rival,live.hour);
      const prime=rivalAtHour(state,rival,19);
      const premiere=rivalPremiere(rival,state.day);
      const next=rivalPremiere(rival,state.day+DAYS_PER_MARKET_MONTH);
      const deal=(state.distributionDeals??[]).find(d=>d.rivalId===rival.id&&d.startDay<=state.day&&state.day<d.expiresDay);
      const rivalBuy=(state.rivalPurchases??[]).find(r=>r.rivalId===rival.id&&r.startDay<=state.day&&state.day<r.expiresDay);
      return `<article class="panel"><div class="eyebrow cyan">COMPETITOR CHANNEL · 第 ${premiere.month+1} 個月</div><h2>${safe(rival.name)}</h2><p>${safe(rival.profile)}</p><div><small>本月首播</small><strong>《${safe(premiere.title)}》· ${safe(premiere.genre)} · ${premiere.slot}</strong></div><div><small>下月預告</small><strong>《${safe(next.title)}》· ${safe(next.genre)}</strong></div>${deal?`<div><small>買入我台作品</small><strong>《${safe(deal.title)}》· 至第 ${deal.expiresDay-1} 日 (21:00–23:00)</strong></div>`:''}${rivalBuy?`<div><small>外購市場搶購作品</small><strong>《${safe(rivalBuy.title)}》(${safe(rivalBuy.origin||'外購')} · 預測 ${rivalBuy.rating+2} 點) · 21:00–23:00</strong></div>`:''}<div><small>此刻</small><strong>${safe(now.title)} · 預測 ${now.rating}</strong></div><div><small>19:00 對台</small><strong>${safe(prime.title)} · 預測 ${prime.rating}</strong></div></article>`}).join('')}</div>
    <section class="panel matchup-panel"><div class="section-heading"><h2>逐小時對台</h2><span>我台與兩間對手，各 24 小時</span></div><div class="matchup-scroll"><div class="matchup-table"><div class="matchup-head"><span>時段</span><span>我台節目</span><span>全城電視 · 預測</span><span>本地八台 · 預測</span></div>${Array.from({length:24},(_,hour)=>{const block=programAtHour(state,hour);const program=block&&state.library.find(item=>item.id===block.programId);const event=block?.programId.startsWith('event:')&&state.events.find(e=>`event:${e.id}`===block.programId);const title=program?.title??event?.name??'未排節目';const episode=episodeForBlock(state,block);return `<div class="matchup-row ${hour>=18&&hour<=22?'prime':''}" data-hour="${hour}"><strong>${hourLabel(hour)}</strong><span>${safe(title)}${episode?`<small>${safe(episode)}</small>`:''}</span>${state.rivals.map(rival=>{const show=rivalAtHour(state,rival,hour);return `<span>${safe(show.title)}<b>${show.rating}</b></span>`}).join('')}</div>`}).join('')}</div></div><p class="footnote">對手收視係遊戲預測；按「結算今日」後，實際我台收視同藝人人氣會更新。</p></section>`;
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
            const isFullSeason = cfg?.type === 'pl' || cfg?.type === 'ucl' || (s.name && s.name.includes('全季'));
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
        const desc = cfg?.type === 'pl'
          ? '⚽ 英超聯賽：真實亞洲時區轉播。買斷或中標後預排【週末焦點（週六日 19:00–24:00）】及【週中快車（週二三 01:00–04:00）】直播；週一、四、五不佔用頻道，直播收視高達 98 點！'
          : cfg?.type === 'ucl'
          ? '⭐ 歐聯賽事：歐聯淘汰賽與決賽嚴格於【週二三深夜 01:00–05:00】直播，週末絕無賽事，與英超賽程完美共存不衝突，深夜收視震撼爆燈！'
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
    <div class="rivals"><div class="section-heading"><h2>競爭電視台競投風格</h2><span>三間對手會在開標日同時掀開底牌</span></div><div class="rival-grid"><div><span class="rival-icon">01</span><strong>全城電視</strong><small>大型電視網 · 財雄勢大，出價通常高出底價 35%–75%</small></div><div><span class="rival-icon">02</span><strong>本地八台</strong><small>地區台 · 審慎保守，出價通常貼近底價</small></div><div><span class="rival-icon">03</span><strong>視界台</strong><small>小眾台 · 偶爾爆冷高價搶奪特定賽事</small></div></div></div>
    ${recentList.length?`<section class="panel auction-results-history"><div class="section-heading"><h2>近期賽事開標紀錄</h2><span>揭曉結果</span></div><div class="recent-auctions-grid">${recentList.map(recent=>`<article class="recent-auction-item ${recent.winner==='你的電視台'?'we-won':''}"><div class="recent-auction-header"><strong>${safe(recent.name)}</strong><span class="winner-tag ${recent.winner==='你的電視台'?'gold':''}">得標者：${safe(recent.winner)}</span></div><div class="bid-list">${(recent.bids??[]).sort((a,b)=>b.amount-a.amount).map((b,i)=>`<div class="${b.name==='你的電視台'?'is-our-bid':''}"><span>${String(i+1).padStart(2,'0')} · ${safe(b.name)}</span><strong>${money(b.amount)}</strong></div>`).join('')}</div></article>`).join('')}</div></section>`:''}
`;
}

function hourlyComparisonView() {
  const result=state.lastDayResult;
  const visible=result.hours.filter(h=>reportFilter==='prime'?h.hour>=18&&h.hour<=22:reportFilter==='behind'?h.rating<=Math.max(...h.rivals):true);
  const filters=[['all','全日 24 小時'],['prime','黃金檔 18–22'],['behind','落後時段']];
  return `<section class="panel history-panel comparison-panel">
    <div class="section-heading"><h2>逐小時收視對比</h2><span>我台勝出 ${result.wins} / 24 小時</span></div>
    <p class="score-explainer">收視指數係遊戲內 0–100 分，唔係收視率百分比。我台分數高過<strong>兩間對手</strong>先算勝出；廣告收入係該小時賺到嘅錢。</p>
    <div class="report-filters" role="group" aria-label="篩選收視時段">${filters.map(([id,label])=>`<button data-action="report-filter" data-value="${id}" class="${reportFilter===id?'active':''}" aria-pressed="${reportFilter===id}">${label}</button>`).join('')}</div>
    <div class="hour-report">${visible.length?visible.map(h=>{
      const strongest=Math.max(...h.rivals),outcome=h.rating>strongest?'勝出':h.rating===strongest?'打和':'落後';
      const stations=[['我台',h.rating,'ours'],[state.rivals[0]?.name??'對手一',h.rivals[0],'city'],[state.rivals[1]?.name??'對手二',h.rivals[1],'local']];
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

function reportsView() {
  return `<div class="page-head"><div><div class="eyebrow gold">BOARDROOM</div><h1>每日與季度報告</h1><p>每日節目表會逐日播映，每 90 日結算一季；報告按每小時收視計廣告收益。</p></div></div>${state.lastDayResult?`<section class="panel day-report"><div class="section-heading"><h2>最近一日 · ${state.lastDayResult.label}</h2><span>${quarterLabel(state.lastDayResult.quarter)}</span></div><div class="report-total"><div><small>當日廣告收入</small><strong>${hourlyMoney(state.lastDayResult.revenue)}</strong></div><div><small>當日營運開支</small><strong>${hourlyMoney(state.lastDayResult.overhead)}</strong></div><div><small>當日淨額</small><strong>${hourlyMoney(state.lastDayResult.net)}</strong></div></div><div class="day-episodes">${state.lastDayResult.details.filter(d=>d.episode && d.episode!=='每日新一期').map(d=>`<span>${safe(d.title)} · ${safe(d.episode)}</span>`).join('')}</div></section>`:''}<div class="report-grid"><section class="panel"><div class="section-heading"><h2>最近季度結算</h2><span>${state.lastResult?.label??'尚未結算'}</span></div>${state.lastResult?`<div class="report-total"><div><small>90 日節目及廣告收益</small><strong>${money(state.lastResult.revenue)}</strong></div><div><small>營運開支</small><strong>−${money(state.lastResult.overhead)}</strong></div><div><small>季度淨額</small><strong class="${state.lastResult.net<0?'danger':''}">${money(state.lastResult.net)}</strong></div></div>${state.lastResult.sportsPenalty?`<div class="report-row"><span>體育廣告對賭賠付</span><b>−${money(state.lastResult.sportsPenalty)}</b></div>`:''}`:'<p class="empty">結算第一季之後，就會睇到完整數據。</p>'}</section><section class="panel"><div class="section-heading"><h2>電視台紀錄</h2><span>${state.library.length} 套節目入庫</span></div><div class="achievement"><small>已解鎖成就</small>${state.achievements.length?state.achievements.map(a=>`<span>★ ${safe(a)}</span>`).join(''):'<p>仲未解鎖。試吓挑戰危險錯配，或者贏得一場版權暗標。</p>'}</div><div class="achievement"><small>贊助商</small>${state.sponsors.length?state.sponsors.map(s=>`<span>✦ ${safe(s)}</span>`).join(''):'<p>特殊贊助商會喺 Cult 片爆紅後出現。</p>'}</div></section></div>
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
  ${audienceView()}
  ${premiereHistoryView()}
  ${broadcastResultsView()}
  ${monthlyLeaderboardView()}
  ${annualAwardsHistoryView()}
  ${state.lastDayResult?hourlyComparisonView():''}
  <section class="panel history-panel"><div class="section-heading"><h2>季度帳目</h2><span>最近 12 季</span></div>${state.history.length?state.history.map(h=>`<div class="history-row"><strong>${h.label}</strong><span>收益 ${money(h.revenue)}</span><span>營運 ${money(h.overhead)}</span><b class="${h.net<0?'danger':''}">${money(h.net)}</b></div>`).join(''):'<p class="empty">第一份帳目等待結算。</p>'}</section>`;
}

function flash(message){notice=message;render();setTimeout(()=>{if(notice===message){notice='';render();}},3600)}

app.addEventListener('click',e=>{
  const button=e.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action, value=button.dataset.value;
  try {
    if(state.pendingPremieres?.length&&['advance-day','advance-week','advance'].includes(action))throw Error('先處理首播戰報，然後再繼續營運。');
    if(action==='premiere-choice'){const result=resolvePremiere(state,value);flash(`《${result.title}》首播決策完成，後續集數會受影響。`);return;}
    if(action==='tab'){tab=button.dataset.tab;editorOpen=false;resetScroll=true;notice='';render();}
    if(action==='broadcast-day'){selectedBroadcastDay=Number(button.dataset.day);render();}
    if(action==='kind'){selected.kind=value;const format=CONTENT_TYPES.find(item=>item.id===value);if(format.topics&&!format.topics.includes(selected.topic))selected.topic=format.topics[0];render();}
    if(action==='genre'){selected.genre=value;render();}
    if(action==='theme'){if(selected.themes.includes(value)){if(selected.themes.length>1)selected.themes=selected.themes.filter(t=>t!==value)}else if(selected.themes.length<2)selected.themes.push(value);else selected.themes=[selected.themes[1],value];render();}
    if(action==='topic'){selected.topic=value;render();}
    if(action==='actor'){if(selected.actorIds.includes(value))selected.actorIds=selected.actorIds.filter(id=>id!==value);else if(selected.actorIds.length<4)selected.actorIds.push(value);else throw Error('一套劇最多 4 位主演。');render();}
    if(action==='actor-filter'){actorFilter=value;render();}
    if(action==='actor-toggle'){actorPickerOpen=!actorPickerOpen;render();}
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
    if(action==='reset-confirm'){state=newGame();selected={kind:'drama',genre:'青春',themes:['友情'],actorIds:['edaan','anson_lo'],topic:'遊戲競賽',budgetId:'standard',episodeHours:2,episodeCount:8,styleId:'mainstream',hookId:'none',customTitle:''};editor={start:19,duration:2,programId:'start-sitcom',days:[...EVERY_DAY],allowRepeat:false};resetProgramPicker();scheduleDay=null;catalogFilter='all';catalogSort='featured';catalogAvailableOnly=false;catalogNetwork='ViuTV';catalogYear='all';catalogQuery='';licenseDays=180;reportFilter='all';actorFilter='viu';actorPickerOpen=false;actorSearch='';tab='schedule';editorOpen=false;runSummary=null;selectedBroadcastDay=null;selectedLeaderboardMonth=null;resetScroll=true;showReset=false;notice='';render();}
  }catch(error){flash(error.message)}
});
app.addEventListener('input',e=>{if(e.target.dataset.action==='custom-title'){selected.customTitle=e.target.value;}if(e.target.dataset.action==='actor-search'){actorSearch=e.target.value;app.querySelectorAll('.actor-grid .actor').forEach(button=>{button.hidden=!button.textContent.includes(actorSearch.trim())});}if(e.target.dataset.action==='editor-program-search'&&!e.isComposing){const pos=e.target.selectionStart;editorProgramSearch=e.target.value;render();const input=app.querySelector('[data-action="editor-program-search"]');input?.focus({preventScroll:true});input?.setSelectionRange(pos,pos);}if(e.target.dataset.action==='catalog-search'&&!e.isComposing){const pos=e.target.selectionStart;catalogQuery=e.target.value;render();const input=app.querySelector('[data-action="catalog-search"]');input?.focus({preventScroll:true});input?.setSelectionRange(pos,pos);}});
app.addEventListener('compositionend',e=>{if(e.target.dataset.action==='editor-program-search'){editorProgramSearch=e.target.value;render();app.querySelector('[data-action="editor-program-search"]')?.focus({preventScroll:true});}if(e.target.dataset.action==='catalog-search'){catalogQuery=e.target.value;render();app.querySelector('[data-action="catalog-search"]')?.focus({preventScroll:true});}});
app.addEventListener('change',e=>{const action=e.target.dataset.action;if(action==='catalog-sort'){catalogSort=e.target.value;resetScroll=true;render()}if(action==='catalog-year'){catalogYear=e.target.value;resetScroll=true;render()}if(action==='editor-start'){editor.start=Number(e.target.value);editor.allowRepeat=false;render()}if(action==='editor-duration'){editor.duration=Number(e.target.value);render()}if(action==='editor-program'){editor.programId=e.target.value;const p=state.library.find(p=>p.id===editor.programId);editor.duration=p?.episodeHours??Math.min(editor.duration,editor.programId.startsWith('event:')?24:4);editor.days=initialDays(p);editor.recurrence=initialRecurrence(p);editor.allowRepeat=false;render()}if(action==='editor-weekday'){editor.days=[Number(e.target.value)];render()}if(action==='editor-repeat'){editor.allowRepeat=e.target.checked;render()}});
app.addEventListener('keydown',e=>{
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

