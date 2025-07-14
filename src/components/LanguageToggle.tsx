'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageIcon } from '@heroicons/react/24/outline';

interface LanguageToggleProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  position = 'top-right',
  className = ''
}) => {
  const { language, toggleLanguage } = useLanguage();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        fixed z-50 
        ${positionClasses[position]}
        bg-white hover:bg-gray-50 
        border-2 border-gray-200 hover:border-red-300
        rounded-xl 
        p-3 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 ease-in-out
        transform hover:scale-110 active:scale-95
        group
        ${className}
      `}
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className="relative">
          <LanguageIcon className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">
          {language === 'ar' ? 'EN' : 'عر'}
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;