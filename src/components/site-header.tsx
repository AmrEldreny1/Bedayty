import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/dashboard", label: "شركاتي" },
  { to: "/companies/new", label: "إنشاء شركة" },
  { to: "/services", label: "الخدمات" },
  { to: "/discover", label: "اكتشف الشركات" },
  { to: "/account", label: "حسابي" },
] as const;

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            ش
          </span>
          <span className="text-[15px] font-semibold tracking-tight">منصة الشركات الافتراضية</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="me-auto flex items-center gap-2 lg:me-0">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
            >
              تسجيل الخروج
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">إنشاء حساب</Link>
            </Button>
          )}
          <button
            type="button"
            aria-label="القائمة"
            className="grid size-9 place-items-center rounded-md border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              className="mt-1 block w-full rounded-md px-3 py-2.5 text-start text-sm font-medium text-muted-foreground hover:bg-secondary"
              onClick={async () => {
                setOpen(false);
                await signOut();
                navigate({ to: "/" });
              }}
            >
              تسجيل الخروج
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              إنشاء حساب
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
