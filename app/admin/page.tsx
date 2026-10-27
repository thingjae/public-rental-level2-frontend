'use client';

import QRCode from 'qrcode';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge, btnDanger, Card, ErrorBox, inputClass, Loading, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { CATEGORY_ICON, ITEM_STATE_TONE } from '@/lib/format';
import type { Item, ItemStatus, Location } from '@/lib/types';

const STATUS_LABEL: Record<ItemStatus, string> = {
  AVAILABLE: '대여 가능',
  NEEDS_CHECK: '점검 필요',
  REPAIRING: '수리 중',
};

export default function AdminHome() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false);

  const load = useCallback(() => {
    api<Item[]>('/items').then(setItems).catch(setError);
    api<Location[]>('/locations').then(setLocations).catch(setError);
  }, []);
  useEffect(load, [load]);

  async function reset() {
    if (!window.confirm('모든 예약, 물품, 신고를 지우고 처음 상태의 가상 데이터로 다시 채울까요?')) return;
    setResetting(true);
    setError(null);
    setNotice('');
    try {
      const r = await api<{ message: string; items: number; reservations: number }>('/seed/reset', { method: 'POST' });
      setNotice(`${r.message} (물품 ${r.items}개, 예약 ${r.reservations}건)`);
      load();
    } catch (e) {
      setError(e);
    } finally {
      setResetting(false);
    }
  }

  async function changeStatus(item: Item, status: ItemStatus) {
    setError(null);
    setNotice('');
    try {
      await api(`/items/${item.id}/status`, { method: 'PATCH', body: { status } });
      setNotice(`${item.name}의 상태를 "${STATUS_LABEL[status]}"(으)로 바꿨어요.`);
      load();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <PageTitle title="직원 홈" desc="물품 상태를 관리하고, 확인용 가상 데이터를 다시 채울 수 있어요." />
      <div className="space-y-6">
        <ErrorBox error={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">가상 데이터 다시 채우기</h2>
            <p className="text-sm text-slate-500">
              버튼 하나로 거점 4곳, 물품 24개, 예약 33건, 고장 신고 3건의 처음 상태로 되돌려요. 날짜는 오늘을 기준으로 다시 만들어요.
            </p>
          </div>
          <button className={btnDanger} onClick={reset} disabled={resetting}>
            {resetting ? '채우는 중…' : '🔄 가상 데이터 다시 채우기'}
          </button>
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">물품 상태 관리</h2>
            <Link href="/admin/items/new" className="text-sm font-semibold text-teal-700 hover:underline">
              + 새 물품 등록
            </Link>
          </div>
          {!items ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="py-2 font-medium">물품</th>
                    <th className="py-2 font-medium">거점</th>
                    <th className="py-2 font-medium">지금</th>
                    <th className="py-2 font-medium">물품 상태 바꾸기</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2">
                        <Link href={`/items/${item.id}`} className="hover:underline">
                          {CATEGORY_ICON[item.category]} {item.name}
                        </Link>
                      </td>
                      <td className="py-2 text-slate-500">{item.location.name.replace(' 행정복지센터', '')}</td>
                      <td className="py-2">
                        <Badge tone={ITEM_STATE_TONE[item.nowState]}>{item.nowStateLabel}</Badge>
                      </td>
                      <td className="py-2">
                        <select
                          className={`${inputClass} max-w-40 py-1`}
                          value={item.status}
                          onChange={(e) => changeStatus(item, e.target.value as ItemStatus)}
                        >
                          {(Object.keys(STATUS_LABEL) as ItemStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold">거점별 반납 QR 코드 (추가 기능)</h2>
          <p className="mt-1 text-sm text-slate-500">
            거점 반납함에 붙여 두는 QR이에요. 휴대폰으로 찍으면 그 거점의 반납 화면이 열려요.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {locations.map((l) => (
              <QrCard key={l.id} location={l} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function QrCard({ location }: { location: Location }) {
  // QR에는 지금 열려 있는 사이트 주소(로컬이면 localhost, 배포하면 Vercel 주소)가 들어간다.
  const [{ src, url }, setQr] = useState({ src: '', url: '' });
  useEffect(() => {
    const u = `${window.location.origin}/return?location=${location.code}`;
    QRCode.toDataURL(u, { width: 200, margin: 1 }).then((s) => setQr({ src: s, url: u }));
  }, [location.code]);
  return (
    <div className="rounded-xl border border-slate-200 p-3 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt={`${location.name} 반납 QR`} className="mx-auto h-36 w-36" />}
      <p className="mt-2 text-sm font-semibold">{location.name}</p>
      <Link href={`/return?location=${location.code}`} className="break-all text-xs text-teal-700 hover:underline">
        {url.replace(/^https?:\/\//, '')}
      </Link>
    </div>
  );
}
