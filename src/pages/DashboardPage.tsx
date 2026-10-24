import { ProfessionalAvatar } from "../components/ProfessionalAvatar";
import { ArrowRight, CalendarClock, CalendarPlus, CheckCircle2, Clock3, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import type { Appointment, Patient } from "../types";
import { formatDate, getAppointmentsForDate } from "../services/demoService";
import { todayKey } from "../data/demoData";
import { Badge, Button, Card, PageTitle } from "../components/ui";

export function DashboardPage({ appointments, patients, onGoAgenda, onNewAppointment, onOpenPublic, onConfirm }: { appointments: Appointment[]; patients: Patient[]; onGoAgenda: () => void; onNewAppointment: () => void; onOpenPublic: () => void; onConfirm: (id: string) => void }) {
  const todays = getAppointmentsForDate(appointments, todayKey);
  const pending = appointments.filter((item) => item.status === "pendiente");
  const upcoming = [...appointments].filter((item) => item.status !== "cancelado").sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)).slice(0, 4);
  const patientName = (id: string) => patients.find((patient) => patient.id === id)?.name || "Paciente de demostración";
  return <div>
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-5"><ProfessionalAvatar className="h-20 w-20 sm:h-24 sm:w-24" /><div><p className="text-xs font-semibold uppercase tracking-wider text-deep">Tu espacio profesional</p><h2 className="mt-1 text-lg font-semibold">Dra. Martina Ríos</h2><p className="mt-1 text-sm text-muted">Psicóloga · Perfil ficticio de demostración</p></div></div><PageTitle eyebrow={formatDate(todayKey, { weekday: "long", day: "numeric", month: "long" })} title="Buen día, Martina" description="Tu jornada, tus próximas sesiones y las solicitudes nuevas." action={<Button onClick={onNewAppointment}><CalendarPlus size={17} /> Agendar turno</Button>} />
    <div className="mb-6 rounded-xl border border-sage/70 bg-[#eef4ef] px-4 py-3 text-sm text-[#405f50]"><strong>Demo visual:</strong> los cambios viven solo en esta sesión y se reinician al recargar. No se envían ni persisten en un servidor.</div>
    <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<CalendarClock size={19} />} label="Turnos de hoy" value={String(todays.length)} caption="en la agenda" tone="green" />
      <Metric icon={<Clock3 size={19} />} label="Solicitudes pendientes" value={String(pending.length)} caption="esperan confirmación" tone="sand" onClick={onGoAgenda} />
      <Metric icon={<UsersRound size={19} />} label="Pacientes de demo" value={String(patients.length)} caption="datos ficticios" tone="lavender" />
      <Metric icon={<CheckCircle2 size={19} />} label="Confirmados hoy" value={String(todays.filter((item) => item.status === "confirmado").length)} caption="de ejemplo" tone="blue" />
    </div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(290px,.8fr)]">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-deep">Agenda del día</p><h2 className="mt-1 font-display text-xl font-semibold">Próximas sesiones</h2></div>
          <Button variant="secondary" size="sm" onClick={onGoAgenda}>Ver agenda <ArrowRight size={15} /></Button>
        </div>
        {upcoming.length ? <div className="divide-y divide-line">{upcoming.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <div className="w-14 shrink-0 text-sm font-semibold text-deep">{item.startTime}<span className="mt-1 block text-xs font-normal text-muted">{item.durationMinutes} min</span></div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{patientName(item.patientId)}</p><p className="mt-1 text-xs text-muted">{item.service} · {item.modality}</p></div>
          <AppointmentBadge status={item.status} />
          {item.status === "pendiente" && <Button variant="subtle" size="sm" onClick={() => onConfirm(item.id)}>Confirmar</Button>}
        </div>)}</div> : <EmptyBlock title="Todavía no hay turnos" detail="Agendá una sesión o revisá la página pública de reservas." action={<Button variant="secondary" size="sm" onClick={onNewAppointment}>Crear turno</Button>} />}
      </Card>
      <div className="grid gap-5">
        <Card className="p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-deep">Solicitudes</p><h2 className="mt-1 font-display text-xl font-semibold">Pendientes</h2></div><Badge tone={pending.length ? "amber" : "green"}>{pending.length ? `${pending.length} nueva` : "Al día"}</Badge></div>
          {pending.length ? pending.slice(0, 3).map((item) => <div key={item.id} className="border-t border-line py-3"><div className="flex items-center justify-between gap-3"><div><strong className="text-sm">{patientName(item.patientId)}</strong><p className="mt-1 text-xs text-muted">{formatDate(item.date)} · {item.startTime}</p></div><Button variant="ghost" size="sm" onClick={() => onConfirm(item.id)} aria-label={`Confirmar turno de ${patientName(item.patientId)}`}><CheckCircle2 size={18} /></Button></div></div>) : <p className="border-t border-line pt-4 text-sm text-muted">Cuando llegue una solicitud, aparecerá acá para que la revises.</p>}
        </Card>
        <Card className="bg-[#f5f1e9] p-5 sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-deep"><CalendarPlus size={19} /></span><h2 className="mt-4 font-display text-lg font-semibold">Tu enlace de reservas</h2><p className="mt-2 text-sm leading-6 text-muted">Mostrale a un paciente cómo sería solicitar un horario desde la página pública.</p><Button variant="secondary" className="mt-4 w-full" onClick={onOpenPublic}>Abrir vista previa <ArrowRight size={15} /></Button></Card>
      </div>
    </div>
  </div>;
}

export function Metric({ icon, label, value, caption, tone, onClick }: { icon: ReactNode; label: string; value: string; caption: string; tone: "green" | "sand" | "lavender" | "blue"; onClick?: () => void }) {
  const t = { green: "bg-[#e7f0e9] text-deep", sand: "bg-[#f4e9df] text-[#795d47]", lavender: "bg-[#eeeaf4] text-[#6d6280]", blue: "bg-[#e9eff2] text-[#506c77]" };
  return <button onClick={onClick} className="rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep"><div className="flex items-center justify-between"><span className="text-sm text-muted">{label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${t[tone]}`}>{icon}</span></div><p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted">{caption}</p></button>;
}

export function AppointmentBadge({ status }: { status: Appointment["status"] }) {
  const tone = status === "confirmado" ? "green" : status === "pendiente" ? "amber" : status === "cancelado" ? "red" : "neutral";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge tone={tone}>{label}</Badge>;
}

export function EmptyBlock({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <div className="grid min-h-56 place-items-center px-6 py-10 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ee] text-deep"><CalendarClock size={22} /></span><h3 className="mt-4 font-display font-semibold">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm text-muted">{detail}</p>{action && <div className="mt-4">{action}</div>}</div></div>;
}
