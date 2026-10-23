import type { Metadata, Viewport } from "next";
import { Kantumruy_Pro, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const khmerFont = Kantumruy_Pro({ 
  subsets: ["khmer"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-khmer",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StudyAI - សង្ខេបមេរៀនឆ្លាតវៃ",
  description: "ប្រព័ន្ធសង្ខេបមេរៀន និងបង្កើតតេស្តដោយ AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyAI",
  },
};

// 👇 បន្ថែម viewportFit: "cover" ដើម្បីឱ្យវាលាតដល់គែមអេក្រង់
export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body className={`${khmerFont.variable} ${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}