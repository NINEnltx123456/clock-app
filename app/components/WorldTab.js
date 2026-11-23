import { CITIES, dayDiff, dayLabel, formatClock, getParts, hourDiff } from "../lib/time";

export default function WorldTab({ now, baseTz, hour12, cities, setCities, card }) {
  const available = CITIES.filter((c) => !cities.includes(c.id));

  return (
    <section className="space-y-3">
      {cities.length === 0 ? (
        <div className={`${card} p-8 text-center text-sm opacity-60`}>ยังไม่มีเมือง เพิ่มจากรายการด้านล่างได้เลย</div>
      ) : null}

      {cities.map((id) => {
        const city = CITIES.find((c) => c.id === id);
        if (!city) return null;
        const parts = getParts(now, id);
        const diff = hourDiff(now, id, baseTz);
        const diffText =
          diff === 0 ? "เวลาเดียวกับคุณ" : `${diff > 0 ? "เร็วกว่า" : "ช้ากว่า"} ${Math.abs(diff)} ชม.`;
        return (
          <article key={id} className={`${card} flex items-center justify-between px-5 py-4`}>
            <div>
              <p className="text-lg font-semibold">{city.name}</p>
              <p className="text-xs opacity-55">
                {dayLabel(dayDiff(now, id, baseTz))} · {diffText}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-semibold tabular-nums">{formatClock(parts, hour12, false)}</p>
              <button
                aria-label={`ลบ ${city.name}`}
                onClick={() => setCities((prev) => prev.filter((x) => x !== id))}
                className="rounded-full p-1.5 opacity-45 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </article>
        );
      })}

      {available.length > 0 ? (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) setCities((prev) => [...prev, e.target.value]);
          }}
          className={`${card} w-full cursor-pointer px-4 py-3 text-sm`}
        >
          <option value="">+ เพิ่มเมือง</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}
    </section>
  );
}