"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Journey", href: "/journey" },
];

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="w-full border-b border-gray-800 bg-black px-4 sm:px-6 py-3 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <Image
              src="/assets/logos/Container.png"
              alt="Flightime"
              width={160}
              height={40}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-6 text-sm text-gray-300 items-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors ${pathname === link.href ? "text-purple-400" : "text-gray-300 hover:text-white"}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar overlay + drawer — only mounted when open */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 z-[9999] h-full w-64 bg-black shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
              <Image
                src="/assets/logos/Container.png"
                alt="Flightime"
                width={110}
                height={28}
                className="h-6 w-auto"
              />
              <button
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col px-4 py-4 gap-3 items-center">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`py-2 px-2 rounded-md text-sm transition-colors ${pathname === link.href ? "text-purple-400" : "text-gray-300 hover:text-white hover:bg-gray-800"}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
