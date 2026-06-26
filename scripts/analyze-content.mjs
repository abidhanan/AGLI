import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const csvPath = path.join(root, 'data', 'content.csv')
const jsonPath = path.join(root, 'data', 'content.json')
const templatePath = path.join(root, 'public', 'sample-import.csv')
const outputDir = path.join(root, 'dist-analysis')
const outputPath = path.join(outputDir, 'pattern-report.md')

function parseCsvLine(line) {
  const values = []
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

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function parseCsv(text) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? ''
      return row
    }, {})
  })
}

function readNumber(value) {
  const number = Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function loadRows() {
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  }

  const sourcePath = fs.existsSync(csvPath) ? csvPath : templatePath
  const rows = parseCsv(fs.readFileSync(sourcePath, 'utf8'))
  return rows.map((row, index) => ({
    id: row.id || `content-${index + 1}`,
    platform: row.platform || 'LinkedIn',
    title: row.title || row.hook || `Imported content ${index + 1}`,
    creator: row.creator || row.author || 'Imported source',
    url: row.url || row.link || '',
    topic: row.topic || 'Unclassified',
    hookType: row.hooktype || row.hookcategory || row.hook || 'Unclassified',
    format: row.format || row.contentformat || 'Unclassified',
    visualStyle: row.visualstyle || row.style || 'Unclassified',
    views: readNumber(row.views),
    engagements:
      readNumber(row.engagements) ||
      readNumber(row.likes) + readNumber(row.comments) + readNumber(row.shares),
    comments: readNumber(row.comments),
    shares: readNumber(row.shares),
    date: row.date || '',
    sourceQuality: row.sourcequality || row.status || 'imported',
  }))
}

const rows = loadRows()

function compact(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function percent(value) {
  return new Intl.NumberFormat('en', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}

function score(item) {
  const rate = item.views > 0 ? item.engagements / item.views : 0
  const viewSignal = Math.log10(item.views + 1) * 13
  const engagementSignal = Math.min(rate * 720, 45)
  const shareSignal = Math.min((item.shares / Math.max(item.views, 1)) * 1800, 18)
  const commentSignal = Math.min((item.comments / Math.max(item.views, 1)) * 900, 12)
  return {
    ...item,
    engagementRate: rate,
    score: Math.round(viewSignal + engagementSignal + shareSignal + commentSignal),
  }
}

function topGroups(items, key) {
  const groups = new Map()
  for (const item of items) {
    const label = item[key] || 'Unclassified'
    groups.set(label, [...(groups.get(label) || []), item])
  }
  return [...groups.entries()]
    .map(([label, groupItems]) => ({
      label,
      count: groupItems.length,
      averageScore: Math.round(
        groupItems.reduce((total, item) => total + item.score, 0) / groupItems.length,
      ),
      example: groupItems[0].title,
    }))
    .sort((a, b) => b.count - a.count || b.averageScore - a.averageScore)
    .slice(0, 5)
}

const ranked = rows.map(score).sort((a, b) => b.score - a.score)
const emptyNotice =
  ranked.length === 0
    ? [
        '## No imported rows yet',
        '',
        'Fill `data/content.csv` or import/export from the app, then run `npm run analyze` again.',
        '',
      ]
    : []

const report = [
  '# AGLI Pattern Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '> This report uses only user-provided content rows. Verify URLs and metric dates before publishing.',
  '',
  ...emptyNotice,
  ...(ranked.length > 0
    ? [
        '## Top ranked examples',
        '',
        ...ranked.slice(0, 8).map(
          (item, index) =>
            `${index + 1}. ${item.platform} | score ${item.score} | ${compact(item.views)} views | ${percent(item.engagementRate)} ER | ${item.title}`,
        ),
        '',
        '## Hook patterns',
        '',
        ...topGroups(ranked, 'hookType').map(
          (group) =>
            `- ${group.label}: ${group.count} examples, avg score ${group.averageScore}. Example: ${group.example}`,
        ),
        '',
        '## Topics',
        '',
        ...topGroups(ranked, 'topic').map(
          (group) =>
            `- ${group.label}: ${group.count} examples, avg score ${group.averageScore}. Example: ${group.example}`,
        ),
        '',
        '## Formats',
        '',
        ...topGroups(ranked, 'format').map(
          (group) =>
            `- ${group.label}: ${group.count} examples, avg score ${group.averageScore}. Example: ${group.example}`,
        ),
        '',
      ]
    : []),
  '## Guardrails',
  '',
  '- Use only verified URLs and metric dates in the final deck.',
  '- Do not invent case studies, ROI, clinical outcomes, or client quotes.',
  '- Treat generated copy as a draft for Amsterdam Game Lab review, not auto-published content.',
  '',
].join('\n')

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(outputPath, report)
console.log(`Wrote ${outputPath}`)
