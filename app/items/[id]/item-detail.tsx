'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  btnPrimary,
  btnSecondary,
  Card,
  ErrorBox,
  Field,
  inputClass,
  Loading,
  SuccessBox,
} from '@/components/ui';
import { api } from '@/lib/api';
import {
  addDays,
  atKst,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  fmtDay,
  fmtRange,
  ITEM_STATE_TONE,
  maxLabel,
  RENTAL_TYPE_LABEL,
  SLOT_LABELS,
} from '@/lib/format';
import type { ItemDetail, Reservation, ScheduleEntry } from '@/lib/types';

const SLOT_HOURS = 3;
type Cell = 'free' | 'booked' | 'past';

function overlaps(s: ScheduleEntry[], from: Date, to: Date) {
  return s.some((r) => new Date(r.startAt) < to && new Date(r.endAt) > from);
}

export function ItemDetailView() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const load = useCallback(() => {
    api<ItemDetail>(`/items/${id}`)
      .then((d) => (setItem(d), setLoadError(null)))
      .catch(setLoadError);
  }, [id]);
  useEffect(load, [load]);

  if (loadError && !item) return <ErrorBox error={loadError} />;
  if (!item) return <Loading />;

  return (
    <div className="space-y-6">
      <Link href="/items" className="text-sm text-slate-500 hover:text-slate-800">
        ← 물품 목록
      </Link>

      <Card>
        <div className="flex flex-wrap items-start gap-4">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-5xl">
              {CATEGORY_ICON[item.category]}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <Badge tone={ITEM_STATE_TONE[item.nowState]}>{item.nowStateLabel}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              📍 {item.location.name} · {item.location.address} · ☎ {item.location.phone} · 운영 {item.location.openHours}
            </p>
            <p className="mt-3 text-slate-700">{item.description}</p>
            {item.caution && <p className="mt-2 text-sm text-amber-700">⚠️ {item.caution}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded bg-slate-100 px-2 py-1">분류: {CATEGORY_LABEL[item.category]}</span>
              <span className="rounded bg-slate-100 px-2 py-1">
                대여 방식: {RENTAL_TYPE_LABEL[item.rentalType]}
                {item.rentalType === 'HOURLY' ? ' (3시간 단위)' : ' (하루 단위, 09시 수령 · 18시 반납)'}
              </span>
              <span className="rounded bg-slate-100 px-2 py-1">{maxLabel(item.rentalType, item.maxDuration)}</span>
            </div>
          </div>
        </div>
      </Card>

      {item.hasOverdue && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          이 물품은 이전 대여가 <b>반납 지연</b> 중이에요. 예약한 시간에 물품이 없을 수 있으니 거점({item.location.phone})에 문의해
          주세요.
        </div>
      )}
      {item.status !== 'AVAILABLE' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          이 물품은 지금 <b>{item.nowStateLabel}</b> 상태라 예약할 수 없어요. 점검이 끝나면 다시 예약할 수 있어요.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ScheduleGrid item={item} />
        <BookingForm item={item} onBooked={load} />
      </div>

      <ReportForm item={item} onReported={load} />
    </div>
  );
}

/** 앞으로 7일 예약 현황표. 다른 사람의 이름은 보이지 않고 "예약됨"만 보인다. */
function ScheduleGrid({ item }: { item: ItemDetail }) {
  const now = new Date(item.booking.now);
  const days = Array.from({ length: 8 }, (_, i) => addDays(item.booking.today, i));

  const cellOf = (from: Date, to: Date): Cell => {
    if (overlaps(item.schedule, from, to)) return 'booked';
    if (from <= now) return 'past';
    return 'free';
  };

  const style: Record<Cell, string> = {
    free: 'bg-emerald-50 text-emerald-700',
    booked: 'bg-sky-100 text-sky-800 font-semibold',
    past: 'bg-slate-100 text-slate-400',
  };
  const text: Record<Cell, string> = { free: '비어 있음', booked: '예약됨', past: '지남' };

  return (
    <Card>
      <h2 className="font-bold">앞으로 7일 예약 현황</h2>
      <p className="mt-1 text-xs text-slate-500">예약은 오늘부터 7일 뒤({fmtDay(item.booking.lastDate)})까지 할 수 있어요.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="w-28 text-left font-medium">날짜</th>
              {item.rentalType === 'HOURLY' ? (
                SLOT_LABELS.map((s) => (
                  <th key={s} className="font-medium">
                    {s}
                  </th>
                ))
              ) : (
                <th className="font-medium">09–18시</th>
              )}
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d}>
                <td className="text-left text-slate-700">{fmtDay(d)}</td>
                {item.rentalType === 'HOURLY' ? (
                  [9, 12, 15].map((h) => {
                    const from = atKst(d, h);
                    const c = cellOf(from, new Date(from.getTime() + SLOT_HOURS * 3600000));
                    return (
                      <td key={h} className={`rounded-md px-1 py-2 ${style[c]}`}>
                        {text[c]}
                      </td>
                    );
                  })
                ) : (
                  (() => {
                    const c = cellOf(atKst(d, 9), atKst(d, 18));
                    return <td className={`rounded-md px-1 py-2 ${style[c]}`}>{text[c]}</td>;
                  })()
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BookingForm({ item, onBooked }: { item: ItemDetail; onBooked: () => void }) {
  const days = useMemo(() => Array.from({ length: 8 }, (_, i) => addDays(item.booking.today, i)), [item.booking.today]);
  const hourly = item.rentalType === 'HOURLY';

  const [renterName, setName] = useState('');
  const [renterPhone, setPhone] = useState('');
  const [startDate, setDate] = useState(days[1]);
  const [startSlot, setSlot] = useState(0);
  const [length, setLength] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState<Reservation | null>(null);

  const preview = hourly
    ? (() => {
        const s = atKst(startDate, [9, 12, 15][startSlot]);
        return fmtRange(s.toISOString(), new Date(s.getTime() + length * SLOT_HOURS * 3600000).toISOString());
      })()
    : fmtRange(atKst(startDate, 9).toISOString(), atKst(addDays(startDate, length - 1), 18).toISOString());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const r = await api<Reservation>('/reservations', {
        method: 'POST',
        body: { itemId: item.id, renterName, renterPhone, startDate, length, ...(hourly ? { startSlot } : {}) },
      });
      setDone(r);
      onBooked();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="font-bold">예약하기</h2>
      <p className="mt-1 text-xs text-slate-500">
        로그인 없이 이름과 연락처로 예약해요. 한 사람당 예약과 대여를 합쳐 3건까지 할 수 있어요.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="이름">
            <input className={inputClass} value={renterName} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
          </Field>
          <Field label="연락처" hint="- 없이 숫자만 입력해도 돼요">
            <input
              className={inputClass}
              value={renterPhone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              inputMode="tel"
            />
          </Field>
        </div>
        <div className={`grid gap-3 ${hourly ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <Field label={hourly ? '날짜' : '시작일'}>
            <select className={inputClass} value={startDate} onChange={(e) => setDate(e.target.value)}>
              {days.map((d) => (
                <option key={d} value={d}>
                  {fmtDay(d)}
                </option>
              ))}
            </select>
          </Field>
          {hourly && (
            <Field label="시작 시간">
              <select className={inputClass} value={startSlot} onChange={(e) => setSlot(Number(e.target.value))}>
                {SLOT_LABELS.map((s, i) => (
                  <option key={s} value={i}>
                    {s.split('–')[0]}시부터
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="기간">
            <select className={inputClass} value={length} onChange={(e) => setLength(Number(e.target.value))}>
              {Array.from({ length: item.maxDuration }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {hourly ? `${n * SLOT_HOURS}시간` : `${n}일`}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          🗓 {preview}
        </p>
        <ErrorBox error={error} />
        {done && (
          <SuccessBox>
            <p className="font-semibold">예약이 완료됐어요!</p>
            <p className="mt-1">
              {done.itemName} · {fmtRange(done.startAt, done.endAt)} · {done.locationName}
            </p>
            <Link href="/my" className="mt-2 inline-block font-semibold underline">
              내 예약에서 확인하기 →
            </Link>
          </SuccessBox>
        )}
        <button className={`${btnPrimary} w-full`} disabled={busy}>
          {busy ? '예약하는 중…' : '예약 신청'}
        </button>
      </form>
    </Card>
  );
}

function ReportForm({ item, onReported }: { item: ItemDetail; onReported: () => void }) {
  const [open, setOpen] = useState(false);
  const [reporterName, setName] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ message: string }>('/damage-reports', {
        method: 'POST',
        body: { itemId: item.id, reporterName, content },
      });
      setDone(r.message);
      setContent('');
      onReported();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">고장 신고</h2>
          <p className="text-xs text-slate-500">고장 난 곳을 알려 주시면 직원이 확인할 때까지 예약이 잠시 막혀요.</p>
        </div>
        <button type="button" className={btnSecondary} onClick={() => setOpen((v) => !v)}>
          {open ? '닫기' : '🛠 고장 신고하기'}
        </button>
      </div>
      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            신고할 물품: <b>{item.name}</b> ({item.location.name})
          </p>
          <Field label="신고하는 분 이름">
            <input className={inputClass} value={reporterName} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
          </Field>
          <Field label="어디가 고장 났나요?">
            <textarea className={inputClass} rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          </Field>
          <ErrorBox error={error} />
          {done && <SuccessBox>{done}</SuccessBox>}
          <button className={btnPrimary} disabled={busy}>
            {busy ? '보내는 중…' : '신고 보내기'}
          </button>
        </form>
      )}
    </Card>
  );
}
