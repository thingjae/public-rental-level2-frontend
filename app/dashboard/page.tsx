import { redirect } from 'next/navigation';

// 현황은 직원 화면으로 옮겼다. 예전 주소로 들어와도 새 주소로 보낸다.
export default function OldDashboard() {
  redirect('/admin/dashboard');
}
