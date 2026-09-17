import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { NextStepCard, OwnershipBar, StatusBadge } from "@/components/company-bits";
import { companyNextStep, type CompanyStatus } from "@/lib/platform";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "شركاتي — منصة الشركات الافتراضية" },
      { name: "description", content: "لوحة التحكم: شركاتك والخطوة التالية المقترحة لكل منها." },
      { property: "og:title", content: "شركاتي — منصة الشركات الافتراضية" },
      { property: "og:description", content: "أدر شركاتك وتابع الخطوة التالية من لوحة تحكم واحدة." },
    ],
  }),
  component: Dashboard,
});

type Row = {
  id: string;
  name: string;
  activity: string;
  country: string;
  description: string;
  status: CompanyStatus;
  founders: { name: string; ownership: number }[];
  investor_profiles: { company_id: string }[];
};

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-companies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: companies, error }, { data: requests }] = await Promise.all([
        supabase
          .from("companies")
          .select("id,name,activity,country,description,status,founders(name,ownership),investor_profiles(company_id)")
          .eq("owner_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase.from("service_requests").select("company_id"),
      ]);
      if (error) throw error;
      return { companies: (companies ?? []) as unknown as Row[], requests: requests ?? [] };
    },
  });

  const companies = data?.companies ?? [];
  const requests = data?.requests ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">شركاتي</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            الشركات التي أنشأتها أو تشارك فيها.
          </p>
        </div>
        <Button asChild>
          <Link to="/companies/new">
            <Plus className="size-4" />
            إنشاء شركة جديدة
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : companies.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-medium">لم تنشئ أي شركة بعد</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            ابدأ بإنشاء شركتك الأولى وسيتم بناء ملفها الرقمي تلقائياً.
          </p>
          <Button asChild className="mt-6">
            <Link to="/companies/new">إنشاء شركة جديدة</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {companies.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {c.activity} · {c.country}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-5">
                  <OwnershipBar founders={c.founders ?? []} />
                </div>
                <Link
                  to="/companies/$id"
                  params={{ id: c.id }}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  فتح ملف الشركة
                  <ArrowLeft className="size-4" />
                </Link>
              </div>
            ))}
          </div>

          {(() => {
            const c = companies[0];
            if (!c) return null;
            const step = companyNextStep({
              description: c.description,
              foundersCount: c.founders?.length ?? 0,
              hasInvestorProfile: (c.investor_profiles?.length ?? 0) > 0,
              serviceRequests: requests.filter((r) => r.company_id === c.id).length,
              status: c.status,
            });
            return (
              <div className="mt-6">
                <NextStepCard
                  title={`${step.title} — ${c.name}`}
                  description={step.description}
                  action={
                    <Button asChild variant="default">
                      <Link to="/companies/$id" params={{ id: c.id }}>
                        متابعة
                      </Link>
                    </Button>
                  }
                />
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
