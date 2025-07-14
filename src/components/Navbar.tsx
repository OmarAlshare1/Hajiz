'use client'; // This component uses client-side hooks and interactions

import Link from 'next/link'; // Next.js Link component for client-side navigation
import { usePathname, useRouter } from 'next/navigation'; // useRouter and usePathname hooks from Next.js App Router
import React, { Fragment, useState } from 'react'; // React, Fragment for grouping, useState for component state
import { Dialog, Popover, Transition } from '@headlessui/react'; // Headless UI components for accessible dialogs, popovers, and transitions
import {
  Bars3Icon,          // Hamburger menu icon
  XMarkIcon,           // Close (X) icon
  UserCircleIcon,      // User profile icon
  CalendarIcon,        // Calendar/Appointments icon
  BuildingOfficeIcon,  // Providers/Business icon
  HomeIcon,            // Home icon
  QuestionMarkCircleIcon, // About/Policy icon
  ArrowRightOnRectangleIcon, // Logout icon
  ChevronDownIcon,     // Chevron down icon
} from '@heroicons/react/24/outline'; // Importing icons from Heroicons

import { useAuth } from '../hooks/useAuth'; // Custom authentication hook
import { useTranslations } from '../hooks/useTranslations'; // Hook for internationalization translations
import { useLanguage } from '../contexts/LanguageContext'; // Hook for language switching

// Helper function to conditionally apply Tailwind classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu open/close
  const router = useRouter(); // Next.js router instance
  const pathname = usePathname(); // Get current pathname for active link highlighting
  const { t } = useTranslations('Common'); // Initialize translations hook
  const { language, toggleLanguage } = useLanguage(); // Language context for switching

  // Use authentication context to get user data and authentication status
  const { user, isAuthenticated, logout } = useAuth();
  
  // Debug: Log authentication state
  console.log('Navbar - Auth State:', { isAuthenticated, user });

  // Define main navigation links with icons using translations
  const mainNavigation = [
    { name: t('home'), href: '/', icon: HomeIcon },
    { name: t('providers'), href: '/providers', icon: BuildingOfficeIcon },
    { name: t('policy'), href: '/policy', icon: QuestionMarkCircleIcon },
  ];

  // Define user-specific navigation links (for authenticated users)
  const authUserNavigation = [
    { name: t('home'), href: '/home', icon: HomeIcon },
    { name: t('profile'), href: '/profile', icon: UserCircleIcon },
    { name: t('appointments'), href: '/appointments', icon: CalendarIcon },
    { name: t('profile'), href: '/profile/provider', icon: BuildingOfficeIcon, role: 'provider' },
  ];

  // Handle user logout
  const handleLogout = () => {
    logout(); // Call logout function from useAuth
    router.push('/auth/login'); // Redirect to login page after logout
    setMobileMenuOpen(false); // Close mobile menu on logout
  };

  // Filter user navigation based on role (e.g., show provider profile only to providers)
  const filteredAuthUserNavigation = authUserNavigation.filter(item => {
    if (item.role === 'provider' && user?.role !== 'provider') {
      return false; // Hide provider-specific link if not a provider
    }
    return true; // Show all other links
  });

  return (
    // Fixed Header (Navbar) - placed at the top, spans full width, and has shadow
    <header className="sticky top-0 z-30 w-full bg-white shadow-md border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3" aria-label="Top navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - always visible */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <span className="sr-only">Hajiz</span>
            <img
              className="h-12 w-auto rounded-full shadow-sm"
              src="/hajiz logo.jpeg"
              alt="Hajiz Logo"
            />
            <div className="rtl:mr-2 ltr:ml-2 flex flex-col">
              <span className="text-xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                حجز
              </span>
              <span className="text-sm text-gray-500 hidden sm:block">
                Hajiz
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:gap-x-8 rtl:space-x-reverse">
            {mainNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  // Apply active styling if current pathname matches href or starts with it (for nested routes)
                  pathname === item.href || (item.href !== '/' && pathname && typeof pathname === 'string' && pathname.startsWith(item.href))
                    ? 'bg-primary-50 text-primary-700 font-semibold' // Active link styling with green theme
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600', // Inactive link styling with green hover
                  'rounded-md px-3 py-2 text-sm font-medium transition duration-150 ease-in-out'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth/User Menu - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:gap-x-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition duration-150 ease-in-out"
              title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>{language === 'ar' ? 'EN' : 'عر'}</span>
            </button>
            
            {/* Debug: Show authentication status */}
            {/* <div className="text-xs text-gray-500 mr-2">
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              {user ? ` - ${user.name}` : ''}
            </div> */}
            {isAuthenticated ? (
              // Authenticated User: Dropdown Menu for Profile, Appointments, Logout
              <Popover className="relative">
                <Popover.Button className="flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                  <UserCircleIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                  <span>{user?.name || t('myAccount')}</span> {/* Display user's name or "My Account" */}
                  <ChevronDownIcon className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
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
                            pathname === item.href || (item.href !== '/' && pathname && typeof pathname === 'string' && pathname.startsWith(item.href))
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm hover:bg-gray-100 transition duration-150 ease-in-out text-right'
                          )}
                        >
                          <span className="flex items-center">
                            {item.icon && <item.icon className="h-5 w-5 rtl:ml-2 ltr:mr-2 text-gray-500" aria-hidden="true" />}
                            {item.name}
                          </span>
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full text-right block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition duration-150 ease-in-out"
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
                  className="rounded-md bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition duration-150 ease-in-out"
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

          {/* Mobile Menu Button (Hamburger) - visible only on mobile */}
          <div className="md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-all duration-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dialog - slides from right */}
      <Dialog as="div" className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <Transition show={mobileMenuOpen}>
          <Transition.Child
            as="div"
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
            as="div"
            // Slide in from right for RTL
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
                  alt="Hajiz Logo"
                />
                <span className="rtl:mr-2 ltr:ml-2 text-xl font-semibold text-green-600">Hajiz</span> {/* App name next to logo */}
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
                        pathname === item.href || (item.href !== '/' && pathname && typeof pathname === 'string' && pathname.startsWith(item.href))
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-gray-900 hover:bg-gray-50',
                        '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition duration-150 ease-in-out'
                      )}
                    >
                      <span className="flex items-center">
                        <item.icon className="h-6 w-6 rtl:ml-3 ltr:mr-3 text-gray-500" aria-hidden="true" />
                        {item.name}
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
                            pathname === item.href || (item.href !== '/' && pathname && typeof pathname === 'string' && pathname.startsWith(item.href))
                              ? 'bg-primary-50 text-primary-700 font-semibold'
                              : 'text-gray-900 hover:bg-gray-50',
                            '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition duration-150 ease-in-out'
                          )}
                        >
                          <span className="flex items-center">
                            {item.icon && <item.icon className="h-6 w-6 rtl:ml-3 ltr:mr-3 text-gray-500" aria-hidden="true" />}
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>

                {/* Language Switcher in Mobile Menu */}
                <div className="py-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      toggleLanguage();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-x-2 w-full rounded-md bg-gray-100 px-3 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-200 transition duration-150 ease-in-out"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>{language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}</span>
                  </button>
                </div>

                {/* Login/Logout Section in Mobile Menu */}
                <div className="py-6">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="rounded-md bg-red-600 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-red-700 w-full text-center transition duration-150 ease-in-out"
                    >
                      <span className="flex items-center justify-center">
                          <ArrowRightOnRectangleIcon className="h-6 w-6 rtl:ml-3 ltr:mr-3 text-white" aria-hidden="true" />
                          {t('logout')}
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-y-4">
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md bg-primary-600 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-primary-700 w-full text-center transition duration-150 ease-in-out"
                      >
                        {t('login')}
                      </Link>
                      <Link
                        href="/auth/register-customer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md bg-gray-500 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-gray-600 w-full text-center transition duration-150 ease-in-out mt-4"
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
        </Transition>
      </Dialog>
    </header>
  );
}
