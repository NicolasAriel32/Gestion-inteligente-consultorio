export type Section = "dashboard" | "agenda" | "pacientes" | "configuracion";
export type AppointmentStatus = "pendiente" | "confirmado" | "cancelado" | "completado";
export type Modality = "Presencial" | "Virtual";
export type Appointment = {
  id: string;
  patientId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  service: string;
  modality: Modality;
  status: AppointmentStatus;
  source: "Panel" | "Reserva pública";
};
export type AvailabilityEntry = Pick<Appointment, "date" | "startTime" | "durationMinutes" | "status">;
export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};
export type ProfessionalSettings = {
  name: string;
  profession: string;
  license: string;
  about: string;
  sessionDuration: number;
  modalities: Modality[];
  bookingSlug: string;
  workingDays: number[];
  workingHours: string[];
};
