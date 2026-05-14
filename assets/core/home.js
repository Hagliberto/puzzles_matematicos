
let selectedGameId = null;

function isMobileHome(){
  return window.matchMedia('(max-width: 720px)').matches;
}

const SOLUTION_MODE_PIN = "2026";
function isSolutionMode(){
  return localStorage.getItem("jogosMagicosSolutionMode")==="1";
}
function setSolutionMode(value){
  if(value) localStorage.setItem("jogosMagicosSolutionMode","1");
  else localStorage.removeItem("jogosMagicosSolutionMode");
  document.body.classList.toggle("solution-mode-active", !!value);
}
function getDisplayDB(){
  const db=normalizeDB();
  if(!isSolutionMode()) return db;
  const all=(window.MAGIC_CHALLENGES||[]).map(g=>g.id);
  return {
    ...db,
    mode:"free",
    allUnlocked:true,
    unlocked:all,
    completed:Object.fromEntries(all.map(id=>[id,true])),
    best:{
      ...db.best,
      ...Object.fromEntries((window.MAGIC_CHALLENGES||[]).map(g=>[
        g.id,
        db.best?.[g.id] || {
          firstTime:"--:--",
          bestTime:"--:--",
          firstSeconds:0,
          bestSeconds:0,
          solution:g.solution,
          solutionMode:true
        }
      ]))
    }
  };
}
function openPinModal(){
  const modal=document.getElementById("pinModal");
  if(!modal){
    const pin=prompt("Digite o PIN do modo soluções:");
    if(pin===SOLUTION_MODE_PIN){ setSolutionMode(true); renderRadialHome(); }
    return;
  }
  const input=document.getElementById("solutionPinInput");
  const feedback=document.getElementById("pinFeedback");
  modal.classList.add("active");
  input.value="";
  feedback.textContent="Esse modo não altera tempos, placar nem progresso do jogador.";
  setTimeout(()=>input.focus(),120);
}
function closePinModal(){
  document.getElementById("pinModal")?.classList.remove("active");
}
function confirmPin(){
  const input=document.getElementById("solutionPinInput");
  const feedback=document.getElementById("pinFeedback");
  if(input.value.trim()===SOLUTION_MODE_PIN){
    setSolutionMode(true);
    closePinModal();
    renderRadialHome();
    showToast("Modo soluções liberado","Todos os desafios serão exibidos como resolvidos para demonstração.");
  }else{
    feedback.textContent="PIN incorreto. Tente novamente.";
    input.select();
  }
}
function toggleSolutionMode(){
  if(isSolutionMode()){
    openConfirmModal({
      icon:"🗝️",
      title:"Sair do modo soluções?",
      message:"Os desafios voltarão a seguir o progresso real salvo neste navegador.",
      details:"Nada do seu placar será apagado. O modo soluções apenas exibe uma versão demonstrativa.",
      primaryText:"Sair do modo",
      secondaryText:"Continuar vendo",
      onPrimary:()=>{ setSolutionMode(false); renderRadialHome(); showToast("Modo normal ativado","A tela voltou ao progresso real do jogador."); }
    });
  }else{
    openPinModal();
  }
}

function getTypeColor(type){
  if(type === 'triangle') return '#4dd6ff';
  if(type === 'hollow') return '#ff66b8';
  return '#39e0b3';
}

function getGameDescription(game){
  if(game.type === 'triangle') return `Use os números de 1 a 6 para fazer cada lado somar ${game.target}.`;
  if(game.type === 'hollow') return `Distribua os números de 1 a 8 no contorno para que topo, direita, base e esquerda somem ${game.target}.`;
  const magicSums = {3:15,4:34,5:65,6:111};
  return `Preencha o quadrado ${game.n}x${game.n} para que linhas, colunas e diagonais somem ${magicSums[game.n]}.`;
}

function getModeText(db){
  return db.mode === 'free' || db.allUnlocked ? 'Modo livre' : 'Modo sequência';
}

function isUnlocked(game, db){
  return db.allUnlocked || db.mode === 'free' || (db.unlocked||[]).includes(game.id);
}

function getPausedGameId(db){
  return Object.keys(db.paused||{}).find(id=>{
    const p=db.paused[id];
    return p && Array.isArray(p.slots) && p.slots.some(v=>v!==null) && !db.completed?.[id];
  }) || '';
}

function getStartUrl(){
  const db=normalizeDB();
  const list=window.MAGIC_CHALLENGES||[];
  if(db.mode==='free' || db.allUnlocked) return `./desafios/${selectedGameId || list[0]?.id || 'triangulo-soma-09'}/`;
  const firstIncomplete=list.find(g=>!db.completed?.[g.id] && isUnlocked(g, db));
  return firstIncomplete ? `./desafios/${firstIncomplete.id}/` : `./desafios/${selectedGameId || list[0]?.id || 'triangulo-soma-09'}/`;
}

function updateStartButton(){ return; }

function updateContinueButton(db){
  const btn=document.getElementById('continueButton');
  if(!btn) return;
  const pausedId=getPausedGameId(db);
  btn.style.display = pausedId ? 'grid' : 'none';
  btn.disabled = !pausedId;
  btn.onclick = ()=>{ if(pausedId) window.location.href = `./desafios/${pausedId}/`; };
}

function miniSolutionHTML(game,best){
  if(!best||!best.solution) return "<div class='solution-title'>Sem prévia ainda</div>";
  const sol=best.solution;
  if(game.type==='triangle')return `<div><div class="solution-title">Solução</div><div class="mini-triangle">${sol.map((v,i)=>`<div class="mini-cell p${i}">${v}</div>`).join('')}</div></div>`;
  if(game.type==='hollow'){
    const rows=[[sol[0],sol[1],sol[2]],[sol[3],'',sol[4]],[sol[5],sol[6],sol[7]]];
    return `<div><div class="solution-title">Solução</div><div class="mini-hollow">${rows.flat().map(v=>`<div class="mini-cell ${v===''?'empty':''}">${v}</div>`).join('')}</div></div>`;
  }
  if(game.type==='magic'){
    const n=game.n;
    return `<div><div class="solution-title">Solução</div><div class="mini-magic" style="--mini-n:${n}">${sol.map(v=>`<div class="mini-cell">${v}</div>`).join('')}</div></div>`;
  }
  return '';
}

function makeNode(game, index, total, db){
  const unlocked = isUnlocked(game, db);
  const done = !!db.completed?.[game.id];
  const isActive = selectedGameId === game.id;
  const color = getTypeColor(game.type);
  const angle = (360 / total) * index;
  const radius = total > 10 ? 252 : 232;
  const meta = isSolutionMode() ? 'Resolvido' : done ? 'Concluído' : unlocked ? 'Liberado' : 'Bloqueado';
  return `
    <button class="orbit-node ${isActive?'active':''} ${done?'done':''} ${unlocked?'':'locked'}"
            style="--angle:${angle}deg; --radius:${radius}px; --node-color:${color}"
            data-game-id="${game.id}">
      <div class="orbit-node-icon">${game.icon}</div>
      <div class="orbit-node-copy">
        <div class="orbit-node-label">${game.short}</div>
        <div class="orbit-node-meta">${meta}</div>
      </div>
    </button>`;
}

function openPreview(game, best){
  document.getElementById('previewTitle').textContent = `Solução • ${game.short}`;
  document.getElementById('previewBody').innerHTML = miniSolutionHTML(game, best);
  document.getElementById('previewModal').dataset.modalKind = 'preview';
  document.getElementById('previewModal').classList.add('active');
}

function getToggleLabel(db){
  if(isSolutionMode()) return '🗝️ Soluções';
  return (db.mode === 'free' || db.allUnlocked) ? '🧭 Livre' : '🔒 Bloqueado';
}

function toggleModeAndRender(){
  if(isSolutionMode()){
    toggleSolutionMode();
    return;
  }
  const newDb = normalizeDB();
  newDb.mode = (newDb.mode === 'free' || newDb.allUnlocked) ? 'sequence' : 'free';
  writeDB(newDb);
  renderRadialHome();
  showToast(newDb.mode === 'free' ? 'Modo livre ativado' : 'Modo sequência ativado', newDb.mode === 'free' ? 'Todos os desafios ficam acessíveis para treino.' : 'A trilha progressiva volta a liberar um desafio por vez.');
}

function renderHub(game, db){
  const hub = document.getElementById('hubCard');
  if(!hub || !game) return;
  const unlocked = isUnlocked(game, db);
  const done = !!db.completed?.[game.id];
  const demo = isSolutionMode();
  const paused = !!db.paused?.[game.id] && Array.isArray(db.paused[game.id].slots) && db.paused[game.id].slots.some(v=>v!==null);
  const best = db.best?.[game.id] || (isSolutionMode()?{solution:game.solution,firstTime:'--:--',bestTime:'--:--'}:undefined);
  const color = getTypeColor(game.type);
  const primaryText = demo ? '👁 Ver resolvido' : paused ? '▶ Continuar' : unlocked ? '▶ Abrir desafio' : '🔓 Liberar desafio';

  hub.style.setProperty('--hub-color', color);
  hub.innerHTML = `
    <div class="hub-icon">${game.icon}</div>
    <div class="hub-title">${game.short}</div>
    <button class="hub-status hub-toggle" id="hubToggleMode">${getToggleLabel(db)}</button>
    <div class="hub-description">${getGameDescription(game)}</div>
    <div class="hub-times">
      <div>1º tempo: <b>${best?.firstTime || '—'}</b></div>
      <div>Melhor tempo: <b>${best?.bestTime || '—'}</b></div>
    </div>
    <div class="hub-actions">
      <button class="primary-button ${unlocked?'':'is-soft-disabled'}" id="hubPrimaryAction">${primaryText}</button>
      ${(done||demo) ? '<button class="button preview-icon-button" id="hubPreviewAction" title="Ver solução" aria-label="Ver solução">👁</button>' : ''}
    </div>`;

  document.getElementById('hubToggleMode').onclick = toggleModeAndRender;
  document.getElementById('hubPrimaryAction').onclick = ()=>{
    if(unlocked){ window.location.href = `./desafios/${game.id}/`; }
    else { toggleModeAndRender(); }
  };
  if((done||demo) && document.getElementById('hubPreviewAction')){
    document.getElementById('hubPreviewAction').onclick = ()=>openPreview(game, best);
  }
}

function openChallengeInfoModal(game, db){
  if(isSolutionMode()) db=getDisplayDB();
  const unlocked = isUnlocked(game, db);
  const done = !!db.completed?.[game.id];
  const demo = isSolutionMode();
  const paused = !!db.paused?.[game.id] && Array.isArray(db.paused[game.id].slots) && db.paused[game.id].slots.some(v=>v!==null);
  const best = db.best?.[game.id] || (isSolutionMode()?{solution:game.solution,firstTime:'--:--',bestTime:'--:--'}:undefined);
  document.getElementById('challengeInfoIcon').textContent = game.icon;
  document.getElementById('challengeInfoTitle').textContent = game.short;
  document.getElementById('challengeInfoSubtitle').textContent = game.math || game.title;
  document.getElementById('challengeInfoBody').innerHTML = `
    <div class="challenge-info-pill-row">
      <button class="hub-status hub-toggle" id="modalToggleMode">${getToggleLabel(db)}</button>
      <span class="challenge-mini-status ${unlocked?'unlocked':'locked'}">${demo ? 'Resolvido por PIN' : done ? 'Concluído' : paused ? 'Pausado' : unlocked ? 'Liberado' : 'Bloqueado'}</span>
    </div>
    <p class="challenge-info-description">${getGameDescription(game)}</p>
    <div class="challenge-info-times">
      <div>1º tempo: <b>${best?.firstTime || '—'}</b></div>
      <div>Melhor tempo: <b>${best?.bestTime || '—'}</b></div>
    </div>`;
  const actions = document.getElementById('challengeInfoActions');
  actions.innerHTML = `
      <button class="primary-button ${unlocked?'':'is-soft-disabled'}" id="challengeOpenBtn">${paused ? '▶ Continuar' : unlocked ? '▶ Abrir desafio' : '🔓 Liberar desafio'}</button>
      ${(done||demo) ? '<button class="button preview-icon-button" id="challengePreviewBtn" title="Ver solução" aria-label="Ver solução">👁</button>' : '<button class="button" id="challengeCloseBtn">Fechar</button>'}`;
  document.getElementById('challengeInfoModal').classList.add('active');
  document.getElementById('modalToggleMode').onclick = ()=>{ toggleModeAndRender(); openChallengeInfoModal(game, normalizeDB()); };
  document.getElementById('challengeOpenBtn').onclick = ()=>{
    if(unlocked){ window.location.href = `./desafios/${game.id}/`; }
    else { toggleModeAndRender(); openChallengeInfoModal(game, normalizeDB()); }
  };
  if((done||demo) && document.getElementById('challengePreviewBtn')) document.getElementById('challengePreviewBtn').onclick = ()=>openPreview(game, best);
  if(!(done||demo) && document.getElementById('challengeCloseBtn')) document.getElementById('challengeCloseBtn').onclick = ()=>document.getElementById('challengeInfoModal').classList.remove('active');
}

function renderScoreModal(db, games){
  const doneCount = games.filter(g=>db.completed?.[g.id]).length;
  const pausedCount = Object.values(db.paused||{}).filter(p=>p && Array.isArray(p.slots) && p.slots.some(v=>v!==null)).length;
  const unlockedCount = games.filter(g=>isUnlocked(g, db)).length;
  const sum = document.getElementById('scoreSummaryRow');
  if(sum){
    sum.innerHTML = `
      <div class="score-summary-pill">🏅 ${doneCount}/${games.length}</div>
      <div class="score-summary-pill">🔓 ${unlockedCount}</div>
      <div class="score-summary-pill">⏸ ${pausedCount}</div>
      <div class="score-summary-pill">${getModeText(db)}</div>`;
  }
  const list = document.getElementById('scoreList');
  if(list){
    list.innerHTML = games.map(g=>{
      const best=db.best?.[g.id];
      const done=!!db.completed?.[g.id];
      const paused=!!db.paused?.[g.id] && Array.isArray(db.paused[g.id].slots) && db.paused[g.id].slots.some(v=>v!==null);
      const status = done ? 'Concluído' : paused ? 'Pausado' : isUnlocked(g, db) ? 'Liberado' : 'Bloqueado';
      return `<div class="score-item"><div class="score-item-head"><strong>${g.icon} ${g.short}</strong><span>${status}</span></div><div class="score-item-meta">1º tempo: <b>${best?.firstTime||'—'}</b> • Melhor: <b>${best?.bestTime||'—'}</b></div></div>`;
    }).join('');
  }
}

function updateAppbarSummary(db, games){
  const doneCount = games.filter(g=>db.completed?.[g.id]).length;
  const pausedCount = Object.values(db.paused||{}).filter(p=>p && Array.isArray(p.slots) && p.slots.some(v=>v!==null)).length;
  const completedPill = document.getElementById('appCompletedPill');
  const pausedPill = document.getElementById('appPausedPill');
  if(completedPill) completedPill.textContent = `🏅 ${doneCount}/${games.length}`;
  if(pausedPill) pausedPill.textContent = `⏸ ${pausedCount}`;
}

function renderRadialHome(){
  const db = getDisplayDB();
  const games = (window.MAGIC_CHALLENGES || []).slice();
  if(!games.length) return;

  if(!selectedGameId || !games.some(g=>g.id===selectedGameId)){
    const pausedId = getPausedGameId(db);
    const firstUnlocked = games.find(g=>isUnlocked(g, db));
    selectedGameId = pausedId || firstUnlocked?.id || games[0].id;
  }

  const ring = document.getElementById('orbitalRing');
  ring.innerHTML = games.map((game, index)=>makeNode(game, index, games.length, db)).join('');
  const current = games.find(g=>g.id===selectedGameId) || games[0];

  ring.querySelectorAll('[data-game-id]').forEach(btn=>btn.addEventListener('click', ()=>{
    selectedGameId = btn.dataset.gameId;
    const g = games.find(item=>item.id===selectedGameId);
    if(isMobileHome()) openChallengeInfoModal(g, normalizeDB());
    else renderRadialHome();
  }));

  if(!isMobileHome()) renderHub(current, db);
  updateAppbarSummary(db, games);
  document.getElementById('solutionModeButton')?.classList.toggle('active-solution', isSolutionMode());
  updateContinueButton(db);
  renderScoreModal(db, games);
  updateStartButton();
}

function takeSnapshot(){
  const db=normalizeDB();
  const completed=window.MAGIC_CHALLENGES.map(g=>({g,b:db.best?.[g.id],done:db.completed?.[g.id]}));
  const W=1400,H=1050; const canvas=document.createElement('canvas'); canvas.width=W;canvas.height=H; const ctx=canvas.getContext('2d');
  let grad=ctx.createLinearGradient(0,0,W,H); grad.addColorStop(0,'#07101f'); grad.addColorStop(.5,'#0d2c53'); grad.addColorStop(1,'#3b1266');
  ctx.fillStyle=grad; ctx.fillRect(0,0,W,H); ctx.fillStyle='rgba(255,255,255,.10)'; ctx.font='900 130px Arial'; ctx.fillText('∑ □ △ ✨', 810, 150);
  ctx.fillStyle='#f8fbff'; ctx.font='900 68px Arial'; ctx.fillText('Jogos Mágicos', 70, 110); ctx.font='400 28px Arial'; ctx.fillStyle='rgba(248,251,255,.78)'; ctx.fillText('Snapshot da evolução salva neste navegador', 70, 150);
  let x=70,y=220;
  completed.forEach((item,i)=>{ if(i&&i%3===0){x=70;y+=170} ctx.beginPath(); const r=26,w=390,h=132; ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath(); ctx.fillStyle=item.done?'rgba(52,211,153,.18)':'rgba(255,255,255,.10)'; ctx.fill(); ctx.strokeStyle=item.done?'rgba(52,211,153,.70)':'rgba(255,255,255,.20)'; ctx.stroke(); ctx.fillStyle='#f8fbff'; ctx.font='800 26px Arial'; ctx.fillText(`${item.g.icon} ${item.g.short}`,x+24,y+44); ctx.fillStyle='rgba(248,251,255,.76)'; ctx.font='400 20px Arial'; ctx.fillText(`1º tempo: ${item.b?.firstTime||'—'}`,x+24,y+78); ctx.fillText(`Melhor: ${item.b?.bestTime||'—'}`,x+24,y+106); x+=430; });
  ctx.fillStyle='rgba(248,251,255,.62)'; ctx.font='700 18px Arial'; ctx.fillText('Desenvolvido por Hagliberto Alves de Oliveira',70,H-45);
  const a=document.createElement('a'); a.download=`jogos-magicos-snapshot-${new Date().toISOString().slice(0,10)}.png`; a.href=canvas.toDataURL('image/png'); a.click();
}

function resetProgress(){
  openConfirmModal({
    icon:'🧹', title:'Limpar progresso local?', message:'Todos os tempos, desbloqueios e partidas pausadas serão removidos deste navegador.',
    details:'Os arquivos do projeto não serão afetados. Apenas o armazenamento local do navegador será reiniciado para começar a jornada do zero.',
    primaryText:'Limpar progresso', secondaryText:'Cancelar',
    onPrimary:()=>{ localStorage.removeItem('jogosMagicosDB'); selectedGameId = null; normalizeDB(); renderRadialHome(); showToast('Progresso limpo', 'A jornada foi reiniciada neste navegador.'); }
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  normalizeDB();
  document.body.classList.toggle('solution-mode-active', isSolutionMode());
  setupLattesLink();
  renderRadialHome();
  document.getElementById('themeToggle')?.addEventListener('click', ()=>{ toggleTheme(); renderRadialHome(); });
  document.getElementById('printHome')?.addEventListener('click', takeSnapshot);
  document.getElementById('resetProgress')?.addEventListener('click', resetProgress);
  document.getElementById('scoreButton')?.addEventListener('click', ()=>document.getElementById('scoreModal').classList.add('active'));
  document.getElementById('solutionModeButton')?.addEventListener('click', toggleSolutionMode);
  document.getElementById('pinConfirm')?.addEventListener('click', confirmPin);
  document.getElementById('pinCancel')?.addEventListener('click', closePinModal);
  document.getElementById('solutionPinInput')?.addEventListener('keydown', e=>{ if(e.key==='Enter') confirmPin(); if(e.key==='Escape') closePinModal(); });
  document.getElementById('pinModal')?.addEventListener('click', e=>{ if(e.target.id==='pinModal') closePinModal(); });
  document.getElementById('scoreClose')?.addEventListener('click', ()=>document.getElementById('scoreModal').classList.remove('active'));
  document.getElementById('scoreModal')?.addEventListener('click', e=>{ if(e.target.id === 'scoreModal') e.currentTarget.classList.remove('active'); });
  document.getElementById('previewClose')?.addEventListener('click', ()=>document.getElementById('previewModal').classList.remove('active'));
  document.getElementById('previewModal')?.addEventListener('click', e=>{ if(e.target.id === 'previewModal') e.currentTarget.classList.remove('active'); });
  document.getElementById('challengeInfoModal')?.addEventListener('click', e=>{ if(e.target.id === 'challengeInfoModal') e.currentTarget.classList.remove('active'); });
  window.addEventListener('resize', ()=>renderRadialHome());
});
