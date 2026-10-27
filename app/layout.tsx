import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { NavLinks, StaticNavLinks } from '@/components/nav';
import { WakeBanner } from '@/components/wake-banner';
import './globals.css';

export const metadata: Metadata = {
  title: '한빛구 공공 생활물품 대여소',
  description: '한빛구 거점 4곳의 공구, 캠핑, 생활, 행사 물품을 한곳에서 찾고 예약하세요. (가상 서비스)',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <WakeBanner />
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/items" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-lg text-white">🧰</span>
              <span>
                <span className="block text-xs font-medium text-teal-700">한빛구청 공유센터</span>
                <span className="block text-base font-bold leading-tight">공공 생활물품 대여소</span>
              </span>
            </Link>
            <Suspense fallback={<StaticNavLinks />}>
              <NavLinks />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
