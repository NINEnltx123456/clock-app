"use client";

import { useState } from "react";
import { beep, unlockAudio } from "../lib/sound";

export default function AlarmTab({ alarms = [], setAlarms, card, primary }) {

  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");

  function add() {
    if (!time) return;
    unlockAudio();
    beep(1);
    setAlarms((prev) =>
      [...prev, { id: Date.now(), time, label: label.trim(), on: true }].sort((a, b) =>
        a.time.localeCompare(b.time)
      )
    );
    setLabel("");
  }

  return (
    <section className="space-y-4">
      <div className={`${card} flex flex-wrap items-center gap-3 p-4`}>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl bg-black/5 px-3 py-2 text-2xl font-semibold tabular-nums outline-none dark:bg-white/10"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ชื่อการปลุก (ไม่บังคับ)"
          className="min-w-0 flex-1 rounded-xl bg-black/5 px-3 py-3 text-sm outline-none dark:bg-white/10"
        />
        <button onClick={add} className={primary}>เพิ่ม</button>
      </div>

      {alarms.length === 0 ? (
        <p className="py-8 text-center text-sm opacity-55">ยังไม่มีนาฬิกาปลุก</p>
      ) : (
        <ul className="space-y-3">
          {alarms.map((a) => (
            <li key={a.id} className={`${card} flex items-center justify-between px-5 py-4`}>
              <div className={a.on ? "" : "opacity-45"}>
                <p className="text-3xl font-semibold tabular-nums">{a.time}</p>
                <p className="text-xs opacity-65">{a.label || "ปลุกทุกวัน"}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  role="switch"
                  aria-checked={a.on}
                  aria-label="เปิด/ปิดการปลุก"
                  onClick={() =>
                    setAlarms((prev) => prev.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x)))
                  }
                  className={`relative h-7 w-12 rounded-full transition ${a.on ? "bg-emerald-500" : "bg-black/20 dark:bg-white/20"}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${a.on ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
                <button
                  aria-label="ลบ"
                  onClick={() => setAlarms((prev) => prev.filter((x) => x.id !== a.id))}
                  className="p-1 opacity-45 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs opacity-45">ต้องเปิดหน้านี้ค้างไว้ในเบราว์เซอร์ เสียงปลุกถึงจะดัง</p>
    </section>
  );
}