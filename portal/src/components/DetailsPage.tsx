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

const PLANS = ['FREE', 'PRO(업데이트 예정)', 'ENTERPRISE(업데이트 예정)'];

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
 * MuShop 대상 Aegis-3 부하 테스트 실측 결과 (k6, 시나리오별 1분).
 *   - 정상 / 공격 / 혼합: 모두 Aegis-3 프록시 경유
 *
 * 참고
 *   - WAF 판정 정확도 = (통과 2xx + 차단 4xx) / 전체 요청
 *   - 시나리오별 측정 시각이 다름 (normal 9/30, attack · mixed 10/4)
 */
type LoadMode = 'normal' | 'attack' | 'mixed';
type Verdict = 'pass' | 'partial' | 'fail';

interface LoadScenario {
  mode: LoadMode;
  name: string;
  description: string;
  measuredAt: string;
  totalRequests: number;
  rps: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  passed2xx: number;
  blocked4xx: number;
  accuracy: number; // %
  failRate: number; // %
  verdict: Verdict;
  verdictNote: string;
}

const LOAD_TEST_META = [
  { k: '대상', v: 'MuShop (자체 구축 클라우드 웹)' },
  { k: '도구', v: 'Grafana k6' },
  { k: '테스트 시간', v: '시나리오별 1분' },
  { k: '측정일', v: '9/30 (normal) · 10/4 (attack, mixed)' },
];

const LOAD_SCENARIOS: LoadScenario[] = [
  {
    mode: 'normal',
    name: '정상 요청 폭주',
    description: '정상 요청만 Aegis-3를 통해 대량 전송',
    measuredAt: '9/30 21:46',
    totalRequests: 5522,
    rps: 91.1,
    avgMs: 558.2,
    p50Ms: 339.8,
    p95Ms: 1474.7,
    p99Ms: 7500,
    maxMs: 10001.2,
    passed2xx: 5490,
    blocked4xx: 0,
    accuracy: 99.42,
    failRate: 0.58,
    verdict: 'partial',
    verdictNote: '응답 시간 최적화 중',
  },
  {
    mode: 'attack',
    name: '공격 요청 폭주',
    description: '공격 요청만 Aegis-3를 통해 대량 전송',
    measuredAt: '10/4 22:23',
    totalRequests: 8624,
    rps: 143.1,
    avgMs: 115.6,
    p50Ms: 129.1,
    p95Ms: 173.1,
    p99Ms: 205,
    maxMs: 1841.5,
    passed2xx: 0,
    blocked4xx: 8624,
    accuracy: 100,
    failRate: 0,
    verdict: 'pass',
    verdictNote: '합격',
  },
  {
    mode: 'mixed',
    name: '혼합 요청 폭주',
    description: '정상 80% + 공격 20% 비율로 섞어서 전송',
    measuredAt: '10/4 22:25',
    totalRequests: 7485,
    rps: 123.2,
    avgMs: 323.1,
    p50Ms: 254.4,
    p95Ms: 614.2,
    p99Ms: 2550,
    maxMs: 8204.8,
    passed2xx: 5982,
    blocked4xx: 1503,
    accuracy: 100,
    failRate: 0,
    verdict: 'partial',
    verdictNote: 'p99 최적화 중',
  },
];

const MODE_STYLES: Record<LoadMode, { label: string; badge: string; bar: string; text: string }> = {
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

const VERDICT_STYLES: Record<Verdict, { badge: string; icon: typeof CheckCircleIcon; iconColor: string }> = {
  pass: {
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    icon: CheckCircleIcon,
    iconColor: 'text-emerald-400',
  },
  partial: {
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-amber-400',
  },
  fail: {
    badge: 'bg-red-500/10 text-red-300 border-red-500/20',
    icon: XCircleIcon,
    iconColor: 'text-red-400',
  },
};

const fmtNum = (n: number) => n.toLocaleString('ko-KR');
const fmtMs = (ms: number) => `${fmtNum(ms)}ms`;
const fmtPct = (p: number, digits = 2) => `${p.toFixed(digits)}%`;
/** 1초 이상은 초 단위로 (예: 1474.7 -> 1.47s, 7500 -> 7.5s). */
const fmtDur = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2).replace(/\.?0+$/, '')}s` : `${Math.round(ms)}ms`;

const VerdictBadge: React.FC<{ s: LoadScenario }> = ({ s }) => {
  const v = VERDICT_STYLES[s.verdict];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${v.badge}`}>
      <v.icon className="w-3.5 h-3.5" />
      {s.verdictNote}
    </span>
  );
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
    { k: '최대', v: fmtMs(s.maxMs) },
    { k: 'p50', v: fmtMs(s.p50Ms) },
    { k: 'p95', v: fmtMs(s.p95Ms) },
    { k: 'p99', v: fmtDur(s.p99Ms) },
    { k: '실패율', v: fmtPct(s.failRate, 3) },
  ];

  return (
    <div className={`${cardClass} group transition-all duration-500 hover:border-violet-500/30`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border ${style.badge}`}>
          {style.label}
        </span>
        <h3 className="text-lg font-bold text-white">{s.name}</h3>
        <VerdictBadge s={s} />
        <span className="ml-auto rounded-lg px-2.5 py-1 text-[11px] bg-black/60 border border-white/10 text-zinc-400">
          Aegis-3 경유 · {s.measuredAt}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-500">{s.description}</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
            정확도 <span className="font-mono font-bold text-white">{fmtPct(s.accuracy)}</span>
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
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
            기타 <span className="font-mono text-zinc-200">{fmtNum(other)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const K6Section: React.FC = () => {
  const stats = useMemo(() => {
    const byMode = (m: LoadMode) => LOAD_SCENARIOS.find((s) => s.mode === m)!;
    const normal = byMode('normal');
    const attack = byMode('attack');
    const mixed = byMode('mixed');
    return {
      totalRequests: LOAD_SCENARIOS.reduce((a, s) => a + s.totalRequests, 0),
      securityPassCount: LOAD_SCENARIOS.filter((s) => s.accuracy >= 99).length,
      avgAccuracy: LOAD_SCENARIOS.reduce((a, s) => a + s.accuracy, 0) / LOAD_SCENARIOS.length,
      normal,
      attack,
      mixed,
    };
  }, []);

  const statCards = [
    {
      label: '총 요청 수',
      value: fmtNum(stats.totalRequests),
      sub: `${LOAD_SCENARIOS.length}개 시나리오 · 각 1분`,
      icon: BoltIcon,
      color: 'text-blue-400',
    },
    {
      label: 'WAF 판정 정확도 (평균)',
      value: fmtPct(stats.avgAccuracy),
      sub: `${LOAD_SCENARIOS.length}개 시나리오 평균 · 공격 ${fmtNum(stats.attack.blocked4xx)}건 전량 차단`,
      icon: XCircleIcon,
      color: 'text-emerald-300',
    },
    {
      label: '차단 응답 속도 (p50)',
      value: fmtMs(stats.attack.p50Ms),
      sub: `공격 요청 p95 ${fmtMs(stats.attack.p95Ms)} · p99 ${fmtDur(stats.attack.p99Ms)}`,
      icon: ClockIcon,
      color: 'text-amber-400',
    },
    {
      label: '혼합 트래픽 판정 정확도',
      value: fmtPct(stats.mixed.accuracy),
      sub: '정상 80% + 공격 20%',
      icon: ServerStackIcon,
      color: 'text-violet-400',
    },
  ];

  const insights = [
    `공격 요청 ${fmtNum(stats.attack.totalRequests)}건을 모두 4xx로 차단했고, p95 ${fmtDur(stats.attack.p95Ms)} · p99 ${fmtDur(stats.attack.p99Ms)}로 응답 시간 기준까지 합격했습니다.`,
    `정상 80% + 공격 20% 혼합 트래픽에서 ${fmtNum(stats.mixed.passed2xx)}건 통과, ${fmtNum(stats.mixed.blocked4xx)}건 차단으로 판정 정확도 ${fmtPct(stats.mixed.accuracy)}를 기록했습니다.`,
    `공격 · 혼합 시나리오 모두 연결 실패율 0%로, 부하 상황에서도 요청 유실 없이 처리했습니다.`,
  ];

  const notes = [
    `정상 요청은 중앙값(p50) ${fmtMs(stats.normal.p50Ms)}로 대부분 빠르게 처리되며, 상위 5% 요청의 응답 시간(p95 ${fmtDur(stats.normal.p95Ms)})을 줄이는 최적화를 다음 단계로 진행합니다.`,
    `정상 요청 측정(9/30)은 이전 버전 기준이며, 정상 트래픽이 80%를 차지하는 최신 버전 혼합 시나리오(10/4)에서는 p95 ${fmtDur(stats.mixed.p95Ms)}를 기록했습니다.`,
    `혼합 시나리오의 p99 ${fmtDur(stats.mixed.p99Ms)}는 상위 1% 요청에 해당하며, 프록시 연결 · 타임아웃 설정 튜닝으로 단축할 계획입니다.`,
    '측정일이 다른 시나리오(9/30, 10/4)가 섞여 있어, 최신 버전 기준으로 전 시나리오 재측정을 예정하고 있습니다.',
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Load Test · k6"
        title="MuShop 부하 테스트 결과"
        description="직접 구축한 클라우드 웹 MuShop을 대상으로, Aegis-3를 경유하는 정상 · 공격 · 혼합 트래픽을 각각 1분간 k6로 측정했습니다."
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

      {/* 판정 결과 */}
      <div className={`${cardClass} !p-0 overflow-hidden mb-6`}>
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">시나리오별 판정</h3>
            <p className="mt-1 text-sm text-zinc-500">정확도 · 실패율 · 응답 시간(p95, p99) 기준</p>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            보안 판정 {stats.securityPassCount} / {LOAD_SCENARIOS.length} 통과
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-white/5 bg-black/30 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3 font-semibold">시나리오</th>
                <th className="px-4 py-3 font-semibold">측정 시각</th>
                <th className="px-4 py-3 font-semibold text-right">정확도</th>
                <th className="px-4 py-3 font-semibold text-right">실패</th>
                <th className="px-4 py-3 font-semibold text-right">p95</th>
                <th className="px-4 py-3 font-semibold text-right">p99</th>
                <th className="px-6 py-3 font-semibold text-right">판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {LOAD_SCENARIOS.map((s) => (
                <tr key={s.mode} className="transition hover:bg-white/[0.02]">
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border ${MODE_STYLES[s.mode].badge}`}>
                      {MODE_STYLES[s.mode].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-400">{s.measuredAt}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-100">{fmtPct(s.accuracy, 1)}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-100">{fmtPct(s.failRate, 1)}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-100">{fmtDur(s.p95Ms)}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-100">{fmtDur(s.p99Ms)}</td>
                  <td className="px-6 py-3 text-right">
                    <VerdictBadge s={s} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div className="grid grid-cols-1 gap-6 mb-6">
        {LOAD_SCENARIOS.map((s) => (
          <ScenarioCard key={s.mode} s={s} />
        ))}
      </div>

      {/* 분석 요약 + 최적화 계획 */}
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
          <h3 className="text-xl font-bold text-white">성능 최적화 계획</h3>
          <ul className="mt-6 space-y-4">
            {notes.map((t) => (
              <li key={t} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                <ClockIcon className="w-5 h-5 shrink-0 text-blue-400" />
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