import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ServerStackIcon,
  BoltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * 자세히 페이지.
 *
 * 탭 3개 (URL 쿼리로 유지: /details?tab=team | signup | k6)
 *   1. 팀원 소개
 *   2. 가입 안내
 *   3. MuShop 대상 k6 부하 테스트 결과
 *
 * 내용 수정은 아래 데이터 상수만 바꾸면 됨.
 */

// =====================================================================
// 1. 팀원 정보  (TODO: 실제 팀원 정보로 교체)
// =====================================================================
interface TeamMember {
  name: string;
  role: string; // 직책
  part: string; // 담당 파트
  description: string;
  tags: string[];
  email?: string;
  github?: string; // 전체 URL
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: '안서진',
    role: '팀장',
    part: 'PM · 백엔드',
    description: '프로젝트 총괄, 포털 백엔드 API와 데이터베이스 설계를 담당',
    tags: ['FastAPI', 'PostgreSQL', 'MongoDB'],
    github: 'https://github.com/annseojin',
  },
  {
    name: '이태연',
    role: '팀원',
    part: '프론트엔드 · 백엔드',
    description: '고객사 포털과 관리자/고객사 대시보드 UI를 개발',
    tags: ['React', 'TypeScript', 'Tailwind'],
    github: 'https://github.com/leetaeyeon11111',
  },
  {
    name: '장재원',
    role: '팀원',
    part: '인프라 · 클라우드',
    description: 'MuShop 클라우드 웹 구축과 배포 파이프라인, 부하 테스트를 담당',
    tags: ['AWS', 'Docker', 'k6'],
    github: 'https://github.com/dodo4421',
  },
  {
    name: '이지원',
    role: '팀원',
    part: 'AI · 보안 분석',
    description: 'Shadow API 탐지, 허니팟 기만 기술, LLM 기반 위협 분석을 담당',
    tags: ['LLM', 'SOAR', 'Honeypot'],
    github: 'https://github.com/leeazyone',
  },
];

// =====================================================================
// 2. 가입 안내 단계
// =====================================================================
const SIGNUP_STEPS: { title: string; description: string; to?: string; cta?: string }[] = [
  {
    title: '회원가입',
    description:
      '회사명, 기업 이메일, 비밀번호를 입력해 계정을 만듭니다. 담당자 이름, 보안담당자 이메일, 회사 전화번호도 함께 등록할 수 있습니다.',
    to: '/signup',
    cta: '회원가입하기',
  },
  {
    title: '이메일 인증',
    description: '가입한 이메일로 발송된 인증 링크를 눌러 계정을 활성화합니다.',
  },
  {
    title: '로그인',
    description: '가입한 기업 이메일과 비밀번호로 Aegis-3 포털에 로그인합니다.',
    to: '/login',
    cta: '로그인하기',
  },
  {
    title: 'API 명세서 등록',
    description:
      'API 관리 메뉴에서 고객사명, 요금제, 보호 대상 도메인, 실제 서버 주소(Origin), OpenAPI/Swagger 명세서를 등록합니다.',
    to: '/api-manage',
    cta: 'API 관리로 이동',
  },
  {
    title: 'API Key 발급',
    description:
      '등록이 완료되면 고객사 전용 API Key가 발급됩니다. 외부에 노출되지 않도록 안전한 곳에 보관하세요.',
  },
  {
    title: '실시간 모니터링',
    description:
      '내 대시보드에서 위험도, 차단, 허니팟 유도 등 보안 이벤트를 실시간 로그로 확인합니다.',
    to: '/customer-dashboard',
    cta: '대시보드 보기',
  },
];

const SIGNUP_CHECKLIST = [
  '회사 기업 이메일 (로그인 아이디로 사용)',
  '보호할 API의 도메인 (예: api.customer.com)',
  '실제 서버 주소 (Origin)',
  'OpenAPI / Swagger 명세서 (JSON 또는 YAML)',
];

const PLANS = ['FREE', 'PRO', 'ENTERPRISE'];

// =====================================================================
// 공통 헬퍼
// =====================================================================
type TabKey = 'team' | 'signup' | 'k6';

const TABS: { key: TabKey; label: string; icon: typeof UserGroupIcon }[] = [
  { key: 'team', label: '팀원 소개', icon: UserGroupIcon },
  { key: 'signup', label: '가입 안내', icon: ClipboardDocumentCheckIcon },
  { key: 'k6', label: 'k6 테스트 결과', icon: ChartBarIcon },
];

const cardClass =
  'relative rounded-3xl border border-white/5 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl';

const SectionHeader: React.FC<{ eyebrow: string; title: string; description: string }> = ({
  eyebrow,
  title,
  description,
}) => (
  <div className="mb-10 space-y-4">
    <p className="inline-flex px-4 py-1.5 rounded-full bg-violet-500/10 text-xs font-bold uppercase tracking-widest text-violet-400 border border-violet-500/20">
      {eyebrow}
    </p>
    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
    <p className="max-w-2xl text-zinc-400 leading-relaxed">{description}</p>
  </div>
);

// =====================================================================
// 탭 1. 팀원 소개
// =====================================================================
const TeamSection: React.FC = () => (
  <section>
    <SectionHeader
      eyebrow="Our Team"
      title="Aegis-3를 만든 사람들"
      description="Shadow API 기만 기술과 LLM 기반 지능형 보안 자동 대응 시스템을 함께 설계하고 구현했습니다."
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {TEAM_MEMBERS.map((m) => (
        <a
          key={m.name}
          href={m.github || '#'}
          target={m.github ? '_blank' : undefined}
          rel={m.github ? 'noopener noreferrer' : undefined}
          className={`${cardClass} group block transition-all duration-500 hover:border-violet-500/30 hover:-translate-y-1`}
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-800 shadow-lg shadow-violet-500/20">
              {m.github ? (
                <img src={`${m.github}.png`} alt={`${m.name} GitHub profile`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-4xl font-black text-white">
                  {m.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-white">{m.name}</h3>
                <span className="rounded-full px-3 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {m.role}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-violet-400">{m.part}</p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{m.description}</p>
              <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-2">
                {m.tags.map((t) => (
                  <code
                    key={t}
                    className="rounded-lg px-2.5 py-1 text-xs bg-black/60 border border-white/10 text-zinc-300"
                  >
                    {t}
                  </code>
                ))}
              </div>
              {m.email && (
                <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  <span className="text-zinc-400 transition hover:text-violet-400">
                    {m.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
);

// =====================================================================
// 탭 2. 가입 안내
// =====================================================================
const SignupSection: React.FC = () => (
  <section>
    <SectionHeader
      eyebrow="Getting Started"
      title="가입 안내"
      description="회원가입부터 API 보호 적용, 실시간 모니터링까지 아래 순서대로 진행하면 됩니다."
    />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 단계 타임라인 */}
      <ol className="lg:col-span-2 space-y-4">
        {SIGNUP_STEPS.map((s, i) => (
          <li key={s.title} className={`${cardClass} !p-6 flex gap-5`}>
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-white shadow-lg shadow-violet-500/20">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.description}</p>
              {s.to && s.cta && (
                <Link
                  to={s.to}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 transition hover:text-white group"
                >
                  {s.cta}
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* 사이드: 준비물 + 요금제 */}
      <aside className="space-y-6">
        <div className={cardClass}>
          <h3 className="text-lg font-bold text-white">가입 전 준비할 것</h3>
          <ul className="mt-5 space-y-3">
            {SIGNUP_CHECKLIST.map((c) => (
              <li key={c} className="flex gap-3 text-sm text-zinc-300">
                <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-bold text-white">요금제</h3>
          <p className="mt-2 text-sm text-zinc-400">API 명세서 등록 시 요금제를 선택할 수 있습니다.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PLANS.map((p) => (
              <span
                key={p}
                className="rounded-full px-4 py-1.5 text-xs font-bold tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/20"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <Link
          to="/signup"
          className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
        >
          지금 시작하기
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </aside>
    </div>
  </section>
);

// =====================================================================
// 탭 3. k6 테스트 결과
// =====================================================================
/**
 * MuShop 대상 Aegis-3 부하 테스트 실측 결과 (k6, 시나리오별 4분).
 *   - 베이스라인: Aegis-3를 거치지 않고 백엔드에 직접 요청 (비교 기준)
 *   - 정상 / 공격 / 혼합: Aegis-3 프록시 경유
 *
 * 참고
 *   - WAF 판정 정확도 = (통과 2xx + 차단 4xx) / 전체 요청
 *   - 연결 실패율은 k6 http_req_failed 값이라 4xx 차단도 '실패'로 집계됨
 *   - p99 는 k6 summaryTrendStats 에 빠져 있어 0.0ms 로 찍혀서 표시하지 않음
 */
type LoadMode = 'baseline' | 'normal' | 'attack' | 'mixed';

interface LoadScenario {
  mode: LoadMode;
  name: string;
  description: string;
  route: string;
  totalRequests: number;
  rps: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  passed2xx: number;
  blocked4xx: number;
  accuracy: number | null; // %, 베이스라인은 WAF 미경유라 null
  failRate: number; // %
}

const LOAD_TEST_META = [
  { k: '대상', v: 'MuShop (자체 구축 클라우드 웹)' },
  { k: '도구', v: 'Grafana k6' },
  { k: '테스트 시간', v: '시나리오별 4분' },
  { k: '비교 기준', v: '백엔드 직접 호출 (베이스라인)' },
];

const LOAD_SCENARIOS: LoadScenario[] = [
  {
    mode: 'baseline',
    name: '베이스라인',
    description: 'Aegis-3를 거치지 않고 백엔드에 직접 요청',
    route: '백엔드 직접',
    totalRequests: 34210,
    rps: 139.8,
    avgMs: 25.7,
    p50Ms: 15.9,
    p95Ms: 80.7,
    maxMs: 826.3,
    passed2xx: 34210,
    blocked4xx: 0,
    accuracy: null,
    failRate: 0,
  },
  {
    mode: 'normal',
    name: '정상 요청 폭주',
    description: '정상 요청만 Aegis-3를 통해 대량 전송',
    route: 'Aegis-3 경유',
    totalRequests: 20008,
    rps: 81.7,
    avgMs: 296.7,
    p50Ms: 33.8,
    p95Ms: 2069.2,
    maxMs: 10624.4,
    passed2xx: 19928,
    blocked4xx: 0,
    accuracy: 99.6,
    failRate: 0.4,
  },
  {
    mode: 'attack',
    name: '공격 요청 폭주',
    description: '공격 요청만 Aegis-3를 통해 대량 전송',
    route: 'Aegis-3 경유',
    totalRequests: 23188,
    rps: 126.3,
    avgMs: 3.8,
    p50Ms: 3.5,
    p95Ms: 6.7,
    maxMs: 96.5,
    passed2xx: 0,
    blocked4xx: 23188,
    accuracy: 100,
    failRate: 100,
  },
  {
    mode: 'mixed',
    name: '혼합 요청 폭주',
    description: '정상 80% + 공격 20% 비율로 섞어서 전송',
    route: 'Aegis-3 경유',
    totalRequests: 26055,
    rps: 106.6,
    avgMs: 255.4,
    p50Ms: 28.4,
    p95Ms: 1076.2,
    maxMs: 10553.8,
    passed2xx: 20776,
    blocked4xx: 5112,
    accuracy: 99.36,
    failRate: 20.261,
  },
];

/** 이전 측정(로컬, 마스킹 적용 전) 대비 이번 측정(로컬, 마스킹 적용 + 최신). */
type Verdict = 'better' | 'same' | 'worse';

interface CompareRow {
  scenario: string;
  metric: string;
  unit: 'rps' | 'ms' | '%';
  prev: number;
  curr: number;
  verdict: Verdict;
  note: string;
}

const COMPARE_ROWS: CompareRow[] = [
  { scenario: '베이스라인', metric: 'RPS', unit: 'rps', prev: 142, curr: 139.8, verdict: 'same', note: '동일' },
  { scenario: '베이스라인', metric: 'p50', unit: 'ms', prev: 17, curr: 15.9, verdict: 'better', note: '약간 개선' },
  { scenario: '정상', metric: 'RPS', unit: 'rps', prev: 82.6, curr: 81.7, verdict: 'same', note: '동일' },
  { scenario: '정상', metric: 'p50', unit: 'ms', prev: 41.5, curr: 33.8, verdict: 'better', note: '개선' },
  { scenario: '정상', metric: 'p95', unit: 'ms', prev: 2061, curr: 2069, verdict: 'same', note: '동일' },
  { scenario: '공격', metric: 'RPS', unit: 'rps', prev: 127, curr: 126.3, verdict: 'same', note: '동일' },
  { scenario: '공격', metric: 'p50', unit: 'ms', prev: 3.5, curr: 3.5, verdict: 'same', note: '동일' },
  { scenario: '공격', metric: 'p95', unit: 'ms', prev: 6.1, curr: 6.7, verdict: 'same', note: '동일' },
  { scenario: '혼합', metric: 'RPS', unit: 'rps', prev: 104.5, curr: 106.6, verdict: 'better', note: '소폭 향상' },
  { scenario: '혼합', metric: 'p50', unit: 'ms', prev: 29.1, curr: 28.4, verdict: 'better', note: '약간 개선' },
  { scenario: '혼합', metric: 'p95', unit: 'ms', prev: 1129, curr: 1076, verdict: 'better', note: '약간 개선' },
  { scenario: '혼합', metric: 'WAF 정확도', unit: '%', prev: 99.46, curr: 99.36, verdict: 'same', note: '동일' },
];

const MODE_STYLES: Record<LoadMode, { label: string; badge: string; bar: string; text: string }> = {
  baseline: {
    label: 'BASELINE',
    badge: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
    bar: 'from-zinc-600 to-zinc-500',
    text: 'text-zinc-300',
  },
  normal: {
    label: 'NORMAL',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    bar: 'from-blue-600 to-blue-400',
    text: 'text-blue-300',
  },
  attack: {
    label: 'ATTACK',
    badge: 'bg-red-500/10 text-red-300 border-red-500/20',
    bar: 'from-red-600 to-rose-400',
    text: 'text-red-300',
  },
  mixed: {
    label: 'MIXED',
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    bar: 'from-violet-600 to-fuchsia-400',
    text: 'text-violet-300',
  },
};

const VERDICT_STYLES: Record<Verdict, string> = {
  better: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  same: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
  worse: 'bg-red-500/10 text-red-300 border-red-500/20',
};

const fmtNum = (n: number) => n.toLocaleString('ko-KR');
const fmtMs = (ms: number) => `${fmtNum(ms)}ms`;
const fmtPct = (p: number, digits = 2) => `${p.toFixed(digits)}%`;

const fmtCompareValue = (v: number, unit: CompareRow['unit']) =>
  unit === 'ms' ? fmtMs(v) : unit === '%' ? fmtPct(v) : fmtNum(v);

/** 변화량: 정확도는 %p, 나머지는 변화율(%). */
const fmtChange = (row: CompareRow) => {
  const diff = row.curr - row.prev;
  if (row.unit === '%') return `${diff > 0 ? '+' : ''}${diff.toFixed(2)}%p`;
  const pct = row.prev === 0 ? 0 : (diff / row.prev) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};

/** 가로 막대 차트 (값 비교용). */
const BarList: React.FC<{
  title: string;
  caption: string;
  items: { key: string; label: string; mode: LoadMode; value: number; display: string }[];
}> = ({ title, caption, items }) => {
  const max = Math.max(...items.map((i) => i.value)) * 1.1;
  return (
    <div className={cardClass}>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{caption}</p>
      <div className="mt-8 space-y-5">
        {items.map((i) => (
          <div key={i.key} className="grid grid-cols-[6.5rem_1fr] items-center gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate">{i.label}</p>
              <p className={`text-[11px] font-bold tracking-wider ${MODE_STYLES[i.mode].text}`}>
                {MODE_STYLES[i.mode].label}
              </p>
            </div>
            <div className="h-9 rounded-xl bg-black/60 border border-white/5">
              <div
                className={`h-full rounded-xl bg-gradient-to-r ${MODE_STYLES[i.mode].bar} flex items-center justify-end pr-3 transition-all duration-700`}
                style={{ width: `${Math.max((i.value / max) * 100, 14)}%` }}
              >
                <span className="text-xs font-bold text-white drop-shadow">{i.display}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** 시나리오 카드 (지표 + WAF 판정 분포). */
const ScenarioCard: React.FC<{ s: LoadScenario }> = ({ s }) => {
  const style = MODE_STYLES[s.mode];
  const other = s.totalRequests - s.passed2xx - s.blocked4xx;
  const pct = (n: number) => (s.totalRequests > 0 ? (n / s.totalRequests) * 100 : 0);

  const metrics = [
    { k: 'RPS', v: fmtNum(s.rps) },
    { k: '총 요청', v: fmtNum(s.totalRequests) },
    { k: '평균', v: fmtMs(s.avgMs) },
    { k: 'p50', v: fmtMs(s.p50Ms) },
    { k: 'p95', v: fmtMs(s.p95Ms) },
    { k: '최대', v: fmtMs(s.maxMs) },
  ];

  return (
    <div className={`${cardClass} group transition-all duration-500 hover:border-violet-500/30`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border ${style.badge}`}>
          {style.label}
        </span>
        <h3 className="text-lg font-bold text-white">{s.name}</h3>
        <span className="ml-auto rounded-lg px-2.5 py-1 text-[11px] bg-black/60 border border-white/10 text-zinc-400">
          {s.route}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-500">{s.description}</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.k} className="rounded-2xl border border-white/5 bg-black/40 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{m.k}</p>
            <p className="mt-1 font-mono text-sm font-bold text-zinc-100">{m.v}</p>
          </div>
        ))}
      </div>

      {/* WAF 판정 분포 */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-widest text-zinc-500">WAF 판정</span>
          <span className="text-zinc-400">
            정확도{' '}
            <span className="font-mono font-bold text-white">
              {s.accuracy === null ? '- (WAF 미경유)' : fmtPct(s.accuracy)}
            </span>
          </span>
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-black/60 border border-white/5">
          <div className="bg-emerald-400" style={{ width: `${pct(s.passed2xx)}%` }}></div>
          <div className="bg-red-400" style={{ width: `${pct(s.blocked4xx)}%` }}></div>
          <div className="bg-zinc-500" style={{ width: `${pct(other)}%` }}></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            통과 2xx <span className="font-mono text-zinc-200">{fmtNum(s.passed2xx)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400"></span>
            차단 4xx <span className="font-mono text-zinc-200">{fmtNum(s.blocked4xx)}</span>
          </span>
          {other > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
              기타 <span className="font-mono text-zinc-200">{fmtNum(other)}</span>
            </span>
          )}
          <span className="ml-auto">
            연결 실패율 <span className="font-mono text-zinc-200">{fmtPct(s.failRate, 3)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const K6Section: React.FC = () => {
  const stats = useMemo(() => {
    const byMode = (m: LoadMode) => LOAD_SCENARIOS.find((s) => s.mode === m)!;
    const baseline = byMode('baseline');
    const normal = byMode('normal');
    const attack = byMode('attack');
    const mixed = byMode('mixed');
    return {
      totalRequests: LOAD_SCENARIOS.reduce((a, s) => a + s.totalRequests, 0),
      attack,
      mixed,
      attackBlockRate: attack.totalRequests > 0 ? (attack.blocked4xx / attack.totalRequests) * 100 : 0,
      rpsDrop: (1 - normal.rps / baseline.rps) * 100,
      p50Added: normal.p50Ms - baseline.p50Ms,
      normalP95: normal.p95Ms,
      mixedOther: mixed.totalRequests - mixed.passed2xx - mixed.blocked4xx,
    };
  }, []);

  const statCards = [
    {
      label: '총 요청 수',
      value: fmtNum(stats.totalRequests),
      sub: `${LOAD_SCENARIOS.length}개 시나리오 · 각 4분`,
      icon: BoltIcon,
      color: 'text-blue-400',
    },
    {
      label: '공격 차단률',
      value: fmtPct(stats.attackBlockRate),
      sub: `공격 요청 ${fmtNum(stats.attack.blocked4xx)}건 모두 차단`,
      icon: XCircleIcon,
      color: 'text-emerald-300',
    },
    {
      label: '차단 응답 속도 (p50)',
      value: fmtMs(stats.attack.p50Ms),
      sub: `공격 요청 p95 ${fmtMs(stats.attack.p95Ms)}`,
      icon: ClockIcon,
      color: 'text-amber-400',
    },
    {
      label: '혼합 트래픽 판정 정확도',
      value: fmtPct(stats.mixed.accuracy ?? 0),
      sub: '정상 80% + 공격 20%',
      icon: ServerStackIcon,
      color: 'text-violet-400',
    },
  ];

  const insights = [
    `공격 요청 ${fmtNum(stats.attack.totalRequests)}건을 모두 4xx로 차단했고, 차단 응답은 p50 ${fmtMs(stats.attack.p50Ms)}로 즉시 반환되었습니다.`,
    `정상 80% + 공격 20% 혼합 트래픽에서 ${fmtNum(stats.mixed.passed2xx)}건 통과, ${fmtNum(stats.mixed.blocked4xx)}건 차단으로 판정 정확도 ${fmtPct(stats.mixed.accuracy ?? 0)}를 기록했습니다.`,
    `Aegis-3를 경유하면 베이스라인 대비 정상 요청 처리량이 약 ${stats.rpsDrop.toFixed(1)}% 줄고, p50 응답시간이 ${fmtMs(Number(stats.p50Added.toFixed(1)))} 늘어납니다.`,
    '데이터 마스킹 기능을 추가한 뒤에도 처리량은 이전과 같은 수준을 유지했고, 정상 요청 p50은 약 18% 개선되었습니다.',
  ];

  const notes = [
    `정상 요청 p95가 ${fmtMs(stats.normalP95)}로 높아, 일부 요청의 꼬리 지연(tail latency)이 앞으로의 개선 과제입니다.`,
    "공격 시나리오의 연결 실패율 100%는 k6가 4xx 응답을 '실패'로 집계하기 때문으로, 모든 공격 요청이 의도대로 차단되었다는 의미입니다.",
    `혼합 시나리오의 연결 실패율 20.261%도 대부분 의도된 차단(4xx)이며, 실제로 판정되지 못한 요청은 ${fmtNum(stats.mixedOther)}건입니다.`,
    'WAF 판정 정확도는 전체 요청 중 통과(2xx) 또는 차단(4xx)으로 처리된 비율입니다.',
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Load Test · k6"
        title="MuShop 부하 테스트 결과"
        description="직접 구축한 클라우드 웹 MuShop을 대상으로, Aegis-3를 거치지 않은 베이스라인과 정상 · 공격 · 혼합 트래픽을 각각 4분간 k6로 측정했습니다."
      />

      {/* 테스트 환경 */}
      <div className={`${cardClass} !p-6 mb-6 grid grid-cols-2 lg:grid-cols-4 gap-6`}>
        {LOAD_TEST_META.map((x) => (
          <div key={x.k} className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{x.k}</p>
            <p className="mt-2 text-sm font-medium text-zinc-200 break-words">{x.v}</p>
          </div>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400">{c.label}</h3>
            </div>
            <p className={`mt-5 text-3xl font-extrabold tracking-tight ${c.color}`}>{c.value}</p>
            <p className="mt-2 text-xs text-zinc-500">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarList
          title="처리량 (RPS)"
          caption="초당 처리한 요청 수 · 높을수록 좋음"
          items={LOAD_SCENARIOS.map((s) => ({
            key: s.mode,
            label: s.name,
            mode: s.mode,
            value: s.rps,
            display: fmtNum(s.rps),
          }))}
        />
        <BarList
          title="응답시간 (p50)"
          caption="요청의 절반이 이 시간 안에 응답 · 낮을수록 좋음"
          items={LOAD_SCENARIOS.map((s) => ({
            key: s.mode,
            label: s.name,
            mode: s.mode,
            value: s.p50Ms,
            display: fmtMs(s.p50Ms),
          }))}
        />
      </div>

      {/* 시나리오별 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {LOAD_SCENARIOS.map((s) => (
          <ScenarioCard key={s.mode} s={s} />
        ))}
      </div>

      {/* 이전 측정 대비 */}
      <div className={`${cardClass} !p-0 overflow-hidden mb-6`}>
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5">
          <h3 className="text-xl font-bold text-white">이전 측정 대비</h3>
          <p className="mt-1 text-sm text-zinc-500">
            지난 측정 (로컬 · 마스킹 적용 전) → 이번 측정 (로컬 · 마스킹 적용 + 최신 버전)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-white/5 bg-black/30 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3 font-semibold">시나리오</th>
                <th className="px-4 py-3 font-semibold">지표</th>
                <th className="px-4 py-3 font-semibold text-right">지난</th>
                <th className="px-4 py-3 font-semibold text-right">이번</th>
                <th className="px-4 py-3 font-semibold text-right">변화</th>
                <th className="px-6 py-3 font-semibold text-right">판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COMPARE_ROWS.map((r, i) => {
                const firstOfGroup = i === 0 || COMPARE_ROWS[i - 1].scenario !== r.scenario;
                return (
                  <tr key={`${r.scenario}-${r.metric}`} className="transition hover:bg-white/[0.02]">
                    <td className="px-6 py-3 font-semibold text-zinc-200">
                      {firstOfGroup ? r.scenario : ''}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{r.metric}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-500">
                      {fmtCompareValue(r.prev, r.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-zinc-100">
                      {fmtCompareValue(r.curr, r.unit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">{fmtChange(r)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${VERDICT_STYLES[r.verdict]}`}>
                        {r.note}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 분석 요약 + 참고 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="text-xl font-bold text-white">분석 요약</h3>
          <ul className="mt-6 space-y-4">
            {insights.map((t) => (
              <li key={t} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className={cardClass}>
          <h3 className="text-xl font-bold text-white">참고 · 개선 과제</h3>
          <ul className="mt-6 space-y-4">
            {notes.map((t) => (
              <li key={t} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-amber-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

// =====================================================================
// 페이지
// =====================================================================
const DetailsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('tab');
  const activeTab: TabKey = raw === 'signup' || raw === 'k6' ? raw : 'team';

  return (
    <div className="relative w-full max-w-6xl mx-auto px-6 py-12 lg:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative">
        {/* 탭 */}
        <div className="mb-12 inline-flex flex-wrap gap-2 rounded-full border border-white/5 bg-black/40 p-1.5 backdrop-blur-xl">
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setSearchParams({ tab: t.key })}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'team' && <TeamSection />}
        {activeTab === 'signup' && <SignupSection />}
        {activeTab === 'k6' && <K6Section />}
      </div>
    </div>
  );
};

export default DetailsPage;