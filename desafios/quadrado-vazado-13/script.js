
const TARGET=13;
const lines=[
 {id:"top",label:"Topo",indexes:[0,1,2],target:TARGET},
 {id:"right",label:"Direita",indexes:[2,4,7],target:TARGET},
 {id:"bottom",label:"Base",indexes:[5,6,7],target:TARGET},
 {id:"left",label:"Esquerda",indexes:[0,3,5],target:TARGET}
];
document.getElementById("sumList").innerHTML=lines.map(line=>`<div class="sum-pill" data-line-pill="${line.id}"><span>${line.label}</span><strong><span data-sum>0</span>/${line.target}</strong></div>`).join("");
createDragDropGame({gameId:"quadrado-vazado-13",slotCount:8,numbers:[1, 2, 3, 4, 5, 6, 7, 8],lines,nextUrl:"../quadrado-vazado-14/",nextLabel:"Ir para o próximo",hints:["Os quatro cantos contam em duas somas. Eles mandam no jogo.","As casas do meio de cada lado servem para ajuste fino.","Se uma lateral passou da soma, reduza um canto dessa lateral.","Tente equilibrar topo e base antes de fechar as laterais."]});
