"use client";

import { useEffect, useState } from "react";

// คืนค่า Date ปัจจุบัน อัปเดตตรงต้นทุกวินาที (null ก่อน mount เพื่อเลี่ยง hydration mismatch)
export function useNow() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    let timer;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(tick, 1000 - d.getMilliseconds() + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return now;
}