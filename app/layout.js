import "./globals.css";
import { Noto_Sans_Thai } from "next/font/google";

const noto = Noto_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Clock",
  description: "นาฬิกา เวลาโลก จับเวลา นับถอยหลัง และปลุก",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={noto.className}>{children}</body>
    </html>
  );
}