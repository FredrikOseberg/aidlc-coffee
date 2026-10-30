export type PickupSlot = { startIso: string; label: string };

const TEN_MIN_MS = 10 * 60 * 1000;

function timeParts(d: Date): { hour: number; minute: string; period: 'AM' | 'PM' } {
  const h = d.getHours();
  const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  const minute = d.getMinutes().toString().padStart(2, '0');
  return { hour, minute, period };
}

function label(start: Date, end: Date): string {
  const s = timeParts(start);
  const e = timeParts(end);
  const startStr = `${s.hour}:${s.minute}`;
  const endStr = `${e.hour}:${e.minute}`;
  return s.period === e.period ? `${startStr} – ${endStr} ${e.period}` : `${startStr} ${s.period} – ${endStr} ${e.period}`;
}

/** 10-minute pickup windows starting at the next 10-minute boundary strictly after `now`. Pure: same input, same output. */
export function upcomingSlots(now: Date, count = 8): PickupSlot[] {
  const firstStart = Math.ceil((now.getTime() + 1) / TEN_MIN_MS) * TEN_MIN_MS;
  const slots: PickupSlot[] = [];
  for (let i = 0; i < count; i++) {
    const start = new Date(firstStart + i * TEN_MIN_MS);
    const end = new Date(start.getTime() + TEN_MIN_MS);
    slots.push({ startIso: start.toISOString(), label: label(start, end) });
  }
  return slots;
}
