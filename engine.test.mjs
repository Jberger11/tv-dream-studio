import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame, advanceDay, advanceQuarter, resolvePremiere, broadcastNow, advanceBroadcastClock, clearCompletedPrograms, produce, productionQuote, scheduleProgram, programAtHour, buyProgram, renewLicense, licenseExpired, isCatalogCycleComplete, catalogCycleProgress, catalogCompletedAirings, startCatalogReplay, startProgramReplay, canReplayProgram, getFreshnessFactor, freshnessLabel, migrateLegacyLicenses, catalogForQuarter, catalogForMonth, marketMonthForDay, rivalAtHour, rivalPremiere, distributionQuote, sellProduction, replyToLetter, rejectLetter, dismissLetter, holdFanMeeting, launchAudiencePoll, activeBiddingEvents, submitBid, generateSuggestedTitles, EPISODE_COUNTS, VIU_ORIGINALS, episodeForBlock, removeScheduledProgram, BREAKING_EVENTS_POOL, getBreakingRatingMod, evaluateMonthlyRatings, evaluateAnnualAwards, dismissCeremony, dismissMonthResult, ACTORS, refreshMarketRivalBuys, ACQUISITION_GROUPS, getSportsConfig, resolveAuction, runsOnWeekday, daysForBlock} from './engine.js';

test('cash permits more than three productions and an optional filming hook changes the quote', () => {
  const state=newGame(),base=productionQuote(state,{kind:'finance',topic:'開市',budgetId:'lean'});
  const hooked=productionQuote(state,{kind:'finance',topic:'開市',budgetId:'lean',hookId:'audience'});
  assert.equal(hooked.total-base.total,120_000);
  for(let i=0;i<4;i++) produce(state,{kind:'finance',topic:'開市',budgetId:'lean',hookId:i===0?'audience':'none'},()=>.5);
  assert.equal(state.productionCount,4);
  assert.ok(state.cash>0);
});

test('rivals premiere new titles monthly and bought originals compete in the evening', () => {
  const state=newGame(),rival=state.rivals[0];
  assert.notEqual(rivalPremiere(rival,1).title,rivalPremiere(rival,31).title);
  assert.equal(rivalAtHour(state,rival,19,31).title,rivalPremiere(rival,31).title);
  const original=produce(state,{kind:'variety',topic:'遊戲競賽',budgetId:'lean'},()=>.5);
  const before=state.cash,quote=distributionQuote(original,false);
  sellProduction(state,original.id,rival.id,false);
  assert.equal(state.cash,before+quote);
  assert.equal(rivalAtHour(state,rival,21).title,original.title);
  assert.throws(()=>sellProduction(state,original.id,rival.id,false),/不能重複賣/);
  state.day=31;
  assert.notEqual(rivalAtHour(state,rival,21).title,original.title);
  const exclusiveOriginal=produce(state,{kind:'variety',topic:'訪談',budgetId:'lean'},()=>.5);
  scheduleProgram(state,20,exclusiveOriginal.id,2);
  const sold=sellProduction(state,exclusiveOriginal.id,state.rivals[1].id,true);
  assert.equal(sold.exclusive,true);
  assert.equal(state.schedule.some(block=>block.programId===exclusiveOriginal.id),false);
  assert.throws(()=>scheduleProgram(state,20,exclusiveOriginal.id,2));
  assert.throws(()=>distributionQuote(produce(state,{kind:'finance',topic:'開市',budgetId:'lean'},()=>.5)),/每日新聞同財經/);
});

test('audience letters offer a real next-production bonus and migrate safely', () => {
  const state=newGame();
  delete state.mailbox;delete state.audienceFeed;delete state.distributionDeals;
  migrateLegacyLicenses(state);
  state.day=9;
  advanceDay(state,()=>.5);
  assert.ok(state.audienceFeed.length);
  assert.equal(state.mailbox[0].type,'gift');
  replyToLetter(state,state.mailbox[0].id);
  assert.equal(state.giftBoost,3);
  const made=produce(state,{kind:'finance',topic:'開市',budgetId:'lean'},()=>.5);
  assert.equal(state.giftBoost,0);
  assert.ok(made.quality>=35);
});

test('external market refreshes every 30 game days without revoking earlier purchases', () => {
  const state=newGame(),first=catalogForMonth(1),second=catalogForMonth(31),third=catalogForMonth(61);
  assert.equal(marketMonthForDay(30),0);
  assert.equal(marketMonthForDay(31),1);
  assert.notDeepEqual(first.filter(p=>p.marketMonth!==undefined).map(p=>p.id),second.filter(p=>p.marketMonth!==undefined).map(p=>p.id));
  assert.notDeepEqual(second.filter(p=>p.marketMonth!==undefined).map(p=>p.id),third.filter(p=>p.marketMonth!==undefined).map(p=>p.id));
  assert.equal(first.find(p=>p.title==='IT狗').id,second.find(p=>p.title==='IT狗').id);
  const bought=buyProgram(state,first.find(p=>p.id.startsWith('catalog-')).id);
  state.day=30;
  const result=advanceDay(state,()=>.5);
  assert.equal(result.marketRefresh,true);
  assert.equal(state.day,31);
  assert.ok(state.library.includes(bought));
  assert.equal(bought.licenseExpiresDay,181);
  assert.throws(()=>buyProgram(state,first.find(p=>p.id.startsWith('catalog-')).id),/本月片單/);
  assert.ok(buyProgram(state,second.find(p=>p.id.startsWith('market-')).id));
});

test('ViuTV originals remain available across quarters without changing legacy offer IDs', () => {
  const first=catalogForQuarter(0),later=catalogForQuarter(5);
  assert.equal(VIU_ORIGINALS.length,47);
  assert.equal(new Set(first.map(p=>p.id)).size,first.length);
  assert.equal(first.filter(p=>p.network==='ViuTV'&&p.id.startsWith('viu-original')).length,47);
  assert.ok(first.some(p=>p.id==='catalog-0-series-0'));
  for(const title of ['二月廿九','男排女將','大叔的愛','IT狗','法與情','打天下2','存酒人','IT狗2.0','COURT!','地獄大狀','kiDnap GAME']) {
    const show=first.find(p=>p.title===title);
    assert.ok(show,`${title} should be selectable`);
    assert.equal(later.find(p=>p.id===show.id)?.title,title);
  }
  const state=newGame(),show=first.find(p=>p.title==='男排女將');
  buyProgram(state,show.id,180);
  assert.equal(state.library.find(p=>p.id===show.id).network,'ViuTV');
  assert.equal(state.library.find(p=>p.id===show.id).releaseYear,2020);
});

test('a finite show airs its last episode once, then frees its slot', () => {
  const state=newGame();
  const show=state.library.find(p=>p.id==='start-doc');
  show.runs=5;
  const before=state.cash;
  const day=advanceDay(state,()=>.5);
  assert.ok(day.completed.includes('城裡的夜'));
  assert.equal(show.runs,6);
  assert.equal(programAtHour(state,0),undefined);
  assert.ok(state.cash>before);
  const next=advanceDay(state,()=>.5);
  assert.equal(next.hours[0].rating,0);
  assert.equal(next.hours[0].revenue,0);
  assert.equal(next.hours[0].empty,true);
  assert.throws(()=>scheduleProgram(state,0,show.id,2),/播完/);
});

test('multiple daily slots cannot consume more than the purchased episodes', () => {
  const state=newGame();
  const show=state.library.find(p=>p.id==='start-doc');
  show.runs=5;
  scheduleProgram(state,2,show.id,2,{allowRepeat:true});
  const day=advanceDay(state,()=>.5);
  assert.equal(day.details.filter(d=>d.title===show.title).length,1);
  assert.equal(show.runs,6);
  assert.equal(state.schedule.some(block=>block.programId===show.id),false);
});

test('licensed film stops after one showing, then can be replayed only on request', () => {
  const state=newGame();
  const film=state.library.find(p=>p.id==='start-film');
  const first=advanceDay(state,()=>.5);
  assert.ok(first.completed.includes(film.title));
  assert.equal(film.runs,1);
  assert.equal(programAtHour(state,14),undefined);
  assert.throws(()=>scheduleProgram(state,14,film.id,2),/重播一輪/);
  const second=advanceDay(state,()=>.5);
  assert.equal(second.hours[14].revenue,0);
  const cash=state.cash,rights=film.licenseExpiresDay;
  startCatalogReplay(state,film.id);
  assert.equal(state.cash,cash);
  assert.equal(film.licenseExpiresDay,rights);
  scheduleProgram(state,14,film.id,2);
  assert.match(episodeForBlock(state,state.schedule.find(b=>b.programId===film.id)),/重映第 1 輪/);
  const rerun=advanceDay(state,()=>.5);
  assert.equal(film.runs,2);
  assert.equal(rerun.details.find(d=>d.title===film.title).decay,.96);
  assert.ok(rerun.hours[14].rating<first.hours[14].rating);
  assert.equal(programAtHour(state,14),undefined);
  state.day=180;
  const last=advanceDay(state,()=>.5);
  assert.ok(last.expired.includes(film.title));
  assert.equal(state.schedule.some(b=>b.programId===film.id),false);
  assert.equal(programAtHour(state,14),undefined);
});

test('acquired series ends at its last episode, preserves rights, and needs manual replay', () => {
  const state=newGame(),listing=catalogForMonth(state.day).find(p=>p.title==='使徒行者');
  const show=buyProgram(state,listing.id,180);
  show.runs=show.episodes-1;
  scheduleProgram(state,19,show.id,2);
  const cash=state.cash,rights=show.licenseExpiresDay;
  const day=advanceDay(state,()=>.5);
  assert.ok(day.completed.includes(show.title));
  assert.equal(show.runs,show.episodes);
  assert.equal(isCatalogCycleComplete(show),true);
  assert.equal(state.schedule.some(b=>b.programId===show.id),false);
  assert.throws(()=>scheduleProgram(state,19,show.id,2),/重播一輪/);
  assert.equal(show.licenseExpiresDay,rights);
  startCatalogReplay(state,show.id);
  assert.equal(state.cash,cash+day.net);
  assert.equal(show.runs,show.episodes);
  scheduleProgram(state,19,show.id,2);
  assert.match(episodeForBlock(state,state.schedule.find(b=>b.programId===show.id)),/第 1 \/ 20 集 · 重播第 1 輪/);
  advanceDay(state,()=>.5);
  assert.equal(show.runs,show.episodes+1);
});

test('old save already auto-rerunning stops without changing cash, runs or rights', () => {
  const state=newGame(),show=buyProgram(state,catalogForMonth(1).find(p=>p.title==='使徒行者').id);
  scheduleProgram(state,19,show.id,2);
  show.runs=27;
  const cash=state.cash,rights=show.licenseExpiresDay;
  migrateLegacyLicenses(state);
  clearCompletedPrograms(state);
  assert.equal(show.runs,27);
  assert.equal(state.cash,cash);
  assert.equal(show.licenseExpiresDay,rights);
  assert.equal(state.schedule.some(b=>b.programId===show.id),false);
  startCatalogReplay(state,show.id);
  scheduleProgram(state,19,show.id,2);
  assert.match(episodeForBlock(state,state.schedule.find(b=>b.programId===show.id)),/第 1 \/ 20 集/);
});

test('new catalogue licences offer 180 or 360 days and expired rights can be renewed', () => {
  const state=newGame(),listing=catalogForQuarter(state.quarter)[0],before=state.cash;
  const acquired=buyProgram(state,listing.id,360);
  assert.equal(acquired.licenseExpiresDay,361);
  assert.equal(state.cash,before-Math.round(listing.cost*1.7/1_000)*1_000);
  acquired.runs=12;
  state.day=361;
  assert.equal(licenseExpired(acquired,state.day),true);
  const renewed=renewLicense(state,acquired.id,180);
  assert.equal(renewed.runs,12);
  assert.equal(renewed.licenseExpiresDay,541);
  assert.equal(licenseExpired(renewed,state.day),false);
});

test('legacy catalogue save receives rights without changing money or rerun count', () => {
  const state=newGame(),film=state.library.find(p=>p.id==='start-film');
  state.day=75;state.cash=4_217_000;film.runs=9;
  delete film.licenseExpiresDay;
  migrateLegacyLicenses(state);
  clearCompletedPrograms(state);
  assert.equal(film.licenseExpiresDay,255);
  assert.equal(film.licenseBaseCost,1_150_000);
  assert.equal(film.runs,9);
  assert.equal(state.cash,4_217_000);
  assert.equal(programAtHour(state,14),undefined);
  startCatalogReplay(state,film.id);
  scheduleProgram(state,14,film.id,2);
  assert.equal(programAtHour(state,14)?.programId,film.id);
});

test('weekday and weekend slots differ; duplicate same-day booking needs explicit rerun', () => {
  const state=newGame();
  const weekend=produce(state,{kind:'variety',topic:'遊戲競賽',budgetId:'lean',episodeHours:2,episodeCount:8},()=>.5);
  scheduleProgram(state,19,'start-sitcom',2,{days:[0,1,2,3,4]});
  scheduleProgram(state,19,weekend.id,2,{days:[5,6]});
  assert.equal(programAtHour(state,19,1).programId,'start-sitcom');
  assert.equal(programAtHour(state,19,6).programId,weekend.id);
  assert.throws(()=>scheduleProgram(state,9,'start-sitcom',2,{days:[0]}),/同日重播/);
  scheduleProgram(state,9,'start-sitcom',2,{days:[0],allowRepeat:true});
  assert.equal(programAtHour(state,9,1).programId,'start-sitcom');
  assert.equal(programAtHour(state,9,2).programId,'start-market');
  removeScheduledProgram(state,19,{weekday:5});
  assert.equal(programAtHour(state,19,6),undefined);
  assert.equal(programAtHour(state,19,7)?.programId,weekend.id);
});

test('old saves keep money and completed shows while stale slots are cleared', () => {
  const state=newGame();
  state.cash=7_321_000;
  state.library.find(p=>p.id==='start-crime').runs=20;
  const completed=clearCompletedPrograms(state);
  assert.ok(completed.some(p=>p.id==='start-crime'));
  assert.equal(state.cash,7_321_000);
  assert.ok(state.library.some(p=>p.id==='start-crime'));
  assert.equal(programAtHour(state,16),undefined);
});

test('a night show has a meaningful night slot advantage and can still lose money', () => {
  const config={kind:'night',topic:'深夜清談',budgetId:'standard',episodeHours:2,episodeCount:8};
  function run(start,roll) {
    const state=newGame();
    const show=produce(state,config,()=>roll);
    scheduleProgram(state,start,show.id,2);
    let adRevenue=0;
    for(let day=0;day<8;day++) {
      const result=advanceDay(state,()=>roll);
      adRevenue+=result.details.filter(item=>item.title===show.title).reduce((sum,item)=>sum+item.revenue,0);
    }
    return {show,adRevenue};
  }
  const night=run(23,.5),daytime=run(10,.5),weak=run(23,.01);
  assert.ok(night.adRevenue>daytime.adRevenue*2);
  assert.ok(weak.adRevenue<weak.show.cost);
  assert.ok(night.adRevenue>weak.adRevenue);
});

test('new finance productions follow news: one upfront issue, then paid daily issues', () => {
  const state=newGame();
  const options={kind:'finance',topic:'市場分析',budgetId:'standard',episodeHours:2,episodeCount:20};
  const quote=productionQuote(state,options);
  assert.equal(quote.episodes,0);
  assert.equal(quote.total,quote.perEpisode);
  const openingCash=state.cash;
  const program=produce(state,options,()=>.5);
  assert.equal(state.cash,openingCash-quote.perEpisode);
  scheduleProgram(state,10,program.id,2);
  const first=advanceDay(state,()=>.5);
  const second=advanceDay(state,()=>.5);
  assert.equal(first.overhead,second.overhead-quote.perEpisode);
  assert.equal(program.episodes,0);
  for(let day=0;day<25;day++) advanceDay(state,()=>.5);
  assert.equal(program.runs,27);
  assert.equal(programAtHour(state,10)?.programId,program.id);
});

test('existing prepaid finance series keep their purchased episode count', () => {
  const state=newGame();
  const oldSeries=state.library.find(p=>p.id==='start-market');
  oldSeries.episodes=4;
  oldSeries.episodeCost=150_000;
  clearCompletedPrograms(state);
  assert.equal(oldSeries.episodes,4);
  const day=advanceDay(state,()=>.5);
  assert.equal(day.overhead,18_333);
  assert.equal(oldSeries.runs,1);
});

test('a new show premieres once, stops fast forward and its decision changes later episodes', () => {
  const state=newGame();
  const show=produce(state,{kind:'night',topic:'深夜清談',budgetId:'lean',episodeHours:2,episodeCount:8},()=>.5);
  scheduleProgram(state,22,show.id,2);
  const result=advanceQuarter(state,()=>.5);
  assert.equal(result.day,1);
  assert.equal(state.pendingPremieres.length,1);
  const premiere=state.pendingPremieres[0];
  assert.equal(premiere.programId,show.id);
  assert.equal(premiere.rating,result.details.find(item=>item.title===show.title).rating);
  const priorRating=show.rating,priorBuzz=show.buzz,priorCash=state.cash;
  resolvePremiere(state,'spotlight');
  assert.equal(show.rating,Math.min(100,priorRating+5));
  assert.equal(show.buzz,Math.min(100,priorBuzz+8));
  assert.equal(state.cash,priorCash-120_000);
  assert.equal(state.pendingPremieres.length,0);
  assert.equal(state.premiereHistory[0].programId,show.id);
  advanceDay(state,()=>.5);
  assert.equal(state.pendingPremieres.length,0);
});

test('multiple same-day premieres queue once each and old saves gain queue without changing progress', () => {
  const state=newGame();
  const news=produce(state,{kind:'news',topic:'晚間',budgetId:'lean',episodeHours:1},()=>.5);
  const variety=produce(state,{kind:'variety',topic:'遊戲競賽',budgetId:'lean',episodeHours:1,episodeCount:8},()=>.5);
  scheduleProgram(state,12,news.id,1);
  scheduleProgram(state,22,variety.id,1);
  const before=state.cash;
  delete state.pendingPremieres;delete state.premiereHistory;
  migrateLegacyLicenses(state);
  assert.equal(state.cash,before);
  advanceDay(state,()=>.5);
  assert.deepEqual(state.pendingPremieres.map(item=>item.programId),[news.id,variety.id]);
  assert.equal(state.library.find(item=>item.id===news.id).runs,1);
  resolvePremiere(state,'steady');
  assert.equal(state.pendingPremieres.length,1);
  resolvePremiere(state,'improve');
  assert.equal(state.pendingPremieres.length,0);
  assert.equal(state.premiereHistory.length,2);
});

test('accelerated broadcast clock follows the game schedule without settling or spending', () => {
  const state=newGame(),cash=state.cash,runs=state.library.map(p=>p.runs);
  assert.equal(broadcastNow(state).clock,'00:00');
  assert.equal(broadcastNow(state).title,'城裡的夜');
  advanceBroadcastClock(state,60);
  assert.equal(broadcastNow(state).clock,'01:00');
  assert.equal(broadcastNow(state).title,'城裡的夜');
  advanceBroadcastClock(state,60);
  assert.equal(broadcastNow(state).clock,'02:00');
  assert.equal(broadcastNow(state).title,'城市慢行');
  advanceBroadcastClock(state,5000);
  assert.equal(broadcastNow(state).clock,'24:00');
  assert.equal(broadcastNow(state).finished,true);
  assert.equal(state.cash,cash);
  assert.deepEqual(state.library.map(p=>p.runs),runs);
  assert.equal(state.day,1);
  advanceDay(state,()=>.5);
  assert.equal(state.day,2);
  assert.equal(broadcastNow(state).clock,'00:00');
});

test('old save receives simulation clock without changing cash or existing progress', () => {
  const state=newGame();
  state.cash=3_456_789;state.day=47;state.library[0].runs=5;
  delete state.liveMinute;
  migrateLegacyLicenses(state);
  assert.equal(state.liveMinute,0);
  assert.equal(state.cash,3_456_789);
  assert.equal(state.day,47);
  assert.equal(state.library[0].runs,5);
});

test('one-night charity, contest and pageant events settle once with individual results', () => {
  for(const [kind,topic] of [['charity','全城慈善演唱會'],['contest','全城歌唱賽'],['pageant','香港小姐選拔']]){
    const state=newGame();
    const quote=productionQuote(state,{kind,budgetId:'lean',episodeHours:2,episodeCount:999});
    assert.equal(quote.episodes,1);
    const event=produce(state,{kind,topic,budgetId:'lean',episodeHours:2,episodeCount:999},()=>.5);
    assert.equal(event.episodes,1);
    scheduleProgram(state,20,event.id,2,{days:[0]});
    assert.equal(episodeForBlock(state,state.schedule.find(block=>block.programId===event.id)),'一晚限定直播');
    const result=advanceDay(state,()=>.5),entry=result.details.find(item=>item.programId===event.id);
    assert.ok(entry);
    assert.ok(entry.revenue>0);
    assert.ok(Number.isFinite(entry.rivalRating));
    assert.equal(state.broadcastReports[0].details.find(item=>item.programId===event.id).revenue,entry.revenue);
    assert.equal(state.schedule.some(block=>block.programId===event.id),false);
    assert.equal(event.runs,1);
    assert.ok(entry.effect);
    if(kind==='charity')assert.ok(state.charityRaised>0);
    else assert.ok(state.fans>24);
  }
});

test('broadcast reports migrate without changing existing cash, rights, shows or random state', () => {
  const state=newGame(),before=JSON.stringify({cash:state.cash,library:state.library,rng:state.rngSeed});
  delete state.broadcastReports;delete state.charityRaised;
  migrateLegacyLicenses(state);
  assert.deepEqual(state.broadcastReports,[]);
  assert.equal(state.charityRaised,0);
  assert.equal(JSON.stringify({cash:state.cash,library:state.library,rng:state.rngSeed}),before);
  const result=advanceDay(state,()=>.5);
  assert.equal(state.broadcastReports[0].details.reduce((sum,item)=>sum+item.revenue,0),result.revenue);
});

test('catalogue airing count measures completed full runs, while scheduling uses remaining episodes', () => {
  const state=newGame(),show=buyProgram(state,catalogForMonth(1).find(p=>p.title==='使徒行者').id);
  show.runs=61;
  const before=JSON.stringify(show),cash=state.cash;
  assert.deepEqual(catalogCycleProgress(show),{aired:20,total:20,remaining:0});
  assert.equal(catalogCompletedAirings(show),3);
  assert.equal(isCatalogCycleComplete(show),true);
  assert.equal(JSON.stringify(show),before);
  startCatalogReplay(state,show.id);
  assert.deepEqual(catalogCycleProgress(show),{aired:0,total:20,remaining:20});
  assert.equal(catalogCompletedAirings(show),3);
  assert.equal(show.runs,61);
  assert.equal(state.cash,cash);
  show.runs=62;
  assert.deepEqual(catalogCycleProgress(show),{aired:1,total:20,remaining:19});
  assert.equal(catalogCompletedAirings(show),3);
  show.runs=80;
  assert.equal(catalogCompletedAirings(show),4);
  const film=state.library.find(p=>p.id==='start-film');
  film.runs=3;
  assert.deepEqual(catalogCycleProgress(film),{aired:1,total:1,remaining:0});
  assert.equal(catalogCompletedAirings(film),3);
});

test('finishing all episodes of a catalog show leaves the slot blank and avoids spurious replay', () => {
  const state=newGame();
  const series=buyProgram(state,catalogForMonth(1).find(p=>p.title==='季前賽').id);
  assert.equal(series.episodes,20);
  scheduleProgram(state,14,series.id,2);
  series.runs=19;
  assert.equal(episodeForBlock(state,state.schedule.find(b=>b.programId===series.id)),'第 20 / 20 集');
  const day=advanceDay(state,()=>.5);
  assert.ok(day.completed.includes('季前賽'));
  assert.equal(series.runs,20);
  assert.equal(isCatalogCycleComplete(series),true);
  assert.equal(state.schedule.some(b=>b.programId===series.id),false);
  assert.equal(programAtHour(state,14),undefined);
  assert.equal(programAtHour(state,15),undefined);

  // Legacy save simulation where runs >= episodes and show was lingering in schedule:
  state.schedule.push({start:14,duration:2,programId:series.id,days:[0,1,2,3,4,5,6]});
  migrateLegacyLicenses(state);
  assert.equal(state.schedule.some(b=>b.programId===series.id),false);
  assert.equal(programAtHour(state,14),undefined);
  assert.equal(episodeForBlock(state,{start:14,duration:2,programId:series.id}),'第 21 / 20 集');
  assert.doesNotMatch(episodeForBlock(state,{start:14,duration:2,programId:series.id}),/手動重播/);
});

test('breaking sudden events (local or worldwide) alter program rating dynamically', () => {
  const state = newGame();
  const typhoon = BREAKING_EVENTS_POOL.find(e => e.id === 'typhoon');
  assert.ok(typhoon);
  assert.equal(typhoon.scope, 'local');
  state.breakingEvent = { ...typhoon, daysLeft: 2, totalDays: 2, startDay: 1 };
  
  const newsProg = state.library.find(p => p.kind === 'news');
  const dramaProg = state.library.find(p => p.kind === 'drama');
  const newsMod = getBreakingRatingMod(state.breakingEvent, newsProg);
  const dramaMod = getBreakingRatingMod(state.breakingEvent, dramaProg);
  assert.equal(newsMod, 24); // all 12 + news 12
  assert.equal(dramaMod, 12); // all 12

  const day1 = advanceDay(state, () => .5);
  assert.equal(state.breakingEvent.daysLeft, 1);
  const newsDetail = day1.details.find(d => d.kind === 'news');
  assert.ok(newsDetail);
  assert.equal(newsDetail.eventMod, 24);

  const day2 = advanceDay(state, () => .5);
  assert.equal(state.breakingEvent, null);
  assert.ok(state.breakingEventsHistory.length >= 1);
});

test('special audience events provide diverse interactive decisions and consequences', () => {
  const state = newGame();
  state.day = 6; // Day 6 triggers special audience events
  advanceDay(state, () => .5);
  const letter = state.mailbox[0];
  assert.ok(letter);
  assert.ok(letter.options && letter.options.length >= 2);
  const beforeFans = state.fans;
  replyToLetter(state, letter.id, letter.options[0].id);
  assert.equal(letter.resolved, true);
  assert.equal(letter.resolvedChoice, letter.options[0].id);
  assert.ok(state.fans >= beforeFans);
});

test('month-end evaluations identify highest rating program, award bonuses and maintain leaderboards', () => {
  const state = newGame();
  state.day = 30; // 30th day triggers month end
  const res = advanceDay(state, () => .5);
  assert.ok(res.monthResult);
  assert.equal(res.monthResult.month, 1);
  assert.ok(res.monthResult.champion);
  assert.ok(res.monthResult.top5.length >= 1);
  assert.equal(state.monthlyLeaderboards.length, 1);
  assert.equal(state.monthlyLeaderboards[0].month, 1);
  dismissMonthResult(state);
  assert.equal(state.lastMonthResult.isNew, false);
});

test('annual award ceremony takes place every year awarding trophies, talent boosts and gala prizes', () => {
  const state = newGame();
  state.day = 360; // 360th day triggers annual ceremony
  const res = advanceDay(state, () => .5);
  assert.ok(res.ceremony);
  assert.equal(res.ceremony.year, 1);
  assert.ok(res.ceremony.awards.length >= 6);
  assert.ok(state.awardCeremonies.length >= 1);
  assert.ok(state.pendingCeremony);
  dismissCeremony(state);
  assert.equal(state.pendingCeremony, null);
});

test('programme freshness drops upon completing drama, recovers over time off-air, but cannot exceed degraded maxFreshness ceiling', () => {
  const state = newGame();
  const drama = produce(state, { kind: 'drama', genre: '刑偵', themes: ['懸疑'], actorIds: [ACTORS[0].id, ACTORS[1].id], budgetId: 'lean', episodeCount: 4 }, () => .5);
  assert.equal(drama.freshness, 100);
  assert.equal(drama.maxFreshness, 100);
  
  // Schedule drama at hour 20 for 2 hours
  scheduleProgram(state, 20, drama.id, 2);
  
  // Air 3 episodes
  for (let i = 0; i < 3; i++) {
    advanceDay(state, () => .5);
    assert.ok(drama.freshness >= 70); // stays fresh while actively airing first run
  }
  
  // 4th day is the finale!
  const finaleDay = advanceDay(state, () => .5);
  assert.ok(finaleDay.completed.includes(drama.title));
  assert.equal(drama.runs, 4);
  assert.equal(drama.completedRuns, 1);
  assert.equal(drama.maxFreshness, 80); // degraded ceiling: cannot recover to 100!
  assert.ok(drama.freshness <= 30); // sharp drop down upon finale!
  const droppedFreshness = drama.freshness;
  
  // Day after finale: off-air resting in vault
  advanceDay(state, () => .5);
  assert.equal(drama.freshness, droppedFreshness + 2); // recovers +2%
  
  // Advance 45 days while off-air
  for (let i = 0; i < 45; i++) {
    advanceDay(state, () => .5);
  }
  // Freshness has recovered, but CANNOT exceed maxFreshness (80%)!
  assert.equal(drama.freshness, 80);
  assert.notEqual(drama.freshness, 100); // cannot recover to original 100%!
  
  // Can start a rerun cycle
  assert.ok(canReplayProgram(drama, state.day));
  startProgramReplay(state, drama.id);
  assert.equal(drama.replayCount, 1);
  assert.equal(drama.replayEndRuns, 8);
  
  // Schedule and air 4 more episodes (replay cycle)
  scheduleProgram(state, 20, drama.id, 2);
  for (let i = 0; i < 4; i++) {
    advanceDay(state, () => .5);
  }
  assert.equal(drama.runs, 8);
  assert.equal(drama.completedRuns, 2);
  assert.equal(drama.maxFreshness, 64); // degraded further: 80 * 0.8 = 64
  assert.ok(drama.freshness <= 25); // drops down again!
});

test('acquisition market contains diverse foreign dramas and competitors actively acquire titles', () => {
  const listings = catalogForMonth(1);
  const korean = listings.filter(p => p.group === 'korean');
  const japanese = listings.filter(p => p.group === 'japanese');
  const taiwan = listings.filter(p => p.group === 'taiwan');
  const western = listings.filter(p => p.group === 'western');
  const chinese = listings.filter(p => p.group === 'chinese');

  assert.ok(korean.length >= 4);
  assert.ok(japanese.length >= 4);
  assert.ok(taiwan.length >= 3);
  assert.ok(western.length >= 3);
  assert.ok(chinese.length >= 3);

  assert.equal(korean[0].origin, '韓國');
  assert.equal(japanese[0].origin, '日本');
  assert.equal(taiwan[0].origin, '台灣');
  assert.equal(western[0].origin, '歐美');
  assert.equal(chinese[0].origin, '內地');

  // Competitor purchases
  const state = newGame();
  assert.ok(state.rivalPurchases.length >= 2);
  const cityBuy = state.rivalPurchases.find(r => r.rivalId === 'city');
  assert.ok(cityBuy);
  assert.ok(cityBuy.title);

  // Player cannot buy title acquired by competitor
  assert.throws(() => buyProgram(state, cityBuy.marketItemId), /已\S*買入/);

  // Competitor airs acquired hit in prime slot (21:00-23:00)
  const cityShow = rivalAtHour(state, state.rivals[0], 21, 1);
  assert.equal(cityShow.title, cityBuy.title);
  assert.ok(cityShow.rating >= cityBuy.rating);
});

test('license expiration does not repeatedly halt advanceQuarter on subsequent days', () => {
  const state = newGame();
  const film = state.library.find(p => p.id === 'start-film');
  // Expires at day 181
  state.day = 180;
  const day180 = advanceDay(state, () => .5);
  // On day 180 (moving to 181), film newly expires
  assert.ok(day180.expired.includes(film.title));

  // Next day (day 181 moving to 182)
  const day181 = advanceDay(state, () => .5);
  // Must NOT report as expired again!
  assert.equal(day181.expired.length, 0);

  // Fast forward should proceed through quarter without stopping every day on expired license
  dismissMonthResult(state);
  dismissCeremony(state);
  advanceQuarter(state, () => .5);
  // It advanced multiple days rather than halting immediately on 182!
  assert.ok(state.day > 183);
});

test('children programme production generates correct titles, premiere profiles, and afternoon slot performance', () => {
  const state = newGame();
  const quote = productionQuote(state, { kind: 'children', topic: '益智遊戲', budgetId: 'standard', episodeHours: 1, episodeCount: 8 });
  assert.ok(quote.total > 0);
  const show = produce(state, { kind: 'children', topic: '益智遊戲', budgetId: 'standard', episodeHours: 1, episodeCount: 8 }, () => 0.5);
  assert.equal(show.kind, 'children');
  assert.ok(show.title.includes('益智遊戲小天地'));
  assert.equal(show.category, '兒童節目');

  // Schedule in afternoon slot (16:00) vs night slot (22:00)
  scheduleProgram(state, 16, show.id, 1, { days: [0] });
  assert.equal(state.schedule.find(b => b.programId === show.id).start, 16);

  // Air on Monday (day 1, weekday 0)
  state.day = 1;
  const dayResult = advanceDay(state, () => 0.5);
  const hour16 = dayResult.hours[16];
  assert.ok(hour16);
  assert.equal(hour16.title, show.title);
  assert.ok(hour16.rating > 0);
});

test('one-off events and movies scheduled with once: true air once then automatically vacate their slot', () => {
  const state = newGame();
  const contest = produce(state, { kind: 'contest', topic: '全城歌唱賽', budgetId: 'standard', episodeHours: 2, styleId: 'mainstream' }, () => 0.5);
  assert.equal(contest.episodes, 1);

  // Schedule on Tuesday (weekday 1) with once: true
  scheduleProgram(state, 20, contest.id, 2, { days: [1], once: true });
  const block = state.schedule.find(b => b.programId === contest.id);
  assert.ok(block);
  assert.equal(block.once, true);

  // Day 1 (Monday, weekday 0): does not air yet, block remains
  state.day = 1;
  advanceDay(state, () => 0.5);
  assert.ok(state.schedule.some(b => b.programId === contest.id));

  // Day 2 (Tuesday, weekday 1): airs once!
  state.day = 2;
  const day2 = advanceDay(state, () => 0.5);
  assert.ok(day2.hours[20].title.includes('全城歌唱賽'));

  // After airing, the block is automatically removed from schedule!
  assert.equal(state.schedule.some(b => b.programId === contest.id), false);
  assert.equal(programAtHour(state, 20, 9), undefined); // On next Tuesday (day 9), slot is clear
});

test('active catalog license prevents duplicate purchases in acquisition market', () => {
  const state = newGame();
  const listing = catalogForMonth(state.day).find(p => p.title === '東張西望') || catalogForMonth(state.day).find(p => p.kind === 'catalog' || !p.id.startsWith('viu-original-'));
  assert.ok(listing);

  // Buy for 180 days
  const bought = buyProgram(state, listing.id, 180);
  assert.equal(bought.title, listing.title);
  assert.equal(bought.licenseDays, 180);

  // Attempting to buy the same program again while license is active must throw
  assert.throws(() => buyProgram(state, listing.id, 180), /已在片庫|已經入庫/);

  // Even if market month advances (e.g. month 1 where listing might have a prefixed ID), active license blocks re-buying by title
  state.day = 31;
  const nextMonthListing = catalogForMonth(31).find(p => p.title === bought.title);
  if (nextMonthListing) {
    assert.throws(() => buyProgram(state, nextMonthListing.id, 180), /已在片庫.*播映權仍有效/);
  }
});

test('acquisition market rotation never repeats titles within any single 12-month (360-day) game year', () => {
  const seenTitles = new Map();
  let duplicates = 0;
  for (let m = 0; m < 12; m++) {
    const listings = catalogForQuarter(m).filter(p => !p.id.startsWith('viu-original-'));
    assert.ok(listings.length >= 35, `Month ${m} should have at least 35 rotating titles`);
    for (const item of listings) {
      if (seenTitles.has(item.title)) {
        duplicates++;
      }
      seenTitles.set(item.title, m);
    }
  }
  assert.equal(duplicates, 0, 'Rotating acquisition market titles must strictly never repeat within 12 months');
});

test('production supports custom titles, title suggestions, new categories, and up to 100 episodes', () => {
  const state = newGame();

  // Test suggestion generator
  const suggestions = generateSuggestedTitles('sitcom', '處境劇');
  assert.ok(suggestions.length >= 4);

  // Test custom title
  const customSitcom = produce(state, {
    kind: 'sitcom',
    topic: '辦公室日常',
    budgetId: 'standard',
    episodeHours: 1,
    episodeCount: 100,
    styleId: 'mainstream',
    customTitle: '自訂瘋狂辦公室'
  }, () => 0.5);
  assert.equal(customSitcom.title, '自訂瘋狂辦公室');
  assert.equal(customSitcom.episodes, 100);
  assert.equal(customSitcom.kind, 'sitcom');

  // Test 100 episodes supported in EPISODE_COUNTS
  assert.ok(EPISODE_COUNTS.includes(100));

  // Test other new kinds: talkshow, reality, travel, music
  const talkshow = produce(state, { kind: 'talkshow', topic: '星級專訪', budgetId: 'lean', episodeHours: 1, episodeCount: 12 }, () => 0.5);
  assert.equal(talkshow.kind, 'talkshow');

  const reality = produce(state, { kind: 'reality', topic: '求職生存', budgetId: 'standard', episodeHours: 2, episodeCount: 8 }, () => 0.5);
  assert.equal(reality.kind, 'reality');

  const travel = produce(state, { kind: 'travel', topic: '日韓秘境', budgetId: 'standard', episodeHours: 1, episodeCount: 12 }, () => 0.5);
  assert.equal(travel.kind, 'travel');

  const music = produce(state, { kind: 'music', topic: '流行金曲', budgetId: 'premium', episodeHours: 2, episodeCount: 4 }, () => 0.5);
  assert.equal(music.kind, 'music');
});

test('multi-event sports bidding supports concurrent tournaments and targeted sealed bids', () => {
  const state = newGame();
  const activeEvents = activeBiddingEvents(state);
  assert.ok(activeEvents.length >= 2, 'Should offer multiple upcoming sports tournaments');

  // Submit sealed bid for specific tournament
  const targetEvent = activeEvents[0];
  const floorBid = targetEvent.floor + 500_000;
  submitBid(state, floorBid, targetEvent.id);
  assert.equal(targetEvent.playerBid, floorBid);

  // Another tournament can also be bid concurrently
  if (activeEvents.length >= 2) {
    const secondEvent = activeEvents[1];
    const secondBid = secondEvent.floor + 200_000;
    submitBid(state, secondBid, secondEvent.id);
    assert.equal(secondEvent.playerBid, secondBid);
  }
});

test('audience interactions support reject button, letter dismissal, fan meetings, and audience polls', () => {
  const state = newGame();

  // Add letters of various types
  state.mailbox = [
    { id: 'crit-1', day: 1, type: 'criticism', text: '道具太假', resolved: false },
    { id: 'req-1', day: 2, type: 'request', topic: '商戰', text: '敲碗商戰劇', resolved: false },
    { id: 'gift-1', day: 3, type: 'gift', text: '送上特製戲服', resolved: false },
    {
      id: 'spec-1', day: 4, type: 'ofca', title: '通訊局轉介', text: '接獲投訴',
      options: [{ id: 'opt-1', label: '回應', cost: 10000 }],
      resolved: false
    }
  ];

  // Rejecting criticism does not spend PR money and resolves the letter
  const cashBefore = state.cash;
  const rejectedCrit = rejectLetter(state, 'crit-1');
  assert.equal(rejectedCrit.resolved, true);
  assert.equal(rejectedCrit.resolvedChoice, 'rejected');
  assert.equal(state.cash, cashBefore);

  // Rejecting request resolves it cleanly
  const rejectedReq = rejectLetter(state, 'req-1');
  assert.equal(rejectedReq.resolved, true);
  assert.equal(rejectedReq.resolvedChoice, 'rejected');

  // Dismiss letter removes it from mailbox
  const removed = dismissLetter(state, 'crit-1');
  assert.equal(removed.id, 'crit-1');
  assert.equal(state.mailbox.some(l => l.id === 'crit-1'), false);

  // Hold Fan Meeting
  const fansBefore = state.fans;
  const fm = holdFanMeeting(state);
  assert.ok(state.fans > fansBefore);
  assert.equal(state.lastFanMeetingDay, state.day);
  // Attempting to hold another fan meeting immediately is blocked by cooldown
  assert.throws(() => holdFanMeeting(state), /冷卻中/);

  // Launch Audience Poll
  const poll = launchAudiencePoll(state, () => 0.5);
  assert.ok(poll.topic);
  assert.equal(state.audienceBrief, poll.topic);
});

test('Premier League and Champions League matchdays strictly follow Asian real-world broadcasting times without clashing', () => {
  const state = newGame();
  const plEvent = state.events.find(e => e.id === 'pl-2028');
  const uclEvent = state.events.find(e => e.id === 'ucl-2028');
  assert.ok(plEvent, 'PL event exists');
  assert.ok(uclEvent, 'UCL event exists');

  const plCfg = getSportsConfig(plEvent);
  const uclCfg = getSportsConfig(uclEvent);

  // 1. Config validation
  assert.equal(plCfg.type, 'pl');
  assert.deepEqual(plCfg.weekendDays, [5, 6]);
  assert.deepEqual(plCfg.midweekDays, [1, 2]);

  assert.equal(uclCfg.type, 'ucl');
  assert.deepEqual(uclCfg.midweekDays, [1, 2]);
  assert.deepEqual(uclCfg.weekendDays, []);

  // 2. Real-world live window verification (Asia / HK time zone)
  // Premier League: Sat/Sun 19:00 - 01:00 (days 5, 6)
  assert.equal(plCfg.isLiveHour(6, 20), true); // Day 6 is Saturday (weekday 5), 20:00 is live!
  assert.equal(plCfg.isLiveHour(7, 21), true); // Day 7 is Sunday (weekday 6), 21:00 is live!
  assert.equal(plCfg.isLiveHour(6, 14), false); // Saturday afternoon is not live match
  // Premier League midweek: Tue/Wed 01:00 - 05:00 (days 2, 3)
  assert.equal(plCfg.isLiveHour(2, 2), true);  // Day 2 is Tuesday (weekday 1), 02:00 is live midweek express!
  assert.equal(plCfg.isLiveHour(3, 3), true);  // Day 3 is Wednesday (weekday 2), 03:00 is live!
  // Premier League non-matchdays: Thursday (Day 4), Monday (Day 1), Friday (Day 5) have NO live matches
  assert.equal(plCfg.isLiveHour(4, 20), false); // Thursday has no PL live matches!
  assert.equal(plCfg.isLiveHour(1, 20), false); // Monday has no PL live matches!
  assert.equal(plCfg.isLiveHour(5, 20), false); // Friday has no PL live matches!

  // Champions League: strictly Tue/Wed 01:00 - 05:00
  assert.equal(uclCfg.isLiveHour(2, 2), true);  // Tuesday 02:00 is live UCL!
  assert.equal(uclCfg.isLiveHour(3, 3), true);  // Wednesday 03:00 is live UCL!
  assert.equal(uclCfg.isLiveHour(6, 20), false); // UCL NEVER happens on Saturday weekend!
  assert.equal(uclCfg.isLiveHour(7, 20), false); // UCL NEVER happens on Sunday weekend!
  assert.equal(uclCfg.isLiveHour(4, 2), false);  // UCL NEVER happens on Thursday!

  // 3. Auto-scheduling verification
  // Bid and win Premier League
  plEvent.quarter = state.quarter;
  plEvent.playerBid = plEvent.floor * 2;
  resolveAuction(state, plEvent, () => 0.1);
  assert.equal(plEvent.winner, '你的電視台');

  // Verify that PL auto-schedule sets weekend 19:00-24:00 and Tue/Wed 01:00-04:00
  const plBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}`);
  assert.ok(plBlocks.length >= 1, 'PL blocks scheduled');
  const weekendBlock = plBlocks.find(b => daysForBlock(b).includes(5) && daysForBlock(b).includes(6));
  assert.ok(weekendBlock, 'Weekend PL block exists');
  assert.equal(weekendBlock.start, 19);
  assert.equal(weekendBlock.duration, 5);

  // Crucial check: On Thursday (weekday 3), NO PL block is active!
  const thursdayBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 3));
  assert.equal(thursdayBlocks.length, 0, 'Premier League must NOT run on Thursday!');

  // Monday (weekday 0) and Friday (weekday 4) also have no PL blocks
  const mondayBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 0));
  assert.equal(mondayBlocks.length, 0, 'Premier League must NOT run on Monday!');

  // 4. Coexistence with Champions League: Win UCL as well
  uclEvent.quarter = state.quarter;
  uclEvent.playerBid = uclEvent.floor * 2;
  resolveAuction(state, uclEvent, () => 0.1);
  assert.equal(uclEvent.winner, '你的電視台');

  // UCL should have Tue/Wed 01:00 - 05:00
  const uclBlocks = state.schedule.filter(b => b.programId === `event:${uclEvent.id}`);
  assert.ok(uclBlocks.length >= 1, 'UCL blocks scheduled');
  const uclMain = uclBlocks[0];
  assert.deepEqual(daysForBlock(uclMain), [1, 2]);
  assert.equal(uclMain.start, 1);
  assert.equal(uclMain.duration, 4);

  // Zero collision between PL weekend and UCL midweek!
  const plWeekend = state.schedule.find(b => b.programId === `event:${plEvent.id}` && daysForBlock(b).includes(5));
  assert.ok(plWeekend, 'PL weekend block is intact');
  const hasClash = daysForBlock(plWeekend).some(d => daysForBlock(uclMain).includes(d));
  assert.equal(hasClash, false, 'PL weekend and UCL midweek must have zero overlap');

  // 4b. Reverse bidding order: Win UCL first, then win PL
  const state2 = newGame();
  const pl2 = state2.events.find(e => e.id === 'pl-2028');
  const ucl2 = state2.events.find(e => e.id === 'ucl-2028');
  ucl2.quarter = state2.quarter;
  ucl2.playerBid = ucl2.floor * 2;
  resolveAuction(state2, ucl2, () => 0.1);
  assert.equal(ucl2.winner, '你的電視台');

  pl2.quarter = state2.quarter;
  pl2.playerBid = pl2.floor * 2;
  resolveAuction(state2, pl2, () => 0.1);
  assert.equal(pl2.winner, '你的電視台');

  const ucl2Block = state2.schedule.find(b => b.programId === `event:${ucl2.id}`);
  assert.ok(ucl2Block, 'UCL preserved on Tue/Wed');
  assert.deepEqual(daysForBlock(ucl2Block), [1, 2]);
  const pl2Weekend = state2.schedule.find(b => b.programId === `event:${pl2.id}` && daysForBlock(b).includes(5));
  assert.ok(pl2Weekend, 'PL weekend scheduled on Sat/Sun');

  // 5. Peak live rating verification during live match window
  // On Saturday (Day 6), advance day and verify PL live rating is 95+
  state.day = 6; // Saturday (weekday 5)
  const satReport = advanceDay(state, () => 0.5);
  const plSatHour = satReport.hours[20];
  assert.equal(plSatHour.title, plEvent.name);
  assert.ok(plSatHour.rating >= 95, `Live PL rating on Saturday should be 95+, got ${plSatHour.rating}`);
  assert.ok(plSatHour.revenue > 0, 'Generates strong advertising revenue');
});

test('legacy 7-day sports saves migrate to realistic matchdays and clear non-matchday slots like Thursday', () => {
  const state = newGame();
  const plEvent = state.events.find(e => e.id === 'pl-2028');
  plEvent.quarter = state.quarter;
  plEvent.winner = '你的電視台';
  plEvent.resolved = true;

  // Simulate old legacy save where PL was placed 18:00-02:00 every day [0,1,2,3,4,5,6]
  state.schedule = [
    { start: 18, duration: 8, programId: `event:${plEvent.id}`, days: [0, 1, 2, 3, 4, 5, 6] }
  ];

  // Run migration
  migrateLegacyLicenses(state);

  // Verification:
  // 1. Thursday (weekday 3) should have NO PL blocks
  const thursdayAiring = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 3));
  assert.equal(thursdayAiring.length, 0, 'Thursday (Day 451) must be cleared of sports blocks');

  // 2. Monday (0) and Friday (4) should also have NO PL blocks
  const fridayAiring = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 4));
  assert.equal(fridayAiring.length, 0, 'Friday must be cleared of sports blocks');

  // 3. Saturday and Sunday should have the weekend PL slot (19:00 - 24:00)
  const satAiring = state.schedule.find(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 5));
  assert.ok(satAiring, 'Saturday has PL');
  assert.equal(satAiring.start, 19);
  assert.equal(satAiring.duration, 5);

  // 4. Tue and Wed have the midweek express slot (01:00 - 04:00)
  const tueAiring = state.schedule.find(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 1));
  assert.ok(tueAiring, 'Tuesday has PL midweek');
  assert.equal(tueAiring.start, 1);
  assert.equal(tueAiring.duration, 3);
});



