'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/items', label: '물품 찾기' },
  { href: '/my', label: '내 예약' },
  { href: '/dashboard', label: '현황' },
  { href: '/admin', label: '직원' },
];

function LinkList({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {LINKS.map((l) => {
        const on = current.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-1.5 font-medium ${on ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** 지금 보고 있는 메뉴를 강조한다 (주소를 읽으므로 Suspense 안에서 쓴다) */
export function NavLinks() {
  return <LinkList current={usePathname() ?? ''} />;
}

/** Suspense 대체 화면용: 주소를 읽지 않는다 */
export function StaticNavLinks() {
  return <LinkList current="" />;
}
