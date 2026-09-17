import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/company-bits";
import type { CompanyStatus } from "@/lib/platform";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "حسابي — منصة الشركات الافتراضية" },
      { name: "description", content: "بياناتك، شركاتك، خدماتك المطلوبة وإشعاراتك." },
      { property: "og:title", content: "حسابي — منصة الشركات الافتراضية" },
      { property: "og:description", content: "إدارة بيانات حسابك وشركاتك وخدماتك." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data } = useQuery({
    queryKey: ["account", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profile }, { data: companies }, { data: requests }] = await Promise.all([
        supabase.from("profiles").select("full_name,email,phone").eq("id", user!.id).maybeSingle(),
        supabase.from("companies").select("id,name,activity,country,status").eq("owner_id", user!.id),
        supabase
          .from("service_requests")
          .select("id,service_name,created_at")
          .order("created_at", { ascending: false }),
      ]);
      return { profile, companies: companies ?? [], requests: requests ?? [] };
    },
  });

  const notifications = [
    ...(data?.requests ?? []).slice(0, 3).map((r) => ({
      id: r.id,
      text: `تم استلام طلب خدمة: ${r.service_name} (تجريبي)`,
    })),
    { id: "welcome", text: "مرحباً بك في النموذج الأولي لمنصة الشركات الافتراضية." },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">حسابي</h1>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">بيانات المستخدم</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">الاسم</dt>
            <dd className="mt-1 text-sm font-medium">{data?.profile?.full_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">البريد الإلكتروني</dt>
            <dd className="mt-1 text-sm font-medium" dir="ltr">
              {data?.profile?.email || user?.email || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">رقم الهاتف</dt>
            <dd className="mt-1 text-sm font-medium" dir="ltr">
              {data?.profile?.phone || "—"}
            </dd>
          </div>
        </dl>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          تسجيل الخروج
        </Button>
      </section>

      <section className="mt-5 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">الشركات التي أشارك فيها</h2>
        {data?.companies.length ? (
          <ul className="mt-4 divide-y divide-border">
            {data.companies.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link
                    to="/companies/$id"
                    params={{ id: c.id }}
                    className="text-sm font-semibold hover:underline"
                  >
                    {c.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {c.activity} · {c.country}
                  </div>
                </div>
                <StatusBadge status={c.status as CompanyStatus} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">لا توجد شركات بعد.</p>
        )}
      </section>

      <section className="mt-5 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">الخدمات التي طلبتها</h2>
        {data?.requests.length ? (
          <ul className="mt-4 divide-y divide-border">
            {data.requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">{r.service_name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("ar")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">لم تطلب أي خدمة بعد.</p>
        )}
      </section>

      <section className="mt-5 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">الإشعارات</h2>
        <ul className="mt-4 space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3 text-sm">
              <Bell className="mt-0.5 size-4 text-accent" />
              <span className="text-muted-foreground">{n.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
