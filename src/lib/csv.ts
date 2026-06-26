import type { ContentItem, Platform, SourceQuality } from '../types'

const platforms: Platform[] = ['LinkedIn', 'YouTube', 'Instagram', 'TikTok']

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const next = line[index + 1]

    if (character === '"' && quoted && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (character === '"') {
      quoted = !quoted
      continue
    }

    if (character === ',' && !quoted) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  values.push(current.trim())
  return values
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function parseCsv(text: string) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? ''
      return row
    }, {})
  })
}

function readNumber(value: string, fallback = 0) {
  const number = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

function readPlatform(value: string): Platform {
  const match = platforms.find((platform) => platform.toLowerCase() === value.toLowerCase())
  return match ?? 'LinkedIn'
}

function readSourceQuality(value: string): SourceQuality {
  if (value === 'verified' || value === 'imported') return value
  return 'imported'
}

export function normalizeImportedContent(
  row: Record<string, string>,
  index: number,
): ContentItem {
  const views = readNumber(row.views)
  const engagements =
    readNumber(row.engagements) ||
    readNumber(row.likes) + readNumber(row.comments) + readNumber(row.shares)

  return {
    id: `import-${Date.now()}-${index}`,
    platform: readPlatform(row.platform),
    title: row.title || row.hook || `Imported content ${index + 1}`,
    creator: row.creator || row.author || 'Imported source',
    url: row.url || row.link || '',
    topic: row.topic || 'Unclassified topic',
    angle: row.angle || row.insight || 'Imported winning angle',
    hook: row.hook || row.title || 'Imported hook',
    hookType: row.hooktype || row.hookcategory || 'Imported pattern',
    format: row.format || row.contentformat || 'Imported format',
    visualStyle: row.visualstyle || row.style || 'Imported visual style',
    lengthSeconds: readNumber(row.lengthseconds || row.seconds),
    audience: row.audience || row.icp || 'HR leads',
    views,
    engagements,
    comments: readNumber(row.comments),
    shares: readNumber(row.shares),
    date: row.date || new Date().toISOString().slice(0, 10),
    sourceQuality: readSourceQuality(row.sourcequality || row.status),
    verificationNote:
      row.verificationnote ||
      'Imported by user. Verify URL and metric date before publishing.',
  }
}
