/* CARBLISS 관리자 — 클라이언트 */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DATA = $('#adm-data') ? JSON.parse($('#adm-data').textContent) : {};

  const toast = (msg, type = 'ok') => {
    const t = $('#toast'); t.textContent = msg; t.className = `toast show ${type}`;
    clearTimeout(t._h); t._h = setTimeout(() => { t.className = 'toast'; }, 2800);
  };
  // 정적 미리보기: 서버 대신 브라우저에서 업로드·자동 생성을 처리하고, 저장은 막음
  const STATIC = document.documentElement.dataset.static === '1';
  async function mock(url, body) {
    if (url.endsWith('/admin/api/generate')) {
      const detected = window.CB.analyzeText([body.model, body.memo, body.detail].filter(Boolean).join(' '));
      const input = { brand: body.brand || detected.brand, model: body.model || detected.model, services: body.services && body.services.length ? body.services : detected.services, region: body.region || detected.region, detail: body.detail, memo: body.memo, date: body.date, images: body.images || [] };
      return { ok: true, detected, result: window.CB.generateCase(input, DATA.settings || {}) };
    }
    if (url.endsWith('/admin/api/upload')) {
      const files = body.getAll('photos');
      const images = await Promise.all(files.map(f => new Promise(res => {
        const u = URL.createObjectURL(f); const im = new Image();
        im.onload = () => res({ src: u, thumb: u, w: im.naturalWidth, h: im.naturalHeight });
        im.onerror = () => res(null); im.src = u;
      })));
      return { ok: true, images: images.filter(Boolean), failed: [] };
    }
    if (url.includes('/polish')) throw new Error('미리보기에서는 AI 문장 다듬기가 꺼져 있어요.');
    if (url.endsWith('/admin/api/jobs') && body && body.services) {
      // 미리보기: 저장 없이 결과 화면만 보여줌 (예시 보증서로 연결)
      const add = (d, m) => { const x = new Date(d + 'T00:00:00Z'); const day = x.getUTCDate(); x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + m); const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate(); x.setUTCDate(Math.min(day, last)); return x.toISOString().slice(0, 10); };
      const reminders = (DATA.rules || []).filter(r => body.services.includes(r.service) && r.months > 0).map(r => ({ title: r.title, dueDate: add(body.date, Number(r.months)) }));
      return { ok: true, demo: true, job: { reminders }, warranty: body.issue ? { code: DATA.sampleCode || 'SAMPLE' } : null, warrantyUrl: DATA.sampleUrl || '#', qrSvg: DATA.sampleQr || '', smsText: `[카블리스] ${body.name}님, 시공이 완료되어 정품 시공 보증서가 발급되었습니다.\n보증서 확인: (발급된 보증서 링크)\n문의 ${(DATA.settings || {}).phone || ''}` };
    }
    throw new Error('미리보기 버전이라 저장되지 않아요. 실제 서버에서는 바로 반영됩니다.');
  }
  async function api(method, url, body, isForm) {
    if (STATIC) return mock(url, body);
    const res = await fetch(url, { method, headers: isForm ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' }, body: isForm ? body : body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { location.href = '/admin/login?next=' + encodeURIComponent(location.pathname); throw new Error('로그인 필요'); }
    if (!res.ok || data.ok === false) throw new Error(data.error || data.reason || '요청에 실패했습니다.');
    return data;
  }
  const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const setPath = (o, p, v) => { const ks = p.split('.'); let cur = o; ks.slice(0, -1).forEach(k => { cur[k] = cur[k] || {}; cur = cur[k]; }); cur[ks.at(-1)] = v; };

  // ── 설정 폼 ──
  $$('[data-settings-form]').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault();
    const body = {};
    $$('input,select,textarea', form).forEach(f => {
      if (!f.name) return;
      if (f.type === 'checkbox') body[f.name] = f.checked;
      else if (f.type === 'radio') { if (f.checked) body[f.name] = f.value; }
      else body[f.name] = f.value;
    });
    try { await api('PUT', '/admin/api/settings', body); toast('저장되었습니다.'); } catch (err) { toast(err.message, 'err'); }
  }));
  const pw = $('[data-password-form]');
  pw && pw.addEventListener('submit', async e => {
    e.preventDefault();
    try { await api('POST', '/admin/api/password', { current: pw.current.value, next: pw.next.value }); pw.reset(); toast('비밀번호가 변경되었습니다.'); setTimeout(() => location.reload(), 900); } catch (err) { toast(err.message, 'err'); }
  });

  // ── 사례 목록 ──
  $$('[data-toggle]').forEach(cb => cb.addEventListener('change', async () => {
    try { await api('PATCH', `/admin/api/cases/${cb.dataset.id}`, { [cb.dataset.toggle]: cb.checked }); toast(cb.dataset.toggle === 'published' ? (cb.checked ? '게시되었습니다.' : '비공개로 전환했습니다.') : (cb.checked ? '메인 대표 사례로 지정했습니다.' : '대표 사례에서 해제했습니다.')); }
    catch (err) { cb.checked = !cb.checked; toast(err.message, 'err'); }
  }));
  const fIn = $('[data-filter-input]'), fSvc = $('[data-filter-svc]'), fStore = $('[data-filter-store]');
  const filterRows = () => {
    const q = (fIn?.value || '').trim().toLowerCase(), sv = fSvc?.value || '', st = fStore?.value || '';
    $$('[data-row]').forEach(r => { r.hidden = (q && !r.dataset.text.includes(q)) || (sv && !(r.dataset.svc || '').split(' ').includes(sv)) || (st && r.dataset.store !== st); });
  };
  fIn?.addEventListener('input', filterRows); fSvc?.addEventListener('change', filterRows); fStore?.addEventListener('change', filterRows);
  // 시공 이력: 보증서 해지 · 삭제 (두 번 눌러 확인)
  const armed = new WeakMap();
  const twoStep = (btn, label) => { if (armed.get(btn)) return true; armed.set(btn, true); const t = btn.textContent; btn.textContent = label; btn.classList.add('danger'); setTimeout(() => { armed.delete(btn); btn.textContent = t; btn.classList.remove('danger'); }, 3000); return false; };
  document.addEventListener('click', async e => {
    const v = e.target.closest('[data-void-warranty]'), d = e.target.closest('[data-del-job]');
    if (v) {
      if (!twoStep(v, '한 번 더 누르면 해지')) return;
      try { await api('PATCH', `/admin/api/warranties/${v.dataset.voidWarranty}`, { status: 'void' }); toast('보증서를 해지했어요. QR로 조회하면 “해지된 보증서”로 보여요.'); setTimeout(() => location.reload(), 800); } catch (err) { toast(err.message, 'err'); }
    }
    if (d) {
      if (!twoStep(d, '한 번 더 누르면 삭제')) return;
      try { await api('DELETE', `/admin/api/jobs/${d.dataset.delJob}`); d.closest('tr').remove(); toast('시공 이력을 삭제했어요. 발급된 보증서 기록은 남아 있어요.'); } catch (err) { toast(err.message, 'err'); }
    }
  });

  // ── 사례 등록 · 수정 (자동 생성) ──
  if (DATA.mode) caseEditor();
  function caseEditor() {
    const c = DATA.case;
    const state = {
      images: c ? c.images.map(im => ({ ...im })) : [],
      result: c ? JSON.parse(JSON.stringify(c)) : null,
      beforeAfter: c?.beforeAfter || null,
    };
    if (state.images.length && c && c.cover) state.images.unshift(...state.images.splice(c.cover, 1));
    const form = {};
    $$('[data-f]').forEach(f => { form[f.name] = f; });

    form.brand.innerHTML = '<option value="">자동 감지</option>' + DATA.brands.map(b => `<option value="${b.slug}">${esc(b.ko)}</option>`).join('');
    form.region.innerHTML = DATA.regions.map(r => `<option value="${r.slug}">${esc(r.ko)}</option>`).join('');
    if (form.store) { form.store.innerHTML = (DATA.stores || []).map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join(''); form.store.value = (c && c.store) || 'hq'; }
    const fillModels = () => { $('#model-list').innerHTML = DATA.models.filter(m => !form.brand.value || m.brand === form.brand.value).map(m => `<option value="${esc(m.name)}">`).join(''); };
    form.brand.addEventListener('change', fillModels);
    const chips = $('[data-svc-chips]');
    chips.innerHTML = DATA.services.map(s => `<label class="chip"><input type="checkbox" value="${s.slug}"><span>${esc(s.ko)}</span></label>`).join('');
    const selectedSvcs = () => $$('input:checked', chips).map(i => i.value);

    if (c) {
      form.brand.value = c.brand === 'etc' ? 'etc' : c.brand; form.model.value = c.model || ''; form.region.value = c.region;
      form.date.value = c.date; form.detail.value = c.detail || ''; form.memo.value = c.memo || '';
      c.services.forEach(s => { const i = $(`input[value="${s}"]`, chips); if (i) i.checked = true; });
    } else {
      form.date.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }
    fillModels();

    // 사진
    const box = $('[data-photos]');
    const ROLES = { after: '대표 · 완성', before: '시공 전', process: '작업 과정', detail: '디테일' };
    function renderPhotos() {
      box.innerHTML = state.images.map((im, i) => `<figure class="ph-item ${i === 0 ? 'cover' : ''}" data-i="${i}">
        <img src="${esc(im.thumb || im.src)}" alt="">
        ${i === 0 ? '<span class="badge">대표</span>' : ''}
        <figcaption>
          <select data-role>${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${im.role === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <span class="ph-btns"><button type="button" data-mv="-1" title="앞으로">◀</button><button type="button" data-mv="1" title="뒤로">▶</button><button type="button" data-cover title="대표로">★</button><button type="button" data-rm title="삭제">✕</button></span>
        </figcaption></figure>`).join('');
      renderBA(); renderWhere();
    }
    box.addEventListener('change', e => { const f = e.target.closest('[data-i]'); if (e.target.matches('[data-role]')) state.images[+f.dataset.i].role = e.target.value; });
    box.addEventListener('click', e => {
      const f = e.target.closest('[data-i]'); if (!f) return; const i = +f.dataset.i;
      if (e.target.matches('[data-mv]')) { const j = i + +e.target.dataset.mv; if (j < 0 || j >= state.images.length) return; [state.images[i], state.images[j]] = [state.images[j], state.images[i]]; }
      else if (e.target.matches('[data-cover]')) state.images.unshift(...state.images.splice(i, 1));
      else if (e.target.matches('[data-rm]')) state.images.splice(i, 1);
      else return;
      renderPhotos();
    });
    async function upload(files) {
      const list = [...files].filter(f => f.type.startsWith('image/'));
      if (!list.length) return;
      const drop = $('[data-drop]'); drop.classList.add('busy');
      try {
        for (let i = 0; i < list.length; i += 8) { // 8장씩 나눠서 업로드
          const fd = new FormData(); list.slice(i, i + 8).forEach(f => fd.append('photos', f));
          $('b', drop).textContent = `업로드 중… (${Math.min(i + 8, list.length)}/${list.length})`;
          const r = await api('POST', '/admin/api/upload', fd, true);
          r.images.forEach(im => state.images.push({ ...im, role: state.images.length ? 'process' : 'after' }));
          if (r.failed.length) toast(`변환하지 못한 사진: ${r.failed.join(', ')} (JPG로 바꿔 다시 올려 주세요)`, 'err');
          renderPhotos();
        }
        toast(`사진 ${list.length}장을 올렸습니다.`);
      } catch (err) { toast(err.message, 'err'); }
      finally { drop.classList.remove('busy'); $('b', drop).textContent = '사진을 끌어다 놓거나 클릭해서 선택'; $('[data-file]').value = ''; }
    }
    $('[data-file]').addEventListener('change', e => upload(e.target.files));
    const drop = $('[data-drop]');
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => upload(e.dataTransfer.files));

    // 결과 바인딩
    const resultBox = $('[data-result]');
    function fillResult() {
      const r = state.result; if (!r) return;
      $('[data-placeholder]').hidden = true; resultBox.hidden = false;
      $$('[data-r]', resultBox).forEach(el => {
        let v = getPath(r, el.dataset.r);
        if (el.dataset.r === 'seo.keywords') v = (v || []).join(', ');
        if (el.type === 'checkbox') el.checked = el.dataset.r === 'published' ? v !== false : !!v;
        else el.value = v ?? '';
      });
      renderSections(); renderWhere(); renderSerp(); counters();
    }
    function readResult() {
      $$('[data-r]', resultBox).forEach(el => {
        let v = el.type === 'checkbox' ? el.checked : el.value;
        if (el.dataset.r === 'seo.keywords') v = v.split(',').map(x => x.trim()).filter(Boolean);
        setPath(state.result, el.dataset.r, v);
      });
      state.result.sections = $$('.sec-item', resultBox).map(it => ({ h: $('input', it).value, p: $('textarea', it).value }));
    }
    function renderSections() {
      const wrap = $('[data-sections]');
      wrap.innerHTML = (state.result.sections || []).map(s => `<div class="sec-item"><input value="${esc(s.h)}" placeholder="소제목"><textarea rows="4" placeholder="내용">${esc(s.p)}</textarea><button type="button" class="b sm ghost" data-rm-sec>단락 삭제</button></div>`).join('');
    }
    $('[data-sections]').addEventListener('click', e => { if (e.target.matches('[data-rm-sec]')) { readResult(); e.target.closest('.sec-item').remove(); readResult(); } });
    $('[data-add-section]').addEventListener('click', () => { readResult(); state.result.sections.push({ h: '', p: '' }); renderSections(); });
    resultBox.addEventListener('input', () => { if (state.result) { readResult(); renderSerp(); counters(); } });

    function renderWhere() {
      const el = $('[data-where]'); if (!el) return;
      const svcs = selectedSvcs(); const brand = form.brand.value; const region = form.region.value;
      const svcName = s => (DATA.services.find(x => x.slug === s) || {}).ko || s;
      const brandKo = (DATA.brands.find(b => b.slug === brand) || {}).ko;
      const core = ['ppf', 'wrapping', 'tinting', 'seatbelt', 'leather-restoration', 'leather-coloring'];
      const links = [
        ['포트폴리오 전체', '/portfolio'],
        ...svcs.map(s => [`${svcName(s)} 사례 목록`, `/portfolio?service=${s}`]),
        ...(brand && brand !== 'etc' ? [[`${brandKo} 차량 페이지`, `/cars/${brand}`]] : []),
        ...svcs.filter(s => core.includes(s)).map(s => [`${svcName(s)} 서비스 페이지`, `/services/${s}#cases`]),
        ...svcs.filter(s => core.includes(s)).slice(0, 1).map(s => [`지역 페이지 (${(DATA.regions.find(r => r.slug === region) || {}).ko} ${svcName(s)})`, `/local/${region}/${s}`]),
      ];
      el.innerHTML = `<b>${icon()} 저장하면 자동으로 노출되는 곳</b><div>${links.map(([l, h]) => `<a href="${h}" target="_blank">${esc(l)}</a>`).join('')}</div><small>사진 ${state.images.length}장 · 이미지 대체텍스트 자동 작성</small>`;
    }
    function icon() { return '✦'; }
    chips.addEventListener('change', renderWhere); form.brand.addEventListener('change', renderWhere); form.region.addEventListener('change', renderWhere);

    function renderSerp() {
      const r = state.result; const el = $('[data-serp]'); if (!r || !el) return;
      el.innerHTML = `<p class="serp-l">검색 결과 미리보기</p><div class="serp-card"><small>carbliss › portfolio › ${esc(r.slug || '')}</small><b>${esc(r.seo?.title || r.title || '')}</b><p>${esc(r.seo?.description || '')}</p></div>`;
    }
    function counters() {
      $$('[data-count-for]').forEach(el => { const v = getPath(state.result || {}, el.dataset.countFor) || ''; const max = +el.dataset.max; el.textContent = `${v.length} / ${max}자`; el.className = v.length > max ? 'over' : ''; });
    }
    function renderBA() {
      const el = $('[data-ba-pick]'); if (!el) return;
      if (state.images.length < 2) { el.innerHTML = ''; return; }
      const opts = sel => '<option value="">선택 안 함</option>' + state.images.map((im, i) => `<option value="${esc(im.src)}" ${sel === im.src ? 'selected' : ''}>사진 ${i + 1}${im.role === 'before' ? ' (시공 전)' : im.role === 'after' ? ' (완성)' : ''}</option>`).join('');
      const ba = state.beforeAfter || {};
      el.innerHTML = `<p class="lbl">전후 비교 슬라이더 <small>(같은 구도의 사진 2장을 고르면 상세 페이지에 비교 슬라이더가 생깁니다)</small></p><div class="ba-sel"><label>시공 전 <select data-ba="before">${opts(ba.before)}</select></label><label>시공 후 <select data-ba="after">${opts(ba.after)}</select></label></div>`;
    }
    $('[data-ba-pick]').addEventListener('change', e => { if (e.target.dataset.ba) { state.beforeAfter = state.beforeAfter || {}; state.beforeAfter[e.target.dataset.ba] = e.target.value; } });

    // 탭
    $$('[data-tab]').forEach(t => t.addEventListener('click', () => {
      $$('[data-tab]').forEach(x => x.classList.toggle('on', x === t));
      $$('[data-pane]').forEach(p => p.classList.toggle('on', p.dataset.pane === t.dataset.tab));
    }));
    // 복사
    $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      readResult();
      const v = getPath(state.result, b.dataset.copy) || '';
      try { await navigator.clipboard.writeText(v); toast('복사했습니다. 블로그·SNS에 붙여 넣으세요.'); } catch { toast('복사하지 못했습니다. 직접 선택해 복사해 주세요.', 'err'); }
    }));

    const fields = () => ({ brand: form.brand.value, model: form.model.value.trim(), services: selectedSvcs(), region: form.region.value, date: form.date.value, detail: form.detail.value.trim(), memo: form.memo.value.trim(), store: form.store ? form.store.value : (DATA.myStore || 'hq') });

    // 자동 생성
    $('[data-generate]').addEventListener('click', async () => {
      const f = fields();
      if (!f.model && !f.memo && !f.services.length) { toast('차종이나 시공 종류, 설명 중 하나는 입력해 주세요.', 'err'); return; }
      const btn = $('[data-generate]'); btn.disabled = true; btn.classList.add('busy');
      try {
        const r = await api('POST', '/admin/api/generate', { ...f, images: state.images });
        const d = r.detected; const notes = [];
        if (!f.brand && d.brand && d.brand !== 'etc') { form.brand.value = d.brand; notes.push('브랜드'); fillModels(); }
        if (!f.model && d.model) { form.model.value = d.model; notes.push('차종'); }
        if (!f.services.length && d.services.length) { d.services.forEach(s => { const i = $(`input[value="${s}"]`, chips); if (i) i.checked = true; }); notes.push('시공 종류'); }
        const keep = state.result ? { published: state.result.published, featured: state.result.featured } : { published: true, featured: false };
        state.result = { ...r.result, ...keep };
        // 사진 대체텍스트 반영
        state.images = r.result.images.length ? r.result.images : state.images;
        fillResult(); renderPhotos();
        toast(notes.length ? `생성 완료 · 자동 감지: ${notes.join(' · ')}` : '생성 완료! 결과를 확인하고 필요하면 수정하세요.');
        if (innerWidth < 1100) resultBox.scrollIntoView({ behavior: 'smooth' });
      } catch (err) { toast(err.message, 'err'); }
      finally { btn.disabled = false; btn.classList.remove('busy'); }
    });

    // AI 다듬기
    const pol = $('[data-polish]');
    pol && pol.addEventListener('click', async () => {
      if (!state.result) { toast('먼저 자동 생성을 눌러 주세요.', 'err'); return; }
      readResult();
      pol.disabled = true; pol.classList.add('busy'); const label = pol.innerHTML; pol.textContent = 'AI가 문장을 다듬는 중… (30초 정도)';
      try {
        const payload = { ...state.result, ...fields(), images: state.images, brandKo: (DATA.brands.find(b => b.slug === form.brand.value) || {}).ko, regionKo: (DATA.regions.find(r => r.slug === form.region.value) || {}).ko, serviceNames: selectedSvcs().map(s => (DATA.services.find(x => x.slug === s) || {}).ko) };
        const r = await api('POST', '/admin/api/polish', { result: payload });
        const p = r.result;
        Object.assign(state.result, { title: p.title, summary: p.summary, sections: p.sections });
        state.result.seo = { ...state.result.seo, title: p.seoTitle, description: p.seoDescription };
        state.result.drafts = { ...state.result.drafts, blog: p.blog, instagram: p.instagram, kakao: p.kakao };
        fillResult(); toast('AI가 문장을 다듬었습니다. 내용을 확인해 주세요.');
      } catch (err) { toast(err.message, 'err'); }
      finally { pol.disabled = false; pol.classList.remove('busy'); pol.innerHTML = label; }
    });

    // 저장
    $('[data-save]').addEventListener('click', async () => {
      if (!state.result) { toast('먼저 자동 생성을 눌러 주세요.', 'err'); return; }
      readResult();
      const f = fields();
      if (!state.images.length) { toast('사진을 1장 이상 올려 주세요.', 'err'); return; }
      if (!f.services.length) { toast('시공 종류를 선택해 주세요.', 'err'); return; }
      const ba = state.beforeAfter && state.beforeAfter.before && state.beforeAfter.after ? state.beforeAfter : null;
      const payload = { ...state.result, ...f, brand: f.brand || 'etc', images: state.images, cover: 0, beforeAfter: ba, highlights: state.result.highlights };
      const btn = $('[data-save]'); btn.disabled = true;
      try {
        const r = DATA.mode === 'new' ? await api('POST', '/admin/api/cases', payload) : await api('PUT', `/admin/api/cases/${c.id}`, payload);
        toast(r.case.published ? '저장 · 게시되었습니다!' : '비공개로 저장되었습니다.');
        setTimeout(() => { location.href = `/admin/cases/${r.case.id}?saved=1`; }, 700);
      } catch (err) { toast(err.message, 'err'); btn.disabled = false; }
    });
    const del = $('[data-delete-case]');
    del && del.addEventListener('click', async () => {
      if (!confirm('이 시공 사례를 삭제할까요? 홈페이지에서 바로 사라집니다.')) return;
      try { await api('DELETE', `/admin/api/cases/${c.id}`); location.href = '/admin/cases'; } catch (err) { toast(err.message, 'err'); }
    });

    renderPhotos();
    if (state.result) fillResult();
    if (new URLSearchParams(location.search).get('saved')) toast('저장되었습니다. “페이지 보기”로 확인해 보세요.');
  }

  // ── 문의 관리 ──
  if (DATA.list && DATA.status) inquiriesUI();
  function inquiriesUI() {
    const rows = $('[data-inq-rows]'), detail = $('[data-inq-detail]');
    const params = new URLSearchParams(location.search);
    const f = { type: '', status: params.get('status') || '', q: '' };
    $('[data-status-filter]').value = f.status;
    const LABEL = { car: '차량 모델', service: '관심 시공', date: '희망 날짜', track: '희망 교육 분야', level: '경험 수준', schedule: '희망 일정', startup: '창업 상담 희망', area: '희망 지역', bizType: '창업 유형', hasStore: '기존 매장', budget: '예산 범위', company: '업체명', interest: '관심 분야', partnerArea: '지역', fields: '운영 시공 분야', message: '문의 내용' };
    const dt = s => { const d = new Date(s); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
    function render() {
      const list = DATA.list.filter(q => (!f.type || q.type === f.type) && (!f.status || q.status === f.status) && (!f.q || JSON.stringify(q).toLowerCase().includes(f.q)));
      rows.innerHTML = list.map(q => `<tr data-id="${q.id}" class="${detail.dataset.id === q.id ? 'sel' : ''}"><td><span class="st st-${q.status}">${DATA.status[q.status]}</span></td><td>${esc(DATA.types[q.type].ko)}</td><td><b>${esc(q.name)}</b><br><small>${esc(q.phone)}</small></td><td><small>${esc(Object.values(q.fields || {}).slice(0, 3).join(' · ')).slice(0, 80)}</small></td><td><small>${dt(q.createdAt)}</small></td></tr>`).join('');
      $('[data-inq-empty]').hidden = list.length > 0;
    }
    function open(id) {
      const q = DATA.list.find(x => x.id === id); if (!q) return;
      detail.dataset.id = id; detail.hidden = false;
      detail.innerHTML = `<div class="card-h"><h2>${esc(q.name)} <small>${esc(DATA.types[q.type].ko)}</small></h2><button type="button" class="b sm ghost" data-close>닫기</button></div>
        <a class="tel" href="tel:${esc(q.phone.replace(/[^0-9+]/g, ''))}">📞 ${esc(q.phone)}</a>
        <dl>${Object.entries(q.fields || {}).map(([k, v]) => `<div><dt>${esc(LABEL[k] || k)}</dt><dd>${esc(v)}</dd></div>`).join('')}<div><dt>접수</dt><dd>${new Date(q.createdAt).toLocaleString('ko-KR')}</dd></div></dl>
        ${q.files && q.files.length ? `<div class="inq-photos">${q.files.map(fl => `<a href="/admin/files/${q.id}/${fl}" target="_blank"><img src="/admin/files/${q.id}/${fl}" alt="첨부 사진"></a>`).join('')}</div>` : ''}
        ${(DATA.stores || []).length > 1 ? `<label><span>담당 지점</span><select data-store-pick ${DATA.role === 'store' ? 'disabled' : ''}>${DATA.stores.map(s => `<option value="${esc(s.id)}" ${(q.store || 'hq') === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>` : ''}
        <label><span>상태</span><select data-st>${Object.entries(DATA.status).map(([k, v]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label><span>상담 메모</span><textarea rows="4" data-memo placeholder="통화 내용, 견적, 예약 일정 등">${esc(q.memo || '')}</textarea></label>
        <div class="form-foot"><button type="button" class="b danger sm" data-del>삭제</button><button type="button" class="b primary" data-save-inq>저장</button></div>
        <ol class="hist">${(q.history || []).map(h => `<li>${new Date(h.at).toLocaleString('ko-KR')} · ${DATA.status[h.status]}</li>`).join('')}</ol>`;
      render();
    }
    rows.addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) open(tr.dataset.id); });
    detail.addEventListener('click', async e => {
      const id = detail.dataset.id; const q = DATA.list.find(x => x.id === id);
      if (e.target.matches('[data-close]')) { detail.hidden = true; delete detail.dataset.id; render(); }
      if (e.target.matches('[data-save-inq]')) {
        const pick = $('[data-store-pick]', detail);
        try { const r = await api('PATCH', `/admin/api/inquiries/${id}`, { status: $('[data-st]', detail).value, memo: $('[data-memo]', detail).value, ...(pick && !pick.disabled ? { store: pick.value } : {}) }); Object.assign(q, r.inquiry); open(id); toast('저장되었습니다.'); } catch (err) { toast(err.message, 'err'); }
      }
      if (e.target.matches('[data-del]')) {
        if (!confirm('이 문의를 삭제할까요? 첨부 사진도 함께 삭제됩니다.')) return;
        try { await api('DELETE', `/admin/api/inquiries/${id}`); DATA.list = DATA.list.filter(x => x.id !== id); detail.hidden = true; render(); toast('삭제했습니다.'); } catch (err) { toast(err.message, 'err'); }
      }
    });
    $$('[data-type-filter] button').forEach(b => b.addEventListener('click', () => { $$('[data-type-filter] button').forEach(x => x.classList.toggle('on', x === b)); f.type = b.dataset.v; render(); }));
    $('[data-status-filter]').addEventListener('change', e => { f.status = e.target.value; render(); });
    $('[data-q]').addEventListener('input', e => { f.q = e.target.value.trim().toLowerCase(); render(); });
    render();
    if (DATA.list[0] && innerWidth > 1100) open(DATA.list[0].id);
  }

  // ── 교육 일정 ──
  if (DATA.courses) {
    const box = $('[data-courses]');
    const renderC = () => {
      box.innerHTML = DATA.courses.length ? DATA.courses.map((c, i) => `<div class="course" data-i="${i}">
        <label class="wide"><span>과정명</span><input data-k="title" value="${esc(c.title)}" placeholder="예) PPF 시공 입문 과정 3기"></label>
        <label><span>시작일</span><input type="date" data-k="startDate" value="${esc(c.startDate)}"></label>
        <label><span>종료일</span><input type="date" data-k="endDate" value="${esc(c.endDate)}"></label>
        <label><span>상태</span><input data-k="status" value="${esc(c.status)}" placeholder="모집 중 / 마감"></label>
        <label><span>정원</span><input data-k="capacity" value="${esc(c.capacity)}" placeholder="예) 4명"></label>
        <label class="wide"><span>설명</span><textarea data-k="description" rows="2">${esc(c.description)}</textarea></label>
        <button type="button" class="b sm ghost" data-rm-course>삭제</button></div>`).join('') : '<p class="none">등록된 일정이 없습니다. 홈페이지에는 “상담 시 안내”로 표시됩니다.</p>';
    };
    box.addEventListener('input', e => { const k = e.target.dataset.k; if (k) DATA.courses[+e.target.closest('[data-i]').dataset.i][k] = e.target.value; });
    box.addEventListener('click', e => { if (e.target.matches('[data-rm-course]')) { DATA.courses.splice(+e.target.closest('[data-i]').dataset.i, 1); renderC(); } });
    $('[data-add-course]').addEventListener('click', () => { DATA.courses.push({ title: '', startDate: '', endDate: '', status: '모집 중', capacity: '', description: '' }); renderC(); });
    $('[data-save-courses]').addEventListener('click', async () => { try { const r = await api('PUT', '/admin/api/courses', { courses: DATA.courses }); DATA.courses = r.courses; renderC(); toast('교육 일정을 저장했습니다.'); } catch (err) { toast(err.message, 'err'); } });
    renderC();
  }

  // ── 새 시공 등록 · 보증서 발급 ──
  const jf = $('[data-job-form]');
  if (jf) jobForm(jf);
  function jobForm(f) {
    const P = DATA.prefill || {};
    const svcName = s => (DATA.services.find(x => x.slug === s) || {}).ko || s;
    f.carBrand.innerHTML = '<option value="etc">선택 안 함</option>' + DATA.brands.filter(b => b.slug !== 'etc').map(b => `<option value="${b.slug}">${esc(b.ko)}</option>`).join('');
    if (f.store) f.store.innerHTML = DATA.stores.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
    const chips = $('[data-job-svcs]', f);
    chips.innerHTML = DATA.services.map(s => `<label class="chip"><input type="checkbox" value="${s.slug}"><span>${esc(s.ko)}</span></label>`).join('');
    const svcs = () => $$('input:checked', chips).map(i => i.value);
    const models = () => { $('#job-models').innerHTML = DATA.models.filter(m => f.carBrand.value === 'etc' || m.brand === f.carBrand.value).map(m => `<option value="${esc(m.name)}">`).join(''); };
    // 기본값 · 사례에서 넘어온 값
    f.date.value = P.date || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    f.carBrand.value = P.carBrand || 'etc'; f.carModel.value = P.carModel || '';
    if (f.store) f.store.value = P.store || 'hq';
    (P.services || []).forEach(s => { const i = $(`input[value="${s}"]`, chips); if (i) i.checked = true; });
    f.months.value = DATA.months ?? 12; f.terms.value = DATA.terms || '';
    if (P.product) f.product.value = P.product;
    models(); f.carBrand.addEventListener('change', models);
    // 재방문 알림 미리보기
    const addM = (d, m) => { const x = new Date(d + 'T00:00:00Z'); const day = x.getUTCDate(); x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + m); const last = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate(); x.setUTCDate(Math.min(day, last)); return x.toISOString().slice(0, 10); };
    const preview = () => {
      const list = (DATA.rules || []).filter(r => svcs().includes(r.service) && Number(r.months) > 0);
      $('[data-rem-preview]').innerHTML = list.length ? list.map(r => `<li><b>${esc(r.title)}</b><span>${addM(f.date.value, Number(r.months))} · ${esc(svcName(r.service))} ${r.months}개월 후</span></li>`).join('') : '<li class="hint">이 시공 종류에는 알림 규칙이 없어요 (설정에서 추가 가능)</li>';
    };
    chips.addEventListener('change', preview); f.date.addEventListener('change', preview); preview();
    f.issue.addEventListener('change', () => { $('[data-warranty-fields]').style.opacity = f.issue.checked ? 1 : .4; });
    // 기존 고객 찾기
    f.phone.addEventListener('blur', async () => {
      const hint = $('[data-customer-hint]'); const p = f.phone.value.replace(/[^0-9]/g, '');
      if (p.length < 9 || STATIC) { hint.textContent = ''; return; }
      try {
        const r = await api('GET', `/admin/api/customers/lookup?phone=${p}`);
        if (r.customer) { hint.textContent = `기존 고객이에요: ${r.customer.name} · 시공 ${r.jobs}회${r.customer.consent ? ' · 문자 수신 동의' : ''}`; if (!f.name.value) f.name.value = r.customer.name; if (r.customer.consent) f.consent.checked = true; }
        else hint.textContent = '새 고객으로 등록돼요.';
      } catch { hint.textContent = ''; }
    });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const body = { name: f.name.value.trim(), phone: f.phone.value.trim(), consent: f.consent.checked, carBrand: f.carBrand.value, carModel: f.carModel.value.trim(), plate: f.plate.value.trim(), date: f.date.value, services: svcs(), store: f.store ? f.store.value : DATA.myStore, memo: f.memo.value.trim(), caseId: P.caseId || '', issue: f.issue.checked, product: f.product.value.trim(), parts: f.parts.value.trim(), months: Number(f.months.value || 0), terms: f.terms.value.trim() };
      if (!body.name || body.phone.replace(/[^0-9]/g, '').length < 9) { toast('고객 이름과 연락처를 입력해 주세요.', 'err'); return; }
      if (!body.services.length) { toast('시공 종류를 1개 이상 골라 주세요.', 'err'); return; }
      const btn = $('[data-save-job]'); btn.disabled = true;
      try {
        const r = await api('POST', '/admin/api/jobs', body);
        const box = $('[data-job-result]'); box.hidden = false;
        box.innerHTML = `<div class="card-h"><h2>${icon('✓')}등록 완료</h2></div>
          ${r.warranty ? `<div class="w-result"><div class="w-qr">${r.qrSvg || ''}</div><div><p class="crumb">보증서 번호</p><b class="w-code">${esc(r.warranty.code)}</b><p><a href="${esc(r.warrantyUrl)}" target="_blank">보증서 열기 →</a></p></div></div>` : ''}
          <p class="lbl">고객에게 보낼 문자</p><textarea rows="4" class="mono" data-sms>${esc(r.smsText)}</textarea>
          <div class="form-foot"><a class="b" href="sms:${esc(body.phone.replace(/[^0-9]/g, ''))}?&body=${encodeURIComponent(r.smsText)}">문자 보내기</a><button type="button" class="b" data-copy-sms>복사</button><a class="b primary" href="${STATIC ? "jobs.html" : "/admin/jobs"}">목록으로</a></div>
          ${r.warn ? `<p class="warn">${esc(r.warn)}</p>` : ''}${r.demo ? '<p class="warn demo">미리보기라 실제로 저장·발급되지 않았어요. 위 링크는 예시 보증서예요.</p>' : ''}
          <p class="hint">재방문 알림 ${r.job.reminders.length}건이 예약됐어요. ${r.job.reminders.map(x => `${esc(x.title)} ${x.dueDate}`).join(' · ')}</p>`;
        $('[data-copy-sms]', box).addEventListener('click', async () => { try { await navigator.clipboard.writeText($('[data-sms]', box).value); toast('복사했어요.'); } catch { toast('직접 선택해서 복사해 주세요.', 'err'); } });
        box.scrollIntoView({ behavior: 'smooth' });
        toast('시공 이력이 저장되고 보증서가 발급됐어요.');
      } catch (err) { toast(err.message, 'err'); }
      finally { btn.disabled = false; }
    });
    function icon(t) { return `<span class="ok-dot">${t}</span>`; }
  }

  // ── 재방문 알림 ──
  if (DATA.items && $('[data-rem-list]')) remindersUI();
  function remindersUI() {
    const list = $('[data-rem-list]'), empty = $('[data-rem-empty]');
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 7 * 864e5 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const st = { tab: 'due', store: '' };
    const dd = d => { const n = Math.round((new Date(d) - new Date(today)) / 864e5); return n === 0 ? '오늘' : n > 0 ? `D-${n}` : `${-n}일 지남`; };
    function render() {
      const items = DATA.items.filter(it => (!st.store || it.store === st.store) && (
        st.tab === 'due' ? it.status === 'pending' && it.dueDate <= soon :
        st.tab === 'upcoming' ? it.status === 'pending' && it.dueDate > soon : it.status !== 'pending'));
      empty.hidden = items.length > 0;
      list.innerHTML = items.map(it => `<article class="rem ${it.dueDate < today && it.status === 'pending' ? 'late' : ''}" data-key="${esc(it.jobId)}|${esc(it.remId)}">
        <div class="rem-h"><span class="rem-due">${it.status === 'pending' ? dd(it.dueDate) : (it.status === 'sent' ? '보냄' : '건너뜀')}</span><b>${esc(it.title)}</b><small>${esc(it.dueDate)}</small></div>
        <p class="rem-who"><b>${esc(it.customer.name)}</b> · ${esc(it.customer.phoneFmt)} ${it.customer.consent ? '<span class="tag ok">수신 동의</span>' : '<span class="tag no">수신 동의 없음</span>'}</p>
        <p class="rem-car">${esc(it.car)} · ${esc(it.servicesKo)} · ${esc(it.jobDate)} 시공${it.storeName ? ` · ${esc(it.storeName)}` : ''}</p>
        ${it.status === 'pending' ? `<textarea rows="3" class="mono" data-msg>${esc(it.message)}</textarea>
        <div class="form-foot">${it.customer.consent ? `<a class="b primary sm" data-sms-link href="sms:${esc(it.customer.phone)}?&body=${encodeURIComponent(it.message)}">문자 보내기</a><button type="button" class="b sm" data-copy>복사</button>` : ''}<button type="button" class="b sm" data-mark="sent">보냄 처리</button><button type="button" class="b sm ghost" data-mark="skipped">건너뛰기</button></div>` : `<p class="hint">${it.sentAt ? `처리: ${esc(it.sentAt.slice(0, 10))}` : ''}</p>`}
      </article>`).join('');
    }
    list.addEventListener('input', e => { if (e.target.matches('[data-msg]')) { const a = $('[data-sms-link]', e.target.closest('.rem')); const [jid, rid] = e.target.closest('.rem').dataset.key.split('|'); const it = DATA.items.find(x => x.jobId === jid && x.remId === rid); if (a && it) a.href = `sms:${it.customer.phone}?&body=${encodeURIComponent(e.target.value)}`; } });
    list.addEventListener('click', async e => {
      const card = e.target.closest('.rem'); if (!card) return;
      const [jid, rid] = card.dataset.key.split('|'); const it = DATA.items.find(x => x.jobId === jid && x.remId === rid);
      if (e.target.matches('[data-copy]')) { try { await navigator.clipboard.writeText($('[data-msg]', card).value); toast('복사했어요.'); } catch { toast('직접 선택해서 복사해 주세요.', 'err'); } }
      if (e.target.matches('[data-mark]')) {
        try { await api('PATCH', `/admin/api/reminders/${jid}/${rid}`, { status: e.target.dataset.mark }); it.status = e.target.dataset.mark; it.sentAt = new Date().toISOString(); render(); toast(it.status === 'sent' ? '보냄으로 표시했어요.' : '건너뛰었어요.'); } catch (err) { toast(err.message, 'err'); }
      }
    });
    $$('[data-rem-tab] button').forEach(b => b.addEventListener('click', () => { $$('[data-rem-tab] button').forEach(x => x.classList.toggle('on', x === b)); st.tab = b.dataset.v; render(); }));
    $('[data-rem-store]')?.addEventListener('change', e => { st.store = e.target.value; render(); });
    render();
  }

  // ── 지점 관리 ──
  if (DATA.stores && $('[data-store-list]')) storesUI();
  function storesUI() {
    const listEl = $('[data-store-list]'), ed = $('[data-store-editor]');
    const svcKo = s => (DATA.services.find(x => x.slug === s) || {}).ko || s;
    const renderList = () => {
      listEl.innerHTML = DATA.stores.map(s => `<article class="card store-row">
        <div><p class="crumb">${esc((DATA.types[s.type] || {}).ko || '')} · ${esc(DATA.status[s.status] || '')}</p><h2>${esc(s.name)}</h2>
        <p class="hint">${esc(s.address || '주소 미입력')} ${s.phone ? '· ' + esc(s.phone) : ''}</p>
        <p class="hint">사례 ${DATA.counts[s.id] || 0}건 · ${(s.services || []).map(svcKo).join(' · ') || '제공 서비스 미입력'} · ${s.hasPassword ? '지점 계정 있음' : (s.id === 'hq' ? '본사 계정으로 관리' : '지점 계정 없음')}</p></div>
        <div class="ph-actions"><a class="b sm" href="${STATIC ? (s.demo ? "../stores.html" : "../stores/" + encodeURIComponent(s.slug) + ".html") : "/stores/" + encodeURIComponent(s.slug)}" target="_blank">페이지 보기</a><button type="button" class="b sm" data-edit-store="${esc(s.id)}">수정</button></div>
      </article>`).join('');
    };
    const field = (name, label, val = '', opts = '') => `<label class="${opts.includes('wide') ? 'wide' : ''}"><span>${label}</span><input name="${name}" value="${esc(val ?? '')}" ${opts.includes('pw') ? 'type="password" autocomplete="new-password"' : ''}></label>`;
    const open = s => {
      const isNew = !s; s = s || { type: 'franchise', status: 'soon', region: 'gimhae', services: [] };
      ed.hidden = false;
      ed.innerHTML = `<div class="card-h"><h2>${isNew ? '새 지점' : esc(s.name) + ' 수정'}</h2>${!isNew && s.id !== 'hq' ? '<button type="button" class="b sm danger" data-del-store>지점 삭제</button>' : ''}</div>
        <form class="fgrid" data-store-form>
          ${field('name', '지점 이름 *', s.name)}
          <label><span>유형</span><select name="type" ${s.id === 'hq' ? 'disabled' : ''}>${Object.entries(DATA.types).map(([k, v]) => `<option value="${k}" ${s.type === k ? 'selected' : ''}>${esc(v.ko)}</option>`).join('')}</select></label>
          <label><span>상태</span><select name="status">${Object.entries(DATA.status).filter(([k]) => s.id !== 'hq' || k !== 'hidden').map(([k, v]) => `<option value="${k}" ${s.status === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
          <label><span>지역</span><select name="region">${DATA.regions.map(r => `<option value="${r.slug}" ${s.region === r.slug ? 'selected' : ''}>${esc(r.ko)}</option>`).join('')}</select></label>
          ${field('address', '주소', s.address, 'wide')}${field('phone', '전화', s.phone)}${field('hours', '운영 시간', s.hours)}
          <label class="wide"><span>지점 소개</span><textarea name="intro" rows="2">${esc(s.intro || '')}</textarea></label>
          <div class="wide"><span class="lbl">제공 서비스</span><div class="chips">${DATA.services.map(x => `<label class="chip"><input type="checkbox" name="svc" value="${x.slug}" ${(s.services || []).includes(x.slug) ? 'checked' : ''}><span>${esc(x.ko)}</span></label>`).join('')}</div></div>
          ${field('bookingUrl', '예약 링크', s.bookingUrl, 'wide')}${field('mapUrl', '지도 링크', s.mapUrl, 'wide')}${field('kakaoUrl', '카카오톡 채널', s.kakaoUrl, 'wide')}
          ${field('slug', '페이지 주소 (/stores/…)', s.slug)}
          ${s.id === 'hq' ? '' : field('password', s.hasPassword ? '지점 비밀번호 바꾸기 (8자 이상, 비우면 유지)' : '지점 관리자 비밀번호 (8자 이상)', '', 'pw')}
          <div class="form-foot wide"><button type="button" class="b" data-cancel>취소</button><button class="b primary" type="submit">${isNew ? '지점 추가' : '저장'}</button></div>
        </form>`;
      ed.scrollIntoView({ behavior: 'smooth' });
      const form = $('[data-store-form]', ed);
      $('[data-cancel]', ed).addEventListener('click', () => { ed.hidden = true; });
      $('[data-del-store]', ed)?.addEventListener('click', async ev => {
        if (!twoStep(ev.target, '한 번 더 누르면 삭제')) return;
        try { await api('DELETE', `/admin/api/stores/${s.id}`); DATA.stores = DATA.stores.filter(x => x.id !== s.id); ed.hidden = true; renderList(); toast('지점을 삭제했어요. 그 지점 사례는 본점 소속으로 옮겨졌어요.'); } catch (err) { toast(err.message, 'err'); }
      });
      form.addEventListener('submit', async ev => {
        ev.preventDefault();
        const b = {}; ['name', 'type', 'status', 'region', 'address', 'phone', 'hours', 'intro', 'bookingUrl', 'mapUrl', 'kakaoUrl', 'slug', 'password'].forEach(k => { if (form[k] && !form[k].disabled) b[k] = form[k].value.trim(); });
        b.services = $$('input[name=svc]:checked', form).map(i => i.value);
        if (!b.name) { toast('지점 이름을 입력해 주세요.', 'err'); return; }
        if (b.password && b.password.length < 8) { toast('비밀번호는 8자 이상이에요.', 'err'); return; }
        try {
          const r = isNew ? await api('POST', '/admin/api/stores', b) : await api('PUT', `/admin/api/stores/${s.id}`, b);
          if (isNew) DATA.stores.push(r.store); else DATA.stores = DATA.stores.map(x => x.id === s.id ? r.store : x);
          ed.hidden = true; renderList(); toast(isNew ? '지점을 추가했어요.' : '저장했어요.');
        } catch (err) { toast(err.message, 'err'); }
      });
    };
    listEl.addEventListener('click', e => { const b = e.target.closest('[data-edit-store]'); if (b) open(DATA.stores.find(s => s.id === b.dataset.editStore)); });
    $('[data-new-store]').addEventListener('click', () => open(null));
    renderList();
  }

  // ── 설정: 재방문 알림 규칙 ──
  if (DATA.rules && $('[data-rules]')) {
    const box = $('[data-rules]');
    const byService = Object.fromEntries((DATA.rules || []).map(r => [r.service, r]));
    box.innerHTML = DATA.services.map(sv => { const r = byService[sv.slug] || {}; return `<div class="rule" data-svc="${sv.slug}"><b>${esc(sv.ko)}</b><label>시공 후 <input type="number" min="0" max="120" value="${esc(r.months ?? '')}" data-m> 개월</label><input placeholder="안내 제목 예) PPF 정기 점검" value="${esc(r.title || '')}" data-t></div>`; }).join('');
    $('[data-save-rules]').addEventListener('click', async () => {
      const rules = $$('.rule', box).map(el => ({ service: el.dataset.svc, months: Number($('[data-m]', el).value || 0), title: $('[data-t]', el).value.trim() })).filter(r => r.months > 0 && r.title);
      try { await api('PUT', '/admin/api/settings', { reminderRules: rules, reminderTemplate: $('[data-rule-template]').value }); toast('알림 규칙을 저장했어요. 새로 등록하는 시공부터 적용돼요.'); } catch (err) { toast(err.message, 'err'); }
    });
  }
})();
