import { Fragment, useState } from 'react';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

const navigation = [
  { name: 'home', href: '/' },
  { name: 'about', href: '/about' },
  { name: 'contact', href: '/contact' },
];

const userNavigation = [
  { name: 'profile', href: '/profile' },
  { name: 'appointments', href: '/appointments' },
  { name: 'settings', href: '/settings' },
  { name: 'logout', href: '/auth/logout' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('Common');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex">
                <span className="sr-only">Hajiz</span>
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Hajiz"
                />
              </Link>
              <div className="hidden md:ml-10 md:block">
                <div className="flex space-x-4 rtl:space-x-reverse">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        router.pathname === item.href
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50',
                        'rounded-md px-3 py-2 text-sm font-medium'
                      )}
                    >
                      {t(item.name)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                <Link
                  href="/auth/login"
                  className="relative inline-flex items-center gap-x-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {t('login')}
                </Link>
              </div>
              <button
                type="button"
                className="relative inline-flex items-center md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">{t('openMenu')}</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <Dialog
        as="div"
        className="md:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Hajiz</span>
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="Hajiz"
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">{t('closeMenu')}</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {t(item.name)}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Link
                  href="/auth/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  {t('login')}
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      <main>{children}</main>

      <footer className="bg-white mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-500">
              {t('terms')}
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} Hajiz. {t('allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 