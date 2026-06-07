import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import {
  fetchAdminTenantSummary,
  fetchAllTenantsForAdmin,
  type TenantSummary,
  type AdminTenant,
} from '../lib/api';

/**
 * 관리자 대시보드.
 *
 * 데이터 소스:
 *   - PostgreSQL tenants  -> 백엔드 /api/admin/* (admin 전용)
 *   - Supabase user_profiles -> 프론트가 직접 조회 (RLS 정책으로 admin 만 전체 조회 가능)
 *
 * 카드 4개:
 *   1. 등록된 고객사 수 (tenants 전체)
 *   2. 활성 고객사 수 (status = 'active')
 *   3. 회원 가입자 수 (Supabase user_profiles 전체)
 *   4. 최근 가입 고객사 (회사명 + 가입일)
 *
 * 아래 영역:
 *   - 슬랙 통합 운영 센터 (하나의 큰 버튼)
 *   - 등록된 고객사 목록 표
 *   - 회원 목록 표
 */

interface UserProfile {
  id: string;
  email: string;
  user_name: string | null;
  company_name: string | null;
  role: string;
  created_at: string;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  const [summary, setSummary] = useState<TenantSummary | null>(null);
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 0. 권한 체크: ADMIN 만 진입
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.role !== 'ADMIN') {
            alert('관리자 권한이 없습니다.');
            navigate('/');
          } else {
            setAuthorized(true);
          }
        });
    });
  }, [navigate]);

  // 1. 데이터 로드 (권한 확인 후)
  useEffect(() => {
    if (!authorized) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      // 세 가지 요청 각각 독립적으로 처리 (하나 실패해도 나머지는 표시)
      const [summaryResult, tenantsResult, usersResult] =
        await Promise.allSettled([
          fetchAdminTenantSummary(),
          fetchAllTenantsForAdmin(),
          supabase
            .from('user_profiles')
            .select('id, email, user_name, company_name, role, created_at')
            .order('created_at', { ascending: false }),
        ]);

      if (cancelled) return;

      // 백엔드 - 카드 1/2/4 용 집계
      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        console.error('관리자 요약 조회 실패:', summaryResult.reason);
      }

      // 백엔드 - 등록된 고객사 목록 표
      if (tenantsResult.status === 'fulfilled') {
        setTenants(tenantsResult.value.tenants);
      } else {
        console.error('관리자 tenant 조회 실패:', tenantsResult.reason);
      }

      // Supabase - 회원 목록 표
      if (usersResult.status === 'fulfilled') {
        const { data, error: userError } = usersResult.value;
        if (userError) {
          console.error('user_profiles 조회 실패:', userError);
        } else {
          setUsers((data || []) as UserProfile[]);
        }
      } else {
        console.error('user_profiles 조회 실패:', usersResult.reason);
      }

      // 셋 다 실패한 경우에만 error 배너 표시 (회원 정보 보이면 부분 성공으로 간주)
      if (
        summaryResult.status === 'rejected' &&
        tenantsResult.status === 'rejected' &&
        usersResult.status === 'rejected'
      ) {
        setError('모든 데이터 로드에 실패했습니다.');
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authorized]);

  if (!authorized) {
    return null;
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0c10] px-6 sm:px-12 lg:px-24 pt-12 pb-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="inline-flex px-4 py-1.5 mb-4 rounded-full bg-blue-500/10 text-xs font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">
            Admin Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mb-4">
            통합 보안 관제 시스템
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            전체 고객사의 등록 정보와 회원 가입 현황을 한 곳에서 관리합니다.
          </p>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
            데이터 로드 실패: {error}
          </div>
        )}

        {/* Dashboard Grid - 카드 4개 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          {/* Card 1: 등록된 고객사 수 */}
          <div className="relative group rounded-3xl border border-white/5 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-md overflow-hidden hover:bg-[#161720] transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-zinc-300">
                  등록된 고객사 수
                </h2>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight mt-auto">
                {loading ? '...' : (summary?.total ?? 0).toLocaleString()}{' '}
                <span className="text-sm font-normal text-zinc-500">개사</span>
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                PostgreSQL tenants 전체
              </p>
            </div>
          </div>

          {/* Card 2: 활성 상태 고객사 */}
          <div className="relative group rounded-3xl border border-white/5 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-md overflow-hidden hover:bg-[#161720] transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-zinc-300">
                  활성 상태 고객사
                </h2>
              </div>
              <p className="text-3xl font-bold text-green-400 tracking-tight mt-auto">
                {loading
                  ? '...'
                  : (summary?.active_count ?? 0).toLocaleString()}{' '}
                <span className="text-sm font-normal text-zinc-500">개사</span>
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                현재 정상 운영 중인 도메인
              </p>
            </div>
          </div>

          {/* Card 3: 회원 가입자 수 */}
          <div className="relative group rounded-3xl border border-white/5 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-md overflow-hidden hover:bg-[#161720] transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <svg
                    className="w-5 h-5 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-zinc-300">
                  회원 가입자 수
                </h2>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight mt-auto">
                {loading ? '...' : users.length.toLocaleString()}{' '}
                <span className="text-sm font-normal text-zinc-500">명</span>
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Supabase user_profiles 전체
              </p>
            </div>
          </div>

          {/* Card 4: 최근 가입 고객사 */}
          <div className="relative group rounded-3xl border border-white/5 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-md overflow-hidden hover:bg-[#161720] transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all pointer-events-none"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-zinc-300">
                  최근 가입 고객사
                </h2>
              </div>
              <p className="text-xl font-bold text-white tracking-tight mt-auto truncate">
                {loading ? '...' : (summary?.latest_company ?? '-')}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                {summary?.latest_created_at
                  ? formatDate(summary.latest_created_at)
                  : '아직 가입한 고객사 없음'}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            슬랙 통합 운영 센터 - 하나의 큰 버튼
            ============================================================
            본인의 슬랙 채널 URL 을 아래 href 에 박으면 됨.
            예: 'https://본인워크스페이스.slack.com/archives/C12345678'
            ============================================================ */}
        <a
          href="https://app.slack.com/client/T0B19N50DFH/C0B1Q0VC59U"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 block group relative rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/30 via-zinc-900/40 to-zinc-900/40 p-8 backdrop-blur-md overflow-hidden hover:border-violet-500/40 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-6">
            {/* 슬랙 아이콘 */}
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
              <svg
                className="w-8 h-8 text-violet-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
              </svg>
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  슬랙 통합 운영 센터
                </h2>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                룰 목록 조회 · 룰 비활성 · IP 차단 해제를 슬랙 채널에서 봇
                명령으로 실행합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <code className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-violet-300">
                  룰목록
                </code>
                <code className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-amber-300">
                  {'룰비활성 <id>'}
                </code>
                <code className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-red-300">
                  {'차단해제 <IP>'}
                </code>
              </div>
            </div>

            {/* 우측 버튼 + 안내 */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all">
                <span className="text-sm font-semibold text-violet-300">
                  운영하러 가기
                </span>
                <svg
                  className="w-4 h-4 text-violet-300 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Slack #security-alerts
              </p>
            </div>
          </div>
        </a>
        {/* ============================================================
            고객사 실시간 로그 - 큰 버튼
            ============================================================ */}
        <button
          onClick={() => navigate('/customer-dashboard')}
          className="mt-6 block w-full group relative rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/30 via-zinc-900/40 to-zinc-900/40 p-8 backdrop-blur-md overflow-hidden hover:border-blue-500/40 transition-all duration-300 text-left"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-6">
            {/* 아이콘 */}
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  고객사 실시간 로그
                </h2>
              </div>
              <p className="text-sm text-zinc-400 mb-3">
                전체 고객사의 트래픽과 보안 이벤트를 실시간으로 확인합니다.
                드롭다운에서 고객사를 선택하여 개별 로그를 조회할 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <code className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-green-300">
                  정상 트래픽
                </code>
                <code className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-red-300">
                  공격 차단
                </code>
                <code className="px-2 py-1 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-violet-300">
                  허니팟
                </code>
              </div>
            </div>

            {/* 우측 버튼 */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                <span className="text-sm font-semibold text-blue-300">
                  로그 보기
                </span>
                <svg
                  className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Customer Dashboard
              </p>
            </div>
          </div>
        </button>

        {/* ============================================================
            등록된 고객사 목록 표
            ============================================================ */}
        <div className="mt-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              등록된 고객사 목록
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              총 {tenants.length}개 — PostgreSQL tenants
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-medium">회사명</th>
                  <th className="px-6 py-3 font-medium">도메인</th>
                  <th className="px-6 py-3 font-medium">플랜</th>
                  <th className="px-6 py-3 font-medium">상태</th>
                  <th className="px-6 py-3 font-medium">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500 font-mono text-sm"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : tenants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500 font-mono text-sm"
                    >
                      등록된 고객사가 없습니다
                    </td>
                  </tr>
                ) : (
                  tenants.map((t) => (
                    <tr
                      key={t.tenant_id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {t.company_name}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                        {t.routes.length > 0
                          ? t.routes
                              .map((r) => r.inbound_domain)
                              .filter((d, i, arr) => arr.indexOf(d) === i)
                              .join(', ')
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-500/20">
                          {t.plan_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${
                            t.status === 'active'
                              ? 'bg-green-500/10 text-green-300 border-green-500/20'
                              : t.status === 'suspended'
                                ? 'bg-red-500/10 text-red-300 border-red-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {formatDate(t.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            가입 회원 목록 표
            ============================================================ */}
        <div className="mt-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              가입 회원 목록
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              총 {users.length}명 — Supabase user_profiles
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-medium">이메일</th>
                  <th className="px-6 py-3 font-medium">이름</th>
                  <th className="px-6 py-3 font-medium">회사명</th>
                  <th className="px-6 py-3 font-medium">권한</th>
                  <th className="px-6 py-3 font-medium">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500 font-mono text-sm"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500 font-mono text-sm"
                    >
                      가입한 회원이 없습니다
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {u.user_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {u.company_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {formatDate(u.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
