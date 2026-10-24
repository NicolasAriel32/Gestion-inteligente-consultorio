import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, Clock3, Pencil, XCircle } from "lucide-react";
import type { Appointment, Patient } from "../types";
import { formatDate, getAppointmentsForDate } from "../services/demoService";
import { todayKey } from "../data/demoData";
import { AppointmentBadge, EmptyBlock } from "./DashboardPage";
import { Button, Card, PageTitle } from "../components/ui";

const plusDays = (key: string, amount: number) => { const date = new Date(key + "T12:00:00"); date.setDate(date.getDate() + amount); return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-"); };

export function AgendaPage({ appointments, patients, onEdit, onNew, onCancel }: { appointments: Appointment[]; patients: Patient[]; onEdit: (appointment: Appointment) => void; onNew: (date?: string) => void; onCancel: (id: string) => void }) {
  const [date, setDate] = useState(todayKey);
  const [mode, setMode] = useState<"Día" | "Semana">("Semana");
  const [filter, setFilter] = useState("todos");
  const days = useMemo(() => mode === "Día" ? [date] : Array.from({ length: 7 }, (_, index) => plusDays(date, index - new Date(date + "T12:00:00").getDay() + 1)), [date, mode]);
  const shown = appointments.filter((appointment) => appointment.status !== "cancelado" && (filter === "todos" || appointment.status === filter));
  const name = (patientId: string) => patients.find((patient) => patient.id === patientId)?.name || "Paciente de demo";
  const move = (days: number) => setDate(plusDays(date, days));
  return <div>
    <PageTitle eyebrow="ORGANIZÁ TU SEMANA" title="Agenda" description="Revisá horarios, estados y próximos turnos." action={<Button onClick={() => onNew(date)}><CalendarPlus size={17} /> Nuevo turno</Button>} />
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:p-5">
        <div className="flex items-center gap-2"><Button variant="secondary" size="icon" aria-label="Período anterior" onClick={() => move(mode === "Día" ? -1 : -7)}><ChevronLeft size={17} /></Button><Button variant="secondary" size="icon" aria-label="Período siguiente" onClick={() => move(mode === "Día" ? 1 : 7)}><ChevronRight size={17} /></Button><Button variant="ghost" size="sm" onClick={() => setDate(todayKey)}>Hoy</Button><span className="ml-1 text-sm font-semibold capitalize">{formatDate(date, { month: "long", year: "numeric" })}</span></div>
        <div className="flex flex-wrap items-center gap-2"><label className="flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 text-xs text-muted">Estado<select value={filter} onChange={(event) => setFilter(event.target.value)} className="bg-transparent font-medium text-ink focus:outline-none"><option value="todos">Todos</option><option value="pendiente">Pendientes</option><option value="confirmado">Confirmados</option><option value="completado">Completados</option></select><ChevronDown size={13} /></label><div className="inline-flex rounded-xl bg-ivory p-1"><button onClick={() => setMode("Día")} className={`rounded-lg px-3 py-2 text-xs ${mode === "Día" ? "bg-white font-semibold shadow-sm" : "text-muted"}`}>Día</button><button onClick={() => setMode("Semana")} className={`rounded-lg px-3 py-2 text-xs ${mode === "Semana" ? "bg-white font-semibold shadow-sm" : "text-muted"}`}>Semana</button></div></div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-7 md:divide-x md:divide-y-0">
        {days.map((day) => { const items = getAppointmentsForDate(shown, day); return <section key={day} className={`min-h-52 p-3 ${day === todayKey ? "bg-[#f6f9f6]" : "bg-white"}`}>
          <button onClick={() => setDate(day)} className="mb-3 flex w-full items-center justify-between text-left"><span><span className="block text-xs font-medium capitalize text-muted">{formatDate(day,{weekday:"short"})}</span><strong className={`mt-1 block font-display text-lg ${day === todayKey ? "text-deep" : "text-ink"}`}>{formatDate(day,{day:"2-digit"})}</strong></span>{day === todayKey && <span className="rounded-full bg-sage/35 px-2 py-1 text-[10px] font-medium text-deep">Hoy</span>}</button>
          {items.length ? <div className="grid gap-2">{items.map((item) => <article key={item.id} className="rounded-xl border border-line bg-white p-2.5 shadow-sm"><div className="flex items-center justify-between gap-1"><span className="text-xs font-bold text-deep">{item.startTime}</span><div className="flex"><button aria-label="Editar turno" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-ivory" onClick={() => onEdit(item)}><Pencil size={14} /></button><button aria-label="Cancelar turno" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={() => onCancel(item.id)}><XCircle size={14} /></button></div></div><p className="truncate text-xs font-semibold">{name(item.patientId)}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted"><Clock3 size={12} />{item.durationMinutes} min · {item.modality}</p><AppointmentBadge status={item.status} /></article>)}</div> : <button onClick={() => onNew(day)} className="grid min-h-24 w-full place-items-center rounded-xl border border-dashed border-line p-3 text-center text-xs text-muted hover:border-sage hover:bg-ivory"><span><CalendarPlus size={17} className="mx-auto mb-2 text-sage" />Agregar turno</span></button>}
        </section>; })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs text-muted"><span>{shown.length} turnos visibles en este período</span><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#7ba28c]" />Confirmado <span className="ml-2 h-2 w-2 rounded-full bg-[#d29b60]" />Pendiente</span></div>
    </Card>
  </div>;
}
