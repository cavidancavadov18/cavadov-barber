export type BusinessHoursConfig = {
  start: number;
  end: number;
  sundayStart: number;
  sundayEnd: number;
};

export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  start: 10,
  end: 24,
  sundayStart: 10,
  sundayEnd: 24,
};

export const SLOT_INTERVAL_MIN = 30;
export const TIMEZONE = "Asia/Baku";

/** Local calendar parts in Asia/Baku */
export function bakuParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, p.value])
  );
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour === "24" ? "0" : parts.hour),
    minute: Number(parts.minute),
    weekday: parts.weekday,
  };
}

export function todayInBaku() {
  return bakuParts().dateStr;
}

export function generateDaySlots(
  dateStr: string,
  hours: BusinessHoursConfig = DEFAULT_BUSINESS_HOURS
): string[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 9, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(probe);
  const isSunday = weekday === "Sun";
  const start = isSunday ? hours.sundayStart : hours.start;
  const end = isSunday ? hours.sundayEnd : hours.end;

  const slots: string[] = [];
  for (let h = start; h < end; h++) {
    for (let mnt = 0; mnt < 60; mnt += SLOT_INTERVAL_MIN) {
      const total = h * 60 + mnt;
      if (total + SLOT_INTERVAL_MIN > end * 60) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(mnt).padStart(2, "0")}`);
    }
  }
  return slots;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isPastSlot(dateStr: string, time: string) {
  const now = bakuParts();
  if (dateStr < now.dateStr) return true;
  if (dateStr > now.dateStr) return false;
  return toMinutes(time) <= now.hour * 60 + now.minute;
}

export function isSlotBlocked(
  slot: string,
  taken: { time: string; durationMin: number }[],
  durationMin: number
) {
  const start = toMinutes(slot);
  const end = start + durationMin;
  return taken.some((b) => {
    const bStart = toMinutes(b.time);
    const bEnd = bStart + b.durationMin;
    return start < bEnd && end > bStart;
  });
}
