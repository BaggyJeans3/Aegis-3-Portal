/** 로그 표시용 공통 헬퍼.
 *
 * [변경 사항]
 *   - actionStyle: soar 의 action 값 (proxy / block / honeypot / log_only) 지원
 *   - activeFlags: soar 의 level / alert / rule_hits 기반으로 배지 생성
 *   - riskTier, statusColor, formatTime, countryFlag 는 그대로
 */
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

/**
 * action 값에 따른 색상.
 * soar 의 action_on_match 값: proxy / block / honeypot / log_only
 * 옛 값(blocked / monitored / allowed)도 호환 유지.
 */
export function actionStyle(action: string): { color: string; bg: string } {
  switch (action) {
    // soar 가 차단한 요청
    case 'block':
    case 'blocked':
      return { color: '#ff5c5c', bg: 'rgba(255,92,92,0.14)' };

    // 허니팟으로 우회됨 (공격 의심)
    case 'honeypot':
      return { color: '#c77dff', bg: 'rgba(199,125,255,0.14)' };

    // 모니터링만 (로그만 남기고 통과)
    case 'log_only':
    case 'monitored':
      return { color: '#ffa53c', bg: 'rgba(255,165,60,0.14)' };

    // 정상 프록시
    case 'proxy':
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

/**
 * 로그에서 위협 플래그 라벨 배열 추출.
 *
 * soar 스키마엔 is_bola / is_shadow_api / is_data_leak 같은 개별 플래그가 없음.
 * 대신 다음 정보로 배지 만듦:
 *   - level (LOW / SUSPICIOUS / HIGH 등) -> ALERT 배지
 *   - alert (true) -> ALERT 배지 (level 보다 우선)
 *   - rule_id 가 있으면 -> 그 rule_id 자체를 배지로 표시
 *   - 옛 flags 도 호환 유지 (있으면 사용)
 */
export function activeFlags(log: LogEvent): string[] {
  const out: string[] = [];

  // 1. soar 의 alert / level 기반 배지
  if (log.alert) {
    out.push('ALERT');
  } else if (log.level && log.level !== 'LOW') {
    // SUSPICIOUS / HIGH / CRITICAL 등을 그대로 배지로
    out.push(log.level);
  }

  // 2. rule_id 가 있으면 추가 (어떤 룰이 발동했는지)
  if (log.security_analysis.rule_id) {
    out.push(log.security_analysis.rule_id);
  }

  // 3. 옛 flags 가 살아있으면 호환 (없으면 무시)
  const f = log.security_analysis.flags;
  if (f) {
    if (f.is_bola) out.push('BOLA');
    if (f.is_shadow_api) out.push('SHADOW');
    if (f.is_data_leak) out.push('LEAK');
  }

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
