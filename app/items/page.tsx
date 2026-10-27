import { Suspense } from 'react';
import { Loading, PageTitle } from '@/components/ui';
import { ItemsBrowser } from './items-browser';

export const metadata = { title: '물품 찾기 | 공공 생활물품 대여소' };

export default function ItemsPage() {
  return (
    <>
      <PageTitle
        title="물품 찾기"
        desc="한빛구 거점 4곳의 공용 물품을 한 번에 찾아보세요. 물품을 누르면 예약 현황을 보고 바로 예약할 수 있어요."
      />
      <Suspense fallback={<Loading />}>
        <ItemsBrowser />
      </Suspense>
    </>
  );
}
