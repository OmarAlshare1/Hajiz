'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { providers } from '../lib/api';

interface ImageGalleryProps {
  images: string[];
  showAvailabilityExceptions?: boolean;
}

// Interface for availability exception data
interface IAvailabilityException {
  _id?: string;
  date: string;
  isAvailable: boolean;
  customHours?: {
    open?: string;
    close?: string;
  };
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, showAvailabilityExceptions = false }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [availabilityExceptions, setAvailabilityExceptions] = useState<IAvailabilityException[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const queryClient = useQueryClient();
  
  // Form data for adding/editing availability exceptions
  const [exceptionFormData, setExceptionFormData] = useState<IAvailabilityException>({
    date: new Date().toISOString().split('T')[0], // Default to today's date
    isAvailable: false,
    customHours: {
      open: '09:00',
      close: '17:00'
    }
  });

  // Generate time options for dropdowns (e.g., 09:00, 09:30, ..., 23:30)
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) { // 30 minute intervals
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        times.push({ value: `${hour}:${minute}`, label: `${hour}:${minute}` });
      }
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  // Fetch availability exceptions
  const { data: exceptionsData, isLoading: exceptionsLoading, refetch: refetchExceptions } = useQuery<IAvailabilityException[]>({
    queryKey: ['availability-exceptions'],
    queryFn: async () => {
      try {
        const res = await providers.getAvailabilityExceptions();
        return res.data;
      } catch (err) {
        console.error("Failed to fetch availability exceptions:", err);
        return [];
      }
    },
    enabled: showAvailabilityExceptions,
  });

  // Update exceptions state when data is fetched
  useEffect(() => {
    if (exceptionsData) {
      setAvailabilityExceptions(exceptionsData);
    }
  }, [exceptionsData]);

  // Mutation for adding availability exception
  const addExceptionMutation = useMutation({
    mutationFn: providers.addAvailabilityException,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      setFormSuccess('تم إضافة الاستثناء بنجاح!');
      setShowExceptionModal(false);
      refetchExceptions();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل إضافة الاستثناء');
    }
  });

  // Mutation for deleting availability exception
  const deleteExceptionMutation = useMutation({
    mutationFn: providers.deleteAvailabilityException,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      setFormSuccess('تم حذف الاستثناء بنجاح!');
      refetchExceptions();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'فشل حذف الاستثناء');
    }
  });

  // Open lightbox with selected image
  const openLightbox = (image: string) => {
    setSelectedImage(image);
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Handle form submission for adding/editing availability exception
  const handleExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    // Basic validation
    if (!exceptionFormData.date) {
      setFormError('الرجاء تحديد التاريخ');
      return;
    }
    
    // If available with custom hours, validate time range
    if (exceptionFormData.isAvailable && exceptionFormData.customHours) {
      if (!exceptionFormData.customHours.open || !exceptionFormData.customHours.close) {
        setFormError('الرجاء تحديد ساعات العمل المخصصة');
        return;
      }
    }
    
    try {
      await addExceptionMutation.mutateAsync(exceptionFormData);
    } catch (error) {
      console.error('Error submitting exception:', error);
    }
  };

  // Handle deletion of an availability exception
  const handleDeleteException = async (exceptionId: string) => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الاستثناء؟')) return;
    
    try {
      await deleteExceptionMutation.mutateAsync(exceptionId);
    } catch (error) {
      console.error('Error deleting exception:', error);
    }
  };

  // If no images, don't render anything
  if (!images || images.length === 0) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Custom select component for time selection
  const CustomSelect = ({ 
    options, 
    value, 
    onChange, 
    label, 
    className = '', 
    containerClasses = '',
    selectClasses = ''
  }: { 
    options: {value: string, label: string}[], 
    value: string, 
    onChange: (value: string) => void, 
    label: string,
    className?: string,
    containerClasses?: string,
    selectClasses?: string
  }) => {
    return (
      <div className={`relative ${className}`}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full appearance-none ${selectClasses}`}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="relative group cursor-pointer" 
            onClick={() => openLightbox(img)}
          >
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image 
                src={img} 
                alt={`صورة ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Availability Exceptions Section */}
      {showAvailabilityExceptions && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">استثناءات الجدول الزمني</h3>
            <button
              onClick={() => {
                setExceptionFormData({
                  date: new Date().toISOString().split('T')[0],
                  isAvailable: false,
                  customHours: {
                    open: '09:00',
                    close: '17:00'
                  }
                });
                setFormError('');
                setFormSuccess('');
                setShowExceptionModal(true);
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة استثناء
            </button>
          </div>

          {formSuccess && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm text-right" role="alert">
              <span className="block">{formSuccess}</span>
            </div>
          )}

          {exceptionsLoading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : availabilityExceptions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">لا توجد استثناءات مضافة</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ساعات العمل</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availabilityExceptions.map((exception) => (
                    <tr key={exception._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(exception.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exception.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {exception.isAvailable ? 'متاح' : 'غير متاح'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exception.isAvailable && exception.customHours ? (
                          `${exception.customHours.open} - ${exception.customHours.close}`
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => exception._id && handleDeleteException(exception._id)}
                          className="text-red-600 hover:text-red-900 mr-2"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4" onClick={closeLightbox}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full">
              <Image 
                src={selectedImage} 
                alt="صورة مكبرة" 
                fill 
                className="object-contain" 
              />
            </div>
            <button 
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg" 
              onClick={closeLightbox}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Availability Exception Modal */}
      <Dialog open={showExceptionModal} onClose={() => setShowExceptionModal(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black bg-opacity-60" aria-hidden="true" />
        <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto animate-fade-in-scale">
          <button
            onClick={() => setShowExceptionModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl transition"
            aria-label="إغلاق"
          >
            &times;
          </button>
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">إضافة استثناء في الجدول الزمني</Dialog.Title>

          {addExceptionMutation.isPending && <div className="text-center text-blue-600 text-lg mb-4">جاري الحفظ...</div>}
          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm sm:text-base text-right" role="alert">
              <span className="block">{formError}</span>
            </div>
          )}

          <form onSubmit={handleExceptionSubmit} className="space-y-4">
            <div>
              <label htmlFor="exceptionDate" className="block text-sm sm:text-base font-medium text-gray-700 text-right mb-1">التاريخ:</label>
              <input
                id="exceptionDate"
                type="date"
                value={exceptionFormData.date}
                onChange={(e) => setExceptionFormData({...exceptionFormData, date: e.target.value})}
                className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 text-right text-base"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-end mb-2">
                <label htmlFor="isAvailable" className="text-sm sm:text-base font-medium text-gray-700 ml-2">متاح في هذا اليوم؟</label>
                <input
                  id="isAvailable"
                  type="checkbox"
                  checked={exceptionFormData.isAvailable}
                  onChange={(e) => setExceptionFormData({...exceptionFormData, isAvailable: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
            
            {exceptionFormData.isAvailable && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-800 text-right">ساعات العمل المخصصة:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="openTime" className="block text-sm font-medium text-gray-700 text-right mb-1">وقت البدء:</label>
                    <CustomSelect
                      label="وقت البدء"
                      options={timeOptions}
                      value={exceptionFormData.customHours?.open || '09:00'}
                      onChange={(value) => setExceptionFormData({
                        ...exceptionFormData, 
                        customHours: {
                          ...exceptionFormData.customHours,
                          open: value
                        }
                      })}
                      containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                      selectClasses="py-2.5 px-2 text-sm sm:text-base text-gray-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 text-right mb-1">وقت الانتهاء:</label>
                    <CustomSelect
                      label="وقت الانتهاء"
                      options={timeOptions}
                      value={exceptionFormData.customHours?.close || '17:00'}
                      onChange={(value) => setExceptionFormData({
                        ...exceptionFormData, 
                        customHours: {
                          ...exceptionFormData.customHours,
                          close: value
                        }
                      })}
                      containerClasses="rounded-md shadow-sm border border-gray-300 focus-within:ring-blue-500 focus-within:border-blue-500"
                      selectClasses="py-2.5 px-2 text-sm sm:text-base text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              disabled={addExceptionMutation.isPending}
            >
              {addExceptionMutation.isPending ? 'جاري الحفظ...' : 'حفظ الاستثناء'}
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default ImageGallery;