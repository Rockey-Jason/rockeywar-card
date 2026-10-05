/* 돌이전쟁: 카드 — deterministic state-driven rules engine */
(() => {
"use strict";

const C=[
["새싹","풀",40,5,1,"아군 1명의 체력 2 회복",0],["덩굴","풀",20,7,2,"적 1명의 다음 공격 피해 50% 감소",4],["네잎클로버","풀",15,6,2,"아군 1명이 다음에 받는 피해 3 감소",3],["민들레","풀",25,6,2,"아군 1명의 다음 공격 피해 +5",4],["나무","풀",15,20,4,"자신이 다음에 받는 피해 -7",4],["풀잎","풀",35,4,1,"자신 또는 아군 1명 HP +1",1],["꽃","풀",20,7,2,"모든 아군 HP +1",4],["선인장","풀",15,12,3,"자신에게 피해를 준 적에게 3 피해",3],["버섯","풀",20,8,3,"처치될 때 모든 적에게 2 피해",5],["거대한 나무","풀",5,30,5,"3턴 동안 모든 아군 받는 피해 -2",10],
["눈사람","얼음",30,10,3,"모든 적 1 피해 + 1턴 피해량 20% 감소",3],["얼음골렘","얼음",15,15,4,"적 1명의 공격력 2턴 -3",5],["눈폭풍","얼음",10,8,3,"모든 적 2 피해",4],["얼음벽","얼음",15,20,4,"아군 1명이 다음 받는 피해 완전 무효",7],["빙결정","얼음",15,7,3,"적 1명이 다음 자신의 차례에 공격 불가",4],["눈덩이","얼음",30,5,1,"적 1명 3 피해",2],["펭귄","얼음",20,8,2,"적 1명의 다음 공격 피해 -5",3],["빙하","얼음",8,25,5,"모든 적의 다음 공격 피해 -3",7],["서리","얼음",20,6,2,"적 1명의 피해량 2턴 20% 감소",5],["얼음결정","얼음",10,10,4,"적 1명 1턴 행동 불가",6],
["불씨","불",25,6,2,"적 1명 2 피해 + 2턴 화상 1",4],["화산석","불",10,12,4,"자신 HP 3 소모 → 적 1명 7 피해",5],["불꽃","불",30,5,1,"적 1명 3 피해",2],["횃불","불",20,8,2,"적 1명 2 피해 + 3턴 화상",4],["화염구","불",15,7,3,"적 1명 8 피해",5],["용암","불",10,15,4,"적 5 피해 + 2턴 화상 2",6],["불도마뱀","불",15,12,3,"HP 절반 이하라면 공격 피해 +2",3],["태양","불",5,25,5,"모든 아군 다음 공격 +5",9],["운석","불",5,10,5,"모든 적 5 피해",10],
["바위","땅",30,15,2,"자신이 다음 받는 피해 -5",3],["골렘","땅",10,25,5,"다음 공격 2배, 이후 2턴 공격 불가",7],["자갈","땅",40,5,1,"적 1명 2 피해",1],["돌벽","땅",20,20,3,"자신이 다음 받는 피해 -8",4],["석상","땅",10,20,4,"2턴 동안 받는 피해 50% 감소",7],["바위산","땅",5,35,5,"받는 첫 번째 피해 완전 무효",8],["광부","땅",15,10,3,"아이템 1개 획득",5],["보석","땅",10,8,4,"다음 자신이 받는 피해 0",6],["땅곰","땅",15,18,3,"적 1명 6 피해",4],
["깃털","바람",25,5,1,"즉시 추가 행동 1회",8],["회오리","바람",10,8,3,"적 1명 현재 HP 2 감소 후 덱으로 반환",6],["바람","바람",35,5,1,"적의 다음 공격 대상을 무작위 변경",4],["돌풍","바람",20,7,2,"적 1명을 덱으로 반환",6],["회오리바람","바람",15,8,3,"적 4 피해 + 덱 위로 이동",5],["독수리","바람",15,10,3,"다음 공격이 방어 효과 무시",5],["매","바람",10,8,4,"적 1명 7 피해",5],["태풍","바람",8,15,5,"모든 적을 덱으로 반환",12],["바람새","바람",20,6,2,"아군 1명의 다음 공격을 한 번 더 사용 가능",8]
];
const L=[
["돌이","땅",60,10,"99% 확률 10% 반사, 1% 확률 100% 반사(후자는 무피해). 땅 아군 수×2가 모든 아군 공격에 추가.","적 1명 10 피해 + 1턴 기절","모든 적 1 피해 + 추가 공격 1회",2,4],
["식빵이","음식",100,10,"아군이 받는 피해의 50%를 대신 받고 자신은 추가로 25% 감소. 모든 아군이 음식이면 매턴 5 회복.","2턴 무적","",7,0],
["윈터","얼음",30,10,"매턴 5 피해, 공격 -2. 모든 아군이 얼음이면 자해 없음, 공격 -1.","적 1명 40 피해 + 4턴 기절","상대 덱의 카드 1장 20 피해 + 2턴 기절",4,6],
["모래","땅",40,10,"매턴 아이템 1개. 보유 아이템 수만큼 자신의 모든 피해 증가. 모든 아군이 땅이면 3턴마다 2회 공격.","모든 적 1 피해","적 1명을 전장에서 제거(2회)",0,0],
["복돌이","바람",45,10,"모든 적 중 최저 HP에게 자신의 피해 +5. 출혈 피해에는 추가 +2.","적 1명 15 피해 + HP 0까지 매턴 출혈 3","다음 턴 자신의 피해 2배",4,7],
["스노우","얼음",35,10,"HP 0 즉시 35로 부활. 매 3턴 아군에게 보호막.","아군이 이번 라운드 5회 공격","아군 디버프 해제",20,5],
["앙버터","불",80,10,"매턴 아군 HP 3 회복. 모든 아군이 음식이면 아군 처치 시 다른 아군 3턴 무적 +2 회복.","저장된 열기를 소모해 영구 화상","선택한 적 3명의 평균 HP/5를 열기로 저장",0,0],
["대파","풀",45,10,"매턴 자신 5 회복, 받는 피해 30% 감소.","적 1명 20 피해 + 2턴 기절","아군 4턴간 매턴 3 회복. 기 충전은 별도",4,8]
];
const I=[
["폭탄",20,"적 1명 2 피해"],["방패",10,"아군 1명 1턴 무적"],["알약",30,"아군 1명 HP +1"],["엑스레이",5,"상대 플레이어의 전장+덱+예비 공개"],["돋보기",25,"상대의 카드 1장 확인"],["그물망",3,"적 1명 3턴 공격 불가"],["마법의 물약",3,"처치된 캐릭터/지도자 1장 부활(기본 HP)"],["도로늄",1,"모든 적에게 영구 피폭"],["번개",8,"적 1명 5 피해"],["얼음 조각",5,"적 1명의 다음 공격 무효"],["치료제",10,"제거 가능한 디버프 전부 제거"],["반사경",4,"다음 피해 1회 공격자에게 반사"],["순간이동",7,"자신의 전장 카드와 예비/덱 카드를 교체"],["강탈",3,"지정 상대의 카드 2장을 무작위로 가져옴"],["독",3,"모든 적에게 3턴 독 1 + 피격 피해 +1(비중첩)"]
];

const $=id=>document.getElementById(id), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let S={mode:"pvp",count:2,players:[],charDeck:[],leaderDeck:[],itemDeck:[],initiative:[],turn:1,round:1,active:0,phase:"setup",compositionIndex:0,selected:[],pending:null,gameOver:false};

const clone=o=>JSON.parse(JSON.stringify(o));
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function id(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function stars(n){return "★".repeat(n)}
function cardFrom(x){return{id:id(),name:x[0],attr:x[1],baseHp:x[3],hp:x[3],star:x[4],desc:x[5],cdMax:x[6],cd:0,alive:true,type:"character",status:{}}}
function leaderFrom(x){return{id:id(),name:x[0],attr:x[1],baseHp:x[2],hp:x[2],star:x[3],passive:x[4],s1:x[5],s2:x[6],cd1Max:x[7],cd2Max:x[8],cd1:0,cd2:0,alive:true,type:"leader",status:{},uses:2,heat:0,qi:0}}
function buildCharDeck(){let d=[];C.forEach(x=>{for(let n=0;n<x[2];n++)d.push(cardFrom(x))});return shuffle(d)}
function buildLeaderDeck(){return shuffle(L.map(leaderFrom))}
function buildItemDeck(){let d=[];I.forEach(x=>{for(let n=0;n<x[1];n++)d.push({id:id(),name:x[0],desc:x[2]})});return shuffle(d)}
function go(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function toast(t){let e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1500)}
function log(t){let e=$("log");e.innerHTML="<div>› "+t+"</div>"+e.innerHTML}
function showModal(title,body,closable=true){$("modalTitle").textContent=title;$("modalBody").innerHTML=body;$("modal").classList.add("show");$("modalClose").style.display=closable?"":"none"}
function closeModal(){$("modal").classList.remove("show")}
function all(p){return [...p.field,p.leader].filter(Boolean)}
function alive(p){return all(p).filter(c=>c.alive&&c.hp>0)}
function enemies(pi){return S.players.flatMap((p,i)=>i===pi?[]:alive(p).map(c=>({p,i,c})))}
function topDeck(p){return p.deck.filter(c=>c.alive)}
function owned(p,c){return p.field.includes(c)||p.leader===c}
function allCardPool(p){return [...p.field,p.leader,...p.deck,...p.reserve,...p.discard]}
function allElement(p,a){return all(p).filter(c=>c.alive&&c.attr===a)}
function uniformField(p,a){let aCards=p.field.filter(c=>c.alive);return aCards.length===5&&aCards.every(c=>c.attr===a)}
function dmgAmount(attacker,target,base,opts={}){let v=base;if(attacker.status.attackBonus)v+=attacker.status.attackBonus;if(attacker.status.doubleNext){v*=2;delete attacker.status.doubleNext}if(attacker.name==="불도마뱀"&&attacker.hp<=attacker.baseHp/2)v+=2;if(opts.pierce){}if(attacker.type==="leader"&&attacker.name==="모래")v+=S.players.find(p=>p.leader===attacker)?.items.length||0;let owner=S.players.find(p=>owned(p,attacker));if(owner?.leader?.name==="돌이")v+=allElement(owner,"땅").length*2;if(owner?.leader?.name==="복돌이"){let low=enemies(owner.id).sort((a,b)=>a.c.hp-b.c.hp)[0]?.c;if(low===target)v+=target.status.bleed?v+2:5}if(attacker.status.nextDouble){v*=2;delete attacker.status.nextDouble}return Math.max(0,Math.floor(v))}
function receiveDamage(target,raw,source=null,opts={}){if(!target.alive)return 0;let amount=Math.max(0,Math.floor(raw));if(target.status.invuln){return 0}if(target.status.shield){target.status.shield=false;return 0}if(!opts.pierce){if(target.status.guard){amount=Math.max(0,amount-target.status.guard);delete target.status.guard}if(target.status.halfTurns>0)amount=Math.floor(amount*.5);if(target.status.teamReduce>0)amount=Math.floor(amount*(1-target.status.teamReduce));}if(target.status.dmgDown)amount=Math.floor(amount*(1-target.status.dmgDown));if(target.type==="leader"&&target.name==="식빵이")amount=Math.floor(amount*.75);
let owner=S.players.find(p=>owned(p,target));if(owner?.leader?.name==="대파")amount=Math.floor(amount*.7);
if(target.status.radiation)amount=Math.floor(amount*.7);
let pre=amount;if(source&&target.status.reflectOnce){target.status.reflectOnce=false;receiveDamage(source,pre,target,{pierce:true});}
if(source&&target.name==="돌이"){let r=Math.random()*100;if(r<1){log("돌이의 1% 완전 반사!");receiveDamage(source,pre,target,{pierce:true});return 0}else if(r<100){receiveDamage(source,Math.floor(pre*.1),target,{pierce:true})}}
if(target.status.poisoned)amount+=1;
target.hp-=amount;if(amount>0)log(target.name+"에게 "+amount+" 피해");
if(target.hp<=0)defeat(target,source);
return amount}
function defeat(c,source){if(!c.alive)return;c.hp=0;c.alive=false;let owner=S.players.find(p=>owned(p,c));if(c.name==="스노우"&&c.type==="leader"){c.alive=true;c.hp=c.baseHp;log("스노우가 즉시 부활했습니다.");return}if(c.name==="버섯"&&c.type==="character")enemies(owner.id).forEach(x=>receiveDamage(x.c,2,c));if(c.type==="character"&&source){let killer=S.players.find(p=>owned(p,source));if(killer)killer.coins+=c.star}if(owner?.leader?.name==="앙버터"&&uniformField(owner,"음식")){let other=alive(owner).find(x=>x!==c);if(other){other.status.invulnTurns=3;other.status.invuln=true;other.hp=Math.min(other.baseHp,other.hp+2);log("앙버터의 음식 조건 발동: "+other.name+" 무적 3턴")}}log(c.name+" 처치!")}
function moveToDeck(c,owner,mode="bottom"){if(!c)return;c.alive=true;c.hp=c.baseHp;c.status={};owner.field=owner.field.filter(x=>x!==c);if(owner.leader===c)owner.leader=null;if(mode==="top")owner.deck.unshift(c);else owner.deck.push(c)}
function chooseTarget(title,arr,cb){S.pending={type:"target",arr,cb};render();toast(title+" — 대상을 선택하세요.")}
function chooseOwn(title,arr,cb){S.pending={type:"own",arr,cb};render();toast(title+" — 아군을 선택하세요.")}
function selectableCards(){if(!S.pending)return new Set();return new Set(S.pending.arr.map(x=>x.c||x))}
function clearPending(){S.pending=null}
function performAttack(attacker,target,base,opts={}){if(!attacker.alive)return false;if(attacker.status.stunned)return false;let amount=dmgAmount(attacker,target,base,opts);receiveDamage(target,amount,attacker,opts);return true}

function useCharacter(c,pi){let p=S.players[pi];if(c.cd>0){toast("쿨타임 "+c.cd+"턴");return}if(c.status.stunned){toast(c.name+"은(는) 행동 불가 상태입니다.");return}
const n=c.name;const foe=enemies(pi);const own=alive(p);
const hit=(base)=>chooseTarget(n+" — 적 대상",foe,x=>{performAttack(c,x.c,base,{pierce:c.status.pierce});finishAction(c,pi)});
const finish=()=>{c.cd=c.cdMax||0;finishAction(c,pi)};
if(n==="새싹")chooseOwn("새싹",own,x=>{x.hp=Math.min(x.baseHp,x.hp+2);log(x.name+" HP +2");finish()});
else if(n==="풀잎")chooseOwn("풀잎",own,x=>{x.hp=Math.min(x.baseHp,x.hp+1);finish()});
else if(n==="꽃"){own.forEach(x=>x.hp=Math.min(x.baseHp,x.hp+1));finish()}
else if(n==="민들레")chooseOwn("민들레",own,x=>{x.status.attackBonus=(x.status.attackBonus||0)+5;finish()});
else if(["네잎클로버","바위","나무","돌벽"].includes(n)){chooseOwn(n,[c],x=>{x.status.guard=n==="네잎클로버"?3:n==="바위"?5:n==="나무"?7:8;finish()})}
else if(n==="선인장"){c.status.reflect3=3;finish()}
else if(n==="버섯"){c.status.deathBlast=true;finish()}
else if(n==="거대한 나무"){own.forEach(x=>x.status.teamReduce=Math.max(x.status.teamReduce||0,2/100));own.forEach(x=>x.status.teamReduceTurns=3);finish()}
else if(n==="얼음벽"||n==="보석")chooseOwn(n,own,x=>{x.status.shield=true;finish()});
else if(n==="얼음골렘")chooseTarget(n,foe,x=>{x.c.attackDown=3;x.c.attackDownTurns=2;finish()});
else if(n==="눈사람"){foe.forEach(x=>{performAttack(c,x.c,1);x.c.status.dmgDown=.2;x.c.status.dmgDownTurns=1});finish()}
else if(n==="눈폭풍"){foe.forEach(x=>performAttack(c,x.c,2));finish()}
else if(n==="빙결정")chooseTarget(n,foe,x=>{x.c.status.stunned=true;x.c.status.stunTurns=1;finish()});
else if(n==="얼음결정")chooseTarget(n,foe,x=>{x.c.status.stunned=true;x.c.status.stunTurns=1;finish()});
else if(n==="눈덩이")hit(3);
else if(n==="펭귄")chooseTarget(n,foe,x=>{x.c.status.attackDown=5;x.c.status.attackDownTurns=1;finish()});
else if(n==="빙하"){foe.forEach(x=>{x.c.status.attackDown=3;x.c.status.attackDownTurns=1});finish()}
else if(n==="서리")chooseTarget(n,foe,x=>{x.c.status.dmgDown=.2;x.c.status.dmgDownTurns=2;finish()});
else if(n==="不")finish();
else if(n==="불씨"||n==="횃불"||n==="용암")chooseTarget(n,foe,x=>{let base=n==="불씨"?2:n==="횃불"?2:5;performAttack(c,x.c,base);x.c.status.burn=(n==="용암"?2:1);x.c.status.burnTurns=n==="횃불"?3:2;finish()});
else if(n==="화산석")chooseTarget(n,foe,x=>{if(c.hp<=3){toast("HP가 부족합니다.");return}c.hp-=3;performAttack(c,x.c,7);finish()});
else if(n==="불꽃")hit(3);
else if(n==="화염구")hit(8);
else if(n==="불도마뱀")hit(3);
else if(n==="태양"){own.forEach(x=>x.status.attackBonus=(x.status.attackBonus||0)+5);finish()}
else if(n==="운석"){foe.forEach(x=>performAttack(c,x.c,5));finish()}
else if(n==="골렘"){c.status.doubleNext=true;c.status.stunned=true;c.status.stunTurns=2;finish()}
else if(n==="자갈")hit(2);
else if(n==="석상"){c.status.halfTurns=2;finish()}
else if(n==="바위산"){c.status.firstImmune=true;finish()}
else if(n==="광부"){p.items.push(drawItem());finish()}
else if(n==="땅곰")hit(6);
else if(n==="깃털"){c.status.extraAction=true;c.cd=c.cdMax;finishAction(c,pi)}
else if(n==="회오리")chooseTarget(n,foe,x=>{receiveDamage(x.c,2,c);if(x.c.alive)moveToDeck(x.c,x.p);finish()});
else if(n==="바람")chooseTarget(n,foe,x=>{x.c.status.randomTarget=true;x.c.status.randomTargetTurns=1;finish()});
else if(n==="돌풍")chooseTarget(n,foe,x=>{moveToDeck(x.c,x.p);finish()});
else if(n==="회오리바람")chooseTarget(n,foe,x=>{performAttack(c,x.c,4);if(x.c.alive)moveToDeck(x.c,x.p,"top");finish()});
else if(n==="독수리"){c.status.pierce=true;finish()}
else if(n==="매")hit(7);
else if(n==="태풍"){foe.forEach(x=>moveToDeck(x.c,x.p));finish()}
else if(n==="바람새")chooseOwn(n,own.filter(x=>x!==c),x=>{x.status.extraAttack=true;finish()});
else hit(2);
}
function useLeader(c,pi){let p=S.players[pi];if(c.status.stunned){toast("지도자가 행동 불가입니다.");return}const foes=enemies(pi),own=alive(p);
if(c.name==="돌이"){if(c.cd1<=0)chooseTarget("돌이 스킬 1",foes,x=>{performAttack(c,x.c,10);x.c.status.stunned=true;x.c.status.stunTurns=1;c.cd1=c.cd1Max;finishAction(c,pi)});else if(c.cd2<=0){foes.forEach(x=>performAttack(c,x.c,1));c.cd2=c.cd2Max;c.status.extraAction=true;finishAction(c,pi)}else toast("돌이 스킬 쿨타임");}
else if(c.name==="식빵이"){if(c.cd1>0)toast("쿨타임");else{c.status.invuln=true;c.status.invulnTurns=2;c.cd1=c.cd1Max;finishAction(c,pi)}}
else if(c.name==="윈터"){if(c.cd1<=0)chooseTarget("윈터 스킬 1",foes,x=>{performAttack(c,x.c,40);x.c.status.stunned=true;x.c.status.stunTurns=4;c.cd1=c.cd1Max;finishAction(c,pi)});else if(c.cd2<=0){let allOpp=S.players.filter((_,i)=>i!==pi);let pool=allOpp.flatMap(q=>q.deck.filter(x=>x.alive).map(x=>({p:q,c:x})));if(!pool.length){toast("상대 덱에 대상이 없습니다.");return}chooseTarget("윈터 스킬 2",pool.map(x=>({c:x.c,p:x.p})),x=>{performAttack(c,x.c,20);x.c.status.stunned=true;x.c.status.stunTurns=2;c.cd2=c.cd2Max;finishAction(c,pi)})}else toast("윈터 스킬 쿨타임");}
else if(c.name==="모래"){if(c.cd1<=0){foes.forEach(x=>performAttack(c,x.c,1));c.cd1=3;finishAction(c,pi)}else if(c.uses>0){chooseTarget("모래 제거",foes,x=>{moveToDeck(x.c,x.p);c.uses--;finishAction(c,pi)})}else toast("모래의 제거 횟수가 없습니다.")}
else if(c.name==="복돌이"){if(c.cd1<=0)chooseTarget("복돌이 출혈",foes,x=>{performAttack(c,x.c,15);x.c.status.bleed=3;x.c.status.bleedPermanent=true;c.cd1=c.cd1Max;finishAction(c,pi)});else if(c.cd2<=0){c.status.nextDouble=true;c.cd2=c.cd2Max;finishAction(c,pi)}else if(c.cd1>0)toast("사용 가능한 복돌이 스킬이 없습니다.");}
else if(c.name==="스노우"){if(c.cd1<=0){c.status.multiAttack=5;c.cd1=c.cd1Max;finishAction(c,pi)}else if(c.cd2<=0){own.forEach(x=>clearRemovable(x));c.cd2=c.cd2Max;finishAction(c,pi)}else toast("스노우 스킬 쿨타임");}
else if(c.name==="앙버터"){if(c.cd1<=0&&c.heat>0){chooseTarget("앙버터 화상",foes,x=>{x.c.status.permaBurn=(x.c.status.permaBurn||0)+c.heat;x.c.status.burnPermanent=true;c.heat=0;c.cd1=1;finishAction(c,pi)})}else{let pool=foes.map(x=>x.c);if(pool.length<3){toast("적 카드가 3장 이상 필요합니다.");return}showModal("앙버터 · 열기 축적",pool.map((x,i)=>'<button class="itemBtn" data-i="'+i+'">'+x.name+" · HP "+x.hp+"</button>").join(""),false);$("modalBody").querySelectorAll("button").forEach(b=>b.onclick=()=>{let chosen=[...$("modalBody").querySelectorAll("button")].filter(x=>x.dataset.pick==="1").map(x=>pool[+x.dataset.i]);b.dataset.pick=b.dataset.pick==="1"?"0":"1";b.classList.toggle("selected");if(chosen.length===3){c.heat=Math.floor(chosen.reduce((a,x)=>a+x.hp,0)/3/5);closeModal();finishAction(c,pi)}})}}
else if(c.name==="대파"){if(c.cd1<=0)chooseTarget("대파 공격",foes,x=>{performAttack(c,x.c,20);x.c.status.stunned=true;x.c.status.stunTurns=2;c.cd1=c.cd1Max;finishAction(c,pi)});else if(c.cd2<=0){own.forEach(x=>x.status.healTurns=4);c.cd2=c.cd2Max;finishAction(c,pi)}else{if(c.qi>=20){}else{c.qi++;own.forEach(x=>x.status.teamReduce=Math.min(1,.4+c.qi*.05));log("대파 기 충전 "+c.qi+"/20");finishAction(c,pi)}}}
}
function clearRemovable(c){for(const k of ["stunned","stunTurns","burn","burnTurns","bleed","poisoned","poisonTurns","attackDown","attackDownTurns","dmgDown","dmgDownTurns","randomTarget","randomTargetTurns","guard"])delete c.status[k]}
function drawItem(){return S.itemDeck.pop()||{id:id(),name:I[Math.floor(Math.random()*I.length)][0],desc:""}}
function useItem(p,item){let idx=p.items.indexOf(item);if(idx<0)return;const name=item.name;const foes=enemies(p.id),own=alive(p);
const done=()=>{p.items.splice(idx,1);render();};
if(name==="폭탄")chooseTarget("폭탄",foes,x=>{receiveDamage(x.c,2,null);done()});
else if(name==="방패")chooseOwn("방패",own,x=>{x.status.invuln=true;x.status.invulnTurns=1;done()});
else if(name==="알약")chooseOwn("알약",own,x=>{x.hp=Math.min(x.baseHp,x.hp+1);done()});
else if(name==="엑스레이"){let q=S.players.find(x=>x!==p);showModal("엑스레이",q?cardList(q):"없음");done()}
else if(name==="돋보기"){let q=S.players.find(x=>x!==p);let pool=q?allCardPool(q).filter(x=>x.alive):[];if(!pool.length){toast("확인할 카드가 없습니다.");return}showModal("돋보기",cardHTML(pool[Math.floor(Math.random()*pool.length)]));done()}
else if(name==="그물망")chooseTarget("그물망",foes,x=>{x.c.status.stunned=true;x.c.status.stunTurns=3;done()});
else if(name==="마법의 물약"){let dead=p.discard||[];if(!dead.length){toast("부활시킬 카드가 없습니다.");return}let c=dead.pop();c.alive=true;c.hp=c.baseHp;p.field.push(c);done()}
else if(name==="도로늄"){foes.forEach(x=>x.c.status.radiation=true);done()}
else if(name==="번개")chooseTarget("번개",foes,x=>{receiveDamage(x.c,5,null);done()});
else if(name==="얼음 조각")chooseTarget("얼음 조각",foes,x=>{x.c.status.nullifyNext=true;done()});
else if(name==="치료제"){own.forEach(clearRemovable);done()}
else if(name==="반사경")chooseOwn("반사경",own,x=>{x.status.reflectOnce=true;done()});
else if(name==="순간이동"){let a=p.field.find(x=>x.alive);let b=p.reserve[0]||p.deck[0];if(!a||!b){toast("교체할 카드가 없습니다.");return}if(p.reserve[0]){p.reserve[0]=a;p.field[p.field.indexOf(a)]=b}else{p.deck[0]=a;p.field[p.field.indexOf(a)]=b}done()}
else if(name==="강탈"){let q=S.players.find(x=>x!==p);let pool=q?allCardPool(q).filter(x=>x.alive):[];if(!pool.length){toast("강탈 대상이 없습니다.");return}shuffle(pool);pool.slice(0,2).forEach(c=>{let oi=allCardPool(q).indexOf(c);if(oi>=0){if(q.deck.includes(c))q.deck.splice(q.deck.indexOf(c),1);else if(q.field.includes(c))q.field.splice(q.field.indexOf(c),1);else if(q.reserve.includes(c))q.reserve.splice(q.reserve.indexOf(c),1);p.reserve.push(c)}});done()}
else if(name==="독"){foes.forEach(x=>{x.c.status.poisoned=true;x.c.status.poisonTurns=3});done()}
}
function cardList(p){return allCardPool(p).map(c=>cardHTML(c)).join("")}
function cardHTML(c,click=false){let tags=[];if(c.status.stunned)tags.push("기절");if(c.status.burn)tags.push("화상");if(c.status.bleed)tags.push("출혈");if(c.status.poisoned)tags.push("독");if(c.status.radiation)tags.push("피폭");if(c.status.invuln)tags.push("무적");return '<div class="card '+(c.type==="leader"?"leader ":"")+(c.alive?"":"dead")+(click?" clickable":"")+'" data-card="'+c.id+'"><div class="head"><span>'+c.name+'</span><span class="stars">'+stars(c.star)+'</span></div><div class="attr">'+c.attr+(c.type==="leader"?" · LEADER":"")+'</div><div class="bar"><i style="width:'+clamp(c.hp/c.baseHp*100,0,100)+'%"></i></div><div class="hp">HP '+Math.max(0,c.hp)+' / '+c.baseHp+(c.cd>0?" · CD "+c.cd:"")+'</div><div class="desc">'+(c.type==="leader"?c.passive:c.desc)+'</div><div class="tags">'+tags.map(x=>'<span class="tag bad">'+x+"</span>").join("")+'</div></div>'}
function render(){if(S.phase==="composition")renderComposition();else if(S.phase==="battle")renderBattle();else if(S.phase==="shop")renderShop()}
function renderComposition(){go("composition");let p=S.players[S.compositionIndex];$("compInfo").textContent=p.name+" · 비공개 구성 · 5장 전장 선택";$("compProgress").textContent=(S.compositionIndex+1)+"/"+S.players.length+" 플레이어";$("compCards").innerHTML=p.hand.map((c,i)=>cardHTML(c,true).replace('data-card="'+c.id+'"','data-card="'+c.id+'" data-index="'+i+'"')).join("");document.querySelectorAll("#compCards .card").forEach(e=>{if(S.selected.includes(+e.dataset.index))e.classList.add("selected");e.onclick=()=>{let i=+e.dataset.index;if(S.selected.includes(i))S.selected=S.selected.filter(x=>x!==i);else if(S.selected.length<5)S.selected.push(i);renderComposition()}})}
function chooseLeader(pi){let p=S.players[pi];if(!S.leaderDeck.length){toast("지도자 더미가 비었습니다.");finishComposition(pi);return}showModal(p.name+" · 지도자 선택",'<div class="selectGrid">'+S.leaderDeck.map((l,i)=>cardHTML(l,true).replace('data-card="'+l.id+'"','data-card="'+l.id+'" data-li="'+i+'"')).join("")+'</div>');$("modalBody").querySelectorAll(".card").forEach(e=>e.onclick=()=>{let l=S.leaderDeck.splice(+e.dataset.li,1)[0];p.leader=l;closeModal();finishComposition(pi)})}
function finishComposition(pi){let p=S.players[pi];const chosen=S.selected.map(i=>p.hand[i]);const rest=p.hand.filter((_,i)=>!S.selected.includes(i));p.field=chosen;p.deck=rest.slice(0,20);p.reserve=rest.slice(20);S.selected=[];if(!p.leader){chooseLeader(pi);return}S.compositionIndex++;if(S.compositionIndex<S.players.length)renderComposition();else beginBattle()}
function beginComposition(){S.phase="composition";S.compositionIndex=0;S.selected=[];S.players.forEach(p=>{const pool=[...p.field,...p.deck,...p.reserve].filter(c=>c&&c.type==="character"&&c.alive);p.hand=pool;});renderComposition()}
function beginBattle(){S.phase="battle";S.turn=1;S.round=1;S.active=S.initiative[0];S.players.forEach(applyStartRound);go("battle");render();log("모든 구성이 완료되었습니다. 전투 시작!");if(aiTurnIfNeeded())return}
function applyStartRound(p){if(!p.leader)return;let l=p.leader;if(l.name==="윈터"&&!uniformField(p,"얼음"))receiveDamage(l,5,null);if(l.name==="앙버터")alive(p).forEach(c=>c.hp=Math.min(c.baseHp,c.hp+3));if(l.name==="대파")l.hp=Math.min(l.baseHp,l.hp+5);if(l.name==="식빵이"&&uniformField(p,"음식"))l.hp=Math.min(l.baseHp,l.hp+5);if(l.name==="모래")p.items.push(drawItem());if(l.name==="스노우"&&S.round%3===0)alive(p).forEach(c=>c.status.shield=true);alive(p).forEach(c=>{if(c.status.burn){receiveDamage(c,c.status.burn,null);if(c.status.burnTurns>0)c.status.burnTurns--}if(c.status.bleed)receiveDamage(c,c.status.bleed,null);if(c.status.poisoned){receiveDamage(c,1,null);c.status.poisonTurns--;if(c.status.poisonTurns<=0)c.status.poisoned=false}if(c.status.healTurns){c.hp=Math.min(c.baseHp,c.hp+3);c.status.healTurns--}})}
function endRound(){S.round++;S.players.forEach(p=>{all(p).forEach(c=>tick(c));applyStartRound(p)});S.players.forEach(p=>{if(p.leader?.name==="앙버터"){} });}
function tick(c){for(const k of ["stunTurns","dmgDownTurns","attackDownTurns","randomTargetTurns","invulnTurns","halfTurns","teamReduceTurns"])if(c.status[k]>0)c.status[k]--;if(c.status.stunTurns<=0)delete c.status.stunned;if(c.status.dmgDownTurns<=0)delete c.status.dmgDown;if(c.status.attackDownTurns<=0)delete c.status.attackDown;if(c.status.randomTargetTurns<=0)delete c.status.randomTarget;if(c.status.invulnTurns<=0){delete c.status.invulnTurns;delete c.status.invuln}if(c.status.halfTurns<=0)delete c.status.halfTurns;if(c.status.teamReduceTurns<=0)delete c.status.teamReduce}
function finishAction(c,pi){clearPending();if(c.status.extraAction){delete c.status.extraAction;render();toast(c.name+" 추가 행동!");return}if(c.status.multiAttack>0){c.status.multiAttack--;render();toast("스노우 효과: 추가 공격 "+c.status.multiAttack+"회 남음");return}if(c.status.extraAttack){delete c.status.extraAttack;render();toast(c.name+" 추가 공격 가능");return}let idx=S.initiative.indexOf(pi),next=S.initiative[(idx+1)%S.initiative.length];if(next===S.initiative[0])endRound();S.active=next;checkEnd();render();aiTurnIfNeeded()}
function checkEnd(){let alivePlayers=S.players.filter(p=>alive(p).length>0);if(alivePlayers.length<=1){let w=alivePlayers[0];if(!w)return true;w.score++;w.coins+=5;log(w.name+" 전투 승리 · 승점 +1 · 코인 +5");if(w.score>=5){S.gameOver=true;$("winner").innerHTML="🏆 <b>"+w.name+"</b> 승리!";go("end");return true}S.phase="shop";S.active=S.initiative[0];renderShop();return true}return false}
function aiTurnIfNeeded(){if(S.phase!=="battle"||S.mode!=="pve"||S.active!==S.count-1)return false;setTimeout(()=>{if(S.phase!=="battle")return;let p=S.players[S.active],cs=alive(p);if(!cs.length){finishAction(p.leader,S.active);return}let c=cs.sort((a,b)=>b.star-a.star)[0];if(c.type==="leader")useLeader(c,S.active);else useCharacter(c,S.active)},450);return true}
function renderBattle(){go("battle");$("status").textContent="TURN "+S.turn+" · ROUND "+S.round;$("turn").textContent=S.turn+"턴";$("active").textContent=S.players[S.active].name+"의 행동";$("arena").innerHTML=S.players.map((p,pi)=>'<div class="player '+(pi===S.active?"active":"")+'"><div class="playerHead"><b>'+p.name+(pi===S.active?" · 행동 중":"")+'</b><span>◆ '+p.coins+" · 승점 "+p.score+"</span></div><div class=\"cards\">"+all(p).map(c=>{let h=cardHTML(c,pi===S.active&&c.alive);return h.replace('data-card="'+c.id+'"','data-card="'+c.id+'" data-pi="'+pi+'"')}).join("")+"</div><div class=\"mini\" style=\"margin-top:7px\">덱 '+p.deck.length+' · 예비 '+p.reserve.length+' · 버린 카드 '+p.discard.length+'</div></div>').join("");document.querySelectorAll("#arena .card.clickable").forEach(e=>e.onclick=()=>{if(S.pending){let c=all(S.players[+e.dataset.pi]).find(x=>x.id===e.dataset.card);if(selectableCards().has(c)){let x=S.pending;clearPending();x.cb({p:S.players[+e.dataset.pi],c});render();}return}let c=all(S.players[S.active]).find(x=>x.id===e.dataset.card);if(c?.alive)(c.type==="leader"?useLeader(c,S.active):useCharacter(c,S.active))});renderInventory();$("actions").innerHTML='<button class="btn" id="detailBtn">📋 전투 상태</button><button class="btn" id="endBtn">행동 종료</button>';$("endBtn").onclick=()=>finishAction(alive(S.players[S.active])[0]||S.players[S.active].leader,S.active);$("detailBtn").onclick=()=>showModal("현재 전투 상태",S.players.map(p=>"<h3>"+p.name+"</h3>"+cardList(p)).join(""))}
function renderInventory(){let p=S.players[S.active];$("inventory").innerHTML=p.items.length?p.items.map((it,i)=>'<button class="itemBtn" data-i="'+i+'">🎴 '+it.name+'</button>').join(""):"<span class=\"mini\">보유 아이템 없음";$("inventory").querySelectorAll("button").forEach(b=>b.onclick=()=>useItem(p,p.items[+b.dataset.i]))}
function drawChar(){return S.charDeck.pop()||cardFrom(C[Math.floor(Math.random()*C.length)])}
function drawLeader(){return S.leaderDeck.pop()||null}
function buyItem(p){p.items.push(drawItem());p.coins--;toast("아이템 획득");renderShop()}
function buyPotion(p){if(p.coins<5){toast("코인 부족");return}const targets=alive(p);if(!targets.length){toast("회복할 카드가 없습니다.");return}p.coins-=5;showModal("물약 · 회복할 카드 선택",targets.map((x,i)=>'<button class="itemBtn" data-i="'+i+'">'+x.name+" · HP "+x.hp+"/"+x.baseHp+"</button>").join(""));$("modalBody").querySelectorAll("button").forEach(b=>b.onclick=()=>{targets[+b.dataset.i].hp=targets[+b.dataset.i].baseHp;closeModal();renderShop()})}
function buyCharacter(p){if(p.coins<3){toast("코인 부족");return}p.coins-=3;let c=drawChar();p.reserve.push(c);toast(c.name+" 획득 · 예비 카드에 보관");renderShop()}
function buyRandomLeader(p){if(p.coins<7||!S.leaderDeck.length){toast("구매 불가");return}p.coins-=7;p.leaderStock.push(drawLeader());toast("랜덤 지도자 획득");renderShop()}
function buyChosenLeader(p){if(p.coins<12||!S.leaderDeck.length){toast("구매 불가");return}p.coins-=12;showModal("지도자 선택",'<div class="selectGrid">'+S.leaderDeck.map((l,i)=>cardHTML(l,true).replace('data-card="'+l.id+'"','data-card="'+l.id+'" data-li="'+i+'"')).join("")+'</div>');$("modalBody").querySelectorAll(".card").forEach(e=>e.onclick=()=>{let l=S.leaderDeck.splice(+e.dataset.li,1)[0];p.leaderStock.push(l);shuffle(S.leaderDeck);closeModal();renderShop()})}
function renderShop(){go("shop");let p=S.players[S.active];$("shopInfo").textContent=p.name+"의 구매 차례 · 구매 후 다음 플레이어로 진행";$("shopCoins").textContent="◆ "+p.coins+" 코인";let arr=[["아이템",1,"아이템 더미 맨 위 1장. 한 구매 단계에서 최대 3회.",()=>buyItem(p)],["물약",5,"아군 캐릭터/지도자 1장의 기본 HP로 회복.",()=>buyPotion(p)],["캐릭터",3,"캐릭터 더미 맨 위 1장. 예비 카드로 보관.",()=>buyCharacter(p)],["랜덤 지도자",7,"지도자 더미 맨 위 1장.",()=>buyRandomLeader(p)],["지도자",12,"지도자 더미에서 원하는 지도자를 확인해 선택하고 나머지는 셔플.",()=>buyChosenLeader(p)]];$("shopGrid").innerHTML=arr.map((x,i)=>'<div class="shop"><h3>'+x[0]+'</h3><div class="price">'+x[1]+' 코인</div><p>'+x[2]+'</p><button class="btn primary" data-buy="'+i+'">구매</button></div>').join("");$("shopGrid").querySelectorAll("button").forEach(b=>b.onclick=()=>{let i=+b.dataset.buy;if(i===0){if((p.shopItems||0)>=3){toast("아이템은 구매 단계당 최대 3개");return}if(p.coins<1){toast("코인 부족");return}p.shopItems=(p.shopItems||0)+1;buyItem(p)}else if(i===1)buyPotion(p);else if(i===2)buyCharacter(p);else if(i===3)buyRandomLeader(p);else buyChosenLeader(p)})}
function nextShop(){let p=S.players[S.active];p.shopItems=0;let idx=S.initiative.indexOf(S.active),next=S.initiative[(idx+1)%S.initiative.length];if(next===S.initiative[0]){S.turn++;S.players.forEach(x=>{x.field=x.field.filter(c=>c.alive);while(x.field.length<5&&x.deck.length)x.field.push(x.deck.shift());if(x.leaderStock?.length){x.leader=x.leaderStock.pop()}});S.active=next;beginComposition()}else{S.active=next;renderShop()}}
function start(){S={...S,players:[],charDeck:buildCharDeck(),leaderDeck:buildLeaderDeck(),itemDeck:buildItemDeck(),initiative:[],turn:1,round:1,active:0,phase:"setup",compositionIndex:0,selected:[],pending:null,gameOver:false};for(let i=0;i<S.count;i++){let hand=[];for(let j=0;j<26;j++)hand.push(S.charDeck.pop());players:0;S.players.push({id:i,name:S.mode==="pve"&&i===S.count-1?"AI":"플레이어 "+(i+1),hand,field:[],deck:[],reserve:[],discard:[],leader:null,leaderStock:[],items:[],coins:0,score:0})}let choices=S.players.map((p,i)=>({i,star:Math.max(...p.hand.map(c=>c.star)),card:p.hand.find(c=>c.star===Math.max(...p.hand.map(c=>c.star)))}));let groups=new Map();choices.forEach(x=>{let a=groups.get(x.star)||[];a.push(x.i);groups.set(x.star,a)});let order=[];[...groups.keys()].sort((a,b)=>b-a).forEach(st=>{let g=groups.get(st);if(g.length===1)order.push(g[0]);else{let redraw=g.map(i=>({i,s:S.players[i].hand[Math.floor(Math.random()*26)].star}));redraw.sort((a,b)=>b.s-a.s);redraw.forEach(x=>order.push(x.i))}});S.initiative=order;log("선공 순서: "+order.map(i=>S.players[i].name).join(" → "));beginComposition()}
function init(){document.querySelectorAll("#modes .choice").forEach(e=>e.onclick=()=>{document.querySelectorAll("#modes .choice").forEach(x=>x.classList.remove("selected"));e.classList.add("selected");S.mode=e.dataset.v;updatePreview()});document.querySelectorAll("#counts .choice").forEach(e=>e.onclick=()=>{document.querySelectorAll("#counts .choice").forEach(x=>x.classList.remove("selected"));e.classList.add("selected");S.count=+e.dataset.v;updatePreview()});$("startBtn").onclick=()=>{go("setup");updatePreview()};$("begin").onclick=start;$("again").onclick=()=>{go("setup");updatePreview()};$("homeBtn").onclick=()=>go("home");$("modalClose").onclick=closeModal;$("rulesBtn").onclick=()=>showModal("전체 규칙",rules());$("compReset").onclick=()=>{S.selected=[];renderComposition()};$("compDone").onclick=()=>{let p=S.players[S.compositionIndex];if(S.selected.length!==Math.min(5,p.hand.length)){toast("전장에 배치할 카드 수를 확인하세요.");return}finishComposition(S.compositionIndex)};$("shopDone").onclick=nextShop;updatePreview()}
function updatePreview(){$("preview").textContent=S.count+"인 "+(S.mode==="pvp"?"PvP":"PvE")+" · 26장 비공개 배분 · 전장 5 · 덱 20 · 예비 1 · 지도자 1"}
function rules(){return '<ol><li>캐릭터 더미에서 각 플레이어에게 26장을 비공개로 배분합니다.</li><li>각자 가장 높은 별 카드를 공개해 선공 순서를 정합니다. 동률은 재추첨으로 해소합니다.</li><li>26장 중 전장 5장, 덱 20장, 예비 1장을 구성합니다. 지도자는 별도 선택합니다.</li><li>전투는 초기 선공 순서를 유지합니다. 한 플레이어는 자신의 차례에 살아있는 카드 1장으로 1회 행동합니다. 스킬은 그 카드의 행동입니다.</li><li>카드가 0 HP가 되면 제거되고, 처치자는 해당 카드의 별 수만큼 코인을 얻습니다. 패배자는 대체 카드를 뽑지 않습니다.</li><li>한 플레이어만 전장에 살아남으면 승점 1과 코인 5를 받고 전투를 종료합니다.</li><li>구매 단계는 초기 선공 순서대로 진행합니다. 아이템 1코인, 물약 5코인, 캐릭터 3코인, 랜덤 지도자 7코인, 원하는 지도자 12코인입니다. 아이템은 한 구매 단계에 최대 3회 구매합니다.</li><li>구매가 끝나면 다음 플레이어의 구매 차례입니다. 모두 구매하면 다음 캐릭터 구성으로 돌아갑니다.</li><li>승점 5점에 먼저 도달하면 즉시 게임이 종료됩니다.</li><li>피폭은 영구적이며 일반 디버프 제거로 지워지지 않습니다. 독의 추가 피해 +1은 중첩되지 않습니다. 부활은 기본 HP로 돌아옵니다.</li></ol>'}
window.addEventListener("load",init);
})();