
function initFoxAssistant(hints){
  const text=document.getElementById("foxText");
  const bubble=document.querySelector(".fox-message");
  const fox=document.getElementById("foxCharacter");
  const helper=document.querySelector(".fox-helper");
  if(!text||!hints||!hints.length)return;

  let index=0;
  let hideTimer=null;

  function speak(){
    text.textContent=hints[index%hints.length];
    index++;

    if(bubble){
      bubble.classList.remove("play");
      void bubble.offsetWidth;
      bubble.classList.add("play");
    }

    if(helper){
      const isMobile=window.innerWidth<=1040;
      if(isMobile){
        helper.classList.toggle("show-message");
        clearTimeout(hideTimer);
        if(helper.classList.contains("show-message")){
          hideTimer=setTimeout(()=>helper.classList.remove("show-message"),3000);
        }
      }
    }
  }

  text.textContent=hints[0];

  if(fox) fox.addEventListener("click",speak);

  window.addEventListener("resize",()=>{
    if(window.innerWidth>1040 && helper){
      helper.classList.remove("show-message");
    }
  });
}
