"use client"

import { useState, useEffect, useCallback } from "react"
import { generatePlan, DayReading, countChaptersInReading } from "@/lib/bible-plan"
import {
  getCompletedDays,
  markDayComplete,
  markDayIncomplete,
} from "@/lib/storage"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

type Filter = "all" | "incomplete" | "completed"

export default function PlanPage() {
  const [plan, setPlan] = useState<DayReading[]>([])
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<Filter>("all")

  useEffect(() => {
    setPlan(generatePlan())
    setCompleted(getCompletedDays())
  }, [])

  const refresh = useCallback(() => {
    setCompleted(getCompletedDays())
  }, [])

  const toggleDay = (day: number) => {
    if (completed.has(day)) {
      markDayIncomplete(day)
    } else {
      markDayComplete(day)
    }
    refresh()
  }

  if (plan.length === 0) return null

  // First incomplete day
  const currentDay = plan.find((d) => !completed.has(d.day))?.day || plan.length

  // Group days by month
  const months: { name: string; days: DayReading[] }[] = []
  let dayIndex = 0
  for (let m = 0; m < 12; m++) {
    const count = DAYS_IN_MONTH[m]
    const monthDays: DayReading[] = []
    for (let i = 0; i < count && dayIndex < plan.length; i++) {
      monthDays.push(plan[dayIndex])
      dayIndex++
    }
    if (monthDays.length > 0) {
      months.push({ name: MONTHS[m], days: monthDays })
    }
  }
  // Any remaining days go into the last month
  while (dayIndex < plan.length) {
    months[months.length - 1].days.push(plan[dayIndex])
    dayIndex++
  }

  const filtered = months
    .map((m) => ({
      ...m,
      days: m.days.filter((d) => {
        if (filter === "completed") return completed.has(d.day)
        if (filter === "incomplete") return !completed.has(d.day)
        return true
      }),
    }))
    .filter((m) => m.days.length > 0)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Reading Plan</h1>
        <div className="flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
          {(["all", "incomplete", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${
                filter === f
                  ? "bg-[#8B5CF6]/15 text-[#8B5CF6]"
                  : "text-[#888] hover:text-[#E8E8E8]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((month) => (
        <div key={month.name} className="mb-8">
          <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider mb-3">
            {month.name}
          </h2>
          <div className="space-y-1">
            {month.days.map((day) => {
              const isComplete = completed.has(day.day)
              const isCurrent = day.day === currentDay
              const chapterCount = day.readings.reduce(
                (sum, r) => sum + countChaptersInReading(r),
                0
              )

              return (
                <button
                  key={day.day}
                  onClick={() => toggleDay(day.day)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors group ${
                    isCurrent && !isComplete
                      ? "bg-[#8B5CF6]/10 border border-[#8B5CF6]/20"
                      : "bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#333]"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isComplete
                        ? "bg-[#8B5CF6] border-[#8B5CF6]"
                        : "border-[#444] group-hover:border-[#666]"
                    }`}
                  >
                    {isComplete && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-white"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Day number */}
                  <span
                    className={`text-sm font-mono w-12 flex-shrink-0 ${
                      isComplete ? "text-[#555]" : "text-[#888]"
                    }`}
                  >
                    Day {day.day}
                  </span>

                  {/* Readings */}
                  <div className="flex-1 flex flex-wrap gap-2">
                    {day.readings.map((r, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          isComplete ? "text-[#555] line-through" : "text-[#E8E8E8]"
                        }`}
                      >
                        {r.book} {r.chapters}
                        {i < day.readings.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </div>

                  {/* Chapter count */}
                  <span className="text-xs text-[#555] flex-shrink-0">
                    {chapterCount} ch
                  </span>

                  {/* Current indicator */}
                  {isCurrent && !isComplete && (
                    <span className="text-xs text-[#8B5CF6] flex-shrink-0">Today</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
