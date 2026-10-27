import Link from 'next/link';
import type { ReactNode } from 'react';
import { fmtDateTime, fmtRange, RES_STATE_TONE } from '@/lib/format';
import type { Reservation } from '@/lib/types';
import { Badge } from './ui';

export function ReservationCard({ r, actions }: { r: Reservation; actions?: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={RES_STATE_TONE[r.state]}>{r.stateLabel}</Badge>
          <Link href={`/items/${r.itemId}`} className="font-bold hover:underline">
            {r.itemName}
          </Link>
          <span className="text-sm text-slate-500">📍 {r.locationName}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">🗓 {fmtRange(r.startAt, r.endAt)}</p>
        {r.state === 'OVERDUE' && (
          <p className="mt-1 text-sm font-semibold text-rose-700">
            반납 시각이 지났어요. 빨리 반납해 주세요. 반납 전까지는 새로 예약할 수 없어요.
          </p>
        )}
        {r.returnedAt && <p className="mt-1 text-xs text-slate-400">반납: {fmtDateTime(r.returnedAt)}</p>}
        {r.canceledAt && <p className="mt-1 text-xs text-slate-400">취소: {fmtDateTime(r.canceledAt)}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </li>
  );
}
