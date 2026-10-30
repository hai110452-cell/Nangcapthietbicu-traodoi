import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "./page.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CEP - Nền Tảng Trao Đổi Máy Tính & Điện Thoại Uy Tín",
  description: "Hệ thống kết nối, giao lưu và trao đổi thiết bị công nghệ: Laptop, MacBook, PC Gaming, iPhone, iPad và điện thoại Android hàng đầu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}

