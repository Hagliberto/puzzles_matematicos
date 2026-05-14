
function miniSolutionHTML(game,best){
  if(!best||!best.solution)return "<div class='solution-title'>Sem prévia ainda</div>";
  const sol=best.solution;
  if(game.type==="triangle")return `<div><div class="solution-title">Solução</div><div class="mini-triangle">${sol.map((v,i)=>`<div class="mini-cell p${i}">${v}</div>`).join("")}</div></div>`;
  if(game.type==="hollow"){const rows=[[sol[0],sol[1],sol[2]],[sol[3],"",sol[4]],[sol[5],sol[6],sol[7]]];return `<div><div class="solution-title">Solução</div><div class="mini-hollow">${rows.flat().map(v=>`<div class="mini-cell ${v===""?"empty":""}">${v}</div>`).join("")}</div></div>`}
  if(game.type==="magic"){const n=game.n;return `<div><div class="solution-title">Solução</div><div class="mini-magic" style="--mini-n:${n}">${sol.map(v=>`<div class="mini-cell">${v}</div>`).join("")}</div></div>`}
  return "";
}
function renderHome(){const db=normalizeDB();const grid=document.getElementById("challengeGrid");const mode=db.mode||"sequence";document.querySelectorAll(".mode-pill").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));grid.innerHTML=window.MAGIC_CHALLENGES.map(game=>{const done=!!db.completed?.[game.id];const unlocked=db.allUnlocked||mode==="free"||db.unlocked?.includes(game.id);const best=db.best?.[game.id];const first=best?.firstTime||"—";const bestTime=best?.bestTime||"—";const pill=done?"Concluído":unlocked?"Liberado":"Bloqueado";const href=unlocked?`./desafios/${game.id}/`:"#";return `<a class="challenge-card ${done?"completed":""} ${unlocked?"":"locked"}" data-watermark="${game.icon}" href="${href}" data-locked="${unlocked?"0":"1"}" data-game="${game.id}"><div class="card-pill" data-preview="${done?"1":"0"}">${pill}</div><div class="challenge-icon">${game.icon}</div><strong>${game.short}</strong><span>${game.type==="magic"?`Ordem ${game.n}. Linhas, colunas e diagonais.`:game.type==="hollow"?`Contorno com 8 casas. Soma ${game.target}.`:`Seis casas. Soma ${game.target}.`}</span><div class="time-lines"><div>1º tempo: <b>${first}</b></div><div>Melhor tempo: <b>${bestTime}</b></div></div></a>`}).join("");
  grid.querySelectorAll("[data-locked='1']").forEach(card=>card.addEventListener("click",e=>{e.preventDefault();openConfirmModal({icon:"🔒",title:"Desafio bloqueado",message:"Este desafio ainda não foi liberado no modo sequência.",details:"Conclua o desafio anterior para desbloquear o próximo, ou altere para o modo escolher desafios.",primaryText:"Entendi",secondaryText:"Escolher desafios",onSecondary:()=>{const db=normalizeDB();db.mode="free";writeDB(db);renderHome();updateStartButton()}})}));
  grid.querySelectorAll("[data-preview='1']").forEach(pill=>pill.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const card=pill.closest(".challenge-card");const game=window.MAGIC_CHALLENGES.find(g=>g.id===card.dataset.game);const best=normalizeDB().best?.[game.id];document.getElementById("previewTitle").textContent=`Prévia: ${game.short}`;document.getElementById("previewBody").innerHTML=miniSolutionHTML(game,best);document.getElementById("previewModal").dataset.modalKind="preview";document.getElementById("previewModal").classList.add("active")}))}
function drawRoundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function takeSnapshot(){const db=normalizeDB();const completed=window.MAGIC_CHALLENGES.map(g=>({g,b:db.best?.[g.id],done:db.completed?.[g.id]}));const W=1400,H=1050;const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;const ctx=canvas.getContext("2d");let grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,"#07101f");grad.addColorStop(.5,"#1e3a8a");grad.addColorStop(1,"#581c87");ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.fillStyle="rgba(255,255,255,.08)";ctx.font="900 170px Arial";ctx.fillText("Σ √ ∞ 3×3",620,170);ctx.fillStyle="#f8fbff";ctx.font="900 72px Arial";ctx.fillText("Jogos Mágicos",70,110);ctx.font="400 30px Arial";ctx.fillStyle="rgba(248,251,255,.78)";ctx.fillText("Snapshot dos tempos salvos no navegador",70,155);let x=70,y=220;completed.forEach((item,i)=>{if(i&&i%3===0){x=70;y+=170}drawRoundedRect(ctx,x,y,390,132,26);ctx.fillStyle=item.done?"rgba(52,211,153,.18)":"rgba(255,255,255,.10)";ctx.fill();ctx.strokeStyle=item.done?"rgba(52,211,153,.70)":"rgba(255,255,255,.20)";ctx.stroke();ctx.fillStyle="#f8fbff";ctx.font="800 26px Arial";ctx.fillText(`${item.g.icon} ${item.g.short}`,x+24,y+44);ctx.fillStyle="rgba(248,251,255,.76)";ctx.font="400 20px Arial";ctx.fillText(`1º tempo: ${item.b?.firstTime||"—"}`,x+24,y+78);ctx.fillText(`Melhor: ${item.b?.bestTime||"—"}`,x+24,y+106);x+=430});ctx.fillStyle="rgba(248,251,255,.62)";ctx.font="700 18px Arial";ctx.fillText("Desenvolvido por Hagliberto Alves de Oliveira",70,H-45);const a=document.createElement("a");a.download=`jogos-magicos-snapshot-${new Date().toISOString().slice(0,10)}.png`;a.href=canvas.toDataURL("image/png");a.click()}

function getStartUrl(){
  const db=normalizeDB();
  const list=window.MAGIC_CHALLENGES||[];
  const pausedIds=Object.keys(db.paused||{});
  const validPaused=pausedIds.find(id=>{
    const p=db.paused[id];
    return p && Array.isArray(p.slots) && p.slots.some(v=>v!==null) && !db.completed?.[id];
  });
  if(validPaused) return `./desafios/${validPaused}/`;

  if(db.mode==="free") return "./desafios/triangulo-soma-09/";

  const firstIncomplete=list.find(g=>!db.completed?.[g.id] && (db.allUnlocked || db.unlocked?.includes(g.id)));
  return firstIncomplete ? `./desafios/${firstIncomplete.id}/` : "./desafios/triangulo-soma-09/";
}

function updateStartButton(){
  const btn=document.getElementById("startButton");
  if(!btn)return;
  const db=normalizeDB();
  const pausedIds=Object.keys(db.paused||{});
  const hasPaused=pausedIds.some(id=>{
    const p=db.paused[id];
    return p && Array.isArray(p.slots) && p.slots.some(v=>v!==null) && !db.completed?.[id];
  });
  btn.href=getStartUrl();
  btn.innerHTML=hasPaused ? "▶ Continuar" : "▶ Começar";
}

document.addEventListener("DOMContentLoaded",()=>{normalizeDB();setupLattesLink();renderHome();updateStartButton();document.querySelectorAll(".mode-pill").forEach(btn=>btn.addEventListener("click",()=>{const db=normalizeDB();db.mode=btn.dataset.mode;writeDB(db);renderHome();updateStartButton()}));document.getElementById("themeToggle")?.addEventListener("click",toggleTheme);document.getElementById("printHome")?.addEventListener("click",takeSnapshot);document.getElementById("previewClose")?.addEventListener("click",()=>document.getElementById("previewModal").classList.remove("active"));document.getElementById("previewModal")?.addEventListener("click",e=>{if(e.target.id==="previewModal")e.currentTarget.classList.remove("active")});document.getElementById("resetProgress")?.addEventListener("click",()=>openConfirmModal({icon:"🧹",title:"Limpar progresso?",message:"Isso apagará desafios concluídos, desbloqueios, partidas pausadas e tempos salvos neste navegador.",details:"Essa ação não pode ser desfeita, mas afeta apenas este navegador.",primaryText:"Limpar progresso",secondaryText:"Cancelar",onPrimary:()=>{localStorage.removeItem("jogosMagicosDB");normalizeDB();renderHome();updateStartButton();showToast("Progresso reiniciado","O banco local do navegador foi limpo.")}}))});
