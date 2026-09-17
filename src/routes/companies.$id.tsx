import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextStepCard, OwnershipBar, StatusBadge } from "@/components/company-bits";
import { DEMO_DOCUMENTS, SERVICES, companyNextStep, type CompanyStatus } from "@/lib/platform";

export const Route = createFileRoute("/companies/$id")({
  head: () => ({
    meta: [
      { title: "ملف الشركة — منصة الشركات الافتراضية" },
      { name: "description", content: "الملف الرقمي المركزي للشركة: البيانات، الملكية، الإدارة، المستندات، الخدمات والاستثمار." },
      { property: "og:title", content: "ملف الشركة — منصة الشركات الافتراضية" },
      { property: "og:description", content: "بيانات الشركة وملكيتها وخدماتها وملفها الاستثماري في صفحة واحدة." },
    ],
  }),
  component: CompanyProfile,
});

function CompanyProfile() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id,owner_id,name,activity,country,description,status,created_at,founders(id,name,ownership,role),investor_profiles(*)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["company-requests", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("id,service_key,service_name,status,created_at")
        .eq("company_id", id);
      return data ?? [];
    },
  });

  if (isLoading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">جارٍ التحميل…</p>;
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="font-medium">لم يتم العثور على الشركة.</p>
        <Button asChild className="mt-4">
          <Link to="/discover">تصفّح الشركات</Link>
        </Button>
      </div>
    );
  }

  const founders = (data.founders ?? []) as { id: string; name: string; ownership: number; role: string }[];
  const investor = Array.isArray(data.investor_profiles)
    ? data.investor_profiles[0]
    : data.investor_profiles;
  const isOwner = !!user && data.owner_id === user.id;
  const step = companyNextStep({
    description: data.description ?? "",
    foundersCount: founders.length,
    hasInvestorProfile: !!investor,
    serviceRequests: requests?.length ?? 0,
    status: data.status as CompanyStatus,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              {data.name.trim().charAt(0)}
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{data.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.activity} · {data.country}
              </p>
            </div>
          </div>
          <StatusBadge status={data.status as CompanyStatus} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "النشاط", v: data.activity },
            { k: "الدولة", v: data.country },
            { k: "حالة الشركة", v: data.status },
            { k: "تاريخ إنشاء الملف", v: new Date(data.created_at).toLocaleDateString("ar") },
          ].map((x, i) => (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">{x.k}</div>
              <div className="mt-1 text-sm font-medium">
                {x.k === "حالة الشركة" ? <StatusBadge status={data.status as CompanyStatus} /> : x.v}
              </div>
            </div>
          ))}
        </div>

        {data.description && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{data.description}</p>
        )}
      </div>

      <div className="mt-5">
        <NextStepCard title={step.title} description={step.description} />
      </div>

      <Tabs defaultValue="ownership" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="ownership">الملكية</TabsTrigger>
          <TabsTrigger value="management">الإدارة</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="investor">الملف الاستثماري</TabsTrigger>
        </TabsList>

        <TabsContent value="ownership" className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">توزيع الملكية</h2>
          <div className="mt-4">
            <OwnershipBar founders={founders} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((f) => (
              <div key={f.id} className="rounded-lg border border-border p-4">
                <div className="text-sm font-semibold">{f.name}</div>
                <div className="mt-1 text-2xl font-bold">{Number(f.ownership)}%</div>
                {f.role && <div className="mt-1 text-xs text-muted-foreground">{f.role}</div>}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="management" className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">الأشخاص المسؤولون</h2>
          <ul className="mt-4 divide-y divide-border">
            {founders.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{f.name}</span>
                <span className="text-sm text-muted-foreground">{f.role || "مؤسس"}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="documents" className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">المستندات</h2>
          <p className="mt-1 text-sm text-muted-foreground">مستندات تجريبية لعرض فكرة الملف الرقمي.</p>
          <ul className="mt-4 divide-y divide-border">
            {DEMO_DOCUMENTS.map((d) => (
              <li key={d.name} className="flex items-center gap-3 py-3">
                <FileText className="size-4 text-accent" />
                <span className="flex-1 text-sm font-medium">{d.name}</span>
                <span className="text-xs text-muted-foreground">
                  {d.type} · {d.date}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="services" className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">الخدمات</h2>
          {requests && requests.length > 0 ? (
            <ul className="mt-4 divide-y divide-border">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{r.service_name}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                    قيد المعالجة (تجريبي)
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">لا توجد خدمات مطلوبة بعد.</p>
          )}
          <p className="mt-5 text-sm text-muted-foreground">
            خدمات متاحة: {SERVICES.map((s) => s.name).join("، ")}.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/services">طلب خدمة</Link>
          </Button>
        </TabsContent>

        <TabsContent value="investor" className="rounded-xl border border-border bg-card p-6">
          <InvestorSection
            companyId={id}
            isOwner={isOwner}
            initial={investor ?? null}
            onSaved={() => qc.invalidateQueries({ queryKey: ["company", id] })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Investor = {
  about: string;
  problem: string;
  product: string;
  founders_note: string;
  funding_amount: string;
  use_of_funds: string;
};

const FIELDS: { key: keyof Investor; label: string; long?: boolean }[] = [
  { key: "about", label: "نبذة عن الشركة", long: true },
  { key: "problem", label: "المشكلة التي تحلها", long: true },
  { key: "product", label: "المنتج أو الخدمة", long: true },
  { key: "founders_note", label: "المؤسسون" },
  { key: "funding_amount", label: "حجم التمويل المطلوب" },
  { key: "use_of_funds", label: "استخدام التمويل", long: true },
];

function InvestorSection({
  companyId,
  isOwner,
  initial,
  onSaved,
}: {
  companyId: string;
  isOwner: boolean;
  initial: Partial<Investor> | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Investor>({
    about: "",
    problem: "",
    product: "",
    founders_note: "",
    funding_amount: "",
    use_of_funds: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initial) setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  if (!isOwner) {
    return (
      <>
        <h2 className="font-semibold">الملف الاستثماري</h2>
        {initial ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 text-sm leading-relaxed">{form[f.key] || "—"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">لم يتم إعداد الملف الاستثماري بعد.</p>
        )}
      </>
    );
  }

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("investor_profiles")
      .upsert({ company_id: companyId, ...form });
    setBusy(false);
    if (error) {
      toast.error("تعذّر حفظ الملف الاستثماري");
      return;
    }
    toast.success("تم إنشاء الملف الاستثماري");
    onSaved();
  }

  return (
    <>
      <h2 className="font-semibold">الملف الاستثماري</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        جهّز معلومات شركتك للمستثمرين. العرض هنا لأغراض النموذج الأولي فقط.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className={`space-y-1.5 ${f.long ? "sm:col-span-2" : ""}`}>
            <Label htmlFor={f.key}>{f.label}</Label>
            {f.long ? (
              <Textarea
                id={f.key}
                rows={3}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : (
              <Input
                id={f.key}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
      <Button className="mt-5" onClick={save} disabled={busy}>
        {busy ? "جارٍ الحفظ…" : "إنشاء الملف الاستثماري"}
      </Button>
    </>
  );
}
