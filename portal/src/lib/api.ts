/**
 * 포털 백엔드 API 클라이언트.
 *
 * 모든 /api/* 호출에 JWT 토큰을 자동 첨부 (인증 필수).
 * 백엔드 위치는 .env.local 의 VITE_API_BASE 한 줄로 제어.
 */
import { supabase } from '../supabase';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8001';

// ---- 로그 스키마 타입 (확정된 v3.2 스키마) ----
export interface LogEvent {
  _id: string;

  event: {
    id: string | null;
    timestamp: string;
  };

  subject: {
    tenant_id: string | null;
    user: {
      id: string;
    };
  };

  source: {
    nat_ip: string | null;
  };

  http: {
    request: {
      method: string;
      path: string;
    };
    response: {
      status_code: number;
    };
  };

  security_analysis: {
    risk_score: number; // 0-1 정규화됨 (백엔드가 100 으로 나눔)
    action: string; // proxy / block / honeypot / log_only
    rule_id: string | null; // rule_hits 의 첫 번째
    flags: {
      is_bola: boolean;
      is_shadow_api: boolean;
      is_data_leak: boolean;
    };
  };

  // 부수 정보 (옛 스키마엔 없던 필드. 표시는 선택)
  company_name?: string | null;
  level?: string | null; // LOW / SUSPICIOUS / HIGH 등
  alert?: boolean;
}

export interface LogsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: LogEvent[];
}

export interface StatsResponse {
  total_logs: number;
  high_risk_count: number;
  by_action: Record<string, number>;
  by_country: { country: string; count: number }[];
  threat_flags: Record<string, number>;
  generated_at: string;
}

export interface LogFilters {
  tenant_id?: string;
  action?: string;
  min_risk?: number;
  is_bola?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}

/** 현재 로그인된 Supabase 세션의 access_token. 없으면 null. */
async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/** 모든 fetch 를 토큰 첨부 형태로 통일. 토큰 없으면 즉시 에러. */
async function authFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers });
}

function buildQuery(params: Record<string, unknown> | LogFilters): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      q.append(k, String(v));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

// ===== 로그 조회 (MongoDB) - 인증 필수 =====

export async function fetchLogs(
  filters: LogFilters = {}
): Promise<LogsResponse> {
  const res = await authFetch(`${API_BASE}/api/logs${buildQuery(filters)}`);
  if (!res.ok) throw new Error(`로그 조회 실패: ${res.status}`);
  return res.json();
}

export async function fetchStats(tenantId?: string): Promise<StatsResponse> {
  const res = await authFetch(
    `${API_BASE}/api/stats${buildQuery({ tenant_id: tenantId })}`
  );
  if (!res.ok) throw new Error(`통계 조회 실패: ${res.status}`);
  return res.json();
}

/**
 * 드롭다운용 tenant 목록.
 *   - admin: MongoDB 전체에서 distinct tenant_id
 *   - customer: 본인이 소유한 tenant_id (등록 시 만들어진 것)
 */
export async function fetchTenants(): Promise<string[]> {
  const res = await authFetch(`${API_BASE}/api/tenants`);
  if (!res.ok) throw new Error(`테넌트 조회 실패: ${res.status}`);
  const data = await res.json();
  return data.tenants ?? [];
}

/**
 * SSE 실시간 로그 스트림.
 *
 * 주의: 브라우저의 표준 EventSource 는 Authorization 헤더를 보낼 수 없음.
 *       그래서 토큰을 쿼리 파라미터로 전달 (백엔드에서도 그렇게 받도록 향후 보강 가능).
 *       지금은 백엔드가 Authorization 헤더만 받는 구조라, SSE 는 인증 우회 상태.
 *       추후 백엔드 logs_stream 을 쿼리 토큰도 수용하도록 확장 필요.
 *
 * 임시 동작: 토큰이 있으면 URL 에 access_token 으로 붙임.
 *           백엔드가 그걸 처리하도록 손보기 전까지는 인증이 적용되지 않으니
 *           프로덕션 전에 백엔드 보강 필요.
 */
export function subscribeToLogs(
  onLog: (log: LogEvent) => void,
  tenantId?: string
): EventSource {
  // 비동기 토큰 획득은 EventSource 생성 시점엔 await 못 함.
  // 그래서 localStorage 에서 직접 꺼내는 방식.
  const sessionRaw = localStorage.getItem('sb-huftejrbfbnselnbcdqw-auth-token');
  let token: string | null = null;
  if (sessionRaw) {
    try {
      const session = JSON.parse(sessionRaw);
      token = session?.access_token ?? null;
    } catch {
      /* 파싱 실패 무시 */
    }
  }

  const url = `${API_BASE}/api/logs/stream${buildQuery({
    tenant_id: tenantId,
    token: token,
  })}`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try {
      onLog(JSON.parse(e.data) as LogEvent);
    } catch {
      /* 파싱 실패 무시 */
    }
  };
  return es;
}

// ===== 고객사 등록/조회 (PostgreSQL) - 인증 필수 =====

/** supabase_user_id 는 토큰에서 추출하므로 본문에서 제외. */
export interface CustomerInput {
  company_name: string;
  plan_type: string;
  spec_text: string;
  inbound_domain: string;
  target_origin: string;
}

export interface Customer {
  tenant_id: string;
  company_name: string;
  api_key: string;
  plan_type: string;
  status: string;
  created_at: string;
}

export async function registerCustomer(
  input: CustomerInput
): Promise<Customer> {
  const res = await authFetch(`${API_BASE}/api/customers`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`고객사 등록 실패: ${res.status} ${msg}`);
  }
  return res.json();
}

export async function fetchMyCustomers(): Promise<Customer[]> {
  const res = await authFetch(`${API_BASE}/api/customers`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`고객사 조회 실패: ${res.status} ${msg}`);
  }
  const data = await res.json();
  return data.customers ?? [];
}

// ===== 현재 사용자 정보 (선택적 헬퍼) =====

/** 현재 로그인 사용자가 admin 인지. Supabase 세션의 app_metadata 에서 판별. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const role = (
    session?.user?.app_metadata as Record<string, unknown> | undefined
  )?.user_role;
  return role === 'ADMIN';
}

// ===== Admin 전용 API - PostgreSQL tenants 정보 조회 =====
//
// 백엔드의 /api/admin/* 엔드포인트 호출.
// admin 권한이 없으면 403 응답.

export interface TenantSummary {
  total: number;
  active_count: number;
  inactive_count: number;
  suspended_count: number;
  latest_company: string | null;
  latest_created_at: string | null;
}

export interface TenantRoute {
  inbound_domain: string;
  target_origin: string | null;
  action: string;
}

export interface AdminTenant {
  tenant_id: string;
  company_name: string;
  plan_type: string;
  status: string;
  created_at: string;
  supabase_user_id: string | null;
  routes: TenantRoute[];
}

/** admin 대시보드 카드용 집계. */
export async function fetchAdminTenantSummary(): Promise<TenantSummary> {
  const res = await authFetch(`${API_BASE}/api/admin/tenants/summary`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`관리자 요약 조회 실패: ${res.status} ${msg}`);
  }
  return res.json();
}

/** admin 이 보는 전체 고객사 목록. */
export async function fetchAllTenantsForAdmin(): Promise<{
  tenants: AdminTenant[];
  total: number;
}> {
  const res = await authFetch(`${API_BASE}/api/admin/tenants`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`관리자 tenant 조회 실패: ${res.status} ${msg}`);
  }
  return res.json();
}

export { API_BASE };
