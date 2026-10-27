'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { btnPrimary, Card, ErrorBox, Field, inputClass, PageTitle, SuccessBox } from '@/components/ui';
import { api } from '@/lib/api';
import { CATEGORY_LABEL, RENTAL_TYPE_LABEL } from '@/lib/format';
import type { Category, Location, RentalType } from '@/lib/types';

type Form = {
  locationId: string;
  name: string;
  category: string;
  description: string;
  caution: string;
  imageUrl: string;
  rentalType: string;
  maxDuration: string;
};

const EMPTY: Form = {
  locationId: '',
  name: '',
  category: '',
  description: '',
  caution: '',
  imageUrl: '',
  rentalType: 'DAILY',
  maxDuration: '',
};

// 숫자 칸은 숫자로 바꿀 수 있을 때만 숫자로 보낸다.
// 글자를 넣으면 그대로 보내서, 서버가 "숫자로 입력해 주세요"라고 안내하게 한다.
const toNumberIfPossible = (v: string) => (v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v);

export default function NewItemPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [created, setCreated] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    api<Location[]>('/locations').then(setLocations).catch(setError);
  }, []);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const body = {
        locationId: form.locationId ? Number(form.locationId) : undefined,
        name: form.name,
        category: form.category || undefined,
        description: form.description,
        caution: form.caution,
        imageUrl: form.imageUrl,
        rentalType: form.rentalType,
        maxDuration: form.maxDuration === '' ? undefined : toNumberIfPossible(form.maxDuration),
      };
      const r = await api<{ id: number; name: string }>('/items', { method: 'POST', body });
      setCreated(r);
      setForm(EMPTY);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const hourly = form.rentalType === 'HOURLY';

  return (
    <>
      <PageTitle title="물품 등록" desc="새로 들어온 물품을 등록해요. 빈칸이나 잘못된 값이 있으면 서버가 쉬운 말로 알려 줘요." />
      <Card className="max-w-2xl">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="거점 *">
              <select className={inputClass} value={form.locationId} onChange={set('locationId')}>
                <option value="">거점을 골라 주세요</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="분류 *">
              <select className={inputClass} value={form.category} onChange={set('category')}>
                <option value="">분류를 골라 주세요</option>
                {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="물품 이름 *">
            <input className={inputClass} value={form.name} onChange={set('name')} placeholder="예: 전동 드라이버" />
          </Field>
          <Field label="설명 *">
            <textarea className={inputClass} rows={3} value={form.description} onChange={set('description')} placeholder="구성품, 크기 등" />
          </Field>
          <Field label="주의사항">
            <input className={inputClass} value={form.caution} onChange={set('caution')} placeholder="예: 배터리를 충전해서 반납해 주세요." />
          </Field>
          <Field label="사진 주소" hint="https://로 시작하는 이미지 주소 (선택)">
            <input className={inputClass} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="대여 방식 *">
              <select className={inputClass} value={form.rentalType} onChange={set('rentalType')}>
                {(Object.keys(RENTAL_TYPE_LABEL) as RentalType[]).map((t) => (
                  <option key={t} value={t}>
                    {RENTAL_TYPE_LABEL[t]} {t === 'HOURLY' ? '(3시간 단위)' : '(하루 단위)'}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={hourly ? '최대 기간 (칸 수) *' : '최대 기간 (일) *'}
              hint={hourly ? '1칸 = 3시간, 1~2칸' : '1~7일'}
            >
              <input className={inputClass} value={form.maxDuration} onChange={set('maxDuration')} placeholder={hourly ? '2' : '3'} />
            </Field>
          </div>
          <ErrorBox error={error} />
          {created && (
            <SuccessBox>
              <b>{created.name}</b>을(를) 등록했어요.{' '}
              <Link href={`/items/${created.id}`} className="font-semibold underline">
                물품 보러 가기 →
              </Link>
            </SuccessBox>
          )}
          <button className={btnPrimary} disabled={busy}>
            {busy ? '등록하는 중…' : '물품 등록'}
          </button>
        </form>
      </Card>
    </>
  );
}
