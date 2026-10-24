/* CARBLISS — client interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 정적 미리보기(서버 없이 공유한 버전) 여부
  const STATIC = document.documentElement.dataset.static === '1';
  if (STATIC) {
    // muse.tag 보드 안의 미리보기 창에서 열렸으면 '보드로' 버튼 숨김
    try { if (window.parent !== window && window.parent.document.querySelector('[data-cb-board]')) document.documentElement.classList.add('in-board'); } catch { /* 다른 출처 */ }
    // 문의 페이지: ?type=, ?service= 미리 선택
    const p = new URLSearchParams(location.search);
    const cf = $('#contact-inquiry');
    if (cf && p.get('type')) { const r = $(`input[name=type][value="${CSS.escape(p.get('type'))}"]`, cf); if (r) { r.checked = true; cf.dataset.type = p.get('type'); } }
    if (cf && p.get('service')) { const sel = $('select[name=service]', cf); if (sel) sel.value = p.get('service'); }
    // 현재 디자인 표시
    $$('[data-theme-pop] [data-set-theme]').forEach(b => b.classList.toggle('on', b.dataset.setTheme === document.documentElement.dataset.theme));
    // 포트폴리오 필터 (브라우저에서 처리)
    const grid = $('[data-static-portfolio]');
    if (grid) {
      const state = { service: p.get('service') || '', brand: p.get('brand') || '', store: p.get('store') || '' };
      const cards = $$('.case-card', grid);
      const match = (c, sv, br) => (!sv || c.dataset.services.split(' ').includes(sv)) && (!br || c.dataset.brand === br) && (!state.store || c.dataset.store === state.store);
      const apply = () => {
        let n = 0;
        cards.forEach(c => { const ok = match(c, state.service, state.brand); c.hidden = !ok; if (ok) { n++; c.classList.add('in'); } });
        $$('[data-f-store]').forEach(a => a.classList.toggle('on', a.dataset.fStore === state.store));
        $$('[data-f-service]').forEach(a => {
          a.classList.toggle('on', a.dataset.fService === state.service);
          const sm = $('small', a); if (sm) sm.textContent = cards.filter(c => match(c, a.dataset.fService, state.brand)).length;
        });
        $$('[data-f-brand]').forEach(a => a.classList.toggle('on', a.dataset.fBrand === state.brand));
        const empty = $('[data-empty]'); if (empty) empty.hidden = n > 0;
      };
      document.addEventListener('click', e => {
        const a = e.target.closest('[data-f-service],[data-f-brand],[data-f-store]'); if (!a) return;
        e.preventDefault();
        if (a.hasAttribute('data-f-service')) state.service = a.dataset.fService;
        else if (a.hasAttribute('data-f-brand')) state.brand = a.dataset.fBrand;
        else state.store = a.dataset.fStore;
        apply();
      });
      apply();
    }
  }

  // 디자인 비교용 임베드(iframe) 모드: 고정 UI 숨김
  if (new URLSearchParams(location.search).get('embed')) {
    document.documentElement.classList.add('embed');
    const st = document.createElement('style');
    st.textContent = '.theme-dock,.quick-rail,.mobile-bar{display:none!important}';
    document.head.appendChild(st);
  }

  // ── 헤더: 스크롤 상태 / 아래로 스크롤 시 숨김 ──
  const header = $('[data-header]');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', y > 40);
      header.classList.toggle('hide', y > 400 && y > lastY + 4 && !document.body.classList.contains('menu-open'));
      if (y < lastY - 4) header.classList.remove('hide');
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── 모바일 메뉴 ──
  const drawer = $('[data-drawer]');
  const openBtn = $('[data-menu-open]');
  const setMenu = open => {
    if (!drawer) return;
    drawer.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    openBtn && openBtn.setAttribute('aria-expanded', String(open));
    if (open) $('[data-menu-close]', drawer)?.focus(); else openBtn?.focus();
  };
  openBtn?.addEventListener('click', () => setMenu(true));
  $('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer && !drawer.hidden) setMenu(false); });

  // ── 스크롤 등장 애니메이션 ──
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  // ── 숫자 카운트업 ──
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count; if (!target || reduce) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1200;
      const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    io.observe(el);
  });

  // ── 갤러리 라이트박스 ──
  const lb = $('[data-lightbox]');
  let items = [], idx = 0;
  const show = i => {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    $('img', lb).src = it.dataset.full; $('img', lb).alt = it.dataset.cap || '';
    $('.lb-cap', lb).textContent = `${idx + 1} / ${items.length}${it.dataset.cap ? ' · ' + it.dataset.cap : ''}`;
  };
  $$('[data-gallery]').forEach(g => {
    const list = $$('[data-full]', g);
    list.forEach((b, i) => b.addEventListener('click', () => { items = list; lb.hidden = false; document.body.style.overflow = 'hidden'; show(i); $('[data-lb-close]', lb).focus(); }));
  });
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
  if (lb) {
    $('[data-lb-close]', lb).addEventListener('click', closeLb);
    $('[data-lb-prev]', lb).addEventListener('click', () => show(idx - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
  }

  // ── 전후 비교 슬라이더 ──
  $$('[data-ba]').forEach(ba => {
    const r = $('input', ba);
    r.addEventListener('input', () => ba.style.setProperty('--pos', r.value + '%'));
  });

  // ── 문의 폼 ──
  $$('[data-inquiry]').forEach(form => {
    const msg = $('.inq-msg', form);
    const sync = () => {
      const checked = $('input[name=type]:checked', form) || $('input[name=type]', form);
      const type = checked ? checked.value : form.dataset.type;
      form.dataset.type = type;
      // 보이는 항목만 필수 처리
      $$('.inq-set', form).forEach(set => {
        const on = set.dataset.for === type;
        $$('[data-req]', set).forEach(f => { f.required = on; });
        $$('input,select,textarea', set).forEach(f => { f.disabled = !on; });
      });
    };
    $$('input[name=type]', form).forEach(r => r.addEventListener('change', sync));
    sync();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      msg.className = 'inq-msg'; msg.textContent = '';
      $$('.fld.invalid', form).forEach(f => f.classList.remove('invalid'));
      const bad = $$('input,select,textarea', form).filter(f => !f.disabled && f.required && !(f.type === 'checkbox' ? f.checked : f.value.trim()));
      if (bad.length) {
        bad.forEach(f => f.closest('.fld')?.classList.add('invalid'));
        msg.classList.add('err');
        msg.textContent = bad.some(f => f.name === 'consent') && bad.length === 1 ? '개인정보 수집·이용에 동의해 주세요.' : '필수 항목(*)을 입력해 주세요.';
        bad[0].focus();
        return;
      }
      const files = $('input[type=file]', form);
      if (files && !files.disabled && files.files.length > 3) { msg.classList.add('err'); msg.textContent = '사진은 최대 3장까지 첨부할 수 있습니다.'; return; }
      if (STATIC) {
        msg.className = 'inq-msg ok';
        msg.innerHTML = '<strong>미리보기 버전이라 실제로 접수되지는 않았어요.</strong><br>운영 서버에서는 이 버튼을 누르면 관리자 “문의 관리”에 바로 들어갑니다.';
        return;
      }
      const btn = $('button[type=submit]', form);
      btn.disabled = true; const label = btn.innerHTML; btn.textContent = '전송 중…';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        form.classList.add('sent');
        msg.className = 'inq-msg ok';
        msg.innerHTML = '<strong>문의가 접수되었습니다.</strong><br>확인 후 빠르게 연락드리겠습니다. 감사합니다.';
        msg.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      } catch (err) {
        msg.classList.add('err'); msg.textContent = err.message;
      } finally { btn.disabled = false; btn.innerHTML = label; }
    });
  });

  // 보증서 인쇄
  $$('[data-print]').forEach(b => b.addEventListener('click', () => window.print()));
  // 지점 찾기: 지역 필터
  const sf = $('[data-store-filter]');
  if (sf) sf.addEventListener('click', e => {
    const b = e.target.closest('[data-region]'); if (!b) return;
    $$('[data-region]', sf).forEach(x => x.classList.toggle('on', x === b));
    $$('.store-card').forEach(c => { c.hidden = !!b.dataset.region && c.dataset.region !== b.dataset.region; });
  });
  // 정적 미리보기: 보증서 번호 조회는 브라우저에서 처리 (예시 보증서만 존재)
  const wl = $('[data-warranty-lookup]');
  if (wl && STATIC) wl.addEventListener('submit', e => {
    e.preventDefault();
    const code = wl.code.value.trim().toUpperCase();
    const known = (wl.dataset.codes || '').split(',').filter(Boolean);
    const msg = $('.inq-msg', wl);
    if (known.includes(code)) location.href = `w/${code}.html`;
    else { msg.className = 'inq-msg err'; msg.textContent = `미리보기에는 예시 보증서(${known.join(', ')})만 있어요. 운영 서버에서는 실제 발급된 번호로 조회됩니다.`; }
  });

  // 파트너십 카드 → 폼 유형 선택
  $$('[data-pick-type]').forEach(a => a.addEventListener('click', () => {
    const r = $(`#partner-inquiry input[name=type][value="${a.dataset.pickType}"]`);
    if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
  }));

  // ── 디자인 테마 전환 ──
  const dock = $('[data-theme-dock]');
  if (dock) {
    const pop = $('[data-theme-pop]', dock), tg = $('[data-theme-toggle]', dock);
    tg.addEventListener('click', () => { pop.hidden = !pop.hidden; tg.setAttribute('aria-expanded', String(!pop.hidden)); });
    document.addEventListener('click', e => { if (!dock.contains(e.target)) { pop.hidden = true; tg.setAttribute('aria-expanded', 'false'); } });
  }
  $$('[data-set-theme]').forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.setTheme;
    document.cookie = `theme=${t}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
    try { localStorage.setItem('cb-theme', t); } catch { /* 저장 불가 환경 */ }
    const u = new URL(location.href); u.searchParams.delete('theme');
    if (/\/design(\.html)?$/.test(u.pathname)) u.pathname = u.pathname.replace(/design(\.html)?$/, STATIC ? 'index.html' : '');
    if (STATIC) u.searchParams.set('theme', t);
    location.href = u.toString();
  }));

  // 디자인 비교 iframe 축소 배율
  const frames = $$('[data-scale-frame]');
  const scaleFrames = () => frames.forEach(f => { const ifr = $('iframe', f); ifr.style.transform = `scale(${f.clientWidth / 1440})`; });
  if (frames.length) { scaleFrames(); addEventListener('resize', scaleFrames); }
})();
