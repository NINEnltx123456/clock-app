"use client";

import { useEffect, useRef, useState } from "react";

const CITIES = [
  { id: "Asia/Tokyo", name: "โตเกียว", zone: " اليابان" },
  { id: "Europe/London", name: "ลอนดอน", zone: "UK" },
  { id: "America/New_York", name: "นิวยอร์ก", zone: "USA" },
  { id: "Australia/Sydney", name: "ซิดนีย์", zone: "AUS" },
];

const pad = (n) => String(n).padStart(2, "0");

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

export default function WiggleClockApp() {
  const [now, setNow] = useState(null);

  // สสถานะจับเวลา (Stopwatch)
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swRef = useRef(null);

  // สถานะนับถอยหลัง (Timer)
  const [timerSec, setTimerSec] = useState(60);
  const [timerLeft, setTimerLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // สถานะปลุก (Alarm)
  const [alarms, setAlarms] = useState([
    { time: "07:00", active: true },
    { time: "21:00", active: false },
  ]);
  const [alarmInput, setAlarmInput] = useState("08:00");

  // อัปเดตเวลาปัจจุบัน
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ทำงาน Stopwatch
  useEffect(() => {
    if (!swRunning) return;
    const start = Date.now() - swMs;
    swRef.current = setInterval(() => setSwMs(Date.now() - start), 30);
    return () => clearInterval(swRef.current);
  }, [swRunning, swMs]);

  // ทำงาน Timer
  useEffect(() => {
    if (!timerRunning || timerLeft <= 0) return;
    const t = setTimeout(() => {
      if (timerLeft - 1 === 0) {
        setTimerRunning(false);
        beep();
      }
      setTimerLeft(timerLeft - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [timerRunning, timerLeft]);

  // เช็คเวลาปลุก
  useEffect(() => {
    if (!now) return;
    const currentHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const hit = alarms.find((a) => a.active && a.time === currentHHMM);
    if (hit) beep();
  }, [now, alarms]);

  if (!now) return <div className="min-h-screen bg-[#0b0b0e]" />;

  // แปลงค่า Stopwatch
  const totalSec = Math.floor(swMs / 1000);
  const centi = Math.floor((swMs % 1000) / 10);
  const swFormat = `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}.${pad(centi)}`;

  // แปลงค่า Timer
  const timerM = Math.floor(timerLeft / 60);
  const timerS = timerLeft % 60;

  // เข็มนาฬิกา
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const sDeg = s * 6;
  const mDeg = m * 6 + s * 0.1;
  const hDeg = (h % 12) * 30 + m * 0.5;

  const dateStr = now.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });

  return (
    <main className="min-h-screen bg-[#0b0b0e] text-white p-6 md:p-12 font-sans selection:bg-white/20">
      {/* ส่วนหัวเว็บ */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-10 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <span className="text-xl font-bold tracking-tight">Wiggle Widgets — Clock</span>
        </div>
        <div className="text-xs text-neutral-400 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
          ระบบเวลาอัจฉริยะ
        </div>
      </header>

      {/* Bento Grid Layout แบบเว็บมินิมอลล้ำสมัย */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Widget 1: นาฬิกาหลักและวันที่ */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-white/20 transition">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-center text-neutral-400 text-sm">
            <span>Local Time</span>
            <span className="text-emerald-400 font-medium">● Active</span>
          </div>
          <div className="my-6">
            <p className="text-5xl font-black tracking-tight tabular-nums">
              {pad(h)}:{pad(m)}:<span className="text-neutral-500">{pad(s)}</span>
            </p>
            <p className="mt-2 text-sm text-neutral-400 font-medium">{dateStr}</p>
          </div>
          <div className="text-[11px] text-neutral-500">โซนเวลา: Asia/Bangkok</div>
        </div>

        {/* Widget 2: นาฬิกาอนาล็อก (เข็ม) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group hover:border-white/20 transition">
          <span className="absolute top-6 left-6 text-neutral-400 text-sm">Analog Clock</span>
          <div className="relative h-36 w-36 rounded-full border border-white/15 bg-black/40 flex items-center justify-center mt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="absolute h-full w-full flex justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                <div className="h-1.5 w-0.5 rounded-full bg-white/40" />
              </div>
            ))}
            <div className="absolute h-10 w-1 rounded-full bg-white origin-bottom" style={{ transform: `translateY(-50%) rotate(${hDeg}deg)` }} />
            <div className="absolute h-14 w-0.5 rounded-full bg-neutral-300 origin-bottom" style={{ transform: `translateY(-50%) rotate(${mDeg}deg)` }} />
            <div className="absolute h-16 w-0.5 rounded-full bg-red-400 shadow-[0_0_8px_#f87171] origin-bottom" style={{ transform: `translateY(-50%) rotate(${sDeg}deg)` }} />
            <div className="absolute h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Widget 3: เวลาโลก (World Clock) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <span className="text-neutral-400 text-sm">World Clock</span>
          <div className="space-y-3 my-4">
            {CITIES.slice(0, 2).map((c) => {
              const tStr = new Intl.DateTimeFormat("en-GB", { timeZone: c.id, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
              return (
                <div key={c.id} className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">{c.name}</p>
                    <p className="text-[10px] text-neutral-400">{c.zone}</p>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-indigo-400">{tStr}</span>
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-neutral-500">ซิงค์อัตโนมัติเรียลไทม์</span>
        </div>

        {/* Widget 4: จับเวลา (Stopwatch) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <span className="text-neutral-400 text-sm">Stopwatch</span>
          <div className="my-4 text-center">
            <p className="text-3xl font-black tabular-nums tracking-tight">{swFormat}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSwRunning(false); setSwMs(0); }}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-semibold hover:bg-white/10 transition"
            >
              รีเซ็ต
            </button>
            <button
              onClick={() => setSwRunning(!swRunning)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                swRunning ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white text-black"
              }`}
            >
              {swRunning ? "หยุด" : "เริ่ม"}
            </button>
          </div>
        </div>

        {/* Widget 5: นับถอยหลัง (Timer) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <span className="text-neutral-400 text-sm">Countdown Timer</span>
          <div className="my-4 text-center">
            {timerRunning || timerLeft > 0 ? (
              <p className="text-3xl font-black tabular-nums tracking-tight text-indigo-400">
                {pad(timerM)}:{pad(timerS)}
              </p>
            ) : (
              <div className="flex justify-center gap-1.5">
                {[30, 60, 300].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimerSec(sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      timerSec === sec ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    {sec < 60 ? `${sec}วิ` : `${sec / 60}น.`}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setTimerRunning(false); setTimerLeft(0); }}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-semibold hover:bg-white/10 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => {
                if (!timerRunning && timerLeft === 0) setTimerLeft(timerSec);
                setTimerRunning(!timerRunning);
              }}
              className="flex-1 rounded-xl bg-white text-black py-2 text-xs font-semibold hover:bg-neutral-200 transition"
            >
              {timerRunning ? "พัก" : "เริ่ม"}
            </button>
          </div>
        </div>

        {/* Widget 6: นาฬิกาปลุก (Alarm) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <span className="text-neutral-400 text-sm">Alarm Clock</span>
          <div className="my-2 space-y-2 max-h-24 overflow-y-auto pr-1">
            {alarms.map((a, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                <span className={`text-lg font-bold tabular-nums ${a.active ? "text-white" : "text-neutral-500 line-through"}`}>
                  {a.time}
                </span>
                <button
                  onClick={() => {
                    const copy = [...alarms];
                    copy[i].active = !copy[i].active;
                    setAlarms(copy);
                  }}
                  className={`w-8 h-4 rounded-full transition-colors relative ${a.active ? "bg-indigo-600" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${a.active ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="time"
              value={alarmInput}
              onChange={(e) => setAlarmInput(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />
            <button
              onClick={() => {
                if (alarmInput && !alarms.some((x) => x.time === alarmInput)) {
                  setAlarms([...alarms, { time: alarmInput, active: true }].sort((a, b) => a.time.localeCompare(b.time)));
                }
              }}
              className="flex-1 rounded-xl bg-indigo-600 text-white py-1.5 text-xs font-semibold hover:bg-indigo-500 transition"
            >
              + เพิ่ม
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}