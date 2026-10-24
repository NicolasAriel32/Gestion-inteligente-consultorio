import { useEffect, useState } from "react";
import { CheckCircle2, Plus, TriangleAlert } from "lucide-react";
import type { FormEvent } from "react";
import { demoAppointments, demoPatients, demoProfessional, todayKey } from "./data/demoData";
import { saveDemoAppointment, setDemoStatus, updateDemoSettings, validateAppointment, type DemoState } from "./services/demoService";
import type { Appointment, Patient, Section } from "./types";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { Button, Field, LoadingState, Modal } from "./components/ui";
import { DashboardPage } from "./pages/DashboardPage";
import { AgendaPage } from "./pages/AgendaPage";
import { PatientsPage } from "./pages/PatientsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PublicBookingPage } from "./pages/PublicBookingPage";

const initialDemo: DemoState = { patients: demoPatients, appointments: demoAppointments, professional: demoProfessional };

export default function App() {
  const [data, setData] = useState<DemoState>(initialDemo);
  const [booting, setBooting] = useState(true);
  const [section, setSection] = useState<Section>("dashboard");
  const [publicPage, setPublicPage] = useState(() => window.location.pathname.startsWith("/reservar"));
  const [appointmentDialog, setAppointmentDialog] = useState<{ open: boolean; appointment?: Appointment; date?: string }>({ open: false });
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 280);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const syncRoute = () => setPublicPage(window.location.pathname.startsWith("/reservar"));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openPublic = () => {
    const url = `/reservar/${data.professional.bookingSlug}`;
    window.history.pushState({}, "", url);
    setPublicPage(true);
    window.scrollTo({ top: 0 });
  };
  const backToPanel = () => {
    window.history.pushState({}, "", "/");
    setPublicPage(false);
    window.scrollTo({ top: 0 });
  };
  const saveAppointment = (appointment: Appointment) => {
    const conflict = validateAppointment(data.appointments, appointment, appointment.id);
    if (conflict) return conflict;
    setData((current) => saveDemoAppointment(current, appointment));
    setAppointmentDialog({ open: false });
    setToast({ kind: "success", message: "Cambio aplicado solo a esta demo." });
    return "";
  };
  const cancelAppointment = (id: string) => {
    setData((current) => setDemoStatus(current, id, "cancelado"));
    setToast({ kind: "success", message: "Turno cancelado en la demo. No se envió ninguna notificación." });
  };
  const confirmAppointment = (id: string) => {
    setData((current) => setDemoStatus(current, id, "confirmado"));
    setToast({ kind: "success", message: "Turno marcado como confirmado en la demo." });
  };
  const savePatient = (patient: Patient) => {
    setData((current) => ({ ...current, patients: current.patients.some((item) => item.id === patient.id) ? current.patients.map((item) => item.id === patient.id ? patient : item) : [...current.patients, patient] }));
    setToast({ kind: "success", message: "Datos administrativos actualizados solo en la demo." });
  };
  const requestPublicAppointment = ({ name, email, phone, date, time, modality, service }: { name: string; email: string; phone: string; date: string; time: string; modality: "Presencial" | "Virtual"; service: string }) => {
    const existing = data.patients.find((item) => item.email.toLowerCase() === email.toLowerCase());
    const patient: Patient = existing || { id: `public-${Date.now()}`, name, email, phone: phone || "No informado", createdAt: date };
    const appointment: Appointment = { id: `booking-${Date.now()}`, patientId: patient.id, date, startTime: time, durationMinutes: data.professional.sessionDuration, service, modality, status: "pendiente", source: "Reserva pública" };
    const conflict = validateAppointment(data.appointments, appointment);
    if (conflict) {
      setToast({ kind: "error", message: "Ese horario acaba de ocuparse en esta demo. Elegí otro." });
      return;
    }
    setData((current) => ({ ...saveDemoAppointment(current, appointment), patients: existing ? current.patients : [...current.patients, patient] }));
  };

  if (publicPage) return <PublicBookingPage settings={data.professional} busySlots={data.appointments.map(({ date, startTime, durationMinutes, status }) => ({ date, startTime, durationMinutes, status }))} onBack={backToPanel} onRequest={requestPublicAppointment} />;

  return <WorkspaceShell section={section} onNavigate={setSection} onOpenPublic={openPublic}>
    {booting ? <LoadingState /> : <>
    {section === "dashboard" && <DashboardPage appointments={data.appointments} patients={data.patients} onGoAgenda={() => setSection("agenda")} onNewAppointment={() => setAppointmentDialog({ open: true })} onOpenPublic={openPublic} onConfirm={confirmAppointment} />}
    {section === "agenda" && <AgendaPage appointments={data.appointments} patients={data.patients} onNew={(date) => setAppointmentDialog({ open: true, date })} onEdit={(appointment) => setAppointmentDialog({ open: true, appointment })} onCancel={cancelAppointment} />}
    {section === "pacientes" && <PatientsPage patients={data.patients} appointments={data.appointments} onSave={savePatient} />}
    {section === "configuracion" && <SettingsPage settings={data.professional} onSave={(professional) => { setData((current) => updateDemoSettings(current, professional)); setToast({ kind: "success", message: "Configuración actualizada en esta demo." }); }} onPublic={openPublic} />}
    <AppointmentDialog open={appointmentDialog.open} appointment={appointmentDialog.appointment} date={appointmentDialog.date} data={data} onClose={() => setAppointmentDialog({ open: false })} onSave={saveAppointment} />
    {toast && <div role={toast.kind === "error" ? "alert" : "status"} className={`fixed bottom-20 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-soft lg:bottom-6 ${toast.kind === "error" ? "bg-[#8a4039]" : ""}`}><CheckCircle2 size={17} />{toast.message}</div>}
    </>}
  </WorkspaceShell>;
}

function AppointmentDialog({ open, appointment, date, data, onClose, onSave }: { open: boolean; appointment?: Appointment; date?: string; data: DemoState; onClose: () => void; onSave: (appointment: Appointment) => string }) {
  const [patientId, setPatientId] = useState(appointment?.patientId || data.patients[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(appointment?.date || date || todayKey);
  const [time, setTime] = useState(appointment?.startTime || "");
  const [service, setService] = useState(appointment?.service || "Sesión individual");
  const [modality, setModality] = useState<"Presencial" | "Virtual">(appointment?.modality || data.professional.modalities[0] || "Virtual");
  const [status, setStatus] = useState<Appointment["status"]>(appointment?.status || "confirmado");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setPatientId(appointment?.patientId || data.patients[0]?.id || "");
    setSelectedDate(appointment?.date || date || todayKey);
    setTime(appointment?.startTime || "");
    setService(appointment?.service || "Sesión individual");
    setModality(appointment?.modality || data.professional.modalities[0] || "Virtual");
    setStatus(appointment?.status || "confirmado");
    setError("");
  }, [open, appointment, date, data.patients, data.professional.modalities]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const item: Appointment = { id: appointment?.id || `appointment-${Date.now()}`, patientId, date: selectedDate, startTime: time, durationMinutes: data.professional.sessionDuration, service, modality, status, source: appointment?.source || "Panel" };
    const message = onSave(item);
    setError(message);
  };
  return <Modal open={open} onOpenChange={(next) => !next && onClose()} title={appointment ? "Editar turno" : "Nuevo turno"} description="La cita es ficticia y el cambio solo existe en esta sesión de demostración.">
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium">Paciente<select required value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option value="" disabled>Elegí un paciente</option>{data.patients.map((patient)=><option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha" type="date" required value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} /><Field label="Horario" type="time" required value={time} onChange={(e)=>setTime(e.target.value)} /></div>
      <label className="grid gap-2 text-sm font-medium">Servicio<select value={service} onChange={(e)=>setService(e.target.value)} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option>Sesión individual</option><option>Primera entrevista</option></select></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Modalidad<select value={modality} onChange={(e)=>setModality(e.target.value as "Presencial"|"Virtual")} className="h-11 rounded-xl border border-line bg-white px-3 text-sm">{data.professional.modalities.map((item)=><option key={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Estado<select value={status} onChange={(e)=>setStatus(e.target.value as Appointment["status"])} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="completado">Completado</option></select></label></div>
      <p className="text-xs text-muted">Duración: {data.professional.sessionDuration} minutos.</p>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><TriangleAlert size={17} className="mt-0.5 shrink-0" />{error}</p>}
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit"><Plus size={16} />{appointment ? "Aplicar edición" : "Agregar a la demo"}</Button></div>
    </form>
  </Modal>;
}
