import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, FileText, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwnershipBar, StatusBadge } from "@/components/company-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "منصة الشركات الافتراضية — أنشئ شركتك وأدرها من مكان واحد" },
      {
        name: "description",
        content:
          "منصة رقمية تساعدك على إنشاء شركتك، تنظيم ملكيتها، إدارة معلوماتها، والوصول إلى الخدمات والفرص التي تحتاجها لتنمية أعمالك.",
      },
      { property: "og:title", content: "منصة الشركات الافتراضية" },
      {
        property: "og:description",
        content: "أنشئ شركتك، نظّم ملكيتها، وأدر ملفها الرقمي المركزي من مكان واحد.",
      },
    ],
  }),
  component: Index,
});

const PILLARS = [
  { icon: Building2, title: "ملف شركة مركزي", text: "كل بيانات شركتك في مكان واحد منذ لحظة إنشائها." },
  { icon: Users, title: "ملكية واضحة", text: "سجّل المؤسسين ونسب ملكيتهم بشكل بصري ومنظّم." },
  { icon: FileText, title: "مستندات وإدارة", text: "قسم للمستندات والأشخاص المسؤولين عن الشركة." },
  { icon: Layers, title: "خدمات واستثمار", text: "اطلب الخدمات وجهّز ملفك الاستثماري خطوة بخطوة." },
];

function Index() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              نموذج أولي · منصة الشركات الافتراضية
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.2] tracking-tight sm:text-5xl">
              أنشئ شركتك وأدرها من مكان واحد
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              منصة رقمية تساعدك على إنشاء شركتك، تنظيم ملكيتها، إدارة معلوماتها، والوصول إلى الخدمات
              والفرص التي تحتاجها لتنمية أعمالك.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/companies/new">
                  أنشئ شركتك
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">إدارة شركتي</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/discover">اكتشف الشركات</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">ملف الشركة</div>
                <div className="mt-1 text-xl font-semibold">شركة أفق الرقمية</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  تقنية المعلومات · المملكة العربية السعودية
                </div>
              </div>
              <StatusBadge status="active" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "المؤسسون", v: "3" },
                { k: "الملكية", v: "100%" },
                { k: "الخدمات", v: "2" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">{s.k}</div>
                  <div className="mt-1 text-lg font-semibold">{s.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <OwnershipBar
                founders={[
                  { name: "نورة", ownership: 45 },
                  { name: "خالد", ownership: 30 },
                  { name: "ريم", ownership: 25 },
                ]}
              />
            </div>

            <div className="mt-6 rounded-lg border border-accent/25 bg-accent/5 px-4 py-3">
              <div className="text-xs font-semibold text-accent">الخطوة التالية</div>
              <div className="text-sm font-medium">إعداد الملف الاستثماري</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">ملف رقمي يبدأ مع شركتك</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          لا تكتفِ بإنشاء الشركة — ابنِ ملفها الرقمي الذي ينمو معها.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-5">
              <p.icon className="size-5 text-accent" />
              <div className="mt-4 font-semibold">{p.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
