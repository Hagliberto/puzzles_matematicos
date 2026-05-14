
function formatTime(seconds){const m=String(Math.floor(seconds/60)).padStart(2,"0");const s=String(seconds%60).padStart(2,"0");return `${m}:${s}`}
function readDB(){try{return JSON.parse(localStorage.getItem("jogosMagicosDB")||"{}")}catch{return {}}}
function writeDB(db){localStorage.setItem("jogosMagicosDB",JSON.stringify(db))}
function applyTheme(){const db=readDB();document.body.classList.toggle("light-theme",db.theme==="light")}
function toggleTheme(){const db=readDB();db.theme=db.theme==="light"?"dark":"light";writeDB(db);applyTheme()}
function normalizeDB(){const db=readDB();db.mode=db.mode||"sequence";db.unlocked=db.unlocked||[window.MAGIC_CHALLENGES?.[0]?.id].filter(Boolean);db.completed=db.completed||{};db.best=db.best||{};db.paused=db.paused||{};db.theme=db.theme||"dark";db.allUnlocked=!!db.allUnlocked;writeDB(db);applyTheme();return db}
function isUnlocked(gameId){const db=normalizeDB();return db.allUnlocked||db.mode==="free"||db.unlocked.includes(gameId)}
function unlockNext(gameId){const db=normalizeDB();const list=window.MAGIC_CHALLENGES||[];const idx=list.findIndex(x=>x.id===gameId);db.completed[gameId]=true;delete db.paused[gameId];if(idx>=0&&idx<list.length-1&&!db.unlocked.includes(list[idx+1].id))db.unlocked.push(list[idx+1].id);if(idx===list.length-1){db.allUnlocked=true;db.unlocked=list.map(x=>x.id)}writeDB(db);return db}
function saveBest(gameId,elapsed,solution){const db=normalizeDB();const current=db.best[gameId]||{};const firstSeconds=current.firstSeconds||elapsed;const firstTime=current.firstTime||formatTime(elapsed);const previousBest=current.bestSeconds;let improved=false;let bestSeconds=previousBest||elapsed;let bestTime=current.bestTime||formatTime(elapsed);let bestSolution=current.solution||solution;if(!previousBest||elapsed<previousBest){improved=!!previousBest;bestSeconds=elapsed;bestTime=formatTime(elapsed);bestSolution=solution}db.best[gameId]={firstSeconds,firstTime,bestSeconds,bestTime,solution:bestSolution,lastSeconds:elapsed,lastTime:formatTime(elapsed),updatedAt:new Date().toISOString()};writeDB(db);return {improved,record:db.best[gameId]}}
let __lastToastKey="", __lastToastAt=0;
function showToast(title,message){
  const stack=document.getElementById("toastStack");
  if(!stack)return;
  const key=title+"|"+message;
  const now=Date.now();
  if(key===__lastToastKey && now-__lastToastAt<1600)return;
  __lastToastKey=key;
  __lastToastAt=now;
  stack.innerHTML="";
  const t=document.createElement("div");
  t.className="toast";
  t.innerHTML=`<div class="toast-icon"><span class="material-symbols-rounded icon-gradient">check_circle</span></div><div><strong>${title}</strong><p>${message}</p></div>`;
  stack.appendChild(t);
  setTimeout(()=>{t.style.opacity="0";setTimeout(()=>t.remove(),220)},2400);
}
function launchConfetti(){const colors=["#7dd3fc","#c084fc","#34d399","#fbbf24","#fb7185","#f8fbff"];for(let i=0;i<90;i++){const p=document.createElement("div");p.className="confetti";p.style.left=`${Math.random()*100}vw`;p.style.background=colors[Math.floor(Math.random()*colors.length)];p.style.animationDelay=`${Math.random()*.8}s`;p.style.animationDuration=`${1.35+Math.random()*1.8}s`;document.body.appendChild(p);setTimeout(()=>p.remove(),3600)}}
function openConfirmModal({icon="help",title="Confirmação",message="",details="",primaryText="Confirmar",secondaryText="Cancelar",onPrimary,onSecondary}){const overlay=document.getElementById("confirmModal");if(!overlay){if(confirm(message||title)){if(onPrimary)onPrimary()}else{if(onSecondary)onSecondary()}return}
  const kind = String(icon).includes("delete")||String(icon).includes("🧹") ? "danger" : String(icon).includes("pause") ? "pause" : String(icon).includes("🔗") ? "external" : "default";
  overlay.dataset.modalKind = kind;const confirmIconEl=document.getElementById("confirmIcon");
confirmIconEl.textContent=icon;
if(/^[a-z_]+$/.test(String(icon))){
  confirmIconEl.className="material-symbols-rounded icon-gradient";
}else{
  confirmIconEl.className="";
}document.getElementById("confirmTitle").textContent=title;document.getElementById("confirmMessage").textContent=message;document.getElementById("confirmDetails").textContent=details||"";document.getElementById("confirmPrimary").textContent=primaryText;document.getElementById("confirmSecondary").textContent=secondaryText;overlay.classList.add("active");const primary=document.getElementById("confirmPrimary");const secondary=document.getElementById("confirmSecondary");const close=()=>{overlay.classList.remove("active");primary.onclick=null;secondary.onclick=null};primary.onclick=()=>{close();if(onPrimary)onPrimary()};secondary.onclick=()=>{close();if(onSecondary)onSecondary()};overlay.onclick=e=>{if(e.target===overlay){close();if(onSecondary)onSecondary()}}}
function setupLattesLink(){
  document.querySelectorAll("[data-lattes]").forEach(btn=>btn.addEventListener("click",()=>openConfirmModal({
    icon:"🔗",
    title:"Abrir Currículo Lattes?",
    message:"Você está prestes a sair dos Jogos Mágicos e abrir o currículo Lattes de Hagliberto Alves de Oliveira em uma nova aba.",
    details:"Hagliberto desenvolveu esta experiência com foco em aprendizagem, lógica, matemática visual e interação simples para diferentes telas. O jogo atual não será apagado: se houver uma partida em andamento, o progresso continuará salvo neste navegador para você retomar depois.",
    primaryText:"Abrir Lattes",
    secondaryText:"Continuar no jogo",
    onPrimary:()=>window.open(btn.dataset.lattes,"_blank","noopener")
  })))
}
function renderScoreDrawer(currentGameId){const holder=document.getElementById("scoreList");if(!holder)return;const db=normalizeDB();holder.innerHTML=(window.MAGIC_CHALLENGES||[]).map(g=>{const b=db.best[g.id];const done=db.completed[g.id];const first=b?.firstTime||"—";const best=b?.bestTime||"—";return `<div class="score-card ${g.id===currentGameId?"current":""}"><span>${done?"✅":"○"} ${g.short}</span><strong>${best}</strong><small>1º tempo: ${first} • melhor: ${best}</small></div>`}).join("")}
function attachScoreDrawer(){
  const drawer=document.getElementById("scoreDrawer");
  const buttons=[document.getElementById("scoreToggle"),document.getElementById("scoreToggleTop")].filter(Boolean);
  if(!drawer||!buttons.length)return;
  buttons.forEach(btn=>btn.addEventListener("click",e=>{
    e.stopPropagation();
    drawer.classList.toggle("open");
  }));
  drawer.addEventListener("click",e=>e.stopPropagation());
  document.addEventListener("click",()=>drawer.classList.remove("open"));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")drawer.classList.remove("open")});
}
function moveBankToDockIfNeeded(){const bank=document.getElementById("numberBank");const dock=document.getElementById("mobileNumberDock");const desktop=document.getElementById("desktopBankSlot");if(!bank||!dock||!desktop)return;if(window.innerWidth<=1040){if(bank.parentElement!==dock)dock.appendChild(bank);bank.classList.add("mobile-dock")}else{if(bank.parentElement!==desktop)desktop.appendChild(bank);bank.classList.remove("mobile-dock")}}
function setupDockScroll(){
  const dock=document.getElementById("mobileNumberDock");
  if(!dock)return;
  let down=false,startX=0,startY=0,scrollLeft=0,scrollTop=0;
  dock.addEventListener("pointerdown",e=>{
    if(e.target.closest(".tile"))return;
    down=true;
    startX=e.clientX;
    startY=e.clientY;
    scrollLeft=dock.scrollLeft;
    scrollTop=dock.scrollTop;
    dock.setPointerCapture(e.pointerId);
  });
  dock.addEventListener("pointermove",e=>{
    if(!down)return;
    dock.scrollLeft=scrollLeft-(e.clientX-startX);
    dock.scrollTop=scrollTop-(e.clientY-startY);
  });
  dock.addEventListener("pointerup",()=>down=false);
  dock.addEventListener("pointercancel",()=>down=false);
  dock.addEventListener("wheel",e=>{
    dock.scrollLeft+=e.deltaX || e.deltaY;
    dock.scrollTop+=e.deltaY;
    e.preventDefault();
  },{passive:false});
}
function createDragDropGame(options){
  normalizeDB(); setupLattesLink(); setupDockScroll();
  const themeBtn=document.getElementById("themeToggle"); if(themeBtn)themeBtn.addEventListener("click",toggleTheme);
  if(!isUnlocked(options.gameId)){location.href="../../index.html";return}
  const state={slots:Array(options.slotCount).fill(null),started:false,elapsed:0,timerId:null,completed:new Set(),won:false,paused:false,draggedTile:null,sourceElement:null};
  let lastPausedMoveToast=0;
  const bank=document.getElementById("numberBank"),timer=document.getElementById("timer"),completedText=document.getElementById("completedLines"),progressRing=document.getElementById("progressRing"),progressText=document.getElementById("progressText"),modal=document.getElementById("finishModal"),finalTime=document.getElementById("finalTime"),nextButton=document.getElementById("nextButton"),closeButton=document.getElementById("closeModalButton"),playAgainButton=document.getElementById("playAgainButton"),homeLink=document.getElementById("homeLink");
  function startTimer(){if(state.paused)return;if(state.started)return;state.started=true;state.timerId=setInterval(()=>{state.elapsed++;timer.textContent=formatTime(state.elapsed);savePaused(false)},1000)}
  function stopTimer(){clearInterval(state.timerId);state.timerId=null}
  function setPaused(value){
    if(state.won)return;
    state.paused=value;
    document.body.classList.toggle("paused",value);
    if(value){
      stopTimer();
      state.started=false;
      savePaused(true);
      showToast("Jogo pausado","Clique novamente no tempo para continuar.");
    }else{
      showToast("Jogo retomado","Você já pode mover as peças novamente.");
      startTimer();
    }
  }
  function togglePause(){
    if(!hasProgress() && !state.started){
      showToast("Cronômetro parado","Movimente uma peça para iniciar o tempo.");
      return;
    }
    setPaused(!state.paused);
  }
  function hasProgress(){return state.slots.some(v=>v!==null)||state.elapsed>0}
  function savePaused(markPaused=true){if(state.won)return;const db=normalizeDB();if(hasProgress())db.paused[options.gameId]={slots:state.slots,elapsed:state.elapsed,savedAt:new Date().toISOString(),active:markPaused};writeDB(db)}
  function clearPaused(){const db=normalizeDB();delete db.paused[options.gameId];writeDB(db)}
  function returnTile(tile){const parent=tile.parentElement;if(parent&&parent.classList.contains("cell")){bank.appendChild(tile);sync();evaluate();savePaused(false)}}
  function makeTile(value){const tile=document.createElement("div");tile.className="tile";tile.textContent=value;tile.dataset.value=value;let lastTap=0;tile.addEventListener("dblclick",e=>{e.preventDefault();returnTile(tile)});tile.addEventListener("touchend",()=>{const now=Date.now();if(now-lastTap<320)returnTile(tile);lastTap=now},{passive:true});tile.addEventListener("pointerdown",e=>{if(state.won)return;if(state.paused){const now=Date.now();if(now-lastPausedMoveToast>1600){showToast("Jogo pausado","Clique no tempo para dar play antes de mover.");lastPausedMoveToast=now;}return;}startTimer();const r=tile.getBoundingClientRect();state.draggedTile=tile;state.sourceElement=tile.parentElement;tile.style.setProperty("--drag-size",`${Math.max(r.width,r.height)}px`);tile.classList.add("dragging");tile.style.left=`${e.clientX}px`;tile.style.top=`${e.clientY}px`;document.body.appendChild(tile);tile.setPointerCapture(e.pointerId)});tile.addEventListener("pointermove",e=>{if(state.draggedTile!==tile)return;tile.style.left=`${e.clientX}px`;tile.style.top=`${e.clientY}px`;markDropTarget(e.clientX,e.clientY)});tile.addEventListener("pointerup",e=>{if(state.draggedTile!==tile)return;const target=getDropTarget(e.clientX,e.clientY);clearDropMarks();tile.classList.remove("dragging");tile.style.left="";tile.style.top="";tile.style.removeProperty("--drag-size");if(target)dropTile(tile,target);else restoreTile(tile);state.draggedTile=null;state.sourceElement=null;evaluate();savePaused(false)});tile.addEventListener("pointercancel",()=>{if(state.draggedTile!==tile)return;clearDropMarks();tile.classList.remove("dragging");restoreTile(tile);state.draggedTile=null;state.sourceElement=null;evaluate();savePaused(false)});return tile}
  function getDropTarget(x,y){const hidden=state.draggedTile;if(hidden)hidden.style.display="none";const element=document.elementFromPoint(x,y);if(hidden)hidden.style.display="";if(!element)return null;const cell=element.closest(".cell");if(cell)return cell;const bankElement=element.closest("#numberBank");if(bankElement)return bankElement;return null}
  function markDropTarget(x,y){clearDropMarks();const target=getDropTarget(x,y);if(target&&target.classList.contains("cell"))target.classList.add("over")}
  function clearDropMarks(){document.querySelectorAll(".cell.over").forEach(c=>c.classList.remove("over"))}
  function restoreTile(tile){state.sourceElement.appendChild(tile);sync()}
  function dropTile(tile,target){const prev=state.sourceElement;if(target.id==="numberBank"){target.appendChild(tile);sync();return}const occupying=target.querySelector(".tile");if(occupying&&occupying!==tile){if(prev&&prev.classList.contains("cell"))prev.appendChild(occupying);else bank.appendChild(occupying)}target.appendChild(tile);sync()}
  function sync(){state.slots=Array(options.slotCount).fill(null);document.querySelectorAll(".cell").forEach(cell=>{const tile=cell.querySelector(".tile");if(tile)state.slots[Number(cell.dataset.index)]=Number(tile.dataset.value)})}
  function renderBank(){bank.innerHTML="";options.numbers.forEach(v=>bank.appendChild(makeTile(v)));moveBankToDockIfNeeded()}
  function fillFromSlots(slots){document.querySelectorAll(".cell").forEach(cell=>cell.innerHTML="");renderBank();slots.forEach((value,index)=>{if(value===null||value===undefined)return;const tile=[...bank.querySelectorAll(".tile")].find(t=>Number(t.dataset.value)===Number(value));const cell=document.querySelector(`.cell[data-index="${index}"]`);if(tile&&cell)cell.appendChild(tile)});sync();evaluate()}
  function evaluate(){sync();document.querySelectorAll(".cell").forEach(c=>c.classList.remove("ok"));const next=new Set();options.lines.forEach(line=>{const values=line.indexes.map(i=>state.slots[i]);const filled=values.every(v=>v!==null);const sum=values.reduce((a,v)=>a+(v??0),0);const ok=filled&&sum===line.target;const pill=document.querySelector(`[data-line-pill="${line.id}"]`);if(pill){pill.querySelector("[data-sum]").textContent=sum;pill.classList.toggle("ok",ok)}if(ok){next.add(line.id);line.indexes.forEach(i=>{const c=document.querySelector(`.cell[data-index="${i}"]`);if(c)c.classList.add("ok")});if(!state.completed.has(line.id))showToast("Combinação perfeita!",`${line.label} fechou exatamente ${line.target}.`)}});state.completed=next;updateProgress();if(!state.won&&state.completed.size===options.lines.length){state.won=true;stopTimer();setTimeout(finish,500)}}
  function updateProgress(){const total=state.completed.size;const pct=Math.round(total/options.lines.length*100);completedText.textContent=`${total}/${options.lines.length}`;progressRing.style.setProperty("--progress",pct);progressText.textContent=`${pct}%`}
  function finish(){const solution=state.slots.slice();const result=saveBest(options.gameId,state.elapsed,solution);unlockNext(options.gameId);clearPaused();renderScoreDrawer(options.gameId);finalTime.textContent=formatTime(state.elapsed);document.getElementById("recordText").textContent=result.improved?"Você melhorou seu tempo. Excelente!":"Seu progresso foi salvo no navegador.";document.getElementById("firstTimeText").textContent=result.record.firstTime;document.getElementById("bestTimeText").textContent=result.record.bestTime;modal.dataset.modalKind="success";modal.classList.add("active");launchConfetti();if(options.nextUrl){nextButton.style.display="inline-flex";nextButton.textContent=options.nextLabel||"Ir para o próximo";nextButton.onclick=()=>location.href=options.nextUrl}else{nextButton.style.display="inline-flex";nextButton.textContent="Voltar ao início";nextButton.onclick=()=>location.href="../../index.html"}showToast("Desafio concluído!",`Você terminou em ${formatTime(state.elapsed)}.`)}
  function resetGame(){stopTimer();state.slots=Array(options.slotCount).fill(null);state.started=false;state.elapsed=0;state.completed=new Set();state.won=false;state.paused=false;document.body.classList.remove("paused");timer.textContent="00:00";modal.classList.remove("active");clearPaused();document.querySelectorAll(".cell").forEach(cell=>{cell.innerHTML="";cell.classList.remove("ok","over")});renderBank();evaluate()}
  function askReset(){openConfirmModal({icon:"restart_alt",title:"Reiniciar desafio?",message:"Seu tabuleiro atual será limpo e o cronômetro voltará para zero.",details:"O melhor tempo já salvo no placar não será apagado.",primaryText:"Reiniciar",secondaryText:"Continuar jogando",onPrimary:resetGame})}
  function checkPausedOnLoad(){const db=normalizeDB();const paused=db.paused?.[options.gameId];if(!paused||!paused.slots||paused.slots.every(v=>v===null)||db.completed?.[options.gameId])return;openConfirmModal({icon:"pause_circle",title:"Continuar jogo pausado?",message:`Existe uma partida em andamento salva com ${formatTime(paused.elapsed||0)} no cronômetro.`,details:"Você pode continuar exatamente de onde parou ou reiniciar este desafio.",primaryText:"Continuar",secondaryText:"Reiniciar",onPrimary:()=>{state.elapsed=paused.elapsed||0;state.paused=false;document.body.classList.remove("paused");timer.textContent=formatTime(state.elapsed);fillFromSlots(paused.slots)},onSecondary:resetGame})}
  if(timer&&timer.closest(".top-stat")) timer.closest(".top-stat").addEventListener("click",togglePause);
  document.getElementById("resetTopButton").addEventListener("click",askReset);if(homeLink)homeLink.addEventListener("click",()=>{if(!state.won&&hasProgress()){stopTimer();state.started=false;savePaused(true)}});playAgainButton.addEventListener("click",resetGame);closeButton.addEventListener("click",()=>modal.classList.remove("active"));modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("active")});window.addEventListener("resize",moveBankToDockIfNeeded);renderBank();renderScoreDrawer(options.gameId);attachScoreDrawer();if(typeof initFoxAssistant==="function")initFoxAssistant(options.hints);evaluate();setTimeout(checkPausedOnLoad,250)
}
