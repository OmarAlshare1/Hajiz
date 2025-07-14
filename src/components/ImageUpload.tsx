'use client';

import React, { useState } from 'react';
import { uploads } from '../lib/api';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesUpdate: (images: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ images, onImagesUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const response = await uploads.uploadProviderImages(formData);
      onImagesUpdate(response.data.images);
      setSuccess('تم رفع الصور بنجاح');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في رفع الصور');
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await uploads.deleteProviderImage(imageUrl);
      onImagesUpdate(images.filter(img => img !== imageUrl));
      setSuccess('تم حذف الصورة بنجاح');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في حذف الصورة');
      console.error('Image delete error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">صور مقدم الخدمة</h3>
      
      {/* Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image 
                src={img} 
                alt={`صورة ${index + 1}`} 
                fill 
                className="object-cover" 
              />
            </div>
            <button
              onClick={() => handleImageDelete(img)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="حذف الصورة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < 5 && (
          <div className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 text-sm text-gray-500">إضافة صورة</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple={images.length < 4} 
                onChange={handleImageUpload} 
                disabled={uploading} 
              />
            </label>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
      {uploading && <p className="text-blue-500 text-sm mt-2">جاري الرفع...</p>}
      
      <p className="text-sm text-gray-500 mt-2">
        يمكنك رفع حتى 5 صور. الصيغ المدعومة: JPG، JPEG، PNG، GIF.
      </p>
    </div>
  );
};

export default ImageUpload;