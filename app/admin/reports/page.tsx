'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge, btnPrimary, btnSecondary, Card, ErrorBox, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDateTime } from '@/lib/format';
import type { DamageReport } from '@/lib/types';

const ITEM_STATUS_LABEL = { AVAILABLE: '대여 가능', NEEDS_CHECK: '점검 필요', REPAIRING: '수리 중' } as const;

export default function AdminReportsPage() {
  const [rows, setRows] = useState<DamageReport[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api<DamageReport[]>('/damage-reports').then(setRows).catch(setError);
  }, []);
  useEffect(load, [load]);

  async function act(r: DamageReport, action: 'START_REPAIR' | 'RESOLVE') {
    setError(null);
    try {
      await api(`/damage-reports/${r.id}`, { method: 'PATCH', body: { action } });
      setNotice(
        action === 'START_REPAIR'
          ? `${r.item.name}을(를) 수리 중으로 바꿨어요.`
          : `${r.item.name} 신고를 처리 완료했어요. 남은 신고가 없으면 다시 대여할 수 있어요.`,
      );
      load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <PageTitle title="고장 신고" desc="주민이 보낸 고장 신고예요. 신고가 들어온 물품은 처리 완료 전까지 예약이 막혀요." />
      <div className="space-y-4">
        <ErrorBox error={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
            고장 신고가 없어요.
          </p>
        ) : (
          rows.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={r.status === 'RECEIVED' ? 'amber' : 'gray'}>{r.status === 'RECEIVED' ? '접수' : '처리 완료'}</Badge>
                  <Link href={`/items/${r.item.id}`} className="font-bold hover:underline">
                    {r.item.name}
                  </Link>
                  <span className="text-sm text-slate-500">📍 {r.item.location.name}</span>
                  <span className="text-xs text-slate-400">물품 상태: {ITEM_STATUS_LABEL[r.item.status]}</span>
                </div>
                <p className="mt-2 text-slate-700">“{r.content}”</p>
                <p className="mt-1 text-xs text-slate-400">
                  {r.reporterName} · {fmtDateTime(r.createdAt)}
                  {r.resolvedAt && ` · 처리 ${fmtDateTime(r.resolvedAt)}`}
                </p>
              </div>
              {r.status === 'RECEIVED' && (
                <div className="flex gap-2">
                  {r.item.status !== 'REPAIRING' && (
                    <button className={btnSecondary} onClick={() => act(r, 'START_REPAIR')}>
                      수리 시작
                    </button>
                  )}
                  <button className={btnPrimary} onClick={() => act(r, 'RESOLVE')}>
                    처리 완료
                  </button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  );
}
