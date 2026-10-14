// Modul minggu: buat kalender MGG otomatis dari tanggal mulai proyek (TDD ticket 03)
export interface WeekRow {
  number: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Minggu berurutan 7 hari mulai tanggal mulai, sampai hari ini (min. 8 minggu). */
export function generateWeeks(startDate: string, todayIso: string): WeekRow[] {
  const weeks: WeekRow[] = [];
  let number = 1;
  let start = startDate;
  // minimal 8 minggu, atau sampai melewati hari ini
  while (number <= 8 || new Date(`${start}T00:00:00Z`) <= new Date(`${todayIso}T00:00:00Z`)) {
    weeks.push({ number, startDate: start, endDate: addDays(start, 6) });
    start = addDays(start, 7);
    number += 1;
    if (number > 520) break; // pengaman ~10 tahun
  }
  return weeks;
}

export function formatMggLabel(number: number): string {
  return `MGG ${number}`;
}
