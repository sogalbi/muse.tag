/* 드립 채널 공용 코드 — links.json 의 링크를 카드로 그린다.
   채널 페이지(drip/)와 링크 추가 페이지(drip/add/)가 같이 쓴다.
   링크 한 개: { id, url, name, brand?, note?, badge?, img?, random?, added } */
(function () {
  'use strict';

  // 링크 주소로 판매처를 알아낸다. 목록에 없으면 도메인 이름을 그대로 쓴다.
  var STORES = [
    { id: 'coupang', name: '쿠팡', host: /(^|\.)coupang\.com$/ },
    { id: 'ali', name: '알리', host: /(^|\.)aliexpress\.(com|us)$/ },
    { id: 'temu', name: '테무', host: /(^|\.)temu\.(com|to)$/ },
    { id: 'naver', name: '네이버', host: /(^|\.)naver\.(com|me)$/ },
    { id: 'musinsa', name: '무신사', host: /(^|\.)musinsa\.com$/ },
    { id: '29cm', name: '29CM', host: /(^|\.)29cm\.co\.kr$/ },
    { id: 'ohou', name: '오늘의집', host: /(^|\.)ohou\.se$/ },
    { id: 'kurly', name: '컬리', host: /(^|\.)kurly\.com$/ },
    { id: 'oliveyoung', name: '올리브영', host: /(^|\.)oliveyoung\.co\.kr$/ },
    { id: 'amazon', name: '아마존', host: /(^|\.)(amazon\.[a-z.]+|amzn\.(to|asia|eu))$/ }
  ];

  var COUPANG_NOTICE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
  var OTHER_NOTICE = '이 페이지의 링크는 제휴 링크라, 링크로 구매하면 일정액의 수수료를 받을 수 있어요.';
  var BADGE_NOTICE = '구매 수 같은 숫자는 링크를 올린 날 판매 페이지 기준이에요.';

  var BOLT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2 4 14h7l-1.5 8L20 10h-7z"/></svg>';

  function parse(url) {
    try {
      var u = new URL(String(url).trim());
      return /^https?:$/.test(u.protocol) ? u : null;
    } catch (e) {
      return null;
    }
  }

  function store(url) {
    var u = parse(url);
    if (!u) return null;
    var h = u.hostname.toLowerCase();
    for (var i = 0; i < STORES.length; i++) {
      if (STORES[i].host.test(h)) return STORES[i];
    }
    return { id: 'etc', name: h.replace(/^(www|m)\./, '') };
  }

  // 수수료가 붙는 제휴 링크인지 본다. ok: true(맞음) · false(아님) · null(모름)
  function affiliate(url) {
    var u = parse(url);
    if (!u) return null;
    var h = u.hostname.toLowerCase();
    var s = store(url);
    if (s.id === 'coupang') {
      return h === 'link.coupang.com'
        ? { ok: true, text: '쿠팡 파트너스 링크예요.' }
        : { ok: false, text: '쿠팡 파트너스 링크가 아니에요. 파트너스에서 만든 link.coupang.com 링크여야 수수료가 붙어요.', help: 'https://partners.coupang.com/' };
    }
    if (s.id === 'ali') {
      return h === 's.click.aliexpress.com'
        ? { ok: true, text: '알리 제휴 링크예요.' }
        : { ok: false, text: '알리 제휴 링크가 아니에요. 어필리에이트에서 만든 s.click.aliexpress.com 링크여야 수수료가 붙어요.', help: 'https://portals.aliexpress.com/' };
    }
    if (s.id === 'amazon') {
      if (u.searchParams.get('tag')) return { ok: true, text: '아마존 제휴 태그(tag=' + u.searchParams.get('tag') + ')가 들어 있어요.' };
      if (/^amzn\./.test(h)) return { ok: null, text: '아마존 단축 링크예요. 제휴 태그가 들어간 링크인지 확인해 주세요.' };
      return { ok: false, text: '아마존 제휴 태그(tag=)가 없어서 수수료가 안 붙어요.' };
    }
    return { ok: null, text: s.name + ' 링크예요. 제휴 링크가 맞는지 한 번 확인해 주세요.' };
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function src(img, base) {
    return /^(https?:|blob:|data:)/.test(img) ? img : (base || '') + img;
  }

  // 사진 한 장(없으면 '?' 칸). cls 는 'item-img' 또는 'thumb'.
  function thumb(link, base, cls) {
    cls = cls || 'item-img';
    var empty = function () {
      var p = el('span', cls + ' ' + cls + '-empty', '?');
      p.setAttribute('aria-hidden', 'true');
      return p;
    };
    if (!link.img) return empty();
    var img = el('img', cls);
    img.src = src(link.img, base);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () { img.replaceWith(empty()); });
    return img;
  }

  // 상품 카드 하나. base 는 사진 상대 경로 앞에 붙일 경로(drip/add/ 에서는 '../').
  function card(link, index, base) {
    var s = store(link.url) || { id: 'etc', name: '링크' };
    var li = el('li', 'item');
    li.style.setProperty('--i', index);
    var a = el('a', 'item-link');
    a.href = parse(link.url) ? parse(link.url).href : '#';
    a.rel = 'sponsored noopener';
    a.dataset.name = (link.brand ? link.brand + ' ' : '') + (link.name || '');
    a.dataset.no = String(index + 1).padStart(2, '0');

    var pic = el('span', 'item-pic');
    pic.appendChild(thumb(link, base));
    pic.appendChild(el('span', 'item-no', String(index + 1).padStart(2, '0')));
    a.appendChild(pic);

    var body = el('span', 'item-body');
    body.appendChild(el('span', 'item-brand', (link.brand ? link.brand + ' · ' : '') + s.name));
    body.appendChild(el('span', 'item-name', link.name || '이름 없음'));
    if (link.note) body.appendChild(el('span', 'item-note', link.note));

    var foot = el('span', 'item-foot');
    if (link.badge) {
      var badge = el('span', 'item-badge');
      badge.innerHTML = BOLT;
      badge.appendChild(document.createTextNode(link.badge));
      foot.appendChild(badge);
    }
    var go = el('span', 'item-go');
    go.setAttribute('aria-hidden', 'true');
    go.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    foot.appendChild(go);
    body.appendChild(foot);
    a.appendChild(body);

    li.appendChild(a);
    return li;
  }

  // 랜덤 뽑기 배너
  function lucky(link) {
    var a = el('a', 'lucky');
    a.href = parse(link.url) ? parse(link.url).href : '#';
    a.rel = 'sponsored noopener';
    a.dataset.name = '랜덤';
    a.dataset.no = 'random';
    var q = el('span', 'lucky-q', '?');
    q.setAttribute('aria-hidden', 'true');
    a.appendChild(q);
    var t = el('span', 'lucky-text');
    t.appendChild(el('span', 'lucky-kicker', 'RANDOM PICK'));
    t.appendChild(el('span', 'lucky-title', '오늘의 랜덤 추천템'));
    t.appendChild(el('span', 'lucky-note', link.note || '뭐가 나올지는 눌러 봐야 앎'));
    a.appendChild(t);
    a.appendChild(el('span', 'lucky-go', '뽑기 →'));
    return a;
  }

  // 주소가 올바른 링크만 남긴다.
  function valid(links) {
    return (links || []).filter(function (l) { return l && parse(l.url); });
  }

  // 랜덤 링크(맨 앞 하나)와 나머지 상품 목록으로 나눈다.
  function split(links) {
    var list = valid(links);
    var random = null;
    var items = list.filter(function (l) {
      if (l.random && !random) { random = l; return false; }
      return true;
    });
    return { random: random, items: items };
  }

  function render(listEl, items, base) {
    listEl.textContent = '';
    items.forEach(function (l, i) { listEl.appendChild(card(l, i, base)); });
    return items.length;
  }

  // 목록에 맞는 고지 문구. 쿠팡 링크가 있으면 쿠팡 파트너스 공식 문구를 꼭 넣는다.
  function disclosure(links) {
    var list = valid(links);
    var out = [];
    if (list.some(function (l) { return store(l.url).id === 'coupang'; })) out.push(COUPANG_NOTICE);
    if (list.some(function (l) { return store(l.url).id !== 'coupang'; })) out.push(OTHER_NOTICE);
    if (list.some(function (l) { return l.badge; })) out.push(BADGE_NOTICE);
    return out;
  }

  // Google 애널리틱스(GA4). 측정 ID(G-…)가 있을 때만 켠다.
  var GA_ID = /^G-[A-Z0-9]{4,}$/;
  var gaOn = false;
  function analytics(id) {
    id = String(id || '').trim().toUpperCase();
    if (gaOn || !GA_ID.test(id)) return false;
    gaOn = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    return true;
  }

  // 상품 링크를 누르면 'drip_click' 이벤트 (상품 이름·번호 포함)
  function trackClicks(root) {
    root.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.item-link, a.lucky');
      if (!a || !gaOn) return;
      window.gtag('event', 'drip_click', {
        item_name: a.dataset.name || '',
        item_no: a.dataset.no || '',
        link_url: a.href,
        transport_type: 'beacon'
      });
    });
  }

  window.Drip = {
    GA_ID: GA_ID,
    analytics: analytics,
    trackClicks: trackClicks,
    STORES: STORES,
    parse: parse,
    store: store,
    affiliate: affiliate,
    thumb: thumb,
    card: card,
    lucky: lucky,
    split: split,
    render: render,
    valid: valid,
    disclosure: disclosure
  };
})();
