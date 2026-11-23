export const CITIES = [
  { id: "Asia/Bangkok", name: "กรุงเทพฯ" },
  { id: "Asia/Tokyo", name: "โตเกียว" },
  { id: "Asia/Seoul", name: "โซล" },
  { id: "Asia/Singapore", name: "สิงคโปร์" },
  { id: "Asia/Kolkata", name: "มุมไบ" },
  { id: "Asia/Dubai", name: "ดูไบ" },
  { id: "Europe/London", name: "ลอนดอน" },
  { id: "Europe/Paris", name: "ปารีส" },
  { id: "America/New_York", name: "นิวยอร์ก" },
  { id: "America/Chicago", name: "ชิคาโก" },
  { id: "America/Vancouver", name: "แวนคูเวอร์" },
  { id: "America/Los_Angeles", name: "ลอสแอนเจลิส" },
  { id: "Australia/Sydney", name: "ซิดนีย์" },
  { id: "Pacific/Auckland", name: "โอ๊คแลนด์" },
];

export const pad = (n) => String(n).padStart(2, "0");

export function getParts(date, timeZone) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const o = {};
  for (const p of f.formatToParts(date)) o[p.type] = p.value;
  return {
    y: +o.year,
    mo: +o.month,
    d: +o.day,
    h: +o.hour,
    m: +o.minute,
    s: +o.second,
  };
}

export function formatClock({ h, m, s }, hour12, withSeconds = true) {
  const hh = hour12 ? String(h % 12 || 12) : pad(h);
  const suffix = hour12 ? (h < 12 ? " AM" : " PM") : "";
  return `${hh}:${pad(m)}${withSeconds ? ":" + pad(s) : ""}${suffix}`;
}

export function formatDate(date, timeZone) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function offsetMinutes(date, timeZone) {
  const p = getParts(date, timeZone);
  const asUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.m, p.s);
  return (asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000;
}

// ส่วนต่างเวลาของเมืองเทียบกับโซนหลัก เป็นชั่วโมง
export function hourDiff(date, timeZone, baseZone) {
  return (offsetMinutes(date, timeZone) - offsetMinutes(date, baseZone)) / 60;
}

export function dayDiff(date, timeZone, baseZone) {
  const a = getParts(date, timeZone);
  const b = getParts(date, baseZone);
  return Math.round(
    (Date.UTC(a.y, a.mo - 1, a.d) - Date.UTC(b.y, b.mo - 1, b.d)) / 86400000
  );
}

export function dayLabel(diff) {
  if (diff === 0) return "วันนี้";
  if (diff === 1) return "พรุ่งนี้";
  if (diff === -1) return "เมื่อวาน";
  return diff > 0 ? `+${diff} วัน` : `${diff} วัน`;
}