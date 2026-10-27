'use client';

import { useState } from 'react';
import { PersonForm, type Person } from '@/components/person-form';
import { ReservationCard } from '@/components/reservation-card';
import { btnDanger, btnPrimary, Card, ErrorBox, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import type { Reservation } from '@/lib/types';

type Lookup = { openCount: number; limit: number; reservations: Reservation[] };

export default function MyPage() {
  const [person, setPerson] = useState<Person | null>(null);
  const [data, setData] = useState<Lookup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  async function lookup(p: Person) {
    setBusy(true);
    setError(null);
    try {
      setData(await api<Lookup>('/reservations/lookup', { method: 'POST', body: p }));
      setPerson(p);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setBusy(false);
    }
  }

  async function act(r: Reservation, action: 'cancel' | 'return') {
    if (!person) return;
    const ok = window.confirm(
      action === 'cancel' ? `${r.itemName} 예약을 취소할까요?` : `${r.itemName}을(를) 반납 처리할까요?`,
    );
    if (!ok) return;
    setError(null);
    setNotice('');
    try {
      await api(`/reservations/${r.id}/${action}`, { method: 'POST', body: person });
      setNotice(action === 'cancel' ? '예약을 취소했어요.' : '반납을 완료했어요. 고마워요!');
      await lookup(person);
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <PageTitle title="내 예약" desc="예약할 때 쓴 이름과 연락처로 예약을 찾고, 취소하거나 반납할 수 있어요." />
      <Card>
        <PersonForm busy={busy} onSubmit={lookup} />
        <p className="mt-3 text-xs text-slate-400">
          확인용 가상 주민: 박민수 / 010-3333-3333 (취소·반납 가능), 김하늘 / 010-1111-1111 (예약 3건), 이지연 / 010-2222-2222 (반납 지연)
        </p>
      </Card>

      <div className="mt-6 space-y-4">
        <ErrorBox error={error} />
        {notice && <SuccessBox>{notice}</SuccessBox>}
        {data && (
          <>
            <p className="text-sm text-slate-600">
              지금 예약·대여 <b>{data.openCount}</b> / {data.limit}건
              {data.openCount >= data.limit && ' · 한도에 도달해서 더 예약할 수 없어요.'}
            </p>
            {data.reservations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
                이 이름과 연락처로 된 예약이 없어요.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.reservations.map((r) => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    actions={
                      <>
                        {r.canCancel && (
                          <button className={btnDanger} onClick={() => act(r, 'cancel')}>
                            예약 취소
                          </button>
                        )}
                        {r.canReturn && (
                          <button className={btnPrimary} onClick={() => act(r, 'return')}>
                            반납하기
                          </button>
                        )}
                      </>
                    }
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}
