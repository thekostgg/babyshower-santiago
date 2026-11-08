const config = window.INVITACION;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let opening = false;
// Una sola animación controla el recorrido completo, incluso en pantallas altas.
function slideTo(element, duration = 1250) {
  if (reducedMotion.matches) { element.scrollIntoView(); return; }
  const start = window.scrollY;
  const target = Math.min(element.getBoundingClientRect().top + start, document.documentElement.scrollHeight - innerHeight);
  const began = performance.now();
  let cancelled = false;
  const cancel = () => { cancelled = true; };
  ['wheel','touchstart','pointerdown','keydown'].forEach(type => window.addEventListener(type,cancel,{once:true,passive:true}));
  function frame(now) {
    const progress = Math.min(1,(now-began)/duration);
    const eased = progress < .5 ? 4*progress**3 : 1-(-2*progress+2)**3/2;
    if (!cancelled) window.scrollTo(0,start+(target-start)*eased);
    if(progress<1 && !cancelled)requestAnimationFrame(frame);
    else ['wheel','touchstart','pointerdown','keydown'].forEach(type=>window.removeEventListener(type,cancel));
  }
  requestAnimationFrame(frame);
}
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', async () => {
  if(opening)return;
  opening=true;
  const cover=document.querySelector('#portada');
  document.querySelectorAll('[data-open]').forEach(item=>{item.disabled=true;item.setAttribute('aria-expanded','true');});
  cover.classList.add('opening');
  if(!reducedMotion.matches)await new Promise(resolve=>setTimeout(resolve,500));
  const carta = document.querySelector('#carta');
  carta.hidden = false; carta.classList.add('revealed');
  requestAnimationFrame(()=>slideTo(document.querySelector('#mensaje'),1600));
  document.querySelector('#mensaje').setAttribute('tabindex','-1');
  document.querySelector('#mensaje').focus({preventScroll:true});
  document.querySelectorAll('[data-open]').forEach(item=>{item.disabled=false;});
  setTimeout(()=>{opening=false;cover.classList.remove('opening');},1700);
}));
// El contenido aparece con un pequeño deslizamiento a medida que se descubre.
if('IntersectionObserver' in window && !reducedMotion.matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
  }),{threshold:.06});
  document.querySelectorAll('#carta .panel').forEach(panel=>{panel.classList.add('reveal-panel');observer.observe(panel);});
}
// Controles discretos; no se colocan encima del arte original.
document.querySelectorAll('#carta .panel').forEach((panel,index,panels)=>{
  if(index===panels.length-1)return;
  const nav=document.createElement('div');nav.className='section-navigation';
  const next=document.createElement('button');next.className='next-section';
  next.type='button';next.textContent=['Continuar','Ver cuándo y dónde','Confirmar asistencia'][index]+' ↓';
  next.addEventListener('click',()=>slideTo(panels[index+1]));
  nav.append(next);panel.after(nav);
});
function tick(){
  let total = Math.max(0, Math.floor((Date.parse(config.fecha)-Date.now())/1000));
  const values = [Math.floor(total/86400),Math.floor(total/3600)%24,Math.floor(total/60)%60,total%60];
  ['dias','horas','minutos','segundos'].forEach((key,i)=>document.getElementById(key).textContent=String(values[i]).padStart(2,'0'));
  if(!total)document.querySelector('.countdown').setAttribute('aria-label','¡Llegó el gran día!');
}
tick();setInterval(tick,1000);
document.querySelector('#confirmar').addEventListener('click',()=>{
  let message='';
  if(Date.now()>=Date.parse(config.cierre))message='El plazo de confirmación finalizó el 30 de noviembre. Comunícate directamente con Marcia o Angel.';
  else if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.confirmacionUrl))message='El formulario todavía no ha sido habilitado por los anfitriones. Por favor, vuelve a intentarlo más adelante.';
  else {window.open(config.confirmacionUrl,'_blank','noopener');return;}
  document.querySelector('#aviso-texto').textContent=message;document.querySelector('#aviso').showModal();
});
// Movimiento localizado sobre los píxeles originales: no se redibuja el arte.
// Las áreas de texto y los botones quedan fuera de las máscaras.
const regions = {
 portada:[[110,180,50,60],[460,80,300,170],[0,580,210,160],[580,430,50,50],[80,840,45,45],[50,950,200,260]],
 mensaje:[[55,160,70,75],[600,235,55,55],[620,640,65,75],[20,695,38,40],[620,400,40,45],[150,850,420,300]],
 invitacion:[[615,355,65,70],[50,640,55,60],[625,595,42,48],[55,158,50,55],[450,935,50,50],[145,990,420,280]],
 evento:[[615,117,45,50],[50,635,55,60],[50,163,45,50],[620,940,50,55],[337,770,130,175]],
 confirmacion:[[170,300,50,60],[510,230,45,45],[390,1050,40,48],[55,495,40,45],[625,1010,50,55],[150,1035,270,240]]
};
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 Object.entries(regions).forEach(([id,boxes],index)=>{
  const image=document.querySelector(`#${id}>img`),ns='http://www.w3.org/2000/svg';
  const mask=`<svg xmlns="${ns}" width="720" height="1280">${boxes.map(([x,y,w,h])=>`<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="white"/>`).join('')}</svg>`;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 1280');svg.setAttribute('role','img');svg.setAttribute('aria-label',image.alt);
  svg.innerHTML=`<defs><filter id="motion-${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .018" numOctaves="2" seed="${index+3}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="moving"><animate attributeName="scale" values="0;${id==='portada'?9:4};0" dur="${5+index}s" repeatCount="indefinite"/></feDisplacementMap><feImage href="data:image/svg+xml,${encodeURIComponent(mask)}" result="mask"/><feComposite in="moving" in2="mask" operator="in" result="detail"/><feComposite in="SourceGraphic" in2="mask" operator="out" result="still"/><feMerge><feMergeNode in="still"/><feMergeNode in="detail"/></feMerge></filter></defs><image width="720" height="1280" href="${image.getAttribute('src')}" filter="url(#motion-${id})"/>`;
  image.replaceWith(svg);
 });
}
