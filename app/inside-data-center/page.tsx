import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Trophy } from "lucide-react";
import InsideExplorer from "./inside-explorer";
import "./inside.css";

export const metadata: Metadata = {
  title: "Inside Data Center — AI Infrastructure Atlas",
  description: "Explore the GPU racks, CPUs, networking, cooling, and power systems inside a modern AI data center.",
};

export default function InsideDataCenterPage() {
  return (
    <main className="inside-page">
      <header className="inside-header">
        <Link href="/" className="inside-back"><ArrowLeft size={16} /> Back to atlas</Link>
        <span className="inside-brand">Inside Data Center</span>
        <nav><Link href="/top-data-centers"><Trophy size={14} /> Top list</Link><Link href="/guide"><BookOpen size={14} /> MW &amp; GW</Link></nav>
      </header>
      <InsideExplorer />
    </main>
  );
}
