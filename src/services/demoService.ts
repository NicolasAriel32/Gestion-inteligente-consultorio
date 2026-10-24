import type { Appointment, AppointmentStatus, Patient, ProfessionalSettings } from "../types";

export type DemoState = {
  patients: Patient[];
  appointments: Appointment[];
  professional: ProfessionalSettings;
};

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat("es-AR", options).format(new Date(value + "T12:00:00"));
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getAppointmentsForDate(appointments: Appointment[], date: string) {
  return appointments
    .filter((appointment) => appointment.date === date && appointment.status !== "cancelado")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getAvailableSlots(state: DemoState, date: string) {
  const day = new Date(date + "T12:00:00").getDay();
  if (!state.professional.workingDays.includes(day)) return [];
  return state.professional.workingHours.filter((slot) => !validateAppointment(state.appointments, {
    date,
    startTime: slot,
    durationMinutes: state.professional.sessionDuration,
  }));
}

export function validateAppointment(
  appointments: Appointment[],
  candidate: Pick<Appointment, "date" | "startTime" | "durationMinutes">,
  ignoredId?: string,
) {
  const start = toMinutes(candidate.startTime);
  const end = start + candidate.durationMinutes;
  const conflict = appointments.some((appointment) => {
    if (appointment.id === ignoredId || appointment.date !== candidate.date || appointment.status === "cancelado") return false;
    const otherStart = toMinutes(appointment.startTime);
    const otherEnd = otherStart + appointment.durationMinutes;
    return start < otherEnd && otherStart < end;
  });
  return conflict ? "Ese horario se superpone con otro turno. Elegí otro horario." : "";
}

export function saveDemoAppointment(state: DemoState, appointment: Appointment): DemoState {
  const conflict = validateAppointment(state.appointments, appointment, appointment.id);
  if (conflict) throw new Error(conflict);
  return {
    ...state,
    appointments: [...state.appointments.filter((item) => item.id !== appointment.id), appointment],
  };
}

export function setDemoStatus(state: DemoState, id: string, status: AppointmentStatus): DemoState {
  return {
    ...state,
    appointments: state.appointments.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment),
  };
}

export function updateDemoSettings(state: DemoState, settings: ProfessionalSettings): DemoState {
  return { ...state, professional: settings };
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}
