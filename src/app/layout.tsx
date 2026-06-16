import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Server Dashboard",
  description: "Monitoring and panel for home server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b1120] text-slate-200 h-screen overflow-hidden`}
    >
      <body className="h-full w-full flex flex-row overflow-hidden">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto relative">
          {/* Background Glows for the whole app */}
          <div className="fixed top-0 left-64 w-full h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
