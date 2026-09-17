import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/platform";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "الخدمات — منصة الشركات الافتراضية" },
      { name: "description", content: "خدمات التأسيس والقانون والمحاسبة والاستشارات والعنوان الافتراضي والتقنية." },
      { property: "og:title", content: "الخدمات — منصة الشركات الافتراضية" },
      { property: "og:description", content: "اطلب الخدمات التي تحتاجها شركتك في مرحلتها الحالية." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: companies } = useQuery({
    queryKey: ["my-companies-min", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id,name").eq("owner_id", user!.id);
      return data ?? [];
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["my-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("service_requests").select("service_key");
      return data ?? [];
    },
  });

  async function request(key: string, name: string) {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase.from("service_requests").insert({
      user_id: user.id,
      company_id: companies?.[0]?.id ?? null,
      service_key: key,
      service_name: name,
    });
    if (error) {
      toast.error("تعذّر إرسال الطلب");
      return;
    }
    toast.success(`تم إرسال طلب: ${name} (طلب تجريبي)`);
    qc.invalidateQueries({ queryKey: ["my-requests", user.id] });
  }

  const requested = new Set((requests ?? []).map((r) => r.service_key));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">الخدمات</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
        خدمات تحتاجها الشركات في مراحلها المختلفة. الطلب في هذا النموذج تجريبي لعرض التجربة فقط.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.key} className="flex flex-col rounded-xl border border-border bg-card p-5">
            <div className="font-semibold">{s.name}</div>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            <Button
              className="mt-5 self-start"
              variant={requested.has(s.key) ? "outline" : "default"}
              size="sm"
              onClick={() => request(s.key, s.name)}
            >
              {requested.has(s.key) ? "طلب مرة أخرى" : "طلب الخدمة"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
