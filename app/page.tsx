"use client"

import { useState, useEffect, useCallback } from "react"
import {
  generatePlan,
  getChaptersCompleted,
  getTotalChapters,
  DayReading,
} from "@/lib/bible-plan"
import {
  getCompletedDays,
  markDayComplete,
  markDayIncomplete,
  resetProgress,
} from "@/lib/storage"

function ProgressRing({
  percent,
  size = 180,
  stroke = 10,
}: {
  percent: number
  size?: number
  stroke?: number
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2A2A2A"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#8B5CF6"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  )
}

function getStreak(plan: DayReading[], completed: Set<number>): number {
  const sorted = [...completed].sort((a, b) => a - b)
  if (sorted.length === 0) return 0

  let streak = 1
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (sorted[i] === sorted[i + 1] - 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default function Dashboard() {
  const [plan, setPlan] = useState<DayReading[]>([])
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [showReset, setShowReset] = useState(false)

  useEffect(() => {
    setPlan(generatePlan())
    setCompleted(getCompletedDays())
  }, [])

  const refresh = useCallback(() => {
    setCompleted(getCompletedDays())
  }, [])

  if (plan.length === 0) return null

  const totalDays = plan.length
  const completedCount = completed.size
  const remainingCount = totalDays - completedCount
  const percent = Math.round((completedCount / totalDays) * 100)

  const chaptersRead = getChaptersCompleted(plan, completed)
  const totalChapters = getTotalChapters()

  // OT/NT progress
  let otRead = 0,
    otTotal = 0,
    ntRead = 0,
    ntTotal = 0
  const otBooks = new Set([
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles",
    "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes",
    "Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel",
    "Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
    "Zephaniah","Haggai","Zechariah","Malachi",
  ])
  for (const day of plan) {
    for (const r of day.readings) {
      const parts = r.chapters.split("-")
      const count = parts.length === 1 ? 1 : parseInt(parts[1]) - parseInt(parts[0]) + 1
      const isOT = otBooks.has(r.book)
      if (isOT) otTotal += count
      else ntTotal += count
      if (completed.has(day.day)) {
        if (isOT) otRead += count
        else ntRead += count
      }
    }
  }

  // Today's reading: first incomplete day
  const todayReading = plan.find((d) => !completed.has(d.day)) || plan[plan.length - 1]
  const isTodayComplete = completed.has(todayReading.day)

  const streak = getStreak(plan, completed)

  const handleToggleToday = () => {
    if (isTodayComplete) {
      markDayIncomplete(todayReading.day)
    } else {
      markDayComplete(todayReading.day)
    }
    refresh()
  }

  const handleReset = () => {
    resetProgress()
    refresh()
    setShowReset(false)
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={() => setShowReset(true)}
          className="text-sm text-[#888] hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1A1A1A]"
        >
          Reset Progress
        </button>
      </div>

      {/* Reset Confirmation */}
      {showReset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Reset all progress?</h3>
            <p className="text-[#888] text-sm mb-5">
              This will mark all days as incomplete. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-2 text-sm rounded-lg bg-[#222] hover:bg-[#2A2A2A] text-[#E8E8E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Ring + Stats */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 flex flex-col items-center justify-center">
          <div className="relative">
            <ProgressRing percent={percent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{percent}%</span>
              <span className="text-[#888] text-sm">complete</span>
            </div>
          </div>
          <p className="text-[#888] text-sm mt-4">
            {completedCount} days done · {remainingCount} remaining
          </p>
          <p className="text-[#888] text-xs mt-1">
            {chaptersRead} / {totalChapters} chapters
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Streak</p>
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-[#888] text-sm">consecutive days</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Old Testament</p>
            <p className="text-3xl font-bold">
              {otTotal > 0 ? Math.round((otRead / otTotal) * 100) : 0}%
            </p>
            <p className="text-[#888] text-sm">
              {otRead} / {otTotal} chapters
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-1">New Testament</p>
            <p className="text-3xl font-bold">
              {ntTotal > 0 ? Math.round((ntRead / ntTotal) * 100) : 0}%
            </p>
            <p className="text-[#888] text-sm">
              {ntRead} / {ntTotal} chapters
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-1">Total Days</p>
            <p className="text-3xl font-bold">{totalDays}</p>
            <p className="text-[#888] text-sm">in reading plan</p>
          </div>
        </div>
      </div>

      {/* Today's Reading */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#888] text-xs uppercase tracking-wider mb-1">
              {isTodayComplete ? "Completed" : "Up Next"} — Day {todayReading.day}
            </p>
            <h2 className="text-xl font-semibold">
              {isTodayComplete ? "Great work! " : ""}Today&apos;s Reading
            </h2>
          </div>
          <button
            onClick={handleToggleToday}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isTodayComplete
                ? "bg-[#222] text-[#888] hover:bg-[#2A2A2A]"
                : "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            }`}
          >
            {isTodayComplete ? "Mark Incomplete" : "Mark Complete"}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {todayReading.readings.map((r, i) => (
            <div
              key={i}
              className={`px-4 py-2.5 rounded-lg border ${
                isTodayComplete
                  ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6]"
                  : "bg-[#222] border-[#2A2A2A] text-[#E8E8E8]"
              }`}
            >
              <span className="font-medium">{r.book}</span>{" "}
              <span className="text-[#888]">{r.chapters}</span>
            </div>
          ))}
        </div>
      </div>

      <a
        href="/plan"
        className="block text-center text-[#8B5CF6] hover:text-[#7C3AED] text-sm transition-colors"
      >
        View Full Reading Plan →
      </a>
    </div>
  )
}
