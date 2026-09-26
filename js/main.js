/* =========================================================
   SORYNX — main.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById('header');
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  const closeMobileNav = () => {
    menuToggle.classList.remove('open');
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerOffset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  const heroTitle = document.getElementById('heroTitle');
  requestAnimationFrame(() => heroTitle.classList.add('animate'));

  const revealTargets = document.querySelectorAll('[data-reveal], .reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = (entry.target.style.getPropertyValue('--i') || 0) * 90;
        setTimeout(() => entry.target.classList.add('in-view'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  const cursorDot = document.getElementById('cursorDot');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover && cursorDot) {
    let x = 0, y = 0, targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorDot.classList.add('active');
    });
    const animateCursor = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      cursorDot.style.left = x + 'px';
      cursorDot.style.top = y + 'px';
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('grow'));
    });
  }

  /* ---------- Normalización visual de los productos ---------- */
  const productImages = document.querySelectorAll('.product-media img');

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  function distance(a, b) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function sampleBackground(ctx, w, h) {
    const points = [[3,3],[w-4,3],[3,h-4],[w-4,h-4]];
    const samples = points.map(([x,y]) => {
      const p = ctx.getImageData(Math.max(0,x), Math.max(0,y), 1, 1).data;
      return [p[0],p[1],p[2]];
    });
    return [
      Math.round(samples.reduce((s,p)=>s+p[0],0)/samples.length),
      Math.round(samples.reduce((s,p)=>s+p[1],0)/samples.length),
      Math.round(samples.reduce((s,p)=>s+p[2],0)/samples.length)
    ];
  }

  function normalizeProduct(sourceCanvas) {
    const sw = sourceCanvas.width;
    const sh = sourceCanvas.height;
    const sourceCtx = sourceCanvas.getContext('2d', {willReadFrequently:true});
    const pixels = sourceCtx.getImageData(0,0,sw,sh).data;
    const bg = sampleBackground(sourceCtx,sw,sh);

    let minX=sw,minY=sh,maxX=-1,maxY=-1;
    const step=Math.max(2,Math.floor(Math.min(sw,sh)/500));
    const threshold=28;

    for(let y=0;y<sh;y+=step){
      for(let x=0;x<sw;x+=step){
        const i=(y*sw+x)*4;
        if(distance([pixels[i],pixels[i+1],pixels[i+2]],bg)>threshold){
          if(x<minX)minX=x;
          if(y<minY)minY=y;
          if(x>maxX)maxX=x;
          if(y>maxY)maxY=y;
        }
      }
    }

    const detectedW=maxX-minX+1;
    const detectedH=maxY-minY+1;
    const valid=maxX>=0 && detectedW>sw*0.08 && detectedH>sh*0.12 &&
      detectedW<sw*0.96 && detectedH<sh*0.96;

    if(!valid){
      minX=Math.floor(sw*0.10);
      minY=Math.floor(sh*0.06);
      maxX=Math.floor(sw*0.90);
      maxY=Math.floor(sh*0.94);
    }

    const cropW=maxX-minX+1;
    const cropH=maxY-minY+1;

    const output=document.createElement('canvas');
    output.width=1200;
    output.height=1500;

    const out=output.getContext('2d');
    out.fillStyle='#ffffff';
    out.fillRect(0,0,output.width,output.height);

    const scale=Math.min((output.width*0.72)/cropW,(output.height*0.82)/cropH);
    const drawW=Math.round(cropW*scale);
    const drawH=Math.round(cropH*scale);
    const dx=Math.round((output.width-drawW)/2);
    const dy=Math.round((output.height-drawH)/2);

    out.imageSmoothingEnabled=true;
    out.imageSmoothingQuality='high';
    out.drawImage(sourceCanvas,minX,minY,cropW,cropH,dx,dy,drawW,drawH);

    return output.toDataURL('image/jpeg',0.94);
  }

  async function prepareProductImage(img) {
    try {
      const source=await loadImage(img.currentSrc||img.src);
      const sourceCanvas=document.createElement('canvas');

      if(img.dataset.collage==='true'){
        const w=Math.floor(source.naturalWidth/3);
        const h=Math.floor(source.naturalHeight/3);
        sourceCanvas.width=w;
        sourceCanvas.height=h;
        sourceCanvas.getContext('2d').drawImage(source,0,0,w,h,0,0,w,h);
      }else{
        sourceCanvas.width=source.naturalWidth;
        sourceCanvas.height=source.naturalHeight;
        sourceCanvas.getContext('2d').drawImage(source,0,0);
      }

      img.src=normalizeProduct(sourceCanvas);
      img.classList.add('product-image-normalized');
    }catch(error){
      console.warn('SORYNX: no se pudo normalizar una imagen de producto.',error);
    }
  }

  productImages.forEach(prepareProductImage);

  const cartBtn=document.getElementById('cartBtn');
  cartBtn.addEventListener('click',()=>{
    console.info('SORYNX: el carrito estará disponible con el lanzamiento de la colección.');
  });

});
