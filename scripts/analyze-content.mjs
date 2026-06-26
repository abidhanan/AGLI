import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const seedPath = path.join(root, 'src', 'data', 'seedContent.json')
const outputDir = path.join(root, 'dist-analysis')
const outputPath = path.join(outputDir, 'pattern-report.md')

const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'))

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
  const qualityPenalty = item.sourceQuality === 'demo' ? -6 : 0
  return {
    ...item,
    engagementRate: rate,
    score: Math.round(viewSignal + engagementSignal + shareSignal + commentSignal + qualityPenalty),
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
const report = [
  '# AGLI Pattern Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '> Demo seed metrics are synthetic and exist only to prove the workflow. Replace with verified exports before client use.',
  '',
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
