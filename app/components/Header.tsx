"use client";

import { useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Flights", href: "/flights" },
  { label: "Schedule", href: "/schedule" },
  { label: "Routes", href: "/routes" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <nav className="hidden md:flex gap-6 text-sm text-gray-300">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
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
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-black shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
              <Image
                src="/assets/logos/Container.png"
                alt="Flightime"
                width={160}
                height={40}
                className="h-8 w-auto"
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
            <nav className="flex flex-col px-4 py-4 gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-2 px-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
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
