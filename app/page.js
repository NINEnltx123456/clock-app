"use client";

import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

export default function ClockApp() {
  const [now, setNow] = useState(null);
  const [mode, setMode] = useState("clock"); // clock | stopwatch
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);

  // อัปเดตเวลานาฬิกาหลักทุกวินาที
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ตัวจับเวลา (Stopwatch)
  useEffect(() => {
    if (!running) return;
    const start = Date.now() - ms;
    const t = setInterval(() => setMs(Date.now() - start), 50);
    return () => clearInterval(t);
  }, [running, ms]);

  if (!now) return <div className="min-h-screen bg-[#080808]" />;

  // แปลงค่า Stopwatch
  const totalSec = Math.floor(ms / 1000);
  const centi = Math.floor((ms % 1000) / 10);
  const swTime = `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}.${pad(centi)}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080808] px-4 text-white">
      <div className="w-full max-w-sm text-center">
        {/* สลับโหมด */}
        <div className="mb-8 inline-flex rounded-full bg-white/10 p-1">
          <button
            onClick={() => setMode("clock")}
            className={`rounded-full px-5 py-1.5 text-xs font-medium transition ${
              mode === "clock" ? "bg-white text-black" : "opacity-60"
            }`}
          >
            นาฬิกา
          </button>
          <button
            onClick={() => setMode("stopwatch")}
            className={`rounded-full px-5 py-1.5 text-xs font-medium transition ${
              mode === "stopwatch" ? "bg-white text-black" : "opacity-60"
            }`}
          >
            จับเวลา
          </button>
        </div>

        {/* หน้าจอแสดงผล */}
        {mode === "clock" ? (
          <div>
            <p className="text-6xl font-bold tracking-tight tabular-nums">
              {pad(now.getHours())}:{pad(now.getMinutes())}:
              <span className="opacity-75">{pad(now.getSeconds())}</span>
            </p>
            <p className="mt-4 text-sm opacity-50">
              {now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-6xl font-bold tracking-tight tabular-nums">{swTime}</p>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => { setRunning(false); setMs(0); }}
                className="rounded-full bg-white/15 px-6 py-2.5 text-sm font-semibold"
              >
                รีเซ็ต
              </button>
              <button
                onClick={() => setRunning(!running)}
                className="rounded-full bg-white px-8 py-2.5 text-sm font-semibold text-black"
              >
                {running ? "หยุด" : "เริ่ม"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}