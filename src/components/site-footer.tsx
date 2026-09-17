export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            ش
          </span>
          <span className="text-sm font-semibold">منصة الشركات الافتراضية</span>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          نموذج أولي لإثبات الفكرة وتجربة المستخدم — ليس نظاماً قانونياً لتسجيل الشركات. جميع البيانات
          والخدمات المعروضة تجريبية.
        </p>
      </div>
    </footer>
  );
}
