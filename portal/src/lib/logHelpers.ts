/** 로그 표시용 공통 헬퍼. */
import type { LogEvent } from './api';

/** risk_score(0~1)에 따른 색상 등급. */
export function riskTier(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 0.8)
    return { label: 'CRITICAL', color: '#ff5c5c', bg: 'rgba(255,92,92,0.12)' };
  if (score >= 0.5)
    return { label: 'HIGH', color: '#ffa53c', bg: 'rgba(255,165,60,0.12)' };
  if (score >= 0.25)
    return { label: 'MEDIUM', color: '#ffd23c', bg: 'rgba(255,210,60,0.12)' };
  return { label: 'LOW', color: '#3ce0a5', bg: 'rgba(60,224,165,0.12)' };
}

/** action 값에 따른 색상. */
export function actionStyle(action: string): { color: string; bg: string } {
  switch (action) {
    case 'blocked':
      return { color: '#ff5c5c', bg: 'rgba(255,92,92,0.14)' };
    case 'monitored':
      return { color: '#ffa53c', bg: 'rgba(255,165,60,0.14)' };
    case 'allowed':
    default:
      return { color: '#3ce0a5', bg: 'rgba(60,224,165,0.14)' };
  }
}

/** HTTP 상태 코드 색상. */
export function statusColor(code: number): string {
  if (code >= 500) return '#ff5c5c';
  if (code >= 400) return '#ffa53c';
  if (code >= 300) return '#ffd23c';
  return '#3ce0a5';
}

/** ISO 타임스탬프를 읽기 쉬운 형태로. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** 로그에서 위협 플래그 라벨 배열 추출. */
export function activeFlags(log: LogEvent): string[] {
  const f = log.security_analysis.flags;
  const out: string[] = [];
  if (f.is_bola) out.push('BOLA');
  if (f.is_shadow_api) out.push('SHADOW');
  if (f.is_data_leak) out.push('LEAK');
  return out;
}

/** 국가 ISO 코드 -> 국기 이모지. */
export function countryFlag(iso: string): string {
  if (!iso || iso.length !== 2) return '🏳️';
  const code = iso
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...code);
}