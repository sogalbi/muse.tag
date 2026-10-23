/* CARBLISS 자동 생성 엔진 (브라우저용 빌드) */
window.CB = (function () {
  var mods = {}; function req(n) { return mods[n]; }
  var m1 = { exports: {} }; ((function (module, exports, require) {
// CARBLISS 정적 콘텐츠 카탈로그
// 서비스·차종·지역·교육 과정 등 사이트 전반에서 공유하는 기준 데이터입니다.
// 보증 기간·성능 수치처럼 확정되지 않은 내용은 넣지 않고 "상담 시 안내"로 표기합니다.

const SERVICES = [
  {
    slug: 'ppf',
    code: 'PPF',
    ko: 'PPF',
    en: 'PAINT PROTECTION FILM',
    title: 'PPF 도장 보호 필름',
    tagline: '처음의 도장면을, 가장 오래.',
    short: '투명 우레탄 필름으로 스톤칩·생활 스크래치로부터 도장면을 보호합니다.',
    intro:
      'PPF(Paint Protection Film)는 차량 도장면 위에 투명한 우레탄 필름을 덧입혀 주행 중 튀는 돌, 세차 스크래치, 생활 흠집으로부터 차량을 보호하는 시공입니다. 카블리스는 차량의 라인과 운행 환경에 맞춰 시공 범위를 제안하고, 엣지와 이음새까지 정밀하게 마감합니다.',
    image: 'svc-ppf',
    detect: [/PPF/i, /도장\s?보호/, /생활\s?보호/],
    keywords: ['PPF', '신차 PPF', '전체 PPF', '프론트 PPF', '생활보호 PPF', '열차단 루프 PPF'],
    options: [
      { name: '프론트 패키지', desc: '본넷·범퍼·헤드램프·사이드미러 등 비석이 집중되는 전면부 보호' },
      { name: '전체 PPF', desc: '차량 외장 도장면 전체를 감싸는 풀 커버리지 보호' },
      { name: '생활보호 패키지', desc: '도어컵·도어엣지·트렁크 리드 등 손이 자주 닿는 부위' },
      { name: '열차단 루프 PPF', desc: '글라스 루프·파노라마 선루프의 햇빛 부담을 줄이는 루프 시공' },
    ],
    points: [
      { h: '차종별 패턴 설계', p: '차량마다 다른 라인과 곡면에 맞춰 재단 방식과 랩핑 범위를 결정합니다.' },
      { h: '엣지·이음새 마감', p: '눈에 띄기 쉬운 끝단과 이음새를 최소화하도록 꼼꼼하게 마감합니다.' },
      { h: '신차 출고 직후 시공', p: '도장면이 가장 깨끗한 출고 직후 시공을 권장하며, 일정 조율을 도와드립니다.' },
    ],
    process: ['차량 상태 점검·시공 범위 상담', '세정·탈지·도장면 디컨태미네이션', '패턴 재단·필름 준비', '부위별 정밀 시공·엣지 마감', '경화 확인·최종 검수·관리 안내'],
    care: '시공 직후 며칠은 고압 세차와 자동 세차를 피하고, 필름 끝단을 직접 강하게 문지르지 않는 것이 좋습니다. 필름 종류와 보증 조건은 상담 시 자세히 안내해 드립니다.',
    faq: [
      { q: 'PPF는 신차에만 시공할 수 있나요?', a: '운행 중인 차량도 가능합니다. 다만 기존 스크래치나 도장 상태에 따라 사전 광택·보정이 필요할 수 있어 차량 확인 후 안내해 드립니다.' },
      { q: '부분 시공도 가능한가요?', a: '네. 프론트, 생활보호 부위, 루프 등 필요한 부위만 선택해 시공할 수 있습니다.' },
      { q: '시공 기간은 얼마나 걸리나요?', a: '시공 범위와 차종에 따라 다릅니다. 상담 시 차량과 범위를 확인한 뒤 정확한 입고 일정을 안내해 드립니다.' },
    ],
  },
  {
    slug: 'wrapping',
    code: 'WRAP',
    ko: '랩핑',
    en: 'WRAPPING',
    title: '컬러 랩핑 · 크롬죽이기',
    tagline: '도장 없이, 완전히 새로운 인상으로.',
    short: '컬러 체인지 랩핑부터 크롬죽이기·데칼까지 차량의 인상을 바꿉니다.',
    intro:
      '랩핑은 원래의 도장을 보존하면서 필름으로 차량의 색상과 질감을 바꾸는 작업입니다. 전체 컬러 체인지는 물론, 크롬 몰딩을 블랙으로 정리하는 크롬죽이기, 루프·미러·데칼 같은 부분 포인트까지 차량의 분위기에 맞춰 제안합니다.',
    image: 'svc-wrapping',
    detect: [/랩핑/, /래핑/, /크롬\s?죽이기/, /크롬\s?딜리트/, /데칼/, /블랙팩/],
    keywords: ['랩핑', '전체 랩핑', '컬러 랩핑', '크롬죽이기', '크롬딜리트', '데칼'],
    options: [
      { name: '전체 컬러 랩핑', desc: '유광·무광·새틴·크롬 등 필름 질감까지 선택하는 컬러 체인지' },
      { name: '크롬죽이기', desc: '윈도우 몰딩·그릴·엠블럼 등 크롬 부위를 블랙으로 정리' },
      { name: '부분 랩핑', desc: '루프·사이드미러·스포일러 등 포인트 컬러 연출' },
      { name: '데칼 · 그래픽', desc: '레터링, 스트라이프 등 개성 있는 그래픽 연출' },
    ],
    points: [
      { h: '필름 질감 상담', p: '같은 색상이라도 유광·무광·새틴·크롬에 따라 인상이 달라 실물 샘플로 비교해 드립니다.' },
      { h: '탈거·재조립 마감', p: '필요한 부위는 탈거 후 시공해 끝단이 드러나지 않도록 정리합니다.' },
      { h: '원래 도장 보존', p: '필름 시공이므로 원래 도장을 그대로 보존하며, 추후 제거도 상담 가능합니다.' },
    ],
    process: ['컬러·필름 샘플 상담', '세정·탈지·필요 부위 탈거', '패널별 재단·래핑', '엣지 마감·재조립', '최종 검수·관리 안내'],
    care: '시공 후 초기에는 고압수를 필름 끝단에 직접 분사하지 않도록 주의해 주세요. 필름 종류별 관리 방법과 보증 조건은 상담 시 안내해 드립니다.',
    faq: [
      { q: '랩핑 후 원래 색으로 되돌릴 수 있나요?', a: '필름 시공이기 때문에 제거가 가능합니다. 필름 상태와 기간에 따라 작업 방식이 달라 상담 후 안내해 드립니다.' },
      { q: '크롬죽이기만 따로 할 수 있나요?', a: '네. 윈도우 몰딩, 그릴, 엠블럼 등 원하는 부위만 선택해 시공할 수 있습니다.' },
      { q: '컬러는 어떻게 고르나요?', a: '매장에서 실물 샘플을 차량에 대어 보며 비교할 수 있습니다. 차량 색상과 실내 톤을 함께 고려해 제안해 드립니다.' },
    ],
  },
  {
    slug: 'tinting',
    code: 'TINT',
    ko: '썬팅',
    en: 'WINDOW TINTING',
    title: '썬팅 · 열차단 필름',
    tagline: '시야는 선명하게, 실내는 쾌적하게.',
    short: '운전 환경과 차량에 맞춘 농도·필름 선택으로 쾌적한 실내를 만듭니다.',
    intro:
      '썬팅은 단순히 유리를 어둡게 만드는 작업이 아니라 시야, 실내 온도, 자외선, 프라이버시까지 영향을 주는 작업입니다. 카블리스는 주행 습관과 차량 유리 구조를 확인하고, 전면·측후면 농도와 필름을 함께 설계합니다. 반사 필름, 열차단 필름 등 다양한 선택지를 상담 시 비교해 드립니다.',
    image: 'svc-tinting',
    detect: [/썬팅/, /선팅/, /틴팅/, /반사\s?필름/, /열차단\s?필름/, /레이노/, /넥서스/],
    keywords: ['썬팅', '신차 썬팅', '열차단 썬팅', '반사 썬팅', '썬팅 농도', '썬팅 재시공'],
    options: [
      { name: '신차 썬팅', desc: '출고 직후 전면·측후면 맞춤 농도 시공' },
      { name: '반사 · 열차단 필름', desc: '외관 반사감과 열차단 성능을 함께 고려한 필름' },
      { name: '썬팅 재시공', desc: '기포·변색된 기존 필름 제거 후 재시공' },
      { name: '루프 · 썬루프', desc: '글라스 루프·썬루프 열 부담 완화' },
    ],
    points: [
      { h: '농도 맞춤 설계', p: '야간 시야와 주간 눈부심을 함께 고려해 전면·측후면 농도를 제안합니다.' },
      { h: '필름 선택 상담', p: '가격만이 아닌 시공 품질과 사용 환경을 기준으로 필름을 비교해 드립니다.' },
      { h: '기존 필름 제거', p: '재시공 시 기존 필름과 잔여 접착제를 꼼꼼하게 제거한 뒤 시공합니다.' },
    ],
    process: ['주행 환경·농도 상담', '유리 세정·기존 필름 제거(재시공 시)', '필름 재단·열성형', '정밀 시공·물기 제거', '건조 안내·최종 검수'],
    care: '시공 직후 며칠은 창문 개폐를 피하고, 필름이 완전히 건조될 때까지 안쪽 유리를 닦지 않는 것이 좋습니다. 필름 브랜드별 성능과 보증은 상담 시 안내해 드립니다.',
    faq: [
      { q: '전면 농도는 어느 정도가 좋나요?', a: '야간 운전 빈도와 시야 선호도에 따라 다릅니다. 실물 샘플로 비교한 뒤 운전 환경에 맞춰 제안해 드립니다.' },
      { q: '오래된 썬팅에 기포가 생겼어요.', a: '필름 노후로 접착력이 약해진 경우가 많습니다. 기존 필름을 제거하고 재시공하는 방식으로 진행합니다.' },
      { q: '어떤 필름 브랜드를 쓰나요?', a: '차량과 예산, 원하는 성능에 맞춰 여러 필름을 비교해 안내해 드립니다. 카블리스 자체 필름도 출시를 준비하고 있습니다.' },
    ],
  },
  {
    slug: 'seatbelt',
    code: 'BELT',
    ko: '컬러 안전벨트',
    en: 'COLOR SEAT BELTS',
    title: '컬러 안전벨트 교체',
    tagline: '문을 여는 순간, 달라지는 실내.',
    short: '순정 실내에 확실한 포인트 — 레드·블루·라임 등 컬러 안전벨트 통교체.',
    intro:
      '안전벨트는 운전석과 조수석에서 가장 먼저 눈에 들어오는 실내 요소입니다. 카블리스는 기존 벨트 웨빙을 컬러 웨빙으로 교체해 순정의 감성은 유지하면서 실내 분위기에 확실한 포인트를 더합니다. 실내 시트 컬러와 외장 색상을 함께 고려해 어울리는 컬러를 제안합니다.',
    image: 'svc-seatbelt',
    detect: [/안전\s?벨트/, /시트\s?벨트/],
    keywords: ['컬러 안전벨트', '안전벨트 교체', '컬러벨트', '실내 튜닝', '안전벨트 색상'],
    options: [
      { name: '1열 교체', desc: '운전석·조수석 포인트 교체' },
      { name: '전 좌석 교체', desc: '1·2열(차종별 3열) 통일감 있는 교체' },
      { name: '컬러 선택', desc: '레드·블루·퓨어블루·옐로우·라임·핑크·퍼플 등' },
    ],
    points: [
      { h: '차종별 작업 방식', p: '차종마다 다른 벨트 구조를 확인하고 그에 맞는 방식으로 작업합니다.' },
      { h: '실내 톤 매칭', p: '시트·스티칭·외장 컬러를 함께 보고 가장 잘 어울리는 컬러를 제안합니다.' },
      { h: '작동 점검', p: '교체 후 벨트 인출·되감김과 버클 체결 상태를 꼼꼼히 점검합니다.' },
    ],
    process: ['차종 확인·컬러 상담', '시트·트림 탈거', '웨빙 교체 작업', '재조립·작동 점검', '최종 검수·출고'],
    care: '컬러 웨빙은 일반 안전벨트와 동일하게 사용하시면 됩니다. 오염 시 중성 세정제로 가볍게 닦아 주세요.',
    faq: [
      { q: '어떤 컬러가 가장 인기 있나요?', a: '블랙 실내에는 레드가 가장 많이 선택되고, 블루·옐로우·라임 등 개성 있는 컬러도 꾸준히 시공되고 있습니다.' },
      { q: '1열만 교체해도 되나요?', a: '네. 운전석·조수석만 교체하는 경우가 많고, 원하시면 전 좌석 교체도 가능합니다.' },
      { q: '작업 시간은 얼마나 걸리나요?', a: '차종과 좌석 수에 따라 다르며, 예약 상담 시 예상 시간을 안내해 드립니다.' },
    ],
  },
  {
    slug: 'leather-restoration',
    code: 'REST',
    ko: '가죽 복원',
    en: 'LEATHER RESTORATION',
    title: '가죽 시트 · 핸들 복원',
    tagline: '교체 대신, 본래의 질감으로.',
    short: '시트 까짐·갈라짐·담배빵·핸들 마모를 교체 없이 복원합니다.',
    intro:
      '운전석 시트의 까짐, 갈라짐, 담배빵(열손상), 핸들의 마모와 번들거림은 오래 탄 차량에서 가장 먼저 눈에 띄는 노후 흔적입니다. 카블리스는 손상 부위의 상태를 확인한 뒤 세척·보수·컬러 매칭·코팅 과정을 거쳐 교체하지 않고도 자연스러운 상태로 복원합니다.',
    image: 'svc-leather-restoration',
    detect: [/가죽\s?복원/, /시트\s?복원/, /핸들.{0,6}복원/, /담배빵/, /까진\s?시트/, /갈라짐/],
    keywords: ['가죽복원', '시트 복원', '핸들 복원', '담배빵 복원', '가죽시트 수리', '실내 복원'],
    options: [
      { name: '시트 복원', desc: '까짐·갈라짐·주름·색 빠짐 보수' },
      { name: '열손상 복원', desc: '담배빵 등 열에 의한 가죽 손상 보수' },
      { name: '핸들 복원', desc: '마모·번들거림·색상 벗겨짐 복원' },
      { name: '도어트림 · 팔걸이', desc: '손이 자주 닿는 실내 가죽 부위 보수' },
    ],
    points: [
      { h: '손상 진단 우선', p: '교체가 필요한 상태인지, 복원이 적합한 상태인지 먼저 확인해 정직하게 안내합니다.' },
      { h: '컬러 매칭', p: '기존 가죽 색상과 질감에 맞춰 조색해 복원 부위가 도드라지지 않게 합니다.' },
      { h: '표면 코팅', p: '복원 후 보호 코팅으로 마감해 일상 사용에 대비합니다.' },
    ],
    process: ['손상 부위 진단', '세척·탈지', '보수·충진·샌딩', '컬러 매칭·도색', '보호 코팅·건조·검수'],
    care: '복원 직후에는 충분히 건조될 때까지 강한 마찰을 피해 주세요. 정기적인 가죽 클리닝과 보습 관리가 복원 상태를 오래 유지하는 데 도움이 됩니다.',
    faq: [
      { q: '시트를 교체해야 할지 복원해야 할지 모르겠어요.', a: '사진을 보내주시거나 방문하시면 손상 정도를 확인해 복원이 적합한지 먼저 안내해 드립니다.' },
      { q: '담배빵도 복원되나요?', a: '열손상 범위에 따라 다르지만 대부분 충진·컬러 매칭으로 자연스럽게 복원할 수 있습니다.' },
      { q: '작업 기간은요?', a: '손상 범위와 부위 수에 따라 다릅니다. 상담 시 예상 일정을 함께 안내해 드립니다.' },
    ],
  },
  {
    slug: 'leather-coloring',
    code: 'COLOR',
    ko: '가죽 염색',
    en: 'LEATHER COLORING',
    title: '실내 가죽 염색 · 컬러 체인지',
    tagline: '같은 차, 전혀 다른 실내.',
    short: '핸들·시트·도어트림 가죽을 원하는 컬러로 바꾸는 실내 컬러 체인지.',
    intro:
      '가죽 염색은 실내 가죽의 색상을 원하는 컬러로 바꾸거나 바랜 색을 되살리는 작업입니다. 핸들을 블랙에서 레드로, 시트를 투톤으로 바꾸는 등 실내 분위기를 완전히 새롭게 만들 수 있습니다. 가죽 상태에 맞춰 전처리부터 컬러 도포, 코팅까지 단계별로 진행합니다.',
    image: 'svc-leather-coloring',
    detect: [/가죽\s?염색/, /염색/, /컬러\s?변경/, /컬러\s?체인지/, /투톤/],
    keywords: ['가죽염색', '핸들 염색', '시트 염색', '실내 컬러 체인지', '핸들 컬러 변경'],
    options: [
      { name: '핸들 컬러 변경', desc: '블랙→레드 등 핸들 전체·부분 컬러 체인지' },
      { name: '시트 염색', desc: '바랜 색 복원 또는 원하는 컬러로 변경' },
      { name: '투톤 · 포인트', desc: '사이드 볼스터·스티칭 라인 포인트 컬러' },
    ],
    points: [
      { h: '전처리 공정', p: '기존 코팅과 오염을 제거해 컬러가 고르게 정착하도록 준비합니다.' },
      { h: '맞춤 조색', p: '원하는 컬러를 샘플로 확인하고 실내 톤과 어울리도록 조색합니다.' },
      { h: '내구 코팅', p: '컬러 도포 후 코팅으로 마감해 일상 사용에 대비합니다.' },
    ],
    process: ['컬러 상담·샘플 확인', '세척·전처리', '부분 보수(필요 시)', '컬러 도포', '코팅·건조·최종 검수'],
    care: '염색 직후에는 충분한 건조 시간이 필요합니다. 이후 중성 가죽 클리너로 관리하시면 컬러를 오래 유지할 수 있습니다.',
    faq: [
      { q: '밝은 색에서 어두운 색, 어두운 색에서 밝은 색 모두 가능한가요?', a: '가능합니다. 다만 어두운 색에서 밝은 색으로 바꿀 때는 공정이 늘어날 수 있어 상담 시 안내해 드립니다.' },
      { q: '핸들만 바꿔도 분위기가 달라지나요?', a: '핸들은 운전 중 계속 시야에 들어오는 부위라 컬러만 바꿔도 실내 인상이 크게 달라집니다.' },
      { q: '색이 옷에 묻어나지 않나요?', a: '전처리와 코팅 공정을 거쳐 마감하며, 충분히 건조된 뒤 출고합니다.' },
    ],
  },
];

// 블로그에서 확인된 부가 서비스 (상세 페이지 없이 안내)
const EXTRA_SERVICES = [
  { slug: 'newcar', ko: '신차패키지', en: 'NEW CAR PACKAGE', desc: '썬팅·PPF·생활보호 등 출고 직후 필요한 시공을 차량과 예산에 맞춰 한 번에 구성합니다.', detect: [/신차\s?패키지/] },
  { slug: 'headliner', ko: '천장 · 헤드라이너', en: 'HEADLINER', desc: '처진 천장(헤드라이너) 복원과 스웨이드 마감으로 실내 분위기를 정돈합니다.', detect: [/천장/, /헤드라이너/] },
  { slug: 'ambient', ko: '앰비언트 · 풋등', en: 'AMBIENT LIGHT', desc: '실내 무드를 완성하는 앰비언트 라이트와 풋등 시공.', detect: [/앰비언트/, /풋등/] },
  { slug: 'care', ko: '에바크리닝', en: 'A/C CARE', desc: '에어컨 냄새의 원인인 에바포레이터를 세정해 쾌적한 공조 환경을 되찾습니다.', detect: [/에바\s?크리닝/, /에바포레이터/, /에어컨\s?냄새/] },
];

const ALL_SERVICE_TAGS = [...SERVICES.map(s => ({ slug: s.slug, ko: s.ko, en: s.en })), ...EXTRA_SERVICES.map(s => ({ slug: s.slug, ko: s.ko, en: s.en }))];

const BRANDS = [
  { slug: 'mercedes-benz', ko: '벤츠', en: 'MERCEDES-BENZ', detect: [/벤츠/, /메르세데스/, /G-?클래스/, /지바겐/, /\bGLE\b/, /\bGLC\b/, /\bGLS\b/, /[ESC]-?클래스/, /\bAMG\b/i, /마이바흐/] },
  { slug: 'bmw', ko: 'BMW', en: 'BMW', detect: [/\bBMW\b/i, /비엠더블유/, /[3578]\s?시리즈/, /\bX[3-7]\b/, /\bi[47X]\b/] },
  { slug: 'porsche', ko: '포르쉐', en: 'PORSCHE', detect: [/포르쉐/, /카이엔/, /마칸/, /타이칸/, /파나메라/, /\b911\b/] },
  { slug: 'audi', ko: '아우디', en: 'AUDI', detect: [/아우디/, /\bAudi\b/i] },
  { slug: 'land-rover', ko: '랜드로버', en: 'LAND ROVER', detect: [/랜드로버/, /레인지로버/, /디펜더/] },
  { slug: 'genesis', ko: '제네시스', en: 'GENESIS', detect: [/제네시스/, /\bG[789]0\b/, /\bGV[678]0\b/] },
  { slug: 'hyundai', ko: '현대', en: 'HYUNDAI', detect: [/현대/, /그랜저/, /아반떼/, /산타페/, /싼타페/, /펠리세이드/, /팰리세이드/, /쏘나타/, /투싼/, /아이오닉/, /스타리아/, /캐스퍼/, /코나/] },
  { slug: 'kia', ko: '기아', en: 'KIA', detect: [/기아/, /\bEV[3-9]\b/, /\bK[3589]\b/, /\bK7\b/, /카니발/, /쏘렌토/, /스포티지/, /셀토스/, /모하비/] },
  { slug: 'tesla', ko: '테슬라', en: 'TESLA', detect: [/테슬라/, /모델\s?[3SXY]\b/, /사이버트럭/] },
  { slug: 'ford', ko: '포드', en: 'FORD', detect: [/포드/, /머스탱/, /익스플로러/, /브롱코/] },
  { slug: 'mini', ko: '미니', en: 'MINI', detect: [/미니\s?쿠퍼/, /\bMINI\b/] },
  { slug: 'volkswagen', ko: '폭스바겐', en: 'VOLKSWAGEN', detect: [/폭스바겐/, /골프/, /티구안/, /아테온/] },
  { slug: 'renault', ko: '르노', en: 'RENAULT', detect: [/르노/, /\bQM[36]\b/, /\bXM3\b/, /\bSM[3567]\b/] },
  { slug: 'volvo', ko: '볼보', en: 'VOLVO', detect: [/볼보/, /\bXC[469]0\b/] },
  { slug: 'lexus', ko: '렉서스', en: 'LEXUS', detect: [/렉서스/] },
  { slug: 'etc', ko: '기타', en: 'OTHERS', detect: [] },
];

// 모델 감지(순서 중요: 구체적인 패턴을 먼저)
const MODELS = [
  { re: /G-?클래스|지바겐|G\s?바겐/, brand: 'mercedes-benz', name: 'G-클래스' },
  { re: /\bGLE\b/, brand: 'mercedes-benz', name: 'GLE' },
  { re: /\bGLC\b/, brand: 'mercedes-benz', name: 'GLC' },
  { re: /\bGLS\b/, brand: 'mercedes-benz', name: 'GLS' },
  { re: /E-?클래스/, brand: 'mercedes-benz', name: 'E-클래스' },
  { re: /S-?클래스/, brand: 'mercedes-benz', name: 'S-클래스' },
  { re: /5\s?시리즈/, brand: 'bmw', name: '5시리즈' },
  { re: /3\s?시리즈/, brand: 'bmw', name: '3시리즈' },
  { re: /7\s?시리즈/, brand: 'bmw', name: '7시리즈' },
  { re: /\bX5\b/, brand: 'bmw', name: 'X5' },
  { re: /\bX7\b/, brand: 'bmw', name: 'X7' },
  { re: /카이엔/, brand: 'porsche', name: '카이엔' },
  { re: /타이칸/, brand: 'porsche', name: '타이칸' },
  { re: /\bGV80\b/, brand: 'genesis', name: 'GV80' },
  { re: /\bGV70\b/, brand: 'genesis', name: 'GV70' },
  { re: /\bG90\b/, brand: 'genesis', name: 'G90' },
  { re: /\bG80\b/, brand: 'genesis', name: 'G80' },
  { re: /그랜저\s?HG/, brand: 'hyundai', name: '그랜저 HG' },
  { re: /그랜저/, brand: 'hyundai', name: '그랜저' },
  { re: /아반떼\s?N/, brand: 'hyundai', name: '아반떼 N' },
  { re: /아반떼/, brand: 'hyundai', name: '아반떼' },
  { re: /산타페|싼타페/, brand: 'hyundai', name: '싼타페' },
  { re: /펠리세이드|팰리세이드/, brand: 'hyundai', name: '팰리세이드' },
  { re: /아이오닉\s?5/, brand: 'hyundai', name: '아이오닉 5' },
  { re: /아이오닉\s?6/, brand: 'hyundai', name: '아이오닉 6' },
  { re: /쏘나타/, brand: 'hyundai', name: '쏘나타' },
  { re: /\bEV9\b/, brand: 'kia', name: 'EV9' },
  { re: /\bEV6\b/, brand: 'kia', name: 'EV6' },
  { re: /카니발/, brand: 'kia', name: '카니발' },
  { re: /\bK5\b/, brand: 'kia', name: 'K5' },
  { re: /\bK7\b/, brand: 'kia', name: 'K7' },
  { re: /\bK8\b/, brand: 'kia', name: 'K8' },
  { re: /쏘렌토/, brand: 'kia', name: '쏘렌토' },
  { re: /모델\s?Y\b/, brand: 'tesla', name: '모델 Y' },
  { re: /모델\s?X\b/, brand: 'tesla', name: '모델 X' },
  { re: /모델\s?3\b/, brand: 'tesla', name: '모델 3' },
  { re: /머스탱/, brand: 'ford', name: '머스탱' },
  { re: /미니\s?쿠퍼\s?컨버터블/, brand: 'mini', name: '쿠퍼 컨버터블' },
  { re: /미니\s?쿠퍼/, brand: 'mini', name: '쿠퍼' },
  { re: /폭스바겐\s?CC|\bCC\b/, brand: 'volkswagen', name: 'CC' },
  { re: /\bQM3\b/, brand: 'renault', name: 'QM3' },
  { re: /\bQM6\b/, brand: 'renault', name: 'QM6' },
];

const REGIONS = [
  { slug: 'changwon', ko: '창원', detect: [/창원/, /의창/, /성산/, /상남/] },
  { slug: 'gimhae', ko: '김해', detect: [/김해/] },
  { slug: 'masan', ko: '마산', detect: [/마산/] },
  { slug: 'jinhae', ko: '진해', detect: [/진해/] },
  { slug: 'gyeongnam', ko: '경남', detect: [/경남/, /경상남도/] },
];

const ACADEMY = {
  intro:
    '카블리스 아카데미는 실제 시공이 이루어지는 매장에서 진행하는 현장 중심 기술 교육입니다. 이론보다 손으로 익히는 실습을 중심으로, 입문자부터 업계 종사자, 창업 희망자까지 목표에 맞는 과정을 상담을 통해 설계합니다.',
  tracks: [
    { slug: 'ppf', name: 'PPF 시공 과정', en: 'PPF', desc: '도장면 준비, 필름 재단, 부위별 시공과 엣지 마감까지 PPF 전 과정을 실습합니다.' },
    { slug: 'wrapping', name: '랩핑 시공 과정', en: 'WRAPPING', desc: '필름 특성 이해, 곡면 래핑, 크롬죽이기 등 랩핑 핵심 기술을 다룹니다.' },
    { slug: 'tinting', name: '썬팅 시공 과정', en: 'TINTING', desc: '유리 구조 이해, 열성형, 시공과 재시공(필름 제거)까지 실습합니다.' },
    { slug: 'interior', name: '실내 · 가죽 과정', en: 'INTERIOR', desc: '가죽 복원·염색, 컬러 안전벨트 교체 등 실내 커스텀 기술을 익힙니다.' },
  ],
  audiences: [
    { name: '입문자', en: 'BEGINNER', desc: '자동차 필름·실내 시공을 처음 배우는 분. 기초 공구 사용과 기본 공정부터 시작합니다.' },
    { name: '업계 종사자', en: 'PROFESSIONAL', desc: '현업에서 시공 중인 분. 특정 기술의 완성도를 높이거나 새 분야를 추가하려는 분.' },
    { name: '창업 희망자', en: 'FOUNDER', desc: '시공점 창업을 준비하는 분. 기술 교육 후 창업·체인점 상담으로 연결됩니다.' },
  ],
  flow: ['교육 상담 신청', '목표·경험 수준 확인', '과정·일정 설계', '매장 현장 실습', '이수 후 창업·협력 상담 연계'],
  note: '교육 과정, 일정, 교육비는 개설 상황에 따라 달라지며 상담 시 확정해 안내해 드립니다.',
};

const PARTNERSHIP = {
  franchise: {
    name: 'CARBLISS FRANCHISE',
    ko: '체인점',
    target: '카블리스 브랜드로 매장을 운영하려는 신규 창업자·사업자',
    cta: '체인점 개설 상담',
    points: ['카블리스 브랜드·매장 아이덴티티', '시공 기술 교육(아카데미 연계)', '운영 노하우 공유', '자체 필름 등 제품 공급(출시 시)'],
  },
  partner: {
    name: 'CARBLISS PARTNER',
    ko: '협력점',
    target: '기존 상호를 유지하며 제품·기술 제휴를 희망하는 업체',
    cta: '협력점 제휴 상담',
    points: ['기존 상호 유지', '기술 교육·노하우 제휴', '제품 공급 제휴(출시 시)', '시공 협업 네트워크'],
  },
  process: ['상담 신청', '1차 상담(유선·방문)', '조건·지역 검토', '세부 협의', '계약·교육·오픈 준비'],
  note: '지원 내용, 가맹 조건, 계약 구조는 실제 정책 확정 후 상세히 안내해 드립니다. 정식 가맹사업 진행 시 관련 법적 요건(정보공개서 등)을 준수합니다.',
};

const INQUIRY_TYPES = {
  service: { ko: '시공 문의', en: 'SERVICE' },
  academy: { ko: '교육 문의', en: 'ACADEMY' },
  franchise: { ko: '체인점 문의', en: 'FRANCHISE' },
  partner: { ko: '협력점 · 필름 문의', en: 'PARTNER · FILM' },
};

const INQUIRY_STATUS = {
  new: '신규',
  contacted: '연락 완료',
  scheduled: '예약 · 일정 확정',
  done: '완료',
  closed: '보류 · 종료',
};

const THEMES = [
  { slug: 'signature', name: 'SIGNATURE', ko: '시그니처 (② + ③ 믹스)', desc: 'BRABUS의 강렬한 블랙과 Range Rover의 절제된 여백을 결합한 카블리스 추천 디자인. 다크 히어로와 웜톤 섹션이 교차합니다.', hero: 'hero-signature', recommended: true },
  { slug: 'midnight', name: 'MIDNIGHT', ko: '미드나잇 (기획안 블랙)', desc: '기획안 1차 시안의 딥블랙·차콜·실버 컬러. 프리미엄 자동차 광고의 절제된 고급스러움.', hero: 'hero-gt' },
  { slug: 'brabus', name: 'BRABUS STYLE', ko: '브라부스 스타일', desc: '올블랙·카본·레드 포인트. 굵은 컨덴스드 타이포와 각진 버튼으로 강렬한 슈퍼카 무드.', hero: 'hero-brabus' },
  { slug: 'rangerover', name: 'RANGE ROVER STYLE', ko: '레인지로버 스타일', desc: '밝은 스톤 톤과 넓은 자간, 여유로운 여백. 공간과 차량 중심의 절제된 럭셔리.', hero: 'hero-rr' },
];

const byslug = (arr, slug) => arr.find(x => x.slug === slug);

module.exports = {
  SERVICES, EXTRA_SERVICES, ALL_SERVICE_TAGS, BRANDS, MODELS, REGIONS, ACADEMY, PARTNERSHIP,
  INQUIRY_TYPES, INQUIRY_STATUS, THEMES,
  service: slug => byslug(SERVICES, slug) || byslug(EXTRA_SERVICES, slug),
  brand: slug => byslug(BRANDS, slug),
  region: slug => byslug(REGIONS, slug),
  serviceTag: slug => byslug(ALL_SERVICE_TAGS, slug),
};

}))(m1, m1.exports, req); mods['./catalog'] = m1.exports;
  var m2 = { exports: {} }; ((function (module, exports, require) {
// CARBLISS 자동 콘텐츠 생성 엔진
// 관리자가 차량·시공 정보와 사진을 올리면 다음을 자동으로 만듭니다.
//  - 포트폴리오 제목/요약/본문 섹션, 이미지 대체텍스트
//  - 검색엔진용 제목·설명·키워드
//  - 네이버 블로그 초안, 인스타그램 캡션, 카카오 채널 알림 문구
// 외부 API 없이 동작하는 템플릿 엔진이며, src/ai.js가 있으면 문장을 한 번 더 다듬습니다.
const C = require('./catalog');

// 한국 시간 기준 오늘 날짜
const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

// ── 한국어 조사 처리 ─────────────────────────────────────
function hasBatchim(word) {
  const s = String(word || '').trim();
  if (!s) return false;
  const ch = s[s.length - 1];
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  // 영문·숫자: 읽을 때 받침 여부 (L, M, N, R, 1, 3, 6, 7, 8, 0 등)
  if (/[lmnr]$/i.test(s)) return true;
  if (/[136780]$/.test(s)) return true;
  return false;
}
function josa(word, pair) {
  const [a, b] = pair.split('/'); // 예: '은/는', '이/가', '을/를', '과/와', '으로/로'
  if (pair === '으로/로') {
    const s = String(word).trim(); const code = s.charCodeAt(s.length - 1);
    const rieul = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 === 8;
    return word + (hasBatchim(word) && !rieul ? a : b);
  }
  return word + (hasBatchim(word) ? a : b);
}

// ── 텍스트 분석 (블로그 이관·자동 분류에 사용) ────────────────
function matchAny(text, patterns) { return patterns.some(re => re.test(text)); }

function analyzeText(text) {
  const t = String(text || '');
  const services = [];
  for (const s of [...C.SERVICES, ...C.EXTRA_SERVICES]) if (matchAny(t, s.detect)) services.push(s.slug);
  // '컬러 변경'이 핸들·시트가 아닌 외장 랩핑 문맥이면 가죽 염색에서 제외
  if (services.includes('leather-coloring') && !/(핸들|시트|가죽|도어트림|스티어링)/.test(t)) services.splice(services.indexOf('leather-coloring'), 1);
  let model = null;
  for (const m of C.MODELS) if (m.re.test(t)) { model = m; break; }
  let brand = model ? model.brand : null;
  if (!brand) for (const b of C.BRANDS) if (b.detect.length && matchAny(t, b.detect)) { brand = b.slug; break; }
  let region = null;
  for (const r of C.REGIONS) if (matchAny(t, r.detect)) { region = r.slug; break; }
  return { services, brand: brand || 'etc', model: model ? model.name : '', region: region || 'changwon' };
}

// ── 서비스별 문장 소스 ─────────────────────────────────────
const LINES = {
  ppf: {
    need: '출고 직후의 깨끗한 도장면을 오래 유지하고 싶다는 요청으로 상담을 시작했습니다',
    work: '세정과 탈지로 도장면을 준비한 뒤, 차량 라인에 맞춰 필름을 재단하고 비석이 집중되는 부위부터 엣지 마감까지 꼼꼼하게 시공했습니다',
    result: '시공 후에도 차량 본연의 광택과 컬러는 그대로 살아 있으면서, 주행 중 튀는 돌과 생활 스크래치에 대한 부담을 덜 수 있습니다',
    hash: ['PPF', '신차PPF', '생활보호PPF'],
  },
  wrapping: {
    need: '차량의 첫인상을 새롭게 바꾸고 싶다는 요청으로 상담을 시작했습니다',
    work: '실물 필름 샘플로 컬러와 질감을 비교해 결정한 뒤, 필요한 부위는 탈거 후 패널별로 래핑하고 끝단이 드러나지 않도록 마감했습니다',
    result: '원래 도장은 그대로 보존하면서 차량의 분위기가 완전히 달라졌습니다',
    hash: ['랩핑', '자동차랩핑', '크롬죽이기'],
  },
  tinting: {
    need: '여름철 실내 열기와 눈부심은 줄이면서 야간 시야는 확보하고 싶다는 요청으로 상담을 시작했습니다',
    work: '운전 환경을 확인해 전면·측후면 농도를 정하고, 유리 세정 후 필름을 열성형해 기포 없이 밀착 시공했습니다',
    result: '외관은 한층 정돈되고, 실내는 햇빛 부담이 줄어 더 쾌적한 운전 환경이 되었습니다',
    hash: ['썬팅', '신차썬팅', '열차단썬팅'],
  },
  seatbelt: {
    need: '순정 실내는 유지하면서 확실한 포인트를 주고 싶다는 요청으로 상담을 시작했습니다',
    work: '차종별 벨트 구조를 확인한 뒤 시트와 트림을 탈거하고 컬러 웨빙으로 교체했으며, 재조립 후 인출·되감김과 버클 체결 상태를 점검했습니다',
    result: '문을 여는 순간 컬러 벨트가 먼저 눈에 들어올 만큼 실내 분위기가 확실하게 달라졌습니다',
    hash: ['컬러안전벨트', '안전벨트교체', '실내튜닝'],
  },
  'leather-restoration': {
    need: '손상된 실내 가죽을 교체 대신 복원할 수 있는지 문의를 주셨습니다',
    work: '손상 정도를 먼저 진단한 뒤 세척·탈지, 보수와 충진, 샌딩, 컬러 매칭을 거쳐 보호 코팅으로 마감했습니다',
    result: '교체하지 않고도 손상 부위가 자연스럽게 정돈되어 실내 전체의 인상이 깔끔해졌습니다',
    hash: ['가죽복원', '시트복원', '핸들복원'],
  },
  'leather-coloring': {
    need: '실내 가죽의 색상을 바꿔 분위기를 새롭게 하고 싶다는 요청으로 상담을 시작했습니다',
    work: '컬러 샘플로 색상을 확정하고, 기존 코팅과 오염을 제거하는 전처리 후 컬러를 여러 차례 도포해 코팅으로 마감했습니다',
    result: '같은 차량이지만 실내에 들어서는 순간 전혀 다른 분위기를 느낄 수 있게 되었습니다',
    hash: ['가죽염색', '핸들염색', '실내컬러체인지'],
  },
  newcar: {
    need: '신차 출고에 맞춰 필요한 시공을 한 번에 진행하고 싶다는 요청이었습니다',
    work: '차량과 운행 환경, 예산을 확인해 꼭 필요한 항목으로 패키지를 구성하고 일정에 맞춰 순서대로 작업했습니다',
    result: '출고 직후부터 보호와 편의를 모두 갖춘 상태로 운행을 시작할 수 있게 되었습니다',
    hash: ['신차패키지', '신차출고'],
  },
  headliner: {
    need: '천장(헤드라이너)이 처져 운전 중에도 신경이 쓰인다는 문의를 주셨습니다',
    work: '헤드라이너를 탈거해 기존 원단과 노후된 접착층을 정리하고, 새 원단으로 마감한 뒤 재장착했습니다',
    result: '처짐 없이 팽팽하게 정돈되어 실내가 한층 깔끔해졌습니다',
    hash: ['천장처짐', '헤드라이너'],
  },
  ambient: {
    need: '야간 실내 분위기를 바꾸고 싶다는 요청이었습니다',
    work: '차량 구조에 맞춰 배선 경로를 설계하고 조명을 깔끔하게 매립 시공했습니다',
    result: '밤에 문을 열었을 때 실내 무드가 완전히 달라졌습니다',
    hash: ['앰비언트라이트', '풋등'],
  },
  care: {
    need: '에어컨을 켤 때 올라오는 냄새 때문에 방문해 주셨습니다',
    work: '냄새의 원인인 에바포레이터 상태를 확인하고 전용 장비로 세정·건조했습니다',
    result: '공조기에서 올라오던 불쾌한 냄새가 정리되어 쾌적한 실내 공기를 되찾았습니다',
    hash: ['에바크리닝', '에어컨냄새'],
  },
};

const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };
const firstSentence = s => (String(s || '').split(/(?<=[.!?。])\s+|\n/)[0] || '').trim();

function serviceKo(slug) { const s = C.service(slug); return s ? s.ko : slug; }

// ── 메인 생성 함수 ────────────────────────────────────────
function generateCase(input, settings = {}) {
  const brand = C.brand(input.brand) || C.brand('etc');
  const region = C.region(input.region) || C.region('changwon');
  const services = (input.services || []).filter(s => C.service(s));
  if (!services.length) services.push('ppf');
  const main = services[0];
  const svcNames = services.map(serviceKo);
  const svcJoined = svcNames.join(' · ');
  const model = String(input.model || '').trim();
  const brandKo = brand.slug === 'etc' ? '' : brand.ko;
  const car = [brandKo, model].filter(Boolean).join(' ') || '고객 차량';
  const detail = String(input.detail || '').trim(); // 예: "형광 라임", "고광택 크롬레드", "전면 35%·측후면 15%"
  const memo = String(input.memo || '').trim();
  const date = input.date || today();
  const brandName = settings.brandKo || '카블리스';

  // 제목
  const headline = `${car} ${detail ? detail + ' ' : ''}${svcNames.length > 1 ? svcJoined : svcNames[0]}`.replace(/\s+/g, ' ').trim();
  const title = `${region.ko} ${svcNames[0]}, ${headline} 시공`;

  // 요약
  const summary = `${region.ko} ${brandName}에서 진행한 ${car} ${svcJoined} 작업입니다. ${firstSentence(memo) || LINES[main].result + '.'}`;

  // 본문 섹션
  const memoFlat = memo.replace(/\s*\n+\s*/g, ' ');
  const need = memo
    ? (model && memo.includes(model) ? memoFlat : `${josa(car, '은/는')} ${memoFlat}`)
    : `${josa(car, '은/는')} ${LINES[main].need}.`;
  const workLines = services.map(s => `${serviceKo(s)}: ${LINES[s].work}.`);
  const resultLine = services.map(s => LINES[s].result).slice(0, 2).join('. ') + '.';
  const careLines = services.map(s => (C.service(s).care || '')).filter(Boolean);

  const sections = [
    { h: '입고 및 상담', p: need },
    { h: '작업 내용', p: workLines.join('\n') },
    { h: '완성 포인트', p: `${detail ? josa(detail, '이/가') + ' 적용된 ' : ''}${josa(car, '은/는')} ${resultLine}` },
  ];
  if (careLines.length) sections.push({ h: '관리 안내', p: careLines[0] });

  const highlights = [
    { k: '차량', v: car },
    { k: '시공', v: svcJoined },
    ...(detail ? [{ k: '옵션 · 컬러', v: detail }] : []),
    { k: '지역', v: `${region.ko} · ${brandName} 매장` },
    { k: '작업일', v: date },
  ];

  // SEO
  const seoTitle = clip(`${region.ko} ${svcNames[0]} | ${headline} 시공 사례 - ${settings.brandName || 'CARBLISS'}`, 60);
  const seoDescription = clip(`${region.ko} ${brandName}에서 작업한 ${car} ${svcJoined} 시공 사례입니다. ${detail ? detail + ' 적용, ' : ''}작업 과정과 완성 사진을 확인하고 상담을 신청하세요.`, 155);
  const kw = new Set();
  for (const s of svcNames) {
    kw.add(`${region.ko} ${s}`); kw.add(`경남 ${s}`);
    if (model) kw.add(`${model} ${s}`);
    if (brandKo) kw.add(`${brandKo} ${s}`);
    if (region.slug !== 'changwon') kw.add(`창원 ${s}`);
  }
  if (model) kw.add(`${brandKo} ${model}`.trim());
  kw.add(brandName); kw.add('CARBLISS');
  const keywords = [...kw].slice(0, 14);

  // 이미지 대체 텍스트
  const roleKo = { before: '시공 전', after: '시공 후', process: '작업 과정', detail: '디테일' };
  const images = (input.images || []).map((im, i) => ({
    ...im,
    alt: im.alt || `${car} ${svcNames[0]} ${roleKo[im.role] || '시공'} 사진 ${i + 1} - ${region.ko} ${brandName}`,
  }));

  // 해시태그
  const tags = new Set();
  for (const s of services) {
    for (const h of LINES[s].hash) { tags.add('#' + region.ko + h); tags.add('#' + h); }
  }
  if (model) tags.add('#' + (brandKo + model).replace(/\s+/g, ''));
  if (brandKo) tags.add('#' + brandKo + serviceKo(main).replace(/\s+/g, ''));
  ['#카블리스', '#CARBLISS', '#경남' + serviceKo(main).replace(/\s+/g, ''), '#' + region.ko + '자동차'].forEach(t => tags.add(t));
  const hashtags = [...tags].slice(0, 20);

  // 블로그 초안 (네이버 블로그 문체)
  const s = settings;
  const blogTitles = [
    `${region.ko} ${svcNames[0]}, ${headline} 시공 후기 | ${brandName}`,
    `${car} ${svcJoined}, 실제 작업 과정과 완성 사진 | ${region.ko} ${brandName}`,
    `${region.ko} ${svcNames[0]} 잘하는 곳 찾는다면? ${car} 실제 작업 사례`,
  ];
  const blog = [
    `[제목 후보]`,
    ...blogTitles.map((t, i) => `${i + 1}. ${t}`),
    '',
    `안녕하세요. ${region.ko} 자동차 커스터마이징 전문 ${brandName}(CARBLISS)입니다.`,
    `오늘 소개해 드릴 차량은 ${car}입니다.`,
    `이번 작업은 ${svcJoined} 시공으로 진행했습니다.${detail ? ` 선택하신 옵션은 ${detail}입니다.` : ''}`,
    '',
    '■ 상담 내용',
    need,
    '',
    '■ 작업 과정',
    ...services.flatMap(sv => [`[${serviceKo(sv)}]`, ...(C.service(sv).process || []).map((p, i) => `${i + 1}. ${p}`), LINES[sv].work + '.', '']),
    '■ 완성',
    sections[2].p,
    '',
    ...(careLines.length ? ['■ 관리 팁', careLines[0], ''] : []),
    `${svcNames[0]} 상담은 차량 상태와 원하시는 방향을 먼저 확인한 뒤 진행됩니다. 사진과 함께 문의 주시면 더 정확하게 안내해 드리겠습니다.`,
    '',
    '■ 카블리스 안내',
    `· 주소: ${s.address || ''}`,
    `· 전화: ${s.phone || ''}`,
    s.bookingUrl ? `· 네이버 예약: ${s.bookingUrl}` : '',
    s.instagramUrl ? `· 인스타그램: @car.bliss` : '',
    `· 카카오톡 채널: 카블리스`,
    '',
    hashtags.join(' '),
  ].filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n');

  const instagram = [
    `${car} | ${svcJoined}`,
    detail ? `${detail}` : '',
    '',
    `${LINES[main].result}.`,
    '',
    `📍 ${region.ko} ${brandName} · 상담은 DM 또는 카카오톡 채널 “카블리스”`,
    '.',
    hashtags.join(' '),
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');

  const kakao = `[${brandName} 시공 사례] ${car} ${svcJoined} 작업을 소개합니다. ${clip(LINES[main].result, 50)}. 상담·예약은 채널 메시지로 편하게 문의 주세요.`;

  // 슬러그 (한글 포함 — 네이버 검색에 유리한 서술형 URL)
  const slug = [region.ko, svcNames[0], brandKo, model, detail].filter(Boolean).join('-')
    .replace(/[·|,()%]/g, ' ').trim().replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase();

  return {
    title, headline, slug, summary, sections, highlights, images,
    services, brand: brand.slug, model, region: region.slug, detail, memo, date,
    brandKo, regionKo: region.ko, serviceNames: svcNames,
    seo: { title: seoTitle, description: seoDescription, keywords },
    drafts: { blogTitles, blog, instagram, kakao, hashtags },
  };
}

// 지역 × 서비스 랜딩 페이지 문구
function localLanding(regionSlug, serviceSlug, settings = {}, cases = []) {
  const region = C.region(regionSlug); const svc = C.service(serviceSlug);
  if (!region || !svc) return null;
  const brandName = settings.brandKo || '카블리스';
  const isHome = region.slug === 'changwon';
  const access = isHome
    ? `${brandName} 매장은 창원시 의창구에 있어 창원 전 지역에서 방문하기 편리합니다.`
    : `${brandName} 매장은 창원시 의창구에 있으며, ${region.ko}에서도 많은 고객님들이 찾아 주시고 있습니다. 방문 일정은 예약 상담으로 맞춰 드립니다.`;
  const models = [...new Set(cases.map(c => [C.brand(c.brand)?.ko, c.model].filter(Boolean).join(' ')).filter(Boolean))].slice(0, 6);
  return {
    h1: `${region.ko} ${svc.ko}`,
    title: `${region.ko} ${svc.ko} 전문 | ${svc.title} - ${settings.brandName || 'CARBLISS'} ${brandName}`,
    description: clip(`${region.ko} ${svc.ko} 상담부터 시공까지, ${brandName}에서 차량에 맞춘 ${svc.ko} 작업을 진행합니다. ${svc.short}`, 155),
    intro: `${region.ko}에서 ${josa(svc.ko, '을/를')} 알아보고 계신다면 가격보다 먼저 확인해야 할 것이 있습니다. ${svc.intro}`,
    access,
    models,
    keywords: [`${region.ko} ${svc.ko}`, `${region.ko} ${svc.ko} 잘하는 곳`, `${region.ko} ${svc.ko} 가격`, ...svc.keywords.map(k => `${region.ko} ${k}`)].slice(0, 10),
  };
}

module.exports = { generateCase, analyzeText, localLanding, josa, clip, today };

}))(m2, m2.exports, req);
  return Object.assign({ catalog: m1.exports }, m2.exports);
})();