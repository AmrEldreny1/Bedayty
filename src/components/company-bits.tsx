import { STATUS_LABELS, OWNERSHIP_COLORS, type CompanyStatus } from "@/lib/platform";

export function StatusBadge({ status }: { status: CompanyStatus }) {
  const tone =
    status === "active" || status === "growth"
      ? "bg-success/12 text-success"
      : status === "forming"
        ? "bg-accent/12 text-accent"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function OwnershipBar({ founders }: { founders: { name: string; ownership: number }[] }) {
  const total = founders.reduce((s, f) => s + Number(f.ownership), 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
        {founders.map((f, i) => (
          <div
            key={f.name + i}
            style={{
              width: `${Math.min(100, Number(f.ownership))}%`,
              backgroundColor: OWNERSHIP_COLORS[i % OWNERSHIP_COLORS.length],
            }}
            title={`${f.name} ${f.ownership}%`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {founders.map((f, i) => (
          <span key={f.name + i} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: OWNERSHIP_COLORS[i % OWNERSHIP_COLORS.length] }}
            />
            {f.name} — {Number(f.ownership)}%
          </span>
        ))}
        <span className="font-medium text-foreground">المجموع {total}%</span>
      </div>
    </div>
  );
}

export function NextStepCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-accent/25 bg-accent/5 p-5">
      <div>
        <div className="text-xs font-semibold tracking-wide text-accent">الخطوة التالية</div>
        <div className="mt-1 text-base font-semibold">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
