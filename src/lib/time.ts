/** Time-zone helpers for the "working across time zones" clocks. Pure and testable. */

export const MARKET_ZONES = [
  { label: "New York", country: "United States", tz: "America/New_York" },
  { label: "London", country: "United Kingdom", tz: "Europe/London" },
  { label: "Toronto", country: "Canada", tz: "America/Toronto" },
  { label: "Sydney", country: "Australia", tz: "Australia/Sydney" },
  { label: "Dubai", country: "United Arab Emirates", tz: "Asia/Dubai" },
] as const;

/** "09:00-18:00" -> [9, 18]. Falls back to 9-18 on bad input. */
export function parseHours(value: string): [number, number] {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?$/.exec(value.trim());
  if (!m) return [9, 18];
  const start = Number(m[1]) + Number(m[2] ?? 0) / 60;
  const end = Number(m[3]) + Number(m[4] ?? 0) / 60;
  return start >= 0 && end <= 24 && start < end ? [start, end] : [9, 18];
}

/** Local time in a zone as a fractional hour (14:30 -> 14.5), plus weekday number (1=Mon..7=Sun). */
export function localParts(tz: string, date: Date): { hour: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return { hour: Number(get("hour")) + Number(get("minute")) / 60, weekday: days.indexOf(get("weekday")) + 1 };
}

/** True on Monday to Friday between start and end (local time). */
export function inBusinessHours(tz: string, date: Date, [start, end]: [number, number] = [9, 18]): boolean {
  const { hour, weekday } = localParts(tz, date);
  return weekday <= 5 && hour >= start && hour < end;
}

export function formatClock(tz: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(date);
}
