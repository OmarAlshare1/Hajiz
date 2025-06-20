'use client';

import React from 'react'; // React is implicitly used, good to keep it for clarity

export default function PolicyPage() {
  // Placeholder: You should update this manually when the policy content changes
  const lastUpdatedDate = '19 يونيو 2025';

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-inter">
      {/* Main content card for the policy document */}
      <div className="max-w-3xl mx-auto py-8 px-6 sm:px-8 lg:px-10 bg-white rounded-xl shadow-2xl border-t-4 border-blue-600">
        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight">
          سياسة الخصوصية وشروط الاستخدام
        </h1>
        {/* Last Updated Date */}
        <p className="text-center text-sm sm:text-base text-gray-500 mb-8">
          آخر تحديث: {lastUpdatedDate}
        </p>

        {/* Introduction Section */}
        <section className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">مقدمة</h2>
          <p className="text-gray-700 leading-loose text-base sm:text-lg text-right">
            نحن في منصة حجز نهتم بخصوصيتك وأمان بياناتك. تهدف هذه السياسة إلى توضيح كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا وخدماتنا. يرجى قراءة هذه السياسة بعناية.
          </p>
        </section>

        {/* Information We Collect Section */}
        <section className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">المعلومات التي نجمعها</h2>
          <ul className="list-none text-gray-700 space-y-3 leading-loose text-base sm:text-lg pr-6"> {/* Removed list-inside to control padding with pr-6 */}
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">معلومات التسجيل: تتضمن الاسم، رقم الهاتف، والبريد الإلكتروني الذي تقدمه عند إنشاء حساب.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">بيانات الحجز والمعاملات: التفاصيل المتعلقة بالخدمات التي تحجزها، بما في ذلك مقدم الخدمة، التوقيت، وأي ملاحظات خاصة.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">معلومات الجهاز والموقع الجغرافي: قد نجمع معلومات حول الجهاز الذي تستخدمه للوصول إلى منصتنا (مثل نوع الجهاز، نظام التشغيل) وموقعك الجغرافي التقريبي عند الضرورة لتقديم الخدمات.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">بيانات الاستخدام: معلومات حول كيفية تفاعلك مع موقعنا، مثل الصفحات التي تزورها، والوقت المستغرق.</span>
            </li>
          </ul>
        </section>

        {/* How Information is Used Section */}
        <section className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">كيفية استخدام المعلومات</h2>
          <ul className="list-none text-gray-700 space-y-3 leading-loose text-base sm:text-lg pr-6">
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">تقديم الخدمات: لإدارة حجوزاتك، وتسهيل التواصل بينك وبين مقدمي الخدمات، وتقديم الدعم الفني.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">تحسين التجربة: لتحسين وظائف المنصة وتجربة المستخدم، وتخصيص المحتوى والعروض.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">الامتثال القانوني: للامتثال للمتطلبات القانونية والتنظيمية، وحماية حقوقنا وحقوق مستخدمينا.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">التواصل: لإرسال تحديثات حول خدماتك، وإشعارات المواعيد، ورسائل ترويجية (مع خيار إلغاء الاشتراك).</span>
            </li>
          </ul>
        </section>

        {/* Data Protection Section */}
        <section className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">حماية البيانات</h2>
          <p className="text-gray-700 leading-loose text-base sm:text-lg text-right">
            نلتزم بحماية بياناتك الشخصية. نستخدم أحدث تقنيات التشفير (مثل SSL/TLS)، وإجراءات الأمان المادية والإلكترونية، والتخزين الآمن لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف. تتم مراجعة وتحديث إجراءات الأمان لدينا بانتظام.
          </p>
        </section>

        {/* User Rights Section */}
        <section className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">حقوق المستخدم</h2>
          <ul className="list-none text-gray-700 space-y-3 leading-loose text-base sm:text-lg pr-6">
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">الحق في الوصول والتعديل: يمكنك الوصول إلى بياناتك الشخصية وتحديثها من خلال إعدادات حسابك.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">الحق في الحذف: يمكنك طلب حذف حسابك وبياناتك الشخصية، مع مراعاة المتطلبات القانونية والاحتفاظ بالبيانات الضرورية.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">الحق في الاعتراض: لديك الحق في الاعتراض على معالجة بياناتك الشخصية لأسباب معينة.</span>
            </li>
            <li className="relative">
              <span className="absolute right-0 top-0 text-blue-600 text-lg sm:text-xl transform -translate-x-full">•</span>
              <span className="inline-block pr-6">الحق في تلقي الإشعارات: سيتم إشعارك بأي خروقات أمنية قد تؤثر على بياناتك.</span>
            </li>
          </ul>
        </section>

        {/* Policy Amendments Section */}
        <section className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">التعديلات على السياسة</h2>
          <p className="text-gray-700 leading-loose text-base sm:text-lg text-right">
            قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في ممارساتنا أو لأسباب قانونية أو تنظيمية. سيتم إشعارك بأي تغييرات هامة عبر إعلان بارز على موقعنا أو عبر البريد الإلكتروني (إذا كان ذلك مناسباً) قبل أن تصبح التغييرات سارية المفعول.
          </p>
        </section>

        {/* Contact Us Section */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-right">التواصل معنا</h2>
          <p className="text-gray-700 leading-loose text-base sm:text-lg text-right">
            لأي استفسارات أو طلبات تتعلق بخصوصيتك أو بهذه السياسة، يرجى التواصل معنا عبر البريد الإلكتروني:
            <a href="mailto:Admin@hajiz.co.uk" className="text-blue-600 underline hover:text-blue-800 rtl:mr-1 ltr:ml-1 transition duration-150 ease-in-out">
              Admin@hajiz.co.uk
            </a>
          </p>
        </section>

        {/* Logos Section */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-10 pt-4 border-t border-gray-200">
          <img src="/Syriatel_logo.png" alt="Syriatel Logo" className="h-10 sm:h-12 w-auto object-contain transition transform hover:scale-105" />
          <img src="/MTN_Logo.svg.png" alt="MTN Logo" className="h-10 sm:h-12 w-auto object-contain transition transform hover:scale-105" />
          {/* Add more relevant logos as needed with responsive sizing and hover effects */}
        </div>
      </div>
    </div>
  );
}
