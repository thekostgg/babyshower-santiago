/* Capas originales recuperadas de Canva. Coordenadas del diseño de 1080 × 1920.
   Los textos quedan en el JPEG; se retiran las siluetas fijas y se restaura
   el fondo con los recursos originales antes de dibujar cada capa móvil. */
(() => {
  const W=1080,H=1920,S=2/3,preference=matchMedia('(prefers-reduced-motion: reduce)');
  const cache=new Map(),scenes=[];
  const load=name=>{
    if(!cache.has(name))cache.set(name,new Promise((resolve,reject)=>{
      const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(name));
      img.src='assets/layers/'+name;
    }));return cache.get(name);
  };
  // Source, position, crop box, rotation, optional flip, optional source crop.
  const layer=(src,x,y,w,h,r=0,flip=false,crop=null)=>({src,x,y,w,h,r,flip,crop});
  const bee=(x,y,w,h,r=0,flip=false)=>({...layer('bee.png',x,y,w,h,r,flip),kind:'bee'});
  const star=(x,y,w,h,r=0)=>({...layer('star.png',x,y,w,h,r),kind:'star'});
  const character=(...args)=>({...layer(...args),kind:'character'});
  const cloud=(...args)=>({...layer(...args),kind:'cloud'});
  const backgrounds={
    portada:[layer('sky.webp',-141.081,0,1362.16,1920),layer('envelope.webp',206.978,703.573,666.044,512.854)],
    mensaje:[layer('circle1.webp',-124.297,295.703,1328.59,1328.59),layer('circle2.webp',-124.297,295.703,1328.59,1328.59),layer('circle2.webp',-50.0115,755.062,1176,1176),layer('circle2.webp',-4.01877,213.053,1084.02,1084.02),layer('circle2.webp',18.5882,335.226,1042.82,1042.82),layer('frame.webp',55.7999,335.226,968.4,1249.55),layer('leaf1.png',196.618,1369.15,167.62,296.673,-20.8475,true),layer('leaf2.png',225.991,1473.17,133.702,275.675,-85.3988),layer('leaf2.png',282.906,1332.34,139.556,287.745,-48.0426),layer('leaf2.png',719.945,1454.94,133.702,275.675,-72.1637),layer('leaf1.png',717.119,1350.47,188.722,334.021,32.1843),layer('leaf2.png',713.844,1273.07,133.702,275.675,-101.567)],
    invitacion:[],
    evento:[layer('map.png',349.309,1155.78,246.145,261.856)],
    confirmacion:[layer('ground.webp',0,1256.13,1080,663.865,0,false,[1080,1919.34,0,-1255.48])]
  };
  const moving={
    portada:[cloud('cloud.webp',-95.8835,877.142,407.767,230.438,0,false,[1080,1522.29,-376.311,-169.919]),cloud('cloud.webp',689.986,125.118,441.176,249.318,0,false,[1168.49,1647.01,-407.142,-183.84]),character('pooh.webp',18.7184,1408.96,413.16,445.71,0,false,[413.16,734.507,0,-288.797]),bee(878.897,649.549,53.6122,55.8461,13.7675,true),bee(139.746,1267.81,39.5984,41.2483,13.7675),bee(166.994,274.971,68.3532,71.2013,19.8152)],
    mensaje:[character('family.webp',244.153,1267.44,617.288,470.598,0,false,[642.882,1142.9,-25.5944,-337.825]),bee(97.677,254.476,79.1568,82.455),bee(946.408,977.702,79.1568,82.455,17.0236,true),bee(910.948,366.52,50.249,52.3427,17.0236,true),star(34.3595,1048.71,42.8809,42.4521,-15.2349),star(889.245,1361.8,34.2841,33.9413,25.7829),star(155.007,1491.95,24.855,24.6064,51.945),star(938.282,611.549,42.8809,42.4521,-15.2349)],
    invitacion:[character('scene.webp',-5.92971,1480,1086.61,440,0,false,[1086.61,1931.76,0,-1491.685]),bee(686.127,1416.78,47.3906,49.3652,17.0236,true),bee(85.6021,967.607,58.3641,60.7959,-10.1792),bee(927.152,542.362,81.6968,85.1009,2.93313,true),star(88.7354,243.443,64.5337,63.8884,-15.2349),star(949.426,902.029,52.5104,51.9853,15.2372)],
    evento:[character('map-pooh.webp',503.958,1163.28,182.991,246.856,0,false,[1888.94,1256.72,-1355.31,-432.293]),bee(85.6021,967.607,58.3641,60.7959,-10.1792),bee(932.634,186.859,45.0144,46.89,-25.2163,true),star(932.05,1417.49,64.5337,63.8884,-15.2349),star(86.6489,251.436,52.8207,52.2925,29.2576)],
    confirmacion:[character('eeyore.webp',222.089,1548.77,402.452,357.9,0,false,[3407,2266.69,-1956.9,-1793.76]),bee(266.118,464.652,53.3031,55.5241,-10.1792),bee(779.241,353.381,40.5847,42.2757,-10.1792,true),bee(597.249,1591.32,40.5847,42.2757,-10.1792,true),star(949.113,1516.82,64.5337,63.8884,-15.2349),star(84.8437,744.379,52.3971,51.8732,24.4162)]
  };
  function canvas(){const c=document.createElement('canvas');c.width=720;c.height=1280;return c;}
  function context(c){const ctx=c.getContext('2d');ctx.scale(S,S);return ctx;}
  function draw(ctx,l,time=0,index=0,animate=false){
    const phase=index*1.71;
    let dx=0,dy=0,angle=0,scale=1,alpha=1;
    if(animate){
      if(l.kind==='bee'){dx=22*Math.sin(time*1.35+phase);dy=16*Math.sin(time*1.95+phase);angle=8*Math.sin(time*1.7+phase);}
      if(l.kind==='cloud'){dx=42*Math.sin(time*.24+phase);dy=5*Math.sin(time*.35+phase);}
      if(l.kind==='character'){dy=3*Math.sin(time*1.1+phase);angle=(l.src==='scene.webp'?.22:.85)*Math.sin(time*.85+phase);}
      if(l.kind==='star'){angle=12*Math.sin(time*.9+phase);scale=1+.13*Math.sin(time*1.8+phase);alpha=.8+.2*Math.sin(time*1.8+phase);}
    }
    ctx.save();ctx.globalAlpha*=alpha;
    ctx.translate(l.x+l.w/2+dx,l.y+l.h/2+dy);ctx.rotate((l.r+angle)*Math.PI/180);ctx.scale(scale,scale);ctx.translate(-l.w/2,-l.h/2);
    ctx.beginPath();ctx.rect(0,0,l.w,l.h);ctx.clip();
    if(l.flip){ctx.translate(l.w,0);ctx.scale(-1,1);}
    const crop=l.crop||[l.w,l.h,0,0];
    ctx.drawImage(l.image,crop[2],crop[3],crop[0],crop[1]);ctx.restore();
  }
  function arch(ctx,id){
    if(!['invitacion','evento','confirmacion'].includes(id))return;
    ctx.save();ctx.globalAlpha=.88;ctx.fillStyle='#fff';
    const x=id==='confirmacion'?108:102.441,y=id==='invitacion'?87.6231:-840.752;
    const w=873.38,h=id==='invitacion'?1886.61:2814.99;
    ctx.beginPath();ctx.moveTo(x,y+w*.55);ctx.bezierCurveTo(x,y-w*.18,x+w,y-w*.18,x+w,y+w*.55);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();ctx.restore();
  }
  async function prepare(id){
    const panel=document.getElementById(id),original=panel.querySelector(':scope > img');
    if(!original)return;
    const items=[...backgrounds[id],...moving[id]];
    await Promise.all(items.map(async l=>l.image=await load(l.src)));
    const gingham=id==='portada'?null:await load('gingham.webp');
    if(!original.complete)await new Promise((resolve,reject)=>{original.addEventListener('load',resolve,{once:true});original.addEventListener('error',reject,{once:true});});
    const under=canvas(),u=context(under);u.fillStyle='#fffdf1';u.fillRect(0,0,W,H);
    if(gingham){u.save();u.globalAlpha=.62;u.drawImage(gingham,0,-110.51,1080,1911.5);u.drawImage(gingham,0,1424.09,1080,1911.5);u.restore();}
    arch(u,id);backgrounds[id].forEach(l=>draw(u,l));
    const still=canvas(),s=context(still);s.drawImage(original,0,0,W,H);
    s.globalCompositeOperation='destination-out';
    // Un borde adicional elimina los píxeles de compresión JPEG de la figura fija.
    moving[id].forEach(l=>{
      for(const [x,y] of [[0,0],[-1.5,0],[1.5,0],[0,-1.5],[0,1.5]]){s.save();s.translate(x,y);draw(s,l);s.restore();}
    });
    const plate=canvas(),p=plate.getContext('2d');p.drawImage(under,0,0);p.drawImage(still,0,0);
    const output=canvas();output.className='animated-art';output.setAttribute('role','img');output.setAttribute('aria-label',original.alt);output.dataset.motion='original-layers-v3';
    const ctx=output.getContext('2d');
    const state={panel,output,ctx,plate,id,visible:false};scenes.push(state);
    function render(time){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,720,1280);ctx.drawImage(plate,0,0);ctx.save();ctx.scale(S,S);moving[id].forEach((l,i)=>draw(ctx,l,time,i,true));ctx.restore();}
    state.render=render;render(0);original.replaceWith(output);
    observer.observe(panel);
  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const state=scenes.find(s=>s.panel===entry.target);if(state)state.visible=entry.isIntersecting;
  }),{rootMargin:'100px'});
  let last=0;
  function loop(now){
    if(now-last>32&&!document.hidden&&!preference.matches){scenes.filter(s=>s.visible).forEach(s=>s.render(now/1000));last=now;}
    requestAnimationFrame(loop);
  }
  if(!preference.matches){Object.keys(moving).forEach(id=>prepare(id).catch(error=>console.warn('No se pudo cargar la animación de '+id,error)));requestAnimationFrame(loop);}
  preference.addEventListener('change',()=>location.reload());
})();
