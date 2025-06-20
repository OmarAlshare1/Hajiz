'use client'; // This component uses client-side hooks and interactions

import { Fragment, useState } from 'react'; // React Fragment for grouping, useState for component state
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'; // Headless UI components for accessible dialogs, disclosures, popovers, and transitions
import {
  Bars3Icon,          // Hamburger menu icon
  XMarkIcon,           // Close (X) icon
  UserCircleIcon,      // User profile icon
  CalendarIcon,        // Calendar/Appointments icon
  BuildingOfficeIcon,  // Providers/Business icon
  MagnifyingGlassIcon, // Search icon (optional, could be in main search bar)
  Cog6ToothIcon,       // Settings icon (assuming this is available in @heroicons/react/24/outline)
  ArrowRightOnRectangleIcon, // Logout icon (assuming this is available)
  HomeIcon, // Home icon
  QuestionMarkCircleIcon, // About icon
  PhoneIcon // Contact icon
} from '@heroicons/react/24/outline'; // Importing icons from Heroicons (ensure version is 24/outline)
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // Chevron down icon for dropdowns
import Link from 'next/link';       // Next.js Link component for client-side navigation
import { usePathname, useRouter } from 'next/navigation'; // useRouter and usePathname hooks from Next.js App Router
import { useTranslations } from 'next-intl'; // Hook for internationalization translations
import { useAuth } from '../../hooks/useAuth'; // Custom authentication hook

// Define main navigation links
const mainNavigation = [
  { name: 'home', href: '/', icon: HomeIcon },
  { name: 'providers', href: '/providers', icon: BuildingOfficeIcon }, // Added Providers link
  { name: 'about', href: '/policy', icon: QuestionMarkCircleIcon }, // Re-purposed to policy page, adjust if needed
  // { name: 'contact', href: '/contact', icon: PhoneIcon }, // Keep if you have a separate contact page
];

// Define user-specific navigation links (for authenticated users)
const authUserNavigation = [
  { name: 'profile', href: '/profile', icon: UserCircleIcon },
  { name: 'appointments', href: '/appointments', icon: CalendarIcon },
  { name: 'provider_profile', href: '/profile/provider', icon: BuildingOfficeIcon, role: 'provider' }, // Specific for providers
  // { name: 'settings', href: '/settings', icon: Cog6ToothIcon }, // Uncomment if you have a settings page
];

// Helper function to conditionally apply Tailwind classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu open/close
  const router = useRouter(); // Next.js router instance
  const pathname = usePathname(); // Get current pathname for active link highlighting
  const t = useTranslations('Common'); // Initialize translations hook

  // Use authentication context to get user data and authentication status
  const { user, isAuthenticated, logout } = useAuth();

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout function from useAuth
    router.push('/auth/login'); // Redirect to login page after logout
  };

  // Filter user navigation based on role
  const filteredAuthUserNavigation = authUserNavigation.filter(item => {
    if (item.role === 'provider' && user?.role !== 'provider') {
      return false; // Hide provider-specific link if not a provider
    }
    return true; // Show all other links
  });

  return (
    // Main container with min-height to push footer to bottom and global styling
    <div className="min-h-screen flex flex-col bg-gray-100 font-inter">
      {/* Fixed Header (Navbar) */}
      <header className="sticky top-0 z-30 w-full bg-white shadow-md">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="sr-only">Hajiz</span>
              <img
                className="h-9 w-auto rounded-full shadow-sm" // Increased size, rounded, and subtle shadow
                src="/hajiz logo.jpeg" // Ensure correct path to your logo
                alt="Hajiz"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:gap-x-8 rtl:space-x-reverse">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    pathname === item.href || (item.name === 'providers' && pathname.startsWith('/providers'))
                      ? 'bg-blue-50 text-blue-700 font-semibold' // Active link styling
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700', // Inactive link styling
                    'rounded-md px-3 py-2 text-sm font-medium transition duration-150 ease-in-out'
                  )}
                >
                  {t(item.name)}
                </Link>
              ))}
            </div>

            {/* Desktop Auth/User Menu */}
            <div className="hidden md:flex md:items-center">
              {isAuthenticated ? (
                // Authenticated User Dropdown Menu
                <Popover className="relative">
                  <Popover.Button className="flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                    <UserCircleIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                    <span>{user?.name || t('myAccount')}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {filteredAuthUserNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)} // Close menu on click
                            className={classNames(
                              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700',
                              'block px-4 py-2 text-sm hover:bg-gray-100 transition duration-150 ease-in-out text-right'
                            )}
                          >
                            <span className="flex items-center">
                              {item.icon && <item.icon className="h-5 w-5 rtl:ml-2 ltr:mr-2 text-gray-500" aria-hidden="true" />}
                              {t(item.name)}
                            </span>
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left rtl:text-right block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition duration-150 ease-in-out"
                        >
                          <span className="flex items-center">
                            <ArrowRightOnRectangleIcon className="h-5 w-5 rtl:ml-2 ltr:mr-2 text-red-500" aria-hidden="true" />
                            {t('logout')}
                          </span>
                        </button>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              ) : (
                // Not Authenticated: Login/Register buttons
                <div className="flex gap-x-4 rtl:space-x-reverse">
                  <Link
                    href="/auth/login"
                    className="rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition duration-150 ease-in-out"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/register-customer"
                    className="rounded-md bg-gray-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 transition duration-150 ease-in-out"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <div className="md:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">{t('openMenu')}</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dialog */}
      <Dialog as="div" className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 z-40" aria-hidden="true" /> {/* Dark overlay */}
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transform ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <span className="sr-only">Hajiz</span>
                <img
                  className="h-9 w-auto rounded-full shadow-sm"
                  src="/hajiz logo.jpeg"
                  alt="Hajiz"
                />
                <span className="rtl:mr-2 ltr:ml-2 text-xl font-semibold text-gray-900">حجز</span> {/* App name next to logo */}
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">{t('closeMenu')}</span>
                <XMarkIcon className="h-7 w-7" aria-hidden="true" /> {/* Larger close icon */}
              </button>
            </div>
            <div className="flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {mainNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)} // Close menu on click
                      className={classNames(
                        pathname === item.href || (item.name === 'providers' && pathname.startsWith('/providers'))
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-900 hover:bg-gray-50',
                        '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition duration-150 ease-in-out'
                      )}
                    >
                      <span className="flex items-center">
                        <item.icon className="h-6 w-6 rtl:ml-3 ltr:mr-3 text-gray-500" aria-hidden="true" />
                        {t(item.name)}
                      </span>
                    </Link>
                  ))}

                  {/* Authenticated User Navigation in Mobile Menu */}
                  {isAuthenticated && (
                    <>
                      {filteredAuthUserNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={classNames(
                            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-900 hover:bg-gray-50',
                            '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition duration-150 ease-in-out'
                          )}
                        >
                          <span className="flex items-center">
                            {item.icon && <item.icon className="h-6 w-6 rtl:ml-3 ltr:mr-3 text-gray-500" aria-hidden="true" />}
                            {t(item.name)}
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>

                {/* Login/Logout Section in Mobile Menu */}
                <div className="py-6">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-600 hover:bg-gray-50 w-full text-right transition duration-150 ease-in-out"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6 rtl:ml-3 ltr:mr-3 text-red-500" aria-hidden="true" />
                      {t('logout')}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-y-4">
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md bg-blue-600 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 w-full text-center transition duration-150 ease-in-out"
                      >
                        {t('login')}
                      </Link>
                      <Link
                        href="/auth/register-customer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md bg-gray-500 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-gray-600 w-full text-center transition duration-150 ease-in-out"
                      >
                        {t('register')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>

      {/* Main Content Area (Children Pages will be rendered here) */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto py-8 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
          {/* Logos and Policy Link */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 sm:order-2">
            <Link href="/policy" className="text-blue-600 hover:underline font-semibold text-sm transition duration-150 ease-in-out">سياسة الخصوصية</Link>
            <img src="/syriatel.png" alt="Syriatel Logo" className="h-8 w-auto object-contain hover:scale-105 transition transform duration-150" />
            <img src="/mtn.png" alt="MTN Logo" className="h-8 w-auto object-contain hover:scale-105 transition transform duration-150" />
            <img src="/vercel.svg" alt="Vercel Logo" className="h-8 w-auto object-contain hover:scale-105 transition transform duration-150" />
            <img src="/next.svg" alt="Next.js Logo" className="h-8 w-auto object-contain hover:scale-105 transition transform duration-150" />
          </div>
          {/* Copyright Text */}
          <div className="mt-8 sm:mt-0 sm:order-1 text-center sm:text-left">
            <p className="text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} Hajiz. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
