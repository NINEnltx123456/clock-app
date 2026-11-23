import AnalogClock from "./AnalogClock";
import { formatClock, formatDate, getParts } from "../lib/time";

export default function ClockTab({ now, tz, hour12, card }) {
  const parts = getParts(now, tz);

  return (
    <section className={`${card} flex flex-col items-center gap-6 px-6 py-8`}>
      <AnalogClock parts={parts} className="h-auto w-full max-w-[300px]" />
      <div className="text-center">
        <p className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
          {formatClock(parts, hour12)}
        </p>
        <p className="mt-2 text-base opacity-70">{formatDate(now, tz)}</p>
        <p className="mt-1 text-xs opacity-45">{tz}</p>
      </div>
    </section>
  );
}