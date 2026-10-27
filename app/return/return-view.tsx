'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PersonForm, type Person } from '@/components/person-form';
import { ReservationCard } from '@/components/reservation-card';
import { btnPrimary, Card, ErrorBox, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import type { Location, Reservation } from '@/lib/types';

// 거점에 붙은 QR을 찍으면 /return?location=거점코드 로 들어온다.
export function ReturnView() {
  const code = useSearchParams().get('location') ?? '';
  const [location, setLocation] = useState<Location | null | undefined>(undefined);
  const [person, setPerson] = useState<Person | null>(null);
  const [list, setList] = useState<Reservation[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api<Location[]>('/locations')
      .then((ls) => setLocation(ls.find((l) => l.code === code) ?? null))
      .catch(setError);
  }, [code]);

  async function lookup(p: Person) {
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ reservations: Reservation[] }>('/reservations/lookup', { method: 'POST', body: p });
      setList(r.reservations.filter((x) => x.canReturn));
      setPerson(p);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  async function doReturn(r: Reservation) {
    if (!person) return;
    setError(null);
    setNotice('');
    try {
      await api(`/reservations/${r.id}/return`, { method: 'POST', body: { ...person, locationCode: code } });
      setNotice(`${r.itemName} 반납을 완료했어요. 고마워요!`);
      await lookup(person);
    } catch (e) {
      setError(e);
    }
  }

  if (location === undefined) return null;
  if (location === null) {
    return <ErrorBox error={new Error('QR 코드의 거점 정보를 찾을 수 없어요. 거점에 붙은 QR을 다시 찍어 주세요.')} />;
  }

  return (
    <div className="space-y-5">
      <Card className="border-teal-200 bg-teal-50">
        <p className="text-sm text-teal-800">반납 장소</p>
        <p className="text-xl font-bold text-teal-900">📍 {location.name}</p>
        <p className="mt-1 text-sm text-teal-800">물품을 거점 반납함에 넣은 뒤, 아래에서 반납 완료를 눌러 주세요.</p>
      </Card>
      <Card>
        <PersonForm busy={busy} onSubmit={lookup} submitLabel="반납할 물품 찾기" />
      </Card>
      <ErrorBox error={error} />
      {notice && <SuccessBox>{notice}</SuccessBox>}
      {list &&
        (list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
            지금 반납할 물품이 없어요.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <ReservationCard
                key={r.id}
                r={r}
                actions={
                  <button className={btnPrimary} onClick={() => doReturn(r)}>
                    여기서 반납 완료
                  </button>
                }
              />
            ))}
          </ul>
        ))}
    </div>
  );
}
