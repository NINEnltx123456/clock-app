import "./globals.css";

export const metadata = {
  title: "Clock App",
  description: "แอปพลิเคชันนาฬิกา",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}