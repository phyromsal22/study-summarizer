import type { Metadata } from "next";
import { Kantumruy_Pro, Inter } from "next/font/google";
import "./globals.css";

const khmerFont = Kantumruy_Pro({ 
  subsets: ["khmer"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-khmer",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StudyAI - សង្ខេបមេរៀនឆ្លាតវៃ",
  description: "ប្រព័ន្ធសង្ខេបមេរៀន និងបង្កើតតេស្តដោយ AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body className={`${khmerFont.variable} ${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}