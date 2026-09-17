import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/company-bits";
import { ACTIVITIES, COUNTRIES, type CompanyStatus } from "@/lib/platform";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "اكتشف الشركات — منصة الشركات الافتراضية" },
      { name: "description", content: "تصفّح الشركات على المنصة وابحث حسب الاسم والنشاط والدولة." },
      { property: "og:title", content: "اكتشف الشركات — منصة الشركات الافتراضية" },
      { property: "og:description", content: "تصفّح الشركات وابحث حسب النشاط والدولة." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState("all");
  const [country, setCountry] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["all-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id,name,activity,country,description,status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const list = (data ?? []).filter(
    (c) =>
      c.name.includes(q.trim()) &&
      (activity === "all" || c.activity === activity) &&
      (country === "all" || c.country === country),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">اكتشف الشركات</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        الشركات الموجودة على المنصة — بيانات تجريبية إلى جانب الشركات التي ينشئها المستخدمون.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم الشركة"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pe-9"
          />
        </div>
        <Select value={activity} onValueChange={setActivity}>
          <SelectTrigger>
            <SelectValue placeholder="النشاط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنشطة</SelectItem>
            {ACTIVITIES.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger>
            <SelectValue placeholder="الدولة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الدول</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : list.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Link
              key={c.id}
              to="/companies/$id"
              params={{ id: c.id }}
              className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{c.name}</div>
                <StatusBadge status={c.status as CompanyStatus} />
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">
                {c.activity} · {c.country}
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
