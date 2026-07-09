
(function(){

  // Optional channels — off for live deploy; set true later to re-enable
  const WHATSAPP_ENABLED = false;
  const EMAIL_CTA_ENABLED = false;
  if (!WHATSAPP_ENABLED) {
    document.querySelectorAll('[data-whatsapp], .js-whatsapp, .btn-whatsapp, .mobile-book-wa').forEach(el => el.remove());
  }
  if (!EMAIL_CTA_ENABLED) {
    document.querySelectorAll('.mobile-book-mail, a.btn-ghost[href^="mailto:"], a.btn-island[href^="mailto:"]').forEach(el => el.remove());
  }

  const year=document.getElementById('year');
  if(year) year.textContent=new Date().getFullYear();

  function getOpenStatus(now=new Date()){
    const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Prague',weekday:'short',hour:'numeric',minute:'numeric',hour12:false});
    const parts=Object.fromEntries(fmt.formatToParts(now).map(p=>[p.type,p.value]));
    const dayMap={Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:0};
    const day=dayMap[parts.weekday]??now.getDay();
    const minutes=parseInt(parts.hour,10)*60+parseInt(parts.minute,10);
    let openAt=null,closeAt=null;
    if(day>=1&&day<=4){openAt=9*60;closeAt=19*60;}
    else if(day===5){openAt=9*60;closeAt=16*60;}
    const pad=n=>String(n).padStart(2,'0');
    const toHM=m=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
    if(openAt==null) return {open:false,label:'Dnes zavřeno · otevřeno v pondělí od 9:00',short:'Zavřeno'};
    if(minutes>=openAt&&minutes<closeAt) return {open:true,label:`Dnes otevřeno do ${toHM(closeAt)}`,short:`Do ${toHM(closeAt)}`};
    if(minutes<openAt) return {open:false,label:`Dnes otevřeno od ${toHM(openAt)}`,short:`Od ${toHM(openAt)}`};
    return {open:false,label:'Dnes již zavřeno · zítra dle otevírací doby',short:'Zavřeno'};
  }

  const st=getOpenStatus();
  document.querySelectorAll('[data-hours]').forEach(el=>{
    const mode=el.getAttribute('data-hours')||'label';
    el.textContent = mode==='short' ? st.short : st.label;
    if(!st.open) el.closest('.hero-hours, .mobile-book, .hours-pill')?.classList?.add('is-closed');
  });
  const mbh=document.getElementById('mobileBookHours');
  if(mbh) mbh.textContent = st.open ? st.label : '+420 739 990 333';
  const heroHours=document.getElementById('heroHours');
  const heroHoursText=document.getElementById('heroHoursText');
  if(heroHoursText) heroHoursText.textContent=st.label;
  if(heroHours) heroHours.classList.toggle('is-closed', !st.open);

  const navIsland=document.getElementById('navIsland');
  const mobileBook=document.getElementById('mobileBook');
  const onScroll=()=>{
    const y=window.scrollY;
    if(navIsland) navIsland.classList.toggle('is-scrolled', y>24);
    if(mobileBook) mobileBook.classList.toggle('is-show', y>180);
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  const burger=document.getElementById('navBurger');
  const overlay=document.getElementById('menuOverlay');
  if(burger&&overlay){
    const close=()=>{burger.classList.remove('is-open');overlay.classList.remove('is-open');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';};
    burger.addEventListener('click',()=>{
      const open=!overlay.classList.contains('is-open');
      burger.classList.toggle('is-open',open);overlay.classList.toggle('is-open',open);
      burger.setAttribute('aria-expanded', open?'true':'false');
      document.body.style.overflow=open?'hidden':'';
    });
    overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click', close));
  }

  document.querySelectorAll('.price-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const key=tab.dataset.tab||tab.dataset.category;
      document.querySelectorAll('.price-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.price-table,.price-category').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const el=document.getElementById(key+'-table')||document.getElementById(key);
      if(el) el.classList.add('active');
    });
  });

  // Add Objednat to first N price items per visible category on load
  document.querySelectorAll('.price-category, .price-table').forEach(cat=>{
    cat.querySelectorAll('.price-item').forEach((item,i)=>{
      if(item.querySelector('.price-book')) return;
      if(i>=6) return; // top services only
      const name=item.querySelector('.price-name')?.textContent?.trim()||'službu';
      const a=document.createElement('a');
      a.className='price-book';
      a.href='tel:+420739990333';
      a.setAttribute('aria-label', `Objednat: ${name}`);
      a.innerHTML='<span class="call-label-short">Objednat</span><span class="call-label-num">+420 739 990 333</span>';
      a.title=`Zavolat a objednat: ${name}`;
      item.appendChild(a);
    });
  });

  document.querySelectorAll('.faq-q').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=btn.closest('.faq-item');
      const open=item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('is-open'));
      if(!open) item.classList.add('is-open');
    });
  });

  const lb=document.getElementById('lightbox');
  const lbImg=document.getElementById('lightboxImg');
  if(lb&&lbImg){
    document.querySelectorAll('.gallery-item img').forEach(img=>{
      img.addEventListener('click',()=>{lbImg.src=img.getAttribute('data-hq')||img.currentSrc||img.src;lb.classList.add('is-open');document.body.style.overflow='hidden';});
    });
    const closeLb=()=>{lb.classList.remove('is-open');document.body.style.overflow='';};
    lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lightbox-close')) closeLb();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') closeLb();});
  }

  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});
  },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  requestAnimationFrame(()=>{
    document.querySelectorAll('.page-hero .reveal, .hero .reveal').forEach((el,i)=>setTimeout(()=>el.classList.add('is-in'),100+i*80));
  });

  document.querySelectorAll('img').forEach((img,i)=>{
    if(i>1 && !img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    img.setAttribute('decoding','async');
  });



  // Progressive images: fast LQ first paint → HQ after load (idle)
  function upgradeToHQ(){
    document.querySelectorAll('img[data-hq]').forEach(img=>{
      if(img.dataset.hqDone) return;
      const hq=img.getAttribute('data-hq');
      const hqSrcset=img.getAttribute('data-hq-srcset');
      if(!hq) return;
      const probe=new Image();
      if(hqSrcset) probe.srcset=hqSrcset;
      probe.sizes=img.sizes||'';
      probe.decoding='async';
      probe.onload=()=>{
        if(hqSrcset) img.srcset=hqSrcset;
        else img.removeAttribute('srcset');
        img.src=hq;
        img.dataset.hqDone='1';
        img.classList.add('is-hq');
      };
      probe.onerror=()=>{};
      probe.src=hq;
    });
    document.querySelectorAll('[data-hq-bg]').forEach(el=>{
      if(el.dataset.hqBgDone) return;
      const url=el.getAttribute('data-hq-bg');
      if(!url) return;
      const probe=new Image();
      probe.onload=()=>{
        const cur=getComputedStyle(el).backgroundImage;
        if(cur && cur!=='none'){
          let next=cur.replace(/url\((["']?)([^"')]+)\1\)/g, (full, q, u)=>{
            if(/photos\/opt\//.test(u) && !/photos\/opt\/hq\//.test(u)) return 'url("'+url+'")';
            return full;
          });
          if(next===cur) next=cur.replace(/url\((["']?)[^"')]+\1\)(?!.*url\()/, 'url("'+url+'")');
          el.style.backgroundImage=next;
        } else {
          el.style.backgroundImage='url("'+url+'")';
        }
        el.dataset.hqBgDone='1';
        el.classList.add('is-hq-bg');
      };
      probe.onerror=()=>{};
      probe.src=url;
    });
  }
  function scheduleHQ(){
    const run=()=>upgradeToHQ();
    if('requestIdleCallback' in window) requestIdleCallback(run,{timeout:1800});
    else setTimeout(run,200);
  }
  if(document.readyState==='complete') scheduleHQ();
  else window.addEventListener('load', scheduleHQ);

})();
