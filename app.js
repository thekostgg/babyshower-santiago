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
