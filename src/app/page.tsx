import type { Metadata } from 'next';
import SyrianHomepage from '../components/SyrianHomepage';

export const metadata: Metadata = {
  title: 'الرئيسية - حجز',
  description: 'احجز موعدك مع أفضل مقدمي الخدمات في سوريا',
};

export default function Home() {
  return <SyrianHomepage />;
}
