import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tale Hue - Stories in Color",
  description: "A modern social platform for creating and sharing short stories with AI-generated images",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-zinc-50 dark:bg-black`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
