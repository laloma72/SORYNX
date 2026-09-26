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

  const cartBtn=document.getElementById('cartBtn');
  cartBtn.addEventListener('click',()=>{
    console.info('SORYNX: el carrito estará disponible con el lanzamiento de la colección.');
  });

});
