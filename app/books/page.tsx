"use client"

import { useState, useEffect } from "react"
import {
  generatePlan,
  getBooks,
  getBookProgress,
  getDaysForBook,
  DayReading,
} from "@/lib/bible-plan"
import { getCompletedDays } from "@/lib/storage"

export default function BooksPage() {
  const [plan, setPlan] = useState<DayReading[]>([])
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [selectedBook, setSelectedBook] = useState<string | null>(null)

  useEffect(() => {
    setPlan(generatePlan())
    setCompleted(getCompletedDays())
  }, [])

  if (plan.length === 0) return null

  const books = getBooks()

  const selectedDays = selectedBook ? getDaysForBook(plan, selectedBook) : []

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Books of the Bible</h1>

      {/* Testament Sections */}
      {(["OT", "NT"] as const).map((testament) => {
        const testamentBooks = books.filter((b) => b.testament === testament)
        return (
          <div key={testament} className="mb-10">
            <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider mb-4">
              {testament === "OT" ? "Old Testament" : "New Testament"} —{" "}
              {testamentBooks.length} books
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {testamentBooks.map((book) => {
                const { read, total } = getBookProgress(plan, book.name, completed)
                const pct = total > 0 ? Math.round((read / total) * 100) : 0
                const status =
                  pct === 100 ? "complete" : pct > 0 ? "in-progress" : "not-started"

                return (
                  <button
                    key={book.name}
                    onClick={() =>
                      setSelectedBook(selectedBook === book.name ? null : book.name)
                    }
                    className={`relative rounded-xl p-4 text-left transition-all border ${
                      selectedBook === book.name
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                        : status === "complete"
                          ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
                          : status === "in-progress"
                            ? "border-[#8B5CF6]/30 bg-[#8B5CF6]/5 hover:bg-[#8B5CF6]/10"
                            : "border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222]"
                    }`}
                  >
                    <p
                      className={`font-medium text-sm mb-1 ${
                        status === "complete" ? "text-green-400" : "text-[#E8E8E8]"
                      }`}
                    >
                      {book.name}
                    </p>
                    <p className="text-xs text-[#888]">{book.chapters} chapters</p>

                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          status === "complete" ? "bg-green-500" : "bg-[#8B5CF6]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#666] mt-1">
                      {read}/{total} · {pct}%
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Selected Book Detail */}
      {selectedBook && (
        <div className="fixed bottom-0 left-0 right-0 md:left-56 bg-[#1A1A1A] border-t border-[#2A2A2A] p-5 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{selectedBook}</h3>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-[#888] hover:text-[#E8E8E8] text-sm"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-[#888] mb-2">
              Covered in {selectedDays.length} day{selectedDays.length !== 1 ? "s" : ""}:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDays.map((d) => (
                <a
                  key={d}
                  href="/plan"
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    completed.has(d)
                      ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6]"
                      : "bg-[#222] border-[#2A2A2A] text-[#888] hover:text-[#E8E8E8]"
                  }`}
                >
                  Day {d} {completed.has(d) ? "✓" : ""}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
