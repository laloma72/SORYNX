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

  /* Recortar solo el primer panel de los collages, sin alterar tamaño/encuadre del producto */
  document.querySelectorAll('.product-media img[data-collage="true"]').forEach((img) => {
    const cropFirstPanel = () => {
      const source = new Image();
      source.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(source.naturalWidth / 3);
        canvas.height = Math.floor(source.naturalHeight / 3);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        img.src = canvas.toDataURL('image/jpeg', 0.94);
      };
      source.src = img.currentSrc || img.src;
    };
    if (img.complete) cropFirstPanel();
    else img.addEventListener('load', cropFirstPanel, { once: true });
  });

  /* ================= CARRITO SORYNX ================= */
  const CART_KEY='sorynx_cart_v1';
  const PRODUCTS={
    'black-blade':{name:'SORYNX BLACK BLADE TEE',price:10,image:'checkout/img/01-front.jpg'},
    'dark-angel-white':{name:'SORYNX DARK ANGEL WHITE TEE',price:10,image:'checkout/img/productos/WhatsApp%20Image%202026-09-26%20at%2013.13.58.jpeg'},
    'black-dragon':{name:'SORYNX BLACK DRAGON TEE',price:10,image:'checkout/img/productos/WhatsApp%20Image%202026-09-26%20at%2013.13.57.jpeg'}
  };
  const getCart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return[]}};
  const saveCart=(cart)=>localStorage.setItem(CART_KEY,JSON.stringify(cart));
  const cartBtn=document.getElementById('cartBtn');
  const drawer=document.getElementById('cartDrawer');
  const backdrop=document.getElementById('cartBackdrop');
  const closeBtn=document.getElementById('cartClose');
  const itemsEl=document.getElementById('cartItems');
  const emptyEl=document.getElementById('cartEmpty');
  const footerEl=document.getElementById('cartFooter');
  const totalEl=document.getElementById('cartTotal');
  const countEl=document.querySelector('.cart-count');

  const formatEUR=(n)=>n.toLocaleString('es-ES',{style:'currency',currency:'EUR'});
  const openCart=()=>{drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';};
  const closeCart=()=>{drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow='';};
  const renderCart=()=>{
    const cart=getCart();
    const count=cart.reduce((sum,item)=>sum+item.quantity,0);
    countEl.textContent=count;
    cartBtn.classList.toggle('has-items',count>0);
    emptyEl.classList.toggle('is-hidden',cart.length>0);
    footerEl.classList.toggle('is-hidden',cart.length===0);
    itemsEl.innerHTML=cart.map((item,index)=>{
      const p=PRODUCTS[item.product];
      return `<div class="cart-item">
        <img class="cart-item-image" src="${p.image}" alt="">
        <div><div class="cart-item-name">${p.name}</div><div class="cart-item-price">${formatEUR(p.price)} · x${item.quantity}</div>
        <select class="cart-size" data-cart-index="${index}" aria-label="Talla de ${p.name}">
          <option value="">Selecciona talla</option>
          ${['S','M','L','XL'].map(s=>`<option value="${s}" ${item.size===s?'selected':''}>${s}</option>`).join('')}
        </select></div>
        <button class="cart-remove" type="button" data-remove-index="${index}" aria-label="Eliminar">×</button>
      </div>`;
    }).join('');
    const total=cart.reduce((sum,item)=>sum+PRODUCTS[item.product].price*item.quantity,0);
    totalEl.textContent=formatEUR(total);
    itemsEl.querySelectorAll('[data-remove-index]').forEach(btn=>btn.addEventListener('click',()=>{const c=getCart();c.splice(Number(btn.dataset.removeIndex),1);saveCart(c);renderCart();}));
    itemsEl.querySelectorAll('[data-cart-index]').forEach(sel=>sel.addEventListener('change',()=>{const c=getCart();c[Number(sel.dataset.cartIndex)].size=sel.value;saveCart(c);}));
  };
  document.querySelectorAll('[data-add-product]').forEach(btn=>btn.addEventListener('click',()=>{
    const product=btn.dataset.addProduct;
    const cart=getCart();
    const existing=cart.find(item=>item.product===product);
    if(existing) existing.quantity+=1; else cart.push({product,quantity:1,size:''});
    saveCart(cart);renderCart();openCart();
  }));
  cartBtn.addEventListener('click',()=>{renderCart();openCart();});
  backdrop.addEventListener('click',closeCart);
  closeBtn.addEventListener('click',closeCart);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart();});
  document.getElementById('cartCheckout').addEventListener('click',async()=>{
    const cart=getCart();
    if(!cart.length)return;
    if(cart.some(item=>!item.size)){window.alert('Selecciona una talla para cada pieza antes de continuar.');return;}
    const button=document.getElementById('cartCheckout');
    button.disabled=true;button.textContent='Preparando pago…';
    try{
      const response=await fetch('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.url)throw new Error(data.message||'No se pudo iniciar el pago.');
      window.location.href=data.url;
    }catch(err){window.alert(err.message);button.disabled=false;button.textContent='Continuar al pago';}
  });
  renderCart();

});
