'use client';

import { useEffect, useState } from 'react';
import { Card, ErrorBox, Loading, PageTitle } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDay } from '@/lib/format';
import type { Location, Stats } from '@/lib/types';

export default function DashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState('');
  const [result, setResult] = useState<{ locationId: string; stats: Stats } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const stats = result?.locationId === locationId ? result.stats : null;

  useEffect(() => {
    api<Location[]>('/locations').then(setLocations).catch(setError);
  }, []);

  useEffect(() => {
    let alive = true;
    api<Stats>(`/stats${locationId ? `?locationId=${locationId}` : ''}`)
      .then((s) => alive && setResult({ locationId, stats: s }))
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, [locationId]);

  const tabs = [{ id: '', name: '구 전체' }, ...locations.map((l) => ({ id: String(l.id), name: l.name.replace(' 행정복지센터', '') }))];

  return (
    <>
      <PageTitle
        title="대여 현황"
        desc={stats ? `${fmtDay(stats.today)} 기준 · 지금 이 순간의 숫자예요.` : '지금 이 순간의 숫자예요.'}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setLocationId(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${locationId === t.id ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <ErrorBox error={error} />
      {!stats ? (
        !error && <Loading />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <BigNumber label="대여 중" value={stats.inUse} unit="건" color="text-sky-700" desc="지금 주민이 쓰고 있는 물품" />
            <BigNumber label="예약" value={stats.reserved} unit="건" color="text-violet-700" desc="아직 시작 전인 예약" />
            <BigNumber label="대여 가능" value={stats.available} unit="개" color="text-emerald-700" desc={`전체 물품 ${stats.totalItems}개 중 지금 바로 빌릴 수 있는 것`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SmallNumber label="반납 지연" value={stats.overdue} warn={stats.overdue > 0} />
            <SmallNumber label="점검 필요·수리 중" value={stats.needsCheck} warn={stats.needsCheck > 0} />
            <SmallNumber label="오늘 시작하는 대여" value={stats.todayStarts} />
          </div>

          {stats.byLocation.length > 0 && (
            <Card className="overflow-x-auto">
              <h2 className="mb-3 font-bold">거점별 현황</h2>
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="py-2 font-medium">거점</th>
                    <th className="py-2 text-right font-medium">대여 중</th>
                    <th className="py-2 text-right font-medium">예약</th>
                    <th className="py-2 text-right font-medium">대여 가능</th>
                    <th className="py-2 text-right font-medium">반납 지연</th>
                    <th className="py-2 text-right font-medium">점검</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byLocation.map((l) => (
                    <tr key={l.locationId} className="border-b border-slate-100 last:border-0">
                      <td className="py-2">{l.locationName}</td>
                      <td className="py-2 text-right tabular-nums">{l.inUse}</td>
                      <td className="py-2 text-right tabular-nums">{l.reserved}</td>
                      <td className="py-2 text-right tabular-nums">{l.available}</td>
                      <td className={`py-2 text-right tabular-nums ${l.overdue ? 'font-semibold text-rose-700' : ''}`}>{l.overdue}</td>
                      <td className="py-2 text-right tabular-nums">{l.needsCheck}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function BigNumber({ label, value, unit, color, desc }: { label: string; value: number; unit: string; color: string; desc: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-5xl font-bold tabular-nums ${color}`}>
        {value}
        <span className="ml-1 text-lg font-semibold text-slate-400">{unit}</span>
      </p>
      <p className="mt-2 text-xs text-slate-400">{desc}</p>
    </Card>
  );
}

function SmallNumber({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${warn ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${warn ? 'text-rose-700' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}
