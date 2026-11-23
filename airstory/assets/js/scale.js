/* 에어스토리 크기 그림
   제품을 사람 키(1.7 m)·주차 1칸(2.5 × 5 m)과 같은 비율로 그린다.
   ASScale.side(길이, 높이, 옵션)   옆에서 본 모습 (SVG 문자열)
   ASScale.plan(가로, 세로, 원형)   위에서 본 바닥 ({svg, step})
   ASScale.figure(제품)             두 그림 + 설명 (HTML 문자열, 크기가 없으면 "")
   제품 = {w, d, h, round, size} (단위 m) */
(function () {
  "use strict";
  var PERSON_H = 1.7, PERSON_W = 0.5, PARK_W = 2.5, PARK_L = 5;
  var uid = 0;

  function fmt(v) { return String(+(+v).toFixed(2)); }       // 17.65 → "17.65", 10 → "10"
  function f(v) { return Math.round(v * 10) / 10; }           // 좌표는 소수 한 자리
  function svgOpen(W, H, label, cls) {
    return '<svg class="' + cls + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">';
  }

  /* 사람 실루엣: 폭 0.5 m × 키 1.7 m 를 미터 단위로 그린 뒤 s(px/m) 배로 늘린다 */
  function person(x, gy, s) {
    return '<g class="sc-person" transform="translate(' + f(x) + " " + f(gy - PERSON_H * s) + ") scale(" + (+s.toFixed(4)) + ')">' +
      '<circle cx=".25" cy=".12" r=".11"/><rect x=".07" y=".26" width=".36" height=".6" rx=".12"/>' +
      '<rect x="0" y=".3" width=".08" height=".5" rx=".04"/><rect x=".42" y=".3" width=".08" height=".5" rx=".04"/>' +
      '<rect x=".1" y=".76" width=".13" height=".94" rx=".06"/><rect x=".27" y=".76" width=".13" height=".94" rx=".06"/></g>';
  }

  /* 치수선 */
  function dimX(x1, x2, y, label) {
    return '<g class="sc-dim"><line x1="' + f(x1) + '" y1="' + f(y) + '" x2="' + f(x2) + '" y2="' + f(y) + '"/>' +
      '<line x1="' + f(x1) + '" y1="' + f(y - 5) + '" x2="' + f(x1) + '" y2="' + f(y + 5) + '"/>' +
      '<line x1="' + f(x2) + '" y1="' + f(y - 5) + '" x2="' + f(x2) + '" y2="' + f(y + 5) + '"/></g>' +
      '<text class="sc-t" x="' + f((x1 + x2) / 2) + '" y="' + f(y + 19) + '" text-anchor="middle">' + label + "</text>";
  }
  function dimY(x, y1, y2, label) {
    return '<g class="sc-dim"><line x1="' + f(x) + '" y1="' + f(y1) + '" x2="' + f(x) + '" y2="' + f(y2) + '"/>' +
      '<line x1="' + f(x - 5) + '" y1="' + f(y1) + '" x2="' + f(x + 5) + '" y2="' + f(y1) + '"/>' +
      '<line x1="' + f(x - 5) + '" y1="' + f(y2) + '" x2="' + f(x + 5) + '" y2="' + f(y2) + '"/></g>' +
      '<text class="sc-t" x="' + f(x + 8) + '" y="' + f((y1 + y2) / 2 + 5) + '">' + label + "</text>";
  }
  /* 작은 비교 대상(사람·주차칸) 위에 이름표 + 가리키는 선 */
  function tag(cx, targetTop, labelY, text) {
    var out = '<text class="sc-tl" x="' + f(cx - 2) + '" y="' + f(labelY) + '">' + text + "</text>";
    if (targetTop - labelY > 12) out += '<line class="sc-lead" x1="' + f(cx) + '" y1="' + f(labelY + 5) + '" x2="' + f(cx) + '" y2="' + f(targetTop - 3) + '"/>';
    return out;
  }

  /* 옆에서 본 모습: 긴 변 × 높이, 왼쪽에 사람 */
  function side(len, h, o) {
    o = o || {};
    var compact = !!o.compact;
    var W = compact ? 220 : 400, H = compact ? 70 : 214;
    var ml = compact ? 4 : 16, mr = compact ? 4 : 70, mt = compact ? 4 : 34, mb = compact ? 5 : 42;
    var gap = Math.max(0.8, len * 0.05);
    var totalW = PERSON_W + gap + len, totalH = Math.max(h, PERSON_H);
    var s = Math.min((W - ml - mr) / totalW, (H - mt - mb) / totalH);
    if (!compact) H = Math.max(120, Math.round(totalH * s + mt + mb));   // 아주 긴 제품은 빈 위쪽을 줄인다
    var x0 = ml + ((W - ml - mr) - totalW * s) / 2, gy = H - mb;
    var bx = x0 + (PERSON_W + gap) * s, bw = len * s, bh = h * s;
    var rx = Math.min(bh * (compact ? 0.16 : 0.3), bw * 0.12, 22);
    var label = "옆에서 본 크기: 길이 " + fmt(len) + " m, 높이 " + fmt(h) + " m. 왼쪽은 키 1.7 m 사람";
    var out = svgOpen(W, H, label, "sc-svg" + (compact ? " sc-mini" : ""));
    out += '<line class="sc-ground" x1="' + f(ml - (compact ? 4 : 6)) + '" y1="' + f(gy) + '" x2="' + f(W - (compact ? 0 : 10)) + '" y2="' + f(gy) + '"/>';
    out += '<rect class="sc-body" x="' + f(bx) + '" y="' + f(gy - bh) + '" width="' + f(bw) + '" height="' + f(bh) + '" rx="' + f(rx) + '"/>';
    if (bh > 14 && bw > 30) {   // 바람 넣은 원단의 이음선 느낌
      var sy = gy - bh + Math.max(4, bh * 0.2);
      out += '<line class="sc-seam" x1="' + f(bx + rx + 2) + '" y1="' + f(sy) + '" x2="' + f(bx + bw - rx - 2) + '" y2="' + f(sy) + '"/>';
    }
    out += person(x0, gy, s);
    if (!compact) {
      out += dimX(bx, bx + bw, gy + 12, fmt(len) + " m");
      out += dimY(bx + bw + 12, gy, gy - bh, fmt(h) + " m");
      var top = gy - Math.max(bh, PERSON_H * s);
      out += tag(x0 + PERSON_W * s / 2, gy - PERSON_H * s, Math.max(14, top - 12), "사람 1.7 m");
    }
    return out + "</svg>";
  }

  /* 위에서 본 바닥: 가로 × 세로(긴 변을 가로로), 왼쪽에 주차 1칸 */
  function plan(w, d, round, o) {
    o = o || {};
    var L = Math.max(w, d), S = round ? L : Math.min(w, d);
    var W = 400, H = 234, ml = 16, mr = 70, mt = 34, mb = 42;
    var gap = Math.max(1, L * 0.05);
    var totalW = PARK_W + gap + L, totalH = Math.max(S, PARK_L);
    var s = Math.min((W - ml - mr) / totalW, (H - mt - mb) / totalH);
    H = Math.max(130, Math.round(totalH * s + mt + mb));
    var x0 = ml + ((W - ml - mr) - totalW * s) / 2, gy = H - mb;
    var pw = PARK_W * s, pl = PARK_L * s;
    var bx = x0 + (PARK_W + gap) * s, bw = L * s, bh = S * s, by = gy - bh;
    var steps = [0.5, 1, 2, 5, 10, 20], step = 20;
    for (var i = 0; i < steps.length; i++) if (steps[i] * s >= 10) { step = steps[i]; break; }
    var id = "scg" + (++uid), cell = step * s;
    var label = "위에서 본 바닥: " + (round ? "지름 " + fmt(L) : "가로 " + fmt(L) + " m, 세로 " + fmt(S)) + " m. 왼쪽은 주차 1칸(2.5 × 5 m)";
    var out = svgOpen(W, H, label, "sc-svg");
    out += '<defs><pattern id="' + id + '" patternUnits="userSpaceOnUse" x="' + f(bx) + '" y="' + f(by) + '" width="' + f(cell) + '" height="' + f(cell) + '">' +
      '<path class="sc-grid" d="M' + f(cell) + " 0H0V" + f(cell) + '" fill="none"/></pattern></defs>';
    // 주차 1칸
    out += '<rect class="sc-park" x="' + f(x0) + '" y="' + f(gy - pl) + '" width="' + f(pw) + '" height="' + f(pl) + '" rx="' + f(Math.min(3, pw * 0.1)) + '"/>';
    if (pw >= 16) out += '<text class="sc-p" x="' + f(x0 + pw / 2) + '" y="' + f(gy - pl / 2 + 6) + '" text-anchor="middle">P</text>';
    out += tag(x0 + pw / 2, gy - pl, Math.max(14, gy - Math.max(pl, bh) - 12), "주차 1칸");
    // 제품 바닥
    var shape;
    if (round) {
      var r = bw / 2;
      shape = function (cls, fill) { return '<circle class="' + cls + '"' + (fill ? ' fill="' + fill + '"' : "") + ' cx="' + f(bx + r) + '" cy="' + f(gy - r) + '" r="' + f(r) + '"/>'; };
    } else {
      var rx = Math.min(bh * 0.08, bw * 0.08, 10);
      shape = function (cls, fill) { return '<rect class="' + cls + '"' + (fill ? ' fill="' + fill + '"' : "") + ' x="' + f(bx) + '" y="' + f(by) + '" width="' + f(bw) + '" height="' + f(bh) + '" rx="' + f(rx) + '"/>'; };
    }
    out += shape("sc-foot") + shape("sc-gridfill", "url(#" + id + ")") + shape("sc-edge");
    if (o.area && bw >= 84 && bh >= 30) {
      var area = round ? Math.PI * L * L / 4 : w * d;
      out += '<text class="sc-area" x="' + f(bx + bw / 2) + '" y="' + f(gy - bh / 2 + 6) + '" text-anchor="middle">약 ' + Math.round(area) + " ㎡</text>";
    }
    out += dimX(bx, bx + bw, gy + 12, (round ? "지름 " : "") + fmt(L) + " m");
    if (!round) out += dimY(bx + bw + 12, gy, by, fmt(S) + " m");
    return { svg: out + "</svg>", step: step };
  }

  function panel(title, key, svg) {
    return '<div class="sc-panel"><p class="sc-h">' + title + " <span>" + key + "</span></p>" + svg + "</div>";
  }

  function figure(p) {
    if (!p || !(p.w > 0) || !(p.d > 0)) return "";
    var size = p.size || "", multi = size.indexOf("+") > -1, alt = size.indexOf("/") > -1;
    var len = Math.max(p.w, p.d), html = '<div class="sc-panels">';
    if (p.h > 0) html += panel("옆에서 본 모습", p.round ? "지름 × 높이" : "긴 변 × 높이", side(len, p.h));
    var pl = plan(p.w, p.d, !!p.round, { area: !multi && !alt });
    html += panel("위에서 본 바닥", p.round ? "지름" : "가로 × 세로", pl.svg) + "</div>";
    var cap = "사람 키 1.7 m, 주차 1칸 2.5 × 5 m를 제품과 같은 비율로 그렸습니다. 바닥 격자 한 칸은 " + fmt(pl.step) + " m입니다.";
    if (multi) cap += " 두 부분을 이어 붙인 전체 크기(대략)입니다.";
    if (alt) cap += " 두 가지 크기 중 첫 번째 크기로 그렸습니다.";
    cap += " 본체 크기 기준이라 송풍기와 안전 공간은 따로 필요합니다.";
    return html + '<p class="sc-cap">' + cap + "</p>";
  }

  window.ASScale = { side: side, plan: plan, figure: figure };
})();
