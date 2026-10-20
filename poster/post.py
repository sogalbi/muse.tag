"""muse.tag 클라우드 게시 — GitHub Actions 가 한국 시각 07:12 · 11:42 · 17:42 에 부른다 (사용자 10/20 '컴퓨터가 꺼져 있어도 자동으로')

컴퓨터(cloud_queue.py push)가 미리 올려 둔 poster/queue/<날짜>-<회차>.json 을 보고, 회차 시각이 되면 인스타 API 로 게시한다.
  1. 오늘 회차 중 '시작 25분 전 ~ 마감' 사이이고 queue 가 있고 done 이 없는(또는 실패한) 것 하나
  2. poster/done/<날짜>-<회차>.json 에 '올리는 중' 표시를 먼저 커밋 (컴퓨터 쪽 보조 게시와 겹치지 않게)
  3. 회차 시각까지 기다림 → 캐러셀(사진 10장까지)·릴스 게시 → done 에 결과(주소) 커밋
표준 라이브러리만 쓴다. 환경변수: IG_TOKEN(Actions 비밀값) · DRY=1(안 보냄) · NOW(시험용 'YYYY-MM-DDTHH:MM') · IG_API · NO_GIT=1(시험용)
마감(아침 11:30 · 점심 17:30 · 저녁 21:30)이 지났으면 안 올린다. 결과는 표준출력과 done 파일.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

KST = dt.timezone(dt.timedelta(hours=9))
START = {1: (7, 30), 2: (12, 0), 3: (18, 0)}
END = {1: (11, 30), 2: (17, 30), 3: (21, 30)}
EARLY = dt.timedelta(minutes=25)
WAIT = dt.timedelta(minutes=25)  # 다른 쪽 '올리는 중'이 (그 표시 시각·회차 시각 중 늦은 쪽) + 25분이 지나도 그대로면 멈춘 것으로 본다
HERE = Path(os.environ.get("POSTER_DIR") or Path(__file__).resolve().parent)
QUEUE, DONE = HERE / "queue", HERE / "done"
API = os.environ.get("IG_API", "https://graph.instagram.com/v25.0").rstrip("/")
NAMES = {1: "아침", 2: "점심", 3: "저녁"}


class Fail(Exception):
    pass


def now() -> dt.datetime:
    v = os.environ.get("NOW")
    return dt.datetime.fromisoformat(v).replace(tzinfo=KST) if v else dt.datetime.now(KST)


def at(day: dt.date, hm) -> dt.datetime:
    return dt.datetime.combine(day, dt.time(*hm), KST)


def times(q: dict) -> tuple[dt.datetime, dt.datetime]:
    day, slot = dt.date.fromisoformat(q["date"]), int(q["slot"])
    start = at(day, tuple(map(int, q["start"].split(":")))) if q.get("start") else at(day, START[slot])
    return start, max(at(day, END[slot]), start + dt.timedelta(hours=1, minutes=30))


def stuck(d: dict, start: dt.datetime, t: dt.datetime) -> bool:
    try:
        since = dt.datetime.fromisoformat(d["at"][:19]).replace(tzinfo=KST)
    except (KeyError, ValueError):
        since = start
    return t > max(since, start) + WAIT


def pick(t: dt.datetime) -> tuple[Path, dict] | None:
    """지금 처리할 회차: 시작 25분 전 ~ 마감 사이, 아직 안 올린 것 중 가장 이른 것 ('올리는 중'이 멈춘 것도 다시)"""
    for f in sorted(QUEUE.glob(f"{t.date().isoformat()}-*.json")):
        q = json.loads(f.read_text(encoding="utf-8"))
        start, end = times(q)
        done = DONE / f.name
        d = json.loads(done.read_text(encoding="utf-8")) if done.exists() else {}
        if d.get("status") in ("posted", "skipped") or (d.get("status") == "posting" and not stuck(d, start, t)):
            continue
        if start - EARLY <= t <= end:
            return f, q
    return None


def git(*args) -> bool:
    if os.environ.get("NO_GIT"):
        return True
    r = subprocess.run(["git", *args], cwd=HERE.parent, capture_output=True, text=True)
    if r.returncode:
        print("git", *args, "→", r.stderr.strip()[:300])
    return r.returncode == 0


def write_done(name: str, rec: dict, msg: str, claim=False) -> bool:
    """done 파일을 쓰고 커밋·푸시 (푸시가 밀리면 받아서 다시, 3번까지).
    claim=True(올리기 전 '올리는 중' 표시)일 때 다른 쪽(컴퓨터)이 그 회차를 이미 올렸거나 올리는 중이면 False"""
    DONE.mkdir(parents=True, exist_ok=True)
    path = DONE / name
    for _ in range(3):
        path.write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding="utf-8")
        if not (git("add", str(path)) and git("commit", "-m", msg)):
            return False
        if git("push"):
            return True
        git("reset", "--hard", "HEAD~1")  # 누가 먼저 밀었다 → 받아 보고 다시
        git("pull", "--rebase")
        if claim and path.exists() and json.loads(path.read_text(encoding="utf-8")).get("status") in ("posted", "posting"):
            return False
    return False


def call(method: str, path: str, params: dict) -> dict:
    url = f"{API}/{path}"
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url + ("?" + data.decode() if method == "GET" else ""), data=None if method == "GET" else data, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="ignore")[:300]
        raise Fail(f"{method} {path} → {e.code}: {body}") from None


def wait_ready(cid: str, tok: str, tries=40, every=8):
    for _ in range(tries):
        st = call("GET", cid, {"fields": "status_code", "access_token": tok}).get("status_code")
        if st == "FINISHED":
            return
        if st in ("ERROR", "EXPIRED"):
            raise Fail(f"인스타가 처리하지 못했어요: {st}")
        time.sleep(every)
    raise Fail("인스타 처리 시간이 너무 오래 걸려요")


def check_public(urls: list[str], limit=300, every=15):
    left, t0 = list(urls), time.time()
    while left:
        bad = []
        for u in left:
            try:
                with urllib.request.urlopen(urllib.request.Request(u, method="HEAD"), timeout=20) as r:
                    if r.status != 200:
                        bad.append(u)
            except Exception:
                bad.append(u)
        left = bad
        if left and time.time() - t0 > limit:
            raise Fail(f"공개 주소가 안 열려요: {left[0]}")
        if left:
            time.sleep(every)


def publish(q: dict, tok: str, ready=wait_ready) -> str:
    uid = str(q["ig_user_id"])
    if q["action"] == "reel":
        check_public([q["video"]])
        c = call("POST", f"{uid}/media", {"media_type": "REELS", "video_url": q["video"], "caption": q["caption"],
                                          "thumb_offset": str(q.get("thumb_offset", 1800)), "access_token": tok})
        ready(c["id"], tok)
    else:
        imgs = q["images"][:10]
        if len(imgs) < 2:
            raise Fail("캐러셀은 사진 2장 이상이어야 해요")
        check_public(imgs)
        kids = [call("POST", f"{uid}/media", {"image_url": u, "is_carousel_item": "true", "access_token": tok})["id"] for u in imgs]
        c = call("POST", f"{uid}/media", {"media_type": "CAROUSEL", "children": ",".join(kids), "caption": q["caption"], "access_token": tok})
        ready(c["id"], tok)
    m = call("POST", f"{uid}/media_publish", {"creation_id": c["id"], "access_token": tok})
    try:  # 게시는 이미 됐다 — 주소만 못 받아도 실패로 치지 않는다 (두 번 올라가지 않게)
        return call("GET", m["id"], {"fields": "permalink", "access_token": tok}).get("permalink", "")
    except Fail:
        return "https://www.instagram.com/muse.tag/"


def refresh_token(tok: str) -> str:
    """장기 토큰(60일) 연장 시도 — 값은 출력하지 않고 결과만: same(같은 값으로 늘어남) · new(새 값 — 비밀값을 바꿔야 오래 감) · fail"""
    root = re.sub(r"/v\d+(\.\d+)?$", "", API)  # 연장 주소엔 버전이 없다
    try:
        url = f"{root}/refresh_access_token?" + urllib.parse.urlencode({"grant_type": "ig_refresh_token", "access_token": tok})
        with urllib.request.urlopen(url, timeout=30) as r:
            j = json.loads(r.read().decode())
        days = int(j.get("expires_in", 0)) // 86400
        return ("same" if j.get("access_token") == tok else "new") + f" {days}일"
    except Exception:
        return "fail"


def main(sleep=time.sleep) -> int:
    dry = os.environ.get("DRY") == "1"
    t = now()
    got = pick(t)
    if not got:
        print(f"{t:%m/%d %H:%M} 지금 올릴 회차가 없어요")
        return 0
    f, q = got
    start, _ = times(q)
    what = f"{q['date']} {NAMES.get(int(q['slot']), q['slot'])} {q['kit']} {('릴스' if q['action'] == 'reel' else '캐러셀')}"
    tok = os.environ.get("IG_TOKEN", "")
    if not tok and not dry:
        print("⛔ IG_TOKEN 비밀값이 없어요 (저장소 Settings → Secrets → Actions)")
        return 1
    if dry:
        print(f"미리보기(안 보냄): {what} · 사진 {len(q.get('images', []))}장 · {start:%H:%M} 게시 예정")
        return 0
    if not write_done(f.name, {"status": "posting", "by": "cloud", "at": t.isoformat(timespec="seconds"), "kit": q["kit"]}, f"올리는 중: {what}", claim=True):
        print(f"⏭ {what}: 다른 쪽(컴퓨터)이 이미 올렸거나 올리는 중")
        return 0
    if now() < start:
        sleep(max(0, (start - now()).total_seconds()))
    try:
        url = publish(q, tok)
        rec = {"status": "posted", "by": "cloud", "at": now().isoformat(timespec="seconds"), "kit": q["kit"], "action": q["action"],
               "rec": q.get("rec", "instagram"), "url": url, "token": refresh_token(tok)}
        print(f"✅ {what}: {url}")
        code = 0
    except Fail as e:
        rec = {"status": "failed", "by": "cloud", "at": now().isoformat(timespec="seconds"), "kit": q["kit"], "error": str(e)}
        print(f"⛔ {what}: {e}")
        code = 1
    write_done(f.name, rec, f"{'올림' if code == 0 else '실패'}: {what}")
    return code


if __name__ == "__main__":
    sys.exit(main())
