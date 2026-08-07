"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, History } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Buat Naskah", icon: <PenLine className="w-3 h-3" /> },
    { href: "/histori", label: "Riwayat", icon: <History className="w-3 h-3" /> },
  ];

  return (
    <nav className="navbar no-print">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          PIDATOMU
          <span className="navbar-logo-dot">.</span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link inline-flex items-center gap-1.5 ${pathname === link.href ? "navbar-link--active" : ""}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Dark Mode Toggle */}
        <DarkModeToggle compact />

        {/* Badge MBS */}
        <span className="navbar-badge">MBS Tanggul</span>
      </div>
    </nav>
  );
}
