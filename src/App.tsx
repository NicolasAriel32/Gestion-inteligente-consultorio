import { useReminderDemo } from "./hooks/useReminderDemo";
import { ReminderCenter } from "./reminders/ReminderCenter";
import type { Channel } from "./reminders/types";
import { applySeries, planSeries, type SeriesPlan } from "./services/recurrence";
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
  const reminders = useReminderDemo(data);
  const [reminderAppointmentId,setReminderAppointmentId] = useState<string | null>(null);
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
  const saveSeries = (plan: SeriesPlan) => {
    try {
      const appointments = applySeries(data.appointments, plan);
      setData(current => ({ ...current, appointments, series: [...(current.series || []), plan.series] }));
      setAppointmentDialog({ open: false });
      setToast({ kind: "success", message: `${plan.appointments.length} sesiones agregadas solo a la demo.` });
      return "";
    } catch (error) { return error instanceof Error ? error.message : "No se pudo agregar la serie."; }
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
    setData(current => {
      const previous = current.patients.find(item=>item.id===patient.id);
      const contactChanged = previous && (previous.email!==patient.email || previous.phone!==patient.phone);
      const preferences = previous?.reminderPreferences || {email:false,whatsapp:false,version:1};
      const saved = {...previous,...patient,reminderPreferences:{...preferences,version:preferences.version + (contactChanged?1:0)}};
      return {...current,patients:previous?current.patients.map(item=>item.id===patient.id?saved:item):[...current.patients,saved]};
    });
    setToast({ kind: "success", message: "Datos administrativos actualizados solo en la demo." });
  };
  const updateReminderPreference = (id:string,channel:Channel,allowed:boolean) => {
    setData(current=>({...current,patients:current.patients.map(patient=>{
      if(patient.id!==id)return patient;
      const before=patient.reminderPreferences || {email:false,whatsapp:false,version:1};
      return {...patient,reminderPreferences:{...before,[channel]:allowed,version:before.version+1}};
    })}));
  };
  const reminderPanel = (id?:string) => <ReminderCenter controller={reminders} appointments={data.appointments} patients={data.patients} onPreference={updateReminderPreference} appointmentId={id} onCancel={cancelAppointment} onEdit={appointment=>{setReminderAppointmentId(null);setAppointmentDialog({open:true,appointment});}} />;
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
    {section === "agenda" && <AgendaPage appointments={data.appointments} patients={data.patients} onNew={(date) => setAppointmentDialog({ open: true, date })} onEdit={(appointment) => setAppointmentDialog({ open: true, appointment })} onCancel={cancelAppointment} onReminders={id=>setReminderAppointmentId(id)} />}
    {section === "pacientes" && <PatientsPage patients={data.patients} appointments={data.appointments} onSave={savePatient} />}
    {section === "configuracion" && <><SettingsPage settings={data.professional} onSave={(professional) => { setData((current) => updateDemoSettings(current, professional)); setToast({ kind: "success", message: "Configuración actualizada en esta demo." }); }} onPublic={openPublic} />{reminderPanel()}</>}
    <Modal open={reminderAppointmentId!==null} onOpenChange={open=>!open&&setReminderAppointmentId(null)} title="Recordatorios de esta cita" description="Simulación local de programación y resultados.">{reminderAppointmentId&&reminderPanel(reminderAppointmentId)}</Modal>
    <AppointmentDialog open={appointmentDialog.open} appointment={appointmentDialog.appointment} date={appointmentDialog.date} data={data} onClose={() => setAppointmentDialog({ open: false })} onSave={saveAppointment} onSaveSeries={saveSeries} />
    {toast && <div role={toast.kind === "error" ? "alert" : "status"} className={`fixed bottom-20 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-soft lg:bottom-6 ${toast.kind === "error" ? "bg-[#8a4039]" : ""}`}><CheckCircle2 size={17} />{toast.message}</div>}
    </>}
  </WorkspaceShell>;
}

function AppointmentDialog({ open, appointment, date, data, onClose, onSave, onSaveSeries }: { open: boolean; appointment?: Appointment; date?: string; data: DemoState; onClose: () => void; onSave: (appointment: Appointment) => string; onSaveSeries: (plan: SeriesPlan) => string }) {
  const [patientId, setPatientId] = useState(appointment?.patientId || data.patients[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(appointment?.date || date || todayKey);
  const [time, setTime] = useState(appointment?.startTime || "");
  const [service, setService] = useState(appointment?.service || "Sesión individual");
  const [modality, setModality] = useState<"Presencial" | "Virtual">(appointment?.modality || data.professional.modalities[0] || "Virtual");
  const [status, setStatus] = useState<Appointment["status"]>(appointment?.status || "confirmado");
  const [repeat, setRepeat] = useState(false);
  const [intervalWeeks, setIntervalWeeks] = useState(1);
  const [count, setCount] = useState(8);
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
    setRepeat(false); setIntervalWeeks(1); setCount(8);
  }, [open, appointment, date, data.patients, data.professional.modalities]);
  const base: Appointment = { ...appointment, id: appointment?.id || "draft", patientId, date: selectedDate, startTime: time, durationMinutes: appointment?.durationMinutes || data.professional.sessionDuration, service, modality, status, source: appointment?.source || "Panel" };
  let preview: SeriesPlan | undefined;
  let previewError = "";
  if (repeat && !appointment && time && selectedDate) {
    try { preview = planSeries(base, intervalWeeks, count, data.appointments); }
    catch (error) { previewError = error instanceof Error ? error.message : "Revisá la serie."; }
  }
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const item: Appointment = { ...base, id: appointment?.id || `appointment-${Date.now()}` };
    if (repeat && !appointment) {
      try { setError(onSaveSeries(planSeries(item, intervalWeeks, count, data.appointments))); }
      catch (error) { setError(error instanceof Error ? error.message : "Revisá las fechas de la serie."); }
    } else setError(onSave(item));
  };
  return <Modal open={open} onOpenChange={(next) => !next && onClose()} title={appointment ? "Editar turno" : "Nuevo turno"} description="La cita es ficticia y el cambio solo existe en esta sesión de demostración.">
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium">Paciente<select required value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option value="" disabled>Elegí un paciente</option>{data.patients.map((patient)=><option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha" type="date" required value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} /><label className="grid gap-2 text-sm font-medium">Horario<select required value={time} onChange={event=>setTime(event.target.value)} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option value="">Elegí un horario</option>{Array.from(new Set([...data.professional.workingHours, ...(appointment ? [appointment.startTime] : [])])).sort().map(slot=><option key={slot} value={slot}>{slot}</option>)}</select></label></div>
      <label className="grid gap-2 text-sm font-medium">Servicio<select value={service} onChange={(e)=>setService(e.target.value)} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option>Sesión individual</option><option>Primera entrevista</option></select></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Modalidad<select value={modality} onChange={(e)=>setModality(e.target.value as "Presencial"|"Virtual")} className="h-11 rounded-xl border border-line bg-white px-3 text-sm">{data.professional.modalities.map((item)=><option key={item}>{item}</option>)}</select></label><label className="grid gap-2 text-sm font-medium">Estado<select value={status} onChange={(e)=>setStatus(e.target.value as Appointment["status"])} className="h-11 rounded-xl border border-line bg-white px-3 text-sm"><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="completado">Completado</option></select></label></div>
      {appointment?.seriesId && <p className="rounded-xl bg-ivory p-3 text-sm text-deep">Esta cita pertenece a un horario habitual. La edición afecta solo a esta sesión.</p>}
      {!appointment && <section className="rounded-xl border border-line p-4"><label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={repeat} onChange={event=>setRepeat(event.target.checked)} className="h-5 w-5 accent-deep" />Repetir como horario habitual</label>{repeat && <div className="mt-3 grid gap-4"><div className="grid grid-cols-2 gap-3"><label className="grid gap-2 text-sm">Frecuencia<select aria-label="Frecuencia" className="h-11 rounded-xl border border-line px-3" value={intervalWeeks} onChange={event=>setIntervalWeeks(Number(event.target.value))}><option value={1}>Semanal</option><option value={2}>Quincenal</option></select></label><Field label="Cantidad de sesiones" type="number" min={2} max={24} required value={count} onChange={event=>setCount(Number(event.target.value))} /></div><p className="text-xs text-muted">Incluye la primera cita. Hora local de Buenos Aires. Todas las fechas se revisan antes de agregar.</p>{previewError && <p role="alert" className="text-sm text-red-800">{previewError}</p>}{preview && <div><h3 className="mb-2 text-sm font-semibold">Vista previa: {preview.appointments.length} sesiones</h3><ol className="max-h-44 overflow-y-auto rounded-xl border border-line">{preview.appointments.map(item=><li key={item.id} className="flex justify-between gap-2 border-b border-line px-3 py-2 text-sm last:border-0"><span>{item.date.split('-').reverse().join('/')} · {item.startTime}</span><span className={preview!.conflicts.includes(item.date)?"font-semibold text-red-800":"text-deep"}>{preview!.conflicts.includes(item.date)?"Ocupado":"Disponible"}</span></li>)}</ol>{preview.conflicts.length>0 && <p role="alert" className="mt-2 text-sm text-red-800">Hay {preview.conflicts.length} fecha(s) ocupada(s). Cambiá el inicio o el horario; no se agregará una serie parcial.</p>}</div>}</div>}</section>}
      <p className="text-xs text-muted">Duración: {data.professional.sessionDuration} minutos.</p>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><TriangleAlert size={17} className="mt-0.5 shrink-0" />{error}</p>}
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={repeat && Boolean(previewError || !preview || preview.conflicts.length)}><Plus size={16} />{appointment ? "Aplicar edición" : repeat ? "Agregar serie a la demo" : "Agregar a la demo"}</Button></div>
    </form>
  </Modal>;
}
