"use client";

import { useEffect, useState } from "react";

export function useStored(key, initial) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        // กันค่าเก่าที่ชนิดไม่ตรงกับค่าเริ่มต้น
        if (Array.isArray(initial) ? Array.isArray(parsed) : parsed !== null && parsed !== undefined) {
          setValue(parsed);
        }
      }
    } catch {}
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, ready]);

  return [value, setValue];
}