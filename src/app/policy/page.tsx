'use client';

import React from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import '../../styles/syrian-theme.css';

export default function PolicyPage() {
  const lastUpdatedDate = '19 يونيو 2025';
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Syrian Hero Header */}
      <div className="syrian-hero relative overflow-hidden py-16">
        {/* Syrian Wave Background */}
        <div className="syrian-wave-bg"></div>
        
      
        
        {/* Hajiz Logo */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-24">
          <img src="/hajiz logo.jpeg" alt="Hajiz Logo" className="w-full h-full object-contain rounded-full shadow-lg" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 mt-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            سياسة الخصوصية
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
            نحن نحترم خصوصيتك ونحمي بياناتك الشخصية
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">سياسة الخصوصية</h2>
            <p className="text-gray-600">آخر تحديث: {lastUpdatedDate}</p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">1. المعلومات التي نجمعها</h3>
              <p className="mb-4">
                نحن نجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل في منصة حجز، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>الاسم الكامل</li>
                <li>عنوان البريد الإلكتروني</li>
                <li>رقم الهاتف</li>
                <li>العنوان (للمقدمين)</li>
                <li>معلومات الخدمات المقدمة (للمقدمين)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">2. كيف نستخدم معلوماتك</h3>
              <p className="mb-4">
                نستخدم المعلومات التي نجمعها للأغراض التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>تقديم وتحسين خدماتنا</li>
                <li>التواصل معك بشأن حسابك والخدمات</li>
                <li>معالجة المواعيد والحجوزات</li>
                <li>تقديم الدعم الفني</li>
                <li>إرسال التحديثات والإشعارات المهمة</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">3. مشاركة المعلومات</h3>
              <p className="mb-4">
                نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة، باستثناء:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>عندما تطلب ذلك صراحة</li>
                <li>لتقديم الخدمات المطلوبة (مثل مشاركة معلومات الاتصال مع مقدمي الخدمات)</li>
                <li>عند الضرورة القانونية</li>
                <li>لحماية حقوقنا أو حقوق الآخرين</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">4. أمان البيانات</h3>
              <p>
                نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. 
                نستخدم تشفير SSL وتدابير أمنية أخرى لحماية بياناتك أثناء النقل والتخزين.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">5. حقوقك</h3>
              <p className="mb-4">
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>الوصول إلى معلوماتك الشخصية</li>
                <li>تصحيح أو تحديث معلوماتك</li>
                <li>حذف حسابك ومعلوماتك</li>
                <li>الاعتراض على معالجة معلوماتك</li>
                <li>طلب نسخة من بياناتك</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">6. ملفات تعريف الارتباط</h3>
              <p>
                نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على موقعنا، وتذكر تفضيلاتك، وتحليل استخدام الموقع. 
                يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">7. التغييرات على هذه السياسة</h3>
              <p>
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر البريد الإلكتروني أو 
                من خلال إشعار على موقعنا. استمرار استخدامك لخدماتنا بعد هذه التغييرات يعني موافقتك على السياسة المحدثة.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">8. اتصل بنا</h3>
              <p className="mb-4">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارساتنا في التعامل مع المعلومات، يرجى الاتصال بنا:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>البريد الإلكتروني:</strong> privacy@hajiz.com</p>
                <p><strong>الهاتف:</strong> +963-XXX-XXXX</p>
                <p><strong>العنوان:</strong> دمشق، سوريا</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
