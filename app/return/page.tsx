import { Suspense } from 'react';
import { Loading, PageTitle } from '@/components/ui';
import { ReturnView } from './return-view';

export const metadata = { title: 'QR 반납 | 공공 생활물품 대여소' };

export default function ReturnPage() {
  return (
    <>
      <PageTitle title="QR 반납" desc="거점에 붙은 QR 코드로 들어온 화면이에요. 이름과 연락처로 반납할 물품을 찾아요." />
      <Suspense fallback={<Loading />}>
        <ReturnView />
      </Suspense>
    </>
  );
}
