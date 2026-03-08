export type Reading = {
  book: string
  chapters: string
}

export type DayReading = {
  day: number
  readings: Reading[]
  completed: boolean
}

// All 66 books with chapter counts in canonical order
const BOOKS: { name: string; chapters: number; testament: "OT" | "NT" }[] = [
  // Old Testament (39 books)
  { name: "Genesis", chapters: 50, testament: "OT" },
  { name: "Exodus", chapters: 40, testament: "OT" },
  { name: "Leviticus", chapters: 27, testament: "OT" },
  { name: "Numbers", chapters: 36, testament: "OT" },
  { name: "Deuteronomy", chapters: 34, testament: "OT" },
  { name: "Joshua", chapters: 24, testament: "OT" },
  { name: "Judges", chapters: 21, testament: "OT" },
  { name: "Ruth", chapters: 4, testament: "OT" },
  { name: "1 Samuel", chapters: 31, testament: "OT" },
  { name: "2 Samuel", chapters: 24, testament: "OT" },
  { name: "1 Kings", chapters: 22, testament: "OT" },
  { name: "2 Kings", chapters: 25, testament: "OT" },
  { name: "1 Chronicles", chapters: 29, testament: "OT" },
  { name: "2 Chronicles", chapters: 36, testament: "OT" },
  { name: "Ezra", chapters: 10, testament: "OT" },
  { name: "Nehemiah", chapters: 13, testament: "OT" },
  { name: "Esther", chapters: 10, testament: "OT" },
  { name: "Job", chapters: 42, testament: "OT" },
  { name: "Psalms", chapters: 150, testament: "OT" },
  { name: "Proverbs", chapters: 31, testament: "OT" },
  { name: "Ecclesiastes", chapters: 12, testament: "OT" },
  { name: "Song of Solomon", chapters: 8, testament: "OT" },
  { name: "Isaiah", chapters: 66, testament: "OT" },
  { name: "Jeremiah", chapters: 52, testament: "OT" },
  { name: "Lamentations", chapters: 5, testament: "OT" },
  { name: "Ezekiel", chapters: 48, testament: "OT" },
  { name: "Daniel", chapters: 12, testament: "OT" },
  { name: "Hosea", chapters: 14, testament: "OT" },
  { name: "Joel", chapters: 3, testament: "OT" },
  { name: "Amos", chapters: 9, testament: "OT" },
  { name: "Obadiah", chapters: 1, testament: "OT" },
  { name: "Jonah", chapters: 4, testament: "OT" },
  { name: "Micah", chapters: 7, testament: "OT" },
  { name: "Nahum", chapters: 3, testament: "OT" },
  { name: "Habakkuk", chapters: 3, testament: "OT" },
  { name: "Zephaniah", chapters: 3, testament: "OT" },
  { name: "Haggai", chapters: 2, testament: "OT" },
  { name: "Zechariah", chapters: 14, testament: "OT" },
  { name: "Malachi", chapters: 4, testament: "OT" },
  // New Testament (27 books)
  { name: "Matthew", chapters: 28, testament: "NT" },
  { name: "Mark", chapters: 16, testament: "NT" },
  { name: "Luke", chapters: 24, testament: "NT" },
  { name: "John", chapters: 21, testament: "NT" },
  { name: "Acts", chapters: 28, testament: "NT" },
  { name: "Romans", chapters: 16, testament: "NT" },
  { name: "1 Corinthians", chapters: 16, testament: "NT" },
  { name: "2 Corinthians", chapters: 13, testament: "NT" },
  { name: "Galatians", chapters: 6, testament: "NT" },
  { name: "Ephesians", chapters: 6, testament: "NT" },
  { name: "Philippians", chapters: 4, testament: "NT" },
  { name: "Colossians", chapters: 4, testament: "NT" },
  { name: "1 Thessalonians", chapters: 5, testament: "NT" },
  { name: "2 Thessalonians", chapters: 3, testament: "NT" },
  { name: "1 Timothy", chapters: 6, testament: "NT" },
  { name: "2 Timothy", chapters: 4, testament: "NT" },
  { name: "Titus", chapters: 3, testament: "NT" },
  { name: "Philemon", chapters: 1, testament: "NT" },
  { name: "Hebrews", chapters: 13, testament: "NT" },
  { name: "James", chapters: 5, testament: "NT" },
  { name: "1 Peter", chapters: 5, testament: "NT" },
  { name: "2 Peter", chapters: 3, testament: "NT" },
  { name: "1 John", chapters: 5, testament: "NT" },
  { name: "2 John", chapters: 1, testament: "NT" },
  { name: "3 John", chapters: 1, testament: "NT" },
  { name: "Jude", chapters: 1, testament: "NT" },
  { name: "Revelation", chapters: 22, testament: "NT" },
]

export function getBooks() {
  return BOOKS
}

export function generatePlan(): DayReading[] {
  const totalChapters = BOOKS.reduce((sum, b) => sum + b.chapters, 0) // 1189
  const totalDays = 365

  // 1189 chapters across 365 days:
  // 365 * 3 = 1095, remainder = 1189 - 1095 = 94
  // So 94 days get 4 chapters, 271 days get 3 chapters
  const extraDays = totalChapters - totalDays * 3 // 94 days get +1 chapter
  // Spread the 4-chapter days evenly using a step interval
  const step = totalDays / extraDays // ~3.88, so roughly every 4th day gets 4 chapters

  const plan: DayReading[] = []
  let bookIndex = 0
  let chapterInBook = 1

  for (let day = 1; day <= totalDays; day++) {
    // Determine target chapters for this day
    const extraCount = Math.round((day / step)) - Math.round(((day - 1) / step))
    const target = day === totalDays ? Infinity : 3 + extraCount

    const readings: Reading[] = []
    let chaptersToday = 0

    while (chaptersToday < target && bookIndex < BOOKS.length) {
      const book = BOOKS[bookIndex]
      const remaining = book.chapters - chapterInBook + 1
      const canTake = target === Infinity ? remaining : Math.min(remaining, target - chaptersToday)

      const startCh = chapterInBook
      const endCh = chapterInBook + canTake - 1

      readings.push({
        book: book.name,
        chapters: startCh === endCh ? `${startCh}` : `${startCh}-${endCh}`,
      })

      chaptersToday += canTake
      chapterInBook += canTake

      if (chapterInBook > book.chapters) {
        bookIndex++
        chapterInBook = 1
      }
    }

    if (readings.length > 0) {
      plan.push({ day, readings, completed: false })
    }
  }

  return plan
}

// Get which days cover a specific book
export function getDaysForBook(plan: DayReading[], bookName: string): number[] {
  return plan
    .filter((d) => d.readings.some((r) => r.book === bookName))
    .map((d) => d.day)
}

// Get total chapters read for a book given completed days
export function getBookProgress(
  plan: DayReading[],
  bookName: string,
  completedDays: Set<number>
): { read: number; total: number } {
  const book = BOOKS.find((b) => b.name === bookName)
  if (!book) return { read: 0, total: 0 }

  let read = 0
  for (const day of plan) {
    if (!completedDays.has(day.day)) continue
    for (const r of day.readings) {
      if (r.book !== bookName) continue
      const parts = r.chapters.split("-")
      if (parts.length === 1) {
        read += 1
      } else {
        read += parseInt(parts[1]) - parseInt(parts[0]) + 1
      }
    }
  }

  return { read, total: book.chapters }
}

// Calculate chapters in a reading
export function countChaptersInReading(reading: Reading): number {
  const parts = reading.chapters.split("-")
  if (parts.length === 1) return 1
  return parseInt(parts[1]) - parseInt(parts[0]) + 1
}

export function getTotalChapters(): number {
  return BOOKS.reduce((sum, b) => sum + b.chapters, 0)
}

export function getChaptersCompleted(plan: DayReading[], completedDays: Set<number>): number {
  let total = 0
  for (const day of plan) {
    if (!completedDays.has(day.day)) continue
    for (const r of day.readings) {
      total += countChaptersInReading(r)
    }
  }
  return total
}
