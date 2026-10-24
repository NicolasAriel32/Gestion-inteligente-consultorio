import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  ExternalLink,
  Filter,
  LayoutDashboard,
  Link2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

type Section = "inicio" | "agenda" | "pacientes" | "reservas" | "configuracion";
type Appointment = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date: string;
  time: string;
  duration: number;
  kind: string;
  status: "Confirmado" | "Pendiente" | "Completado";
  source: "Consultorio" | "Online";
  color: string;
};

const today = new Date();
const dateKey = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
const prettyDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-AR", options).format(new Date(value + "T12:00:00"));
const dateLabel = (value: string) =>
  prettyDate(value, { weekday: "long", day: "numeric", month: "long" });
const todayKey = dateKey(today);

const initialAppointments: Appointment[] = [
  { id: "a1", name: "Sofía Martínez", email: "sofia.martinez@email.com", date: todayKey, time: "09:00", duration: 50, kind: "Sesión individual", status: "Confirmado", source: "Consultorio", color: "lilac" },
  { id: "a2", name: "Tomás Benítez", email: "tomas.b@email.com", date: todayKey, time: "10:00", duration: 50, kind: "Sesión individual", status: "Confirmado", source: "Online", color: "sage" },
  { id: "a3", name: "Valentina López", email: "vale.lopez@email.com", date: todayKey, time: "11:30", duration: 50, kind: "Primera entrevista", status: "Pendiente", source: "Online", color: "peach" },
  { id: "a4", name: "Mateo Fernández", email: "mateo.f@email.com", date: todayKey, time: "14:00", duration: 50, kind: "Sesión individual", status: "Confirmado", source: "Consultorio", color: "blue" },
  { id: "a5", name: "Lucía Romero", email: "lucia.r@email.com", date: todayKey, time: "15:30", duration: 50, kind: "Sesión individual", status: "Confirmado", source: "Online", color: "lilac" },
  { id: "a6", name: "Julián Castro", email: "julian.c@email.com", date: todayKey, time: "17:00", duration: 50, kind: "Sesión individual", status: "Confirmado", source: "Consultorio", color: "sage" },
];

const initialPatients = [
  { name: "Sofía Martínez", email: "sofia.martinez@email.com", phone: "+54 9 11 4567-2190", since: "12 ago 2026", next: "Hoy, 09:00", color: "lavender" },
  { name: "Tomás Benítez", email: "tomas.b@email.com", phone: "+54 9 11 5830-7741", since: "18 ago 2026", next: "Hoy, 10:00", color: "green" },
  { name: "Valentina López", email: "vale.lopez@email.com", phone: "+54 9 11 6042-1153", since: "Hoy", next: "Hoy, 11:30", color: "peach" },
  { name: "Mateo Fernández", email: "mateo.f@email.com", phone: "+54 9 11 4738-9082", since: "02 sep 2026", next: "Hoy, 14:00", color: "blue" },
  { name: "Lucía Romero", email: "lucia.r@email.com", phone: "+54 9 11 3620-5581", since: "10 sep 2026", next: "Hoy, 15:30", color: "lavender" },
];

const menu: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "pacientes", label: "Pacientes", icon: UsersRound },
  { id: "reservas", label: "Reservas online", icon: Link2 },
];

function App() {
  const [section, setSection] = useState<Section>("inicio");
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem("gi-consultorio-appointments");
      return saved ? JSON.parse(saved) as Appointment[] : initialAppointments;
    } catch {
      return initialAppointments;
    }
  });
  const [patients, setPatients] = useState(initialPatients);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [modal, setModal] = useState<"appointment" | "booking" | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem("gi-consultorio-appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const todaysAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, selectedDate],
  );
  const goTo = (id: Section) => {
    setSection(id);
    setModal(null);
  };
  const addAppointment = (appointment: Appointment) => {
    setAppointments((current) => [...current, appointment].sort((a, b) => a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
    if (!patients.some((patient) => patient.name.toLowerCase() === appointment.name.toLowerCase())) {
      setPatients((current) => [{ name: appointment.name, email: appointment.email || "Sin email", phone: appointment.phone || "Sin teléfono", since: "Hoy", next: `${prettyDate(appointment.date, { day: "numeric", month: "short" })}, ${appointment.time}`, color: "blue" }, ...current]);
    }
    setSelectedDate(appointment.date);
    setModal(null);
    setToast(appointment.source === "Online" ? "Solicitud recibida. Quedó pendiente de confirmación." : "El turno se agregó a la agenda.");
  };

  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setToast("Copiaste el enlace de la demo; las reservas aún no son públicas.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setToast("Podés compartir el enlace desde la barra del navegador.");
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => goTo("inicio")} aria-label="Ir al inicio">
          <span className="brand-mark"><Activity size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">gestión<span>inteligente</span></span>
        </button>
        <div className="workspace">
          <div className="workspace-avatar">MR</div>
          <div className="workspace-copy"><strong>Consultorio</strong><span>Psicología · Personal</span></div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-caption">MENÚ PRINCIPAL</div>
        <nav className="main-nav" aria-label="Menú principal">
          {menu.map(({ id, label, icon: Icon }) => (
            <button className={`nav-item ${section === id ? "active" : ""}`} key={id} onClick={() => goTo(id)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {id === "reservas" && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><div className="help-icon"><CircleHelp size={18} /></div><div><strong>¿Necesitás ayuda?</strong><span>Estamos para acompañarte</span></div><ArrowRight size={15} /></div>
          <button className={`nav-item ${section === "configuracion" ? "active" : ""}`} onClick={() => goTo("configuracion")}><Settings size={18} strokeWidth={1.8} /><span>Configuración</span></button>
          <div className="profile">
            <div className="profile-avatar">MR</div><div className="profile-copy"><strong>Martina Ríos</strong><span>Psicóloga</span></div><MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Consultorio</span><ChevronRight size={14} />{menu.find((item) => item.id === section)?.label || "Configuración"}</div>
          <div className="topbar-actions">
            <span className="demo-pill"><span /> Demo con datos ficticios</span>
            <button className="icon-button" aria-label="Notificaciones" onClick={() => setToast("No tenés notificaciones nuevas.")}><Bell size={18} /><i /></button>
            <div className="top-avatar">MR</div>
          </div>
        </header>

        {section === "inicio" && <Dashboard appointments={todaysAppointments} selectedDate={selectedDate} setDate={setSelectedDate} openAppointment={() => setModal("appointment")} goTo={goTo} />}
        {section === "agenda" && <Agenda appointments={todaysAppointments} selectedDate={selectedDate} setDate={setSelectedDate} openAppointment={() => setModal("appointment")} />}
        {section === "pacientes" && <Patients patients={patients} query={query} setQuery={setQuery} onAdd={() => setModal("appointment")} />}
        {section === "reservas" && <Bookings enabled={bookingEnabled} setEnabled={setBookingEnabled} onCopy={copyBookingLink} copied={copied} openBooking={() => setModal("booking")} appointments={appointments.filter((a) => a.source === "Online")} />}
        {section === "configuracion" && <SettingsPage bookingEnabled={bookingEnabled} setBookingEnabled={setBookingEnabled} />}

        <footer className="page-footer"><span>Gestión Inteligente <span className="footer-dot">·</span> Consultorio</span><span>Prototipo de demostración <ShieldCheck size={13} /></span></footer>
      </main>

      {modal && <AppointmentModal mode={modal} onClose={() => setModal(null)} onSave={addAppointment} />}
      {toast && <div className="toast"><span><Check size={15} /></span>{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function DateSwitch({ value, setDate }: { value: string; setDate: (date: string) => void }) {
  const move = (offset: number) => {
    const current = new Date(value + "T12:00:00");
    current.setDate(current.getDate() + offset);
    setDate(dateKey(current));
  };
  return <div className="date-switch"><button aria-label="Día anterior" onClick={() => move(-1)}><ChevronLeft size={17} /></button><span>{dateLabel(value)}</span><button aria-label="Día siguiente" onClick={() => move(1)}><ChevronRight size={17} /></button><button className="today-button" onClick={() => setDate(todayKey)}>Hoy</button></div>;
}

function Dashboard({ appointments, selectedDate, setDate, openAppointment, goTo }: { appointments: Appointment[]; selectedDate: string; setDate: (date: string) => void; openAppointment: () => void; goTo: (section: Section) => void }) {
  const pending = appointments.filter((item) => item.status === "Pendiente").length;
  return (
    <div className="content">
      <PageHeading eyebrow={prettyDate(selectedDate, { weekday: "long", day: "numeric", month: "long" }).toUpperCase()} title="Buen día, Martina" subtitle="Este es el resumen de tu consultorio para hoy." action={<button className="button-primary" onClick={openAppointment}><Plus size={17} /> Nuevo turno</button>} />
      <div className="stats-grid">
        <StatCard label="Turnos del día" value={String(appointments.length).padStart(2, "0")} note="en tu agenda" icon={<CalendarDays size={18} />} color="green" trend="4 confirmados" />
        <StatCard label="Solicitudes online" value={String(pending).padStart(2, "0")} note="requieren tu atención" icon={<Clock3 size={18} />} color="orange" trend="Ver solicitudes" onClick={() => goTo("reservas")} />
        <StatCard label="Pacientes activos" value="38" note="en tu consultorio" icon={<UsersRound size={18} />} color="purple" trend="+3 este mes" />
        <StatCard label="Disponibilidad" value="Abierta" note="reservas online" icon={<Activity size={18} />} color="blue" trend="Configurar" onClick={() => goTo("reservas")} />
      </div>
      <section className="panel agenda-panel">
        <div className="panel-heading">
          <div><div className="section-label">TU JORNADA</div><h2>Agenda del día</h2></div>
          <div className="panel-heading-right"><DateSwitch value={selectedDate} setDate={setDate} /><button className="text-link" onClick={() => goTo("agenda")}>Ver agenda completa <ArrowRight size={15} /></button></div>
        </div>
        <div className="agenda-content">
          <div className="agenda-timeline">
            {appointments.length === 0 ? <div className="empty-state"><CalendarDays size={25} /><strong>No hay turnos para este día</strong><span>Podés agregar un turno o consultar otro día.</span></div> : appointments.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} />)}
          </div>
          <aside className="day-summary">
            <div className="summary-date"><span>{prettyDate(selectedDate, { weekday: "long" })}</span><strong>{prettyDate(selectedDate, { day: "2-digit" })}</strong><span>{prettyDate(selectedDate, { month: "long", year: "numeric" })}</span></div>
            <div className="summary-rule" />
            <div className="summary-line"><span>Turnos agendados</span><strong>{appointments.length}</strong></div>
            <div className="summary-line"><span>Solicitudes pendientes</span><strong className="pending-text">{appointments.filter((a) => a.status === "Pendiente").length}</strong></div>
            <div className="summary-note"><Sparkles size={15} /><span>Tenés espacios disponibles por la tarde.</span></div>
            <button className="button-light full-button" onClick={() => goTo("agenda")}>Abrir agenda <ArrowRight size={15} /></button>
          </aside>
        </div>
      </section>
      <div className="lower-grid">
        <section className="panel quick-panel">
          <div className="panel-heading compact"><div><div className="section-label">ACCESOS RÁPIDOS</div><h2>¿Qué necesitás hacer?</h2></div></div>
          <div className="quick-actions">
            <button onClick={openAppointment}><span className="quick-icon green-icon"><Plus size={19} /></span><span><strong>Agendar un turno</strong><small>Sumá una cita a tu agenda</small></span><ArrowRight size={16} /></button>
            <button onClick={() => goTo("pacientes")}><span className="quick-icon purple-icon"><UsersRound size={18} /></span><span><strong>Buscar un paciente</strong><small>Consultá tus contactos</small></span><ArrowRight size={16} /></button>
            <button onClick={() => goTo("reservas")}><span className="quick-icon blue-icon"><Link2 size={18} /></span><span><strong>Compartir reservas online</strong><small>Dejá que pidan su turno</small></span><ArrowRight size={16} /></button>
          </div>
        </section>
        <section className="panel tip-panel">
          <div className="tip-top"><div className="tip-icon"><ShieldCheck size={18} /></div><span>PRIVACIDAD</span><MoreHorizontal size={17} /></div>
          <h3>Un espacio cuidado empieza con datos protegidos.</h3>
          <p>Este prototipo usa información ficticia. No cargues datos reales de pacientes en esta demo.</p>
          <button className="text-link" onClick={() => goTo("configuracion")}>Conocer el alcance <ArrowRight size={15} /></button>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, note, icon, color, trend, onClick }: { label: string; value: string; note: string; icon: ReactNode; color: string; trend: string; onClick?: () => void }) {
  return <button className={`stat-card ${onClick ? "clickable" : ""}`} onClick={onClick}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${color}`}>{icon}</span></div><div className="stat-value">{value}</div><div className="stat-bottom"><span>{note}</span><span className={`stat-trend ${color}`}>{color === "green" ? <ArrowUpRight size={13} /> : null}{trend}</span></div></button>;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return <div className="appointment-row">
    <div className="appointment-time"><strong>{appointment.time}</strong><span>{appointment.duration} min</span></div>
    <div className={`appointment-marker ${appointment.color}`}><span /></div>
    <div className="appointment-card">
      <div className="appointment-main"><div className="patient-avatar">{appointment.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="appointment-person"><strong>{appointment.name}</strong><span>{appointment.kind}</span></div></div>
      <div className="appointment-meta"><span className={`source-tag ${appointment.source === "Online" ? "online" : ""}`}>{appointment.source === "Online" ? <Link2 size={12} /> : <CalendarDays size={12} />}{appointment.source}</span><span className={`status-tag ${appointment.status === "Pendiente" ? "pending" : ""}`}>{appointment.status}</span></div>
      <button className="row-more" aria-label={`Más opciones para ${appointment.name}`}><MoreHorizontal size={18} /></button>
    </div>
  </div>;
}

function Agenda({ appointments, selectedDate, setDate, openAppointment }: { appointments: Appointment[]; selectedDate: string; setDate: (date: string) => void; openAppointment: () => void }) {
  return <div className="content">
    <PageHeading eyebrow="ORGANIZACIÓN" title="Agenda" subtitle="Revisá tus turnos y organizá la semana." action={<button className="button-primary" onClick={openAppointment}><Plus size={17} /> Nuevo turno</button>} />
    <section className="panel agenda-full">
      <div className="agenda-toolbar"><DateSwitch value={selectedDate} setDate={setDate} /><div className="toolbar-actions"><button className="button-light"><Filter size={15} /> Filtros <ChevronDown size={14} /></button><button className="button-light"><CalendarDays size={15} /> Día <ChevronDown size={14} /></button></div></div>
      <div className="agenda-full-heading"><span>HORARIO</span><span>{dateLabel(selectedDate)}</span></div>
      <div className="agenda-content">
        <div className="agenda-timeline">{appointments.length ? appointments.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} />) : <div className="empty-state"><CalendarDays size={25} /><strong>No hay turnos para este día</strong><span>Agregá un turno para empezar a organizar tu jornada.</span></div>}</div>
        <aside className="day-summary"><div className="summary-date"><span>{prettyDate(selectedDate, { weekday: "long" })}</span><strong>{prettyDate(selectedDate, { day: "2-digit" })}</strong><span>{prettyDate(selectedDate, { month: "long", year: "numeric" })}</span></div><div className="summary-rule" /><div className="summary-line"><span>Turnos agendados</span><strong>{appointments.length}</strong></div><div className="summary-line"><span>Confirmados</span><strong>{appointments.filter((a) => a.status === "Confirmado").length}</strong></div><div className="summary-line"><span>Pendientes</span><strong className="pending-text">{appointments.filter((a) => a.status === "Pendiente").length}</strong></div></aside>
      </div>
    </section>
  </div>;
}

function Patients({ patients, query, setQuery, onAdd }: { patients: typeof initialPatients; query: string; setQuery: (value: string) => void; onAdd: () => void }) {
  const filtered = patients.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase()) || patient.email.toLowerCase().includes(query.toLowerCase()));
  return <div className="content">
    <PageHeading eyebrow="DIRECTORIO" title="Pacientes" subtitle="Administrá los datos de contacto y consultá próximos turnos." action={<button className="button-primary" onClick={onAdd}><Plus size={17} /> Agendar turno</button>} />
    <section className="panel patient-panel">
      <div className="patient-toolbar"><div><h2>Todos los pacientes <span className="count-pill">{patients.length}</span></h2><p>Información administrativa básica</p></div><div className="patient-tools"><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar paciente" /></label><button className="button-light"><Filter size={15} /> Filtrar</button></div></div>
      <div className="table-wrap"><table><thead><tr><th>PACIENTE</th><th>CONTACTO</th><th>DESDE</th><th>PRÓXIMO TURNO</th><th></th></tr></thead><tbody>
        {filtered.map((patient) => <tr key={patient.email}><td><div className="table-person"><span className={`table-avatar ${patient.color}`}>{patient.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><strong>{patient.name}</strong></div></td><td><span>{patient.email}</span><small>{patient.phone}</small></td><td>{patient.since}</td><td><span className="next-appointment"><CalendarDays size={14} />{patient.next}</span></td><td><button className="row-more" aria-label={`Más opciones para ${patient.name}`}><MoreHorizontal size={18} /></button></td></tr>)}
      </tbody></table>{filtered.length === 0 && <div className="empty-state"><Search size={24} /><strong>No encontramos pacientes</strong><span>Probá con otro nombre o email.</span></div>}</div>
      <div className="table-footer"><span>Mostrando {filtered.length} de {patients.length} pacientes</span><div><button disabled><ChevronLeft size={15} /></button><button className="page-number">1</button><button disabled><ChevronRight size={15} /></button></div></div>
    </section>
    <div className="privacy-note"><ShieldCheck size={16} /><span>Esta demo solo muestra datos ficticios y datos administrativos; no incluye historia clínica.</span></div>
  </div>;
}

function Bookings({ enabled, setEnabled, onCopy, copied, openBooking, appointments }: { enabled: boolean; setEnabled: (value: boolean) => void; onCopy: () => void; copied: boolean; openBooking: () => void; appointments: Appointment[] }) {
  return <div className="content">
    <PageHeading eyebrow="ACCESO PARA PACIENTES" title="Reservas online" subtitle="Compartí un enlace para que las personas soliciten un turno." action={<button className="button-primary" onClick={openBooking}><ExternalLink size={16} /> Ver como paciente</button>} />
    <div className="booking-layout">
      <div className="booking-main">
        <section className="panel booking-status">
          <div className="booking-status-top"><div className="status-icon"><Link2 size={20} /></div><div className="booking-status-copy"><h2>Tu página de reservas</h2><p>{enabled ? "Las personas pueden consultar horarios y solicitar un turno." : "La página está pausada y no acepta nuevas solicitudes."}</p></div><button className={`switch ${enabled ? "on" : ""}`} onClick={() => setEnabled(!enabled)} role="switch" aria-checked={enabled} aria-label="Activar reservas online"><span /></button></div>
          <div className="booking-url"><div><span>ENLACE DE RESERVA</span><strong>Vista de demostración · no publicada</strong></div><button className="button-light" onClick={onCopy}><Copy size={15} />{copied ? "Copiado" : "Copiar enlace"}</button></div>
          <div className="booking-hint"><ShieldCheck size={15} /><span>Las solicitudes llegan como pendientes. Vos confirmás cada turno desde tu agenda.</span></div>
        </section>
        <section className="panel online-requests">
          <div className="panel-heading compact"><div><div className="section-label">ACTIVIDAD RECIENTE</div><h2>Solicitudes online</h2></div><button className="text-link">Ver todas <ArrowRight size={15} /></button></div>
          {appointments.filter((a) => a.status === "Pendiente").length ? appointments.filter((a) => a.status === "Pendiente").map((appointment) => <div className="request-row" key={appointment.id}><div className="table-avatar peach">{appointment.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="request-person"><strong>{appointment.name}</strong><span>{appointment.kind} · {prettyDate(appointment.date, { day: "numeric", month: "short" })}, {appointment.time}</span></div><span className="status-tag pending">Pendiente</span><button className="button-light small-button" onClick={() => setEnabled(false)}>Revisar</button></div>) : <div className="empty-inline"><Check size={17} />No hay solicitudes pendientes.</div>}
        </section>
      </div>
      <aside className="booking-preview-panel"><div className="section-label">VISTA PREVIA</div><div className="booking-preview"><div className="preview-cover"><div className="preview-mark"><Activity size={17} /></div><div className="preview-avatar">MR</div></div><div className="preview-body"><div className="preview-profession">PSICOLOGÍA</div><h3>Martina Ríos</h3><span className="preview-license">M.P. 00.000</span><div className="preview-divider" /><p>Un espacio de escucha y acompañamiento profesional.</p><div className="preview-info"><Clock3 size={14} /><span>Sesiones de 50 minutos</span></div><div className="preview-info"><CalendarDays size={14} /><span>Presencial y online</span></div><button className="preview-button" onClick={openBooking}>Solicitar un turno <ArrowRight size={14} /></button><small>Solicitud sujeta a confirmación</small></div></div><button className="preview-link" onClick={openBooking}>Abrir vista previa <ExternalLink size={13} /></button></aside>
    </div>
  </div>;
}

function SettingsPage({ bookingEnabled, setBookingEnabled }: { bookingEnabled: boolean; setBookingEnabled: (value: boolean) => void }) {
  return <div className="content"><PageHeading eyebrow="TU ESPACIO DE TRABAJO" title="Configuración" subtitle="Personalizá los datos básicos de tu consultorio." />
    <section className="panel settings-panel"><div className="panel-heading compact"><div><div className="section-label">PERFIL PROFESIONAL</div><h2>Datos del consultorio</h2></div><button className="button-light">Editar datos</button></div><div className="settings-profile"><div className="settings-avatar">MR</div><div><strong>Martina Ríos</strong><span>Psicóloga · M.P. 00.000</span></div></div><div className="settings-row"><div><strong>Nombre del consultorio</strong><span>Consultorio de Psicología</span></div><button className="text-link">Editar</button></div><div className="settings-row"><div><strong>Modalidad de atención</strong><span>Presencial y online</span></div><button className="text-link">Editar</button></div><div className="settings-row"><div><strong>Reservas online</strong><span>{bookingEnabled ? "Activas" : "Pausadas"}</span></div><button className={`switch ${bookingEnabled ? "on" : ""}`} onClick={() => setBookingEnabled(!bookingEnabled)} role="switch" aria-checked={bookingEnabled} aria-label="Activar reservas online"><span /></button></div></section>
    <section className="panel scope-panel"><div className="scope-icon"><ShieldCheck size={19} /></div><div><h2>Alcance de esta demo</h2><p>El prototipo usa datos ficticios y almacenamiento local en este navegador. No contiene historias clínicas, diagnósticos ni notas de sesión, y no está conectado a una base de datos.</p></div></section>
  </div>;
}

function AppointmentModal({ mode, onClose, onSave }: { mode: "appointment" | "booking"; onClose: () => void; onSave: (appointment: Appointment) => void }) {
  const isBooking = mode === "booking";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [date, setDate] = useState(todayKey);
  const [kind, setKind] = useState("Sesión individual");
  const slots = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !selectedTime) return;
    onSave({
      id: `appointment-${Date.now()}`, name: name.trim(), email: email.trim(), phone: phone.trim(), date, time: selectedTime, duration: 50, kind,
      status: isBooking ? "Pendiente" : "Confirmado", source: isBooking ? "Online" : "Consultorio", color: ["lilac", "sage", "peach", "blue"][Math.floor(Math.random() * 4)] as string,
    });
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><div className="eyebrow">{isBooking ? "RESERVA ONLINE" : "AGENDA DEL CONSULTORIO"}</div><h2 id="modal-title">{isBooking ? "Solicitar un turno" : "Agendar un turno"}</h2></div><button className="icon-button plain" onClick={onClose} aria-label="Cerrar"><X size={19} /></button></div><form onSubmit={submit}><label className="form-label">Nombre y apellido<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Camila Pérez" /></label><div className="form-columns"><label className="form-label">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@email.com" /></label><label className="form-label">Teléfono<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 9 11 ..." /></label></div><label className="form-label">Tipo de turno<select value={kind} onChange={(e) => setKind(e.target.value)}><option>Sesión individual</option><option>Primera entrevista</option><option>Orientación para familiares</option></select></label><label className="form-label">Fecha<input required type="date" min={todayKey} value={date} onChange={(e) => setDate(e.target.value)} /></label><div className="form-label">Horarios disponibles<div className="time-slots">{slots.map((slot) => <button type="button" className={selectedTime === slot ? "selected" : ""} key={slot} onClick={() => setSelectedTime(slot)}>{slot}</button>)}</div></div>{isBooking && <div className="form-note"><ShieldCheck size={15} />Tu solicitud quedará pendiente hasta que el consultorio la confirme.</div>}<div className="modal-actions"><button type="button" className="button-light" onClick={onClose}>Cancelar</button><button className="button-primary" disabled={!name.trim() || !selectedTime} type="submit">{isBooking ? "Enviar solicitud" : "Guardar turno"}<ArrowRight size={15} /></button></div></form></section></div>;
}

export default App;
