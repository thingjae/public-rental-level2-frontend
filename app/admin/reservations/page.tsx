'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, btnPrimary, Card, ErrorBox, inputClass, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtRange, RES_STATE_TONE } from '@/lib/format';
import type { AdminReservation, Location } from '@/lib/types';

const STATES = [
  { id: '', label: '최근 2주 전체' },
  { id: 'OVERDUE', label: '반납 지연' },
  { id: 'ACTIVE', label: '대여 중' },
  { id: 'UPCOMING', label: '예약됨' },
  { id: 'RETURNED', label: '반납 완료' },
  { id: 'CANCELED', label: '취소됨' },
];

export default function AdminReservationsPage() {
  const [state, setState] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [result, setResult] = useState<{ query: string; rows: AdminReservation[] } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  const q = new URLSearchParams();
  if (state) q.set('state', state);
  if (locationId) q.set('locationId', locationId);
  const query = q.toString();
  const rows = result?.query === query ? result.rows : null;

  useEffect(() => {
    api<Location[]>('/locations').then(setLocations).catch(setError);
  }, []);

  const load = useCallback(() => {
    api<AdminReservation[]>(`/admin/reservations?${query}`)
      .then((r) => setResult({ query, rows: r }))
      .catch(setError);
  }, [query]);
  useEffect(load, [load]);

  async function markReturned(r: AdminReservation) {
    if (!window.confirm(`${r.renterName}님의 ${r.itemName}을(를) 반납 처리할까요?`)) return;
    setError(null);
    try {
      await api(`/admin/reservations/${r.id}/return`, { method: 'POST' });
      setNotice(`${r.itemName} 반납 처리를 완료했어요.`);
      load();
    } catch (e) {
      setError(e);
    }
  }

  const overdueCount = rows?.filter((r) => r.state === 'OVERDUE').length ?? 0;

  return (
    <>
      <PageTitle title="예약 관리" desc="모든 예약을 이름·연락처와 함께 봐요. 반납이 늦은 주민에게는 직원이 직접 연락해요." />
      <div className="mb-4 flex flex-wrap gap-2">
        {STATES.map((s) => (
          <button
            key={s.id}
            onClick={() => setState(s.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${state === s.id ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}
          >
            {s.label}
          </button>
        ))}
        <select className={`${inputClass} ml-auto max-w-52 py-1`} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">모든 거점</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <ErrorBox error={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}
        {overdueCount > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            반납 지연 <b>{overdueCount}건</b>이 있어요. 표의 연락처로 연락해 주세요.
          </div>
        )}
        <Card className="overflow-x-auto p-0">
          {!rows ? (
            <Loading />
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">조건에 맞는 예약이 없어요.</p>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">상태</th>
                  <th className="px-4 py-2 font-medium">물품</th>
                  <th className="px-4 py-2 font-medium">기간</th>
                  <th className="px-4 py-2 font-medium">이름</th>
                  <th className="px-4 py-2 font-medium">연락처</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={`border-t border-slate-100 ${r.state === 'OVERDUE' ? 'bg-rose-50/60' : ''}`}>
                    <td className="px-4 py-2">
                      <Badge tone={RES_STATE_TONE[r.state]}>{r.stateLabel}</Badge>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium">{r.itemName}</p>
                      <p className="text-xs text-slate-400">{r.locationName}</p>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{fmtRange(r.startAt, r.endAt)}</td>
                    <td className="px-4 py-2">{r.renterName}</td>
                    <td className="px-4 py-2 tabular-nums">{r.renterPhone}</td>
                    <td className="px-4 py-2 text-right">
                      {r.canReturn && (
                        <button className={`${btnPrimary} px-3 py-1`} onClick={() => markReturned(r)}>
                          반납 처리
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
