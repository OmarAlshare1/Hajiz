'use client';

// Removed unused 'Image' import from 'next/image'

export default function PolicyPage() {
  const lastUpdatedDate = '19 يونيو 2025'; // Placeholder: You should update this manually when the policy content changes

  return (
    <div className="container mx-auto p-8 pt-24 bg-gray-50 min-h-screen"> {/* Added pt-24 and min-h-screen */}
      <div className="max-w-3xl mx-auto py-12 px-6 sm:px-8 lg:px-10 bg-white rounded-lg shadow-xl border-t-4 border-primary-600"> {/* Enhanced styling */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center leading-tight"> {/* Larger, bolder title */}
          سياسة الخصوصية وشروط الاستخدام
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          آخر تحديث: {lastUpdatedDate}
        </p>

        <section className="mb-8"> {/* Increased mb for better separation */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">مقدمة</h2>
          <p className="text-gray-800 leading-relaxed">
            نحن في منصة حجز نهتم بخصوصيتك وأمان بياناتك. تهدف هذه السياسة إلى توضيح كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا وخدماتنا. يرجى قراءة هذه السياسة بعناية.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">المعلومات التي نجمعها</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-2 leading-relaxed">
            <li>معلومات التسجيل: تتضمن الاسم، رقم الهاتف، والبريد الإلكتروني الذي تقدمه عند إنشاء حساب.</li>
            <li>بيانات الحجز والمعاملات: التفاصيل المتعلقة بالخدمات التي تحجزها، بما في ذلك مقدم الخدمة، التوقيت، وأي ملاحظات خاصة.</li>
            <li>معلومات الجهاز والموقع الجغرافي: قد نجمع معلومات حول الجهاز الذي تستخدمه للوصول إلى منصتنا (مثل نوع الجهاز، نظام التشغيل) وموقعك الجغرافي التقريبي عند الضرورة لتقديم الخدمات.</li>
            <li>بيانات الاستخدام: معلومات حول كيفية تفاعلك مع موقعنا، مثل الصفحات التي تزورها، والوقت المستغرق.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">كيفية استخدام المعلومات</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-2 leading-relaxed">
            <li>تقديم الخدمات: لإدارة حجوزاتك، وتسهيل التواصل بينك وبين مقدمي الخدمات، وتقديم الدعم الفني.</li>
            <li>تحسين التجربة: لتحسين وظائف المنصة وتجربة المستخدم، وتخصيص المحتوى والعروض.</li>
            <li>الامتثال القانوني: للامتثال للمتطلبات القانونية والتنظيمية، وحماية حقوقنا وحقوق مستخدمينا.</li>
            <li>التواصل: لإرسال تحديثات حول خدماتك، وإشعارات المواعيد، ورسائل ترويجية (مع خيار إلغاء الاشتراك).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">حماية البيانات</h2>
          <p className="text-gray-800 leading-relaxed">
            نلتزم بحماية بياناتك الشخصية. نستخدم أحدث تقنيات التشفير (مثل SSL/TLS)، وإجراءات الأمان المادية والإلكترونية، والتخزين الآمن لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف. تتم مراجعة وتحديث إجراءات الأمان لدينا بانتظام.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">حقوق المستخدم</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-2 leading-relaxed">
            <li>الحق في الوصول والتعديل: يمكنك الوصول إلى بياناتك الشخصية وتحديثها من خلال إعدادات حسابك.</li>
            <li>الحق في الحذف: يمكنك طلب حذف حسابك وبياناتك الشخصية، مع مراعاة المتطلبات القانونية والاحتفاظ بالبيانات الضرورية.</li>
            <li>الحق في الاعتراض: لديك الحق في الاعتراض على معالجة بياناتك الشخصية لأسباب معينة.</li>
            <li>الحق في تلقي الإشعارات: سيتم إشعارك بأي خروقات أمنية قد تؤثر على بياناتك.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">التعديلات على السياسة</h2>
          <p className="text-gray-800 leading-relaxed">
            قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في ممارساتنا أو لأسباب قانونية أو تنظيمية. سيتم إشعارك بأي تغييرات هامة عبر إعلان بارز على موقعنا أو عبر البريد الإلكتروني (إذا كان ذلك مناسباً) قبل أن تصبح التغييرات سارية المفعول.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3 border-b pb-2">التواصل معنا</h2>
          <p className="text-gray-800 leading-relaxed">
            لأي استفسارات أو طلبات تتعلق بخصوصيتك أو بهذه السياسة، يرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:Admin@hajiz.co.uk" className="text-primary-600 underline hover:text-primary-800">Admin@hajiz.co.uk</a>
          </p>
        </section>

        <div className="flex justify-center gap-6 mt-10 p-4 border-t border-gray-200">
          <img src="/Syriatel_logo.png" alt="Syriatel" className="h-10 w-auto object-contain" />
          <img src="/MTN_Logo.svg.png" alt="MTN" className="h-10 w-auto object-contain" />
          {/* Add more relevant logos as needed */}
        </div>
      </div>
    </div>
  );
}