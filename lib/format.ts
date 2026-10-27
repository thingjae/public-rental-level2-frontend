import type { Category, ItemNowState, RentalType, ReservationState } from './types';

// 화면에 보이는 시각은 모두 한국 시간으로 표시한다.
const KST = 'Asia/Seoul';

export const CATEGORY_LABEL: Record<Category, string> = {
  TOOL: '공구',
  CAMPING: '캠핑',
  LIVING: '생활',
  EVENT: '행사',
};

export const CATEGORY_ICON: Record<Category, string> = {
  TOOL: '🔧',
  CAMPING: '⛺',
  LIVING: '🏠',
  EVENT: '🎪',
};

export const RENTAL_TYPE_LABEL: Record<RentalType, string> = {
  HOURLY: '시간형',
  DAILY: '날짜형',
};

export function maxLabel(type: RentalType, max: number) {
  return type === 'HOURLY' ? `최대 ${max * 3}시간` : `최대 ${max}일`;
}

export const SLOT_LABELS = ['09–12시', '12–15시', '15–18시'];

const dateFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, month: 'long', day: 'numeric', weekday: 'short' });
const timeFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, hour: '2-digit', minute: '2-digit', hour12: false });

export function fmtDate(iso: string | Date) {
  return dateFmt.format(new Date(iso));
}

export function fmtTime(iso: string | Date) {
  return timeFmt.format(new Date(iso));
}

export function fmtDateTime(iso: string | Date) {
  return `${fmtDate(iso)} ${fmtTime(iso)}`;
}

/** 대여 기간을 읽기 쉽게: 같은 날이면 "10월 28일 (수) 09:00–15:00" */
export function fmtRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (fmtDate(s) === fmtDate(e)) return `${fmtDate(s)} ${fmtTime(s)}–${fmtTime(e)}`;
  return `${fmtDate(s)} ${fmtTime(s)} → ${fmtDate(e)} ${fmtTime(e)}`;
}

/** "YYYY-MM-DD" 를 화면용으로 */
export function fmtDay(dateStr: string) {
  return dateFmt.format(new Date(`${dateStr}T12:00:00+09:00`));
}

export function addDays(dateStr: string, n: number) {
  return new Date(Date.parse(`${dateStr}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
}

export function atKst(dateStr: string, hour: number) {
  return new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00+09:00`);
}

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray';

export const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export const ITEM_STATE_TONE: Record<ItemNowState, Tone> = {
  AVAILABLE: 'green',
  IN_USE: 'blue',
  OVERDUE: 'red',
  NEEDS_CHECK: 'amber',
  REPAIRING: 'amber',
};

export const RES_STATE_TONE: Record<ReservationState, Tone> = {
  UPCOMING: 'blue',
  ACTIVE: 'green',
  OVERDUE: 'red',
  RETURNED: 'gray',
  CANCELED: 'gray',
};
