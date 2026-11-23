"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "clock", label: "นาฬิกา" },
  { id: "stopwatch", label: "จับเวลา" },
  { id: "timer", label: "นับถอยหลัง" },
  { id: "alarm", label: "ปลุก" },
];

const pad = (n) => String(n).padStart(2, "0");

// ระบบเสียงเตือน (Beep แบบนุ่มนวล)
function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

export default function ClockApp() {
  const [now, setNow] = useState(null);
  const [tab, setTab] = useState("clock");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  if (!now) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className={dark ? "dark" : ""}>
      <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-neutral-950 p-6 text-neutral-100 selection:bg-cyan-500 selection:text-white dark:bg-[#050505]">
        
        {/* แสงนีออนพื้นหลังแบบล้ำสมัย */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        {/* ส่วนหัว */}
        <header className="z-10 flex w-full max-w-md items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
            <h1 className="text-lg font-bold tracking-wider uppercase text-neutral-200">Chronos</h1>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium backdrop-blur-md transition hover:bg-white/10"
          >
            {dark ? "☀️ สว่าง" : "🌙 มืด"}
          </button>
        </header>

        {/* พื้นแสดงเนื้อหา */}
        <section className="z-10 my-auto flex w-full max-w-md flex-col items-center justify-center py-8">
          {tab === "clock" && <TabClock now={now} />}
          {tab === "stopwatch" && <TabStopwatch />}
          {tab === "timer" && <TabTimer />}
          {tab === "alarm" && <TabAlarm now={now} />}
        </section>

        {/* เมนูด้านล่างสไตล์ Glassmorphism */}
        <nav className="z-10 grid w-full max-w-md grid-cols-4 gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl shadow-2xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl py-3 text-xs font-medium transition-all duration-300 ${
                tab === t.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

      </main>
    </div>
  );
}

// 1. แท็บนาฬิกา (รวมทั้งแบบเข็มและดิจิทัลล้ำสมัย)
function TabClock({ now }) {
  const [viewMode, setViewMode] = useState("digital"); // digital | analog

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  const dateStr = now.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // คำนวณองศาเข็มนาฬิกา
  const secondDeg = s * 6;
  const minuteDeg = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  return (
    <div className="flex flex-col items-center w-full">
      {/* สลับมุมมอง เข็ม / ดิจิทัล */}
      <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
        <button
          onClick={() => setViewMode("digital")}
          className={`rounded-full px-4 py-1 text-xs font-medium transition ${
            viewMode === "digital" ? "bg-white/20 text-white" : "text-neutral-400"
          }`}
        >
          ดิจิทัล
        </button>
        <button
          onClick={() => setViewMode("analog")}
          className={`rounded-full px-4 py-1 text-xs font-medium transition ${
            viewMode === "analog" ? "bg-white/20 text-white" : "text-neutral-400"
          }`}
        >
          อนาล็อก
        </button>
      </div>

      {viewMode === "digital" ? (
        <div className="flex flex-col items-center animate-fade-in">
          {/* กรอบดิจิทัลนีออน */}
          <div className="relative rounded-3xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none" />
            <p className="text-6xl font-black tracking-wider tabular-nums bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              {pad(h)}:{pad(m)}:
              <span className="text-cyan-400">{pad(s)}</span>
            </p>
          </div>
          <p className="mt-6 text-sm font-medium tracking-wide text-neutral-400">{dateStr}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fade-in">
          {/* นาฬิกาแบบเข็มล้ำสมัย */}
          <div className="relative h-64 w-64 rounded-full border border-white/15 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] flex items-center justify-center">
            {/* ขีดบอกเวลา */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-full flex justify-center"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div className="h-2 w-0.5 rounded-full bg-white/40" />
              </div>
            ))}

            {/* เข็มชั่วโมง */}
            <div
              className="absolute h-16 w-1.5 rounded-full bg-white transition-transform duration-300 origin-bottom"
              style={{ transform: `translateY(-50%) rotate(${hourDeg}deg)` }}
            />
            {/* เข็มนาที */}
            <div
              className="absolute h-24 w-1 rounded-full bg-neutral-300 transition-transform duration-300 origin-bottom"
              style={{ transform: `translateY(-50%) rotate(${minuteDeg}deg)` }}
            />
            {/* เข็มวินาที (สีฟ้าซีออน) */}
            <div
              className="absolute h-28 w-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-transform duration-75 origin-bottom"
              style={{ transform: `translateY(-50%) rotate(${secondDeg}deg)` }}
            />
            {/* จุดตรงกลาง */}
            <div className="absolute h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          </div>
          <p className="mt-6 text-sm font-medium tracking-wide text-neutral-400">{dateStr}</p>
        </div>
      )}
    </div>
  );
}

// 2. แท็บจับเวลา (Stopwatch)
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

  const addLap = () => setLaps([format, ...laps]);
  const reset = () => { setRunning(false); setMs(0); setLaps([]); };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-2xl shadow-xl w-full text-center">
        <p className="text-6xl font-black tracking-wider tabular-nums text-white">{format}</p>
      </div>
      
      <div className="mt-8 flex gap-4 w-full">
        <button
          onClick={running ? addLap : reset}
          disabled={!running && ms === 0}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-semibold backdrop-blur-md disabled:opacity-30 transition hover:bg-white/10 active:scale-95"
        >
          {running ? "รอบ (Lap)" : "รีเซ็ต"}
        </button>
        <button
          onClick={() => setRunning(!running)}
          className={`flex-1 rounded-2xl py-4 text-sm font-semibold transition active:scale-95 shadow-lg ${
            running
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25"
          }`}
        >
          {running ? "หยุด" : "เริ่ม"}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-4 max-h-36 w-full overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md space-y-2">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between text-xs font-medium text-neutral-300 px-2 py-1 border-b border-white/5">
              <span className="text-neutral-500">รอบที่ {laps.length - i}</span>
              <span className="tabular-nums">{lap}</span>
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
    <div className="flex flex-col items-center w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-2xl shadow-xl w-full text-center">
        {running || left > 0 ? (
          <p className="text-6xl font-black tracking-wider tabular-nums text-white">
            {pad(m)}:{pad(s)}
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {[30, 60, 300, 600].map((sec) => (
              <button
                key={sec}
                onClick={() => setSeconds(sec)}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
                  seconds === sec
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                    : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                }`}
              >
                {sec < 60 ? `${sec} วิ` : `${sec / 60} นาที`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 w-full">
        <button
          onClick={() => { setRunning(false); setLeft(0); }}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-semibold backdrop-blur-md transition hover:bg-white/10 active:scale-95"
        >
          ยกเลิก
        </button>
        <button
          onClick={running ? () => setRunning(false) : start}
          className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition active:scale-95"
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
    <div className="flex flex-col items-center w-full space-y-4">
      <div className="flex gap-2 w-full">
        <input
          type="time"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-semibold tabular-nums text-white outline-none backdrop-blur-md focus:border-cyan-500"
        />
        <button
          onClick={addAlarm}
          className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition active:scale-95"
        >
          เพิ่มเวลาปลุก
        </button>
      </div>

      <div className="w-full space-y-2.5 max-h-56 overflow-y-auto">
        {alarms.map((time) => (
          <div key={time} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-md">
            <span className="text-2xl font-bold tabular-nums tracking-wide text-white">{time}</span>
            <button
              onClick={() => setAlarms(alarms.filter((t) => t !== time))}
              className="text-xs text-neutral-400 hover:text-red-400 transition"
            >
              ✕ ลบ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}