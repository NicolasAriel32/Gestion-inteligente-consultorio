import type { Patient } from '../types';
import { simulateAdapter } from './adapters';
import { appointmentInstant } from './time';
import { REMINDER_ZONE, type Channel, type Context, type Job, type Outcome, type ReminderConfig, type ReminderState } from './types';
const active = (job: Job) => ['scheduled','retry','processing'].includes(job.status);
export function validateConfig(config: ReminderConfig): string {
  if (config.rules.length > 2) return 'Configurá como máximo dos avisos.';
  if (config.enabled && config.rules.length === 0) return 'Agregá al menos un aviso.';
  if (new Set(config.rules.map(rule=>rule.id)).size !== config.rules.length) return 'Los avisos deben tener identificadores distintos.';
  if (new Set(config.rules.map(rule=>`${rule.minutesBefore}:${rule.channel}`)).size !== config.rules.length) return 'No repitas la misma anticipación y canal en ambos avisos.';
  if (config.rules.some(rule=>!rule.id || !Number.isInteger(rule.version) || rule.version < 1 || !Number.isInteger(rule.minutesBefore) || rule.minutesBefore < 1 || rule.minutesBefore > 10080 || !['email','whatsapp'].includes(rule.channel))) return 'Elegí una anticipación entre 1 minuto y 7 días y un canal válido.';
  return '';
}
export function channelAllowed(patient: Patient | undefined, channel: Channel): boolean {
  if (!patient?.reminderPreferences?.[channel]) return false;
  return channel === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email) : /^\+?[\d\s()-]{8,}$/.test(patient.phone) && patient.phone.replace(/\D/g,'').length >= 8;
}
function desiredJobs(ctx: Context): Job[] {
  if (!Number.isFinite(ctx.now)) throw new Error('Reloj inválido.');
  const error = validateConfig(ctx.config); if(error) throw new Error(error);
  if (!ctx.config.enabled) return [];
  const jobs: Job[] = [];
  for (const appointment of ctx.appointments) {
    if (appointment.status !== 'confirmado') continue;
    const at = appointmentInstant(appointment.date, appointment.startTime);
    if (!Number.isFinite(at) || at <= ctx.now) continue;
    const patient = ctx.patients.find(item=>item.id===appointment.patientId);
    for (const rule of ctx.config.rules) {
      if (!channelAllowed(patient,rule.channel)) continue;
      const version = appointment.reminderVersion || 1;
      const recipientVersion = patient?.reminderPreferences?.version || 1;
      const id = JSON.stringify([appointment.id,version,rule.id,rule.version,rule.channel,recipientVersion,appointment.patientId]);
      const scheduledAt = at - rule.minutesBefore * 60000;
      jobs.push({id,appointmentId:appointment.id,appointmentVersion:version,recipientVersion,ruleId:rule.id,ruleVersion:rule.version,channel:rule.channel,scheduledAt,nextAttemptAt:scheduledAt,appointmentAt:at,timeZone:REMINDER_ZONE,status:'scheduled',attemptCount:0});
    }
  }
  return jobs;
}
export function reconcile(state: ReminderState, ctx: Context): ReminderState {
  const desired = desiredJobs(ctx);
  const keys = new Map(desired.map(job=>[job.id,job]));
  const jobs = state.jobs.map(job=>active(job) && (!keys.has(job.id) || keys.get(job.id)!.appointmentAt !== job.appointmentAt || keys.get(job.id)!.scheduledAt !== job.scheduledAt) ? {...job,status:'cancelled' as const,reason:'CITA_REGLA_O_PREFERENCIA_CAMBIO'} : {...job});
  const existing = new Set(jobs.map(job=>job.id));
  for (const job of desired) if (!existing.has(job.id) && job.scheduledAt > ctx.now && !jobs.some(old=>old.status==='uncertain' && old.appointmentId===job.appointmentId && old.ruleId===job.ruleId && old.channel===job.channel)) { jobs.push(job); existing.add(job.id); }
  const cancelled = new Set(jobs.filter(job=>job.status==='cancelled').map(job=>job.id));
  const attempts = state.attempts.map(attempt=>attempt.result==='processing' && cancelled.has(attempt.jobId) ? {...attempt,result:'cancelled' as const,finishedAt:ctx.now,code:'DEMO_INVALIDATED'} : {...attempt});
  return {jobs,attempts};
}
export function claimDue(state: ReminderState, ctx: Context): ReminderState {
  const current = reconcile(state,ctx);
  const attempts = [...current.attempts];
  const jobs = current.jobs.map(job=>{
    if (!['scheduled','retry'].includes(job.status) || job.nextAttemptAt > ctx.now) return job;
    const count = job.attemptCount + 1;
    attempts.push({id:JSON.stringify([job.id,count]),jobId:job.id,number:count,startedAt:ctx.now,result:'processing'});
    return {...job,status:'processing' as const,attemptCount:count};
  });
  return {jobs,attempts};
}
export function resolveProcessing(state: ReminderState, ctx: Context, modes: Record<Channel,Outcome>): ReminderState {
  // Revalidation occurs immediately before fake adapter invocation, including status/version/consent.
  const current = reconcile(state,ctx);
  const attempts = [...current.attempts];
  const jobs = current.jobs.map(job=>{
    if(job.status!=='processing') return job;
    const index = attempts.findIndex(attempt=>attempt.jobId===job.id && attempt.number===job.attemptCount && attempt.result==='processing');
    if(index<0) return {...job,status:'uncertain' as const,reason:'ATTEMPT_NOT_FOUND'};
    const result = simulateAdapter(job.channel,modes[job.channel]);
    attempts[index] = {...attempts[index],finishedAt:ctx.now,result:result.outcome,code:result.code};
    if(result.outcome==='success') return {...job,status:'simulated_success' as const,reason:result.code};
    if(result.outcome==='uncertain') return {...job,status:'uncertain' as const,reason:'REQUIERE_REVISION_NO_REINTENTAR_AUTOMATICAMENTE'};
    const nextAttemptAt = ctx.now + (job.attemptCount===1 ? 5 : 15) * 60000;
    if(result.outcome==='transient' && job.attemptCount<3 && nextAttemptAt<job.appointmentAt) return {...job,status:'retry' as const,nextAttemptAt,reason:result.code};
    return {...job,status:'simulated_error' as const,reason:result.outcome==='transient'?'REINTENTOS_AGOTADOS_O_CITA_CERCANA':result.code};
  });
  return {jobs,attempts};
}
