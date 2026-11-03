(function(){
  var doc=document.documentElement, body=document.body;
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ body.classList.add('loaded'); }); });

  var nav=document.querySelector('.nav');
  function onScroll(){ nav.classList.toggle('scrolled', window.scrollY>8); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(el,v){ return el.dataset.format==='k' ? Math.round(v/1000)+'K' : String(Math.round(v)); }
  function countUp(el){
    var to=+el.dataset.count; if(reduce){ el.textContent=fmt(el,to); return; }
    var t0=null, d=1400;
    function step(t){ if(!t0) t0=t; var p=Math.min(1,(t-t0)/d); var e=1-Math.pow(1-p,3);
      el.textContent=fmt(el,to*e); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  var items=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){ items.forEach(function(el){el.classList.add('in')}); return; }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el=en.target; el.classList.add('in'); io.unobserve(el);
      el.querySelectorAll('[data-count]').forEach(countUp);
    });
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  items.forEach(function(el){ io.observe(el); });

  var steps=document.querySelector('.steps');
  if(steps){
    new IntersectionObserver(function(en,o){ if(en[0].isIntersecting){ steps.style.setProperty('--progress','100%'); o.disconnect(); } },{threshold:.3}).observe(steps);
  }

  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click', function(){
      var s=document.querySelector('.copy-status'), v=b.dataset.copy;
      var done=function(){ s.textContent='Email copied.'; b.textContent='Copied'; setTimeout(function(){ b.textContent='Copy email'; s.textContent=''; },2200); };
      if(navigator.clipboard){ navigator.clipboard.writeText(v).then(done,function(){ s.textContent=v; }); } else { s.textContent=v; }
    });
  });
})();
