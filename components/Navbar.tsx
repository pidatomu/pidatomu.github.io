"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Buat Naskah" },
    { href: "/histori", label: "Riwayat" },
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
              className={`navbar-link ${pathname === link.href ? "navbar-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Badge MBS */}
        <span className="navbar-badge">MBS Tanggul</span>
      </div>
    </nav>
  );
}
