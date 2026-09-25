import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-surface-border px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold tracking-tight">CRM Agencia</span>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/leads" className="transition hover:text-foreground">
              Leads
            </Link>
            <Link href="/kanban" className="transition hover:text-foreground">
              Kanban
            </Link>
            <Link href="/dashboard" className="transition hover:text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{user?.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-surface-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
