import type { Appointment, Patient } from '../types';
export const REMINDER_ZONE = 'America/Argentina/Buenos_Aires' as const;
export type Channel = 'email' | 'whatsapp';
export type Rule = { id: string; version: number; minutesBefore: number; channel: Channel };
export type ReminderConfig = { enabled: boolean; rules: Rule[] };
export type Outcome = 'success' | 'transient' | 'permanent' | 'uncertain';
export type JobStatus = 'scheduled' | 'processing' | 'retry' | 'simulated_success' | 'simulated_error' | 'uncertain' | 'cancelled';
export type Job = {
  id: string; appointmentId: string; appointmentVersion: number; recipientVersion: number;
  ruleId: string; ruleVersion: number; channel: Channel; scheduledAt: number;
  nextAttemptAt: number; appointmentAt: number; timeZone: typeof REMINDER_ZONE;
  status: JobStatus; attemptCount: number; reason?: string;
};
export type Attempt = { id: string; jobId: string; number: number; startedAt: number; finishedAt?: number; result: Outcome | 'processing' | 'cancelled'; code?: string };
export type ReminderState = { jobs: Job[]; attempts: Attempt[] };
export type Context = { appointments: Appointment[]; patients: Patient[]; config: ReminderConfig; now: number };
export const defaultConfig: ReminderConfig = { enabled: true, rules: [
  { id: 'day-before', version: 1, minutesBefore: 1440, channel: 'email' },
  { id: 'two-hours', version: 1, minutesBefore: 120, channel: 'whatsapp' },
] };
export const emptyReminderState: ReminderState = { jobs: [], attempts: [] };
