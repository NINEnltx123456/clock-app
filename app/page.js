"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "clock", label: "นาฬิกา", icon: "⏰" },
  { id: "world", label: "เวลาโลก", icon: "🌍" },
  { id: "stopwatch", label: "จับเวลา", icon: "⏱️" },
  { id: "timer", label: "นับถอยหลัง", icon: "⏳" },
  { id: "alarm", label: "ปลุก", icon: "🔔" },
];

const CITIES = [
  { id: "Asia/Tokyo", name: "โตเกียว", country: "ญี่ปุ่น" },
  { id: "Asia/Seoul", name: "โซล", country: "เกาหลีใต้" },
  { id: "Europe/London", name: "ลอนดอน", country: "สหราชอาณาจักร" },
  { id: "Europe/Paris", name: "ปารีส", country: "ฝรั่งเศส" },
  { id: "America/New_York", name: "นิวยอร์ก", country: "สหรัฐอเมริกา" },
  { id: "America/Los_Angeles", name: "ลอสแอนเจลิส", country: "สหรัฐอเมริกา" },
  { id: "Australia/Sydney", name: "ซิดนีย์", country: "ออสเตรเลีย" },
];

const pad = (n) => String(n).padStart(2, "0");

// ระบบเสียงเตือนนุ่มนวล
function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.25 + 0.2);
      osc.stop(ctx.currentTime + i * 0.25 + 0.2);
    }
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
      const saved = localStorage.getItem("app_dark");
      if (saved !== null) setDark(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("app_dark", JSON.stringify(dark));
    } catch {}
  }, [dark]);

  if (!now) return <div className="min-h-screen bg-[#0a0a0c]" />;

  return (
    <div className={dark ? "dark" : ""}>
      <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 selection:bg-indigo-500 selection:text-white dark:bg-[#0a0a0c]">
        
        {/* แสงนีออนพื้นหลังสไตล์โมเดิร์น */}
        <div className="absolute top-0 -left-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 -right-20 h-72 w-72 rounded-full bg-sky-500/15 blur-[100px] pointer-events-none" />

        {/* ส่วนหัว */}
        <header className="z-10 flex w-full max-w-md items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 shadow-lg shadow-indigo-500/30 text-xs font-bold text-white">
              ⌛
            </div>
            <h1 className="text-base font-bold tracking-wide text-slate-200">Chronos Mobile</h1>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium backdrop-blur-xl transition hover:bg-white/10 active:scale-95"
          >
            {dark ? "☀️ โหมดสว่าง" : "🌙 โหมดมืด"}
          </button>
        </header>

        {/* พื้นที่แสดงคอนเทนต์หลัก */}
        <section className="z-10 my-auto flex w-full max-w-md flex-col items-center justify-center py-6">
          {tab === "clock" && <TabClock now={now} />}
          {tab === "world" && <TabWorld now={now} />}
          {tab === "stopwatch" && <TabStopwatch />}
          {tab === "timer" && <TabTimer />}
          {tab === "alarm" && <TabAlarm now={now} />}
        </section>

        {/* แถบเมนูด้านล่าง (Mobile Navigation Bar) */}
        <nav className="z-10 grid w-full max-w-md grid-cols-5 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-2xl shadow-2xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-[10px] font-medium transition-all duration-300 ${
                tab === t.id
                  ? "bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/25 scale-105"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className="text-sm mb-0.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

      </main>
    </div>
  );
}

// 1. แท็บนาฬิกา (สลับได้ระหว่าง ดิจิทัล / อนาล็อก)
function TabClock({ now }) {
  const [mode, setMode] = useState("digital"); // digital | analog

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  const dateStr = now.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // คำนวณเข็มนาฬิกา
  const sDeg = s * 6;
  const mDeg = m * 6 + s * 0.1;
  const hDeg = (h % 12) * 30 + m * 0.5;

  return (
    <div className="flex flex-col items-center w-full animate-fade-in">
      {/* ปุ่มสลับมุมมอง */}
      <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
        <button
          onClick={() => setMode("digital")}
          className={`rounded-full px-5 py-1.5 text-xs font-semibold transition ${
            mode === "digital" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          }`}
        >
          ดิจิทัล
        </button>
        <button
          onClick={() => setMode("analog")}
          className={`rounded-full px-5 py-1.5 text-xs font-semibold transition ${
            mode === "analog" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          }`}
        >
          อนาล็อก
        </button>
      </div>

      {mode === "digital" ? (
        <div className="flex flex-col items-center">
          <div className="relative rounded-3xl border border-white/10 bg-white/5 px-8 py-12 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-center w-full">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-transparent to-sky-500/10 pointer-events-none" />
            <p className="text-6xl font-black tracking-wider tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              {pad(h)}:{pad(m)}:
              <span className="text-sky-400">{pad(s)}</span>
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-indigo-400">
              {h >= 12 ? "PM หลังเที่ยง" : "AM ก่อนเที่ยง"}
            </p>
          </div>
          <p className="mt-6 text-sm font-medium tracking-wide text-slate-300">{dateStr}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative h-64 w-64 rounded-full border border-white/15 bg-white/5 p-4 backdrop-blur-2xl shadow-2xl flex items-center justify-center">
            {/* ขีดนาฬิกา */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="absolute h-full w-full flex justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                <div className="h-2.5 w-1 rounded-full bg-white/40" />
              </div>
            ))}
            {/* เข็มชั่วโมง */}
            <div className="absolute h-16 w-1.5 rounded-full bg-white origin-bottom shadow-md" style={{ transform: `translateY(-50%) rotate(${hDeg}deg)` }} />
            {/* เข็มนาที */}
            <div className="absolute h-24 w-1 rounded-full bg-slate-300 origin-bottom shadow-md" style={{ transform: `translateY(-50%) rotate(${mDeg}deg)` }} />
            {/* เข็มวินาที */}
            <div className="absolute h-28 w-0.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] origin-bottom" style={{ transform: `translateY(-50%) rotate(${sDeg}deg)` }} />
            {/* จุดตรงกลาง */}
            <div className="absolute h-3.5 w-3.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30 shadow-lg" />
          </div>
          <p className="mt-6 text-sm font-medium tracking-wide text-slate-300">{dateStr}</p>
        </div>
      )}
    </div>
  );
}

// 2. แท็บเวลาโลก (World Clock)
function TabWorld({ now }) {
  const [list, setList] = useState(["Asia/Tokyo", "Europe/London", "America/New_York"]);

  const addCity = (e) => {
    const val = e.target.value;
    if (val && !list.includes(val)) setList([...list, val]);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col w-full space-y-3 animate-fade-in">
      <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
        {list.map((id) => {
          const cityInfo = CITIES.find((c) => c.id === id) || { name: id, country: "ต่างประเทศ" };
          const timeStr = new Intl.DateTimeFormat("en-GB", {
            timeZone: id,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(now);

          return (
            <div key={id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-xl shadow-lg">
              <div>
                <p className="font-semibold text-white">{cityInfo.name}</p>
                <p className="text-xs text-slate-400">{cityInfo.country}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold tabular-nums text-sky-400">{timeStr}</span>
                <button
                  onClick={() => setList(list.filter((x) => x !== id))}
                  className="text-xs text-slate-500 hover:text-red-400 transition"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <select
        onChange={addCity}
        defaultValue=""
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none backdrop-blur-xl focus:border-indigo-500 cursor-pointer"
      >
        <option value="" disabled className="bg-slate-900">+ เพิ่มเมืองหลวงอื่น ๆ</option>
        {CITIES.filter((c) => !list.includes(c.id)).map((c) => (
          <option key={c.id} value={c.id} className="bg-slate-900">
            {c.name} ({c.country})
          </option>
        ))}
      </select>
    </div>
  );
}

// 3. แท็บจับเวลา (Stopwatch)
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
    <div className="flex flex-col items-center w-full animate-fade-in">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-2xl shadow-xl w-full text-center">
        <p className="text-6xl font-black tracking-wider tabular-nums text-white">{format}</p>
      </div>
      
      <div className="mt-6 flex gap-3 w-full">
        <button
          onClick={running ? addLap : reset}
          disabled={!running && ms === 0}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold backdrop-blur-md disabled:opacity-30 transition hover:bg-white/10 active:scale-95"
        >
          {running ? "บันทึกรอบ (Lap)" : "รีเซ็ต"}
        </button>
        <button
          onClick={() => setRunning(!running)}
          className={`flex-1 rounded-2xl py-3.5 text-sm font-semibold transition active:scale-95 shadow-lg ${
            running
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-indigo-500/25"
          }`}
        >
          {running ? "หยุด" : "เริ่ม"}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-4 max-h-32 w-full overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md space-y-1.5">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between text-xs font-medium text-slate-300 px-2 py-1 border-b border-white/5">
              <span className="text-slate-500">รอบที่ {laps.length - i}</span>
              <span className="tabular-nums font-bold text-sky-400">{lap}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 4. แท็บนับถอยหลัง (Timer)
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
    <div className="flex flex-col items-center w-full animate-fade-in">
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
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {sec < 60 ? `${sec} วิ` : `${sec / 60} นาที`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3 w-full">
        <button
          onClick={() => { setRunning(false); setLeft(0); }}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/10 active:scale-95"
        >
          ยกเลิก
        </button>
        <button
          onClick={running ? () => setRunning(false) : start}
          className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
        >
          {running ? "พัก" : "เริ่ม"}
        </button>
      </div>
    </div>
  );
}

// 5. แท็บนาฬิกาปลุก (Alarm)
function TabAlarm({ now }) {
  const [alarms, setAlarms] = useState([
    { time: "07:00", active: true },
    { time: "08:30", active: false },
  ]);
  const [input, setInput] = useState("06:30");

  const currentHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  useEffect(() => {
    const hit = alarms.find((a) => a.active && a.time === currentHHMM);
    if (hit) beep();
  }, [currentHHMM, alarms]);

  const addAlarm = () => {
    if (input && !alarms.some((a) => a.time === input)) {
      setAlarms([...alarms, { time: input, active: true }].sort((a, b) => a.time.localeCompare(b.time)));
    }
  };

  const toggleAlarm = (index) => {
    const updated = [...alarms];
    updated[index].active = !updated[index].active;
    setAlarms(updated);
  };

  return (
    <div className="flex flex-col items-center w-full space-y-4 animate-fade-in">
      <div className="flex gap-2 w-full">
        <input
          type="time"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-semibold tabular-nums text-white outline-none backdrop-blur-md focus:border-indigo-500"
        />
        <button
          onClick={addAlarm}
          className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
        >
          เพิ่มปลุก
        </button>
      </div>

      <div className="w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {alarms.map((item, index) => (
          <div key={index} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-xl">
            <div>
              <span className={`text-2xl font-bold tabular-nums tracking-wide ${item.active ? "text-white" : "text-slate-500 line-through"}`}>
                {item.time}
              </span>
              <p className="text-[10px] text-slate-400">{item.active ? "เปิดใช้งานอยู่" : "ปิดการใช้งาน"}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Toggle Switch จำลองสไตล์มือถือ */}
              <button
                onClick={() => toggleAlarm(index)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.active ? "bg-indigo-600" : "bg-white/10"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <button
                onClick={() => setAlarms(alarms.filter((_, i) => i !== index))}
                className="text-xs text-slate-500 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}