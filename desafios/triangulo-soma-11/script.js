
const TARGET=11;
const lines=[
 {id:"left",label:"Lado esquerdo",indexes:[0,1,3],target:TARGET},
 {id:"right",label:"Lado direito",indexes:[0,2,5],target:TARGET},
 {id:"bottom",label:"Base",indexes:[3,4,5],target:TARGET}
];
document.getElementById("sumList").innerHTML=lines.map(line=>`<div class="sum-pill" data-line-pill="${line.id}"><span>${line.label}</span><strong><span data-sum>0</span>/${line.target}</strong></div>`).join("");
createDragDropGame({gameId:"triangulo-soma-11",slotCount:6,numbers:[1, 2, 3, 4, 5, 6],lines,nextUrl:"../triangulo-soma-12/",nextLabel:"Ir para o próximo",hints:["Os cantos participam de duas somas. Eu começaria por eles!","Quando um lado fechar, tente não mexer nele.","As casas do meio ajustam uma soma por vez.","Se travar, troque dois cantos e veja como as somas mudam."]});
