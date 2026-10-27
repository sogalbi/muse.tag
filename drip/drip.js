/* 드립 채널 공용 코드 — links.json 의 링크를 카드로 그린다.
   채널 페이지(drip/)와 링크 추가 페이지(drip/add/)가 같이 쓴다. */
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

  function placeholder() {
    var p = el('span', 'item-img item-img-empty', 'ㅋㅋ');
    p.setAttribute('aria-hidden', 'true');
    return p;
  }

  // 카드 하나. base 는 사진 상대 경로 앞에 붙일 경로(drip/add/ 에서는 '../').
  function card(link, index, base) {
    var s = store(link.url) || { id: 'etc', name: '링크' };
    var li = el('li', 'item');
    var a = el('a', 'item-link');
    a.href = parse(link.url) ? parse(link.url).href : '#';
    a.rel = 'sponsored noopener';

    if (link.img) {
      var img = el('img', 'item-img');
      img.src = /^(https?:|blob:|data:)/.test(link.img) ? link.img : (base || '') + link.img;
      img.alt = '';
      img.width = 84;
      img.height = 84;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', function () { img.replaceWith(placeholder()); });
      a.appendChild(img);
    } else {
      a.appendChild(placeholder());
    }

    var body = el('span', 'item-body');
    var meta = el('span', 'item-meta');
    meta.appendChild(el('span', 'item-no', '#' + String(index + 1).padStart(2, '0')));
    meta.appendChild(el('span', 'chip chip-' + s.id, s.name));
    var r = Number(link.rating);
    if (link.rating !== '' && link.rating != null && r > 0) {
      var rating = el('span', 'rating');
      var star = el('span', null, '★ ');
      star.setAttribute('aria-hidden', 'true');
      rating.appendChild(star);
      rating.appendChild(document.createTextNode(r.toFixed(1)));
      rating.appendChild(el('span', 'visually-hidden', ' 별점'));
      meta.appendChild(rating);
    }
    body.appendChild(meta);
    body.appendChild(el('span', 'item-name', link.name || '이름 없음'));
    if (link.note) body.appendChild(el('span', 'item-note', link.note));
    a.appendChild(body);

    var go = el('span', 'item-go');
    go.setAttribute('aria-hidden', 'true');
    go.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    a.appendChild(go);

    li.appendChild(a);
    return li;
  }

  // 주소가 올바른 링크만 남긴다.
  function valid(links) {
    return (links || []).filter(function (l) { return l && parse(l.url); });
  }

  function render(listEl, links, base) {
    var list = valid(links);
    listEl.textContent = '';
    list.forEach(function (l, i) { listEl.appendChild(card(l, i, base)); });
    return list.length;
  }

  // 목록에 맞는 고지 문구. 쿠팡 링크가 있으면 쿠팡 파트너스 공식 문구를 꼭 넣는다.
  function disclosure(links) {
    var list = valid(links);
    var out = [];
    var coupang = list.some(function (l) { return store(l.url).id === 'coupang'; });
    var other = list.some(function (l) { return store(l.url).id !== 'coupang'; });
    if (coupang) out.push(COUPANG_NOTICE);
    if (other) out.push(OTHER_NOTICE);
    return out;
  }

  window.Drip = {
    STORES: STORES,
    parse: parse,
    store: store,
    affiliate: affiliate,
    card: card,
    render: render,
    valid: valid,
    disclosure: disclosure
  };
})();
