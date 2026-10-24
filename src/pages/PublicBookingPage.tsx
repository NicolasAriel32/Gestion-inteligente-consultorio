import { ProfessionalAvatar } from "../components/ProfessionalAvatar";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Clock3, MapPin, MonitorPlay, ShieldCheck } from "lucide-react";
import type { AvailabilityEntry, ProfessionalSettings } from "../types";
import { getAvailableSlots, formatDate } from "../services/demoService";
import { todayKey } from "../data/demoData";
import { Button, Card, Field } from "../components/ui";

const shift = (key: string, amount: number) => { const date = new Date(key + "T12:00:00"); date.setDate(date.getDate()+amount); return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-"); };

export function PublicBookingPage({ settings, busySlots, onBack, onRequest }: { settings: ProfessionalSettings; busySlots: AvailabilityEntry[]; onBack: () => void; onRequest: (data: { name: string; email: string; phone: string; date: string; time: string; modality: "Presencial" | "Virtual"; service: string }) => void }) {
  const dates = useMemo(() => Array.from({length: 14}, (_, index) => shift(todayKey,index)).filter((date) => settings.workingDays.includes(new Date(date+"T12:00:00").getDay())), [settings.workingDays]);
  const [date,setDate] = useState(dates[0] || todayKey);
  const [time,setTime] = useState("");
  const [modality,setModality] = useState<"Presencial"|"Virtual">(settings.modalities[0] || "Virtual");
  const [service,setService] = useState("Sesión individual");
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [phone,setPhone] = useState("");
  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);
  const slots = getAvailableSlots(settings,busySlots,date);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !time) { setError("Completá tus datos y elegí un horario disponible."); return; }
    if (busySlots.some((item) => item.date === date && item.startTime === time && item.status !== "cancelado")) { setError("Ese horario acaba de ocuparse en esta demo. Elegí otro."); setTime(""); return; }
    onRequest({ name:name.trim(), email:email.trim(), phone:phone.trim(), date, time, modality, service });
    setSuccess(true);
    setError("");
  };
  return <div className="min-h-screen bg-ivory text-ink">
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-8"><button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-white"><Activity size={18} /></span>Gestión Inteligente</button><span className="rounded-full bg-[#eef3ee] px-3 py-2 text-xs font-medium text-deep">Página pública · vista demo</span></header>
    <main className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
      <button onClick={onBack} className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-deep"><ArrowLeft size={16} />Volver al panel</button>
      <div className="grid items-start gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="overflow-hidden"><div className="h-32 bg-gradient-to-br from-[#d9e6dd] via-[#edf0e8] to-[#ead9ca] p-5"><ProfessionalAvatar className="h-24 w-24 border-4 border-white shadow-sm" /></div><div className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-deep">{settings.profession}</p><h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{settings.name}</h1><p className="mt-1 text-sm text-muted">{settings.license}</p><p className="mt-2 text-xs text-muted">Perfil ficticio · Foto generada para la demo</p><p className="mt-5 text-sm leading-7 text-muted">{settings.about}</p><div className="my-5 grid gap-3 border-y border-line py-4 text-sm text-muted"><span className="flex items-center gap-2"><Clock3 size={16} className="text-deep" />Sesiones de {settings.sessionDuration} minutos</span><span className="flex items-center gap-2"><MapPin size={16} className="text-deep" />{settings.modalities.join(" y ")}</span></div><h2 className="font-display font-semibold">Servicios</h2><div className="mt-3 grid gap-2">{["Sesión individual","Primera entrevista"].map((service) => <div key={service} className="flex items-center justify-between rounded-xl bg-ivory px-4 py-3 text-sm"><span>{service}</span><span className="text-xs text-muted">{settings.sessionDuration} min</span></div>)}</div><div className="mt-5 flex items-start gap-2 rounded-xl border border-sage/70 bg-[#f2f6f1] p-3 text-xs leading-5 text-[#526a58]"><ShieldCheck size={16} className="mt-0.5 shrink-0" />Solo se comparte tu perfil profesional. Los datos de pacientes y la agenda privada no aparecen en esta página.</div></div></Card>
        <Card className="p-5 sm:p-7"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.15em] text-deep">SOLICITUD DE TURNO</p><h2 className="mt-1 font-display text-2xl font-semibold">Elegí un horario</h2><p className="mt-2 text-sm text-muted">La solicitud queda pendiente de confirmación del consultorio.</p></div>
          {success ? <div role="status" className="rounded-2xl border border-[#b9d0bf] bg-[#f0f6f1] p-6"><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-deep"><CheckCircle2 size={25} /></span><h3 className="mt-4 font-display text-lg font-semibold">Solicitud de demo creada</h3><p className="mt-2 text-sm leading-6 text-muted">Quedó en la memoria de esta sesión para mostrar el flujo. No se envió ni guardó en un servidor y se perderá al recargar.</p><div className="mt-4 rounded-xl bg-white p-4 text-sm"><strong>{formatDate(date)} · {time}</strong><span className="mt-1 block text-muted">{service} · {modality} · {name}</span></div><Button variant="secondary" className="mt-5" onClick={onBack}>Volver al panel</Button></div> :
          <form onSubmit={submit} className="grid gap-5">
            <div><h3 className="mb-3 text-sm font-semibold">1. Elegí el servicio</h3><div className="grid gap-2 sm:grid-cols-2">{["Sesión individual","Primera entrevista"].map((option)=><button type="button" key={option} aria-pressed={service===option} onClick={()=>setService(option)} className={"min-h-12 rounded-xl border px-3 text-left text-sm " + (service===option ? "border-deep bg-[#edf3ef] font-semibold text-deep" : "border-line bg-white text-ink")}>{option}<span className="mt-1 block text-xs font-normal text-muted">{settings.sessionDuration} minutos</span></button>)}</div></div><div><h3 className="mb-3 text-sm font-semibold">2. Seleccioná el día</h3><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{dates.slice(0,7).map((item) => <button type="button" key={item} aria-pressed={date===item} onClick={() => {setDate(item);setTime("");}} className={`min-h-[74px] rounded-xl border p-2 text-center ${date===item?"border-deep bg-[#edf3ef] text-deep":"border-line bg-white text-muted"}`}><span className="block text-xs capitalize">{formatDate(item,{weekday:"short"})}</span><strong className="mt-1 block font-display text-lg">{formatDate(item,{day:"numeric"})}</strong></button>)}</div></div>
            <div><h3 className="mb-3 text-sm font-semibold">3. Horarios disponibles <span className="font-normal text-muted">· {formatDate(date)}</span></h3>{slots.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map((slot) => <button type="button" key={slot} aria-pressed={time===slot} onClick={() => {setTime(slot);setError("");}} className={`min-h-11 rounded-xl border text-sm ${time===slot?"border-deep bg-[#edf3ef] font-semibold text-deep":"border-line bg-white hover:border-sage"}`}>{slot}</button>)}</div> : <p className="rounded-xl bg-ivory p-4 text-sm text-muted">No quedan horarios disponibles ese día. Probá con otra fecha.</p>}</div>
            <div><h3 className="mb-3 text-sm font-semibold">4. Tus datos de contacto</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="Nombre y apellido" required autoComplete="name" value={name} onChange={(event)=>setName(event.target.value)} /><Field label="Email" required type="email" autoComplete="email" value={email} onChange={(event)=>setEmail(event.target.value)} /><Field label="Teléfono (opcional)" type="tel" autoComplete="tel" value={phone} onChange={(event)=>setPhone(event.target.value)} /></div></div>
            <div><h3 className="mb-3 text-sm font-semibold">5. Modalidad</h3><div className="flex flex-wrap gap-2">{settings.modalities.map((item) => <button type="button" key={item} aria-pressed={modality===item} onClick={()=>setModality(item)} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm ${modality===item?"border-deep bg-[#edf3ef] text-deep":"border-line bg-white text-muted"}`}>{item==="Virtual"?<MonitorPlay size={16}/>:<MapPin size={16}/>} {item}</button>)}</div></div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <p className="text-xs leading-5 text-muted">Al continuar, vas a ver una simulación local. No se comparten ni guardan tus datos en un servidor.</p><Button type="submit" className="w-full">Solicitar turno <ArrowRight size={16}/></Button>
          </form>}
      </Card>
    </div>
  </main>
  <footer className="px-4 py-6 text-center text-xs text-muted">Prototipo de demostración · Sin backend · No ingreses datos reales</footer>
  </div>;
}
