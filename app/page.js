"use client";

import dynamic from "next/dynamic";

const ClockApp = dynamic(() => import("./components/ClockApp"), { ssr: false });

export default function Page() {
  return <ClockApp />;
}
