'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointments } from '../../lib/api';
import { Dialog } from '@headlessui/react';

import '../../styles/syrian-theme.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: userLoading, updateProfile } = useAuth();
  const queryClient = useQueryClient();


  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    try {
      await updateProfile(editFormData);
      setEditSuccess('تم تحديث الملف الشخصي بنجاح!');
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error: any) {
      setEditError(error.message || 'فشل في تحديث الملف الشخصي');
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50">
      {/* Syrian Hero Header */}
      <div className="relative bg-gradient-to-r from-red-600 via-white to-green-600 py-16">
        {/* Syrian Wave Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path d="M0,100 C300,200 600,0 900,100 C1050,150 1150,50 1200,100 L1200,400 L0,400 Z" fill="currentColor" className="text-red-700" />
            <path d="M0,200 C300,100 600,300 900,200 C1050,150 1150,250 1200,200 L1200,400 L0,400 Z" fill="currentColor" className="text-green-700" />
          </svg>
        </div>
        
        {/* Syrian Flag Decorations */}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hajiz Logo */}
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">حجز</h1>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {editSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {editSuccess}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-green-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">المعلومات الشخصية</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم
                </label>
                <p className="text-lg text-gray-900">{user.name || 'غير محدد'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <p className="text-lg text-gray-900">{user.email || 'غير محدد'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <p className="text-lg text-gray-900">{user.phone || 'غير محدد'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <p className="text-lg text-gray-900">{user.address || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-gradient-to-r from-red-600 to-green-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-green-700 transition-all duration-200 font-medium"
              >
                تعديل الملف الشخصي
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-green-600 px-6 py-4">
            <h3 className="text-xl font-semibold text-white">إعدادات الحساب</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">تغيير كلمة المرور</h4>
                  <p className="text-sm text-gray-600">قم بتحديث كلمة المرور الخاصة بك</p>
                </div>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  تغيير
                </button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">الإشعارات</h4>
                  <p className="text-sm text-gray-600">إدارة تفضيلات الإشعارات</p>
                </div>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  إدارة
                </button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-lg font-medium text-red-600">حذف الحساب</h4>
                  <p className="text-sm text-gray-600">حذف حسابك نهائياً</p>
                </div>
                <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200">
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              تعديل الملف الشخصي
            </Dialog.Title>
            
            {editError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {editError}
              </div>
            )}
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-green-600 text-white rounded-md hover:from-red-700 hover:to-green-700 transition-all duration-200"
                >
                  حفظ
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
