"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "clock", label: "นาฬิกา" },
  { id: "stopwatch", label: "จับเวลา" },
  { id: "timer", label: "นับถอยหลัง" },
  { id: "alarm", label: "ปลุก" },
];

const pad = (n) => String(n).padStart(2, "0");

// ระบบเสียงเตือน (Beep)
function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function ClockApp() {
  const [now, setNow] = useState(null);
  const [tab, setTab] = useState("clock");
  const [dark, setDark] = useState(true);

  // อัปเดตเวลาปัจจุบันทุกวินาที
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ธีมมืด/สว่างจาก LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clock_dark");
      if (saved !== null) setDark(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("clock_dark", JSON.stringify(dark));
    } catch {}
  }, [dark]);

  if (!now) return <div className="min-h-screen bg-[#080808]" />;

  return (
    <div className={dark ? "dark" : ""}>
      <main className="flex min-h-screen flex-col bg-neutral-100 px-4 py-6 text-neutral-900 transition-colors dark:bg-[#080808] dark:text-white">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between">
          
          {/* ส่วนหัว: ชื่อแอปและปุ่มเปลี่ยนธีม */}
          <header className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Clock</h1>
            <button
              onClick={() => setDark(!dark)}
              className="rounded-full bg-black/10 px-3.5 py-1.5 text-xs font-medium dark:bg-white/15"
            >
              {dark ? "☀️ สว่าง" : "🌙 มืด"}
            </button>
          </header>

          {/* พื้นที่แสดงเนื้อหาตามแท็บที่เลือก */}
          <section className="my-auto py-8">
            {tab === "clock" && <TabClock now={now} />}
            {tab === "stopwatch" && <TabStopwatch />}
            {tab === "timer" && <TabTimer />}
            {tab === "alarm" && <TabAlarm now={now} />}
          </section>

          {/* แถบเมนูด้านล่าง (Navigation Bar แบบมือถือ) */}
          <nav className="grid grid-cols-4 gap-1 rounded-2xl bg-black/5 p-1 dark:bg-white/10">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl py-3 text-xs font-medium transition ${
                  tab === t.id ? "bg-white shadow-sm dark:bg-[#1f1f1f]" : "opacity-60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

        </div>
      </main>
    </div>
  );
}

// 1. แท็บนาฬิกาหลัก
function TabClock({ now }) {
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  const dateStr = now.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center">
      <p className="text-7xl font-bold tracking-tight tabular-nums">
        {pad(h)}:{pad(m)}:
        <span className="opacity-60">{pad(s)}</span>
      </p>
      <p className="mt-4 text-base opacity-60">{dateStr}</p>
    </div>
  );
}

// 2. แท็บจับเวลา (Stopwatch พร้อม Lap)
function TabStopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    const start = Date.now() - ms;
    timerRef.current = setInterval(() => setMs(Date.now() - start), 30);
    return () => clearInterval(timerRef.current);
  }, [running, ms]);

  const totalSec = Math.floor(ms / 1000);
  const centi = Math.floor((ms % 1000) / 10);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  const format = `${pad(m)}:${pad(s)}.${pad(centi)}`;

  const addLap = () => {
    setLaps([format, ...laps]);
  };

  const reset = () => {
    setRunning(false);
    setMs(0);
    setLaps([]);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-6xl font-bold tracking-tight tabular-nums">{format}</p>
      
      <div className="mt-8 flex gap-4">
        <button
          onClick={running ? addLap : reset}
          disabled={!running && ms === 0}
          className="rounded-full bg-black/10 px-8 py-3 text-sm font-semibold disabled:opacity-30 dark:bg-white/15"
        >
          {running ? "รอบ (Lap)" : "รีเซ็ต"}
        </button>
        <button
          onClick={() => setRunning(!running)}
          className={`rounded-full px-8 py-3 text-sm font-semibold ${
            running ? "bg-red-500/20 text-red-500" : "bg-neutral-900 text-white dark:bg-white dark:text-black"
          }`}
        >
          {running ? "หยุด" : "เริ่ม"}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-6 max-h-40 w-full overflow-y-auto rounded-2xl bg-black/5 p-3 dark:bg-white/5">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between py-1 text-sm opacity-80">
              <span>รอบที่ {laps.length - i}</span>
              <span className="tabular-nums font-medium">{lap}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 3. แท็บนับถอยหลัง (Timer)
function TabTimer() {
  const [seconds, setSeconds] = useState(60);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || left <= 0) return;
    const t = setTimeout(() => {
      if (left - 1 === 0) {
        setRunning(false);
        beep();
      }
      setLeft(left - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  const start = () => {
    if (left === 0) setLeft(seconds);
    setRunning(true);
  };

  const m = Math.floor(left / 60);
  const s = left % 60;

  return (
    <div className="flex flex-col items-center">
      {running || left > 0 ? (
        <p className="text-7xl font-bold tracking-tight tabular-nums">
          {pad(m)}:{pad(s)}
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          {[30, 60, 300, 600].map((sec) => (
            <button
              key={sec}
              onClick={() => setSeconds(sec)}
              className={`rounded-xl px-4 py-2 text-xs font-medium ${
                seconds === sec ? "bg-neutral-900 text-white dark:bg-white dark:text-black" : "bg-black/5 dark:bg-white/10"
              }`}
            >
              {sec < 60 ? `${sec} วินาที` : `${sec / 60} นาที`}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => { setRunning(false); setLeft(0); }}
          className="rounded-full bg-black/10 px-8 py-3 text-sm font-semibold dark:bg-white/15"
        >
          ยกเลิก
        </button>
        <button
          onClick={running ? () => setRunning(false) : start}
          className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black"
        >
          {running ? "พัก" : "เริ่ม"}
        </button>
      </div>
    </div>
  );
}

// 4. แท็บนาฬิกาปลุก (Alarm)
function TabAlarm({ now }) {
  const [alarms, setAlarms] = useState(["07:00"]);
  const [input, setInput] = useState("08:00");

  const currentHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  useEffect(() => {
    if (alarms.includes(currentHHMM)) {
      beep();
    }
  }, [currentHHMM, alarms]);

  const addAlarm = () => {
    if (input && !alarms.includes(input)) {
      setAlarms([...alarms, input].sort());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="time"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-2xl bg-black/5 px-4 py-2.5 text-xl font-semibold outline-none dark:bg-white/10"
        />
        <button
          onClick={addAlarm}
          className="flex-1 rounded-2xl bg-neutral-900 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
        >
          เพิ่มเวลาปลุก
        </button>
      </div>

      <div className="space-y-2">
        {alarms.map((time) => (
          <div key={time} className="flex items-center justify-between rounded-2xl bg-black/5 px-5 py-3.5 dark:bg-white/5">
            <span className="text-2xl font-bold tabular-nums">{time}</span>
            <button
              onClick={() => setAlarms(alarms.filter((t) => t !== time))}
              className="text-sm opacity-40 hover:opacity-100"
            >
              ✕ ลบ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}