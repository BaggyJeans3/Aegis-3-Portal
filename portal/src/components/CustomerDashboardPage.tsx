import React, { useState, useEffect, useRef } from 'react';
import {
  fetchLogs,
  fetchTenants,
  subscribeToLogs,
  type LogEvent,
} from '../lib/api';
import { riskTier, activeFlags } from '../lib/logHelpers';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

/**
 * 고객사 대시보드.
 *
 * 기존 Supabase 버전에서 데이터 소스만 우리 MongoDB 포털 백엔드로 교체.
 * 디자인(터미널 UI)은 유지.
 *
 * 데이터 흐름:
 *   - 초기 로그: GET /api/logs        (페이지네이션)
 *   - 실시간:    GET /api/logs/stream (SSE / EventSource)
 *
 * 길1 -> 길2 전환 시 이 파일은 안 바뀜. 백엔드가 데이터 소스만 교체.
 *
 * 스크롤 동작:
 *   - 페이지 자체는 고정 (브라우저 스크롤 없음)
 *   - 로그 영역만 내부에서 스크롤
 *   - 새 로그 들어오면 로그 컨테이너 내부에서만 맨 아래로 자동 스크롤
 *   - 사용자가 위로 스크롤해서 옛날 로그 보는 중이면 자동 스크롤 안 함
 */
const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  // 기존의 "API 선택" -> "테넌트(고객사) 선택" 으로 대체
  const [tenants, setTenants] = useState<string[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그 영역의 스크롤 컨테이너 ref. 이걸로 내부 scrollTop 만 조작해서
  // 페이지 전체 스크롤을 트리거하지 않음.
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 0. 권한 체크 (로그인 안 했으면 로그인 페이지로)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      setAuthorized(true);
    });
  }, [navigate]);

  // 1. 테넌트 목록 가져오기
  useEffect(() => {
    fetchTenants()
      .then((list) => {
        setTenants(list);
        if (list.length > 0) setSelectedTenant(list[0]);
      })
      .catch((e) => setError(e.message));
  }, []);

  // 2. 선택된 테넌트의 로그 조회 + SSE 실시간 구독
  useEffect(() => {
    if (!selectedTenant) return;

    setLogs([]);
    setIsLive(false);
    setError(null);
    setLoading(true);

    let cancelled = false;

    // 초기 로그 (최근 100건, 오래된 순으로 정렬해서 터미널에 쌓음)
    fetchLogs({ tenant_id: selectedTenant, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        setLogs([...res.items].reverse());
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    // SSE 실시간 구독
    const es = subscribeToLogs((log) => {
      setLogs((prev) => [...prev, log].slice(-500)); // 메모리 보호: 최근 500건
    }, selectedTenant);

    es.onopen = () => setIsLive(true);
    es.onerror = () => setIsLive(false);

    return () => {
      cancelled = true;
      es.close();
    };
  }, [selectedTenant]);

  // 새 로그가 오면 로그 컨테이너 내부에서만 맨 아래로 스크롤.
  // scrollIntoView 는 페이지 전체 스크롤까지 트리거하므로 사용하지 않음.
  // 사용자가 위로 스크롤해서 옛날 로그 읽는 중이면 자동 스크롤 중단.
  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  /** 로그 한 줄 렌더 (v3.2 스키마 기준). */
  const renderLog = (log: LogEvent) => {
    const risk = log.security_analysis.risk_score;
    const tier = riskTier(risk);
    const action = log.security_analysis.action;
    const ip = log.source.nat_ip;
    const method = log.http.request.method;
    const path = log.http.request.path;
    const status = log.http.response.status_code;
    const flags = activeFlags(log);

    const time = new Date(log.event.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    return (
      <div
        key={log._id || log.event.id}
        className="text-zinc-300 flex flex-col py-1.5 px-4 hover:bg-white/[0.02] transition-colors duration-200"
      >
        <div className="flex items-start gap-4">
          <span className="text-zinc-500 font-mono text-xs hidden sm:inline-block pt-0.5 shrink-0">
            {time}
          </span>
          <span className="break-words font-mono text-sm leading-relaxed flex-1">
            {/* 위험도 등급 */}
            <span style={{ color: tier.color }}>[{tier.label}]</span>{' '}
            {/* 요청 라인 */}
            <span className="text-zinc-200">
              {method} {path}
            </span>{' '}
            <span style={{ color: tier.color }}>→ {status}</span>
            {/* 위협 플래그 */}
            {flags.map((f) => (
              <span
                key={f}
                className="ml-1.5 rounded bg-[#c77dff22] px-1.5 py-0.5 text-[10px] font-bold text-[#c77dff]"
              >
                {f}
              </span>
            ))}
            <span className="text-zinc-500">
              {' '}
              (Risk: {risk.toFixed(2)}) (IP: {ip})
            </span>
          </span>
        </div>
        <div className="text-zinc-500 ml-4 sm:ml-[104px] mt-0.5 text-xs font-mono">
          Action: {action} · Rule: {log.security_analysis.rule_id} · User:{' '}
          {log.subject.user.id}
        </div>
      </div>
    );
  };

  if (!authorized) {
    // 권한 확인 전엔 아무것도 안 보여줌
    return null;
  }

  return (
    // 페이지 전체를 화면 높이로 고정 (브라우저 스크롤 방지).
    // min-h -> h 로 변경하여 정확히 뷰포트 높이만 차지.
    // overflow-hidden 으로 페이지 자체 스크롤 막음.
    <div className="w-full h-[calc(100vh-80px)] bg-[#0b0c10] p-4 sm:p-8 flex flex-col overflow-hidden">
      {/* Full Width Terminal Container */}
      <div className="flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-700 relative rounded-[2rem] border border-white/10 bg-[#08090b] shadow-2xl flex flex-col overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-violet-500/10 blur-[100px] pointer-events-none"></div>

        {/* Header Bar */}
        <div className="h-14 bg-[#101116] border-b border-white/5 flex items-center px-6 gap-4 shrink-0 relative z-10">
          <div className="flex gap-2 shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 border border-red-500/50 shadow-inner"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 border border-yellow-500/50 shadow-inner"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 border border-green-500/50 shadow-inner"></div>
          </div>

          <div className="h-6 w-px bg-white/5 mx-2 hidden sm:block"></div>

          <span className="text-sm text-zinc-300 font-sans tracking-wide flex items-center gap-2.5 font-medium shrink-0">
            <svg
              className="w-4 h-4 text-violet-400 hidden sm:block"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="hidden md:block">
              Aegis-3 Advanced Security Operations Center
            </span>
            <span className="md:hidden">Aegis-3 SOC</span>
          </span>

          {/* Tenant Selector Dropdown */}
          <div className="ml-2 sm:ml-6 flex items-center flex-1 max-w-sm">
            <select
              value={selectedTenant || ''}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-black/40 border border-white/10 text-violet-300 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500/50 block w-full py-1.5 px-3 focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a78bfa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.7rem top 50%',
                backgroundSize: '0.65rem auto',
                paddingRight: '2rem',
              }}
            >
              {tenants.length === 0 && (
                <option value="">테넌트 데이터가 없습니다</option>
              )}
              {tenants.map((t) => (
                <option key={t} value={t} className="bg-zinc-900 text-zinc-300">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-xs text-zinc-400 font-mono">Events:</span>
              <span className="text-xs font-bold text-violet-400">
                {logs.length}
              </span>
            </div>

            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                isLive && selectedTenant
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive && selectedTenant
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-zinc-500'
                }`}
              ></span>
              <span className="text-xs font-bold tracking-wide uppercase">
                {isLive && selectedTenant ? 'Live Stream' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Logs Area - 이 div 가 내부 스크롤 컨테이너.
            ref 를 통해 useEffect 에서 scrollTop 만 조작. */}
        <div
          ref={logContainerRef}
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 font-mono text-sm custom-scrollbar relative z-10"
        >
          <div className="max-w-[1200px] mx-auto w-full">
            <div className="text-zinc-500/80 py-2 mb-4 flex items-center gap-3 border-b border-white/5">
              <span className="text-xs">
                SYSTEM BOOT_SEQ_COMPLETE{' '}
                {selectedTenant && '| TENANT STREAM CONNECTED'}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></span>
            </div>

            {error ? (
              <div className="flex flex-col items-center justify-center h-64 text-red-400/80 gap-3">
                <p className="font-mono text-sm tracking-wide">
                  연결 오류: {error}
                </p>
                <p className="font-mono text-xs text-zinc-600">
                  백엔드(8001) · SSH 터널 · mongo-bridge 상태를 확인하세요.
                </p>
              </div>
            ) : !selectedTenant ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                <p className="font-mono text-sm tracking-widest uppercase">
                  표시할 테넌트가 없습니다. 더미 로그를 먼저 생성하세요.
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                <p className="font-mono text-sm tracking-widest uppercase">
                  Loading security events...
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                <svg
                  className="w-8 h-8 opacity-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-mono text-sm tracking-widest uppercase">
                  Waiting for security events...
                </p>
              </div>
            ) : (
              <div className="space-y-1">{logs.map(renderLog)}</div>
            )}

            <div className="text-zinc-600 mt-8 flex items-center gap-3 pl-4">
              <span className="w-2 h-4 bg-violet-500 animate-pulse block"></span>
              <span className="text-xs font-sans tracking-wide">
                Awaiting next instruction stream...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
