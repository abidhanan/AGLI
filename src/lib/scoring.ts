import type {
  ContentItem,
  PatternGroup,
  PatternSummary,
  RankedContent,
} from '../types'

const CURRENT_YEAR = 2026

function engagementRate(item: ContentItem) {
  if (item.views <= 0) return 0
  return item.engagements / item.views
}

function recencyBoost(date: string) {
  const year = Number(date.slice(0, 4))
  if (!Number.isFinite(year)) return 0
  return Math.max(0, year - (CURRENT_YEAR - 2)) * 1.5
}

export function scoreContent(item: ContentItem): RankedContent {
  const rate = engagementRate(item)
  const viewSignal = Math.log10(item.views + 1) * 13
  const engagementSignal = Math.min(rate * 720, 45)
  const shareSignal = Math.min((item.shares / Math.max(item.views, 1)) * 1800, 18)
  const commentSignal = Math.min((item.comments / Math.max(item.views, 1)) * 900, 12)
  const score = Math.round(
    viewSignal +
      engagementSignal +
      shareSignal +
      commentSignal +
      recencyBoost(item.date),
  )

  const scoreReasons = [
    `${formatCompactNumber(item.views)} views`,
    `${formatPercent(rate)} engagement rate`,
    `${formatCompactNumber(item.shares)} shares`,
  ]

  return {
    ...item,
    engagementRate: rate,
    score,
    scoreReasons,
  }
}

export function rankContent(items: ContentItem[]) {
  return items.map(scoreContent).sort((a, b) => b.score - a.score)
}

function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function topGroups(items: RankedContent[], key: keyof ContentItem): PatternGroup[] {
  const groups = new Map<string, RankedContent[]>()

  for (const item of items) {
    const label = String(item[key] || 'Unclassified')
    const current = groups.get(label) ?? []
    current.push(item)
    groups.set(label, current)
  }

  return [...groups.entries()]
    .map(([label, groupItems]) => ({
      label,
      count: groupItems.length,
      averageScore: Math.round(
        groupItems.reduce((total, item) => total + item.score, 0) / groupItems.length,
      ),
      examples: groupItems.slice(0, 2).map((item) => item.title),
    }))
    .sort((a, b) => b.count - a.count || b.averageScore - a.averageScore)
    .slice(0, 4)
}

export function calculatePatternSummary(items: ContentItem[]): PatternSummary {
  const ranked = rankContent(items).slice(0, 10)
  const videoLengths = ranked
    .filter((item) => item.lengthSeconds > 0)
    .map((item) => item.lengthSeconds)
  const averageLengthSeconds =
    videoLengths.length === 0
      ? 0
      : Math.round(videoLengths.reduce((total, value) => total + value, 0) / videoLengths.length)

  return {
    sampleSize: ranked.length,
    medianEngagementRate: median(ranked.map((item) => item.engagementRate)),
    averageLengthSeconds,
    recommendedLength:
      averageLengthSeconds === 0
        ? 'Text or carousel pattern'
        : `${Math.max(20, averageLengthSeconds - 15)}-${averageLengthSeconds + 20}s`,
    topHooks: topGroups(ranked, 'hookType'),
    topTopics: topGroups(ranked, 'topic'),
    topFormats: topGroups(ranked, 'format'),
    topVisualStyles: topGroups(ranked, 'visualStyle'),
  }
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}
