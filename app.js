// Troca PT/EN
function switchLanguage(lang){
  document.getElementById('pt').style.display = (lang==='pt') ? 'block' : 'none';
  document.getElementById('en').style.display = (lang==='en') ? 'block' : 'none';
  window.scrollTo({top:0, behavior:'smooth'});
}

// Parallax suave nas formas (mouse + leve no scroll)
(function parallax(){
  const movers = Array.from(document.querySelectorAll('[data-speed]'));
  if(!movers.length) return;

  let w = window.innerWidth, h = window.innerHeight;
  let mx = 0, my = 0;

  function move(x, y){
    movers.forEach(el=>{
      const s = parseFloat(el.getAttribute('data-speed')) || 0;
      el.style.transform = `translate3d(${x*s}px, ${y*s}px, 0)`;
    });
  }
  window.addEventListener('mousemove', e=>{
    mx = (e.clientX - w/2) / 18;
    my = (e.clientY - h/2) / 18;
    move(mx, my);
  });
  window.addEventListener('resize', ()=>{ w = innerWidth; h = innerHeight; });

  // sutil no scroll (para mobile)
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    movers.forEach(el=>{
      const s = parseFloat(el.getAttribute('data-speed')) || 0;
      el.style.transform = `translate3d(${mx*s}px, ${my*s + y*s*0.1}px, 0)`;
    });
  });
})();

// Abrir/fechar modais de receita
document.querySelectorAll('.open-modal').forEach(el=>{
  el.addEventListener('click', ()=> {
    const m = document.getElementById(el.getAttribute('data-modal'));
    if(m){ m.classList.add('open'); m.setAttribute('aria-hidden','false'); }
  });
});
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click', (e)=>{
    if(e.target.classList.contains('modal') || e.target.classList.contains('close')){
      m.classList.remove('open'); m.setAttribute('aria-hidden','true');
    }
  });
});
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){
    document.querySelectorAll('.modal.open').forEach(m=>{
      m.classList.remove('open'); m.setAttribute('aria-hidden','true');
    });
  }
});

// PIX modal (PT e EN botões)
function attachPix(buttonId){
  const btn = document.getElementById(buttonId);
  if(!btn) return;

  const modal = document.createElement('div');
  modal.className = 'pix-modal';
  modal.innerHTML = `
    <div class="pix-box" role="dialog" aria-label="Pagamento via PIX">
      <h3>Pagamento rápido via PIX</h3>
      <img src="qrcode-pix.png" alt="QR Code PIX" style="width:220px;height:220px;object-fit:contain;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,.12);margin:8px auto;">
      <div class="pix-code" id="${buttonId}-code">COLE_AQUI_O_SEU_COPIA_E_COLA_PIX</div>
      <button class="btn" id="${buttonId}-copy">Copiar código PIX</button>
      <div class="small-muted" style="margin-top:.5rem">Após o pagamento, você receberá o PDF no e-mail informado.</div>
      <div style="margin-top:.8rem"><button class="btn-ghost" id="${buttonId}-close">Fechar</button></div>
    </div>`;
  document.body.appendChild(modal);

  btn.addEventListener('click', ()=> modal.classList.add('open'));
  modal.addEventListener('click', (e)=>{
    if(e.target.classList.contains('pix-modal') || e.target.id===`${buttonId}-close`) modal.classList.remove('open');
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') modal.classList.remove('open'); });
  document.getElementById(`${buttonId}-copy`).addEventListener('click', ()=>{
    const txt = document.getElementById(`${buttonId}-code`).innerText.trim();
    navigator.clipboard.writeText(txt).then(()=>{
      document.getElementById(`${buttonId}-copy`).textContent = 'Copiado!';
      setTimeout(()=>document.getElementById(`${buttonId}-copy`).textContent = 'Copiar código PIX', 1500);
    });
  });
}
attachPix('pt-pix');
attachPix('en-pix');

// âncora “ver prévias”
document.querySelectorAll('.hero-scroll').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// Reveal on scroll (stagger)
(function(){
  const cards = Array.from(document.querySelectorAll('.recipe-preview .card'));
  if(!cards.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
      if(e.isIntersecting){
        const idx = cards.indexOf(e.target);
        e.target.style.transitionDelay = (idx * 80) + 'ms';
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(c => io.observe(c));

  // Glow que segue o cursor
  cards.forEach(card=>{
    card.addEventListener('mousemove', (ev)=>{
      const r = card.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100;
      const y = ((ev.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
})();
// Roteiro: reveal + abrir modais
(function(){
  const places = Array.from(document.querySelectorAll('.trail .place'));
  if(!places.length) return;

  // reveal on scroll (stagger)
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const idx = places.indexOf(e.target);
        e.target.style.transitionDelay = (idx*80)+'ms';
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.15});
  places.forEach(p=>io.observe(p));

  // abre modal ao clicar
  places.forEach(p=>{
    p.addEventListener('click', ()=>{
      const m = document.getElementById(p.dataset.modal);
      if(m){ m.classList.add('open'); m.setAttribute('aria-hidden','false'); }
    });
  });
})();

// Sincroniza thumbnails da grade com as imagens dos modais
(function syncTrailThumbs(){
  const cards = document.querySelectorAll('.trail .place');
  cards.forEach(card => {
    const modalId = card.getAttribute('data-modal');
    const modalImg = document.querySelector(`#${modalId} .img-wrap img`);
    const thumb   = card.querySelector('img');

    if (modalImg && thumb) {
      // Usa a mesma imagem do modal
      thumb.src = modalImg.currentSrc || modalImg.src;
      thumb.loading = 'lazy';

      // Se quiser fallback retina/WEBP:
      if (modalImg.srcset) thumb.srcset = modalImg.srcset;
    }
  });
})();
// ===== Ligação da galeria nos modais =====
(function attachGalleries(){
  const galleries = document.querySelectorAll('.modal .gallery');
  if(!galleries.length) return;

  galleries.forEach(gal => {
    const main  = gal.querySelector('.gallery-main img');
    const prev  = gal.querySelector('.gprev');
    const next  = gal.querySelector('.gnext');
    const thumbs= Array.from(gal.querySelectorAll('.gallery-thumbs img'));
    let idx = Math.max(0, thumbs.findIndex(t => t.classList.contains('active')));

    function show(i, animate=true){
      if(!thumbs.length) return;
      idx = (i + thumbs.length) % thumbs.length;
      const src = thumbs[idx].dataset.src || thumbs[idx].src;
      // efeito leve
      if (animate) { main.style.opacity = .0; main.style.transform='scale(1.01)'; }
      main.onload = ()=> { main.style.opacity = 1; main.style.transform='none'; };
      main.src = src;

      thumbs.forEach(t => t.classList.remove('active'));
      thumbs[idx].classList.add('active');
      // pré-carregamento
      const pre = new Image(); pre.src = thumbs[(idx+1)%thumbs.length].dataset.src || thumbs[(idx+1)%thumbs.length].src;
    }

    thumbs.forEach((t,i)=> t.addEventListener('click', ()=> show(i)));
    prev?.addEventListener('click', ()=> show(idx-1));
    next?.addEventListener('click', ()=> show(idx+1));

    // teclado quando o modal está aberto
    gal.closest('.modal')?.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft')  show(idx-1);
      if(e.key === 'ArrowRight') show(idx+1);
    });

    // swipe simples
    let sx=0;
    gal.addEventListener('touchstart', e=> sx = e.touches[0].clientX, {passive:true});
    gal.addEventListener('touchend', e=>{
      const dx = e.changedTouches[0].clientX - sx;
      if(Math.abs(dx) > 40){ dx>0 ? show(idx-1) : show(idx+1); }
    }, {passive:true});

    show(idx, false);
  });
})();

// ===== Atualiza thumbnails da grade para pegar a 1ª imagem da galeria =====
(function syncTrailThumbs(){
  const cards = document.querySelectorAll('.trail .place');
  cards.forEach(card => {
    const modalId = card.getAttribute('data-modal');
    const m = document.getElementById(modalId);
    const galMain = m?.querySelector('.gallery-main img');
    const fallback = m?.querySelector('.img-wrap img');
    const thumb = card.querySelector('img');
    const source = galMain || fallback;

    if (source && thumb) {
      thumb.src = source.currentSrc || source.src;
      if (source.srcset) thumb.srcset = source.srcset;
      thumb.loading = 'lazy';
    }
  });
})();
// === Corrige thumbs: copia data-src -> src e aplica fallback ===
(function fixGalleryThumbs(){
  document.querySelectorAll('.modal .gallery').forEach(gal=>{
    gal.querySelectorAll('.gallery-thumbs img').forEach(t=>{
      const ds = t.getAttribute('data-src');
      // seta o src real se ainda não existir
      if (ds && (!t.getAttribute('src') || t.getAttribute('src').trim()==='')) {
        t.src = ds;
        t.loading = 'lazy';
        t.decoding = 'async';
      }
      // fallback automático se .webp falhar (tenta .jpg/.png)
      t.addEventListener('error', ()=>{
        if (/\.(webp)(\?.*)?$/i.test(t.src)) {
          t.src = ds.replace(/\.webp(\?.*)?$/i, '.jpg$1');
        } else if (/\.(jpe?g)(\?.*)?$/i.test(t.src)) {
          t.src = ds.replace(/\.jpe?g(\?.*)?$/i, '.png$1');
        }
      }, {once:true});
    });
  });
})();
