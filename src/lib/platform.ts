export type CompanyStatus = "idea" | "forming" | "active" | "growth";

export const STATUS_LABELS: Record<CompanyStatus, string> = {
  idea: "فكرة",
  forming: "تحت التأسيس",
  active: "شركة قائمة",
  growth: "في مرحلة النمو",
};

export const STATUS_OPTIONS: { value: CompanyStatus; label: string; hint: string }[] = [
  { value: "idea", label: "فكرة", hint: "لم يبدأ التنفيذ بعد" },
  { value: "forming", label: "تحت التأسيس", hint: "العمل جارٍ على التأسيس" },
  { value: "active", label: "شركة قائمة", hint: "الشركة تعمل فعلياً" },
  { value: "growth", label: "في مرحلة النمو", hint: "توسّع وزيادة في النشاط" },
];

export const ACTIVITIES = [
  "تقنية المعلومات",
  "التقنية المالية",
  "التجارة الإلكترونية",
  "تجارة الجملة",
  "استشارات أعمال",
  "التصميم والإبداع",
  "الخدمات اللوجستية",
  "التعليم والتدريب",
  "الصحة",
  "المقاولات",
  "أخرى",
];

export const COUNTRIES = [
  "المملكة العربية السعودية",
  "الإمارات العربية المتحدة",
  "قطر",
  "الكويت",
  "البحرين",
  "عُمان",
  "مصر",
  "الأردن",
  "المغرب",
];

export type ServiceItem = {
  key: string;
  name: string;
  description: string;
};

export const SERVICES: ServiceItem[] = [
  {
    key: "incorporation",
    name: "تأسيس الشركات",
    description: "إرشاد مبسّط لاستكمال بيانات التأسيس وهيكل الملكية.",
  },
  {
    key: "legal",
    name: "الخدمات القانونية",
    description: "اتفاقيات الشراكة وصياغة العقود والأنظمة الأساسية.",
  },
  {
    key: "accounting",
    name: "المحاسبة",
    description: "إعداد القوائم المالية والتقارير الشهرية للشركة.",
  },
  {
    key: "consulting",
    name: "الاستشارات",
    description: "توجيه استراتيجي لنموذج العمل وخطط التوسع.",
  },
  {
    key: "address",
    name: "العنوان الافتراضي",
    description: "عنوان رسمي للشركة مع إدارة البريد الوارد.",
  },
  {
    key: "tech",
    name: "الخدمات التقنية",
    description: "بنية تحتية وأدوات رقمية لتشغيل أعمال الشركة.",
  },
];

export const DEMO_DOCUMENTS = [
  { name: "عقد التأسيس (نموذج تجريبي)", type: "PDF", date: "2024-03-12" },
  { name: "اتفاقية الشركاء (نموذج تجريبي)", type: "PDF", date: "2024-03-14" },
  { name: "هيكل الملكية (نموذج تجريبي)", type: "XLSX", date: "2024-04-02" },
];

export type NextStep = { title: string; description: string };

export function companyNextStep(input: {
  description: string;
  foundersCount: number;
  hasInvestorProfile: boolean;
  serviceRequests: number;
  status: CompanyStatus;
}): NextStep {
  if (!input.description.trim()) {
    return { title: "استكمال بيانات الشركة", description: "أضف وصفاً مختصراً يوضح ما تقوم به الشركة." };
  }
  if (input.foundersCount < 2) {
    return { title: "إضافة شريك", description: "أضف شريكاً أو مؤسساً إضافياً لتوضيح هيكل الملكية." };
  }
  if (input.serviceRequests === 0) {
    return { title: "طلب خدمة", description: "اختر خدمة تحتاجها شركتك في مرحلتها الحالية." };
  }
  if (!input.hasInvestorProfile) {
    return { title: "إعداد الملف الاستثماري", description: "جهّز معلومات شركتك للمستثمرين في صفحة واحدة." };
  }
  return { title: "مراجعة ملف الشركة", description: "تأكد من تحديث البيانات والمستندات بشكل دوري." };
}

export const OWNERSHIP_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];
