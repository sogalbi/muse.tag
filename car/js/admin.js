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
  const fIn = $('[data-filter-input]'), fSvc = $('[data-filter-svc]');
  const filterRows = () => {
    const q = (fIn?.value || '').trim().toLowerCase(), sv = fSvc?.value || '';
    $$('[data-row]').forEach(r => { r.hidden = (q && !r.dataset.text.includes(q)) || (sv && !r.dataset.svc.split(' ').includes(sv)); });
  };
  fIn?.addEventListener('input', filterRows); fSvc?.addEventListener('change', filterRows);

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

    const fields = () => ({ brand: form.brand.value, model: form.model.value.trim(), services: selectedSvcs(), region: form.region.value, date: form.date.value, detail: form.detail.value.trim(), memo: form.memo.value.trim() });

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
        try { const r = await api('PATCH', `/admin/api/inquiries/${id}`, { status: $('[data-st]', detail).value, memo: $('[data-memo]', detail).value }); Object.assign(q, r.inquiry); open(id); toast('저장되었습니다.'); } catch (err) { toast(err.message, 'err'); }
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
})();
