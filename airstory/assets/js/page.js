/* 에어스토리 제품·분류 페이지 동작 (홈페이지는 app.js) */
(function () {
  "use strict";
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  var PHONE = "01044459040";
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  /* 머리글 */
  var header = $(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var menuBtn = $(".menu-btn"), gnb = $("#gnb");
  function closeMenu() { gnb.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "메뉴 열기"); }
  menuBtn.addEventListener("click", function () {
    var open = !gnb.classList.contains("is-open");
    gnb.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* 분류 페이지: 지금 분류 칩이 보이게 */
  var cur = $(".cat-links [aria-current]");
  if (cur) cur.parentElement.scrollLeft = Math.max(0, cur.offsetLeft - 16);

  /* 사진 넘기기 */
  var main = $("#pd-img");
  $$(".pd-thumbs button").forEach(function (b, i, all) {
    b.addEventListener("click", function () {
      main.src = b.dataset.src;
      main.width = +b.dataset.w; main.height = +b.dataset.h;
      main.alt = main.alt.replace(/ 사진.*$/, "") + " 사진 " + (i + 1);
      all.forEach(function (x) { x.setAttribute("aria-current", x === b ? "true" : "false"); });
    });
  });

  /* 설치 크기 그림 (사람·주차 1칸과 같은 비율) */
  var sc = $(".scale-mount");
  if (sc && window.ASScale) {
    var d = sc.dataset;
    sc.innerHTML = window.ASScale.figure({ w: +d.w, d: +d.d, h: +d.h || 0, round: d.round === "1", size: d.size || "" });
  }

  /* 문자: 휴대폰 종류에 맞춰 본문 채우기 */
  $$("[data-sms]").forEach(function (a) {
    var body = a.dataset.sms;
    a.href = "sms:" + PHONE + (body ? (isIOS ? "&" : "?") + "body=" + encodeURIComponent(body) : "");
  });

  /* 카톡 상담 창 */
  var dlg = $("#kakao"), copied = $("#k-copied");
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(function () { return copyOld(text); });
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
  function openKakao(didCopy) {
    copied.hidden = !didCopy;
    if (!dlg.open) dlg.showModal();
    $(".m-close", dlg).focus();
  }
  $$("[data-kakao]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.kakaoText;
      if (t) copy(t).then(function () { openKakao(true); }, function () { openKakao(false); });
      else openKakao(false);
    });
  });
  $(".m-close", dlg).addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
})();
