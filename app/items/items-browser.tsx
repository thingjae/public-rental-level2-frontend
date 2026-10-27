'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, ErrorBox, inputClass, Loading } from '@/components/ui';
import { api } from '@/lib/api';
import {
  CATEGORY_ICON,
  CATEGORY_LABEL,
  ITEM_STATE_TONE,
  maxLabel,
  RENTAL_TYPE_LABEL,
} from '@/lib/format';
import type { Category, Item, Location } from '@/lib/types';

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

export function ItemsBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const keyword = params.get('keyword') ?? '';
  const locationId = params.get('locationId') ?? '';
  const category = params.get('category') ?? '';
  const availableNow = params.get('availableNow') === 'true';

  const [typed, setTyped] = useState(keyword);
  const [locations, setLocations] = useState<Location[]>([]);
  // 결과가 어떤 검색 조건의 결과인지 함께 기억한다. 조건이 바뀌면 새 결과가 올 때까지 "불러오는 중"
  const [result, setResult] = useState<{ query: string; items: Item[] } | null>(null);
  const [error, setError] = useState<unknown>(null);

  const q = new URLSearchParams();
  if (keyword) q.set('keyword', keyword);
  if (locationId) q.set('locationId', locationId);
  if (category) q.set('category', category);
  if (availableNow) q.set('availableNow', 'true');
  const query = q.toString();
  const items = result?.query === query ? result.items : null;

  useEffect(() => {
    api<Location[]>('/locations').then(setLocations).catch(setError);
  }, []);

  useEffect(() => {
    let alive = true;
    api<Item[]>(`/items?${query}`)
      .then((r) => alive && (setResult({ query, items: r }), setError(null)))
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, [query]);

  // 검색 조건은 주소(URL)에 남겨서, 새로고침하거나 링크를 공유해도 그대로 보이게 한다.
  function update(next: Record<string, string>) {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) q.set(k, v);
      else q.delete(k);
    }
    router.replace(`${pathname}?${q}`, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_200px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          update({ keyword: typed.trim() });
        }}
      >
        <div className="flex gap-2">
          <input
            className={inputClass}
            placeholder="물품 이름이나 설명으로 검색 (예: 텐트, 드릴)"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            aria-label="검색어"
          />
          <button className="shrink-0 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
            검색
          </button>
        </div>
        <select
          className={inputClass}
          value={locationId}
          onChange={(e) => update({ locationId: e.target.value })}
          aria-label="거점"
        >
          <option value="">모든 거점</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-teal-700"
            checked={availableNow}
            onChange={(e) => update({ availableNow: e.target.checked ? 'true' : '' })}
          />
          지금 빌릴 수 있는 것만
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          <Chip on={!category} onClick={() => update({ category: '' })}>
            전체
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} on={category === c} onClick={() => update({ category: c })}>
              {CATEGORY_ICON[c]} {CATEGORY_LABEL[c]}
            </Chip>
          ))}
          {(keyword || locationId || category || availableNow) && (
            <button
              type="button"
              className="ml-auto text-sm text-slate-500 underline"
              onClick={() => {
                setTyped('');
                router.replace(pathname, { scroll: false });
              }}
            >
              조건 지우기
            </button>
          )}
        </div>
      </form>

      <ErrorBox error={error} />

      {items === null ? (
        !error && <Loading />
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          조건에 맞는 물품이 없어요. 검색어나 필터를 바꿔 보세요.
        </p>
      ) : (
        <>
          <p className="text-sm text-slate-500">물품 {items.length}개</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                      {CATEGORY_ICON[item.category]}
                    </span>
                    <Badge tone={ITEM_STATE_TONE[item.nowState]}>{item.nowStateLabel}</Badge>
                  </div>
                  <h2 className="mt-3 font-bold text-slate-900">{item.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">📍 {item.location.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-3 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-0.5">{CATEGORY_LABEL[item.category]}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5">
                      {RENTAL_TYPE_LABEL[item.rentalType]} · {maxLabel(item.rentalType, item.maxDuration)}
                    </span>
                    {item.upcomingCount > 0 && (
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-sky-700">예약 {item.upcomingCount}건</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium ${on ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
    >
      {children}
    </button>
  );
}
