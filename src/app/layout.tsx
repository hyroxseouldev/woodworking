import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/providers/ReduxProvider";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "조은나무 목재재단 서비스 | 온라인 목재 주문 플랫폼",
  description: "온라인 목재 재단 및 가공 주문 플랫폼. DIY 목공 애호가와 소상공인을 위한 맞춤형 목재 서비스를 제공합니다.",
  keywords: ["목재", "재단", "가공", "DIY", "목공", "온라인 주문", "조은나무"],
  authors: [{ name: "조은나무" }],
  openGraph: {
    title: "조은나무 목재재단 서비스",
    description: "온라인 목재 재단 및 가공 주문 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
