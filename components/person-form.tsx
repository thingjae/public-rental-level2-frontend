'use client';

import { useState } from 'react';
import { btnPrimary, Field, inputClass } from './ui';

export type Person = { renterName: string; renterPhone: string };

/** 로그인 대신 이름 + 연락처로 내 예약을 찾는다 */
export function PersonForm({ busy, onSubmit, submitLabel = '내 예약 찾기' }: {
  busy?: boolean;
  onSubmit: (p: Person) => void;
  submitLabel?: string;
}) {
  const [renterName, setName] = useState('');
  const [renterPhone, setPhone] = useState('');
  return (
    <form
      noValidate
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ renterName, renterPhone });
      }}
    >
      <Field label="이름">
        <input className={inputClass} value={renterName} onChange={(e) => setName(e.target.value)} placeholder="예약할 때 쓴 이름" />
      </Field>
      <Field label="연락처">
        <input
          className={inputClass}
          value={renterPhone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01012345678 (- 없이 입력 가능)"
          inputMode="tel"
        />
      </Field>
      <button className={btnPrimary} disabled={busy}>
        {busy ? '찾는 중…' : submitLabel}
      </button>
    </form>
  );
}
