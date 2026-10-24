import type { Appointment, Patient, ProfessionalSettings } from "../types";

const today = new Date();
export const localDateKey = (date: Date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
export const dateOffset = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
};
export const todayKey = localDateKey(today);

export const demoProfessional: ProfessionalSettings = {
  name: "Dra. Martina Ríos",
  profession: "Psicóloga clínica",
  license: "M.P. 00.000",
  about: "Un espacio de escucha y acompañamiento profesional, con atención cálida y respetuosa.",
  sessionDuration: 50,
  modalities: ["Presencial", "Virtual"],
  bookingSlug: "martina-rios",
  workingDays: [1, 2, 3, 4, 5],
  workingHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
};

export const demoPatients: Patient[] = [
  { id: "p1", name: "Sofía Martínez", email: "sofia.demo@example.com", phone: "+54 9 11 0000-0001", createdAt: dateOffset(-42) },
  { id: "p2", name: "Tomás Benítez", email: "tomas.demo@example.com", phone: "+54 9 11 0000-0002", createdAt: dateOffset(-35) },
  { id: "p3", name: "Valentina López", email: "valentina.demo@example.com", phone: "+54 9 11 0000-0003", createdAt: dateOffset(-18) },
  { id: "p4", name: "Mateo Fernández", email: "mateo.demo@example.com", phone: "+54 9 11 0000-0004", createdAt: dateOffset(-9) },
  { id: "p5", name: "Lucía Romero", email: "lucia.demo@example.com", phone: "+54 9 11 0000-0005", createdAt: dateOffset(-4) },
];

export const demoAppointments: Appointment[] = [
  { id: "a1", patientId: "p1", date: todayKey, startTime: "09:00", durationMinutes: 50, service: "Sesión individual", modality: "Presencial", status: "confirmado", source: "Panel" },
  { id: "a2", patientId: "p2", date: todayKey, startTime: "10:00", durationMinutes: 50, service: "Sesión individual", modality: "Virtual", status: "confirmado", source: "Reserva pública" },
  { id: "a3", patientId: "p3", date: todayKey, startTime: "11:00", durationMinutes: 50, service: "Primera entrevista", modality: "Virtual", status: "pendiente", source: "Reserva pública" },
  { id: "a4", patientId: "p4", date: dateOffset(1), startTime: "14:00", durationMinutes: 50, service: "Sesión individual", modality: "Presencial", status: "confirmado", source: "Panel" },
  { id: "a5", patientId: "p5", date: dateOffset(2), startTime: "16:00", durationMinutes: 50, service: "Sesión individual", modality: "Virtual", status: "confirmado", source: "Reserva pública" },
];
