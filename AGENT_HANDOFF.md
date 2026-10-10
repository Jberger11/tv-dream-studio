# Antigravity 開發紀錄：經典電視台經營 5 大核心機制全面實裝（廣告招商、藝人經理人部、電視大樓擴建、數碼二台、董事會審批）
- Updated: 2026-10-10T06:15:00+08:00
- Agent: Antigravity
- Goal:
  全面實裝經典《電視大亨 / 電視夢工場》原作 5 大核心深度經營系統：
  1. 💼 動態廣告招商與合約系統 (Sponsor Contracts & Dynamic Pricing)
  2. ⭐ 藝人專屬簽約、培訓與體力機制 (Talent Agency & Training)
  3. 🏢 電視大樓設施與攝影棚擴建 (Station Facilities & Studio Upgrades)
  4. 📺 多頻道雙線營運 (Multi-Channel Expansion / 數碼二台)
  5. 👔 董事會總裁審批與增資 (Board of Directors & Milestones)
- Project:
  - 獨立倉庫: `C:\Users\Shackie\Documents\Codex\2026-09-05\tv-dream-studio` (`https://github.com/Jberger11/tv-dream-studio.git`)
  - Monorepo: `C:\Users\Shackie\Documents\Codex\2026-09-05\1980-2026-hong-kong-cinema-tycoon\outputs\game\tv-station`
- Current state:
  - 單元測試套件 `engine.test.mjs` 增至 49 項，49/49 全部通過（涵蓋廣告合約達標紅利/違約賠償、專屬藝人零片酬/代言分紅、培訓大師班/休假回體力、大樓設施升級上限與口碑加乘、季度董事會評核增資與數碼二台排播）。
  - 代碼語法檢查 `node --check` 針對 `engine.js`、`app.js`、`models.js` 全數通過。
  - Chrome DevTools 390×844 手機與桌面版完整實測通過，無報錯、無水平溢出。
  - 存檔相容性保證：存檔 key 維持 `tv-dream-studio-v1`，舊存檔（如第 175、208 日）無痛自動平滑遷移，完全不破壞玩家已有資金、劇集、片庫與進度。
  - 盛典命名規範：嚴格遵循規則，維持 `Annual TV Awards Gala / 年度電視頒獎盛典`，絕不使用萬千星輝。
- Last completed work:
  - `models.js`: 擴充 `StationState` 及 `Actor` 結構，支援廣告招商底價策略與品牌合約、大樓設施等級、董事會滿意度與警告、數碼二台解鎖與排表、藝人合約類別/剩餘天數/體力值。
  - `engine.js`: 實裝廣告品牌池（勞斯萊斯、百達翡麗、恒生、太古地產、維他奶、京都念慈菴）與對賭結算、大樓 4 大部門設施升級（影棚、後期剪輯、公關宣發、採訪車隊）、藝人專屬簽約（拍自製劇片酬 $0 + 每季代言分紅）、藝人培訓大師班（演技+3 / 知名度+4）、休假充電（體力+50%）、數碼二台副頻道營運增收、每季董事會大股東評核（S 級無償增資 +$20.0m、A 級無償增資 +$10.0m、嚴重虧損則下達整改通牒）與舊存檔自動遷移。
  - `app.js` & `styles.css`:
    - 頂部導航新增【💼 招商】分頁：底價策略切換、進行中品牌合約進度追蹤、招商市場簽約。
    - 頂部導航新增【🏢 大樓】分頁：4 大部門設施等級階梯、升級效益與擴建按鈕。
    - 【🎬 製作】分頁整合藝人經理人部與培訓班：知名度/演技/體力儀表板、簽 90 日專屬台柱、培訓與休假充電。
    - 【📺 排播】分頁新增數碼二台申請牌照橫幅、主台/二台頻道切換頁籤與二台獨立排表。
    - 【📊 戰報】分頁新增大股東與董事會季度評核報告、滿意度儀表、整改警告與注資歷史紀錄。
- Verification:
  - `node --test engine.test.mjs`: 49/49 通過。
  - Chrome DevTools 手機 (390px) 與桌面版渲染驗證，各分頁按鈕與版面正常，0 控制台錯誤。
- Next:
  - 玩家可在網頁體驗 5 大核心經營系統。
- Blockers:
  - 無。

---
# Antigravity 開發紀錄：體育轉播權即時買斷、提前揭標與英超/歐聯 360 日全季排播修復
- Updated: 2026-10-10T05:25:00+08:00
- Agent: Antigravity
- Goal:
  1. 徹底解決玩家反應「買了英超、歐聯卻無法排播」之問題：
     - 原因一：舊版體育賽事純粹為季度末（第 90、180 日）才開標之暗標競投，玩家出價只是凍結保證金，尚未開標前無法排播。
     - 原因二：舊版硬編碼 `(state.day - 1) % 90 < 30` 限制，導致即使中標，到了第 30 天也會被強制判定「一個月轉播結束」並自節目表中清空，第 31–90 天無法排播。
  2. 升級體育版權系統：支援【一口價即時買斷（即買即播）】及【提前揭曉底牌】，英超與歐聯享有 360 天（4 季）全季轉播權，排播大廳與片庫清晰整合體育賽事。
- Project:
  - 獨立倉庫: `C:\Users\Shackie\Documents\Codex\2026-09-05\tv-dream-studio` (`https://github.com/Jberger11/tv-dream-studio.git`)
  - Monorepo: `C:\Users\Shackie\Documents\Codex\2026-09-05\1980-2026-hong-kong-cinema-tycoon\outputs\game\tv-station`
- Current state:
  - 單元測試套件 `engine.test.mjs` 增至 44 項，44/44 全部通過（新增一口價買斷、自動排播、超過 30 天持續排播與提前揭標回歸測試）。
  - 語法檢查 `engine.js`、`app.js`、`models.js` 全部通過。
  - 存檔相容性保證：存檔 key 維持 `tv-dream-studio-v1`，舊存檔自動遷移補齊 `wonDay`。
- Last completed work:
  - `engine.js`:
    - 徹底修復 `(state.day - 1) % DAYS_PER_QUARTER < 30` 限制，移除 30 天強制清空邏輯。
    - 支援 `getActiveSportsEvents(state)`：全季賽事（英超、歐聯）轉播權自中標/買斷日起算 360 天有效，盃賽為 90 天有效。
    - 新增 `buyoutSportsEvent(state, eventId)`：支援以 1.35x 一口價即時買斷賽事轉播權，自動扣除已出保證金並一鍵預排亞洲黃金時段直播（英超週末 19:00–24:00、週中快車 01:00–04:00；歐聯週二三深夜 01:00–05:00）。
    - 新增 `revealAuctionNow(state, eventId, rng)`：支援提前揭曉暗標底牌。
  - `app.js`:
    - 排播選單標記 `🏆 體育直播`，體育賽事支援一鍵選擇與預設時段。
    - 排播大廳若有已凍結未開標之體育賽事，頂部醒目提示引導玩家前往體育中心【提前揭標】或【補足一口價買斷】。
    - 片庫及體育專區清楚列出當前持有之轉播權、尚餘天數及排播狀態。
  - `styles.css`:
    - 新增 `.pending-sports-banner`, `.gold-button`, `.sports-owned-card`, `.catalog-sports-bar` 等樣式，手機版良好適配。
- Verification:
  - `node --test engine.test.mjs`：44/44 通過。
- Next:
  - 玩家可在網頁直接體驗體育買斷與排播。
- Blockers:
  - 無。

---
# Antigravity 開發紀錄：年度電視頒獎盛典中立命名與藝人知名度雙向升降機制
- Updated: 2026-10-10T04:55:00+08:00
- Agent: Antigravity
- Goal:
  1. 頒獎盛典命名嚴格統一為「Annual TV Awards Gala / 年度電視頒獎盛典」，徹底移除任何特定電視台台慶命名（如「萬千星輝頒獎禮」、「台慶大獎金」）。
  2. 重構藝人知名度（`talent.fame`）為雙向動態升降機制：劇集撲街或大敗於對台時人氣倒跌，長期坐冷板凳不排播時知名度隨時間回調降溫，並在每日結算戰報中清楚標示升跌指示（▲ / ▼）與變動緣由。
- Project:
  - 獨立倉庫: `C:\Users\Shackie\Documents\Codex\2026-09-05\tv-dream-studio` (`https://github.com/Jberger11/tv-dream-studio.git`)
  - Monorepo: `C:\Users\Shackie\Documents\Codex\2026-09-05\1980-2026-hong-kong-cinema-tycoon\outputs\game\tv-station`
- Current state:
  - GitHub 獨立倉庫 `Jberger11/tv-dream-studio` 與 Monorepo 均已同步至最新提交 `32cc4f5`，全無未提交改動。
  - 單元測試套件 `engine.test.mjs` 增至 43 項，43/43 全部通過（包含藝人知名度撲街倒跌、大敗受罰與長期未參演降溫回歸測試）。
  - 存檔相容性保證：存檔 key 維持 `tv-dream-studio-v1`，玩家於第 208 日之現有進度、資金、作品與 RNG 完全不受影響。
- Last completed work:
  - `engine.js`:
    - 藝人知名度動態預期模型：依據藝人當前知名度計算收視預期門檻 `expectedRating = 44 + (talent.fame - 50) * 0.35`，大牌若收視疲弱或慘敗於對手將倒扣知名度。
    - 長期閒置降溫：每 15 日檢查未參演天數，若閒置超過 30 日每階段微幅冷卻 0.2 知名度（下限為其演技基礎）。
    - 每日結算明細 `talentChanges`：記錄升跌數值與原因（「收視亮眼／贏過對台」、「收視未及預期／遭對手壓制」、「久未露面人氣降溫」）。
    - 頒獎盛典中立命名：全面統一為 `Annual TV Awards Gala` / `年度電視頒獎盛典`，獎金改稱「盛典總獎金」。
  - `app.js` & `styles.css`:
    - 戰報新增動態升跌顏色標示（綠色 `▲ +X`、紅色 `▼ -X`）及原因說明標籤。
    - 獎座陳列室（榮譽殿堂）及盛典彈窗統一為年度電視頒獎盛典風格，未舉辦時顯示倒數提示。
- Verification:
  - `node --test engine.test.mjs`：獨立庫與 Monorepo 均 43/43 測試通過。
  - 語法檢查通過，Git 乾淨且遠端 GitHub 已推送至 `32cc4f5`。
- Next:
  - 玩家於網頁或真機體驗藝人升跌反饋及頒獎盛典介面，待玩家提出下一項調整方向。
- Blockers:
  - 無。

---
# Codex 發佈紀錄：電視夢工場 Sites 第 21 版

- Updated: 2026-10-05T02:48:00+08:00
- Agent: Codex
- Goal: 將 GitHub `Jberger11/hong-kong-cinema-tycoon` `main` 提交 `feaf5c58d17ee82d7575dfbc54b4771765d5c6d0` 發佈至現有電視遊戲 Sites。
- Completed: 已核對 GitHub `main` HEAD 為該提交；本機 `tv-station/` 與 Sites 來源 `dist/` 五個遊戲檔一致，`tv-site-v21.tar` 內容亦一致。Sites 來源提交 `2ecc3223abe29ed72a899464341ee463345bbf19` 已推送並由來源讀取流程確認；儲存版本 `21`，版本 ID `appgprj_6ab629fae41481918724bdad12747306~appgver_5328863dff2c8191be2d480e9bdd6717`，部署 ID `appgdep_6ac29f473afc819199fb2b51d19280de`。
- Verification: `engine.test.mjs` 25/25 通過；Sites 部署狀態 `succeeded`，原網址 `https://tv-dream-studio-shackie.jerbolo.chatgpt.site`；再次讀取站點顯示第 21 版、`custom` 存取，僅一位擁有人、零群組。未測實體手機或私人站點登入後畫面。
- Decisions retained: 電視遊戲與電影遊戲分開；存檔 key `tv-dream-studio-v1` 不變；未改玩家現金、節目、版權、排播或 RNG；未改 Sites 存取範圍。
- Next: Cursor／Antigravity 開工前先讀本檔與最新 GitHub／Sites 狀態，後續按玩家具體要求開發。
- Blockers: 無發佈阻礙。

---
# Antigravity 開發紀錄：外購重播標籤修復、播完徹底留空與介面全面升級
- Updated: 2026-10-05T01:15:00+08:00
- Agent: Antigravity
- Goal:
  1. 修復未手動重播之外購節目誤顯示「手動重播第 1 輪」之 Bug；節目播完所有集數後原有時段必須徹底留空（未排節目），不可自動續播或滯留排播。
  2. 根據玩家要求全面升級遊戲排版及視覺體驗（Master Control 主控室風格 HUD、排播時間線卡片資訊完整展示、每日逐套戰報收視對比長條圖與勝負差額徽章、手機版 390px 專用適配）。
- Project: `C:\Users\Shackie\Documents\Codex\2026-09-05\1980-2026-hong-kong-cinema-tycoon`（TV 遊戲檔案位於 `outputs/game/tv-station/`，分發鏡像 `outputs/game/work/tv-site-source/dist/`）。
- Current state:
  - GitHub 倉庫 `Jberger11/hong-kong-cinema-tycoon` 主分支已推送至最新提交 `feaf5c5`（含 `tv-station/` 之 `app.js`、`engine.js`、`styles.css`、`engine.test.mjs`）。
  - 本地 Sites 來源 `outputs/game/work/tv-site-source` 已提交最新 commit `2ecc322`，並成功打包為第 21 版部署包 `outputs/game/work/tv-site-v21.tar`。
  - 單元測試套件 `engine.test.mjs` 增至 25 項，25/25 全數通過（含完播自動清空時段及無假重播標籤之回歸測試）。
  - 本地 Chrome 390px 觸控模擬實測完成：水平溢出 0px、主控台、24 格排播網格、完播留空時段、逐套對戰戰報均渲染正常。
  - 存檔相容性保證：存檔 key 維持 `tv-dream-studio-v1`，玩家於第 208 日之現有進度、資金、作品與 RNG 完全不受影響。
- Last completed work:
  - `engine.js`:
    - 修復 `episodeForBlock`：移除錯誤的 `Math.floor(run / episodes)` 預設 fallback，正常首輪播映不再誤冠「手動重播第 1 輪」標籤；真實手動重播時標示為港式電視用語「· 重播第 X 輪」。
    - 修復 `advanceDay` 與 `isCatalogCycleComplete`：外購節目最後一集播完後立即停播，並由 `clearCompletedPrograms` 自排播表中移除，時段徹底還原為「未排節目」。
    - 增強 `migrateLegacyLicenses`：載入舊存檔時，若有集數已滿且未啟動手動重播之外購節目，即時清理排播殘留，確保舊存檔相容且不會自動重播。
  - `app.js` & `styles.css`:
    - 頂部 HUD：提升電視台主控室質感，清晰呈現資金、口碑、熱度與即時播映節目跑馬燈。
    - 排播表卡片：解除先前 CSS 隱藏的資訊，清楚展示集數進度（如「2h · 第 1 / 6 集」）、黃金檔金邊醒目標記、正在播映時段動態青光，空檔以俐落虛線「點擊排檔」引導。
    - 每日戰報：徹底重構 `broadcastResultsView`，每套節目改以獨立收視對戰卡呈現，加入收視比對長條圖（我台 vs 最強對手）、高對比勝負徽章（「搶贏對台 +4」/「未能勝出 -4」）及廣告分帳醒目卡。
  - 分發同步與打包：
    - `outputs/game/tv-station/` 最新代碼已同步至 `outputs/game/work/tv-site-source/dist/`。
    - 建立 `outputs/game/work/tv-site-v21.tar` 部署包。
    - GitHub `Jberger11/hong-kong-cinema-tycoon` 已推送至 `feaf5c5`。
- Verification:
  - `node --test outputs/game/tv-station/engine.test.mjs`：25/25 通過。
  - `node --check` 針對 `engine.js`、`app.js`、`models.js` 語法檢查通過。
  - Chrome DevTools 390×844 視窗實測排播頁面、每日戰報頁面，確認完播後時段留空為「未排節目」，無水平溢出。
  - GitHub 遠端驗證：`main` 分支最新 commit `feaf5c5` 確認包含 TV 遊戲四個更新檔案。
- Next:
  - 玩家可在 ChatGPT 的 [TV Game 對話](https://chatgpt.com/c/6ab628ce-b03c-83e8-8d9a-6ce0f6fb4533) 中指示 Codex 觸發 Sites 第 21 版部署（使用最新推送之 GitHub 代碼或 `tv-site-v21.tar`）。
- Blockers:
  - 無。

---
# Antigravity 接手確認：電視夢工場現況核實
- Updated: 2026-10-05T00:44:00+08:00
- Agent: Antigravity
- Goal: 正式接手《電視夢工場：新世代》專案，核對代碼、測試套件、Git 狀態及存檔相容規則，等待玩家指示下一項具體需求。
- Project: `C:\Users\Shackie\Documents\Codex\2026-09-05\1980-2026-hong-kong-cinema-tycoon`（TV 遊戲位於 `outputs/game/tv-station/`）。
- Current state:
  - 已讀取並核實 `outputs/game/tv-station/` 全部核心檔案（`engine.js`、`app.js`、`models.js`、`engine.test.mjs`、`README.md`、`styles.css`、`index.html`）。
  - 單元測試套件 `node --test outputs/game/tv-station/engine.test.mjs` 24/24 全數通過（含外購節目完整播出次數 `catalogCompletedAirings`、手動重播輪次、直播時鐘、大型活動與舊存檔遷移相容測試）。
  - 代碼語法檢查 `node --check` 針對 `app.js`、`engine.js`、`models.js` 全數通過。
  - Git 工作樹乾淨（電視遊戲目錄無未提交修改）。
  - 本次未對遊戲邏輯、UI、存檔模型或線上部署做任何代碼修改。
- Confirmed decisions to keep:
  - 語言：香港繁體中文。
  - 架構：單人、純前端瀏覽器本機存檔（key: `tv-dream-studio-v1`）。
  - 存檔相容：保留舊存檔之資金、節目、版權、排播進度及 RNG，不破壞舊進度。
  - 核心規則：外購節目絕不自動重播；播出次數計算為完整成套輪次；現實 30 秒推進 1 個遊戲小時；電視遊戲與原電影遊戲完全獨立分開；私人 Sites 部署維持擁有人專用。
- Verification:
  - `node --test outputs/game/tv-station/engine.test.mjs`：24/24 通過 (0 fail, ~112ms)。
  - `node --check` 三個主要 JS 檔無語法錯誤。
  - Git 工作樹乾淨。
- Next:
  - 等候玩家提供下一項具體功能改動或測試指示。
- Blockers:
  - 無技術阻礙。等候玩家下一項指示。

---
# 交接給 Cursor／Antigravity：電視夢工場現有開發（最新）
- Updated: 2026-10-05T00:39:21+08:00
- Agent: Codex
- Goal: 玩家要求將現有遊戲開發現況交予 Cursor／Antigravity。今次只做交接，冇授權或指定新功能改動；接手後先核對現況，再按玩家下一項具體需求開發。
- Project: `C:\Users\Shackie\Documents\Codex\2026-09-05\1980-2026-hong-kong-cinema-tycoon`。TV 遊戲本機檔案 `outputs/game/tv-station/`，引擎 `engine.js`、介面 `app.js`、存檔模型 `models.js`、測試 `engine.test.mjs`、玩法 `README.md`。原電影遊戲係獨立作品，唔好當成電視遊戲重新開發。
- Current state: 2026-10-05 已重新核對 GitHub `Jberger11/hong-kong-cinema-tycoon` 嘅 `tv-station/` 六個主要檔案同本機逐字一致；私人 Sites 電視遊戲仍係第 20 版，網址 `https://tv-dream-studio-shackie.jerbolo.chatgpt.site`，access mode `custom`。遊戲有 $30m 新局經濟、每日／每週排播、節目製作、外購片庫及限期版權、手動重播、首播決策、逐套戰報、觀眾來信、兩間對手台、賣埠、體育賽事同慈善夜／才藝大賽／選美盛典。瀏覽器本機存檔 key `tv-dream-studio-v1`。
- Last completed work: 上次 Codex 修正外購節目「已播 61 次」誤將逐集次數當成成套播出次數：20 集播過 61 集，片庫顯示「已完整播出 3 次」；未播完嘅一輪唔計。排播選片仍按本輪計剩餘集數。見下方 2026-09-27 詳細紀錄；今次**冇改遊戲程式、存檔或線上版本**。
- In progress / unfinished: 玩家真實長局存檔、真實手機／iOS Safari 同登入後私人站點畫面未直接測試。後續開發題目待玩家指示；唔好因為本交接自行重做遊戲或推測要加新功能。
- Decisions the user already made: 用香港繁體中文；單人、瀏覽器本機存檔；保留舊現金、節目、版權、排播同 RNG；外購作品唔准自動重播；「播出次數」係完整播完成套節目嘅次數；現實 30 秒行 1 個遊戲小時；電視與電影遊戲分開；私人 Sites 保持原有擁有人存取。Cursor／Antigravity 透過本檔作非即時交接。
- Verification: 今次只做讀取核對：GitHub `tv-station/` 六檔與本機逐字相同，Sites 回報第 20 版及 `custom` 存取；未執行新測試、未測真機、未啟動 Cursor／Antigravity 工作階段。之前 24 項測試通過嘅紀錄見下方，但屬 2026-09-27 結果。
- Next — Cursor／Antigravity 三項優先工作: (1) 開啟呢個專案時先讀本檔、`outputs/game/tv-station/README.md`、當前代碼及 Git 狀態，核實下方舊紀錄；(2) 向玩家確認下一項具體開發需求，或等玩家直接指示，今次交接本身唔代表授權新功能；(3) 接手後於本檔記錄自己嘅改動、測試及剩餘事項，保留舊存檔相容與私人部署設定。
- Blockers: `AGENT_HANDOFF.md` 已作共享交接，但未有可驗證嘅 Cursor／Antigravity 即時對話或已讀回覆；唔好將寫檔當成對方已收到或已開始工作。冇新開發阻礙。

---
# 電視夢工場：外購節目完整播出次數修正（較舊紀錄）
- Updated: 2026-09-27T04:46:08+08:00
- Agent: Codex
- Goal: 修正片庫「已播 61 次」將逐集播映次數誤當成成套節目播出次數；按玩家要求顯示完整播出幾次。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支 TV 目錄最新提交 `e7c3d4463a376134c77583dc655160d5164a19f7`；擁有人專用 Sites 第 20 版部署 `appgdep_6ab82ef3c7a08191b586166a7d00f502` 成功，來源提交 `290af3c064c159e198bd9a58275013d56f47120e`。現有經濟、每日／每週排播、三種大型活動、逐套戰報、首播決策、觀眾來信、兩台對手、體育賽事、外購手動重播、賣埠與季度結算保留；原電影遊戲未改。存檔 key `tv-dream-studio-v1`。
- Last completed work: `outputs/game/tv-station/engine.js` 新增 `catalogCompletedAirings`，用累計逐集播映數除以全套集數並只計完成整輪；20 集節目播過 61 集顯示完成 3 次，第 4 輪只播 1 集不計。`catalogCycleProgress` 獨立計當前手動重播輪次剩餘集數。`app.js` 片庫待重播、版權到期、已購作品狀態改顯示完整播出次數，電影仍按實際放映次數；排播選片按本輪計剩餘集數。`engine.test.mjs` 加 61/20、手動再播、電影計數回歸；`README.md` 更新口徑。無修改舊存檔內 `runs`、現金、版權或 RNG。
- In progress / unfinished: 玩家真實長局存檔及真實手機／iOS Safari 未直接測試；登入後私人站點實際畫面亦未直接測試。
- Decisions the user made: 總次數指成套節目播完幾次，唔係每集各算一次；未播完下一輪唔當一次。香港繁體中文、單人、瀏覽器本機存檔；舊現金、節目、版權、排播、RNG 不重設；外購作品不自動重播；電視與電影遊戲分開；Sites 保持擁有人專用；Cursor 只用本檔非即時交接。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 24/24 通過，三個 JavaScript 檔 `node --check` 通過。Chrome 390px 觸控模擬注入第 149 日、20 集《大時代》`runs=61`、播映權至第 201 日：片庫顯示「已完整播出 3 次」，按「重播一輪」後排播卡顯示 20 集可播；原 `runs=61`、現金與版權到期日不變，無水平溢出。Sites 第 20 版 `succeeded`，access custom 一位使用者、零群組。未測真機或玩家私有存檔。
- Next — Cursor 三項優先工作: (1) 用玩家原有存檔直接核對《大時代》等已購節目完整播出次數，注意舊版自動重播留下嘅逐集數；(2) 真機檢查片庫待重播區、重播後排播選片剩餘集數及 320px／390px 字體；(3) 長局測完整播出次數喺多次手動重播、版權續購和電影放映下持續正確。
- Blockers: 無發佈阻礙。Sites 官方 Windows 打包步驟缺 Bash；來源推送成功後已用本機 `tar` 打包同一乾淨提交部署。未取得玩家真實存檔或真機測試。

---
# 電視夢工場：30 秒直播、逐套成績、大型活動與排播總覽（較舊紀錄）
- Updated: 2026-09-27T04:30:00+08:00
- Agent: Codex
- Goal: 加快「正在播映」至現實 30 秒一個遊戲小時；每套節目結算顯示成績；加入慈善夜、才藝大賽、選美盛典；排播不再要在 24 小時長清單內上下捲動。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支 TV 目錄最新提交 `2d8b69ff68ff864019c63cfd21502ed133bf8352`；擁有人專用 Sites 第 19 版部署 `appgdep_6ab82b2cd8e48191a383520c8f1e9ad2` 成功，來源提交 `92f2a52bfcad6dc080588855699dd1c8bc98e1d7`。現有 $30m 開局經濟、每日／每週排播、製作、首播決策、觀眾來信、兩台對手、體育賽事、外購手動重播、賣埠與季度結算保留；原電影遊戲未改。存檔 key `tv-dream-studio-v1`。
- Last completed work: `outputs/game/tv-station/app.js` 將時鐘更新間隔改為 500ms／遊戲分鐘（30 秒／小時）；每日結算後直接去戰報展示逐套時段成績，戰報可翻最近七日，列我台／最強對手收視、廣告收益、大型活動後果；自製表加入三款大型直播。返回排播頁仍以時間格為主，逐套成績不會將排播表推落長頁下方。`engine.js` 加三款活動嘅一次性製作／播映、週末黃金檔效果、慈善籌款與台現金分帳、才藝熱度／選美口碑事件，儲存逐套結算資料及一晚限定標籤；`models.js` 新增可遷移欄位；`styles.css` 把排播改成 24 格同屏網格，短手機用 00–11／12–23 時切換，亦加成績卡；`engine.test.mjs` 與 `README.md` 更新。
- In progress / unfinished: 真實手機、iOS Safari、玩家現有長局存檔，以及登入後私人站點嘅實際畫面未直接測試。逐套戰報最多保留七日，仍需真人長局測試活動成本／回報與事件頻率。320×568 短畫面以兩鍵切時間段，390px 畫面 24 格同屏。
- Decisions the user made: 香港繁體中文、單人、瀏覽器本機存檔；舊現金、節目、版權、排播、RNG 不重設；外購作品不自動重播。現實 30 秒推進遊戲 1 小時，唔跟現實時鐘；大型慈善／比賽／選美可自製，每套節目要有結果，排播不靠長列表捲動。電視遊戲與電影遊戲分開；Sites 保持擁有人專用；Cursor 用本檔作非即時交接。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 23/23 通過，三個 JavaScript 檔 `node --check` 通過。Chrome 觸控模擬 390×844：24 格及日結按鈕同屏；320×568：12 格分段、切換至晚間、點檔開編輯、製作慈善夜並排播、日結慈善籌款及 11 個逐套成績卡、首播決策、戰報頁均可操作；日結直接打開戰報，再返回排播頁不顯示長成績列表；無水平溢出。GitHub 首輪六檔逐字核對，其後 `app.js`、`README.md` 再同步小改；Sites 第 19 版 `succeeded`，access custom 一位使用者、零群組。未測實體手機／登入後線上畫面。
- Next — Cursor 三項優先工作: (1) 用玩家真機及舊長局存檔測 320px／390px 排播分段、所有大型活動製作與逐套成績，尤其首播彈窗後嘅捲動位置；(2) 跑至少 90–180 日統計三類活動成本、廣告收入、籌款及對手勝率，調校平衡；(3) 改進逐套戰報排序及活動後續事件，讓才藝冠軍、選美得獎者可以進入後續製作選擇，但保持舊存檔和外購手動重播規則。
- Blockers: 無發佈阻礙。Sites 官方 Windows 打包步驟仍缺 Bash；來源推送成功後已用本機 `tar` 打包同一乾淨提交部署。未有玩家真實手機或私人存檔，不能聲稱已測。

---
# 電視夢工場：模擬直播時鐘（較舊紀錄）
- Updated: 2026-09-27T04:03:19+08:00
- Agent: Codex
- Goal: 將「正在播映」由香港實際時間改成遊戲模擬時鐘，現實 1 分鐘＝遊戲 1 小時。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支最新 TV 版提交 `c227dea6c9fa5e01ca0f47a5174bd398ea295647`；私人 Sites 電視遊戲第 17 版部署 `appgdep_6ab824ecd63c8191b58d752294565e66` 狀態 `succeeded`，來源提交 `d9ab41d0493e52cb7b1c0c356121154f02bd745c`。現有排播、製作、首播決策、賣埠、外購手動重播、對手、體育同結算保留；原電影遊戲未改。存檔 key 仍為 `tv-dream-studio-v1`。
- Last completed work: `outputs/game/tv-station/engine.js` 加純遊戲時鐘 `advanceBroadcastClock`，`broadcastNow` 按存檔分鐘對應排播節目，舊檔無此欄位時設為 00:00；到 24:00 停止預覽，玩家按「播出今日」先真正結算並重設下一日 00:00。`models.js` 加 `liveMinute`；`app.js` 頁面可見而冇首播／重開對話框時，每秒推進 1 個遊戲分鐘，每 10 秒保存時鐘，HUD 顯示速率及播畢提示；`styles.css` 手機顯示時鐘速率；`engine.test.mjs` 測跨時段、24:00、資金／集數不變及舊檔相容；`README.md` 更新玩法。
- In progress / unfinished: 實體手機、iOS Safari、玩家本人舊存檔同登入後私人站點畫面未直接測試。時鐘只作當日播映預覽；經濟與集數仍由「播出今日」結算，避免離線期間自動消耗資源。
- Decisions the user made: 香港繁體中文、單人、瀏覽器本機存檔；舊現金、節目、版權、排播不可重設；外購作品唔准自動重播。用模擬時間，現實 1 分鐘可對應遊戲 1 小時，唔跟現實時鐘。電視同原電影遊戲分開；Sites 只限擁有人。Cursor 以本檔作非即時交接。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 21/21 通過；三個 JS 檔 `node --check` 及 `git diff --check` 通過。本機 Chrome 390px／320px 觸控模擬：時鐘每秒前進 1 分、跨小時切節目、24:00 停住、手動結算後重置 00:00、重開對話框暫停均通過；無水平溢出。GitHub 六檔與本機逐字核對；Sites 第 17 版 `succeeded`、custom 一位使用者、零群組。未測真機或登入後線上站。
- Next — Cursor 三項優先工作: (1) 真機確認 1 分鐘＝1 小時、手機背景／回到遊戲嘅時鐘停行行為；(2) 用玩家現有長局存檔核對換版時 `liveMinute` 初始化及每日結算後顯示；(3) 如玩家想全自動播映，再設計可明確開關嘅自動結算，但唔好默認背景扣錢或跳集。
- Blockers: 無發佈阻礙。Sites 官方工作流在 Windows 推送後打包仍缺 Bash；確認來源已推送後，以本機 `tar` 打包同一乾淨提交部署。未取得玩家真實存檔或真機測試。

---
# 電視夢工場：首播戰報與排播卡片（較舊紀錄）
- Updated: 2026-09-27T03:52:23+08:00
- Agent: Codex
- Goal: 讓唔同節目真正有首播效果與玩家決策，並取代難用嘅長節目下拉清單，改善長期遊玩手感。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支最新 TV 版提交 `fdf0962047d933904a5dcbd85cb220716f2ecc15`；私人 Sites 電視遊戲第 16 版部署 `appgdep_6ab82259e9dc81919ac993a7f3ae087b` 狀態 `succeeded`，來源提交 `1dba0cef360fb1e909863e9e1a4a549dea0c913a`。電視遊戲仍有每日／每週排播、製作與賣埠、外購／手動重播、兩間對手、觀眾來信、體育暗標及季度結算；原電影遊戲未改。存檔 key 仍為 `tv-dream-studio-v1`。
- Last completed work: `outputs/game/tv-station/engine.js` 加首播隊列、按實際首日收視與最強對手比較影響下集收視／話題，並為劇集、綜藝、深夜、新聞、財經、外購節目加入分別效果；玩家可花錢宣傳、改善內容或免費守住節奏，數值及資金會真實改變。快進在未處理首播時停下。`models.js` 加待處理首播及首播歷史，舊檔遷移只補空欄位，不改現金／節目／排播。`app.js` 加全屏首播戰報、選項及戰報歷史；排播節目改為可搜尋、按未排／自製／外購／每日／開台片庫篩選嘅觸控卡片。`styles.css` 加手機樣式及減少動畫偏好處理；`engine.test.mjs` 加首播／舊檔回歸測試；`README.md` 更新玩法。
- In progress / unfinished: 首播係現階段第一個播出決策節點；仍需真人長局評估有冇足夠多中後期目標與事件。真實手機、iOS Safari、玩家本人舊存檔及登入後私人站點畫面未直接測試。
- Decisions the user made: 香港繁體中文、單人、瀏覽器本機存檔；舊現金、作品、播映權同排播不可整局重設。外購作品唔准自動重播，須手動開新一輪並重新排檔。外購市場每月更新，有更多 ViuTV 原創劇；有錢可繼續製作並可賣埠。電視同原電影遊戲分開；Sites 只限擁有人。Cursor 以本檔作非即時交接。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 19/19 通過；三個 JS 檔通過 `node --check`，`git diff --check` 通過。本機 Chrome 390px／320px 觸控模擬：搜尋及類別篩選選節目、製作→排檔→首播→選擇、資金與節目屬性改變均成功，無水平溢出。GitHub 六檔同本機逐字核對；Sites 第 16 版 `succeeded`、仍係 custom 一位使用者、零群組。未測實體手機或登入後線上站。
- Next — Cursor 三項優先工作: (1) 用真實手機及玩家現有存檔試首播彈窗、搜尋輸入法、卡片滑動同底部選擇按鈕；(2) 做 90–180 日長局，量度首播選項成本與節目回報，調整不同類型中後段事件及對手反擊節奏；(3) 將節目製作／排播之間加入更有操作感嘅現場製作或即時收視事件，保留舊存檔及外購手動重播規則。
- Blockers: 無發佈阻礙。Sites 官方工作流喺 Windows 推送後打包仍缺 Bash；確認來源已推送後，以本機 `tar` 打包同一乾淨提交部署。未取得玩家真實存檔或真機測試。

---
# 電視夢工場：外購節目停止自動重播（較舊紀錄）
- Updated: 2026-09-27T02:09:30+08:00
- Agent: Codex
- Goal: 修復玩家截圖所見《使徒行者》第 8 / 20 集「重播第 1 輪」仍自動佔住 19:00 檔期嘅錯誤，保留外購重播權但必須由玩家手動決定每一輪重播。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支電視遊戲最新提交 `00a7a856ca9eec7a5c6d743e8452938fe2f6c42e`；私人 Sites 電視遊戲第 15 版部署 `appgdep_6ab80a3b13488191843a13fc3cead3fc` 狀態 `succeeded`，來源提交 `2899f5a468f5d39c4bb9ae0db95c7e4dcdc57092`。現有經濟、每月市場、製作、賣埠、對手首播、觀眾來信、體育暗標及原電影遊戲不變。存檔 key 仍為 `tv-dream-studio-v1`。
- Last completed work: `outputs/game/tv-station/engine.js` 外購劇／電影一輪播完即騰空排播時段，同日多檔不會越過最後一集；`startCatalogReplay` 只在播映權有效且一輪播完時明確開新一輪，保持原有 `runs`、現金和版權期限，重新排檔由玩家操作。舊存檔如已有自動重播紀錄，載入後只移走該排播、保留次數及權利；手動重播從第 1 集／新一次電影播映開始，收視折減繼續。`models.js` 儲存手動重播邊界和輪數；`app.js` 排播提示與片庫「重播一輪」按鈕、重播後開排檔編輯器；`styles.css` 補手機提示樣式；`README.md` 更新玩法；`engine.test.mjs` 加入舊檔、影劇、同日多時段回歸測試。
- In progress / unfinished: 玩家真實存檔未取得，不能直接驗證該特定存檔；已用截圖同類「20 集但累計播 27 次」模擬存檔驗證。真實手機、iOS Safari、登入後私人站點畫面未直接測試。
- Decisions the user made: 香港繁體中文、單人、瀏覽器本機存檔；舊現金、作品、播映權與排播進度不可整局重設。外購作品可在 6 個月／1 年播映權期內重播，但**唔好自動重播**；玩家自行選「重播一輪」同排檔。保留每月外購更新、ViuTV 選擇、無製作額上限、對手互動，電視同電影遊戲分開；Sites 仍只限擁有人。Cursor 透過本檔作非即時交接。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 17/17 通過，三個 JS 檔 `node --check` 通過；本機 Chrome 390px 觸控模擬：注入《使徒行者》20 集、已播 27 次嘅舊存檔後重載，現金 HK$30m、`runs=27`、版權到第 181 日不變，自動檔期清走；片庫按「重播一輪」只開編輯器，不自動排播，玩家按「加入節目表」後顯示「第 1 / 20 集 · 手動重播第 2 輪」。320px／390px 排播及片庫無水平溢出。GitHub 六檔與本機逐字核對；Sites 第 15 版 `succeeded`，存取仍為 custom 一位使用者、零群組。未測實體手機或登入後線上站畫面。
- Next — Cursor 三項優先工作: (1) 用玩家真實手機／舊存檔核對換版後《使徒行者》排播清理、片庫按鈕及自行排檔；(2) 跑超過 180 日，測多輪重播、到期續購後手動重播、同日雙時段及影劇混合檔期；(3) 若片庫長期累積太多待重播作品，改善已購作品整理和續購提醒，但保留手動重播及舊存檔相容。
- Blockers: 無發佈阻礙。Sites 官方工作流喺 Windows 推送後打包仍缺 Bash，按乾淨來源提交另用本機 `tar` 同版打包部署。未取得玩家真實存檔，無法直接驗證其私有資料。

---
# 電視夢工場：每月外購市場及互動經營（較舊紀錄）
- Updated: 2026-09-27T01:19:03+08:00
- Agent: Codex
- Goal: 將外購市場改成每 30 個遊戲日上新，並回應玩家要求，解除每季三套製作額、加入自製節目賣埠、對手新作、觀眾評語及來信，令經營抉擇更互動。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支電視遊戲最新提交 `9bede753e01ac676cdab5e7aec3b30ce94665512`；私人 Sites 電視遊戲第 14 版部署 `appgdep_6ab7fe6764308191b088569f061e59fc` 狀態 `succeeded`，來源提交 `31ff6ef4569c26fccd50c3bf7513e2c1bfe5f152`。`outputs/game/tv-station/` 仍係獨立單人瀏覽器遊戲，現有經濟、每日／每週排播、房間以外電視台 UI、體育拍賣、兩間對手、藝人、外購播映權與季度結算保留；存檔 key `tv-dream-studio-v1`，舊現金、片庫、合約／競投、排播及 RNG 進度不重設。原電影遊戲未動。
- Last completed work: `outputs/game/tv-station/engine.js` 每 30 日輪換 20 套外購作品，47 套 ViuTV 原創劇固定可揀、已購版權不失效；快進於換月停低。解除製作上限，新增四種企劃橋段、風險及回報；自製有限集數節目可聯播授權兩間對手或獨家賣斷，對手晚間真實播出並改變對台收視；每日新聞／財經不得賣埠，避免低成本套現。兩間對手每月首播新作；播出後產生模擬觀眾評語，每九日有點播／禮物／投訴來信及回覆效果。`models.js` 加賣埠、信箱與評語欄位；`app.js` 展示市場換月、企劃、賣埠、對手首播及觀眾信箱；`styles.css` 補手機介面；`README.md` 更新玩法；`engine.test.mjs` 新增回歸測試。舊存檔由 `migrateLegacyLicenses` 補新欄位。
- In progress / unfinished: 仍需真人長局平衡賣埠價、對手首播強度、觀眾來信節奏與每月片單重複度。觀眾評語係按收視生成嘅遊戲模擬內容，未有更深入嘅角色式互動。真實手機、iOS Safari、登入後私人站點畫面未直接驗證。
- Decisions the user made: 香港繁體中文、單人、瀏覽器本機存檔；舊進度不重設；增加 ViuTV 選擇；外購片可 6 個月／1 年重播、每月更新；有錢可無限製作、自製節目可賣畀其他台；對手須展示新節目並真實競爭；加入觀眾留言、點播與禮物。電視遊戲同原電影遊戲分開，私人站點仍只限擁有人。Cursor 以本檔做非即時交接，冇 live chat。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 15/15 通過，三個 JS 檔 `node --check` 通過；本機 Chrome 模擬 390px／320px 觸控，製作、賣埠、對手節目、觀眾回信及刷新存檔操作成功，五個主要頁面無水平溢出。GitHub 六個檔與本機逐字核對；Sites 第 14 版 `succeeded`，存取仍為 custom 一位使用者、零群組。未測實體手機、iOS Safari 或登入後私人站點實際畫面。
- Next — Cursor 三項優先工作: (1) 真機測 320px／390px 新企劃選擇、賣埠按鈕、信箱回覆及換月片單，修正觸控或遮擋問題；(2) 用舊存檔跑 180 日以上，檢查多季經濟、外購續購、賣埠收入、來信頻率與對手收視是否平衡；(3) 擴充觀眾互動同競爭策略，例如不同觀眾群、對手搶劇及長期授權，但先保持存檔相容。
- Blockers: 無發佈阻礙。Sites 官方工作流喺 Windows 推送成功後打包仍缺 Bash，依照乾淨來源提交另用本機 `tar` 打包同版部署。真人真機與私人站點登入後 QA 尚未完成。

---
# 電視夢工場：ViuTV 原創劇片庫（較舊紀錄）
- Updated: 2026-09-27T01:01:13+08:00
- Agent: Codex
- Goal: 減少片庫嘅 TVB 偏重，將玩家列出嘅 2020–2026 年 ViuTV 原創劇全數加入外購選擇，令 ViuTV 更容易搵到同選購。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支電視遊戲最新提交 `3bfea99a4c6c7200deaa0a53aa2517d34d4026ec`；私人電視台站點第 13 版已部署成功，Sites 來源 `d1f269e3a4b702bd6ff26c18240e372f33f96a95`、部署 `appgdep_6ab7f9f9e414819191be09016e9ae9ee`。仍係單人瀏覽器本機存檔；電影遊戲及其部署未動。
- Last completed work: `outputs/game/tv-station/engine.js` 新增玩家列出嘅 47 套 ViuTV 原創劇，2020–2026 各年份全數同季可揀，固定 ID 跨季度保留，既有 20 套輪換外購作品同舊 ID 不改；版權價、集數、品質、收視屬遊戲模擬。`models.js` 讓新購片保存電視台及作品年份；`app.js` 片庫預設先睇 ViuTV，加入電視台、年份、劇名搜尋，製作主演名單先顯示 ViuTV 相關演員，新局預選 ViuTV 相關主演。`styles.css` 補 320px／390px 篩選及標籤；`README.md` 更新玩法；`engine.test.mjs` 驗證全部 Viu 劇跨季度可揀、舊 ID 保留、購買後年份及電視台保存。
- In progress / unfinished: 真實手機、iOS Safari、登入後私人站點畫面未直接目視測；應真人試玩多季，評估大量即時可買劇集令遊戲經濟或策略難度失衡。既有部分自製節目及其他片庫仍有 TVB 元素，因玩家要求係增加 ViuTV 選擇，未刪除舊作品。
- Decisions the user made: 玩家唔鍾意 TVB，要較多 ViuTV 選擇；使用玩家提供嘅 2020–2026 劇名。保持香港繁體中文、單人、瀏覽器本機存檔；舊現金／已買版權／排播／競投不重設；6 個月／1 年版權及重播疲勞保留；電視與電影遊戲分開；Sites 保留只限擁有人。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 11/11 通過，三個 JS 檔通過 `node --check`；本機 Chrome 模擬 390px／320px 觸控：片庫預設 ViuTV 48 套（47 原創劇加一套輪換 Viu 作品）、搜尋「IT狗」顯示兩輯、2026 年篩選顯示六套、購入《COURT!》後存檔有 `network=ViuTV` 及 `releaseYear=2026`，無水平溢出。GitHub 六個更新檔與本機內容逐字核對一致；Sites 第 13 版部署 `succeeded`，存取自訂僅一位使用者、零群組。未測實體手機／登入後私人站點畫面。
- Next — Cursor 三項優先工作: (1) 真機試 320px／390px 片庫搜尋、年份篩選、購買及返回排播；(2) 玩家實玩一季，記錄 ViuTV 外購劇價格與廣告回報，避免 47 套同時上架破壞自製節目價值；(3) 若玩家仍嫌演員偏 TVB，按實際作品資料擴充 ViuTV 主演陣容並保持原有存檔 ID。
- Blockers: 無發佈阻礙。Sites 官方打包腳本喺 Windows 需要 Bash，今次來源先由 Sites workflow 推送，再以本機 `tar` 按相同乾淨提交打包部署。私人站點需登入，不能聲稱已直接驗過線上登入後或真機畫面。

---
# 電視夢工場：每週排播及外購節目限期重播（較舊紀錄）
- Updated: 2026-09-27T00:35:44+08:00
- Agent: Codex
- Goal: 擴充外購節目選擇，讓玩家分平日／週末／每週一次排播、防止誤排重複節目，並讓外購節目有 6 個月或 1 年可重用播映權及重播疲勞。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支電視遊戲最新提交 `bf59f2eeda26034c2651dfe3d69f3a44e4182467`；私人電視台站點第 12 版已部署成功，Sites 來源 `45993e6d3a2a61cd3593b08ffe02fb6416418eaf`、部署 `appgdep_6ab7f4297f0481918acfb27156780b27`。仍係單人瀏覽器本機存檔；電影遊戲及其部署未動。
- Last completed work: `outputs/game/tv-station/engine.js` 將每季外購片單由 8 擴成 20 套，保留舊 8 套 ID；加入 180／360 日播映權、續購、集數循環重播、每輪收視／話題折減（最低 72%）、到期釋放時段；排播支援七日、平日、週末、每週一次及同日重播顯式確認。`models.js` 儲存權利期限並為新局免費電影設定 180 日，之後續購按模擬市價付費；舊存檔免費電影如曾出現零續購價亦會修正，不追收現金。`app.js` 片庫可選期限／續購、排播表可切七日、已排節目在選單標示時段、防止誤排。`styles.css` 補手機介面；`README.md` 改玩法說明；`engine.test.mjs` 增加權利／舊檔／週表回歸測試。
- In progress / unfinished: 真實手機、iOS Safari 及登入後線上私人站點畫面仍未目視測；需要多季真人試玩，檢查續購頻率、重播疲勞與資金平衡。Chrome 有非致命表單欄位缺 `id/name` 提示，可後續改善。
- Decisions the user made: 香港繁體中文、單人、瀏覽器本機存檔；新局 $30m，舊檔現金／節目／排播／競投不重設；外購節目有效期內可重播，收視同話題會稍降；自製有限集數仍會播完清檔；新聞與新財經每日更新；電視與電影遊戲分開；Sites 保留只限擁有人。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 10/10 通過，三個 JS 檔通過 `node --check`；本機 Chrome 模擬 390px／320px 觸控：20 套片單、1 年版權購入、每週一排播、存檔重新載入、無頁面橫向溢出。第 11 版 GitHub 六個更新檔與本機逐字核對一致；第 12 版再更新三檔防止免費電影零價續購。Sites 第 12 版部署 `succeeded`，存取仍為自訂僅一位使用者、零群組。未測實體手機／登入後線上畫面。
- Next — Cursor 三項優先工作: (1) 真機 320px／390px 玩一週，驗證七日切換、選單、彈窗捲動及按鈕可按；(2) 玩至少兩個版權期，紀錄重播次數、收視與廣告收入、續購成本，調整疲勞係數及版權價；(3) 在片庫加每套外購節目剩餘版權日數／下一次重播預測收入，方便策略比較。
- Blockers: 無發佈阻礙。Sites 打包腳本內部要用 Bash，Windows 未能啟動；本次來源先由工作流程推送，再用本機 `tar` 按同一乾淨提交打包並完成部署。私人站點需登入，不能聲稱直接驗過線上登入後或真機畫面。

---
# 電視夢工場：財經節目改為每日更新（較舊紀錄）
- Updated: 2026-09-27T00:09:12+08:00
- Agent: Codex
- Goal: 令新製作財經節目同新聞一樣每日出新一期，不選總集數；確保持續製作費及廣告收入合理，保存舊檔投資。
- Current state: `Jberger11/hong-kong-cinema-tycoon` 主分支電視台遊戲最新提交 `8dd29cf296ae985e418de59cbefe2c9113abe2da`。私人電視台站點第 10 版已部署成功，Sites 來源提交 `8975d5fa593d70ee14929d6d85da79f9ea7a46b1`、部署 `appgdep_6ab7ee10beec81918990346be8e738ea`，原有擁有人專用存取設定未改。電影遊戲及其部署未動。
- Last completed work: `outputs/game/tv-station/engine.js` 新財經節目與新聞共用每日更新規則（首期即付、往後每次播出按集付費），財經單集製作係數由 .62 改 .04、每小時廣告單價 180（新聞 130），讓較小眾財經收視仍有商業選擇；舊檔有限集數財經節目仍按原集數播完且不追收每日費。`app.js` 財經表單隱藏總集數、顯示首期投入及每日續費、排播選單標示「每日財經」。`README.md` 說明規則；`engine.test.mjs` 新增兩項存檔及每日收費測試。
- In progress / unfinished: 仍需真人試玩多季，評估財經／新聞同其他類型節目嘅機會成本與每季製作上限。實體手機及線上登入後畫面未測。
- Decisions to keep: 香港繁體中文、單人、瀏覽器本機存檔；新局 $30m，舊存檔現金／節目／競投不重設；舊預付財經節目不轉成每日扣費；有限節目播完清檔，新聞與新財經長期每日更新；電視／電影遊戲維持獨立；Sites 維持只限擁有人。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 6/6 通過，`node --check` 遊戲 JS 通過；本機 Chrome 模擬 390px 及 320px 觸控見財經無集數選項、首期 $14k、製作後 `episodes=0`、「每日財經」排播選單及無水平溢出。30 日標準兩小時財經模擬：首期 $14k，其後每日 $14k，廣告單價上調後接近收支平衡（實際受排播及收視影響）。GitHub 四個更新檔與本機內容核對一致；Sites 第 10 版部署回報 `succeeded`。未驗實體手機／線上私人登入後畫面。
- Next — Cursor 三項優先工作: (1) 真機測財經製作與排播，尤其 320px／390px；(2) 多季實玩並紀錄每類型節目收入、製作費、空檔率，依數據再調財經廣告及製作上限；(3) 片庫加入每日節目每次播映收入／成本、節目累積盈虧，方便玩家比較新聞與財經策略。
- Blockers: 無發佈阻礙。線上站點需登入，先前自動審批拒絕代入登入頁；不能聲稱已親自目視登入後線上版或測過真機。

---
# 電視夢工場：集數完結、經濟平衡及深夜節目（較舊紀錄）
- Updated: 2026-09-26T23:56:23+08:00
- Agent: Codex
- Goal: 有限集數播完後釋放時段；提高新局資金；改善廣告與製作費平衡；加入可製作及排播的深夜節目。
- Current state: `Jberger11/hong-kong-cinema-tycoon` 主分支電視遊戲最新提交 `f4b12fe0eb9033d7b383f1b53a1909ae2b93988a`；獨立 `tv-station/` 與原有電影遊戲分開。私人電視台試玩站第 9 版已部署，Sites 來源提交 `e2320709252f6a0735bd3ce7c5b93f482b9e3138`，部署 `appgdep_6ab7eb05888c81918cac30d1e045f5e8` 回報 `succeeded`。原電影遊戲及其部署未改。
- Last completed work: `outputs/game/tv-station/models.js` 新局現金改為 HK$3,000 萬，不改舊存檔；`engine.js` 有限集數播完清檔、同日多時段不超播、空檔零廣告、播完禁止重新排播、首播廣告依收視平方計算並區分免費開局非獨家節目，新增深夜節目與 22:00–02:00 收視加成；`app.js` 載入舊檔時只清過期時段、提示補位、營運七日與快進於節目完結停低、深夜節目預設 22:00 排播；`styles.css` 補完結提示手機樣式；`README.md` 更新玩法；`engine.test.mjs` 加四項回歸測試。
- In progress / unfinished: 對多季度玩法仍需真人試玩，特別係大量有限節目播完之後，單季最多製作 3 套與外購片單能否支撐足夠排播選擇；今次未改製作上限。線上私人站點登入後未直接目視核對。
- Decisions to keep: 繁體中文、單人、瀏覽器本機存檔；新局先採 HK$3,000 萬，舊檔保留現金／節目／排播／競投；有限節目播完清檔，新聞等每日更新節目長播；深夜節目夜間較有利但可蝕本；原電影遊戲同電視遊戲維持獨立；站點維持原有只限擁有人存取。Cursor 用本專案 `AGENT_HANDOFF.md` 非即時聊天。
- Verification: `node --test outputs/game/tv-station/engine.test.mjs` 4/4 通過；`node --check` 三個 JS 檔通過。90 日定量模擬：免費開局排播約賺 $2.7m；標準 8 集雙主演劇投入 $4.734m，低／中／高收視廣告約 $4.53m／$5.77m／$6.17m；標準 8 集深夜節目投入 $1.528m，低／中／高收視廣告約 $1.08m／$1.53m／$2.15m。Chrome 模擬 390×844 及 320×568 觸控：新局 $30m、首日電影播完清檔、提示、深夜製作→22:00 排播、存檔、無橫向溢出。GitHub 六檔與本機核對一致；Sites 第 9 版部署成功。未測實體手機；未直接目視私人站點登入後畫面。
- Next — Cursor 三項優先工作: (1) 真機玩一整季，記錄 320px／390px 時補位提醒、深夜排播及按鈕可達性；(2) 用不同排播策略試三季，根據實際可用節目量決定是否提高每季製作上限／增加外購供應，避免後半季只剩空檔；(3) 將每套節目累計製作費、累計廣告收入、盈虧及剩餘集數直接顯示喺片庫，方便玩家判斷續製。
- Blockers: 無發佈阻礙。線上站點需登入；先前登入自動審批拒絕，因此今次以同版來源本機視覺 QA 加 Sites 部署狀態驗證，不能聲稱完成線上登入後或真機 QA。

---
# 電視夢工場：逐小時收視戰報已釐清（較舊紀錄）
- Updated: 2026-09-26T23:23:46+08:00
- Agent: Codex
- Goal: 解決玩家睇唔明 `8 : 50 / 55` 收視對比嘅問題，令每小時輸贏及廣告收入可直接閱讀。
- Current state: GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支現為 `fc25985b058f8dc116d96240608b0b9075028e61`；電視台站點第 8 版已成功部署到原網址，Sites 來源 commit `8971446ff6aefd4c75130adfe10353c9e0246b93`。舊電影遊戲及存檔未改；站點仍維持原有只限擁有人存取。
- Last completed work: `outputs/game/tv-station/app.js` 改成逐小時顯示「我台／全城電視／本地八台」各自 0–100 遊戲收視指數、勝出／打和／落後、每小時廣告收入；加入全日／黃金檔／落後時段篩選；低於 $1k 收入顯示實數，避免 `$0k`。`styles.css` 加手機清晰得分卡及顏色比較；`README.md` 補玩法解釋。
- Verification: `node --check` 三個 JavaScript 檔案通過；本機 Chrome 模擬 390×844、320×568 觸控畫面，三台標籤／18:00 勝負／黃金檔五小時篩選正確，無水平溢出或 console error。Sites 第 8 版部署回報 `succeeded`。未測實體手機；線上私人站點登入後畫面未直接檢視。
- Next: (1) 真機檢查戰報得分卡及篩選觸控；(2) 讓落後時段可從戰報一按跳到排播編輯；(3) 人工玩一週，評估收視指數、廣告收入同對手壓力有冇足夠策略差異。
- Blockers: 無發佈阻礙。線上站點需登入，而之前自動審批拒絕代入登入頁；本次沿用同版本本機視覺 QA 及 Sites 部署狀態核對。

---
# 電視夢工場：新世代 — 介面更新已發佈（較舊紀錄）
- Updated: 2026-09-26T22:48:39+08:00
- Agent: Codex
- Goal: 將獨立 `tv-station/` 嘅遊戲 UX 改成手機優先、可以直接排播同播出嘅操作介面，同步 GitHub 及現有電視台試玩網址。以下狀態取代本檔較舊嘅 GitHub/Sites 版本敘述；舊電影遊戲紀錄保留作歷史。

## Current state
- GitHub `Jberger11/hong-kong-cinema-tycoon` 主分支現為 `294ffe925f843420fd41f13063ff1e1a3b906ed0`；獨立電視遊戲在 `tv-station/`。原有電影遊戲根目錄及其大量本機未提交改動沒有加入今次推送。
- 電視台站點 `appgprj_6ab629fae41481918724bdad12747306` 第 7 版部署成功，網址 `https://tv-dream-studio-shackie.jerbolo.chatgpt.site`，來源 commit `7afa7d629fd1956b4e41a4903856d30c7d19df40`。存取模式仍係原有自訂／只限擁有人，未改觀眾設定。
- 遊戲仍有製作、片庫、兩間對手台、逐小時競爭、體育暗標、每日／季度報告；開局排好 24 小時節目表，劇集／綜藝／新聞等可製作，單人瀏覽器遊玩。

## Last completed work
- `outputs/game/tv-station/app.js`：開局直達排播；點時段打開底部編輯面板；播出一日／營運七日後即時顯示盈虧及對台勝出時數；製作或購買節目後直接前往排播；六個固定功能鍵；`tv-dream-studio-v1` 自動存檔；編輯面板 Escape、焦點返回及鍵盤焦點循環。
- `outputs/game/tv-station/styles.css`：固定遊戲視窗、底部功能列、可捲動時間表、320px／390px 手機版面、縮短報告數據卡；短屏底部操作唔再遮住時段；提示訊息避開功能鍵。
- `outputs/game/tv-station/README.md`：更新玩法、自動存檔及真機測試限制。站點來源 `work/tv-site-source/dist/` 由同一版五個靜態檔案建立；部署包 `work/tv-site-v7.tar`。

## In progress / unfinished
- 實體手機、iOS Safari、不同手勢／虛擬鍵盤未測；線上站點需登入，無法在本次自動檢查中直接目視登入後畫面。每個功能頁仍有長內容，尤其製作／報告；應根據玩家真機回饋繼續濃縮。
- `git diff --check` 對站點來源檔案提示幾個檔尾空白行；不影響 JavaScript 語法及發佈，但下次整理可順手清走。`work/tv-site-source` 是獨立 Sites Git clone，不可對外層電影遊戲倉庫做 `git add -A`。

## Decisions to keep
- 電視台遊戲保持繁體中文、單人、瀏覽器本機存檔；原有電影遊戲及其存檔／部署為另一個產品，勿以電視遊戲覆蓋。保存 TV 資金、節目、排播、競投狀態；重新開局才重設。Sites 私人觀眾設定勿自行改成公開。Cursor 交接只用本專案 `AGENT_HANDOFF.md`，無即時聊天連線。

## Verification
- `tv-station/app.js`、`engine.js`、`models.js` 及部署版 `dist/` 對應 JavaScript 檔案均通過 `node --check`。
- 本機 Chrome 模擬 320×568／390×844 觸控及 1280×800 桌面，排播替換、播出今日、營運七日、製作新聞後安排檔期、重載保留進度、彈窗 Escape 操作通過；所有六個功能頁 390px 無文件水平溢出。未做實體手機測試。
- GitHub 三個更新檔案與本機內容核對一致；Sites 第 7 版部署回報 `succeeded`，再次讀取站點見第 7 版、原有只限擁有人模式。登入後線上畫面未核對。

## Next — Cursor 三項優先工作
1. 用真機（尤其 320px／390px、iOS Safari）由排播到播出玩至少一週，記錄時段捲動、底部功能鍵及彈窗觸控問題，直接修實際擋手問題。
2. 把「製作」長表格分成可返回嘅 2–3 個遊戲步驟，保留目前 `selected` 及存檔狀態；完成後重測製作→排播→播出。
3. 將每日報告轉為可掃讀嘅收視戰報：先睇黃金時段勝負、盈虧及節目調整建議，再按需要展開 24 小時細表；避免增加純裝飾畫面。

## Blockers
- 無程式發佈阻礙；登入頁被自動審批拒絕，所以只完成同版本本機視覺 QA，線上登入後畫面同真機手勢需擁有人自行核對。

---
# GitHub／Sites／本機版本核對（2026-09-26；以下為較舊紀錄）
- Agent: Codex
- 透過已授權 GitHub 連接確認私人 repo `Jberger11/hong-kong-cinema-tycoon` 只有 `main`；最新提交仍為 `8c006175babb9dc4f40ed8af195a6df6e5890095`（2026-09-14）。GitHub 的 `app/page.tsx` 仍是 `export { default } from './game-ui';`。本機同一 repo HEAD 相同，但工作樹另有大量未提交改動，`app/page.tsx` 指向 `./lot-game`。
- Sites 公開網站現時仍是第 13 版，來源 SHA `ac48d0e4638aebfc60d8f44dd03101304dad1ba6`（2026-09-23 發佈）；此 SHA 與 GitHub HEAD 不同。GitHub、Sites 來源及本機工作樹是三條不同狀態，不能憑其中一條推斷其餘兩條已更新。
- 用戶稱遊戲已更新到其他內容；如指另一個 GitHub 倉庫／分支，現有 repo remote 並不指向它，須用確切 URL 核對。勿覆蓋任何來源。

---
# 線上版本核對（2026-09-23 18:14 +08:00）
- Agent: Codex
- 用戶指出公開網址一直沒有出現重做版。Sites 專案 `appgprj_6a9bb6e2dbdc8191b8d3f9c57a1cd0d8` 已有第 13 版、部署 `appgdep_6ab33cede1148191a513cb3e72f83eb9` 成功，來源 commit `ac48d0e4638aebfc60d8f44dd03101304dad1ba6`，2026-09-23 02:45 UTC 發佈。
- 重新以獨立瀏覽器分頁打開公開網址，實際顯示舊版季度／六房間／來電介面，並非重做版；不能將部署成功等同新版已上線。
- 本機 `outputs/game/app/page.tsx` 指向 `lot-game`、`app/legacy/page.tsx` 指向舊 `game-ui`，但 Git HEAD 仍是 `8c006175babb9dc4f40ed8af195a6df6e5890095`（2026-09-14）；重做版及先前多項改動仍在工作樹，未提交、未推送至 Sites 來源倉庫。故公開網址不會更新。不要用強制覆蓋遠端或重設本機工作樹；先核對第 13 版遠端來源及合併路徑。
- 本環境曾無法連接 Sites Git 來源 `git.chatgpt-team.site:443`，網絡權限未取得；不要宣稱已發佈。下一步係在有連線及存取權的環境核對遠端 main、將本機改動安全提交／合併、推送完全相同來源、儲存並部署新 Sites 版本，再用無快取新分頁及實體手機確認新版首頁。

---
# 最新交接：核心玩法獨立重做 v2
- Updated: 2026-09-23T04:06:00+08:00
- Agent: Codex
- Goal: 用戶明確否定舊季度表格循環及只會郁嘅卡通，要求重做；建立可直接操作人物、設施及持續時間嘅片場模擬。本節取代下方「沿用舊循環」方向，歷史紀錄保留。

## Current state
根路徑 `/` 係獨立 v2 片場；500 萬開局、院線抽 30%、月租及薪金、6 塊可建設土地、5 類設施、可見人物到工位先工作。人手與工位有限；疲勞會休息並復工。故事卡 → 派劇組 → 劇本／拍攝／剪接自主推進 → 揀檔期 → 八日票房入帳。研究、訓練、升級、招聘、並行劇組、拿手組合及對手同期壓力已接真實引擎。
舊經濟、六房間／Three.js 地圖、金像獎、對手商戰、續集、歷史人才及 v1 存檔仍在 `/legacy`。新 v2 尚未移植上述完整內容，並非完整 47 年版。新版 Canvas2D 原創像素畫面，唔係 Three.js，也沒有使用 Kairosoft 素材。

## Last completed work
- outputs/game/lib/lot-sim.mjs：獨立純狀態引擎、持久人物位置與任務、到站工作、工位排隊、休息復工、三階段電影、建設升級、研究訓練、招聘、排片、每日收入、虧損／黑馬、確定性 RNG 及 v2 驗證。
- outputs/game/lib/lot-art.mjs：等角像素片場、人物、設施家具、工作動作、戲院觀眾及互動命中區。
- outputs/game/app/lot-game.tsx、lot.css：固定視窗手機遊戲畫面、人物／設施原生可點擊目標、故事與設施放置、派工、縮放拖圖、速度／暫停、存檔匯出匯入。人物重疊時按最近中心選擇；殺青提示直接定位待排片作品。
- outputs/game/app/page.tsx、app/legacy/page.tsx：新舊入口分開；hk-cinema-lot-v2 絕不讀寫 hk-cinema-tycoon-v1。重載暫停，不做離線追趕；隱藏頁面會停時鐘。
- outputs/game/tests/lot-sim.test.mjs、package.json：8 項測試加入全套；README.md 前置新版範圍及舊文件界線。
- 改動前來源備份 work/pre-rebuild-20260923-034315.zip；不含 node_modules/public 媒體。原有未提交改動全部保留。

## In progress / unfinished
v2 係新核心可玩版，歷史明星、獎項、商戰、續集、股票物業未移植；不可將舊功能清單當新版已完成。長線目標與多年度變化仍不足，未證明重玩性。像素素材及動作仍可提升；真機點按／Safari／橫屏／鍵盤未驗證。不要再靠增加彈窗或純裝飾動畫聲稱解決無聊。

## Decisions to keep
香港繁體中文、自創公司、500 萬、院線 30%、七成策略三成事件、有賺有蝕與低成本爆冷、人物檔期互斥、單人瀏覽器存檔、無真金錢。新事業需明確開始；舊存檔現金、合約、電影、RNG 不重設。Cursor bridge 只用本專案 AGENT_HANDOFF.md；沒有 live chat。

## Verification
- npm test 147/147；新增 8 項包括人未到不工作、缺職位／設施停工、疲勞復工、並行工位上限、升級、讀檔／RNG、一次性收入、對手同期及 200 seeds 盈虧分佈。work/lot-tests.txt。
- TypeScript 及 production build 通過，work/lot-build.txt；最後殺青按鈕定位小修再做 TypeScript。git diff --check 通過（只有 CRLF 提示）。
- 隔離 Chrome lot-redo-qa，實際 UI 建公司、揀故事、點導演／女演員派戲、建剪接室、派編劇研究、自動杀青、3 日後排片、自動開畫及八日落畫。測試片票房 838831、製作及發行成本 450000、收入 587182、利潤 137182；單次樣本不代表平衡。
- 390×844 與 320×568 文檔尺寸等於視窗，短屏院線畫面已目視；面板內容容許內捲動，地圖容許拖動。修正並重測重疊人物點選。瀏覽器 console 無 error/warn。
- 暫停後重載，localStorage 逐字相同，回來仍暫停；隔離環境 v1 key 維持 null，未碰正常用戶存檔。
- 未測實體手機、Safari、完整 47 年自然經營／長期留存。未部署。

## Next — Cursor 三項優先工作
1. 先真機玩三部電影及兩個並行劇組，修人物重疊、320/390 短屏遮擋、停工原因與存讀檔問題；不要覆寫 v1，也不要退回七步表格。
2. 加入由設施與人才成長解鎖嘅長線公司發展；新題材、角色專長與片場佈局要形成實際不同策略，人工連玩三年驗證重複感，避免只堆事件。
3. 逐項把歷史人才／對手主動挖角和檔期競爭接入 v2 任務及佔用系統，再按新節奏接獎項及續集；每項連同相容存檔測試，勿一次搬入全部舊頁面。

## Blockers
無本地開發阻礙；真機 QA 未有結果。寫入交接檔不代表 Cursor 已讀或已執行。

---
# 最新交接：可介入嘅片場製作流程
- Updated: 2026-09-23T03:21:26.176+08:00
- Agent: Codex
- Goal: 用戶指出問題係無聊而非太難；以 Kairosoft TV Studio Story 為參考，先完成一部電影由可見工作到上映嘅可玩流程。

## Current state
沿用現有 500 萬開局、30% 院線、季度分期、六房間、金像獎、競爭公司、商戰、續集、人才檔期／退休；瀏覽器單人 v1 存檔。Three.js 片場而家由實際製作狀態控制；沒有重設現金、合約、電影或 RNG。

## Last completed work
- outputs/game/lib/production.mjs：每季 12 工序，可逐步或定時推進所有拍攝中劇組。全片三個創作決策點、六種場景，選擇改變真實片費、已付款、質素、號召、主演演技／體力。每次都有免費選擇；未處理決定會停工，不能重複領效果。
- outputs/game/lib/game.mjs：production action 及可選 film.work 存檔驗證；開始互動製作後須完成本季工序才可結算。原有季度製作分期／行政只扣一次；留守片場完成製作不再當成三個月閒置扣熱度。舊存檔及原季度操作保留。
- outputs/game/app/production-desk.tsx、production.css：主畫面工作台，1x/2x、暫停、行一步，創作選擇、真實結果、收工與試映入口。切房間或隱藏分頁會停止製作，不做離線追趕。
- outputs/game/app/studio-three.tsx、lib/studio-view.mjs：實際班底跟住排戲／拍攝／剪接階段換到試鏡室／攝影棚／剪接室。工作運行先有人物動作；選劇組同步工作台。避免每個工序重建 Three renderer。
- outputs/game/app/game-stage.tsx、game-ui.tsx、layout.tsx：開機後回片場；移除主畫面強迫月度行動嘅指令列。待午夜場時不再自動用舊來電遮住試映；電話按鈕仍可手動打開。收工確認文案配合新流程。
- outputs/game/tests/production.test.mjs、package.json：五項新引擎回歸，含多季、並行劇組、存讀檔、不可重複決策、缺錢免費選擇及完整上映。

## In progress / unfinished
呢個係第一部電影可玩切片，未完成整間公司自主模擬、訓練／對手可見行程、持久發現或新設施解鎖。創作內容目前六種，長期重玩性未經驗證。舊開戲七步、詳細試映及財務報告仍存在；不要再把單純動畫稱作完整 Kairosoft 流程。12 工序係製作工作量，季度時間仍由收工確認推進。

## Decisions to keep
香港繁體中文；七成策略三成事件；有盈有虧、低成本可爆冷；共用人才檔期；單人／只在瀏覽器存檔／無真金錢。保留原存檔；本次只提供本地預覽，不新增 Cursor 即時聊天。

## Verification
- npm test: 139/139；本次追加五項全通過。其後小修 monthly 已完成行程不重複寫入，五項製作測試再通過；TypeScript 通過。
- production build 通過，work/production-build.txt；最終小修後另再編譯記錄於同檔。
- 真實瀏覽器隔離環境 production-qa，390×844，透過 UI 成立公司、選名／吳孟達、拍板開機、啟動製作、三次拍板、結算、試映報告、正式上映。測試片《星期天不開工》票房 3,793,310、成本 670,000；此為單次 QA，唔係平衡保證。
- 決策時重載保留 50%／待決方案／462 萬現金；首個付費決策只扣 20,000。390px 文檔等於視窗、六入口 48px、工作按鈕 44px，中心 hit test 通過。320×568 工作／決策畫面已目視，三選項中心可點，文檔無溢出；短螢幕工作台容許內容內捲動，未稱全遊戲無捲動。
- 未碰正常用戶存檔；未測實體手機、Safari、完整長期多年度人工遊玩。未部署。localhost:3000 為本地預覽。
- modern-web-guidance npm search 無回應、offline ENOTCACHED；以 MDN Page Visibility API 官方文件核實 hidden 暫停處理。

## Next — Cursor 優先順序
1. 真機試第一部電影流程、390px及短屏／旋轉／鍵盤；修遮擋、停工與讀檔問題，保留 v1。
2. 試玩至少三部不同班底電影，將創作場景連到人物強項、疲勞、題材及持久默契，驗證玩家選擇有差異；避免只擴展隨機彈窗。
3. 在同一片場呈現休息／訓練及對手檔期壓力，再加入逐步可解鎖設施；保留現有帳目與人才互斥。

## Blockers
無本地開發阻礙。無真機 QA。寫入此檔唔代表 Cursor 已收到／已開始執行。

---
# 最新補充：可見人物工作與手機遊戲畫面
- Updated: 2026-09-23T03:00:00+08:00
- Agent: Codex
- Goal: 用戶指出不是文字管理頁，要看見演員／導演工作，參考 Kairosoft 的經營遊戲感。
- Last completed: app/studio-three.tsx 改為等角剖面工作室，有佈景、攝影機、燈架、戲院座位；lib/studio-view.mjs 從真實 films/talents 讀取劇組。顯示姓名、工作動作、拍攝進度、剩餘季度、ready/held 狀態。跟拍／全片場切換、切換所有在製電影、點人物或上方片名打開該電影剪接室。
- 動作是呈現層，經濟仍按季度結算。動畫約 20fps，隱藏頁面、房間／modal 開啟、減少動畫偏好時不繪圖；用戶可暫停。沒有虛構已聘演員，也沒有偷偷推進 RNG 或扣款。
- 手機：app/simulator.css 固定 100dvh、房間佔全屏並隱藏後方重複 HUD／開機指令列；game-rooms.tsx 對溢出內容提供上下頁（60px 內容重疊），不是遮掉無法讀取。campaign-board.tsx 一頁一條路線／一項決策；circuit-console.tsx 一次一季度一院線，仍調用原 circuit actions，預訂與配片保留。
- Verification: 134 項測試通過、tsc 通過、build 通過。隔離 QA 存檔用真實 act(film) 開两套測試片，曾志偉／許冠傑切換到吳宇森／石天，姓名与劇組切換；未碰用戶正常瀏覽器存檔。
- 390×844 顯示人物跟拍，320×568 企劃只有一張路線卡且無溢出。320px 院線下頁可到達鎖定按鈕，返回頁碼正確；文件大小等於視窗。已檢視工具返回畫面；截圖檔案儲存被瀏覽器工具路徑限制拒絕，未建立本地截圖。動畫期間 localStorage 未改變。真機仍未測，未部署。
- Next: 1. 真機確認觸控及短螢幕／鍵盤開啟。2. 把更多訓練、休息、對手活動視覺化，避免退回純文字模擬。3. 各房間逐個改成內容層級分頁，現在通用分頁仍以可視區切分長內容，需持續改善。
- Blockers: 無本地阻礙；尚無真機與完整房間矩陣驗證。

---
# 電影大亨交接 — 本次遊戲工作優先閱讀

- Updated: 2026-09-23T02:24:00+08:00
- Agent: Codex
- Goal: 改善一年後重複感，加入跨年公司企劃及 Three.js 互動片場。

## Current state
保留現有經濟、六房間、金像獎、競爭公司、商戰、續集、人才檔期與退休。開局五百萬、院線 30/70、大製作四主演。單人、繁體中文、瀏覽器 v1 存檔與 JSON 匯出；新增可選 campaign 欄位，沒有重設現金、電影、合約或 RNG。

## Last completed work
- lib/campaign.mjs、app/campaign-board.tsx：小本奇兵／電影王國／造星工場三條十二季企劃，真實扣投資，作品條件追蹤、一次性達標獎勵、章節遞進及放棄損失；第二年發行商注資分成，第三年加碼挑戰。入口提示待處理決策。可提早達標；不是強制等足三年。
- lib/game.mjs：campaign action 接入 alive 檢查及既有不可變更新；validateCampaign 檢查新增存檔欄位。
- app/studio-three.tsx：懶載入 Three.js、六座立體建築與房名、raycast 點選、拖動旋轉、縮放及回正；ResizeObserver、DPR 上限 1.5、按需 render、卸載釋放資源。WebGL 不可用／context lost 時顯示原入口。
- app/game-stage.tsx、app/game-ui.tsx、app/layout.tsx、app/campaign.css：整合片場及企劃；390px 房間盤縮至底部 216px，不再鋪滿畫面。
- app/circuits.tsx：修正既有 Set 的 number 泛型，解除 tsc unknown 型別錯誤。
- package.json、package-lock.json：three、@types/three 及 campaign 測試接入。
- tests/campaign.test.mjs：四項測試涵蓋舊存檔、RNG、不合資格電影、不能重複領獎、跨年選擇、逾期、資金不足及損壞存檔。

## In progress / unfinished
立體片場為程式生成的低多邊形場景，仍可改善美術、角色活動及製作狀態視覺。三年企劃是現有引擎的延伸；尚未證明長期留存或完成多年度真人平衡測試。未部署公開網站。

## Decisions to keep
沿用既有規則與存檔；七成策略、三成事件；要有低成本黑馬亦有虧損；競爭者和玩家共享人才檔期。無真金錢功能。不要以新版清空玩家進度。保留手機可直接點擊的原生房間按鈕。

## Verification
- npm test：132/132 通過，work/campaign-tests.txt。
- npm run build：通過，work/campaign-build.txt；仍有原有 JSON import 提示及大 bundle 提示。
- npx tsc --noEmit：通過。
- 隔離 Chromium：http://localhost:3000/ 已實際顯示 Three.js，選小本奇兵扣十八萬並存入 localStorage。
- 390×844 mobile/touch 模擬：無橫向 overflow，六個入口中心未被遮擋，高約 66px；成功進入試鏡室並返回；企劃 dialog 在視窗內。Console 無 error。
- 未做實體手機測試，未確認 Safari／GPU context loss 真實硬件恢復；未做長時間真人遊玩測試。
- http://127.0.0.1:8787 當時 connection refused；本次 dev server 為 localhost:3000。不要稱已部署。

## Next — Cursor 優先次序
1. 真機驗證 390px 旋轉片場、六房間、企劃 modal、存讀檔；任何遮擋／誤觸先修。
2. 用不改資金的連續多年度試玩評估三路線難度及獎勵，擴展與具名競爭者關係聯動，避免只加可重複領錢任務。
3. 改善立體建築美術及拍攝／午夜場狀態，量度低階手機載入及 GPU 表現；確認後再按用戶要求部署。

## Blockers
無本地開發阻礙。真機及長期遊玩體驗仍待驗證。

---
以下為原有交接歷史（包含其他專案內容，並非本次電影遊戲工作的指示）：
# AGENT_HANDOFF

- Updated: 2026-09-18T00:25:00+08:00
- Agent: Cursor
- Grok bot is joining this work. Read this file first. Do not restart finished fixes.
- Private GitHub: https://github.com/Jberger11/hong-kong-cinema-tycoon

## Goal

Travel Mama live site (`https://travelmama.com.hk/`): tour-page AI enquiry form that reads **this page’s facts only**, plus keep the old Getaway template usable.

This Cursor workspace is the cinema-tycoon repo. Almost all current work is on the **live WordPress site**, not this repo. Do not treat cinema-tycoon files as the Travel Mama source.

## How to work

- User-facing language: Hong Kong written Cantonese.
- Control the user’s real Chrome via **user-chrome-live** MCP. Isolated chrome-devtools is the wrong browser.
- Logged-in WP user is Emily @ Travel MaMa. Do not store passwords, cookies, or tokens here.
- Do not clone Forminator per tour. Keep existing forms.
- Do not invent tour facts (no connecting room / HK direct flight / kids policy unless that page says so).
- Airfare follow-ups only if the page mentions 機票. About 90% of tours exclude air tickets.

## Current state

1. Getaway overlap is **fixed** in Code Snippets **TM Tour suitability and recent views** (id=30, HTML, site footer). LSCache purged.
2. Nagoya Getaway content rewrite is **published** (product 59118).
3. AI enquiry form is **not shipped**. Live trial `#tm-ai-form-demo` is injected on Portugal + Nagoya Getaway (refresh wipes). Extract bugs (Getaway misread as SIC; Nagoya price from 「最近瀏覽」) are **fixed in the prototype**.
4. Kyrgyzstan EN starting price is **fixed** to HK$28,780; leftover Chinese on that EN page cleared.
5. Mongolia winter EN Overview now says Land Cruiser **200** (vehicle), and 雪地司機 is consistently **snow driver**.
6. Nordic EN-over-ZH cause found and same-page fixes published (title/H1 + EN leftovers). Italy hub/product split unchanged. Search Console URL inspection not available in Site Kit.

## Last completed work

### Grok research recorded (2026-09-14) — do not treat as a live bug

Nordic ZH hub `https://travelmama.com.hk/nordic-private-tour-index/`: live 200, self-canonical, `index,follow`, thick content. Not a technical block. `site:` and slug search often surface **EN** first; ZH sometimes appears on exact-title search. France / Italy / Central Asia slugs can show ZH+EN in `site:` (Central Asia is newer and already in `site:`).

Queries like 「北歐私人小包團」 currently surface Europe hub, EN nordic, `/private-tour/`, category `northeurope`, and SKUs (Norway / Finland / Faroe) — ZH Nordic hub almost never joins that set.

Cursor sitemap check (logged-in Yoast, 2026-09-14): **ZH Nordic IS in** `page-sitemap.xml` as `https://travelmama.com.hk/nordic-private-tour-index/`, same as `italy-private-tour-index`, `france-private-tour-index`, `central-asia-private-tour-index`. That sitemap lists default-language URLs only (no `/en/` page locs). Missing sitemap is **not** why ZH Nordic is weak.

Italy split (keep): hub wins early customize / 2-person / no region lock; products win 北意／南意／Amalfi／Sicily／7-day Rome-Florence-Venice. Hub `<title>` still English-first. Do **not** make hub and products fight the same broad 「意大利私人訂製」.

Nordic EN-over-ZH (done 2026-09-14, page 62619):

- Cause: Yoast SEO title had stripped 「私人」 (`北歐小包團｜…`) while EN title is `Nordic and Scandinavia Private Tours`; EN H1 + almost all body were still Chinese, so Chinese queries could prefer the EN URL. Sitemap was already fine. France EN also has leftover Chinese, so leftovers alone are not unique — the missing 「私人」 on ZH title vs Private on EN title is the Nordic-specific mismatch.
- Fix: Yoast title + visible H1 → `北歐私人小包團｜挪威峽灣・冰島・芬蘭`. TranslatePress saved EN body + new H1. LSCache purged.
- Verified: ZH title/H1 include 私人; EN H1 English; EN main leftover count 0.
- Site Kit has Search Console traffic widgets only; no URL inspection for this slug.
- Italy: still do not make hub and products fight 「意大利私人訂製」.

### Same-page ZH/EN fixes (2026-09-13)

- Kyrgyzstan `kyrgyzstan-tour-009` (57132): EN hero `$5,780` aligned to **HK$28,780**; schema still 28780; TranslatePress regular strings saved; LSCache purged.
- Mongolia winter `mongolia-winter-khuvsgul-lake-tour` (60563): EN Overview `Land Cruiser HK$200` → **Land Cruiser 200**; `snowmobile driver` → **snow driver** to match Includes.

### Getaway / 自由行套票 overlap (2026-09-13)

Class-wide, not Nagoya-only. Archive: `https://travelmama.com.hk/free-and-easy-packages/`

Old Getaway pages have `.tours-tabs` + `.tm-tour-tools` and **no** `.tm-mad-page` / `.tm-gd-hero` / `.tm-abc-hero`. Snippet 30 used to insert `.tm-tour-discovery-guide` after `.tm-tour-tools` as a 1120px band on `.layout-content`, covering WooCommerce tab 「細節」 and making `$4,280` look stacked on the title.

Fix in snippet 30:

- Old Getaway: insert audience guide **inside** `.tours-tabs`, below the tab nav, column width 100%.
- MAD / GD / ABC: still insert after tools or facts.

Checked: Nagoya, San Francisco, Vancouver (no cover); Portugal MAD (audience block kept). If a page still looks old, Ctrl+F5 / Cloudflare cache.

Do not patch one product HTML. Do not add a site-wide CJK font stack unless asked.

### Nagoya Getaway content (product 59118)

Live: `https://travelmama.com.hk/tours/nagoya-getaway/`  
Editor: `https://travelmama.com.hk/wp-admin/post.php?post=59118&action=edit`

Was a Europe/Nice clone. Published replacements: 白川鄉、岐阜、高山或鳥羽（擇一）; hotel **Royal Park Canvas (Standard) 或同級**; car 1 day / 10 hours / **300 km**; start 名古屋（中部國際機場 / 名古屋站）; price still **$4,280 起**. Theme heading font Oxygen is Latin-only; CDP CJK can look garbled even when HTML is correct.

### AI enquiry form (unfinished)

Desired: one sentence from the guest, then adaptive follow-ups with clickable answers, at least 3 follow-ups, bilingual if the guest types English. Write into native Forminator fields. Do **not** auto-click Send. If the page has **no Forminator**, do **not** inject the AI panel (WhatsApp / `#tourBookingForm` only pages stay as they are).

Do not assume every product uses the same headings.

| Type | Example | Include heading | Form |
|---|---|---|---|
| Newer MAD private tour | Portugal, Finland, France 8-day, Nagoya 5-day | `行程包括` or `小包團包括` | Forminator **57497** |
| Messy rewrite | Mongolia 6-day, France 10-day, Taiwan 7-day | Mixed | Usually 57497 |
| Old Getaway | Nagoya 3-day, Vancouver 3-day, San Francisco | `套票包括` / `不包括` | Often **59007** (Nagoya Getaway) |
| SIC guaranteed departure | Canada Rockies | Table `包括` / `不包括` | Different booking model — do not reuse private-tour follow-ups |

Two layers:

1. Fact card from the current page (min pax, price, includes/excludes, airfare, boat, winter alt, transfer, guide language, optional extras, hotels, kids/connecting flags).
2. Follow-ups constrained by that card. `unknown` = do not ask.

No API required for layer 1 on structured pages. Use the site’s existing AI Engine only if structure is too messy.

Prototype scripts (temporary, refresh removes them):

- `C:\Users\Shackie\.gemini\antigravity\scratch\portugal-ai-form-demo.js` (hardcoded Portugal facts)
- `C:\Users\Shackie\.gemini\antigravity\scratch\tm-ai-form-extract-demo.js` (page-extract; source of truth)

Demo id: `#tm-ai-form-demo`. Insert with `form.insertAdjacentElement("beforebegin", wrap)`.

Portugal extract worked: min 4, HK$25,380, airfare excluded, Pinhão boat, winter valley drive Nov–Mar, no kids/connecting, form 57497.

France 8-day: heading `小包團包括` still extracted; min 4; airfare excluded; Monet Nov–Mar close must **not** become a boat winter rule. Form 57497.

Nagoya Getaway extract (retested 2026-09-14): template **getaway** (not SIC), price **HK$4,280**, min 2, airfare excluded, form **59007**, 擇一 destinations + named hotel. Recent-view prices ignored. Getaway is classified by `套票包括` / `getaway` URL / `.tours-tabs`, not by any `table` + 固定班期 in the first 4000 chars.

Follow-up pool (aim 3–4): date window, winter boat / boat, airfare, min pax shortfall, airport transfer, guide language, optional extras (`可自選`), reference hotels. Family/connecting only if the page mentions it.

## In progress

- Root `/favicon.ico` and `/apple-touch-icon.png` are **now live** (200, `image/x-icon` / `image/png`) on apex, plus `/apple-touch-icon-precomposed.png`. Uploaded 2026-09-18 via WP File Manager from the existing square Travel Mama logo. Google Search local-pack grey/green photo is the Maps shop-front photo, not the website favicon. GBP logo change needs Google account login.
- Hub product tests (2026-09-14): `/hongkong/` → Silvermine + Luk Kwok; `/nepal-travel/` → Golden Triangle + ABC + Kathmandu–Pokhara; `/mission-hills-resort/` → family + couple. Refresh wipes demos.
- Still need one messy rewrite (e.g. Mongolia 6-day) and one real SIC (Canada Rockies) before persisting.
- Do not treat SIC / Getaway as the same form as 57497.
- Optional later: site-wide CJK fallback (`Oxygen, "Noto Sans TC", "PingFang TC", "Microsoft JhengHei"`). Not added yet.
- Cinema tycoon hosted URL is still the old build. Do not rewrite the hosted copy with Sites Edit.

## Decisions to keep

Travel Mama:

- Facts only from the current tour page.
- Do not clone Forminator.
- Do not auto-submit the enquiry.
- Do not invent connecting rooms, kids policy, or HK flights.
- No Forminator = no AI enquiry panel.
- Chinese tour pages keep Chinese questions. Do not switch to English because of an English sample chip.
- Staycation (Mission Hills family): page says 深圳或東莞 — ask campus first. Never ask airfare, airport transfer, or 穿梭巴士 (park shuttle, not hotel pickup). Ask dinner / activity; extra room only when party is bigger than 2A+1 child.
- Included airport transfer is not a guest choice. Do not ask 「預留定自己安排」unless the include line says 需預約. Connecting-room chip only if this page (not the demo) mentions 相連房.
- Sample chips are example sentences, not departure SKUs. Show the full sentence plus 「唔係要你揀團期」. Do not auto-click a chip.
- Do not ask departure date in the AI panel. Forminator already has a calendar. No date chips, no date-window follow-up, do not write into `date-1`. Guests pick the date on the form.
- Do not reuse private-tour follow-ups on SIC guaranteed-departure products.
- Getaway overlap: template-level snippet 30 only; keep MAD insert unchanged.
- No site-wide font stack unless the user asks.

Cinema tycoon (this repo, paused):

- Single-player, localStorage + JSON export.
- Do not reset existing save cash / films / contracts / RNG.
- Cinema split 30/70; big production 4 leads; small 2.
- Exclusive contracts max 4 people; rival exclusive plus same-season guest cannot be poached.
- Phone: no full-page swipe; mobile rules only at 700px or below.
- Room 5 is 夜城.
- Fictional names: 阿七, 港視, 派克, 梁生, 成哥.
- Training and self-requested films can yield; a second unit shoot or rival lock blocks.
- Only one cinema delivery promise at a time.

## Useful URLs

- Portugal MAD: `https://travelmama.com.hk/tours/portugal-7-nights-tour/#tm-mad-enquiry` (form 57497)
- France 8-day: `https://travelmama.com.hk/tours/france-tour-008/` (form 57497)
- Nagoya Getaway: `https://travelmama.com.hk/tours/nagoya-getaway/` (product 59118, form 59007)
- Getaway archive: `https://travelmama.com.hk/free-and-easy-packages/`
- WP snippet to edit: Code Snippets → TM Tour suitability and recent views (id=30)

Local Travel Mama audit copies (older): `C:\Users\Shackie\Documents\Codex\2026-05-25\please-check-my-another-website-https\`

## Verification

- Getaway: Nagoya / SF / Vancouver guide parent = `.tours-tabs`, overlap iy=0; 細節 / 照片 clickable.
- Portugal: guide still inside `.tm-mad-page`, after `.tm-tour-tools`.
- AI form Portugal (4人 · 10月 · 機票): MAD, HK$25,380, form 57497; 4 follow-ups = boat, airfare, transfer, guide. Winter boat not asked in October.
- AI form Nagoya Getaway: getaway, HK$4,280, form 59007; 4 follow-ups = airfare, 擇一 (白川鄉／岐阜／高山／鳥羽), transfer, hotel. No invented boat/kids/connecting.
- Staycation / Nepal / Mission Hills (2026-09-14, chip「4人 · 10月 · 機票」unless noted):
  - Silvermine / Luk Kwok: **no Forminator → no AI panel** (demos removed 2026-09-14). Keep WhatsApp / native booking as-is.
  - Nepal Golden Triangle: MAD, HK$7,980, min 2, form **58420**, 國際機票 excluded; transfer + 英語/國語 + 可加購. Family chip does **not** invent 相連房.
  - Nepal ABC: MAD / `.tm-abc-hero`, HK$7,580, min 2, form **58420**; 國際機票 excluded, 國內機票 included; family chip asks to **check** 相連房 (page says 無法保證). English-only trek guide → do not ask 中文或英文. `Kathmandu機場私人接送` missed by old `機場接送` regex — now added.
  - Kathmandu–Pokhara 6-day: MAD, HK$5,380, min 2, form **58420**. For「2人」ask only 國際機票、導遊語言、加購（觀光飛行／滑翔傘／漂流）. Do not ask departure date or included 機場接送. No 相連房 chip. Date stays on the Forminator calendar.
  - Mission Hills family: staycation, HK$1,880, form **57515**; first ask 深圳或東莞; then dinner / 藝工場. Do not ask 穿梭巴士. 2A+1 child under 1.4m; extra room only if party > 3. No airfare.
  - Mission Hills couple: staycation, HK$1,515, form **57515**; real chips 餐飲現金券／水療 and 冰雪世界／海洋館／高爾夫練習場. Do **not** invent 深圳 vs 東莞 as a guest choice.

## Next

1. Continue AI enquiry form from `tm-ai-form-extract-demo.js`, not a new Forminator form.
2. Test one messy rewrite + one real SIC (Canada Rockies) with the same demo.
3. Keep Getaway (59007) and SIC on their own follow-up rules.
4. Only after extract is reliable on MAD + Getaway + messy rewrite + SIC, persist as a WP snippet.
5. User Ctrl+F5 Getaway pages if they still see the old overlap.
6. Nordic same-page SEO fixes are live. Indexing/site: movement will take time. Do not dump more Nordic copy. Italy split unchanged.

## Blockers

- None for Grok joining. Bridge recipient names are `cursor` / `codex` / `*`; there is no `grok` inbox. Use this file as the source of truth.

