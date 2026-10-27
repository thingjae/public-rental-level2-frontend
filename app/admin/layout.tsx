import Link from 'next/link';

export const metadata = { title: '직원 화면 | 공공 생활물품 대여소' };

const TABS = [
  { href: '/admin', label: '직원 홈' },
  { href: '/admin/reservations', label: '예약 관리' },
  { href: '/admin/items/new', label: '물품 등록' },
  { href: '/admin/reports', label: '고장 신고' },
];

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div>
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        👷 <b>거점 직원용 화면</b>이에요. Level 2에는 로그인이 없어서 주소를 아는 사람은 누구나 열 수 있어요. (기획서에 적은
        한계로, 로그인과 역할 구분은 다음 단계에서 해결할 과제예요)
      </div>
      <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
