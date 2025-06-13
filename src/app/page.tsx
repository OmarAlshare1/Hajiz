import { Metadata } from 'next';
import HomePage from '../components/home/HomePage';

export const metadata: Metadata = {
  title: 'الرئيسية - حاجز',
  description: 'احجز موعدك مع أفضل مقدمي الخدمات في سوريا',
};

export default function Home() {
  return <HomePage />;
}
