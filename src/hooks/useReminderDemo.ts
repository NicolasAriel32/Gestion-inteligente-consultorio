import { useEffect, useMemo, useState } from 'react';
import type { DemoState } from '../services/demoService';
import { todayKey } from '../data/demoData';
import { claimDue, reconcile, resolveProcessing, validateConfig } from '../reminders/engine';
import { appointmentInstant } from '../reminders/time';
import { defaultConfig, emptyReminderState, type Channel, type Outcome, type ReminderConfig, type ReminderState } from '../reminders/types';
export function useReminderDemo(data: DemoState) {
  const [now,setNow] = useState(()=>appointmentInstant(todayKey,'08:00'));
  const [config,setConfig] = useState<ReminderConfig>(defaultConfig);
  const [state,setState] = useState<ReminderState>(emptyReminderState);
  const [modes,setModes] = useState<Record<Channel,Outcome>>({email:'success',whatsapp:'success'});
  const context = useMemo(()=>({appointments:data.appointments,patients:data.patients,config,now}),[data.appointments,data.patients,config,now]);
  useEffect(()=>setState(current=>reconcile(current,context)),[context]);
  const applyConfig = (next: ReminderConfig): string => {
    const error = validateConfig(next); if(error) return error;
    setConfig(current=>({...next,rules:next.rules.map(rule=>{
      const before = current.rules.find(item=>item.id===rule.id);
      const unchanged = before && before.channel===rule.channel && before.minutesBefore===rule.minutesBefore && current.enabled===next.enabled;
      const latest = Math.max(0,before?.version||0,...state.jobs.filter(job=>job.ruleId===rule.id).map(job=>job.ruleVersion));
      return {...rule,version:unchanged ? before.version : latest+1};
    })}));
    return '';
  };
  const advance = (next: number): string => {
    if(!Number.isFinite(next) || next < now) return 'El reloj de la demo solo puede avanzar.';
    setNow(next);return '';
  };
  return {now,config,state,modes,applyConfig,advance,setModes,
    claim:()=>setState(current=>claimDue(current,context)),
    resolve:()=>setState(current=>resolveProcessing(current,context,modes)),
  };
}
export type ReminderController = ReturnType<typeof useReminderDemo>;
