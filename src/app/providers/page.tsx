import type { Metadata } from 'next';
import SyrianProvidersPage from '../../components/SyrianProvidersPage';

export const metadata: Metadata = {
  title: 'مقدمو الخدمات - حجز',
  description: 'اعثر على أفضل الأطباء والمتخصصين في سوريا',
};

export default function Providers() {
  return <SyrianProvidersPage />;
}
