"use client";

import { useEffect, useRef, useState } from "react";

const CITIES = [
  { id: "Asia/Bangkok", name: "Bangkok", country: "Thailand" },
  { id: "Asia/Tokyo", name: "Tokyo", country: "Japan" },
  { id: "Europe/London", name: "London", country: "UK" },
  { id: "America/New_York", name: "New York", country: "USA" },
  { id: "Australia/Sydney", name: "Sydney", country: "Australia" },
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

export default function WiggleDashboard() {
  const [now, setNow] = useState(null);

  // 1. เวลาโลก (World Clock Selection)
  const [selectedCity, setSelectedCity] = useState("Asia/Bangkok");

  // 2. จับเวลา (Stopwatch)
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swRef = useRef(null);

  // 3. นับถอยหลัง (Timer)
  const [timerSec, setTimerSec] = useState(60);
  const [timerLeft, setTimerLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // 4. นาฬิกาปลุก (Alarm)
  const [alarms, setAlarms] = useState([
    { time: "07:00", active: true },
    { time: "08:30", active: false },
  ]);
  const [alarmInput, setAlarmInput] = useState("09:00");

  // อัปเดตเวลาเรียลไทม์
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ควบคุม Stopwatch
  useEffect(() => {
    if (!swRunning) return;
    const start = Date.now() - swMs;
    swRef.current = setInterval(() => setSwMs(Date.now() - start), 30);
    return () => clearInterval(swRef.current);
  }, [swRunning, swMs]);

  // ควบคุม Timer
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

  // ตรวจสอบเวลาปลุก
  useEffect(() => {
    if (!now) return;
    const currentHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const hit = alarms.find((a) => a.active && a.time === currentHHMM);
    if (hit) beep();
  }, [now, alarms]);

  if (!now) return <div className="min-h-screen bg-[#09090b]" />;

  // คำนวณ Stopwatch format
  const swTotalSec = Math.floor(swMs / 1000);
  const swCenti = Math.floor((swMs % 1000) / 10);
  const swFormat = `${pad(Math.floor(swTotalSec / 60))}:${pad(swTotalSec % 60)}.${pad(swCenti)}`;

  // คำนวณ Timer format
  const timerM = Math.floor(timerLeft / 60);
  const timerS = timerLeft % 60;

  // เข็มนาฬิกา Analog
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const sDeg = s * 6;
  const mDeg = m * 6 + s * 0.1;
  const hDeg = (h % 12) * 30 + m * 0.5;

  // เวลาโลกของเมืองที่เลือก
  const worldTimeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: selectedCity,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const dayStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" });
  const dateNum = now.getDate();
  const monthName = now.toLocaleDateString("en-US", { month: "short" });
  const weekDayName = now.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 font-sans selection:bg-white/20 p-6 md:p-10">
      
      {/* ─── ส่วนหัวเว็บไซต์ (Header แบบในภาพ) ─── */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-8 mb-10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-md border border-white/40 flex items-center justify-center bg-white/5">
            <div className="h-2 w-2 bg-white rounded-sm" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Wiggle UI</span>
          <span className="text-neutral-500 text-sm ml-2">Widgets</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
          <span className="hover:text-white cursor-pointer transition">Widgets</span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white">
            <span>✨</span> Give us a Star
          </div>
        </div>
      </header>

      {/* ─── ข้อความพาดหัว ─── */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          The first ever collection of Widgets for the Web.
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          An open-source curated collection of interactive widgets for your next project.
        </p>
      </div>

      {/* ─── Bento Grid Dashboard (4 ฟังก์ชันหลัก) ─── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* 1. วิดเจ็ตแสดงวันที่และปฏิทินย่อ (สไตล์การ์ดซ้ายสุดในภาพ) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-white/20 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-red-400 uppercase tracking-wider">{weekDayName} {monthName}</span>
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="py-6">
            <p className="text-6xl font-black tracking-tighter tabular-nums text-white">{pad(dateNum)}</p>
          </div>
          <div className="flex justify-between items-center text-xs text-neutral-400 border-t border-white/5 pt-3">
            <span>Local Calendar</span>
            <span className="text-white font-semibold">Ready</span>
          </div>
        </div>

        {/* 2. วิดเจ็ตนาฬิกาอนาล็อก (เข็ม) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden group hover:border-white/20 transition">
          <div className="w-full flex justify-between items-center text-xs text-neutral-400">
            <span>Analog Clock</span>
            <span>{pad(h)}:{pad(m)}</span>
          </div>
          
          <div className="relative h-32 w-32 rounded-full border border-white/15 bg-black/40 flex items-center justify-center my-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="absolute h-full w-full flex justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                <div className="h-1.5 w-0.5 rounded-full bg-white/40" />
              </div>
            ))}
            {/* เข็มชั่วโมง */}
            <div className="absolute h-9 w-1 rounded-full bg-white origin-bottom" style={{ transform: `translateY(-50%) rotate(${hDeg}deg)` }} />
            {/* เข็มนาที */}
            <div className="absolute h-12 w-0.5 rounded-full bg-neutral-300 origin-bottom" style={{ transform: `translateY(-50%) rotate(${mDeg}deg)` }} />
            {/* เข็มวินาที */}
            <div className="absolute h-14 w-0.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] origin-bottom" style={{ transform: `translateY(-50%) rotate(${sDeg}deg)` }} />
            <div className="absolute h-2 w-2 rounded-full bg-red-500" />
          </div>

          <div className="w-full text-center text-[11px] text-neutral-500">Real-time sweep</div>
        </div>

        {/* 3. วิดเจ็ตเวลาโลก (World Clock เลือกเมืองได้) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-neutral-400">World Clock</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121216]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="my-4">
            <p className="text-4xl font-extrabold tracking-tight tabular-nums text-white">
              {worldTimeStr}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {CITIES.find(c => c.id === selectedCity)?.name}, {CITIES.find(c => c.id === selectedCity)?.country}
            </p>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Zone
          </div>
        </div>

        {/* 4. วิดเจ็ตจับเวลา (Stopwatch) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <span className="text-xs font-medium text-neutral-400">Stopwatch</span>
          <div className="my-4 text-center">
            <p className="text-3xl font-black tabular-nums tracking-tight text-white">{swFormat}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSwRunning(false); setSwMs(0); }}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-semibold hover:bg-white/10 transition active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={() => setSwRunning(!swRunning)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition active:scale-95 ${
                swRunning ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {swRunning ? "Stop" : "Start"}
            </button>
          </div>
        </div>

        {/* 5. วิดเจ็ตนับถอยหลัง (Timer) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition">
          <span className="text-xs font-medium text-neutral-400">Countdown Timer</span>
          <div className="my-3 text-center">
            {timerRunning || timerLeft > 0 ? (
              <p className="text-3xl font-black tabular-nums tracking-tight text-indigo-400">
                {pad(timerM)}:{pad(timerS)}
              </p>
            ) : (
              <div className="flex justify-center gap-1">
                {[30, 60, 300].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimerSec(sec)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                      timerSec === sec ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-neutral-400"
                    }`}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setTimerRunning(false); setTimerLeft(0); }}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-semibold hover:bg-white/10 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!timerRunning && timerLeft === 0) setTimerLeft(timerSec);
                setTimerRunning(!timerRunning);
              }}
              className="flex-1 rounded-xl bg-white text-black py-2 text-xs font-semibold hover:bg-neutral-200 transition active:scale-95"
            >
              {timerRunning ? "Pause" : "Start"}
            </button>
          </div>
        </div>

        {/* 6. วิดเจ็ตนาฬิกาปลุก (Alarm Clock) */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 lg:col-span-2 transition">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-neutral-400">Alarm Manager</span>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={alarmInput}
                onChange={(e) => setAlarmInput(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
              />
              <button
                onClick={() => {
                  if (alarmInput && !alarms.some((x) => x.time === alarmInput)) {
                    setAlarms([...alarms, { time: alarmInput, active: true }].sort((a, b) => a.time.localeCompare(b.time)));
                  }
                }}
                className="rounded-xl bg-white text-black px-3 py-1 text-xs font-semibold hover:bg-neutral-200 transition"
              >
                + Add
              </button>
            </div>
          </div>
          
          <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1">
            {alarms.map((a, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                <span className={`text-xl font-bold tabular-nums ${a.active ? "text-white" : "text-neutral-500 line-through"}`}>
                  {a.time}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const copy = [...alarms];
                      copy[i].active = !copy[i].active;
                      setAlarms(copy);
                    }}
                    className={`w-8 h-4 rounded-full transition-colors relative ${a.active ? "bg-emerald-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${a.active ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                  <button
                    onClick={() => setAlarms(alarms.filter((_, idx) => idx !== i))}
                    className="text-neutral-500 hover:text-red-400 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-neutral-500">System will sound an alert when time matches.</div>
        </div>

        {/* 7. วิดเจ็ตเสริมปิดท้ายสไตล์ Weather/Status */}
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-white/20 transition">
          <span className="text-xs font-medium text-neutral-400">System Status</span>
          <div>
            <p className="text-3xl font-extrabold text-white">Online</p>
            <p className="text-xs text-emerald-400 mt-1">● Synced with Vercel Edge</p>
          </div>
          <div className="text-[11px] text-neutral-500">Wiggle UI v2.0</div>
        </div>

      </div>
    </div>
  );
}