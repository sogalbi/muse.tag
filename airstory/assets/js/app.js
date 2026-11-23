/* 에어스토리 홈페이지 동작 */
(function () {
  "use strict";

  var PRODUCTS = window.AS_PRODUCTS || [];
  var CATS = window.AS_CATS || {};
  var BY_ID = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; });

  var PHONE = "01044459040";
  var PHONE_TXT = "010-4445-9040";
  var MAIL = "airstory2024@gmail.com";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  // 옛 사이트에 상품 페이지가 있던 제품은 같은 주소의 제품 페이지가 있다
  function pageOf(p) { return /^(rental|bounce|slide|sports|water|dome|sculpture)-[0-9a-f]{8}$/.test(p.id) ? null : p.id; }
  function imgPath(sid, size) { return "assets/img/p/" + sid + "-" + (size || "s") + ".webp"; }
  function findImg(p, prefix) {
    if (!p) return null;
    for (var i = 0; i < p.img.length; i++) if (p.img[i][0].indexOf(prefix) === 0) return p.img[i];
    return p.img[0];
  }
  function sizeParts(p) {
    if (!p.size) return { num: "크기 문의", unit: "" };
    if (/ m$/.test(p.size)) return { num: p.size.slice(0, -2), unit: "m" };
    return { num: p.size, unit: "" };
  }

  /* ---------- 알림 ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  /* ---------- 머리글 ---------- */
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = $(".menu-btn"), gnb = $("#gnb");
  function closeMenu() { gnb.classList.remove("is-open"); header.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "메뉴 열기"); }
  menuBtn.addEventListener("click", function () {
    var open = !gnb.classList.contains("is-open");
    gnb.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);   // 메뉴가 열리면 머리글은 흰 바탕
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  gnb.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- 1. 첫 화면 사진 ---------- */
  // [제품, 사진 앞자리, 사진에서 보여 줄 곳(가로 %, 세로 %)] — 화면 가득 펴도 흐리지 않은 큰 사진만
  var HERO = [
    ["so-trolley", "df2354", "58%", "45%"],
    ["sd-castle-35m", "070ae8", "24%", "40%"],
    ["promo-airdome-tunnel", "e06e6f", "48%", "38%"],
    ["rental-10ab1153", "10ab11", "62%", "46%"],
    ["rental-7737ea71", "7737ea", "60%", "44%"],
    ["rental-8952ef53", "8952ef", "45%", "42%"]
  ].filter(function (h) { return BY_ID[h[0]]; });

  var stage = $(".hero-stage"), heroSec = $(".hero");
  if (stage && HERO.length) {
    var stImg = $(".stage-img", heroSec), stSpec = $(".spec-hero", stage), stName = $(".spec-name", stage), stNum = $(".spec-num", stage),
        stUnit = $(".spec-dim small", stage), stKey = $(".spec-key", stage), stScale = $(".spec-scale", stage), thumbs = $(".stage-thumbs", stage);
    var cur = 0, timer = null;
    // 처음 한 번만 부풀리고, 끝나면 표시를 지워 사진 넘기기(흐려졌다 나타나기)가 그대로 되게
    [stImg, stSpec].forEach(function (el) {
      if (!el) return;
      el.addEventListener("animationend", function () { el.classList.remove("is-first"); }, { once: true });
      if (reduceMotion) el.classList.remove("is-first");
    });
    var stScaleKey = $(".spec-scale-key", stage);
    var drawScale = function (p) {
      var ok = window.ASScale && p.w > 0 && p.h > 0;
      stScale.innerHTML = ok ? window.ASScale.side(Math.max(p.w, p.d || 0), p.h, { compact: true }) : "";
      if (ok) {
        var r = p.h / 1.7, times = r >= 3 ? String(Math.round(r)) : String(Math.round(r * 10) / 10);
        stScaleKey.textContent = "왼쪽이 사람(1.7 m) · 높이는 사람 키의 약 " + times + "배";
      }
    };
    drawScale(BY_ID[HERO[0][0]]);
    HERO.forEach(function (h, i) {
      var p = BY_ID[h[0]], im = findImg(p, h[1]);
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.setAttribute("aria-label", p.name + " 사진 보기");
      b.innerHTML = '<img src="' + imgPath(im[0], "s") + '" alt="" width="64" height="48" loading="lazy">';
      b.addEventListener("click", function () { show(i); restart(); });
      thumbs.appendChild(b);
    });
    var show = function (i) {
      cur = (i + HERO.length) % HERO.length;
      var p = BY_ID[HERO[cur][0]], im = findImg(p, HERO[cur][1]), sp = sizeParts(p);
      var next = new Image();
      next.src = imgPath(im[0], "l");
      var focus = HERO[cur];
      var apply = function () {
        stImg.classList.remove("is-first");
        stImg.src = next.src;
        stImg.alt = p.name + " 설치 사진";
        stImg.width = im[1]; stImg.height = im[2];
        stImg.style.setProperty("--fx", focus[2] || "50%");
        stImg.style.setProperty("--fy", focus[3] || "50%");
        stImg.classList.remove("is-fading");
      };
      stImg.classList.add("is-fading");
      if (next.decode) next.decode().then(function () { setTimeout(apply, reduceMotion ? 0 : 180); }, apply);
      else setTimeout(apply, 180);
      stName.textContent = p.name;
      stName.parentElement.classList.toggle("is-long", sp.num.length > 16);
      stNum.textContent = sp.num;
      stUnit.textContent = sp.unit;
      stKey.textContent = p.round ? "지름" : (p.size ? "가로 × 세로 × 높이" : "");
      drawScale(p);
      $$("button", thumbs).forEach(function (b, k) { b.setAttribute("aria-pressed", k === cur ? "true" : "false"); });
    };
    var restart = function () {
      clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(function () { if (!document.hidden) show(cur + 1); }, 5200);
    };
    thumbs.addEventListener("mouseenter", function () { clearInterval(timer); });
    thumbs.addEventListener("mouseleave", restart);
    thumbs.addEventListener("focusin", function () { clearInterval(timer); });
    restart();
  }

  /* ---------- 1-2. 줄자: 대표 제품을 가장 긴 변 길이 자리에 꽂는다 ---------- */
  var tapeSec = $("#tape");
  if (tapeSec) {
    var tScroll = $(".tape-scroll", tapeSec), tTrack = $(".tape-track", tapeSec);
    var TAPE_MAX = 72, tapeKey = "";
    var tapeItems = PRODUCTS.filter(function (p) { return p.w > 0 && p.d > 0 && p.img.length; })
      .map(function (p) { return { p: p, len: Math.max(p.w, p.d) }; });
    var rank = function (p) { return (p.promo ? 3 : 0) + (pageOf(p) ? 4 : 0) + (p.rental ? 2 : 0) + Math.min(p.img.length, 6) / 6; };
    var byLen = tapeItems.slice().sort(function (a, b) { return a.len - b.len; });
    // 가장 짧은 것과 가장 긴 것을 먼저, 나머지는 분류마다 하나씩 돌아가며(대표성 순) 자리를 찾는다
    var groups = {};
    tapeItems.forEach(function (c) { (groups[c.p.cat] = groups[c.p.cat] || []).push(c); });
    Object.keys(groups).forEach(function (k) { groups[k].sort(function (a, b) { return rank(b.p) - rank(a.p); }); });
    var tapeOrder = [byLen[0], byLen[byLen.length - 1]];
    for (var gi = 0, more = true; more; gi++) {
      more = false;
      Object.keys(groups).forEach(function (k) { if (groups[k][gi]) { tapeOrder.push(groups[k][gi]); more = true; } });
    }
    var lenText = function (v) { return String(+v.toFixed(2)); };
    var escH = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };

    var tapeBox = $(".tape", tapeSec);
    var renderTape = function () {
      var mobile = window.matchMedia("(max-width: 640px)").matches;
      // 줄자 통은 본문 왼쪽 줄에 맞춘다 (.wrap 과 같은 계산)
      var lead = mobile ? 16 : Math.max(24, Math.round((document.documentElement.clientWidth - 1200) / 2));
      var key = (mobile ? "m" : "d") + lead;
      if (key === tapeKey) return;
      tapeKey = key;
      tapeBox.style.setProperty("--lead", lead + "px");
      var ppm = mobile ? 30 : 42, cardW = mobile ? 148 : 164, cardH = 52, laneH = 62, start = lead + (mobile ? 84 : 106), gap = 8;
      // 칸 4개: 줄자 위 가까운 칸·아래 가까운 칸·위 먼 칸·아래 먼 칸 (같은 쪽 줄은 서로 가리지 않게)
      var LANES = [{ up: 1, r: 0 }, { up: 0, r: 0 }, { up: 1, r: 1 }, { up: 0, r: 1 }];
      var lane = [[], [], [], []], picked = [], seen = {};
      tapeOrder.forEach(function (c) {
        if (seen[c.p.id]) return;
        var x = start + c.len * ppm;
        for (var k = 0; k < LANES.length; k++) {
          // 카드는 줄의 오른쪽(a = x-16) 또는 왼쪽(b = x+16)으로 펼친다
          for (var sd = 0; sd < 2; sd++) {
            var a = sd === 0 ? x - 16 : x + 16 - cardW, b = a + cardW;
            if (a < start - 30) continue;
            var free = lane[k].every(function (iv) { return b + gap <= iv[0] || a >= iv[1] + gap; });
            var near = k - 2;   // 먼 칸이면 같은 쪽 가까운 칸
            var lineClear = near < 0 || !lane[near].some(function (iv) { return x >= iv[0] - 6 && x <= iv[1] + 6; });
            var coversLine = k < 2 && picked.some(function (q) { return q.k === k + 2 && q.x >= a - 6 && q.x <= b + 6; });
            if (free && lineClear && !coversLine) {
              lane[k].push([a, b]); picked.push({ c: c, x: x, a: a, k: k }); seen[c.p.id] = 1;
              return;
            }
          }
        }
      });
      var upH = 2 * laneH + 12, tapeTop = upH, tapeH = 60, trackW = start + TAPE_MAX * ppm + cardW;
      tTrack.style.height = (upH + tapeH + 12 + 2 * laneH) + "px";
      var html = '<div class="tape-pins">';
      picked.sort(function (m, n) { return m.x - n.x; }).forEach(function (q) {
        var p = q.c.p, L = LANES[q.k], pg = pageOf(p), top, lTop, lH;
        if (L.up) { top = tapeTop - 12 - cardH - L.r * laneH; lTop = top + cardH; lH = tapeTop - lTop; }
        else { top = tapeTop + tapeH + 12 + L.r * laneH; lTop = tapeTop + tapeH; lH = top - lTop; }
        html += '<span class="pin-line ' + (L.up ? "is-up" : "is-down") + '" style="left:' + q.x + "px;top:" + lTop + "px;height:" + lH + 'px"></span>' +
          '<a class="pin" style="left:' + q.a + "px;top:" + top + "px;width:" + cardW + 'px" href="' + (pg || "#p-" + p.id) + '" data-open="' + p.id + '" ' +
          'aria-label="' + escH(p.name) + ", 가장 긴 변 " + lenText(q.c.len) + ' m">' +
          '<img src="' + imgPath(p.img[0][0], "s") + '" alt="" width="56" height="42" loading="lazy">' +
          '<span class="pin-txt"><b>' + escH(p.name) + "</b><span>" + lenText(q.c.len) + " m</span></span></a>";
      });
      html += "</div>";
      var marks = "";
      for (var m = 0; m <= TAPE_MAX; m += 5) {
        marks += '<span class="tape-num' + (m % 10 === 0 ? " is-ten" : "") + '" style="left:' + (10 + m * ppm) + 'px">' + m + (m % 10 === 0 && m ? "<small>m</small>" : "") + "</span>";
      }
      html += '<div class="tape-strip" style="left:' + (start - 10) + "px;top:" + tapeTop + "px;width:" + (TAPE_MAX * ppm + 24) + "px;--ppm:" + ppm + 'px">' + marks + "</div>";
      tapeBox.style.setProperty("--tape-mid", (tapeTop + tapeH / 2 + 6) + "px");
      tTrack.style.width = trackW + "px";
      tTrack.innerHTML = html;
    };
    renderTape();
    tapeSec.hidden = false;
    var tapeTimer;
    window.addEventListener("resize", function () { clearTimeout(tapeTimer); tapeTimer = setTimeout(renderTape, 150); });

    $$(".tape-btn", tapeSec).forEach(function (b) {
      b.addEventListener("click", function () {
        tScroll.scrollBy({ left: +b.dataset.dir * tScroll.clientWidth * 0.7, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
    // 마우스로 끌어서 밀기 (손가락은 기본 가로 넘기기)
    var drag = null, dragged = false;
    tScroll.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, s: tScroll.scrollLeft }; dragged = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 5) { dragged = true; tScroll.classList.add("is-dragging"); }
      if (dragged) tScroll.scrollLeft = drag.s - dx;
    });
    window.addEventListener("pointerup", function () { drag = null; tScroll.classList.remove("is-dragging"); });
    tScroll.addEventListener("click", function (e) { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
  }

  /* ---------- 3. 시안과 실물 ---------- */
  var PAIRS = [
    ["op-airdomee", "21b093", "1d0317", "에어돔 이글루"],
    ["op-air-domef", "b7b31a", "6574a7", "에어휴게소"],
    ["promo-airdome-tunnel", "4522a4", "b25b95", "에어돔 터널"],
    ["op-air-domee-1", "acd213", "b646d0", "큐티돔"],
    ["sd-blue-pengyn-w-1", "f04771", "bb38a4", "블루펭귄 T형 슬라이드"],
    ["op-oceanworld", "0527d2", "e01a7b", "바다속세상 놀이터"],
    ["op-icdworld", "a315f0", "a927dd", "얼음왕국 해적"]
  ].filter(function (x) { return BY_ID[x[0]]; });

  var cmp = $(".cmp");
  if (cmp && PAIRS.length) {
    var before = $(".cmp-before", cmp), after = $(".cmp-after", cmp), range = $(".cmp-range", cmp);
    var list = $(".pair-list"), cName = $(".cmp-name"), cSize = $(".cmp-size"), cOpen = $(".cmp-open");
    var curPair = 0;
    var setPos = function (v) { cmp.style.setProperty("--pos", v + "%"); };
    range.addEventListener("input", function () { setPos(range.value); });
    PAIRS.forEach(function (x, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.textContent = x[3];
      b.addEventListener("click", function () { pick(i); });
      list.appendChild(b);
    });
    var pick = function (i) {
      curPair = i;
      var x = PAIRS[i], p = BY_ID[x[0]], r = findImg(p, x[1]), a = findImg(p, x[2]);
      before.src = imgPath(r[0], "l"); before.alt = p.name + " 3D 시안";
      after.src = imgPath(a[0], "l"); after.alt = p.name + " 설치 사진";
      cName.textContent = p.name;
      cSize.textContent = p.size ? p.size + (p.round ? "" : " (가로 × 세로 × 높이)") : "크기 문의";
      range.value = 50; setPos(50);
      $$("button", list).forEach(function (b, k) { b.setAttribute("aria-selected", k === i ? "true" : "false"); });
    };
    cOpen.addEventListener("click", function () { openProduct(PAIRS[curPair][0]); });
    pick(0);
  }

  /* ---------- 5. 전체 제품 ---------- */
  var grid = $("#grid");
  var items = $$("#grid > li");
  var PAGE = window.matchMedia("(max-width: 640px)").matches ? 12 : 16;
  var state = { cat: "all", q: "", w: null, d: null, limit: PAGE };
  var moreBtn = $("#more"), emptyEl = $("#empty"), statusEl = $("#status");
  var qEl = $("#q"), fwEl = $("#fitW"), fdEl = $("#fitD"), fitClear = $(".fit-clear");

  function norm(s) { return (s || "").toLowerCase().replace(/\s+/g, ""); }
  function matches(li) {
    var p = BY_ID[li.dataset.id];
    if (!p) return false;
    if (state.cat === "rental" && !p.rental) return false;
    if (state.cat === "order" && !p.order) return false;
    if (state.cat !== "all" && state.cat !== "rental" && state.cat !== "order" && p.cat !== state.cat) return false;
    if (state.q && norm(p.name).indexOf(norm(state.q)) < 0 && norm(CATS[p.cat]).indexOf(norm(state.q)) < 0) return false;
    if (state.w || state.d) {
      if (!p.w) return false;
      var W = state.w || 999, D = state.d || 999;
      var fits = (p.w <= W && p.d <= D) || (p.w <= D && p.d <= W);
      if (!fits) return false;
    }
    return true;
  }
  function render() {
    var shown = 0, total = 0, noSize = 0;
    items.forEach(function (li) {
      var ok = matches(li);
      if (ok) total++;
      var vis = ok && shown < state.limit;
      if (vis) shown++;
      li.hidden = !vis;
    });
    if (state.w || state.d) {
      PRODUCTS.forEach(function (p) {
        if (p.w) return;
        var catOk = state.cat === "all" || (state.cat === "rental" ? p.rental : state.cat === "order" ? p.order : p.cat === state.cat);
        if (catOk) noSize++;
      });
    }
    moreBtn.parentElement.hidden = total <= state.limit;
    moreBtn.textContent = "제품 더 보기 (" + (total - shown) + "종 남음)";
    emptyEl.hidden = total > 0;
    var label = state.cat === "all" ? "전체" : state.cat === "order" ? "주문제작 사례" : CATS[state.cat];
    var msg = label + " " + total + "종";
    if (state.q) msg += " · ‘" + state.q + "’ 검색";
    if (state.w || state.d) {
      msg += " · " + (state.w || "?") + " × " + (state.d || "?") + " m 공간에 들어가는 제품";
      if (noSize) msg += " (크기 정보가 없는 " + noSize + "종은 빠짐)";
    }
    statusEl.textContent = msg;
    fitClear.hidden = !(state.w || state.d);
  }
  function setCat(c) {
    state.cat = c;
    state.limit = PAGE;
    $$(".chip").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.cat === c ? "true" : "false"); });
    var active = $('.chip[data-cat="' + c + '"]');
    // 페이지 스크롤과 겹치지 않게 칩 줄은 부드럽게 굴리지 않고 바로 옮긴다
    if (active) active.parentElement.scrollLeft = Math.max(0, active.offsetLeft - 16);
    render();
  }
  $$(".chip").forEach(function (b) { b.addEventListener("click", function () { setCat(b.dataset.cat); }); });
  moreBtn.addEventListener("click", function () { state.limit += PAGE * 2; render(); });
  var qTimer;
  qEl.addEventListener("input", function () {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () { state.q = qEl.value.trim(); state.limit = PAGE; render(); }, 120);
  });
  function readFit() {
    var w = parseFloat(fwEl.value), d = parseFloat(fdEl.value);
    state.w = w > 0 ? w : null;
    state.d = d > 0 ? d : null;
    state.limit = PAGE;
    render();
  }
  fwEl.addEventListener("input", readFit);
  fdEl.addEventListener("input", readFit);
  fitClear.addEventListener("click", function () { fwEl.value = ""; fdEl.value = ""; readFit(); fwEl.focus(); });

  // 다른 곳의 분류 링크 (메뉴, 분류 칸, 렌탈·제작 버튼)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-filter]");
    if (!a) return;
    setCat(a.dataset.filter);
  });
  render();

  /* ---------- 제품 상세 창 ---------- */
  var modal = $("#modal");
  var mImg = $("#m-img"), mThumbs = $("#m-thumbs"), mCat = $("#m-cat"), mName = $("#m-name"),
      mBadges = $("#m-badges"), mSize = $("#m-size"), mKey = $("#m-key"), mAsk = $("#m-ask");
  var openId = null, lastFocus = null;

  function setMain(p, i) {
    var im = p.img[i];
    mImg.src = imgPath(im[0], "l");
    mImg.alt = p.name + " 사진 " + (i + 1);
    mImg.width = im[1]; mImg.height = im[2];
    $$("button", mThumbs).forEach(function (b, k) { b.setAttribute("aria-current", k === i ? "true" : "false"); });
  }
  function openProduct(id, fromHash) {
    var p = BY_ID[id];
    if (!p) return;
    openId = id;
    lastFocus = document.activeElement;
    mCat.textContent = CATS[p.cat] + (p.sub ? " · " + p.sub : "");
    mName.textContent = p.name;
    var b = [];
    if (p.rental) b.push('<span class="badge b-rental">렌탈 가능</span>');
    if (p.order) b.push('<span class="badge b-order">주문제작 사례</span>');
    if (p.promo) b.push('<span class="badge b-promo">추천</span>');
    mBadges.innerHTML = b.join("");
    mBadges.hidden = !b.length;
    mSize.textContent = p.size || "크기는 상담 때 안내";
    $("#m-spec").classList.toggle("is-long", (p.size || "").length > 18);
    mKey.textContent = p.size ? (p.round ? "지름 · 단위 m" : (p.h ? "가로 × 세로 × 높이 · 단위 m" : "가로 × 세로 · 단위 m")) : "";
    var mScale = $("#m-scale"), fig = window.ASScale ? window.ASScale.figure(p) : "";
    mScale.innerHTML = fig;
    mScale.hidden = !fig;
    var mPage = $("#m-page"), pg = pageOf(p);
    if (mPage) { mPage.hidden = !pg; if (pg) mPage.href = pg; }
    mThumbs.innerHTML = "";
    if (p.img.length > 1) {
      p.img.forEach(function (im, i) {
        var t = document.createElement("button");
        t.type = "button";
        t.setAttribute("aria-label", "사진 " + (i + 1) + " 보기");
        t.innerHTML = '<img src="' + imgPath(im[0], "s") + '" alt="" width="72" height="54" loading="lazy">';
        t.addEventListener("click", function () { setMain(p, i); });
        mThumbs.appendChild(t);
      });
    }
    setMain(p, 0);
    if (!modal.open) modal.showModal();
    $(".m-close", modal).focus();
    if (!fromHash) history.replaceState(null, "", "#p-" + id);
  }
  function closeModal(dlg) {
    if (dlg.open) dlg.close();
  }
  modal.addEventListener("close", function () {
    openId = null;
    if (location.hash.indexOf("#p-") === 0) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  $$("dialog").forEach(function (dlg) {
    $(".m-close", dlg).addEventListener("click", function () { closeModal(dlg); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeModal(dlg); });
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-open]");
    if (!t) return;
    // Ctrl·Cmd·Shift·가운데 버튼은 제품 페이지를 새 창으로 여는 기본 동작을 그대로 둔다
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    openProduct(t.dataset.open);
  });
  mAsk.addEventListener("click", function () {
    var p = BY_ID[openId];
    closeModal(modal);
    prefill(p.rental ? "렌탈" : "주문제작", p.name);
    goInquiry();
  });
  function fromHash() {
    var h = decodeURIComponent(location.hash || "");
    if (h.indexOf("#p-") === 0) openProduct(h.slice(3), true);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();

  /* ---------- 견적 문의 ---------- */
  var form = $("#form"), errEl = $("#form-error");
  function fld(n) { return form.elements.namedItem(n); }
  function prefill(kind, product) {
    if (kind) {
      var r = form.querySelector('input[name="kind"][value="' + kind + '"]');
      if (r) r.checked = true;
    }
    if (product) fld("product").value = product;
    updatePick();
  }

  /* 고른 제품 카드 + 적은 공간에 들어가는지 바로 알려 주기 */
  var BY_NAME = {};
  PRODUCTS.forEach(function (p) { BY_NAME[p.name] = p; });
  var pickEl = $("#pick");
  function numOf(n) { var v = parseFloat(fld(n).value); return v > 0 ? v : 0; }
  function mText(v) { return String(+(+v).toFixed(2)); }
  function updatePick() {
    if (!pickEl) return;
    var p = BY_NAME[fld("product").value.trim()];
    if (!p) { pickEl.hidden = true; pickEl.innerHTML = ""; return; }
    var W = numOf("spaceW"), D = numOf("spaceD"), fit = "";
    if (p.w > 0 && p.d > 0 && W && D) {
      var ok = (p.w <= W && p.d <= D) || (p.w <= D && p.d <= W);
      fit = ok
        ? '<p class="pick-fit is-ok"><b>들어갑니다</b> 적은 공간 ' + mText(W) + " × " + mText(D) + " m 안에 본체(" + mText(p.w) + " × " + mText(p.d) + " m)가 들어갑니다. 송풍기·안전 공간은 상담 때 함께 확인합니다.</p>"
        : '<p class="pick-fit is-no"><b>공간이 작습니다</b> 본체(' + mText(p.w) + " × " + mText(p.d) + " m)가 적은 공간 " + mText(W) + " × " + mText(D) + " m보다 큽니다. 더 작은 제품이나 공간에 맞춘 제작을 상담해 드립니다.</p>";
    } else if (p.w > 0 && p.d > 0) {
      fit = '<p class="pick-fit">공간 크기(가로 × 세로)를 적으면 들어가는지 바로 알려 드립니다.</p>';
    }
    var pg = pageOf(p);
    pickEl.innerHTML =
      '<img src="' + imgPath(p.img[0][0], "s") + '" alt="" width="96" height="72">' +
      '<div class="pick-body"><p class="pick-name">' + p.name.replace(/</g, "&lt;") + "</p>" +
      '<p class="pick-size">' + (p.size || "크기는 상담 때 안내") + "</p>" + fit +
      (pg ? '<a class="pick-link" href="' + pg + '" target="_blank" rel="noopener">제품 페이지 보기</a>' : "") + "</div>";
    pickEl.hidden = false;
  }
  ["product", "spaceW", "spaceD"].forEach(function (n) {
    fld(n).addEventListener("input", updatePick);
    fld(n).addEventListener("change", updatePick);
  });
  function goInquiry() {
    var sec = $("#inquiry");
    sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(function () { (fld("product").value ? fld("name") : fld("product")).focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-inquiry]");
    if (!a) return;
    prefill(a.dataset.inquiry, a.dataset.product || "");
  });

  function message() {
    var f = form, kind = (f.querySelector('input[name="kind"]:checked') || {}).value || "";
    var lines = ["[에어스토리 홈페이지 견적 문의]", "문의 종류: " + kind];
    if (fld("product").value.trim()) lines.push("관심 제품: " + fld("product").value.trim());
    if (fld("date").value) lines.push("날짜: " + fld("date").value);
    if (fld("place").value.trim()) lines.push("장소: " + fld("place").value.trim());
    if (fld("spaceW").value || fld("spaceD").value) lines.push("공간 크기: " + (fld("spaceW").value || "?") + " × " + (fld("spaceD").value || "?") + " m");
    lines.push("이름/회사: " + fld("name").value.trim());
    lines.push("연락처: " + fld("phone").value.trim());
    if (fld("memo").value.trim()) lines.push("", fld("memo").value.trim());
    return lines.join("\n");
  }
  function validate() {
    var bad = [];
    [["name", "이름 또는 회사명"], ["phone", "연락처"]].forEach(function (x) {
      var el = fld(x[0]), ok = el.value.trim().length > 0;
      if (x[0] === "phone" && ok) ok = /[0-9]{2,}.*[0-9]{3,}/.test(el.value);
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) bad.push(x[1]);
    });
    if (bad.length) {
      errEl.textContent = bad.length === 2 ? "이름(회사명)과 연락처를 적어 주세요."
        : bad[0] === "연락처" ? "연락처를 적어 주세요. 이 번호로 답을 드립니다."
        : "이름 또는 회사명을 적어 주세요.";
      errEl.hidden = false;
      fld(bad[0] === "연락처" ? "phone" : "name").focus();
      return false;
    }
    errEl.hidden = true;
    return true;
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return copyOld(text); });
    }
    return copyOld(text);
  }
  function copyOld(text) {
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); }
      document.body.removeChild(ta);
    });
  }
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isPhone = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) || isIOS;

  var kakaoDlg = $("#kakao"), kCopied = $("#k-copied");
  function openKakao(copied) {
    kCopied.hidden = !copied;
    if (!kakaoDlg.open) kakaoDlg.showModal();
    $(".m-close", kakaoDlg).focus();
  }
  $$("[data-kakao]").forEach(function (b) { b.addEventListener("click", function () { openKakao(false); }); });

  $$("[data-send]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!validate()) return;
      var text = message(), how = btn.dataset.send;
      if (how === "sms") {
        if (isPhone) {
          location.href = "sms:" + PHONE + (isIOS ? "&" : "?") + "body=" + encodeURIComponent(text);
        } else {
          copy(text).then(function () {
            toast("PC에서는 문자 앱이 열리지 않아 내용을 복사했습니다. " + PHONE_TXT + "로 보내 주세요.");
          }, function () { toast("문자는 휴대폰에서 보내 주세요. " + PHONE_TXT); });
        }
      } else if (how === "mail") {
        var kind = (form.querySelector('input[name="kind"]:checked') || {}).value || "";
        var subject = "[견적 문의] " + kind + (fld("product").value.trim() ? " - " + fld("product").value.trim() : "");
        location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      } else if (how === "kakao") {
        copy(text).then(function () { openKakao(true); }, function () { openKakao(false); });
      }
    });
  });
  // 제품 페이지의 '이 제품 견적 문의' (./?ask=아이디#inquiry)
  (function () {
    var m = /[?&]ask=([^&#]+)/.exec(location.search), p = m && BY_ID[decodeURIComponent(m[1])];
    if (!p) return;
    prefill(p.rental ? "렌탈" : "주문제작", p.name);
    history.replaceState(null, "", location.pathname + "#inquiry");
    var go = function () {
      // CSS 의 부드러운 스크롤이 로딩 중에 끊기지 않게 바로 이동
      $("#inquiry").scrollIntoView({ behavior: "instant" });
      fld("name").focus({ preventScroll: true });
    };
    go();
    // 사진·글꼴이 늦게 와서 위치가 밀리면 한 번 더 맞춘다
    window.addEventListener("load", function () { setTimeout(go, 50); });
  })();

  ["name", "phone"].forEach(function (n) {
    fld(n).addEventListener("input", function () { fld(n).setAttribute("aria-invalid", "false"); });
  });
})();
