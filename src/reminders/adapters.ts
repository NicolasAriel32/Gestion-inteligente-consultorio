import type { Channel, Outcome } from './types';
export type AdapterResult = { outcome: Outcome; code: string };
// Pure, synchronous fake adapters. No transport, recipient, message, network or credentials.
export function simulateAdapter(channel: Channel, mode: Outcome): AdapterResult {
  return { outcome: mode, code: `DEMO_${channel.toUpperCase()}_${mode.toUpperCase()}` };
}
