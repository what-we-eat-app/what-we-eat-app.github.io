'use strict';
const $=s=>document.querySelector(s), main=$('#main');
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const questions=[
 {key:'feel',title:'今日はどんな気分？',help:'食べたい雰囲気をひとつ選んでください。',options:[['hearty','がっつり','🍖'],['light','さっぱり','🥗'],['either','どちらでも','✨']]},
 {key:'main',title:'何を中心に食べたい？',help:'一番食べたいものを選んでください。',options:[['meat','肉','🥩'],['fish','魚','🐟'],['noodle','麺','🍜'],['rice','ご飯','🍚'],['vegetable','野菜','🥬'],['either','おまかせ','✨']]},
 {key:'genre',title:'今夜の味の方向は？',help:'気になるジャンルを選んでください。',options:[['japanese','和食','🍙'],['western','洋食','🍽️'],['chinese','中華','🥟'],['korean','韓国料理','🍲'],['italian','イタリアン','🍝'],['ethnic','エスニック','🌿'],['either','おまかせ','✨']]},
 {key:'spicy',title:'辛いものは食べたい？',help:'辛さの希望は必ず候補に反映します。',options:[['yes','辛いものを食べたい','🌶️'],['no','辛いものは避けたい','🍃'],['either','どちらでも','✨']]},
 {key:'temp',title:'温かい？ 冷たい？',help:'食べたい温度を選んでください。',options:[['warm','温かい','♨️'],['cold','冷たい','🧊'],['either','どちらでも','✨']]},
 {key:'hunger',title:'おなかのすき具合は？',help:'今のおなかに合うボリュームを選んでください。',options:[['light','あまり空いていない','🍃'],['normal','普通','🍽️'],['filling','かなり空いている','🍚']]}
];
// Both modes share the exact same question objects, labels, choices, and order.
const activeQuestions=()=>questions;
const LABELS={feel:{hearty:'がっつり',light:'さっぱり'},main:{meat:'肉',fish:'魚',noodle:'麺',rice:'ご飯',vegetable:'野菜'},genre:{japanese:'和食',western:'洋食',chinese:'中華',korean:'韓国料理',italian:'イタリアン',french:'フレンチ',ethnic:'エスニック'},spicy:{yes:'辛いもの',no:'辛くないもの'},temp:{warm:'温かいもの',cold:'冷たいもの'},hunger:{light:'あまり空いていない',normal:'普通',filling:'かなり空いている'}};
function freshState(mode=null){return {mode,step:0,answers:{},radius:1000,pool:[],restaurantCandidates:[],shown:[],pages:[],pageIndex:-1,current:[],selected:null,loading:false,loadingStage:'',notice:'',searchLabel:'',locationConfirm:false,areaChoices:[],areaQuery:'',searchOrigin:null,editing:false,nearMatch:false,surpriseKind:null,recipeOpen:false,searchSerial:0}}
let state=freshState();
const e=(tag,props,children)=>{let n=document.createElement(tag);Object.entries(props||{}).forEach(([k,v])=>{if(k==='class')n.className=v;else if(k==='text')n.textContent=v;else n.setAttribute(k,v)});(children||[]).forEach(c=>n.append(c));return n};
function render(){try{window.scrollTo(0,0)}catch(_){};if(state.selected?.kind==='surpriseChoice')return surpriseChoice();if(!state.mode)return home();if(state.selected?.kind==='surprise')return surpriseResult();if(state.selected?.kind==='decided')return picked();if(state.selected?.kind==='detail')return detail();if(state.step<activeQuestions().length)return question();return results()}
function startMode(mode){state=freshState(mode);render()}
function returnHome(){state=freshState();render()}
function restartDiagnosis(){const mode=state.mode;state=freshState(mode);render()}
function chosenConditions(){return ['feel','main','genre','spicy','temp','hunger'].filter(k=>state.answers[k]&&state.answers[k]!=='either').map(k=>LABELS[k][state.answers[k]])}
function resultFooter(){return '<div class="result-footer"><button class="link-like" id="restart">最初からやり直す</button><button class="link-like" id="returnHome">ホームに戻る</button></div>'}
function bindResetActions(){if($('#restart'))$('#restart').onclick=restartDiagnosis;if($('#returnHome'))$('#returnHome').onclick=returnHome}
function home(){main.innerHTML=`<section class="screen intro"><div><p class="eyebrow">WHAT WE EAT · TONIGHT'S PICK</p><h1 class="title">今日の夕食、<br><em>もう迷わない。</em></h1><p class="lead">今の気分を選ぶだけ。<br>今日のごはん、すぐ決まる。</p><div class="card-grid"><button class="mode-card" data-mode="cook"><span class="mode-icon" aria-hidden="true">🍳</span><span><span class="mode-title">自炊する →</span><span class="mode-sub">今夜の料理を選ぶ</span></span></button><button class="mode-card" data-mode="out"><span class="mode-icon" aria-hidden="true">📍</span><span><span class="mode-title">外食する →</span><span class="mode-sub">近くのお店を探す</span></span></button></div><button class="surprise" id="surprise"><span aria-hidden="true">✦</span> おまかせで決める <small>質問なしで今夜の候補へ</small></button></div><div class="illustration"><img src="./dinner.webp" alt="トマトとバジルのパスタ" width="550" height="550" loading="eager"></div></section>`;main.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>startMode(b.dataset.mode));$('#surprise').onclick=()=>{state=freshState();state.selected={kind:'surpriseChoice'};render()}}
function surpriseChoice(){main.innerHTML=`<section class="screen surprise-choice"><p class="eyebrow">QUICK PICK</p><h1 class="question">質問なしで決める</h1><p class="q-help">まず決め方をひとつ選んでください。</p><div class="choices"><button class="choice" id="surpriseFull">✦ 完全におまかせ <small>自炊の全料理から</small></button><button class="choice" id="surpriseCook">🍳 自炊でおまかせ <small>30分以内の作りやすい料理</small></button><button class="choice" id="surpriseOut">📍 外食でおまかせ <small>場所だけ指定して探す</small></button></div><div class="result-footer"><button class="link-like" id="returnHome">ホームに戻る</button></div></section>`;$('#surpriseFull').onclick=()=>startSurprise('full');$('#surpriseCook').onclick=()=>startSurprise('cook');$('#surpriseOut').onclick=()=>startSurprise('out');$('#returnHome').onclick=returnHome}
function startSurprise(kind){state=freshState(kind==='out'?'out':'cook');state.step=questions.length;state.surpriseKind=kind;state.answers={feel:'either',main:'either',genre:'either',spicy:'either',temp:'either',hunger:'normal'};if(kind==='out'){render();return}let dishes=kind==='cook'?RECIPES.filter(x=>x.time<=30&&x.difficulty==='かんたん'):RECIPES;state.pool=dishes.map(x=>({...x,tie:Math.random()})).sort((a,b)=>a.tie-b.tie);resetPages();showNext();state.selected={kind:'surprise',item:state.current[0]};render()}
function surpriseAgain(){let previous=state.selected.item.id,seen=new Set(state.shown.map(x=>x.id));let next=state.pool.find(x=>!seen.has(x.id)&&x.id!==previous);if(!next){state.shown=[];next=state.pool.find(x=>x.id!==previous)}if(!next)return;state.shown.push(next);state.selected={kind:'surprise',item:next};render()}
function surpriseResult(){let x=state.selected.item;main.innerHTML=`<section class="screen"><div class="picked"><span class="symbol" aria-hidden="true">✦</span><p class="eyebrow">SURPRISE PICK</p><h1>今夜は「${escapeHTML(x.name)}」はどう？</h1><div class="picked-photo">${recipeMedia(x)}</div><p>${escapeHTML(x.description)}</p><p class="recipe-time">調理時間の目安：約${x.time}分</p><div class="actions"><button class="primary" id="decide">これにする！</button><button class="secondary" id="surpriseAgain">もう一度おまかせ</button></div><div class="result-footer"><button class="link-like" id="returnHome">ホームに戻る</button></div></div></section>`;$('#decide').onclick=()=>{state.selected={kind:'decided',item:x};render()};$('#surpriseAgain').onclick=surpriseAgain;$('#returnHome').onclick=returnHome}

function editConditions(){state.selected=null;state.editing=true;state.step=0;render()}
function refreshAfterEdit(){state.editing=false;state.step=questions.length;state.selected=null;resetPages();if(state.mode==='cook')return finishQuestions();if(state.restaurantCandidates.length)rankRestaurants(state.restaurantCandidates);render()}
function question(){
 let qlist=activeQuestions(),q=qlist[state.step];let bars=qlist.map((_,i)=>`<i class="${i<=state.step?'active':''}"></i>`).join('');
 let chips=state.editing?`<div class="edit-overview" role="group" aria-label="変更する条件">${qlist.map((item,i)=>`<button class="edit-chip ${i===state.step?'active':''}" data-step="${i}">${escapeHTML(item.title.replace('？',''))} <strong>${escapeHTML(item.options.find(opt=>opt[0]===state.answers[item.key])?.[1]||'未選択')}</strong></button>`).join('')}</div><p class="edit-hint">変更したい条件だけ選んでください。1つ選び直すと結果へ戻ります。</p>`:'';
 main.innerHTML=`<section class="screen"><div class="question-head"><button class="back" id="back">← もどる</button><div class="progress" aria-label="質問 ${state.step+1} / ${qlist.length}">${bars}<span>${state.step+1} / ${qlist.length}</span></div></div>${chips}<p class="q-label">${state.mode==='cook'?'自炊':'外食'}の診断中 · QUESTION ${String(state.step+1).padStart(2,'0')}</p><h1 class="question">${q.title}</h1><p class="q-help">${q.help}</p><div class="choices">${q.options.map(([value,label,icon])=>`<button class="choice ${state.answers[q.key]===value?'is-selected':''}" data-value="${value}" aria-pressed="${state.answers[q.key]===value}"><span class="emoji" aria-hidden="true">${icon}</span><span>${label}</span><span class="arrow" aria-hidden="true">↗</span></button>`).join('')}</div>${state.editing?'<button class="back edit-done" id="editDone">変更せずに結果へ戻る</button>':''}${state.mode==='out'&&state.step===0?'<div class="scope"><label for="radius">お店を探す範囲</label><select id="radius"><option value="500">500m</option><option value="1000">1km</option><option value="3000">3km</option><option value="5000">5km</option><option value="10000">10km</option></select></div>':''}</section>`;
 if($('#radius')){$('#radius').value=state.radius;$('#radius').onchange=x=>{state.radius=Number(x.target.value);if(state.mode==='out'&&state.pool.length)state.notice='範囲を変更しました。場所を変えて再検索すると反映されます。'}}
 $('#back').onclick=()=>{if(state.step)state.step--;else if(state.editing){state.editing=false;state.step=qlist.length}else return returnHome();render()};
 main.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{state.step=Number(b.dataset.step);render()});
 if($('#editDone'))$('#editDone').onclick=()=>{state.editing=false;state.step=qlist.length;render()};
 main.querySelectorAll('[data-value]').forEach(b=>b.onclick=()=>{state.answers[q.key]=b.dataset.value;if(state.editing)return refreshAfterEdit();state.step++;if(state.step===qlist.length)finishQuestions();else render()})
}
function recipeEligible(x,a){return a.spicy==='either'||x.spicy===a.spicy}
function recipeScore(x,a){let s=0;if(a.main!=='either'&&x.main.includes(a.main))s+=8;if(a.genre!=='either'&&x.genre===a.genre)s+=7;if(a.temp!=='either'&&x.temp===a.temp)s+=5;if(a.feel!=='either'&&x.feel===a.feel)s+=3;if(x.hunger===a.hunger)s+=4;return s}
function recipeMatches(x,a,k){return k==='main'?x.main.includes(a.main):x[k]===a[k]}
function recipeReason(x){let a=state.answers,matched=['feel','main','genre','spicy','temp','hunger'].filter(k=>a[k]&&a[k]!=='either'&&recipeMatches(x,a,k)).map(k=>LABELS[k][a[k]]);let missed=['main','genre','spicy','temp','feel','hunger'].filter(k=>a[k]&&a[k]!=='either'&&!recipeMatches(x,a,k)).map(k=>LABELS[k][a[k]]);return `${matched.length?`「${matched.join('・')}」に合っています。`:'回答に近い候補を選びました。'}${missed.length?`「${missed.join('・')}」は完全一致ではありません。`:''}`}
function recipeNotice(){let a=state.answers,exact=state.current.filter(x=>['feel','main','genre','spicy','temp','hunger'].every(k=>!a[k]||a[k]==='either'||recipeMatches(x,a,k))).length;return exact===state.current.length?'':`条件に近いおすすめ：完全一致する候補が少ないため、${state.nearMatch?'辛さも含めて':'辛さの希望を守りながら、'}食べたいもの・ジャンル・温度との一致度を優先しています。`}
function resetPages(){state.shown=[];state.pages=[];state.pageIndex=-1;state.current=[]}
function finishQuestions(){state.selected=null;state.editing=false;state.locationConfirm=false;state.areaChoices=[];resetPages();if(state.mode==='cook'){const a=state.answers;let eligible=RECIPES.filter(x=>recipeEligible(x,a));state.nearMatch=!eligible.length;if(!eligible.length)eligible=RECIPES;state.pool=eligible.map(x=>({...x,score:recipeScore(x,a)-(x.spicy===a.spicy?0:20),tie:Math.random()}));state.pool.sort((x,y)=>y.score-x.score||x.tie-y.tie);showNext();render()}else{state.loading=false;state.pool=[];state.restaurantCandidates=[];render()}}
function showNext(){if(state.pageIndex+1<state.pages.length){state.current=state.pages[++state.pageIndex];return true}let seen=new Set(state.shown.map(x=>x.id)),best=state.pool.filter(x=>!seen.has(x.id)).slice(0,3);if(!best.length)return false;state.shown.push(...best);state.pages.push(best);state.pageIndex=state.pages.length-1;state.current=best;return true}
function showPrevious(){if(state.pageIndex<=0)return false;state.current=state.pages[--state.pageIndex];return true}
function hasNext(){return state.pageIndex<state.pages.length-1||state.shown.length<state.pool.length}
function results(){return state.mode==='cook'?cookResults():outResults()}
function resultNavigation(){return `<div class="actions result-actions">${state.pageIndex>0?'<button class="secondary" id="previous">← 前の候補</button>':''}${hasNext()?'<button class="secondary" id="more">他の候補を見る →</button>':''}<button class="secondary" id="editConditions">条件を少し変える</button>${state.mode==='out'?`${state.searchOrigin&&state.radius<10000?'<button class="secondary" id="expand">検索範囲を広げる</button>':''}<button class="link-like" id="newsearch">場所を変えて探す</button>`:''}</div>${resultFooter()}`}
function bindResultNavigation(){if($('#more'))$('#more').onclick=()=>{if(showNext())render()};if($('#previous'))$('#previous').onclick=()=>{if(showPrevious())render()};if($('#expand'))$('#expand').onclick=expandRadius;$('#editConditions').onclick=editConditions;bindResetActions()}
function recipeMedia(x){let guide=recipeGuide(x);return guide.photo?`<img class="dish-photo" src="${escapeHTML(guide.photo)}" alt="${escapeHTML(x.name)}の盛り付け例" loading="lazy">`:`<div class="dish-placeholder" aria-label="料理写真未登録"><span aria-hidden="true">${x.main.includes('fish')?'🐟':x.main.includes('noodle')?'🍜':x.main.includes('rice')?'🍚':x.main.includes('vegetable')?'🥬':'🍽️'}</span><small>写真未登録</small></div>`}
function cookResults(){
 let list=state.current||[],notice=recipeNotice(),chosen=chosenConditions();
 main.innerHTML=`<section class="screen results"><div class="results-header"><div><p class="eyebrow">YOUR DINNER SHORTLIST</p><h1>今夜は、これどう？</h1><p class="lead">${list.length?`あなたの回答から${list.length}件に絞りました。`:'条件に近い候補を準備できませんでした。'}</p></div></div>${chosen.length?`<p class="answer-summary">選んだ条件：${chosen.map(escapeHTML).join(' · ')}</p>`:''}${notice?`<div class="match-notice" role="status">${escapeHTML(notice)}</div>`:''}${list.length?`<div class="result-list">${list.map((x,i)=>`<article class="result-card"><span class="rank">PICK ${String(i+1).padStart(2,'0')}</span><div class="dish-head">${recipeMedia(x)}<div><h2>${escapeHTML(x.name)}</h2><p>${escapeHTML(x.description)}</p></div></div><p class="reason">${escapeHTML(recipeReason(x))}</p><div class="tags"><span class="tag">約${x.time}分</span><span class="tag">${escapeHTML(x.difficulty)}</span></div><button class="card-decide" data-pick="${x.id}">これにする！</button></article>`).join('')}</div>${resultNavigation()}`:'<div class="actions"><button class="secondary" id="retry">条件を少し変える</button></div>'+resultFooter()}</section>`;
 if(!list.length){$('#retry').onclick=editConditions;bindResetActions();return}
 main.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{let item=state.current.find(x=>String(x.id)===b.dataset.pick);state.selected={kind:'decided',item};state.recipeOpen=false;render()});bindResultNavigation()
}
function areaChoicesMarkup(){return state.areaChoices.length?`<div class="area-options" role="group" aria-label="検索する地域を選ぶ"><p class="area-options-title">検索する駅・地域を選んでください</p>${state.areaChoices.map((x,i)=>`<button type="button" class="area-option" data-area-index="${i}"><strong>${escapeHTML(x.label)}</strong>${x.locality?`<span>${escapeHTML(x.locality)}</span>`:''}</button>`).join('')}</div>`:''}
function restaurantReason(x){
 let a=state.answers,e=restaurantEvidence(x),c=(x.cuisine+' '+x.name).toLowerCase(),matched=[];
 if(a.main&&a.main!=='either'&&e.main.has(a.main))matched.push(LABELS.main[a.main]);
 if(a.feel&&a.feel!=='either'&&e.feel===a.feel)matched.push(LABELS.feel[a.feel]);
 if(a.genre&&a.genre!=='either'&&genreWords[a.genre]?.test(c))matched.push(LABELS.genre[a.genre]);
 if(a.temp&&a.temp!=='either'&&e.temp===a.temp)matched.push(LABELS.temp[a.temp]);
 if(a.spicy==='yes'&&e.spicy)matched.push('辛いもの');
 if(a.main&&a.main!=='either'&&!e.main.size)return `食べたいものを判定できる登録情報が少ないため、店舗の料理内容をご確認ください。${formatDistance(x.distance)}の場所です。`;
 return matched.length?`登録された料理ジャンルや店名が「${matched.join('・')}」の条件に合っています。${restaurantConditionGap(x,a)?'ほかの条件は店舗情報をご確認ください。':''}${formatDistance(x.distance)}の場所です。`:`${formatDistance(x.distance)}の近隣候補です。料理内容と希望の一致は店舗情報でご確認ください。`
}
function recoveryActions(){return `<div class="recovery"><p>別の方法で探せます</p><div class="actions"><button class="secondary" id="focusArea">駅名・エリアから探す</button>${state.searchOrigin&&state.radius<10000?'<button class="secondary" id="expand">検索範囲を広げる</button>':''}<button class="secondary" id="editConditions">条件を少し変える</button></div></div>`}
function bindRecovery(){if($('#focusArea'))$('#focusArea').onclick=()=>$('#areaInput')?.focus();if($('#expand'))$('#expand').onclick=expandRadius;if($('#editConditions'))$('#editConditions').onclick=editConditions}
async function expandRadius(){if(!state.searchOrigin||state.loading)return;const sizes=[500,1000,3000,5000,10000];state.radius=sizes.find(n=>n>state.radius)||10000;state.loading=true;state.loadingStage=`${state.radius>=1000?state.radius/1000+'km':state.radius+'m'}以内を探しています…`;state.notice='';render();let requestState=state;try{await searchRestaurants(state.searchOrigin.lat,state.searchOrigin.lon)}catch(err){if(state===requestState)state.notice=`店舗検索に失敗しました。前の候補は残しています。${err.message||'エリアを変えてお試しください。'}`}finally{if(state===requestState){state.loading=false;render()}}}
function outResults(){
 let list=state.current||[],chosen=chosenConditions();
 let searchContent=state.loading?`<div class="status" role="status"><strong>${escapeHTML(state.loadingStage)}</strong>少しお待ちください。<div class="actions"><button class="secondary" id="cancelSearch">検索を中止して場所を変える</button></div></div>`:
 state.locationConfirm?`<div class="status location-confirm" role="group" aria-label="位置情報の確認"><strong>現在地を使って近くのお店を探します。位置情報を使用しますか？</strong><p>検索時に位置を約100m単位に丸めて地図サービスへ送り、保存はしません。</p><div class="actions"><button class="primary" id="locationUse">位置情報を使う</button><button class="secondary" id="locationCancel">キャンセル</button></div></div>`:
 `<div class="status"><strong>現在地から探す</strong>現在地周辺のレストランを検索するために位置情報を使用します。検索時は位置を約100m単位に丸めて外部の地図サービスへ送ります。保存はしません。</div><div class="actions"><button class="primary" id="locate">位置情報を使って探す</button></div><form class="area-form" id="areaForm"><label for="areaInput">位置情報を使わない場合</label><div class="area-row"><input id="areaInput" name="area" type="search" autocomplete="off" maxlength="80" placeholder="駅名・市区町村・地域名" value="${escapeHTML(state.areaQuery||'')}" required><button class="secondary" type="submit">エリアを入力して検索</button></div></form>${areaChoicesMarkup()}${state.notice?recoveryActions():''}`;
 main.innerHTML=`<section class="screen results"><div class="results-header"><div><p class="eyebrow">${state.surpriseKind==='out'?'OUTSIDE QUICK PICK':'YOUR DINNER SHORTLIST'}</p><h1>近くの夕食候補</h1><p class="lead">${state.searchLabel?`${escapeHTML(state.searchLabel)}から、今夜の候補を絞りました。`:'現在地またはエリアから探せます。'} ${state.searchOrigin?`検索範囲：${state.radius>=1000?state.radius/1000+'km':state.radius+'m'}`:''}</p></div>${state.surpriseKind==='out'?'':'<button class="back" id="edit">← 回答を見直す</button>'}</div>${chosen.length&&!state.surpriseKind?`<p class="answer-summary">選んだ条件：${chosen.map(escapeHTML).join(' · ')}</p>`:''}${state.loading?searchContent:''}${list.length?`<div class="result-list">${list.map((x,i)=>`<article class="result-card"><span class="rank">PICK ${String(i+1).padStart(2,'0')}</span><h2>${escapeHTML(x.name)}</h2><p>${escapeHTML(x.genre)}</p><p class="reason">${escapeHTML(restaurantReason(x))}</p><div class="tags"><span class="tag">${formatDistance(x.distance)}</span><span class="tag">${escapeHTML(x.openLabel)}</span>${x.price?`<span class="tag">${escapeHTML(x.price)}</span>`:''}</div><p class="hours-line">${escapeHTML(x.hoursLabel)}</p><div class="card-buttons"><button class="card-decide" data-pick="${escapeHTML(x.id)}">これにする！</button><button class="link detail-button" data-id="${escapeHTML(x.id)}">店舗情報を見る ↗</button></div></article>`).join('')}</div>${resultNavigation()}`:state.loading?'':`${searchContent}${resultFooter()}`}${state.notice?`<p class="notice" role="alert">${escapeHTML(state.notice)}</p>`:''}<p class="notice">営業時間・営業状況は訪問前に店舗情報をご確認ください。地図データ：<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></p></section>`;
 if($('#edit'))$('#edit').onclick=editConditions;
 if($('#cancelSearch'))$('#cancelSearch').onclick=()=>{state.searchSerial++;state.searchController?.abort();state.searchController=null;clearTimeout(state.locationWatchdog);state.locationWatchdog=null;state.loading=false;state.notice='検索を中止しました。駅名・エリアを入力するか、もう一度現在地からお試しください。';render()};
 if(!list.length){
  bindResetActions();
  if(state.locationConfirm&&!state.loading){$('#locationUse').onclick=locate;$('#locationCancel').onclick=()=>{state.locationConfirm=false;render()};$('#locationUse').focus()}
  else if(!state.loading){$('#locate').onclick=()=>{state.notice='';state.locationConfirm=true;render()};$('#areaForm').onsubmit=searchArea;main.querySelectorAll('[data-area-index]').forEach(b=>b.onclick=()=>selectArea(Number(b.dataset.areaIndex)));bindRecovery()}
  return
 }
 main.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{state.selected={kind:'decided',item:state.current.find(x=>x.id===b.dataset.pick)};render()});bindResultNavigation();
 $('#newsearch').onclick=()=>{state.searchSerial++;state.loading=false;state.pool=[];state.restaurantCandidates=[];resetPages();state.notice='';state.searchLabel='';state.areaChoices=[];state.searchOrigin=null;render()};
 main.querySelectorAll('.detail-button').forEach(b=>b.onclick=()=>{state.selected={kind:'detail',item:state.current.find(x=>x.id===b.dataset.id)};render()});
}
function picked(){
 let x=state.selected.item,guide=state.mode==='cook'?recipeGuide(x):null;
 main.innerHTML=`<section class="screen"><div class="picked"><span class="symbol" aria-hidden="true">✓</span><p class="eyebrow">DINNER DECIDED</p><h1>今日の夕食は「${escapeHTML(x.name)}」に決定！</h1>${state.mode==='cook'?`<div class="picked-photo">${recipeMedia(x)}</div><p class="recipe-time">調理時間の目安：約${x.time}分</p><button class="primary" id="recipeToggle" aria-expanded="${state.recipeOpen}">${state.recipeOpen?'レシピを閉じる':'レシピを見る'}</button>${state.recipeOpen?`<div class="quick-recipe"><h2>材料 <small>約2人分</small></h2><ul>${guide.ingredients.map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul><h2>簡単な作り方</h2><ol>${guide.steps.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ol>${guide.approximate?'<p class="recipe-note">材料と手順は家庭向けの目安です。味を見ながら調整してください。</p>':''}</div>`:''}`:`<p>${escapeHTML(x.description||'このお店で夕食にしましょう。')}</p><p class="recipe-time">${formatDistance(x.distance)} · ${escapeHTML(x.openLabel)}</p>`}<div class="actions decision-actions">${state.surpriseKind==='full'||state.surpriseKind==='cook'?'<button class="secondary" id="surpriseAgain">もう一度おまかせ</button>':`<button class="secondary" id="backresults">候補に戻る</button>${state.surpriseKind==='out'?'':'<button class="secondary" id="editConditions">条件を少し変える</button>'}`} ${state.mode==='out'?'<button class="secondary" id="see">店舗情報を見る</button>':''}</div>${state.surpriseKind==='full'||state.surpriseKind==='cook'?'<div class="result-footer"><button class="link-like" id="returnHome">ホームに戻る</button></div>':resultFooter()}</div></section>`;
 if($('#recipeToggle'))$('#recipeToggle').onclick=()=>{state.recipeOpen=!state.recipeOpen;render()};
 if($('#surpriseAgain'))$('#surpriseAgain').onclick=()=>{state.recipeOpen=false;state.selected={kind:'surprise',item:x};surpriseAgain()};
 if($('#backresults'))$('#backresults').onclick=()=>{state.selected=null;render()};
 if($('#editConditions'))$('#editConditions').onclick=editConditions;
 if($('#see'))$('#see').onclick=()=>{state.selected={kind:'detail',item:x};render()};
 bindResetActions();if($('#returnHome'))$('#returnHome').onclick=returnHome
}
function detail(){let x=state.selected.item;let osm=`https://www.openstreetmap.org/?mlat=${x.lat}&mlon=${x.lon}#map=17/${x.lat}/${x.lon}`;let route=`https://www.google.com/maps/dir/?api=1&destination=${x.lat}%2C${x.lon}`;main.innerHTML=`<section class="screen detail"><button class="back" id="backresults">← 候補に戻る</button><p class="eyebrow">RESTAURANT DETAIL</p><h1>${escapeHTML(x.name)}</h1><p class="lead">${escapeHTML(x.description)}</p><dl><dt>距離</dt><dd>${formatDistance(x.distance)}</dd><dt>営業時間</dt><dd>${escapeHTML(x.hoursLabel)}<br>${escapeHTML(x.openLabel)}</dd><dt>住所</dt><dd>${escapeHTML(x.address||'地図で場所を確認してください')}</dd><dt>ジャンル</dt><dd>${escapeHTML(x.genre)}</dd>${x.price?`<dt>登録価格帯</dt><dd>${escapeHTML(x.price)}</dd>`:''}</dl><div class="actions"><a class="primary" href="${osm}" target="_blank" rel="noopener" style="text-decoration:none">地図で開く ↗</a><a class="secondary" href="${route}" target="_blank" rel="noopener" style="text-decoration:none">ルートを見る ↗</a></div><p class="notice">営業時間は変更される場合があります。訪問前に店舗情報をご確認ください。© OpenStreetMap contributors</p>${resultFooter()}</section>`;$('#backresults').onclick=()=>{state.selected=null;render()};bindResetActions()}
function formatDistance(m){return m<1000?`${Math.round(m)}m`:`${(m/1000).toFixed(1)}km`}
function distance(a,b,c,d){let R=6371000,p1=a*Math.PI/180,p2=c*Math.PI/180,dp=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;return 2*R*Math.asin(Math.sqrt(Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2))}
function openStatus(hours){if(!hours)return null;if(hours.trim()==='24/7')return true;if(/^(off|closed)$/i.test(hours.trim()))return false;let partsNow=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value])),days=['Su','Mo','Tu','We','Th','Fr','Sa'],day=days.indexOf(partsNow.weekday.slice(0,2)),minute=Number(partsNow.hour)*60+Number(partsNow.minute);let parts=hours.split(';').map(s=>s.trim());let matched=false,open=false;for(let part of parts){let m=part.match(/^(?:(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+)?(\d{1,2}:\d{2})-(\d{1,2}:\d{2})(?:\s*,\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2}))?$/);if(!m)return null;let from=m[1]?days.indexOf(m[1]):0,to=m[2]?days.indexOf(m[2]):from,active=m[1]?from<=to?day>=from&&day<=to:day>=from||day<=to:true;for(let k of [[m[3],m[4]],[m[5],m[6]]]){if(!k[0])continue;let time=z=>{let [h,min]=z.split(':').map(Number);return h*60+min};let start=time(k[0]),end=time(k[1]);if(start>=1440||end>1440||end<=start)return null;if(active){matched=true;if(minute>=start&&minute<end)open=true}}}return matched?open:false}
const cuisineNames={japanese:'和食',italian:'イタリアン',french:'フレンチ',chinese:'中華',korean:'韓国料理',thai:'タイ料理',vietnamese:'ベトナム料理',indian:'インド料理',nepalese:'ネパール料理',turkish:'トルコ料理',mexican:'メキシコ料理',sushi:'寿司',ramen:'ラーメン',udon:'うどん',soba:'そば',curry:'カレー',burger:'ハンバーガー',hamburger:'ハンバーガー',pizza:'ピザ',pasta:'パスタ',steak:'ステーキ',seafood:'海鮮',fish:'魚料理',barbecue:'焼肉',yakiniku:'焼肉',yakitori:'焼き鳥',izakaya:'居酒屋',hot_pot:'鍋',hotpot:'鍋',teishoku:'定食',regional:'郷土料理',coffee_shop:'カフェ',sandwich:'軽食',western:'洋食',international:'各国料理',asian:'アジア料理'};
const amenityNames={restaurant:'レストラン',fast_food:'軽食',food_court:'フードコート',cafe:'カフェ',pub:'パブ'};
function restaurantGenre(tags){let cuisines=(tags.cuisine||'').split(';').map(v=>v.trim()).filter(Boolean);if(!cuisines.length)return amenityNames[tags.amenity]||'飲食店';return cuisines.map(v=>cuisineNames[v.toLowerCase().replaceAll(' ','_')]||v.replaceAll('_',' ')).join('・')}
function restaurantHours(hours){if(!hours)return '営業時間は店舗情報をご確認ください';if(hours.trim()==='24/7')return '営業時間：24時間';return `登録営業時間：${hours.replace(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/g,'$1〜$2')}`}
function restaurantPrice(tags){let value=(tags['price:range']||'').trim();return /^[¥￥]{1,4}$/.test(value)?value.replaceAll('￥','¥'):''}
const genreWords={japanese:/japanese|sushi|ramen|udon|soba|donburi|yakitori|izakaya|teishoku|tonkatsu|gyudon|和食|寿司|ラーメン|うどん|そば|居酒屋|定食|焼き鳥|焼鳥|とんかつ|牛丼|豚丼|しゃぶしゃぶ|すき焼き/,western:/western|american|burger|steak|洋食|ハンバーグ|ステーキ|バーガー/,chinese:/chinese|taiwanese|sichuan|中華|四川|餃子/,korean:/korean|yakiniku|韓国|焼肉/,italian:/italian|pizza|pasta|イタリア|パスタ|ピザ/,french:/french|フレンチ|フランス/,ethnic:/thai|vietnamese|indian|nepalese|turkish|mexican|ethnic|タイ|ベトナム|インド|エスニック/};
// OSM cuisine tags identify a specialty; a broad tag such as "japanese" does not
// establish whether the restaurant serves meat, fish or noodles.
function restaurantEvidence(x){
 let c=(x.cuisine+' '+x.name).toLowerCase(),main=new Set();
 if(/\bmeat\b|steak|bbq|barbecue|yakiniku|yakitori|burger|hamburger|kebab|chicken|tonkatsu|gyudon|焼肉|焼き鳥|焼鳥|焼とん|ステーキ|ハンバーグ|とんかつ|かつ丼|牛丼|豚丼|牛たん|牛タン|しゃぶしゃぶ|すき焼き|串カツ|ローストビーフ|肉料理|肉定食|唐揚げ|からあげ|チキン|サムギョプサル|すき家|吉野家|松屋|かつや/.test(c))main.add('meat');
 if(/seafood|sushi|fish|鮨|寿司|すし|海鮮|魚介|魚料理|魚定食|焼き魚|鮮魚|刺身|まぐろ|マグロ|サーモン|うなぎ|鰻|シーフード|スシロー|魚べい/.test(c))main.add('fish');
 if(/noodle|ramen|udon|soba|pasta|spaghetti|pho|ラーメン|らーめん|つけ麺|つけめん|中華そば|蕎麦|そば|うどん|パスタ|スパゲティ|フォー|ビーフン|担々麺|麺屋/.test(c))main.add('noodle');
 if(/rice|donburi|teishoku|curry|gyudon|katsudon|丼|定食|カレー|ライス|ご飯|ビビンバ|すき家|吉野家|松屋|かつや/.test(c))main.add('rice');
 if(/vegetarian|vegan|vegetable|salad|菜食|野菜|サラダ|ベジタリアン|ヴィーガン/.test(c))main.add('vegetable');
 let hearty=/steak|bbq|barbecue|yakiniku|yakitori|burger|hamburger|tonkatsu|gyudon|donburi|curry|ramen|pasta|pizza|焼肉|焼き鳥|ステーキ|ハンバーグ|とんかつ|丼|カレー|ラーメン|パスタ|がっつり|大盛|すき家|吉野家|松屋|かつや/.test(c);
 let light=/sushi|seafood|fish|soba|udon|vegetarian|vegan|salad|寿司|鮨|海鮮|魚料理|魚定食|刺身|そば|蕎麦|うどん|野菜|サラダ|菜食|スシロー|魚べい/.test(c);
 let warm=/hot.?pot|soup|ramen|yakiniku|barbecue|steak|鍋|チゲ|スープ|ラーメン|焼肉|ステーキ/.test(c);
 let cold=/cold|sushi|salad|冷麺|冷やし|ざる|冷製|寿司|鮨|刺身|サラダ/.test(c);
 return {main,feel:hearty&&!light?'hearty':light&&!hearty?'light':null,temp:warm&&!cold?'warm':cold&&!warm?'cold':null,spicy:/spicy|sichuan|麻辣|辛|激辛|キムチ|チゲ|四川/.test(c)}
}
function restaurantConditionGap(x,a){
 let e=restaurantEvidence(x),c=(x.cuisine+' '+x.name).toLowerCase();
 return Boolean(a.main&&a.main!=='either'&&!e.main.has(a.main)||a.feel&&a.feel!=='either'&&e.feel!==a.feel||a.genre&&a.genre!=='either'&&!genreWords[a.genre]?.test(c)||a.temp&&a.temp!=='either'&&e.temp!==a.temp||a.spicy==='yes'&&!e.spicy)
}
function scoreRestaurant(x){
 let a=state.answers,c=(x.cuisine+' '+x.name).toLowerCase(),e=restaurantEvidence(x);
 let primary=a.main&&a.main!=='either'?(e.main.has(a.main)?2:e.main.size?0:1):1;
 let feel=a.feel&&a.feel!=='either'?(e.feel===a.feel?1:e.feel?-1:0):0;
 let genre=a.genre&&a.genre!=='either'&&genreWords[a.genre]?.test(c)?1:0;
 let temp=a.temp&&a.temp!=='either'?(e.temp===a.temp?1:e.temp?-1:0):0;
 let spicy=a.spicy==='yes'&&e.spicy?1:a.spicy==='no'&&e.spicy?-1:0;
 let hunger=a.hunger==='filling'&&e.feel==='hearty'||a.hunger==='light'&&e.feel==='light'?1:0;
 return primary*100000+feel*10000+genre*1000+temp*100+spicy*10+hunger
}
function sortRestaurants(a,b){
 let scoreDiff=scoreRestaurant(b)-scoreRestaurant(a);
 if(scoreDiff)return scoreDiff;
 if(a.open!==b.open)return Number(b.open===true)-Number(a.open===true);
 if(a.venueType!==b.venueType){let rank={restaurant:3,fast_food:2,food_court:2,cafe:1,pub:0};let diff=(rank[b.venueType]||0)-(rank[a.venueType]||0);if(diff)return diff}
 if(a.chainLikely!==b.chainLikely)return Number(b.chainLikely)-Number(a.chainLikely);
 return a.distance-b.distance||a.name.localeCompare(b.name,'ja')
}
function locationError(err){
 if(err?.code===1)return '位置情報が許可されていません。ブラウザ設定から位置情報を許可してください。iPhone：設定 → プライバシーとセキュリティ → 位置情報サービス → Safari（またはSafariのWebサイト）。Android：Chrome のサイト設定 → 位置情報。LINE内で開いている場合はSafariまたはChromeで開き直すか、エリア検索をご利用ください。';
 if(err?.code===3)return '現在地の取得が時間切れになりました。もう一度試すか、エリア検索をご利用ください。';
 return '現在地を取得できませんでした。通信状態と端末の位置情報設定を確認するか、エリア検索をご利用ください。'
}
function locate(){
 // Invoked directly by the confirmation button so browsers retain user activation.
 state.locationConfirm=false;state.notice='';
 if(!window.isSecureContext){state.notice='位置情報はHTTPSで開いたときだけ使えます。公開URLから開くか、エリア検索をご利用ください。';return render()}
 if(!navigator.geolocation){state.notice='このブラウザでは位置情報を利用できません。SafariまたはChromeで開き直すか、エリア検索をご利用ください。';return render()}
 const requestState=state,serial=++state.searchSerial;
 state.loading=true;state.loadingStage='現在地を取得しています…';render();
 let settled=false,watchdog;
 const active=()=>!settled&&state===requestState&&state.searchSerial===serial&&state.mode==='out'&&state.step===questions.length;
 const fail=err=>{if(!active())return;settled=true;clearTimeout(watchdog);state.loading=false;state.notice=locationError(err);render()};
 const succeed=async pos=>{
  if(!active())return;settled=true;clearTimeout(watchdog);
  const lat=pos?.coords?.latitude,lon=pos?.coords?.longitude;
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){state.loading=false;state.notice='現在地を読み取れませんでした。エリア検索をご利用ください。';return render()}
  state.loadingStage='現在地の近くのお店を探しています…';state.searchLabel='現在地周辺';state.searchOrigin={lat,lon};render();
  try{await searchRestaurants(lat,lon)}catch(err){state.notice=`現在地は取得できましたが、店舗検索に失敗しました。${err.message||'時間をおいて再試行してください。'}`}
  finally{if(state===requestState){state.loading=false;render()}}
 };
 watchdog=setTimeout(()=>fail({code:3}),35000);state.locationWatchdog=watchdog;
 try{navigator.geolocation.getCurrentPosition(succeed,fail,{enableHighAccuracy:false,timeout:25000,maximumAge:0})}
 catch(err){fail(err)}
}
let lastGeocodeAt=0;
const PREFECTURES=['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];
function prefectureOf(place){let parts=[place.address?.state,place.address?.province,...String(place.display_name||'').split(',')];return parts.map(x=>String(x||'').trim()).find(x=>PREFECTURES.includes(x))||''}
function areaOptions(places,query){let seen=new Set();return places.map(p=>{
 let lat=Number(p.lat),lon=Number(p.lon),prefecture=prefectureOf(p);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||!prefecture)return null;
 let station=p.class==='railway'||p.type==='station';
 let name=String(p.namedetails?.['name:ja']||p.namedetails?.name||p.name||p.display_name?.split(',')[0]||query).trim();
 if(station&&!name.endsWith('駅'))name+='駅';
 let locality=[p.address?.city,p.address?.town,p.address?.municipality,p.address?.county].find(x=>x&&x!==prefecture)||'';
 let key=station?`${name}|${prefecture}|${locality}`:`${name}|${prefecture}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
 if(seen.has(key))return null;seen.add(key);
 return {lat,lon,label:`${name}｜${prefecture}`,locality,station}
 }).filter(Boolean).sort((a,b)=>Number(b.station)-Number(a.station))}
async function searchArea(event){
 event.preventDefault();const query=$('#areaInput').value.trim();state.areaQuery=query;
 if(query.length<2){state.notice='駅名や市区町村を2文字以上入力してください。';return render()}
 if(Date.now()-lastGeocodeAt<1100){state.notice='少し待ってから再検索してください。';return render()}
 lastGeocodeAt=Date.now();state.loading=true;state.loadingStage='駅・エリアの候補を探しています…';state.notice='';state.areaChoices=[];render();
 let timer,controller=new AbortController(),requestState=state,serial=++state.searchSerial;state.searchController=controller;
 try{
  timer=setTimeout(()=>controller.abort(),15000);
  let url=new URL('https://nominatim.openstreetmap.org/search');
  url.search=new URLSearchParams({q:query,format:'jsonv2',countrycodes:'jp',limit:'12',addressdetails:'1',namedetails:'1',dedupe:'0','accept-language':'ja'});
  let response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error(`地名検索サービスが応答しませんでした（${response.status}）。`);
  let places=await response.json();if(state!==requestState||state.searchSerial!==serial)return;
  state.areaChoices=areaOptions(places,query);
  if(!state.areaChoices.length)throw Error('都道府県が分かる候補を見つけられませんでした。都道府県名を加えて検索してください。');
 }catch(err){if(state===requestState&&state.searchSerial===serial)state.notice=err.name==='AbortError'?'エリア検索が時間切れになりました。時間をおいて再試行してください。':err.message||'エリア検索に失敗しました。'}
 finally{clearTimeout(timer);if(state===requestState&&state.searchSerial===serial){state.searchController=null;state.loading=false;render()}}
}
async function selectArea(index){
 let choice=state.areaChoices[index];if(!choice)return;
 state.searchLabel=choice.label;state.searchOrigin={lat:choice.lat,lon:choice.lon};state.loading=true;state.loadingStage=`${choice.label}周辺のお店を探しています…`;state.notice='';render();
 let requestState=state;
 try{await searchRestaurants(choice.lat,choice.lon);if(state===requestState&&state.current.length)state.areaChoices=[]}
 catch(err){if(state===requestState)state.notice=`店舗検索に失敗しました。${err.message||'時間をおいて再試行してください。'}`}
 finally{if(state===requestState){state.loading=false;render()}}
}
function rankRestaurants(candidates){
 let found=candidates,a=state.answers,uncertainMain=false;
 if(!found.length){state.pool=[];resetPages();state.notice='この範囲に営業中または営業状況を確認できるお店が見つかりませんでした。検索範囲を広げるか、駅名・エリアを変更してください。';return}
 if(a.main&&a.main!=='either'){
  let matching=found.filter(x=>restaurantEvidence(x).main.has(a.main));
  if(matching.length)found=matching;
  else{found=found.filter(x=>!restaurantEvidence(x).main.size);uncertainMain=true}
 }
 if(!found.length){state.pool=[];resetPages();state.notice=`この範囲では「${LABELS.main[a.main]}」を中心に食べられるお店を確認できませんでした。検索範囲を広げるか、条件を少し変えてください。`;return}
 state.pool=found.sort(sortRestaurants);resetPages();showNext();
 let relaxed=uncertainMain||state.current.some(x=>restaurantConditionGap(x,a));
 state.notice=relaxed?'完全一致するお店が近くになかったため、食べたいものを優先して条件に近いお店を表示しています。登録情報が足りない場合は店舗の料理内容をご確認ください。':state.pool.every(x=>x.open===null)?'営業時間の登録がないため、営業状況は店舗にご確認ください。':''
}
async function searchRestaurants(lat,lon){
 let radius=state.radius,requestState=state,serial=++state.searchSerial;
 let query=`[out:json][timeout:18];(nwr["amenity"~"^(restaurant|fast_food|food_court|cafe|pub)$"]["name"](around:${radius+150},${lat.toFixed(3)},${lon.toFixed(3)}););out center;`;
 try{
  let json,failed;
  const endpoints=['https://lz4.overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
  for(let i=0;i<endpoints.length;i++){
   if(state!==requestState||state.searchSerial!==serial)return;
   if(i){state.loadingStage=`別の検索先でお店を探しています…（${i+1}/${endpoints.length}）`;render()}
   let controller=new AbortController(),timer=setTimeout(()=>controller.abort(),13000);state.searchController=controller;
   try{let response=await fetch(endpoints[i]+'?'+new URLSearchParams({data:query}),{signal:controller.signal});
    if(!response.ok)throw Error(`検索サービスが混み合っています（${response.status}）。`);
    json=await response.json();break
   }catch(err){failed=err}finally{clearTimeout(timer);if(state===requestState&&state.searchController===controller)state.searchController=null}
  }
  if(state!==requestState||state.searchSerial!==serial)return;
  if(!json)throw Error(`${failed?.name==='AbortError'?'検索サービスが時間切れになりました。':failed?.message||'検索サービスに接続できませんでした。'} 時間をおいて再試行してください。`);
  let seen=new Set();
  let items=(json.elements||[]).map(o=>{
   let t=o.tags||{},p=o.center||o;
   if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))return null;
   let dist=distance(lat,lon,p.lat,p.lon),open=openStatus(t.opening_hours),name=t['name:ja']||t.name;
   if(dist>radius||!name)return null;
   let address=[t['addr:prefecture'],t['addr:city'],t['addr:street'],t['addr:housenumber']].filter(Boolean).join('');
   return{id:`${o.type}-${o.id}`,name,lat:p.lat,lon:p.lon,distance:dist,open,
    openLabel:open===true?'営業中（登録時間から推定）':open===false?'営業時間外':'営業状況は要確認',
    hours:t.opening_hours||'',hoursLabel:restaurantHours(t.opening_hours),address,cuisine:t.cuisine||'',genre:restaurantGenre(t),price:restaurantPrice(t),description:restaurantGenre(t),venueType:t.amenity||'',brand:t.brand||'',brandWikidata:t['brand:wikidata']||''}
  }).filter(Boolean).filter(x=>{
   let key=x.name+'|'+Math.round(x.lat*10000)+'|'+Math.round(x.lon*10000);
   if(seen.has(key))return false;seen.add(key);return true
  });
  // A brand ID or multiple separate local outlets bearing the same recorded brand
  // is a signal only; untagged places are not classified as independent.
  let brandCounts=new Map();
  for(let item of items)if(item.brand)brandCounts.set(item.brand,(brandCounts.get(item.brand)||0)+1);
  for(let item of items)item.chainLikely=Boolean(item.brandWikidata)||(Boolean(item.brand)&&brandCounts.get(item.brand)>1);
  // Known closed venues remain excluded; keep all other fetched venues so
  // changing a diagnosis answer can apply the new condition immediately.
  state.restaurantCandidates=items.filter(x=>x.open!==false);
  rankRestaurants(state.restaurantCandidates)
 }catch(err){throw err}
}
$('#home').onclick=returnHome;render();
