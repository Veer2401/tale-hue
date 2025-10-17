"use client";
import Link from "next/link";
import { Home, User, PlusSquare, Search } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-col gap-3 p-4 border-r border-white/10 min-h-screen sticky top-0 glass">
      <Link href="/" className="text-xl font-semibold mb-2 neon">Tale Hue</Link>
      <nav className="flex flex-col gap-1">
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 hover-card" href="/"><Home size={18}/> Home</Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 hover-card" href="/compose"><PlusSquare size={18}/> Create</Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 hover-card" href="/search"><Search size={18}/> Search</Link>
        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 hover-card" href="/profile"><User size={18}/> Profile</Link>
      </nav>
    </aside>
  );
}


