"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/plan", label: "Reading Plan", icon: "📅" },
  { href: "/books", label: "Books", icon: "📚" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col z-10">
      <div className="p-5 border-b border-[#2A2A2A]">
        <Link href="/" className="flex items-center gap-2 text-[#E8E8E8] font-semibold text-lg">
          <span>📖</span>
          <span>Bible Plan</span>
        </Link>
      </div>
      <nav className="flex-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                active
                  ? "bg-[#8B5CF6]/15 text-[#8B5CF6]"
                  : "text-[#888] hover:text-[#E8E8E8] hover:bg-[#222]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
