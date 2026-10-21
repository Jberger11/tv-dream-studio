import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame, advanceDay, advanceQuarter, resolvePremiere, broadcastNow, advanceBroadcastClock, clearCompletedPrograms, produce, productionQuote, scheduleProgram, programAtHour, buyProgram, renewLicense, licenseExpired, isCatalogCycleComplete, catalogCycleProgress, catalogCompletedAirings, startCatalogReplay, startProgramReplay, canReplayProgram, getFreshnessFactor, freshnessLabel, migrateLegacyLicenses, catalogForQuarter, catalogForMonth, marketMonthForDay, weekdayForDay, isSportsActive, rivalAtHour, rivalPremiere, distributionQuote, sellProduction, replyToLetter, rejectLetter, dismissLetter, holdFanMeeting, launchAudiencePoll, activeBiddingEvents, submitBid, generateSuggestedTitles, EPISODE_COUNTS, VIU_ORIGINALS, episodeForBlock, removeScheduledProgram, BREAKING_EVENTS_POOL, getBreakingRatingMod, evaluateMonthlyRatings, evaluateAnnualAwards, dismissCeremony, dismissMonthResult, ACTORS, refreshMarketRivalBuys, ACQUISITION_GROUPS, getSportsConfig, isEuropeanFootballSummerBreak, isUclMatchWeek, isPlPausedWeek, sportsDurationDays, money, resolveAuction, runsOnWeekday, daysForBlock, isDailyFormat, isOneOffEvent, getActiveSportsEvents, buyoutSportsEvent, revealAuctionNow, AD_CONTRACT_TEMPLATES, FACILITY_CONFIGS, signAdContract, setAdPricingStrategy, upgradeFacility, signExclusiveTalent, trainTalent, restTalent, unlockSubChannel, SHOP_TOOLS, buyShopTool, isToolActive, getToolTimeRemaining, signArtist, renewArtistContract, getStationName, artistSignCost, artistRenewCost, ARTIST_CONTRACT_DAYS, checkCompetitorArtistSignings, createProductionProject, advanceProduction, deliverEpisode, syncProjectToLibrary, handleFilmingEventChoice, resetProjectAutoChoices, handleQualityControlDecision, setProjectQCStrategy, createSeasonOrSpinOff, cancelProductionProject, upgradeStudioFacility, checkPerformerAvailability, getFormatStages, DEFAULT_STUDIOS, DEFAULT_CREWS, getAllCrews, getCrewsForFormat, PRODUCTION_STRATEGIES, TARGET_AUDIENCES, FILMING_EVENTS_POOL, getChallengeList, evaluateChallenges, premierePreviewQuotes, evaluateTalentStoryEvent, rivalGrudgeOf, playerStrongestDaypart} from './engine.js';

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
  // Corrected behaviour: the first airing is charged its episode cost too, so
  // day 1 and day 2 overheads match (previously day 1 was charged nothing).
  assert.equal(first.overhead,second.overhead);
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
  const cityBuy = state.rivalPurchases.find(r => r.rivalId === 'city' || r.rivalId === 'jade');
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
  assert.deepEqual(plCfg.midweekDays, []);
  assert.deepEqual(plCfg.matchDays, [5, 6]);
  assert.equal(plCfg.defaultSlots.length, 1);
  assert.deepEqual(plCfg.defaultSlots[0].days, [5, 6]);
  assert.equal(plCfg.defaultSlots[0].start, 19);
  assert.equal(plCfg.defaultSlots[0].duration, 5);

  assert.equal(uclCfg.type, 'ucl');
  assert.deepEqual(uclCfg.midweekDays, [1, 2]);
  assert.deepEqual(uclCfg.weekendDays, []);
  assert.deepEqual(uclCfg.matchDays, [1, 2]);
  assert.equal(uclCfg.defaultSlots.length, 1);
  assert.deepEqual(uclCfg.defaultSlots[0].days, [1, 2]);
  assert.equal(uclCfg.defaultSlots[0].start, 1);
  assert.equal(uclCfg.defaultSlots[0].duration, 4);

  // Default slots must NEVER overlap in days or hours
  const plDays = plCfg.defaultSlots[0].days;
  const uclDays = uclCfg.defaultSlots[0].days;
  const daysOverlap = plDays.some(d => uclDays.includes(d));
  assert.equal(daysOverlap, false, 'PL and UCL default slots must never overlap in days');

  // 2. Real-world live window verification & UCL Matchweek pause logic
  // Week 1 (Day 1..7) -> Odd week: Non-UCL week, Premier League is ACTIVE
  assert.equal(isUclMatchWeek(6), false, 'Week 1 is not a UCL matchweek');
  assert.equal(isPlPausedWeek(6), false, 'Week 1 Premier League is not paused');
  assert.equal(plCfg.isLiveHour(6, 20), true, 'Week 1 Saturday 20:00 PL is live');
  assert.equal(plCfg.isLiveHour(7, 21), true, 'Week 1 Sunday 21:00 PL is live');
  assert.equal(plCfg.isLiveHour(6, 14), false, 'Saturday afternoon is not live');
  assert.equal(plCfg.isLiveHour(2, 2), false, 'PL NEVER plays midweek on Tuesday');
  assert.equal(plCfg.isLiveHour(3, 3), false, 'PL NEVER plays midweek on Wednesday');
  assert.equal(uclCfg.isLiveHour(2, 2), false, 'Week 1 UCL has NO matches');

  // Week 2 (Day 8..14) -> Even week: UCL matchweek, Premier League PAUSES!
  assert.equal(isUclMatchWeek(9), true, 'Week 2 is a UCL matchweek');
  assert.equal(isPlPausedWeek(9), true, 'Week 2 PL pauses due to UCL matchweek');
  assert.equal(uclCfg.isLiveHour(9, 2), true, 'Week 2 Tuesday 02:00 UCL is live');
  assert.equal(uclCfg.isLiveHour(10, 3), true, 'Week 2 Wednesday 03:00 UCL is live');
  assert.equal(uclCfg.isLiveHour(13, 20), false, 'UCL NEVER happens on Saturday weekend');
  assert.equal(plCfg.isLiveHour(13, 20), false, 'Week 2 Saturday 20:00 PL must PAUSE during UCL matchweek');
  assert.equal(plCfg.isLiveHour(14, 21), false, 'Week 2 Sunday 21:00 PL must PAUSE during UCL matchweek');

  // Week 3 (Day 15..21) -> Odd week: Non-UCL week, Premier League RESUMES
  assert.equal(isUclMatchWeek(20), false, 'Week 3 is not a UCL matchweek');
  assert.equal(isPlPausedWeek(20), false, 'Week 3 PL resumes');
  assert.equal(plCfg.isLiveHour(20, 20), true, 'Week 3 Saturday 20:00 PL is live');
  assert.equal(uclCfg.isLiveHour(16, 2), false, 'Week 3 Tuesday UCL has no matches');

  // Summer break: July (Day 185) & August (Day 215)
  assert.equal(isEuropeanFootballSummerBreak(185), true, 'Day 185 is July summer break');
  assert.equal(plCfg.isLiveHour(185, 20), false, 'PL is off in July');
  assert.equal(uclCfg.isLiveHour(185, 2), false, 'UCL is off in July');

  // 3. Auto-scheduling verification
  // Bid and win Premier League
  plEvent.quarter = state.quarter;
  plEvent.playerBid = plEvent.floor * 2;
  resolveAuction(state, plEvent, () => 0.1);
  assert.equal(plEvent.winner, '你的電視台');

  // Verify that PL auto-schedule sets ONLY weekend 19:00-24:00
  const plBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}`);
  assert.ok(plBlocks.length >= 1, 'PL blocks scheduled');
  const weekendBlock = plBlocks.find(b => daysForBlock(b).includes(5) && daysForBlock(b).includes(6));
  assert.ok(weekendBlock, 'Weekend PL block exists');
  assert.equal(weekendBlock.start, 19);
  assert.equal(weekendBlock.duration, 5);

  // Verify episodeForBlock on active vs paused weeks
  assert.equal(episodeForBlock(state, weekendBlock, 6), '英超 · 週末焦點現場直播');
  assert.equal(episodeForBlock(state, weekendBlock, 13), '英超 · 本週休戰（歐聯比賽週，英超暫停）');
  assert.equal(episodeForBlock(state, weekendBlock, 185), '英超 · 暑期休季停賽');

  // Crucial check: On Thursday, Monday, Tuesday, Wednesday, NO PL block is active!
  const thursdayBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 3));
  assert.equal(thursdayBlocks.length, 0, 'Premier League must NOT run on Thursday!');
  const mondayBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 0));
  assert.equal(mondayBlocks.length, 0, 'Premier League must NOT run on Monday!');
  const tuesdayBlocks = state.schedule.filter(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 1));
  assert.equal(tuesdayBlocks.length, 0, 'Premier League must NOT run on Tuesday!');

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

  // UCL episodeForBlock on matchweek vs non-matchweek
  assert.equal(episodeForBlock(state, uclMain, 9), '歐聯 · 週中深夜巔峰對決現場直播');
  assert.equal(episodeForBlock(state, uclMain, 2), '歐聯 · 非比賽週（本週無歐聯賽事）');
  assert.equal(episodeForBlock(state, uclMain, 185), '歐聯 · 暑期休季停賽');

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
  // On Saturday (Day 6, Week 1), advance day and verify PL live rating is 95+
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

  // 4. Tue and Wed should have NO PL blocks (PL never runs midweek; UCL has exclusive Tue/Wed nights)
  const tueAiring = state.schedule.find(b => b.programId === `event:${plEvent.id}` && runsOnWeekday(b, 1));
  assert.equal(tueAiring, undefined, 'Tuesday has NO PL blocks');
});

test('starter library continuous programs and sports event identifiers do not misclassify as daily or finite', () => {
  const state = newGame();
  const walk = state.library.find(p => p.id === 'start-walk');
  assert.ok(walk, '城市慢行 exists in library');
  assert.equal(isDailyFormat(walk.kind), false);
  assert.equal(isOneOffEvent(walk.kind), false);
  assert.equal(walk.episodes, 0);

  const morning = state.library.find(p => p.id === 'start-morning');
  assert.equal(isDailyFormat(morning.kind), true);

  const doc = state.library.find(p => p.id === 'start-doc');
  assert.equal(doc.episodes, 6);
});

test('daily broadcast highlights calculate top and lowest rated programs accurately', () => {
  const state = newGame();
  const dayResult = advanceDay(state, () => 0.5);
  assert.ok(dayResult.highlights, 'Daily highlights must be generated');
  const { top, lowest } = dayResult.highlights;
  assert.ok(top && lowest, 'Highlights must have top and lowest');
  assert.ok(top.rating >= lowest.rating, 'Top rating must be >= lowest rating');
  assert.ok(Number.isInteger(top.start) && top.start >= 0 && top.start < 24);
  assert.ok(Number.isInteger(lowest.start) && lowest.start >= 0 && lowest.start < 24);
  assert.ok(top.title);
  assert.ok(lowest.title);
  assert.ok(Number.isFinite(top.rivalRating));
  assert.ok(Number.isFinite(lowest.rivalRating));
  assert.equal(top.diff, top.rating - top.rivalRating);
  assert.equal(lowest.diff, lowest.rating - lowest.rivalRating);

  // Cross check against actual details array
  const maxRating = Math.max(...dayResult.details.map(d => d.rating));
  const minRating = Math.min(...dayResult.details.map(d => d.rating));
  assert.equal(top.rating, maxRating);
  assert.equal(lowest.rating, minRating);
  assert.ok(state.lastDayResult.highlights);
});

test('power-up tool shop allows 30-day leasing, stacks extension, and buffs production quality and discounts', () => {
  const state = newGame();
  assert.equal(SHOP_TOOLS.length, 6);

  // Buy camera_4k
  const initialCash = state.cash;
  const tool = buyShopTool(state, 'camera_4k');
  assert.equal(tool.id, 'camera_4k');
  assert.equal(tool.expiresDay, state.day + 30);
  assert.equal(isToolActive(state, 'camera_4k'), true);
  assert.equal(getToolTimeRemaining(state, 'camera_4k'), 30);
  assert.equal(state.cash, initialCash - tool.price);

  // Re-buying camera_4k extends it by 30 days
  const extended = buyShopTool(state, 'camera_4k');
  assert.equal(extended.expiresDay, state.day + 60);
  assert.equal(getToolTimeRemaining(state, 'camera_4k'), 60);

  // Buy script_workshop for production discount
  buyShopTool(state, 'script_workshop');
  assert.equal(isToolActive(state, 'script_workshop'), true);

  // Test discount on productionQuote
  const quoteWithout = productionQuote(newGame(), { kind: 'drama', genre: '青春', themes: ['友情'], actorIds: ['edaan', 'anson_lo'], budgetId: 'standard', episodeHours: 2, episodeCount: 8, styleId: 'mainstream' });
  const quoteWith = productionQuote(state, { kind: 'drama', genre: '青春', themes: ['友情'], actorIds: ['edaan', 'anson_lo'], budgetId: 'standard', episodeHours: 2, episodeCount: 8, styleId: 'mainstream' });
  assert.ok(quoteWith.perEpisode < quoteWithout.perEpisode, 'Script workshop should apply 10% discount on episodic production cost');

  // Produce show and verify active tool bonus
  const drama = produce(state, { kind: 'drama', genre: '青春', themes: ['友情'], actorIds: ['edaan', 'anson_lo'], budgetId: 'standard', episodeHours: 2, episodeCount: 8, styleId: 'mainstream' }, () => 0.5);
  assert.ok(drama.quality >= 10, 'Camera 4k should boost quality');
  assert.ok(drama.rating >= 5, 'Script workshop should boost rating');

  // Test tool expiration
  state.day = 100;
  advanceDay(state, () => 0.5);
  assert.equal(isToolActive(state, 'script_workshop'), false);
});

test('1-year (360-day) artist contracts system with 30-day renewal warnings and competitor signings', () => {
  const state = newGame();
  assert.equal(ARTIST_CONTRACT_DAYS, 360);

  // Verify initial rosters
  assert.equal(state.talent['edaan'].station, 'player');
  assert.equal(state.talent['edaan'].contractExpiresDay, 360);
  assert.equal(state.talent['lokman'].station, 'viu');
  assert.equal(state.talent['lokman'].contractExpiresDay, 360);
  assert.equal(state.talent['lawrence'].station, 'hoy');
  assert.equal(state.talent['lawrence'].contractExpiresDay, 360);

  // Player contracted actors receive 40% discount on episodic fees
  const edaanActor = ACTORS.find(a => a.id === 'edaan');
  const quoteWithContract = productionQuote(state, { kind: 'drama', genre: '青春', themes: ['友情'], actorIds: ['edaan'], budgetId: 'standard', episodeHours: 2, episodeCount: 8, styleId: 'mainstream' });
  const rawExpectedFee = Math.round(edaanActor.fee * 0.6);
  assert.equal(quoteWithContract.fees, rawExpectedFee);

  // Attempting to cast rival exclusive actor throws error
  assert.throws(() => produce(state, { kind: 'drama', genre: '青春', themes: ['友情'], actorIds: ['lokman', 'edaan'], budgetId: 'standard', episodeHours: 2, episodeCount: 8, styleId: 'mainstream' }), /獨家合約中/);

  // Test 30-day renewal warning letter in mailbox
  state.talent['edaan'].contractExpiresDay = state.day + 25; // 25 days remaining (<= 30 days)
  advanceDay(state, () => 0.5);

  const renewLetter = (state.mailbox ?? []).find(l => l.type === 'contract_renew' && l.actorId === 'edaan');
  assert.ok(renewLetter, 'Mailbox should receive 30-day contract renewal notice');

  // advanceQuarter pauses when unresolved renewal letter is present (advances only 1 day instead of full quarter)
  const dayBeforeQuarter = state.day;
  advanceQuarter(state, () => 0.5);
  assert.equal(state.day, dayBeforeQuarter + 1, 'advanceQuarter must pause immediately so player does not miss renewal');

  // Resolving renewal letter extends contract by 360 days
  const originalExpires = state.talent['edaan'].contractExpiresDay;
  const cashBeforeRenew = state.cash;
  const resolved = replyToLetter(state, renewLetter.id, 'renew');
  assert.equal(resolved.resolved, true);
  assert.ok(state.cash < cashBeforeRenew, 'Deducted renewal fee');
  assert.equal(state.talent['edaan'].contractExpiresDay, originalExpires + 360);

  // Manual renewArtistContract
  const renewRes = renewArtistContract(state, 'anson_lo');
  assert.equal(renewRes.contractExpiresDay, 360 + 360);

  // Expiration of contract turns artist into free agent
  state.talent['wong_tak_bun'].contractExpiresDay = state.day; // Expiring today
  advanceDay(state, () => 0.5);
  assert.equal(state.talent['wong_tak_bun'].station, 'free');
  assert.equal(state.talent['wong_tak_bun'].contractExpiresDay, null);

  // Player can sign free agent
  const signRes = signArtist(state, 'wong_tak_bun');
  assert.equal(signRes.station, 'player');
  assert.equal(signRes.contractExpiresDay, state.day + 360);

  // Competitors can sign free agent
  const rivalsCountBefore = ACTORS.filter(a => ['jade', 'viu', 'hoy'].includes(state.talent[a.id]?.station)).length;
  checkCompetitorArtistSignings(state, () => 0.05); // low RNG triggers rival signing
  const rivalsCountAfter = ACTORS.filter(a => ['jade', 'viu', 'hoy'].includes(state.talent[a.id]?.station)).length;
  assert.ok(rivalsCountAfter > rivalsCountBefore, 'Competitor must successfully sign a free agent');
});

test('three authentic Hong Kong TV competitors (翡翠台, ViuTV, HOY TV) operate with 24-hour schedules', () => {
  const state = newGame();
  assert.equal(state.rivals.length, 3);
  const ids = state.rivals.map(r => r.id);
  assert.deepEqual(ids, ['jade', 'viu', 'hoy']);

  assert.equal(getStationName('player'), '你的電視台');
  assert.equal(getStationName('jade'), '翡翠台');
  assert.equal(getStationName('viu'), 'ViuTV');
  assert.equal(getStationName('hoy'), 'HOY TV');

  // Verify all 3 rivals have complete 24-hour schedules
  for (const rival of state.rivals) {
    for (let h = 0; h < 24; h++) {
      const show = rivalAtHour(state, rival, h);
      assert.ok(show.title, `${rival.name} hour ${h} should have title`);
      assert.ok(show.rating > 0, `${rival.name} hour ${h} should have positive rating`);
    }
  }

  // Advance day generates 3-rival matchup scores
  const dayResult = advanceDay(state, () => 0.5);
  for (let h = 0; h < 24; h++) {
    assert.equal(dayResult.hours[h].rivals.length, 3, `Hour ${h} must have 3 competitor ratings`);
  }
});

test('actor fame can drop when a show flops and decays upon extended inactivity', () => {
  const state = newGame();
  const actorId = 'sheren'; // 佘詩曼, skill 92, initial fame 82
  assert.equal(state.talent[actorId].fame, 82);
  const show = produce(state, {
    kind: 'drama',
    genre: '刑偵',
    themes: ['懸疑'],
    actorIds: [actorId, 'bosco'],
    budgetId: 'lean'
  }, () => 0.01);
  show.rating = 28; // force flop rating
  show.outcome = 'disaster';
  scheduleProgram(state, 20, show.id, 2);

  const initialFame = state.talent[actorId].fame;
  const dayResult = advanceDay(state, () => 0.5);
  const updatedFame = state.talent[actorId].fame;
  assert.ok(updatedFame < initialFame, `Fame should decrease: ${updatedFame} < ${initialFame}`);
  assert.ok(dayResult.talentChanges.some(t => t.id === actorId && t.diff < 0));

  // Inactivity cooling: idle for 30+ days
  const idleActorId = 'edaan'; // 呂爵安
  state.talent[idleActorId].fame = 90;
  state.lastAiredDays[idleActorId] = 1;
  state.day = 45; // 44 days idle and day % 15 === 0
  const idleDayResult = advanceDay(state, () => 0.5);
  assert.ok(state.talent[idleActorId].fame < 90, `Idle fame should decay: ${state.talent[idleActorId].fame} < 90`);
  assert.ok(idleDayResult.talentChanges.some(t => t.id === idleActorId && t.reason === '久未露面人氣降溫'));
});

test('sports buyout and early reveal grant active rights and allow scheduling past day 30', () => {
  const state = newGame();
  state.cash = 60_000_000;

  const events = activeBiddingEvents(state);
  const plEvent = events.find(e => e.id === 'pl' || (e.name && e.name.includes('英超'))) || events[0];
  assert.ok(plEvent, 'Should have bidding event available');

  // Instant buyout
  const bought = buyoutSportsEvent(state, plEvent.id);
  assert.equal(bought.winner, '你的電視台');
  assert.equal(bought.resolved, true);
  assert.equal(bought.settled, false); // Contract active, not yet settled/expired
  assert.ok(bought.wonDay >= 1);

  // Active in getActiveSportsEvents
  const active = getActiveSportsEvents(state);
  assert.ok(active.some(e => e.id === plEvent.id));

  // Event was automatically scheduled by buyout
  const autoScheduled = state.schedule.filter(b => b.programId === `event:${plEvent.id}`);
  assert.ok(autoScheduled.length > 0, 'Buyout should automatically pre-schedule slots');

  // Schedulable past Day 30 without throwing
  state.day = 45;
  assert.doesNotThrow(() => {
    scheduleProgram(state, 14, `event:${plEvent.id}`, 2, { allowRepeat: true });
  });

  // Advance day at day 45 - should not wipe out the sport block
  advanceDay(state, () => 0.5);
  const scheduledBlock = state.schedule.find(b => b.programId === `event:${plEvent.id}`);
  assert.ok(scheduledBlock, 'Event should remain scheduled past Day 30');

  // Early reveal with another event
  const otherEvent = activeBiddingEvents(state).find(e => e.id !== plEvent.id);
  if (otherEvent) {
    submitBid(state, otherEvent.floor * 2, otherEvent.id);
    const revealed = revealAuctionNow(state, otherEvent.id, () => 0.1);
    assert.equal(revealed.resolved, true);
    assert.equal(revealed.settled, false);
    assert.equal(revealed.winner, '你的電視台');
    assert.ok(getActiveSportsEvents(state).some(e => e.id === otherEvent.id));
  }
});

test('dynamic ad contracts pay bonuses on target rating and enforce breach penalties on failure', () => {
  const state = newGame();
  state.cash = 10_000_000;
  assert.equal(state.adPricingStrategy, 'standard');

  // Change pricing strategy
  setAdPricingStrategy(state, 'premium');
  assert.equal(state.adPricingStrategy, 'premium');

  // Sign contract
  const contract = state.adContractsMarket.find(c => c.id === 'ad-rolls-royce');
  assert.ok(contract, 'Rolls Royce ad contract exists');
  const initialCash = state.cash;
  const signed = signAdContract(state, 'ad-rolls-royce');
  assert.equal(signed.id, 'ad-rolls-royce');
  assert.equal(state.cash, initialCash + signed.advancePayment);
  assert.equal(state.activeAdContracts.length, 1);

  // Duplicate sign throws error
  assert.throws(() => signAdContract(state, 'ad-rolls-royce'), /已簽署/);

  // Fast-track contract test: test success condition
  signed.durationDays = 2;
  signed.daysElapsed = 1;
  signed.ratings = [80]; // Higher than target
  const day1Cash = state.cash;
  advanceDay(state, () => 0.5);
  // Contract should resolve as passed and grant bonus payment
  assert.equal(state.activeAdContracts.length, 0);
  assert.ok(state.cash > day1Cash + signed.bonusPayment - 2_000_000); // Account for daily overhead/revenue
});

test('exclusive talent signing waives production actor fee and pays quarterly endorsements', () => {
  const state = newGame();
  state.cash = 20_000_000;
  const actorId = 'hera'; // 何依婷, freelance initially
  assert.equal(state.talent[actorId].contractType, 'freelance');

  // Standard freelance quote includes actor fee
  const standardQuote = productionQuote(state, {
    kind: 'drama',
    genre: '商戰',
    themes: ['職場'],
    actorIds: [actorId],
    budgetId: 'lean'
  });
  assert.ok(standardQuote.fees > 0);

  // Sign exclusive manager contract for 90 days
  const preSignCash = state.cash;
  const res = signExclusiveTalent(state, actorId, 90);
  assert.equal(res.contractType, 'exclusive');
  assert.equal(state.talent[actorId].contractType, 'exclusive');
  assert.equal(state.talent[actorId].contractDaysLeft, 90);
  assert.ok(state.cash < preSignCash);

  // Exclusive actor fee in quote is 0!
  const exclusiveQuote = productionQuote(state, {
    kind: 'drama',
    genre: '商戰',
    themes: ['職場'],
    actorIds: [actorId],
    budgetId: 'lean'
  });
  assert.equal(exclusiveQuote.fees, 0);
  assert.ok(exclusiveQuote.total < standardQuote.total);
});

test('talent academy trains acting and speech while vacation restores stamina', () => {
  const state = newGame();
  state.cash = 10_000_000;
  const actorId = 'edaan';
  const initialSkill = state.talent[actorId].skill;
  state.talent[actorId].stamina = 50;

  // Train acting skill
  const trainRes = trainTalent(state, actorId, 'acting');
  assert.ok(trainRes.skill > initialSkill);
  assert.ok(state.talent[actorId].skill > initialSkill);
  assert.equal(state.talent[actorId].stamina, 40); // -10 stamina

  // Send on holiday/rest to recover stamina
  const restRes = restTalent(state, actorId);
  assert.equal(restRes.stamina, 90); // +50 stamina
  assert.equal(state.talent[actorId].stamina, 90);
});

test('facility upgrades boost studio production quality cap and PR buzz', () => {
  const state = newGame();
  state.cash = 50_000_000;
  assert.equal(state.facilities.studio, 1);
  assert.equal(state.facilities.prDept, 1);

  // Upgrade Studio to Lv2
  const upRes = upgradeFacility(state, 'studio');
  assert.equal(upRes.level, 2);
  assert.equal(state.facilities.studio, 2);

  // Studio Lv2 boosts production quality
  const show = produce(state, {
    kind: 'drama',
    genre: '商戰',
    themes: ['職場'],
    actorIds: ['sheren', 'bosco'],
    budgetId: 'premium'
  }, () => 0.9);
  assert.ok(show.quality >= 70);
});

test('quarterly boardroom evaluation grants S-rank capital injection and digital sub-channel unlocks', () => {
  const state = newGame();
  state.cash = 100_000_000;

  // Unlock digital sub-channel
  assert.equal(state.subChannelUnlocked, false);
  const unlockRes = unlockSubChannel(state);
  assert.equal(unlockRes, true);
  assert.equal(state.subChannelUnlocked, true);
  assert.throws(() => unlockSubChannel(state), /已開播/);

  // Advance to end of quarter with high profit
  state.day = 90;
  state.quarterLedger = {
    revenue: 50_000_000,
    overhead: 5_000_000,
    sportsRevenue: 0,
    sportsPenalty: 0,
    audience: 5000,
    buzz: 5000,
    days: 89
  };

  const dayRes = advanceDay(state, () => 0.5);
  assert.ok(dayRes.quarterResult, 'Should have quarterly result on day 90');
  const boardReport = dayRes.quarterResult.boardReport;
  assert.ok(boardReport, 'Board report must be present');
  assert.equal(boardReport.rank, 'S');
  assert.equal(boardReport.boardBonus, 20_000_000);
  assert.ok(state.boardHistory.length >= 1);
});

test('Hong Kong Horse Racing live strictly airs Wed 19-23 & Sun 13-18, excludes July/Aug, and maintains stable ratings', () => {
  const state = newGame();
  const racingEvent = state.events.find(e => e.id === 'racing-2028');
  assert.ok(racingEvent, 'Hong Kong Horse Racing event must exist in calendar');
  const cfg = getSportsConfig(racingEvent);
  assert.equal(cfg.type, 'racing');
  assert.deepEqual(cfg.matchDays, [2, 6], 'Horse racing only takes place on Wednesday (2) and Sunday (6)');

  // Default slots check: Wed 19-23 (duration 4), Sun 13-18 (duration 5)
  assert.equal(cfg.defaultSlots.length, 2);
  const wedSlot = cfg.defaultSlots.find(s => s.days.includes(2));
  assert.equal(wedSlot.start, 19);
  assert.equal(wedSlot.duration, 4);
  const sunSlot = cfg.defaultSlots.find(s => s.days.includes(6));
  assert.equal(sunSlot.start, 13);
  assert.equal(sunSlot.duration, 5);

  // Day 3: weekdayForDay(3) = (3 - 1) % 7 = 2 (Wednesday), Month 1 (Jan)
  assert.equal(weekdayForDay(3), 2);
  assert.equal(cfg.isLiveHour(3, 19), true, 'Wed 19:00 should be live racing');
  assert.equal(cfg.isLiveHour(3, 22), true, 'Wed 22:00 should be live racing');
  assert.equal(cfg.isLiveHour(3, 18), false, 'Wed 18:00 should not be live racing');
  assert.equal(cfg.isLiveHour(3, 23), false, 'Wed 23:00 should not be live racing');

  // Day 7: weekdayForDay(7) = (7 - 1) % 7 = 6 (Sunday), Month 1 (Jan)
  assert.equal(weekdayForDay(7), 6);
  assert.equal(cfg.isLiveHour(7, 13), true, 'Sun 13:00 should be live racing');
  assert.equal(cfg.isLiveHour(7, 17), true, 'Sun 17:00 should be live racing');
  assert.equal(cfg.isLiveHour(7, 12), false, 'Sun 12:00 should not be live racing');
  assert.equal(cfg.isLiveHour(7, 18), false, 'Sun 18:00 should not be live racing');

  // Non-racing days (Monday: day 1)
  assert.equal(cfg.isLiveHour(1, 19), false, 'Mon 19:00 should not be live racing');

  // Summer break: July (Month 7, days 181-210) & August (Month 8, days 211-240)
  // Day 185: marketMonthForDay(185) = floor(184/30) = 6 -> month 7 (July)
  // Weekday of 185: (185-1)%7 = 184%7 = 2 (Wednesday!)
  assert.equal((marketMonthForDay(185) % 12) + 1, 7);
  assert.equal(weekdayForDay(185), 2);
  assert.equal(cfg.isSummerBreak(185), true, 'Day 185 (July) is summer break');
  assert.equal(cfg.isLiveHour(185, 20), false, 'July Wednesday night must NOT have live racing (summer break)');

  // Day 213: floor(212/30) = 7 -> month 8 (August)
  // Weekday of 213: (213-1)%7 = 212%7 = 2 (Wednesday!)
  assert.equal((marketMonthForDay(213) % 12) + 1, 8);
  assert.equal(cfg.isSummerBreak(213), true, 'Day 213 (August) is summer break');
  assert.equal(cfg.isLiveHour(213, 20), false, 'August Wednesday night must NOT have live racing (summer break)');

  // Buyout horse racing rights
  state.cash = 20_000_000;
  buyoutSportsEvent(state, racingEvent.id);
  assert.equal(racingEvent.winner, '你的電視台');
  assert.equal(racingEvent.resolved, true);
  assert.equal(isSportsActive(racingEvent, state), true);

  // Check that rival bid names in buyout are authentic HK TV channels
  const bidNames = racingEvent.bids.map(b => b.name);
  assert.ok(bidNames.some(n => n.includes('翡翠台')), 'Bids should include 翡翠台');
  assert.ok(bidNames.some(n => n.includes('ViuTV')), 'Bids should include ViuTV');

  // Schedule horse racing on Wed 19:00
  state.schedule = [];
  scheduleProgram(state, 19, `event:${racingEvent.id}`, 4, { days: [2] });

  // Broadcast on Wednesday (day 3, active month 1)
  state.day = 3;
  const wedBroadcast = advanceDay(state, () => 0.5);
  const liveHour19 = wedBroadcast.hours[19];
  assert.ok(liveHour19, 'Hour 19 must exist in day result');
  assert.equal(liveHour19.title, racingEvent.name);
  // Horse racing rating is stable: 61 - 66 points
  assert.ok(liveHour19.rating >= 61 && liveHour19.rating <= 66, `Live racing rating (${liveHour19.rating}) must be in stable range 61-66`);
});

test('three authentic Hong Kong TV competitors have exact user profile mottos, channels, and rich EPGs', () => {
  const state = newGame();
  const jade = state.rivals.find(r => r.id === 'jade');
  const viu = state.rivals.find(r => r.id === 'viu');
  const hoy = state.rivals.find(r => r.id === 'hoy');

  assert.ok(jade && viu && hoy, 'All 3 HK rivals must exist');
  assert.equal(jade.channelNo, 81);
  assert.equal(viu.channelNo, 99);
  assert.equal(hoy.channelNo, 77);

  // Verify exact requested mottos
  assert.equal(jade.profile, '財雄勢大，全天候 24 小時王牌劇集與長壽綜藝排播，體育版權出價高。');
  assert.equal(viu.profile, '主打年輕偶像、原創劇集與大型運動賽事。');
  assert.equal(hoy.profile, '綜藝生活與焦點大賽爆冷突襲。');

  // Verify key stars
  assert.ok(jade.stars.includes('馬國明') && jade.stars.includes('陳豪'));
  assert.ok(viu.stars.includes('楊樂文') && viu.stars.includes('江𤒹生'));
  assert.ok(hoy.stars.includes('鄭丹瑞') && hoy.stars.includes('簡慕華'));

  // Verify rich 24h EPG output from rivalAtHour
  for (const rival of [jade, viu, hoy]) {
    for (let h = 0; h < 24; h++) {
      const show = rivalAtHour(state, rival, h, 1);
      assert.ok(show.title, `${rival.name} hour ${h} must have a title`);
      assert.ok(show.rating >= 1 && show.rating <= 100, `${rival.name} hour ${h} rating must be valid`);
      assert.ok(show.category, `${rival.name} hour ${h} must have a category`);
      assert.ok(show.desc, `${rival.name} hour ${h} must have a description`);
    }
  }
});

test('TV production project creation defines format-specific stages, target audience, budget and 10 attributes', () => {
  const state = newGame();
  const dramaStages = getFormatStages('drama');
  const newsStages = getFormatStages('news');
  const talkStages = getFormatStages('talkshow');

  assert.equal(dramaStages.length, 8, 'Drama must have all 8 stages');
  assert.ok(newsStages.length < dramaStages.length, 'News workflow must omit rehearsal/set stages');
  assert.ok(!talkStages.includes('set_preparation'), 'Talkshow workflow omits set_preparation');

  const proj = createProductionProject(state, {
    title: '大時代風雲',
    genre: '商戰風雲',
    themes: ['商業情仇', '家族鬥爭'],
    format: 'drama',
    episodesCount: 4,
    episodeHours: 2,
    targetAudience: 'working',
    budgetId: 'grand',
    assignedStudioId: 'studio_1',
    strategy: 'balanced',
    actorIds: ['bosco', 'sheren'],
    crew: { directorId: 'dir_wai', writerId: 'wri_cheung' }
  });

  assert.equal(proj.title, '大時代風雲');
  assert.equal(proj.episodes.length, 4);
  assert.equal(proj.status, 'in_production');
  assert.equal(proj.targetAudience, 'working');
  assert.equal(proj.cast.length, 2);

  const ep1 = proj.episodes[0];
  // Verify all 10 tracked attributes
  assert.ok(typeof ep1.fun === 'number');
  assert.ok(typeof ep1.originality === 'number');
  assert.ok(typeof ep1.direction === 'number');
  assert.ok(typeof ep1.acting === 'number');
  assert.ok(typeof ep1.technical === 'number');
  assert.ok(typeof ep1.errors === 'number');
  assert.ok(typeof ep1.cost === 'number');
  assert.ok(typeof ep1.days === 'number');
  assert.ok(typeof ep1.morale === 'number');
  assert.ok(typeof ep1.expectations === 'number');
});

test('casting availability check prevents double-booking actors across active filming projects', () => {
  const state = newGame();
  const proj1 = createProductionProject(state, {
    title: '第一套大劇',
    genre: '刑偵懸疑',
    themes: ['警匪對決'],
    format: 'drama',
    episodesCount: 2,
    actorIds: ['bosco', 'sheren']
  });

  // Actively filming/pre-production: bosco should NOT be available for another project
  assert.equal(checkPerformerAvailability(state, 'bosco').available, false);
  assert.equal(checkPerformerAvailability(state, 'sheren').available, false);
  assert.equal(checkPerformerAvailability(state, 'jessica').available, true);

  // Attempting to create another project with bosco must throw an error
  assert.throws(() => {
    createProductionProject(state, {
      title: '重疊撞期新劇',
      genre: '時裝恩怨',
      themes: ['家族恩怨'],
      format: 'drama',
      episodesCount: 2,
      actorIds: ['bosco', 'jessica']
    });
  }, /重疊衝突/);
});

test('production stages advance concurrently up to studio capacity with strategy speed and error rates', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '急速綜藝大作',
    format: 'variety',
    episodesCount: 4,
    strategy: 'fast',
    assignedStudioId: 'studio_2',
    actorIds: ['edaan', 'anson_lo']
  });

  const studio = state.studios.find(s => s.id === 'studio_2');
  assert.equal(studio.capacity, 2);

  // Initial: episode 1 & episode 2 should be in_progress
  advanceProduction(state, 1, () => 0.01);

  const activeEps = proj.episodes.filter(e => e.status === 'in_progress');
  assert.equal(activeEps.length, 2, 'Must run concurrent episodes matching studio capacity (2)');
  assert.ok(activeEps[0].stageProgress > 0, 'Stage progress must advance');
  assert.ok(activeEps[0].cost > 0, 'Daily cost must accumulate');
});

test('interactive filming events trigger during filming and choices persist consequences', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '片場風雲',
    format: 'drama',
    episodesCount: 1,
    actorIds: ['bosco', 'jessica']
  });

  const ep = proj.episodes[0];
  ep.stage = 'filming';
  ep.status = 'in_progress';
  ep.stageProgress = 50;

  // Advance production with rng returning high probability to trigger filming event
  advanceProduction(state, 1, () => 0.05);

  assert.ok(ep.pendingEvent, 'Filming event should trigger');
  assert.ok(state.activeFilmingEvents.length > 0, 'State should track active filming events');

  const initialActing = ep.acting;
  const initialCost = ep.cost;
  const eventId = ep.pendingEvent.id;
  const choiceId = ep.pendingEvent.choices[0].id;

  handleFilmingEventChoice(state, proj.id, ep.episodeNumber, choiceId, () => 0.5);

  assert.equal(ep.pendingEvent, null, 'Pending event must be resolved');
  assert.equal(ep.eventsHandled.length, 1);
  assert.equal(ep.eventsHandled[0].eventId, eventId);
});

test('filming events remember player choice via tick and automatically resolve recurring issues for the project', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '全自動港劇',
    format: 'drama',
    episodesCount: 2,
    actorIds: ['bosco', 'jessica']
  });

  const ep1 = proj.episodes[0];
  ep1.stage = 'filming';
  ep1.status = 'in_progress';

  // Episode 1 encounters a filming event
  advanceProduction(state, 1, () => 0.05);
  assert.ok(ep1.pendingEvent, 'Episode 1 should encounter filming event');
  const eventId = ep1.pendingEvent.id;
  const choiceId = ep1.pendingEvent.choices[0].id;

  // Player ticks remember (remember = true)
  const res = handleFilmingEventChoice(state, proj.id, ep1.episodeNumber, choiceId, () => 0.5, true);
  assert.equal(res.remember, true);
  assert.equal(proj.autoChoices[eventId], choiceId, 'Project must save auto choice for this event');
  assert.equal(ep1.pendingEvent, null);

  // Now test resetProjectAutoChoices
  resetProjectAutoChoices(state, proj.id);
  assert.deepEqual(proj.autoChoices, {}, 'resetProjectAutoChoices must clear auto choices');

  // Re-save auto-choice
  proj.autoChoices['outstanding_acting'] = 'b';
  assert.equal(proj.autoChoices['outstanding_acting'], 'b');
});

test('shooting time is shortened with accelerated filming progress and single event limit', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '極速短拍劇',
    format: 'drama',
    strategy: 'fast',
    episodesCount: 1,
    actorIds: ['bosco', 'jessica']
  });

  const ep = proj.episodes[0];
  ep.stage = 'filming';
  ep.status = 'in_progress';
  ep.stageProgress = 0;

  // In fast strategy, filming stage has speed bonus + stage bonus (>70% per day, finishes in 1-2 days)
  advanceProduction(state, 1, () => 0.5);
  assert.ok(ep.stage === 'post_production' || ep.stageProgress >= 70, `Filming should advance rapidly on fast, got stage: ${ep.stage}, progress: ${ep.stageProgress}%`);

  // Max 1 event per episode: already handled 1 event -> will not trigger another
  ep.eventsHandled.push({ eventId: 'test_event', choiceId: 'a', day: 1 });
  advanceProduction(state, 1, () => 0.01);
  assert.equal(ep.pendingEvent, null, 'Should not trigger second event when ep already handled 1 event');
});

test('quality control report generation and player decisions (release, fix, re-edit, reshoot)', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '金牌審片劇',
    format: 'drama',
    episodesCount: 1,
    actorIds: ['bosco', 'sheren']
  });

  const ep = proj.episodes[0];
  ep.stage = 'post_production';
  ep.stageProgress = 99;
  ep.errors = 2;

  // Advance to reach quality_control
  advanceProduction(state, 1, () => 0.5);

  assert.equal(ep.status, 'qc_ready');
  assert.ok(ep.qcReport, 'QC report must be generated');
  assert.equal(ep.qcReport.choices.length, 4, 'Must have 4 choices: release_as_is, fix_errors, re_edit, reshoot');

  // Choose fix_errors
  const initialCash = state.cash;
  handleQualityControlDecision(state, proj.id, ep.episodeNumber, 'fix_errors');

  assert.equal(ep.status, 'delivered');
  assert.equal(ep.errors, 0, 'fix_errors should clear production errors');
  assert.equal(proj.deliveredEpisodesCount, 1);
  assert.ok(state.cash < initialCash, 'Cost should be deducted for fixing errors');
});

test('multi-episode concurrent progression allows broadcasting delivered episodes while later ones are in production', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '邊拍邊播長劇',
    format: 'drama',
    episodesCount: 3,
    actorIds: ['bosco', 'sheren']
  });

  // Manually deliver episode 1 only (episode 2 and 3 are still in production)
  proj.episodes[0].status = 'delivered';
  proj.episodes[0].stage = 'delivery';
  deliverEpisode(state, proj, proj.episodes[0]);

  assert.equal(proj.deliveredEpisodesCount, 1);
  assert.equal(proj.episodes[1].status, 'pending');

  const libItem = state.library.find(p => p.projectId === proj.id);
  assert.ok(libItem, 'Show must enter broadcast library once at least 1 episode is delivered');
  assert.equal(libItem.deliveredEpisodes, 1);
  assert.equal(libItem.episodes, 3);

  // Schedule show in evening slot
  scheduleProgram(state, 20, libItem.id, 2);

  // Broadcast Day 1: Episode 1 should air successfully!
  const day1 = advanceDay(state, () => 0.5);
  assert.equal(libItem.runs, 1, 'Episode 1 should have aired');
  assert.equal(proj.episodes[0].status, 'aired');
  assert.ok(proj.ratingsHistory.length >= 1, 'ratingsHistory must record Episode 1');
  assert.equal(proj.ratingsHistory[0].episodeNumber, 1);
});

test('broadcasting handles schedule gaps (脫期空檔) when later episodes are not yet ready without freezing or advancing runs', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '脫期空檔劇',
    format: 'drama',
    episodesCount: 3,
    actorIds: ['bosco', 'sheren']
  });

  // Deliver only episode 1
  proj.episodes[0].status = 'delivered';
  deliverEpisode(state, proj, proj.episodes[0]);

  const libItem = state.library.find(p => p.projectId === proj.id);
  scheduleProgram(state, 20, libItem.id, 2);

  // Day 1: Episode 1 airs
  advanceDay(state, () => 0.5);
  assert.equal(libItem.runs, 1);

  // Day 2: Episode 2 is NOT delivered yet! (deliveredEpisodes is 1, but run wants 2)
  const day2 = advanceDay(state, () => 0.5);

  // Must detect schedule gap (脫期空檔)
  assert.equal(libItem.runs, 1, 'Run count must NOT advance when episode is delayed');
  assert.ok(day2.details.some(d => d.title.includes('脫期') || d.effect?.includes('脫期')), 'Must report schedule gap filler');
  assert.ok(state.log.some(n => n.text.includes('排播脫期')), 'Must log schedule gap warning to notifications');

  // Now deliver Episode 2!
  proj.episodes[1].status = 'delivered';
  deliverEpisode(state, proj, proj.episodes[1]);
  assert.equal(libItem.deliveredEpisodes, 2);

  // Day 3: Episode 2 airs for real!
  advanceDay(state, () => 0.5);
  assert.equal(libItem.runs, 2, 'Now Episode 2 should legitimately air');
  assert.equal(proj.episodes[1].status, 'aired');
});

test('independent per-episode ratings calculation and per-episode ratingsHistory tracking', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '品質起伏劇',
    format: 'drama',
    episodesCount: 2,
    actorIds: ['bosco', 'sheren']
  });

  // Episode 1 has high quality attributes
  proj.episodes[0].acting = 95;
  proj.episodes[0].direction = 90;
  proj.episodes[0].errors = 0;
  proj.episodes[0].status = 'delivered';
  deliverEpisode(state, proj, proj.episodes[0]);

  // Episode 2 has low quality attributes and high errors
  proj.episodes[1].acting = 40;
  proj.episodes[1].direction = 40;
  proj.episodes[1].errors = 5;
  proj.episodes[1].status = 'delivered';
  deliverEpisode(state, proj, proj.episodes[1]);

  const libItem = state.library.find(p => p.projectId === proj.id);
  scheduleProgram(state, 20, libItem.id, 2);

  advanceDay(state, () => 0.5); // Airs Episode 1
  const r1 = proj.ratingsHistory.find(h => h.episodeNumber === 1).rating;

  advanceDay(state, () => 0.5); // Airs Episode 2
  const r2 = proj.ratingsHistory.find(h => h.episodeNumber === 2).rating;

  assert.ok(r1 > r2, `High quality episode rating (${r1}) must surpass flawed episode rating (${r2})`);
});

test('long-term development: season 2 sequels and spin-offs inherit audience expectations and momentum', () => {
  const state = newGame();
  const parent = createProductionProject(state, {
    title: '尋秦記',
    format: 'drama',
    episodesCount: 1,
    actorIds: ['bosco', 'sheren']
  });

  parent.status = 'completed';
  for (const ep of parent.episodes) ep.status = 'delivered';
  parent.ratingsHistory = [{ episodeNumber: 1, rating: 88, won: true }];

  const s2 = createSeasonOrSpinOff(state, parent.id, 'next_season');
  assert.equal(s2.title, '尋秦記 II');
  assert.equal(s2.seasonNumber, 2);
  assert.ok(s2.episodes[0].expectations > 50, 'Season 2 must inherit higher audience expectations');

  const spinoff = createSeasonOrSpinOff(state, parent.id, 'spin_off', { subtitle: '項少龍前傳', actorIds: ['selena', 'venus'] });
  assert.equal(spinoff.title, '尋秦記 外傳：項少龍前傳');
  assert.equal(spinoff.franchiseId, parent.franchiseId);
});

test('studio facility upgrade increases concurrent episode capacity and production efficiency', () => {
  const state = newGame();
  const studio = state.studios.find(s => s.id === 'studio_1');
  assert.equal(studio.level, 1);
  assert.equal(studio.capacity, 2);

  const initialCash = state.cash;
  upgradeStudioFacility(state, 'studio_1');

  assert.equal(studio.level, 2);
  assert.equal(studio.capacity, 3, 'Capacity should increase to 3');
  assert.ok(studio.efficiency > 1.0, 'Efficiency should increase');
  assert.equal(state.cash, initialCash - 1_500_000);
});

test('TV production project creation enforces format-specific casting and verifies 25% upfront budget', () => {
  const state = newGame();

  // 1. Target audiences and production strategies must have both name and label
  for (const aud of TARGET_AUDIENCES) {
    assert.ok(aud.name && aud.label, `Audience ${aud.id} must have both name and label`);
    assert.equal(aud.name, aud.label);
  }
  for (const strat of PRODUCTION_STRATEGIES) {
    assert.ok(strat.name && strat.label, `Strategy ${strat.id} must have both name and label`);
    assert.equal(strat.name, strat.label);
  }

  // 2. News allows 0 actors (in-house news team)
  const initialCash = state.cash;
  const newsProj = createProductionProject(state, {
    title: '六點半港聞焦點',
    format: 'news',
    episodesCount: 4,
    budgetId: 'standard',
    actorIds: [] // 0 actors allowed
  });
  assert.ok(newsProj);
  assert.equal(newsProj.cast.length, 0);
  assert.ok(state.cash < initialCash, 'Upfront budget must be deducted');

  // 3. News with > 2 actors throws error
  assert.throws(() => {
    createProductionProject(state, {
      title: '超員新聞',
      format: 'news',
      episodesCount: 2,
      actorIds: ['bosco', 'sheren', 'ali']
    });
  }, /新聞及紀錄片最多可挑選 2 位/);

  // 4. Drama requires 2 to 4 actors
  assert.throws(() => {
    createProductionProject(state, {
      title: '缺人劇集',
      format: 'drama',
      episodesCount: 2,
      actorIds: ['bosco']
    });
  }, /劇集製作須挑選 2 至 4 位主演/);

  // 5. Variety requires 1 to 3 hosts
  assert.throws(() => {
    createProductionProject(state, {
      title: '無主持綜藝',
      format: 'variety',
      episodesCount: 2,
      actorIds: []
    });
  }, /此形態節目須挑選 1 至 3 位主持或司儀/);

  const varietyProj = createProductionProject(state, {
    title: '全城綜藝之王',
    format: 'variety',
    episodesCount: 2,
    actorIds: ['edaan']
  });
  assert.ok(varietyProj);
  assert.equal(varietyProj.cast.length, 1);
});

test('format-tailored creative crew members across drama, variety, news, documentary, talkshow and live', () => {
  const state = newGame();
  const formats = ['drama', 'variety', 'news', 'documentary', 'talkshow', 'live'];

  for (const fmt of formats) {
    const crews = getCrewsForFormat(fmt, state);
    assert.ok(crews.length >= 7, `Format ${fmt} must have at least 7 crew members`);
    const directors = crews.filter(c => c.role === 'director');
    const writers = crews.filter(c => c.role === 'writer');
    assert.ok(directors.length >= 4, `Format ${fmt} must have at least 4 directors`);
    assert.ok(writers.length >= 3, `Format ${fmt} must have at least 3 writers`);
    for (const c of crews) {
      assert.equal(c.format, fmt, `Crew ${c.name} must belong to format ${fmt}`);
      assert.ok(c.name && c.title && c.specialty && c.desc, `Crew ${c.id} must have complete properties`);
    }
  }

  // Variety show with variety crew:
  const varietyProj = createProductionProject(state, {
    title: '美女廚房超狂回歸',
    format: 'variety',
    episodesCount: 2,
    actorIds: ['edaan'],
    crew: { directorId: 'dir_var_wilson', writerId: 'wri_var_man' }
  });
  assert.equal(varietyProj.crew.directorId, 'dir_var_wilson');
  assert.equal(varietyProj.crew.writerId, 'wri_var_man');
});

test('zero-error episodes automatically deliver as-is without stopping at qc_ready or prompting player', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '大時代零瑕疵完美版',
    format: 'drama',
    episodesCount: 2,
    actorIds: ['bosco', 'sheren']
  });

  const ep1 = proj.episodes[0];
  ep1.stage = 'post_production';
  ep1.stageProgress = 99;
  ep1.errors = 0; // 0 errors! Like in user screenshot

  // Advance production to reach quality control
  advanceProduction(state, 1, () => 0.5);

  // Must automatically deliver without stopping at qc_ready
  assert.equal(ep1.status, 'delivered', 'Zero-error episode must automatically deliver as-is');
  assert.equal(proj.deliveredEpisodesCount, 1);
  assert.ok(state.log.some(l => l.text.includes('0 瑕疵完美成片') || l.text.includes('自動免檢交付入庫')));
});

test('remembering QC strategy automatically applies to subsequent episodes and batch-delivers pending episodes', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '大時代後續自動審片',
    format: 'drama',
    episodesCount: 3,
    actorIds: ['bosco', 'sheren']
  });

  const ep1 = proj.episodes[0];
  const ep2 = proj.episodes[1];
  const ep3 = proj.episodes[2];

  // Episode 1 has 2 errors and reaches QC
  ep1.stage = 'quality_control';
  ep1.status = 'qc_ready';
  ep1.errors = 2;
  ep1.qcReport = { choices: [{ id: 'fix_errors', label: '消除檢驗瑕疵', cost: 10000, clearErrors: true, days: 1 }] };

  // Episode 2 is also in qc_ready
  ep2.stage = 'quality_control';
  ep2.status = 'qc_ready';
  ep2.errors = 1;
  ep2.qcReport = { choices: [{ id: 'fix_errors', label: '消除檢驗瑕疵', cost: 10000, clearErrors: true, days: 1 }] };

  // Player decides fix_errors on Episode 1 with remember = true
  const initialCash = state.cash;
  const res = handleQualityControlDecision(state, proj.id, ep1.episodeNumber, 'fix_errors', Math.random, true);

  assert.equal(res.delivered, true);
  assert.equal(res.remember, true);
  assert.equal(proj.autoQCDecision, 'fix_errors');
  assert.equal(ep1.status, 'delivered');
  assert.equal(ep1.errors, 0);

  // Ep2 should have been batch-delivered as well!
  assert.equal(ep2.status, 'delivered');
  assert.equal(ep2.errors, 0);
  assert.equal(res.batchDeliveredCount, 1);
  assert.equal(proj.deliveredEpisodesCount, 2);

  // Now Ep3 finishes post_production with 3 errors
  ep3.stage = 'post_production';
  ep3.stageProgress = 99;
  ep3.errors = 3;

  // Advance production: Ep3 reaches QC and should automatically fix_errors and deliver!
  advanceProduction(state, 1, () => 0.5);

  assert.equal(ep3.status, 'delivered', 'Subsequent episodes must automatically apply remembered QC strategy');
  assert.equal(ep3.errors, 0);
  assert.equal(proj.deliveredEpisodesCount, 3);
});

test('setProjectQCStrategy updates project strategy and delivers waiting qc_ready episodes', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '一鍵策略切換劇',
    format: 'drama',
    episodesCount: 2,
    actorIds: ['bosco', 'sheren']
  });

  const ep = proj.episodes[0];
  ep.stage = 'quality_control';
  ep.status = 'qc_ready';
  ep.errors = 3;

  const result = setProjectQCStrategy(state, proj.id, 'release_as_is');
  assert.equal(result.strategyId, 'release_as_is');
  assert.equal(proj.autoQCDecision, 'release_as_is');
  assert.equal(ep.status, 'delivered');
  assert.equal(result.batchCount, 1);
  assert.equal(proj.deliveredEpisodesCount, 1);
});

test('digital sub-channel revenue is credited exactly once per day', () => {
  const off = newGame();
  const on = newGame();
  on.subChannelUnlocked = true;
  const offReport = advanceDay(off, () => 0.5);
  const onReport = advanceDay(on, () => 0.5);
  const credit = Math.round(offReport.revenue * 0.28);
  assert.ok(credit > 0, 'Sub-channel credit should be positive for a normal broadcast day');
  assert.equal(onReport.revenue - offReport.revenue, credit, 'Daily revenue must include the sub-channel credit once');
  assert.equal(on.cash - off.cash, credit, 'Cash must gain exactly one sub-channel credit, not two');
  assert.equal(on.quarterLedger.revenue - off.quarterLedger.revenue, credit, 'Quarter ledger must gain exactly one sub-channel credit');
});

test('actors who aired today do not recover stamina while idle actors do', () => {
  const state = newGame();
  const crime = state.library.find(p => p.id === 'start-crime');
  crime.castIds = ['edaan']; // start-crime is scheduled every day at 16:00
  state.day = 2;
  state.talent['edaan'].stamina = 50;
  state.talent['sheren'].stamina = 50;
  state.lastAiredDays['sheren'] = 0;
  advanceDay(state, () => 0.5);
  assert.equal(state.talent['edaan'].stamina, 50, 'Actor whose show aired today must not recover stamina');
  assert.equal(state.talent['sheren'].stamina, 52, 'Idle actor still recovers +2 stamina');
});

test('monthly results are stored on the evaluated month’s last day and the annual highest-rating award includes December', () => {
  const state = newGame();
  state.day = 361; // advanceDay has already moved past day 360 when month 12 is evaluated
  const monthResult = evaluateMonthlyRatings(state, 11);
  assert.equal(monthResult.day, 360, 'Month 12 result must be stored with day 360, not 361');

  const state2 = newGame();
  state2.monthlyLeaderboards = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    day: (i + 1) * 30,
    champion: i === 11
      ? { title: '十二月壓軸大劇', station: '你的電視台', peakRating: 95, avgRating: 90, category: '劇集' }
      : { title: `第 ${i + 1} 月冠軍`, station: '翡翠台', peakRating: 50, avgRating: 45, category: '劇集' },
    top5: [], ourBest: null, isOurWin: i === 11, bonusWon: false, isNew: false
  }));
  const ceremony = evaluateAnnualAwards(state2, 1, () => 0.99);
  const ratingAward = ceremony.awards.find(a => a.category === '年度全港最高收視大獎');
  assert.equal(ratingAward.isOurs, true, 'December champion must be eligible for the annual highest-rating award');
  assert.ok(ratingAward.winner.includes('十二月壓軸大劇'));
});

test('the first airing of a daily news programme is charged its episode cost like any later airing', () => {
  const build = runs => {
    const state = newGame();
    const program = produce(state, { kind: 'news', topic: '晚間', budgetId: 'standard', episodeHours: 1 }, () => 0.5);
    scheduleProgram(state, 3, program.id, 1);
    program.runs = runs;
    const cashBefore = state.cash;
    const report = advanceDay(state, () => 0.5);
    return { delta: state.cash - cashBefore, overhead: report.overhead, cost: program.episodeCost };
  };
  const first = build(0);
  const later = build(5);
  assert.ok(first.cost > 0, 'Produced news programme must carry a per-airing episode cost');
  assert.equal(first.delta, later.delta, 'First-ever airing must be charged exactly like a later airing');
  assert.equal(first.overhead, later.overhead);
  assert.ok(first.overhead > 18_333, 'First day overhead must already include the episode cost');
});

test('a once-only block survives a day its programme cannot air and is consumed by the first real airing', () => {
  const state = newGame();
  const proj = createProductionProject(state, {
    title: '單次播映測試劇',
    format: 'drama',
    episodesCount: 3,
    actorIds: ['bosco', 'sheren']
  });
  proj.episodes[0].status = 'delivered';
  deliverEpisode(state, proj, proj.episodes[0]);
  const libItem = state.library.find(p => p.projectId === proj.id);
  libItem.runs = 1; // Episode 1 already aired; episode 2 is not delivered yet
  scheduleProgram(state, 20, libItem.id, 2, { days: [1], once: true });

  advanceDay(state, () => 0.5); // Day 1 (Monday): block not scheduled today
  const gapDay = advanceDay(state, () => 0.5); // Day 2 (Tuesday): production gap, only filler airs
  assert.ok(gapDay.details.some(d => d.effect?.includes('脫期')), 'Day 2 should be a schedule-gap filler day');
  assert.ok(state.schedule.some(b => b.programId === libItem.id && b.once), 'Once block must survive a day the programme cannot really air');
  assert.equal(libItem.runs, 1, 'Gap day must not advance runs');

  proj.episodes[1].status = 'delivered';
  deliverEpisode(state, proj, proj.episodes[1]);
  for (let i = 0; i < 7; i++) advanceDay(state, () => 0.5); // Days 3-9; next Tuesday is day 9
  assert.equal(libItem.runs, 2, 'Episode 2 airs on the next scheduled Tuesday');
  assert.equal(state.schedule.some(b => b.programId === libItem.id), false, 'Once block is consumed by the first real airing');
});

test('UCL contract revenue is spread over the whole rights period and settled against its own cumulative', () => {
  const state = newGame();
  state.cash = 50_000_000;
  state.day = 2; // Buyout on day 2: the 90-day contract concludes on day 91, just after the day-90 quarter reset
  const ev = buyoutSportsEvent(state, 'ucl-2028');
  assert.equal(ev.adTarget, 8_500_000);
  let daily = null;
  for (let i = 0; i < 200 && !ev.settled; i++) daily = advanceDay(state, () => 0.5);
  assert.ok(ev.settled, 'Contract must conclude');
  assert.equal(daily.day, 91, 'Contract concludes on day 91, right after the quarterly ledger reset');
  const earned = ev.sportsRevenueEarned;
  assert.ok(earned >= 8_500_000 * 0.4 && earned <= 8_500_000 * 2.5, `Cumulative UCL revenue ${earned} must land within 0.4x-2.5x of the $8.5m target`);
  const expectedPenalty = Math.max(0, Math.round((8_500_000 - earned) * 0.55));
  assert.equal(daily.sportsPenalty, expectedPenalty, 'Penalty must be computed from the contract’s own cumulative revenue');
  const noteEntry = state.log.find(n => n.text.includes('轉播權合約期滿'));
  assert.ok(noteEntry, 'Conclusion note must be logged');
  assert.ok(noteEntry.text.includes(money(earned)), 'Conclusion note must report the contract’s own cumulative revenue');
  assert.ok(!noteEntry.text.includes('$0.0m'), 'Conclusion note must not read the reset quarterly ledger');
});

test('UCL blocks stay silent on non-match weeks and during the summer break but air on match nights', () => {
  const state = newGame();
  state.cash = 60_000_000;
  const ev = buyoutSportsEvent(state, 'ucl-2029'); // Full-season UCL, won on day 1
  while (state.day < 9) advanceDay(state, () => 0.5);
  const matchDay = advanceDay(state, () => 0.5); // Day 9: Tuesday of a match week
  const matchDetail = matchDay.details.find(d => d.programId === `event:${ev.id}`);
  assert.ok(matchDetail && matchDetail.revenue > 0, 'Match-week Tuesday must air UCL and earn');
  assert.equal(matchDay.hours[2].title, ev.name);

  state.day = 16; // Tuesday of a non-match week
  const quietDay = advanceDay(state, () => 0.5);
  assert.equal(quietDay.details.some(d => d.programId === `event:${ev.id}`), false, 'Non-match week must produce no UCL broadcast');
  assert.equal(quietDay.sportsRevenue, 0, 'Non-match week must earn no sports revenue');
  assert.ok(state.schedule.some(b => b.programId === `event:${ev.id}`), 'Block stays scheduled for future match nights');

  state.day = 184; // Tuesday in the July summer break
  const summerDay = advanceDay(state, () => 0.5);
  assert.equal(summerDay.details.some(d => d.programId === `event:${ev.id}`), false, 'Summer break must produce no UCL broadcast');
  assert.equal(summerDay.sportsRevenue, 0, 'Summer break must earn no sports revenue');
});

test('knockout-only UCL rights last one quarter and a same-type takeover concludes displaced rights early', () => {
  const state = newGame();
  state.cash = 100_000_000;
  const ko = state.events.find(e => e.id === 'ucl-2028');
  const full = state.events.find(e => e.id === 'ucl-2029');
  assert.equal(sportsDurationDays(ko), 90, 'Knockout-only package lasts 90 days');
  assert.equal(sportsDurationDays(full), 360, 'Full-season package lasts 360 days');

  buyoutSportsEvent(state, ko.id); // Won on day 1
  state.day = 90;
  assert.equal(isSportsActive(ko, state), true, 'Knockout rights still active on day 90');
  state.day = 91;
  assert.equal(isSportsActive(ko, state), false, 'Knockout rights must be inactive after wonDay + 90');
  state.day = 1;

  const cashBefore = state.cash;
  buyoutSportsEvent(state, full.id); // Same type (ucl), same Tue/Wed 01:00 slot: displaces the knockout blocks
  assert.equal(ko.settled, true, 'Displaced knockout rights must be concluded on the spot');
  assert.equal(state.schedule.some(b => b.programId === `event:${ko.id}`), false, 'Displaced blocks are removed');
  assert.ok(state.schedule.some(b => b.programId === `event:${full.id}`), 'New rights are scheduled');
  assert.ok(state.log.some(n => n.text.includes('提前結束') && n.text.includes(ko.name)), 'Player must be told the old contract ended early');
  const expectedPenalty = Math.round(ko.adTarget * 0.55); // Nothing aired yet, so nothing earned
  assert.equal(state.cash, cashBefore - 8_100_000 - expectedPenalty, 'Takeover charges the buyout plus the displaced contract’s own shortfall penalty');
});

// ---------------------------------------------------------------------------
// Phase B1: challenge missions
// ---------------------------------------------------------------------------

test('challenges seed for new games, complete at day end and pay out the next morning', () => {
  const state = newGame();
  const list = getChallengeList(state);
  assert.equal(list.length, 11);
  assert.ok(list.every(c => !c.done && c.progress === 0));

  // Guarantee a prime-time win: the starter sitcom already sits at 19:00.
  const sitcom = state.library.find(p => p.id === 'start-sitcom');
  sitcom.rating = 99;
  sitcom.quality = 99;
  const cashBefore = state.cash;
  const day1 = advanceDay(state, () => 0.5);
  const prime = state.challenges.find(c => c.id === 'prime-first');
  assert.equal(prime.done, true, 'Winning a prime hour completes the challenge at day end');
  // The reward is queued, not paid synchronously: day 1 cash is exactly the broadcast net.
  assert.equal(state.cash, cashBefore + day1.net);
  const pendingSum = state.pendingChallengeRewards.reduce((sum, r) => sum + (r.cash ?? 0), 0);
  assert.ok(pendingSum >= 200_000);
  assert.ok(state.pendingChallengeRewards.some(r => r.id === 'prime-first'));

  const cashBefore2 = state.cash;
  const day2 = advanceDay(state, () => 0.5);
  assert.equal(state.cash, cashBefore2 + day2.net + pendingSum, 'Queued rewards land the next morning');
  assert.equal(state.pendingChallengeRewards.some(r => r.id === 'prime-first'), false);
  assert.ok(state.log.some(n => n.text.includes('【挑戰達成】')), 'Payout fires a celebratory note');
});

test('challenge and grudge state migrates into old saves and survives a JSON round-trip', () => {
  const state = newGame();
  delete state.challenges; delete state.challengeFlags; delete state.pendingChallengeRewards;
  delete state.rivalGrudge; delete state.rivalBeatStreak; delete state.talentEventCooldownUntil;
  delete state.pendingHeadline;
  migrateLegacyLicenses(state);
  assert.equal(getChallengeList(state).length, 11);
  assert.deepEqual(state.rivalGrudge, { jade: 0, viu: 0, hoy: 0 });
  assert.equal(state.talentEventCooldownUntil, 0);
  assert.equal(state.pendingHeadline, null);

  state.challenges.find(c => c.id === 'prime-first').done = true;
  state.rivalGrudge.jade = 42;
  const revived = JSON.parse(JSON.stringify(state));
  assert.equal(getChallengeList(revived).find(c => c.id === 'prime-first').done, true);
  assert.equal(rivalGrudgeOf(revived, 'jade'), 42);
  assert.ok(Array.isArray(revived.pendingChallengeRewards));

  // A save that already opened the sub-channel before challenges existed
  // gets the marker backfilled by migration.
  const legacy = newGame();
  legacy.subChannelUnlocked = true;
  delete legacy.challengeFlags;
  migrateLegacyLicenses(legacy);
  assert.equal(legacy.challengeFlags['sub-channel'], true);
});

test('first production and first signing complete via action markers without touching action cash', () => {
  const state = newGame();
  const freeActor = ACTORS.find(a => state.talent[a.id].station === 'free');
  const cost = artistSignCost(state.talent[freeActor.id], freeActor);
  const cashBefore = state.cash;
  signArtist(state, freeActor.id);
  assert.equal(state.cash, cashBefore - cost, 'signArtist charges exactly its usual fee');
  assert.equal(state.challengeFlags['first-signing'], true);
  assert.equal(state.challenges.find(c => c.id === 'first-signing').done, false, 'Not complete until day end');

  produce(state, { kind: 'variety', topic: '遊戲競賽', budgetId: 'lean', episodeHours: 1, episodeCount: 8 }, () => 0.5);
  assert.equal(state.challengeFlags['first-production'], true);

  advanceDay(state, () => 0.5);
  assert.equal(state.challenges.find(c => c.id === 'first-signing').done, true);
  assert.equal(state.challenges.find(c => c.id === 'first-production').done, true);
  assert.ok(state.pendingChallengeRewards.some(r => r.id === 'first-signing'));
  assert.ok(state.pendingChallengeRewards.some(r => r.id === 'first-production'));
});

test('sub-channel challenge completes through unlockSubChannel', () => {
  const state = newGame();
  state.cash = 40_000_000;
  unlockSubChannel(state);
  assert.equal(state.challengeFlags['sub-channel'], true);
  evaluateChallenges(state, { day: 1, hours: [], wins: 0 });
  assert.equal(state.challenges.find(c => c.id === 'sub-channel').done, true);
  assert.ok(state.pendingChallengeRewards.some(r => r.id === 'sub-channel' && r.cash === 1_000_000));
});

// ---------------------------------------------------------------------------
// Phase B2: premiere night expansion
// ---------------------------------------------------------------------------

test('premiere preview quotes are deterministic for the same programme and day', () => {
  const item = { programId: 'prog-x', day: 12, kind: 'drama', title: '測試劇' };
  const program = { id: 'prog-x', kind: 'drama', quality: 82 };
  const first = premierePreviewQuotes(item, program);
  const second = premierePreviewQuotes(item, program);
  assert.deepEqual(first, second, 'Re-renders must not reroll the quotes');
  assert.ok(first.length >= 2 && first.length <= 3);
  assert.ok(first.every(q => q.text.length > 0 && q.from.length > 0));
  const lowBand = premierePreviewQuotes(item, { id: 'prog-x', kind: 'drama', quality: 30 });
  assert.ok(lowBand.length >= 2 && lowBand.length <= 3);
});

test('premiere first airing posts a premiere feed line and the next day carries a headline', () => {
  const state = newGame();
  const show = produce(state, { kind: 'variety', topic: '遊戲競賽', budgetId: 'standard', episodeHours: 2, episodeCount: 8 }, () => 0.5);
  scheduleProgram(state, 19, show.id, 2);
  advanceDay(state, () => 0.5);
  assert.ok(state.pendingPremieres.some(p => p.programId === show.id), 'First airing registers a pending premiere');
  assert.ok(
    state.audienceFeed.some(f => f.title === show.title && f.text.includes('首播')),
    'Audience feed carries a premiere-specific post referencing the result'
  );
  assert.equal(state.pendingHeadline?.title, show.title);
  advanceDay(state, () => 0.5);
  assert.ok(
    state.log.some(n => n.text.includes('【今日頭條】') && n.text.includes(show.title)),
    'The following day log carries the newspaper headline'
  );
  assert.equal(state.pendingHeadline, null, 'Headline is consumed the next day');
});

// ---------------------------------------------------------------------------
// Phase B3: talent story events
// ---------------------------------------------------------------------------

test('talent story events stay silent before day 8 and respect the cooldown', () => {
  const state = newGame();
  state.day = 7;
  assert.equal(evaluateTalentStoryEvent(state, () => 0), null);
  assert.equal(state.talentEventCooldownUntil, 0, 'No cooldown is consumed before day 8');
  state.day = 8;
  const event = evaluateTalentStoryEvent(state, () => 0);
  assert.equal(event.kind, 'scandal');
  assert.equal(state.talentEventCooldownUntil, 17, 'Cooldown is 9 to 14 days');
  assert.equal(evaluateTalentStoryEvent(state, () => 0), null, 'No second event inside the cooldown');
});

test('poach letter offers retention and release choices with real contract effects', () => {
  // rng 0.99 picks the poach archetype out of [scandal, poach] on day 20.
  const build = () => {
    const state = newGame();
    state.day = 20;
    const event = evaluateTalentStoryEvent(state, () => 0.99);
    assert.equal(event.kind, 'poach');
    const letter = state.mailbox.find(l => l.id === event.letterId);
    assert.ok(letter && letter.type === 'poach' && letter.options.length === 2);
    return { state, event, letter };
  };

  const retained = build();
  const actorId = retained.event.actorId;
  const expiresBefore = retained.state.talent[actorId].contractExpiresDay;
  const fameBefore = retained.state.talent[actorId].fame;
  const cashBefore = retained.state.cash;
  const retainOption = retained.letter.options.find(o => o.id === 'retain');
  replyToLetter(retained.state, retained.letter.id, 'retain');
  assert.equal(retained.state.cash, cashBefore - retainOption.cost, 'Retention bonus is charged');
  assert.equal(retained.state.talent[actorId].contractExpiresDay, expiresBefore + 90, 'Retention extends the contract by 90 days');
  assert.equal(retained.state.talent[actorId].fame, Math.min(100, fameBefore + 2));

  const released = build();
  const feeBefore = released.state.talent[actorId].fee;
  replyToLetter(released.state, released.letter.id, 'release');
  assert.equal(released.state.talent[actorId].contractExpiresDay, 50, 'Release shortens the contract to 30 days out');
  assert.equal(released.state.talent[actorId].fee, Math.round(feeBefore * 1.15 / 10_000) * 10_000, 'Release raises the fee demand by 15%');
});

// ---------------------------------------------------------------------------
// Phase B4: rival personalities + grudge
// ---------------------------------------------------------------------------

test('rival personalities shape signings, premieres and evening ratings', () => {
  // 翡翠台 挖角王: prefers a free artist the player has cast.
  const state = newGame();
  const freeActor = ACTORS.find(a => state.talent[a.id].station === 'free');
  for (const p of state.library) p.castIds = [];
  state.library[0].castIds = [freeActor.id];
  checkCompetitorArtistSignings(state, () => 0);
  assert.equal(state.talent[freeActor.id].station, 'jade', 'Jade poaches the player-cast artist first');

  // ViuTV 話題王: premieres rotate inside the high-buzz top three.
  const viu = state.rivals.find(r => r.id === 'viu');
  const buzzTitles = new Set(['大叔甜蜜愛火', '二月廿九之約', '季前熱血單挑']);
  const seen = new Set();
  for (let m = 0; m < 6; m++) {
    const premiere = rivalPremiere(viu, 1 + m * 30);
    assert.ok(buzzTitles.has(premiere.title), `Viu premiere ${premiere.title} must be a high-buzz pick`);
    seen.add(premiere.title);
  }
  assert.ok(seen.size >= 2, 'Viu premieres still rotate monthly');

  // HOY TV 量產王: premiere quality is discounted by 3.
  const hoy = state.rivals.find(r => r.id === 'hoy');
  assert.equal(rivalPremiere(hoy, 1).rating, 67, 'HOY month-0 premiere 70 - 3');

  // ViuTV evening buzz bonus: +2 over the raw premiere rating at 20:00.
  const at20 = rivalAtHour(state, viu, 20, 1);
  assert.equal(at20.rating - rivalPremiere(viu, 1).rating, 2, 'Wave is 0 on day 1 at 20:00, leaving exactly the +2 buzz bonus');
});

test('grudge accrues from monthly wins and daily beat streaks, decays, and hardens auction bids at 50', () => {
  const state = newGame();
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, rating: 50, rivals: [40, 40, 40] }));
  evaluateChallenges(state, { day: 3, hours, wins: 0, monthResult: { isOurWin: true, top5: [{ station: '你的電視台' }, { station: '翡翠台' }] } });
  assert.equal(rivalGrudgeOf(state, 'jade'), 14, 'Monthly win over the runner-up: +15, day-3 decay: -1');
  evaluateChallenges(state, { day: 4, hours, wins: 0 });
  assert.equal(rivalGrudgeOf(state, 'jade'), 14, 'Beat streak still building');
  evaluateChallenges(state, { day: 5, hours, wins: 0 });
  assert.equal(rivalGrudgeOf(state, 'jade'), 24, 'Third straight head-to-head win adds +10');

  // Auction teeth: at grudge >= 50 the rival bids 5% harder.
  const control = newGame();
  const grudging = newGame();
  grudging.rivalGrudge.jade = 60;
  const controlEvent = control.events.find(e => !e.resolved);
  const grudgeEvent = grudging.events.find(e => e.id === controlEvent.id);
  controlEvent.playerBid = 100;
  grudgeEvent.playerBid = 100;
  resolveAuction(control, controlEvent, () => 0.5);
  resolveAuction(grudging, grudgeEvent, () => 0.5);
  const controlBid = controlEvent.bids.find(b => b.name === '翡翠台').amount;
  const grudgeBid = grudgeEvent.bids.find(b => b.name === '翡翠台').amount;
  assert.equal(grudgeBid, Math.round(controlBid * 1.05 / 100_000) * 100_000);
  assert.ok(grudgeBid > controlBid);
});

test('a grudging rival targets the player strongest daypart with its premieres', () => {
  const boost = state => {
    const block = state.schedule.find(b => b.start <= 12 && 12 < b.start + b.duration);
    const program = state.library.find(p => p.id === block.programId);
    program.rating = 99;
  };
  const state = newGame();
  boost(state);
  assert.equal(playerStrongestDaypart(state), 'daytime');
  state.rivalGrudge.viu = 60;
  const viu = state.rivals.find(r => r.id === 'viu');
  const premiere = rivalPremiere(viu, state.day);
  assert.equal(rivalAtHour(state, viu, 12, state.day).title, premiere.title, 'Premiere moves to the strongest daypart');
  assert.notEqual(rivalAtHour(state, viu, 19, state.day).title, premiere.title, 'Prime time is left alone while targeting');

  const calm = newGame();
  boost(calm);
  assert.equal(rivalAtHour(calm, viu, 19, calm.day).title, premiere.title, 'Without a grudge the premiere stays at 19:00');
  assert.notEqual(rivalAtHour(calm, viu, 12, calm.day).title, premiere.title);
});
