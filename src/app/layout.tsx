import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "奥克兰超市比价 | Auckland Grocery Compare",
  description: "搜索奥克兰超市商品价格，找到最便宜的购买选择",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "超市比价",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  );
}
