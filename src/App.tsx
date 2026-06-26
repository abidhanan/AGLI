import {
  AlertTriangle,
  BadgeCheck,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Link2,
  PlaySquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Table2,
  Upload,
  WandSparkles,
} from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import './App.css'
import seedRows from './data/seedContent.json'
import { normalizeImportedContent, parseCsv } from './lib/csv'
import { generateDraft } from './lib/drafts'
import {
  calculatePatternSummary,
  formatCompactNumber,
  formatPercent,
  rankContent,
} from './lib/scoring'
import type { ContentItem, DraftInputs, PatternGroup, Platform, RankedContent } from './types'

const seedContent = seedRows as ContentItem[]
const platformOptions: Array<Platform | 'All'> = ['All', 'LinkedIn', 'YouTube', 'Instagram', 'TikTok']
const audienceOptions = ['All', 'HR leads', 'L&D managers', 'Team leads', 'Managers']
const objectiveOptions = [
  'Build awareness',
  'Book a discovery conversation',
  'Educate HR buyers',
  'Support workshop sales',
]
const toneOptions = ['Credible warm', 'Practical', 'Calm expert', 'Direct']

const initialDraftInputs: DraftInputs = {
  platform: 'LinkedIn',
  format: 'Text post',
  objective: 'Book a discovery conversation',
  audience: 'HR leads',
  tone: 'Credible warm',
  productAngle: 'Use game-based reflection to make stress visible before it becomes burnout.',
  selectedPattern: 'Problem-first',
}

function App() {
  const [useDemoData, setUseDemoData] = useState(true)
  const [importedRows, setImportedRows] = useState<ContentItem[]>([])
  const [platformFilter, setPlatformFilter] = useState<Platform | 'All'>('All')
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [draftInputs, setDraftInputs] = useState<DraftInputs>(initialDraftInputs)
  const [selectedId, setSelectedId] = useState(seedContent[0].id)
  const [importStatus, setImportStatus] = useState('Ready for verified CSV imports')
  const [copyStatus, setCopyStatus] = useState('Copy draft')

  const sourceRows = useMemo(
    () => (useDemoData ? [...seedContent, ...importedRows] : importedRows),
    [importedRows, useDemoData],
  )

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return sourceRows.filter((item) => {
      const matchesPlatform = platformFilter === 'All' || item.platform === platformFilter
      const matchesAudience = audienceFilter === 'All' || item.audience === audienceFilter
      const searchable = [
        item.title,
        item.topic,
        item.angle,
        item.hook,
        item.hookType,
        item.format,
        item.visualStyle,
      ]
        .join(' ')
        .toLowerCase()
      const matchesSearch = query.length === 0 || searchable.includes(query)
      return matchesPlatform && matchesAudience && matchesSearch
    })
  }, [audienceFilter, platformFilter, searchQuery, sourceRows])

  const rankedRows = useMemo(() => rankContent(filteredRows), [filteredRows])
  const patternSummary = useMemo(() => calculatePatternSummary(filteredRows), [filteredRows])
  const selectedContent = rankedRows.find((item) => item.id === selectedId) ?? rankedRows[0]
  const referenceItems = rankedRows.slice(0, 3)
  const draft = useMemo(
    () => generateDraft(draftInputs, patternSummary, referenceItems),
    [draftInputs, patternSummary, referenceItems],
  )

  const metricValues = useMemo(() => {
    const verifiedCount = sourceRows.filter((item) => item.sourceQuality !== 'demo').length
    const topPlatform =
      rankedRows[0]?.platform ?? (platformFilter === 'All' ? 'No data' : platformFilter)
    const medianRate = formatPercent(patternSummary.medianEngagementRate)

    return {
      total: rankedRows.length,
      verifiedCount,
      topPlatform,
      medianRate,
    }
  }, [patternSummary.medianEngagementRate, platformFilter, rankedRows, sourceRows])

  function updateDraftInput<Key extends keyof DraftInputs>(key: Key, value: DraftInputs[Key]) {
    setDraftInputs((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function usePattern(item: RankedContent) {
    setSelectedId(item.id)
    setDraftInputs((current) => ({
      ...current,
      platform: item.platform,
      format: item.format,
      audience: item.audience,
      productAngle: item.angle,
      selectedPattern: item.hookType,
    }))
    document.getElementById('draft-studio')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const rows = parseCsv(String(reader.result))
      const normalizedRows = rows.map(normalizeImportedContent)
      setImportedRows((current) => [...normalizedRows, ...current])
      setImportStatus(
        normalizedRows.length > 0
          ? `Imported ${normalizedRows.length} rows. Verify URLs before client use.`
          : 'No rows found. Check the CSV header names.',
      )
    }
    reader.readAsText(file)
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft.markdown)
    setCopyStatus('Copied')
    window.setTimeout(() => setCopyStatus('Copy draft'), 1500)
  }

  function downloadAnalysis() {
    const payload = {
      project: 'AGLI - Amsterdam Game Lab Intelligence',
      generatedAt: new Date().toISOString(),
      filters: {
        platform: platformFilter,
        audience: audienceFilter,
        query: searchQuery,
        demoDataIncluded: useDemoData,
      },
      rankedRows,
      patternSummary,
      draft,
      guardrails: [
        'Use verified metrics only in external presentations.',
        'Do not publish demo seed rows as evidence.',
        'Do not invent client results, ROI, medical claims, or case studies.',
      ],
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'agli-analysis-export.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <strong>AGLI</strong>
            <span>Amsterdam Game Lab Intelligence</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="App sections">
          <a href="#research">
            <Table2 size={17} />
            Research
          </a>
          <a href="#patterns">
            <Brain size={17} />
            Pattern Engine
          </a>
          <a href="#draft-studio">
            <WandSparkles size={17} />
            Draft Studio
          </a>
          <a href="#workflow">
            <ClipboardCheck size={17} />
            Workflow
          </a>
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={18} />
          <p>
            Built for draft creation only. Every metric and claim needs human review before
            publishing.
          </p>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div>
            <p className="section-label">Content intelligence for Pro Actief</p>
            <h1>Find what works, then write from the pattern.</h1>
          </div>

          <div className="topbar-actions">
            <button className="secondary-button" type="button" onClick={downloadAnalysis}>
              <Download size={16} />
              Export analysis
            </button>
            <label className="primary-button">
              <Upload size={16} />
              Import CSV
              <input accept=".csv" type="file" onChange={handleCsvUpload} />
            </label>
          </div>
        </header>

        <section className="guardrail">
          <AlertTriangle size={19} />
          <div>
            <strong>Verified metrics only</strong>
            <span>
              Demo seed rows are synthetic pattern examples. Import VidIQ, TubeBuddy, platform
              analytics, TikTok Creative Center, or manual research exports before client use.
            </span>
          </div>
          <label className="toggle">
            <input
              checked={useDemoData}
              type="checkbox"
              onChange={(event) => setUseDemoData(event.target.checked)}
            />
            Show demo seed
          </label>
        </section>

        <section className="metric-grid" aria-label="Research metrics">
          <MetricTile
            caption="Rows after filters"
            icon={<Gauge size={19} />}
            label="Ranked content"
            value={String(metricValues.total)}
          />
          <MetricTile
            caption="Imported or verified"
            icon={<BadgeCheck size={19} />}
            label="Evidence rows"
            value={String(metricValues.verifiedCount)}
          />
          <MetricTile
            caption="Best current signal"
            icon={<Sparkles size={19} />}
            label="Top platform"
            value={metricValues.topPlatform}
          />
          <MetricTile
            caption="Across ranked rows"
            icon={<CheckCircle2 size={19} />}
            label="Median ER"
            value={metricValues.medianRate}
          />
        </section>

        <section className="filter-panel" aria-label="Research filters">
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label="Search content"
              placeholder="Search topics, hooks, angles, formats..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <SelectControl
            label="Platform"
            value={platformFilter}
            options={platformOptions}
            onChange={(value) => setPlatformFilter(value as Platform | 'All')}
          />
          <SelectControl
            label="ICP"
            value={audienceFilter}
            options={audienceOptions}
            onChange={setAudienceFilter}
          />
          <SelectControl
            label="Objective"
            value={draftInputs.objective}
            options={objectiveOptions}
            onChange={(value) => updateDraftInput('objective', value)}
          />
          <SelectControl
            label="Tone"
            value={draftInputs.tone}
            options={toneOptions}
            onChange={(value) => updateDraftInput('tone', value)}
          />
        </section>

        <section className="content-grid" id="research">
          <ResearchTable
            rankedRows={rankedRows}
            selectedId={selectedContent?.id}
            onSelect={setSelectedId}
            onUsePattern={usePattern}
          />

          <aside className="pattern-panel" id="patterns">
            <div className="panel-heading">
              <div>
                <p className="section-label">Pattern Engine</p>
                <h2>What is earning attention</h2>
              </div>
              <SlidersHorizontal size={19} />
            </div>

            <div className="pattern-summary">
              <div>
                <span>Sample</span>
                <strong>{patternSummary.sampleSize}</strong>
              </div>
              <div>
                <span>Median ER</span>
                <strong>{formatPercent(patternSummary.medianEngagementRate)}</strong>
              </div>
              <div>
                <span>Target length</span>
                <strong>{patternSummary.recommendedLength}</strong>
              </div>
            </div>

            <PatternList groups={patternSummary.topHooks} title="Hooks" />
            <PatternList groups={patternSummary.topTopics} title="Topics" />
            <PatternList groups={patternSummary.topFormats} title="Formats" />
            <PatternList groups={patternSummary.topVisualStyles} title="Visual styles" />
          </aside>
        </section>

        <section className="draft-layout" id="draft-studio">
          <div className="draft-controls">
            <div className="panel-heading">
              <div>
                <p className="section-label">Draft Studio</p>
                <h2>On-brand draft generator</h2>
              </div>
              <WandSparkles size={20} />
            </div>

            <SelectControl
              label="Output platform"
              value={draftInputs.platform}
              options={platformOptions.filter((option) => option !== 'All')}
              onChange={(value) => updateDraftInput('platform', value as Platform)}
            />
            <SelectControl
              label="Pattern"
              value={draftInputs.selectedPattern}
              options={[
                draftInputs.selectedPattern,
                ...patternSummary.topHooks.map((group) => group.label),
              ].filter((value, index, values) => values.indexOf(value) === index)}
              onChange={(value) => updateDraftInput('selectedPattern', value)}
            />
            <label className="field">
              <span>Product angle</span>
              <textarea
                value={draftInputs.productAngle}
                onChange={(event) => updateDraftInput('productAngle', event.target.value)}
              />
            </label>

            {selectedContent ? (
              <div className="selected-pattern">
                <span>Inspired by selected row</span>
                <strong>{selectedContent.title}</strong>
                <small>{selectedContent.verificationNote}</small>
              </div>
            ) : null}
          </div>

          <div className="draft-output">
            <div className="draft-toolbar">
              <div>
                <p className="section-label">Generated draft</p>
                <h2>{draftInputs.platform} concept</h2>
              </div>
              <button className="secondary-button" type="button" onClick={copyDraft}>
                <Copy size={16} />
                {copyStatus}
              </button>
            </div>

            <div className="hook-bank">
              {draft.hooks.map((hook) => (
                <p key={hook}>{hook}</p>
              ))}
            </div>

            <article className="post-copy">
              {draft.postCopy.split('\n').map((line, index) =>
                line ? <p key={`${line}-${index}`}>{line}</p> : <br key={`line-${index}`} />,
              )}
            </article>

            <div className="script-grid">
              {draft.videoScript.map((line) => (
                <div className="script-row" key={line.time}>
                  <strong>{line.time}</strong>
                  <span>{line.scene}</span>
                  <p>{line.voiceover}</p>
                  <em>{line.onScreenText}</em>
                </div>
              ))}
            </div>

            <div className="checklist">
              {draft.checklist.map((item) => (
                <span key={item}>
                  <CheckCircle2 size={15} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="workflow-panel" id="workflow">
          <div className="panel-heading">
            <div>
              <p className="section-label">Repeatable workflow</p>
              <h2>Low-cost discovery loop</h2>
            </div>
            <FileText size={20} />
          </div>

          <div className="workflow-grid">
            <WorkflowStep
              icon={<Search size={18} />}
              title="1. Collect winners"
              text="Use LinkedIn analytics, platform search, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, or manual competitor review."
            />
            <WorkflowStep
              icon={<Table2 size={18} />}
              title="2. Import verified rows"
              text="Paste platform, URL, hook, topic, views, engagements, comments, shares, format, length, and visual style into the CSV template."
            />
            <WorkflowStep
              icon={<Brain size={18} />}
              title="3. Read the pattern"
              text="AGLI ranks by view signal, engagement rate, share signal, comment signal, recency, and source quality."
            />
            <WorkflowStep
              icon={<PlaySquare size={18} />}
              title="4. Draft, review, refine"
              text="Generate post copy and video outlines, then human-review facts, tone, client references, and brand fit."
            />
          </div>

          <div className="import-status">
            <Link2 size={16} />
            <span>{importStatus}</span>
            <a href="/sample-import.csv" download>
              Download CSV template
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

interface MetricTileProps {
  icon: ReactNode
  label: string
  value: string
  caption: string
}

function MetricTile({ icon, label, value, caption }: MetricTileProps) {
  return (
    <div className="metric-tile">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{caption}</small>
      </div>
    </div>
  )
}

interface SelectControlProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SelectControl({ label, value, options, onChange }: SelectControlProps) {
  return (
    <label className="field select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

interface ResearchTableProps {
  rankedRows: RankedContent[]
  selectedId?: string
  onSelect: (id: string) => void
  onUsePattern: (item: RankedContent) => void
}

function ResearchTable({ rankedRows, selectedId, onSelect, onUsePattern }: ResearchTableProps) {
  return (
    <section className="research-panel">
      <div className="panel-heading">
        <div>
          <p className="section-label">Research</p>
          <h2>Ranked content examples</h2>
        </div>
        <Table2 size={20} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Content</th>
              <th>Signal</th>
              <th>Pattern</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {rankedRows.map((item) => (
              <tr
                className={item.id === selectedId ? 'selected-row' : ''}
                key={item.id}
                onClick={() => onSelect(item.id)}
              >
                <td>
                  <div className="content-cell">
                    <span className={`platform platform-${item.platform.toLowerCase()}`}>
                      {item.platform}
                    </span>
                    <strong>{item.title}</strong>
                    <small>{item.hook}</small>
                    <QualityPill item={item} />
                  </div>
                </td>
                <td>
                  <div className="signal-cell">
                    <strong>{item.score}</strong>
                    <span>{formatCompactNumber(item.views)} views</span>
                    <span>{formatPercent(item.engagementRate)} ER</span>
                  </div>
                </td>
                <td>
                  <div className="pattern-cell">
                    <span>{item.hookType}</span>
                    <small>{item.format}</small>
                    <small>{item.visualStyle}</small>
                  </div>
                </td>
                <td>
                  <button
                    className="mini-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onUsePattern(item)
                    }}
                  >
                    <Sparkles size={14} />
                    Use
                  </button>
                  {item.url ? (
                    <a className="source-link" href={item.url} target="_blank">
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function QualityPill({ item }: { item: RankedContent }) {
  const label =
    item.sourceQuality === 'demo'
      ? 'Demo seed'
      : item.sourceQuality === 'verified'
        ? 'Verified'
        : 'Imported'

  return (
    <span className={`quality-pill quality-${item.sourceQuality}`}>
      <ShieldCheck size={13} />
      {label}
    </span>
  )
}

function PatternList({ title, groups }: { title: string; groups: PatternGroup[] }) {
  return (
    <div className="pattern-list">
      <h3>{title}</h3>
      {groups.length > 0 ? (
        groups.map((group) => (
          <div className="pattern-item" key={group.label}>
            <div>
              <strong>{group.label}</strong>
              <span>
                {group.count} examples, avg score {group.averageScore}
              </span>
            </div>
            <p>{group.examples[0]}</p>
          </div>
        ))
      ) : (
        <p className="empty-state">Import or enable demo data to see patterns.</p>
      )}
    </div>
  )
}

function WorkflowStep({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="workflow-step">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

export default App
