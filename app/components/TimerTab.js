"use client";

import { useEffect, useRef, useState } from "react";
import { beep, unlockAudio } from "../lib/sound";
import { pad } from "../lib/time";

const PRESETS = [
  { label: "1 นาที", s: 60 },
  { label: "5 นาที", s: 300 },
  { label: "10 นาที", s: 600 },
  { label: "15 นาที", s: 900 },
  { label: "30 นาที", s: 1800 },
];

function Field({ label, value, max, onChange, disabled }) {
  return (
    <label className="flex flex-col items-center gap-1">
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max={max}
        value={pad(value)}
        disabled={disabled}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? 0 : Math.max(0, Math.min(max, n)));
        }}
        className="w-20 rounded-2xl bg-black/5 py-3 text-center text-4xl font-semibold tabular-nums outline-none dark:bg-white/10"
      />
      <span className="text-xs opacity-55">{label}</span>
    </label>
  );
}

export default function TimerTab({ card, primary, secondary }) {
  const [inputs, setInputs] = useState({ h: 0, m: 5, s: 0 });
  const [status, setStatus] = useState("idle"); // idle | running | paused | done
  const [remaining, setRemaining] = useState(0);
  const endAt = useRef(0);
  const initial = useRef(1);

  const totalMs = (inputs.h * 3600 + inputs.m * 60 + inputs.s) * 1000;

  useEffect(() => {
    if (status !== "running") return undefined;
    const id = setInterval(() => {
      const left = endAt.current - Date.now();
      if (left <= 0) {
        clearInterval(id);
        setRemaining(0);
        setStatus("done");
        beep(4);
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [status]);

  function start() {
    unlockAudio();
    const ms = status === "paused" ? remaining : totalMs;
    if (ms <= 0) return;
    if (status !== "paused") initial.current = ms;
    endAt.current = Date.now() + ms;
    setRemaining(ms);
    setStatus("running");
  }

  function pause() {
    setRemaining(Math.max(0, endAt.current - Date.now()));
    setStatus("paused");
  }

  function reset() {
    setStatus("idle");
    setRemaining(0);
  }

  const idle = status === "idle";
  const secs = Math.ceil(remaining / 1000);
  const display = `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`;
  const progress = idle ? 1 : Math.max(0, Math.min(1, remaining / initial.current));
  const C = 2 * Math.PI * 90;

  return (
    <section className={`${card} px-6 py-8`}>
      {idle ? (
        <>
          <div className="flex items-start justify-center gap-2">
            <Field label="ชั่วโมง" value={inputs.h} max={99} onChange={(h) => setInputs((v) => ({ ...v, h }))} />
            <span className="pt-3 text-3xl opacity-40">:</span>
            <Field label="นาที" value={inputs.m} max={59} onChange={(m) => setInputs((v) => ({ ...v, m }))} />
            <span className="pt-3 text-3xl opacity-40">:</span>
            <Field label="วินาที" value={inputs.s} max={59} onChange={(s) => setInputs((v) => ({ ...v, s }))} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.s}
                onClick={() => setInputs({ h: Math.floor(p.s / 3600), m: Math.floor((p.s % 3600) / 60), s: p.s % 60 })}
                className="rounded-full bg-black/5 px-3 py-1.5 text-xs dark:bg-white/10"
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="relative mx-auto h-60 w-60">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="8" />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={status === "done" ? "#ef4444" : "#3b82f6"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-semibold tabular-nums">{display}</p>
            {status === "done" ? <p className="mt-1 text-sm text-red-500">หมดเวลา</p> : null}
            {status === "paused" ? <p className="mt-1 text-sm opacity-55">หยุดชั่วคราว</p> : null}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <button onClick={reset} disabled={idle} className={`${secondary} disabled:opacity-35`}>
          ยกเลิก
        </button>
        {status === "running" ? (
          <button onClick={pause} className={primary}>หยุด</button>
        ) : status === "done" ? (
          <button onClick={reset} className={primary}>ตกลง</button>
        ) : (
          <button onClick={start} disabled={idle && totalMs <= 0} className={`${primary} disabled:opacity-35`}>
            {status === "paused" ? "เริ่มต่อ" : "เริ่ม"}
          </button>
        )}
      </div>
    </section>
  );
}