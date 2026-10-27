import { Suspense } from 'react';
import { Loading } from '@/components/ui';
import { ItemDetailView } from './item-detail';

export const metadata = { title: '물품 상세 | 공공 생활물품 대여소' };

export default function ItemPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ItemDetailView />
    </Suspense>
  );
}
