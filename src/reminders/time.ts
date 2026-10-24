import { REMINDER_ZONE } from './types';
export function appointmentInstant(date: string, time: string): number {
  // Resolve modern local dates through IANA data; reject gaps/ambiguities.
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const target = `${date}T${time}`;
  const nominal = Date.parse(`${target}:00Z`);
  if (!Number.isFinite(nominal) || new Date(nominal).toISOString().slice(0,16) !== target) return NaN;
  const offsets = new Set([-86400000,0,86400000].map(delta=>{
    const sample = nominal + delta;
    return Date.parse(`${localInput(sample)}:00Z`) - sample;
  }));
  const candidates = [...offsets].map(offset=>nominal-offset).filter(value=>localInput(value)===target);
  return candidates.length===1 ? candidates[0] : NaN;
}
export function localInput(instant: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: REMINDER_ZONE, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23' }).formatToParts(instant);
  const get = (type: string) => parts.find(part=>part.type===type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
export function formatReminderTime(instant: number): string {
  return new Intl.DateTimeFormat('es-AR', {timeZone:REMINDER_ZONE,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(instant);
}
export function reminderMessage(instant: number): string {
  return `Recordatorio: tenés una cita el ${formatReminderTime(instant)} (hora de Buenos Aires). Si necesitás cambiarla, contactá al consultorio.`;
}
