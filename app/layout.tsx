import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Hub - Wheel of Fortune",
  description: "Spin to win exciting prizes!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        {/* Pink/purple ambient glow lights */}
        <div className="pink-glow bg-pink-500/20" style={{ top: '-5%', left: '-10%' }} />
        <div className="pink-glow bg-purple-500/15" style={{ top: '10%', right: '-15%' }} />
        <div className="pink-glow bg-fuchsia-500/10" style={{ bottom: '20%', left: '50%', transform: 'translateX(-50%)' }} />
        
        <div className="relative z-10">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
