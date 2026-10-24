import { Activity, CalendarDays, ChevronDown, LayoutDashboard, Link2, Settings2, UsersRound, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Section } from "../types";
import { Button } from "./ui";

const navigation: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "pacientes", label: "Pacientes", icon: UsersRound },
  { id: "configuracion", label: "Configuración", icon: Settings2 },
];

export function WorkspaceShell({ section, onNavigate, onOpenPublic, children }: { section: Section; onNavigate: (section: Section) => void; onOpenPublic: () => void; children: ReactNode }) {
  return <div className="min-h-screen bg-ivory text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
      <button onClick={() => onNavigate("dashboard")} className="mb-8 flex items-center gap-3 px-2 text-left">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-deep text-white"><Activity size={21} /></span>
        <span className="font-display text-sm font-bold leading-tight">gestión inteligente<span className="mt-1 block font-sans text-xs font-medium text-muted">PSICOLOGÍA</span></span>
      </button>
      <button className="mb-7 flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-ivory/70 px-3 text-left">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage/35 text-sm font-semibold text-deep">MR</span>
        <span className="min-w-0 flex-1"><strong className="block text-sm">Consultorio</strong><small className="mt-1 block text-xs text-muted">Espacio de trabajo demo</small></span><ChevronDown size={16} className="text-muted" />
      </button>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.14em] text-[#81908a]">Menú principal</p>
      <nav aria-label="Menú principal" className="grid gap-1">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onNavigate(id)} aria-current={section === id ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep ${section === id ? "bg-[#e9f0ec] font-semibold text-deep" : "text-[#65736d] hover:bg-ivory"}`}>
          <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
        </button>)}
      </nav>
      <div className="mt-auto rounded-2xl bg-[#f3f4ee] p-4">
        <p className="text-sm font-semibold">Un espacio cuidado</p>
        <p className="mt-1 text-xs leading-5 text-muted">Demo con información ficticia. No cargues datos reales.</p>
        <Button variant="ghost" size="sm" className="mt-2 px-0 text-deep" onClick={onOpenPublic}><Link2 size={15} /> Ver página pública</Button>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-line px-2 pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-sand/70 text-xs font-semibold text-ink">MR</span>
        <span><strong className="block text-sm">Dra. Martina Ríos</strong><small className="text-xs text-muted">Psicóloga</small></span>
      </div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="flex items-center gap-2 text-sm"><span className="text-muted">Consultorio</span><span className="text-[#b2bcb5]">/</span><span className="font-medium">{navigation.find((item) => item.id === section)?.label}</span></div>
        <div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-full bg-[#eef3ee] px-3 py-2 text-xs font-medium text-[#496955] sm:inline-flex"><span className="h-2 w-2 rounded-full bg-[#5f9472]" />Modo demostración</span><Button variant="secondary" size="sm" onClick={onOpenPublic}><Link2 size={15} /><span className="hidden sm:inline">Página pública</span><span className="sm:hidden">Reservar</span></Button></div>
      </header>
      <main id="main-content" className="mx-auto max-w-[1440px] px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-10 lg:pb-10">{children}</main>
    </div>
    <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onNavigate(id)} aria-current={section === id ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep ${section === id ? "font-semibold text-deep" : "text-muted"}`}><Icon size={18} /><span>{label}</span></button>)}
    </nav>
  </div>;
}
