import type { Appointment, AppointmentSeries } from '../types';
import { validateAppointment } from './demoService';

export type SeriesPlan = { series: AppointmentSeries; appointments: Appointment[]; conflicts: string[] };
export function planSeries(base: Appointment, intervalWeeks: number, count: number, existing: Appointment[]): SeriesPlan {
  if (![1, 2].includes(intervalWeeks) || !Number.isInteger(count) || count < 2 || count > 24) throw new Error('Elegí frecuencia semanal o quincenal y entre 2 y 24 sesiones.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(base.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(base.startTime)) throw new Error('Completá una fecha y hora válidas.');
  const anchor = new Date(base.date + 'T12:00:00Z');
  if (Number.isNaN(anchor.getTime()) || anchor.toISOString().slice(0,10) !== base.date) throw new Error('Fecha inválida.');
  const series: AppointmentSeries = { id: 'series-' + base.id, anchorDate: base.date, intervalWeeks, count, timeZone: 'America/Argentina/Buenos_Aires' };
  const appointments = Array.from({length: count}, (_, index) => {
    const day = new Date(anchor); day.setUTCDate(day.getUTCDate() + index * intervalWeeks * 7);
    return { ...base, id: base.id + '-' + index, date: day.toISOString().slice(0,10), seriesId: series.id, occurrenceIndex: index };
  });
  const conflicts = appointments.filter((item, index) => validateAppointment([...existing, ...appointments.slice(0,index)], item)).map(item => item.date);
  return { series, appointments, conflicts };
}
export function applySeries(existing: Appointment[], plan: SeriesPlan): Appointment[] {
  if (plan.conflicts.length || plan.appointments.some((item,index) => validateAppointment([...existing,...plan.appointments.slice(0,index)],item))) throw new Error('La serie tiene horarios ocupados. Revisá todas las fechas antes de agregarla.');
  return [...existing, ...plan.appointments];
}
