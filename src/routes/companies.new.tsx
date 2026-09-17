import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITIES, COUNTRIES, STATUS_OPTIONS, type CompanyStatus } from "@/lib/platform";

export const Route = createFileRoute("/companies/new")({
  head: () => ({
    meta: [
      { title: "إنشاء شركة — منصة الشركات الافتراضية" },
      { name: "description", content: "ثلاث خطوات لإنشاء ملف شركتك الرقمي: البيانات، المؤسسون، الحالة." },
      { property: "og:title", content: "إنشاء شركة — منصة الشركات الافتراضية" },
      { property: "og:description", content: "أنشئ شركتك في ثلاث خطوات بسيطة." },
    ],
  }),
  component: NewCompany,
});

const STEPS = ["بيانات الشركة", "المؤسسون", "حالة الشركة"];

function NewCompany() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [activity, setActivity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CompanyStatus>("idea");
  const [founders, setFounders] = useState([{ name: "", ownership: "100" }]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const total = founders.reduce((s, f) => s + (Number(f.ownership) || 0), 0);
  const ownershipValid = Math.abs(total - 100) < 0.01 && founders.every((f) => f.name.trim());
  const step1Valid = name.trim() && activity && country;

  async function submit() {
    if (!user) return;
    setBusy(true);
    try {
      const { data: company, error } = await supabase
        .from("companies")
        .insert({ owner_id: user.id, name, activity, country, description, status })
        .select("id")
        .single();
      if (error) throw error;
      const { error: fErr } = await supabase.from("founders").insert(
        founders.map((f) => ({
          company_id: company.id,
          name: f.name.trim(),
          ownership: Number(f.ownership),
        })),
      );
      if (fErr) throw fErr;
      toast.success("تم إنشاء الشركة");
      navigate({ to: "/companies/$id", params: { id: company.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إنشاء الشركة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">إنشاء شركة</h1>

      <ol className="mt-6 flex flex-wrap gap-3">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm ${
              i === step
                ? "border-primary bg-primary text-primary-foreground"
                : i < step
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border text-muted-foreground"
            }`}
          >
            <span className="text-xs font-bold">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cname">اسم الشركة</Label>
              <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>النشاط</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITIES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الدولة المستهدفة</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="desc">وصف مختصر للشركة</Label>
              <Textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {founders.map((f, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3">
                <div className="min-w-48 flex-1 space-y-1.5">
                  <Label>اسم المؤسس</Label>
                  <Input
                    value={f.name}
                    onChange={(e) =>
                      setFounders(founders.map((x, j) => (i === j ? { ...x, name: e.target.value } : x)))
                    }
                  />
                </div>
                <div className="w-32 space-y-1.5">
                  <Label>نسبة الملكية %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={f.ownership}
                    onChange={(e) =>
                      setFounders(
                        founders.map((x, j) => (i === j ? { ...x, ownership: e.target.value } : x)),
                      )
                    }
                  />
                </div>
                {founders.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFounders(founders.filter((_, j) => j !== i))}
                    aria-label="حذف المؤسس"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFounders([...founders, { name: "", ownership: "0" }])}
            >
              <Plus className="size-4" />
              إضافة مؤسس
            </Button>

            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                Math.abs(total - 100) < 0.01
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              مجموع نسب الملكية: {total}% {Math.abs(total - 100) < 0.01 ? "✓" : "— يجب أن يساوي 100%"}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={`rounded-lg border p-4 text-start transition-colors ${
                  status === s.value ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60"
                }`}
              >
                <div className="font-semibold">{s.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.hint}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            السابق
          </Button>
          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 ? !step1Valid : !ownershipValid}
            >
              التالي
            </Button>
          ) : (
            <Button onClick={submit} disabled={busy || !ownershipValid || !step1Valid}>
              {busy ? "جارٍ الإنشاء…" : "إنشاء الشركة"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
