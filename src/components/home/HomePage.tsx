'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { search } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await search.providers(searchQuery);
      setResults(res.data);
    } catch (err) {
      setError('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate">
      {/* Background */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-secondary-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            حجز - احجز موعدك بسهولة
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            منصة حجز المواعيد الأولى في سوريا. احجز موعدك مع أفضل مقدمي الخدمات في مجالات متعددة.
          </p>
          <div className="mt-10">
            <form onSubmit={handleSearch} className="flex gap-x-4">
              <label htmlFor="search" className="sr-only">
                بحث
              </label>
              <div className="flex-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pl-3">
                    <MagnifyingGlassIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-0 py-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="ابحث عن خدمة أو مقدم خدمة..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex-none rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                بحث
              </button>
            </form>
            {loading && <div className="mt-4 text-primary-600">جاري البحث...</div>}
            {error && <div className="mt-4 text-red-600">{error}</div>}
            {results.length > 0 && (
              <div className="mt-6 text-right">
                <h3 className="text-lg font-semibold mb-2">نتائج البحث:</h3>
                <ul className="space-y-4">
                  {results.map((provider) => (
                    <li key={provider._id} className="p-4 border rounded-md bg-white shadow">
                      <div className="font-bold">{provider.businessName}</div>
                      <div className="text-sm text-gray-600">{provider.category}</div>
                      <div className="text-sm text-gray-500">{provider.description}</div>
                      <div className="mt-2">
                        <span className="font-semibold">الخدمات:</span>
                        <ul className="list-disc list-inside">
                          {provider.services.map((service: any, idx: number) => (
                            <li key={idx}>{service.name} - {service.price} ل.س</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2
            className="text-base font-semibold leading-7 text-primary-600 cursor-pointer hover:underline"
            onClick={() => router.push('/policy')}
          >
            لماذا حجز؟
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            كل ما تحتاجه لإدارة مواعيدك
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            نقدم لك منصة متكاملة لحجز وإدارة المواعيد بكل سهولة وأمان
          </p>
        </div>
      </div>
    </div>
  );
} 