import {
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Copy,
  FileText,
  Folder,
  Home,
  Image as ImageIcon,
  Info,
  LineChart,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Tags,
  Trash2,
  Upload,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import './App.css'
import { normalizeImportedContent, parseCsv } from './lib/csv'
import { generateDraft as buildDraft } from './lib/drafts'
import {
  calculatePatternSummary,
  formatCompactNumber,
  formatPercent,
  rankContent,
} from './lib/scoring'
import type { ContentItem, DraftOutput, PatternSummary, Platform, RankedContent } from './types'

type DraftTab = 'Post Copy' | 'Hooks' | 'Video Outline' | 'Hashtags'
type PageKey =
  | 'Overview'
  | 'Research'
  | 'Pattern Engine'
  | 'Calendar'
  | 'Content Library'
  | 'Reports'
  | 'Saved Searches'
  | 'Brand Voice'
  | 'Team'
  | 'Settings'
type PlatformFilter = Platform | 'All Platforms'

interface CalendarItem {
  id: string
  date: string
  platform: Platform
  title: string
  status: string
}

interface LibraryItem {
  id: string
  title: string
  type: string
  status: string
  audience: string
}

interface SavedSearch {
  id: string
  query: string
  platforms: string
  results: number
  savedAt: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  responsibility: string
  status: string
}

interface BrandRule {
  id: string
  category: string
  text: string
}

interface AppSettings {
  requireVerifiedMetrics: boolean
  manualPublishingOnly: boolean
  reviewBeforeExport: boolean
  storeLocally: boolean
}

const platforms: Platform[] = ['LinkedIn', 'YouTube', 'Instagram', 'TikTok']
const platformOptions: PlatformFilter[] = ['All Platforms', ...platforms]
const icpOptions = ['HR & L&D Professionals', 'Team Leads', 'Managers', 'People Ops']
const objectiveOptions = ['Awareness', 'Discovery Call', 'Thought Leadership', 'Workshop Demand']
const toneOptions = ['Professional & Warm', 'Practical', 'Calm Expert', 'Direct']
const draftTabs: DraftTab[] = ['Post Copy', 'Hooks', 'Video Outline', 'Hashtags']

const primaryNav: Array<{ icon: ReactNode; label: PageKey }> = [
  { icon: <Home size={18} />, label: 'Overview' },
  { icon: <Search size={19} />, label: 'Research' },
  { icon: <Table2 size={18} />, label: 'Pattern Engine' },
  { icon: <CalendarDays size={18} />, label: 'Calendar' },
  { icon: <Folder size={18} />, label: 'Content Library' },
  { icon: <LineChart size={18} />, label: 'Reports' },
  { icon: <Bookmark size={18} />, label: 'Saved Searches' },
]

const secondaryNav: Array<{ icon: ReactNode; label: PageKey }> = [
  { icon: <MessageSquare size={18} />, label: 'Brand Voice' },
  { icon: <Users size={18} />, label: 'Team' },
  { icon: <Settings size={18} />, label: 'Settings' },
]

const defaultBrandRules: BrandRule[] = [
  {
    id: 'rule-verified-metrics',
    category: 'Guardrail',
    text: 'Use only verified URLs, platform metrics, and metric dates in client-facing output.',
  },
  {
    id: 'rule-no-fabrication',
    category: 'Avoid',
    text: 'Do not invent ROI, clinical outcomes, quotes, or case studies.',
  },
  {
    id: 'rule-product-fit',
    category: 'Use',
    text: 'Keep Pro Actief positioned as a facilitated serious game for stress-prevention conversations using IGLO.',
  },
]

const defaultSettings: AppSettings = {
  requireVerifiedMetrics: true,
  manualPublishingOnly: true,
  reviewBeforeExport: true,
  storeLocally: true,
}

function App() {
  const [activePage, setActivePage] = useState<PageKey>('Research')
  const [icp, setIcp] = useStoredState('agli:icp', icpOptions[0])
  const [platformFilter, setPlatformFilter] = useStoredState<PlatformFilter>(
    'agli:platformFilter',
    'All Platforms',
  )
  const [objective, setObjective] = useStoredState('agli:objective', objectiveOptions[0])
  const [tone, setTone] = useStoredState('agli:tone', toneOptions[0])
  const [draftPlatform, setDraftPlatform] = useStoredState<Platform>('agli:draftPlatform', 'LinkedIn')
  const [draftTab, setDraftTab] = useState<DraftTab>('Post Copy')
  const [draftText, setDraftText] = useStoredState('agli:draftText', '')
  const [draftOutput, setDraftOutput] = useStoredState<DraftOutput | null>('agli:draftOutput', null)
  const [cta, setCta] = useStoredState('agli:cta', '')
  const [notice, setNotice] = useState('No fabricated claims')
  const [contentItems, setContentItems] = useStoredState<ContentItem[]>('agli:contentItems', [])
  const [calendarItems, setCalendarItems] = useStoredState<CalendarItem[]>('agli:calendarItems', [])
  const [libraryItems, setLibraryItems] = useStoredState<LibraryItem[]>('agli:libraryItems', [])
  const [savedSearches, setSavedSearches] = useStoredState<SavedSearch[]>('agli:savedSearches', [])
  const [teamMembers, setTeamMembers] = useStoredState<TeamMember[]>('agli:teamMembers', [])
  const [brandRules, setBrandRules] = useStoredState<BrandRule[]>('agli:brandRules', defaultBrandRules)
  const [settings, setSettings] = useStoredState<AppSettings>('agli:settings', defaultSettings)
  const [selectedContentId, setSelectedContentId] = useState('')
  const [tablePage, setTablePage] = useState(1)

  const rankedContent = useMemo(() => rankContent(contentItems), [contentItems])
  const filteredRanked = useMemo(
    () =>
      rankedContent.filter((item) =>
        platformFilter === 'All Platforms' ? true : item.platform === platformFilter,
      ),
    [platformFilter, rankedContent],
  )
  const summary = useMemo(() => calculatePatternSummary(filteredRanked), [filteredRanked])
  const wordCount = useMemo(() => draftText.trim().split(/\s+/).filter(Boolean).length, [draftText])
  const topReference = useMemo(
    () => filteredRanked.find((item) => item.id === selectedContentId) ?? filteredRanked[0],
    [filteredRanked, selectedContentId],
  )
  const contentPillar = summary.topTopics[0]?.label ?? 'Import data first'

  useEffect(() => {
    setTablePage(1)
  }, [platformFilter, contentItems.length])

  function action(message: string) {
    setNotice(message)
  }

  function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const rawRows = parseCsv(String(reader.result ?? ''))
      if (rawRows.length === 0) {
        action('CSV has headers but no rows')
        return
      }

      const imported = rawRows.map((row, index) => {
        const item = normalizeImportedContent(row, index)
        return {
          ...item,
          id: createId('content'),
        }
      })

      setContentItems((current) => mergeContentItems(imported, current))
      action(`Imported ${imported.length} verified/imported rows`)
    }
    reader.onerror = () => action('Could not read CSV file')
    reader.readAsText(file)
  }

  function saveSearch() {
    const search: SavedSearch = {
      id: createId('search'),
      query: `${icp} | ${objective} | ${tone}`,
      platforms: platformFilter,
      results: filteredRanked.length,
      savedAt: new Date().toISOString(),
    }
    setSavedSearches((current) => [search, ...current])
    action('Search saved')
  }

  function generateDraft() {
    if (filteredRanked.length === 0) {
      action('Import research data before generating')
      return
    }

    const references = buildReferences(filteredRanked, topReference?.id)
    const output = buildDraft(
      {
        platform: draftPlatform,
        format: references[0]?.format ?? 'Text post',
        objective,
        audience: icp,
        tone,
        productAngle: 'Pro Actief stress-prevention serious game using the IGLO model',
        selectedPattern: summary.topHooks[0]?.label ?? references[0]?.hookType ?? '',
      },
      summary,
      references,
    )

    setDraftOutput(output)
    setDraftText(output.postCopy)
    setCta('Invite the team to review whether Pro Actief fits their context.')
    action('Draft generated from imported research')
  }

  function saveDraft() {
    if (!draftText.trim()) {
      action('Draft is empty')
      return
    }

    const firstLine = draftText.trim().split('\n').find(Boolean) ?? 'Untitled Pro Actief draft'
    const item: LibraryItem = {
      id: createId('library'),
      title: firstLine.slice(0, 80),
      type: `${draftPlatform} draft`,
      status: 'Needs human review',
      audience: icp,
    }
    setLibraryItems((current) => [item, ...current])
    action('Draft saved to Content Library')
  }

  async function copyDraft() {
    if (!draftText.trim()) {
      action('Draft is empty')
      return
    }

    await navigator.clipboard.writeText(`${draftText}\n\n${cta}`)
    action('Draft copied')
  }

  function addDraftToCalendar() {
    if (!draftText.trim()) {
      action('Draft is empty')
      return
    }

    const firstLine = draftText.trim().split('\n').find(Boolean) ?? 'Pro Actief content draft'
    const item: CalendarItem = {
      id: createId('calendar'),
      date: nextIsoDate(3),
      platform: draftPlatform,
      title: firstLine.slice(0, 80),
      status: 'Needs review',
    }
    setCalendarItems((current) => [item, ...current])
    action('Draft added to calendar')
  }

  function addLibraryItem() {
    const item: LibraryItem = {
      id: createId('library'),
      title: `Uploaded asset ${libraryItems.length + 1}`,
      type: 'Asset',
      status: 'Needs details',
      audience: icp,
    }
    setLibraryItems((current) => [item, ...current])
    action('Library item created')
  }

  function addTeamMember() {
    const member: TeamMember = {
      id: createId('team'),
      name: `Team member ${teamMembers.length + 1}`,
      role: 'Reviewer',
      responsibility: 'Review drafts before publishing',
      status: 'Active',
    }
    setTeamMembers((current) => [member, ...current])
    action('Team member added')
  }

  function addBrandRule() {
    const rule: BrandRule = {
      id: createId('rule'),
      category: 'Draft rule',
      text: 'Edit this rule with an Amsterdam Game Lab tone-of-voice note.',
    }
    setBrandRules((current) => [rule, ...current])
    action('Brand rule added')
  }

  function exportAnalysis() {
    const payload = {
      generatedAt: new Date().toISOString(),
      filters: { icp, platformFilter, objective, tone },
      rankedContent: filteredRanked,
      patternSummary: summary,
      draft: { platform: draftPlatform, postCopy: draftText, cta, output: draftOutput },
      calendarItems,
      libraryItems,
      savedSearches,
      brandRules,
      guardrails: [
        'Use verified URLs and metric dates.',
        'Do not invent ROI, clinical outcomes, quotes, or case studies.',
        'Treat generated copy as a human-review draft.',
      ],
    }
    downloadJson(payload, `agli-analysis-${new Date().toISOString().slice(0, 10)}.json`)
    action('Analysis exported')
  }

  function clearWorkspace() {
    setContentItems([])
    setCalendarItems([])
    setLibraryItems([])
    setSavedSearches([])
    setTeamMembers([])
    setDraftText('')
    setDraftOutput(null)
    setCta('')
    setSelectedContentId('')
    action('Workspace cleared')
  }

  return (
    <div className="prototype-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <strong>AGLI</strong>
          <span>Amsterdam Game Lab Intelligence</span>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {primaryNav.map((item) => (
            <NavItem
              active={activePage === item.label}
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => {
                setActivePage(item.label)
                action(`${item.label} opened`)
              }}
            />
          ))}
        </nav>

        <div className="nav-divider" />

        <nav className="nav-list nav-secondary" aria-label="Settings navigation">
          {secondaryNav.map((item) => (
            <NavItem
              active={activePage === item.label}
              icon={item.icon}
              key={item.label}
              label={item.label}
              onClick={() => {
                setActivePage(item.label)
                action(`${item.label} opened`)
              }}
            />
          ))}
        </nav>

        <button className="sidebar-user" onClick={() => setActivePage('Team')} type="button">
          <span>AG</span>
          <div>
            <strong>AGLI workspace</strong>
            <small>{contentItems.length} research rows</small>
          </div>
          <ChevronDown size={17} />
        </button>
      </aside>

      <main className="research-page">
        <header className="research-topbar">
          <h1>{activePage}</h1>
          <div className="status-strip">
            <ShieldCheck size={21} />
            <span>Verified metrics only. Import platform exports before publishing.</span>
            <strong>{notice}</strong>
            <i />
            <button aria-label="Help" onClick={() => action('Use CSV columns from the template')} type="button">
              <CircleHelp size={21} />
            </button>
            <button aria-label="Notifications" onClick={() => action('No new notifications')} type="button">
              <Bell size={21} />
            </button>
          </div>
        </header>

        {activePage === 'Research' ? (
          <ResearchPage
            action={action}
            addDraftToCalendar={addDraftToCalendar}
            copyDraft={copyDraft}
            contentPillar={contentPillar}
            cta={cta}
            dateLabel={dateRangeLabel(filteredRanked)}
            draftOutput={draftOutput}
            draftPlatform={draftPlatform}
            draftTab={draftTab}
            draftText={draftText}
            filteredRanked={filteredRanked}
            generateDraft={generateDraft}
            icp={icp}
            objective={objective}
            onImportCsv={handleCsvUpload}
            page={tablePage}
            platformFilter={platformFilter}
            saveDraft={saveDraft}
            saveSearch={saveSearch}
            selectedContentId={selectedContentId}
            setCta={setCta}
            setDraftPlatform={() => setDraftPlatform(cycleValue(draftPlatform, platforms))}
            setDraftTab={setDraftTab}
            setDraftText={setDraftText}
            setIcp={() => setIcp(cycleValue(icp, icpOptions))}
            setObjective={() => setObjective(cycleValue(objective, objectiveOptions))}
            setPage={setTablePage}
            setPlatformFilter={() => setPlatformFilter(cycleValue(platformFilter, platformOptions))}
            setSelectedContentId={setSelectedContentId}
            setTone={() => setTone(cycleValue(tone, toneOptions))}
            summary={summary}
            tone={tone}
            wordCount={wordCount}
          />
        ) : (
          <SidebarPage
            action={action}
            activePage={activePage}
            addBrandRule={addBrandRule}
            addDraftToCalendar={addDraftToCalendar}
            addLibraryItem={addLibraryItem}
            addTeamMember={addTeamMember}
            brandRules={brandRules}
            calendarItems={calendarItems}
            clearWorkspace={clearWorkspace}
            contentItems={contentItems}
            exportAnalysis={exportAnalysis}
            filteredRanked={filteredRanked}
            libraryItems={libraryItems}
            onImportCsv={handleCsvUpload}
            savedSearches={savedSearches}
            saveSearch={saveSearch}
            setActivePage={setActivePage}
            setBrandRules={setBrandRules}
            setCalendarItems={setCalendarItems}
            setLibraryItems={setLibraryItems}
            setSavedSearches={setSavedSearches}
            setSettings={setSettings}
            setTeamMembers={setTeamMembers}
            settings={settings}
            summary={summary}
            teamMembers={teamMembers}
          />
        )}
      </main>
    </div>
  )
}

function ResearchPage({
  action,
  addDraftToCalendar,
  contentPillar,
  copyDraft,
  cta,
  dateLabel,
  draftOutput,
  draftPlatform,
  draftTab,
  draftText,
  filteredRanked,
  generateDraft,
  icp,
  objective,
  onImportCsv,
  page,
  platformFilter,
  saveDraft,
  saveSearch,
  selectedContentId,
  setCta,
  setDraftPlatform,
  setDraftTab,
  setDraftText,
  setIcp,
  setObjective,
  setPage,
  setPlatformFilter,
  setSelectedContentId,
  setTone,
  summary,
  tone,
  wordCount,
}: {
  action: (message: string) => void
  addDraftToCalendar: () => void
  contentPillar: string
  copyDraft: () => Promise<void>
  cta: string
  dateLabel: string
  draftOutput: DraftOutput | null
  draftPlatform: Platform
  draftTab: DraftTab
  draftText: string
  filteredRanked: RankedContent[]
  generateDraft: () => void
  icp: string
  objective: string
  onImportCsv: (event: ChangeEvent<HTMLInputElement>) => void
  page: number
  platformFilter: PlatformFilter
  saveDraft: () => void
  saveSearch: () => void
  selectedContentId: string
  setCta: (value: string) => void
  setDraftPlatform: () => void
  setDraftTab: (value: DraftTab) => void
  setDraftText: (value: string) => void
  setIcp: () => void
  setObjective: () => void
  setPage: (value: number) => void
  setPlatformFilter: () => void
  setSelectedContentId: (value: string) => void
  setTone: () => void
  summary: PatternSummary
  tone: string
  wordCount: number
}) {
  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredRanked.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filteredRanked.slice((safePage - 1) * pageSize, safePage * pageSize)
  const columns = buildPatternColumns(summary)

  return (
    <>
      <section className="filter-row" aria-label="Research filters">
        <SelectBox label="ICP" onClick={setIcp} value={icp} />
        <SelectBox label="Platform" onClick={setPlatformFilter} value={platformFilter} />
        <SelectBox label="Objective" onClick={setObjective} value={objective} />
        <SelectBox label="Tone" onClick={setTone} value={tone} />
        <button className="date-button" onClick={() => action('Date range follows imported rows')} type="button">
          <CalendarDays size={17} />
          {dateLabel}
        </button>
        <button className="filter-button" onClick={() => action('Filters applied')} type="button">
          <Search size={17} />
          Filters
        </button>
        <button className="save-button" onClick={saveSearch} type="button">
          <Bookmark size={17} />
          Save search
        </button>
      </section>

      <div className="workspace-grid">
        <div className="left-stack">
          <section className="content-panel">
            <div className="panel-title">
              <div>
                <h2>Top Performing Content</h2>
                <span>(by imported traction)</span>
                <Info size={16} />
              </div>
              <label className="compact-action import-action">
                <Upload size={15} />
                Import CSV
                <input accept=".csv,text/csv" onChange={onImportCsv} type="file" />
              </label>
            </div>

            <div className="table-frame">
              <table className="prototype-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Traction Score</th>
                    <th>Engagement</th>
                    <th>Views</th>
                    <th>Published</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td className="table-empty-cell" colSpan={10}>
                        <EmptyState
                          text="Upload a CSV export from LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, or manual research."
                          title="No research data imported"
                        />
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, index) => (
                      <tr
                        className={selectedContentId === row.id ? 'selected-row' : ''}
                        key={row.id}
                        onClick={() => {
                          setSelectedContentId(row.id)
                          action(`${row.title} selected`)
                        }}
                      >
                        <td>{(safePage - 1) * pageSize + index + 1}</td>
                        <td className="title-cell">{row.title}</td>
                        <td><PlatformBadge platform={row.platform} /></td>
                        <td>{row.creator}</td>
                        <td><ContentType format={row.format} /></td>
                        <td className="score-cell">{row.score}</td>
                        <td>{formatCompactNumber(row.engagements)}</td>
                        <td>{formatCompactNumber(row.views)}</td>
                        <td>{formatDate(row.date)}</td>
                        <td>
                          <span className={`confidence ${row.sourceQuality}`}>
                            {confidenceLabel(row.sourceQuality)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing {pageRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-
                {Math.min(safePage * pageSize, filteredRanked.length)} of {filteredRanked.length} imported rows
              </span>
              <div className="pagination">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  type="button"
                >
                  {'<'}
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(0, 5)
                  .map((item) => (
                    <button
                      className={item === safePage ? 'active' : ''}
                      key={item}
                      onClick={() => setPage(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  type="button"
                >
                  {'>'}
                </button>
              </div>
            </div>
          </section>

          <section className="insights-panel">
            <div className="insights-title">
              <h2>Pattern Insights</h2>
              <span>(summary from imported content)</span>
              <Info size={16} />
            </div>

            {summary.sampleSize === 0 ? (
              <EmptyState
                text="After import, AGLI will calculate hooks, topics, formats, lengths, and visual style patterns from the highest scoring rows."
                title="No patterns yet"
              />
            ) : (
              <div className="insight-columns">
                {columns.map((column) => (
                  <div className="insight-column" key={column.title}>
                    <div className="insight-heading">
                      {column.icon}
                      <strong>{column.title}</strong>
                    </div>
                    <ol>
                      {column.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                    <button className="link-button" onClick={() => action(`${column.title} detail opened`)} type="button">
                      {column.link}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="insight-disclaimer">
              <Info size={17} />
              <span>Patterns are computed only from imported rows. Verify every source before publishing.</span>
            </div>
          </section>
        </div>

        <aside className="draft-card">
          <div className="draft-header">
            <h2>Draft Studio</h2>
            <button className="generate-button" onClick={generateDraft} type="button">
              <Sparkles size={16} />
              Generate draft
            </button>
          </div>

          <div className="draft-scroll">
            <div className="draft-tabs">
              {draftTabs.map((tab) => (
                <button
                  className={draftTab === tab ? 'active' : ''}
                  key={tab}
                  onClick={() => {
                    setDraftTab(tab)
                    action(`${tab} tab opened`)
                  }}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="draft-form-grid">
              <SelectBox label="Brand / Client" onClick={() => action('Pro Actief selected')} value="Pro Actief" />
              <SelectBox label="Content Pillar" onClick={() => action('Pillar comes from imported patterns')} value={contentPillar} />
              <SelectBox icon={<span className="mini-linkedin">{platformLabel(draftPlatform)}</span>} label="Platform" onClick={setDraftPlatform} value={draftPlatform} />
              <SelectBox label="Objective" onClick={() => action('Use the top filter objective')} value={objective} />
            </div>

            {draftTab === 'Post Copy' ? (
              <>
                <label className="draft-field">
                  <span>
                    Post Copy <em>Draft only - human review required.</em>
                  </span>
                  <textarea
                    placeholder="Import research data, generate a draft, or write manually here."
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                  />
                </label>
                <div className="copy-meta">
                  <span>Word count: {wordCount}</span>
                  <span>Characters: {draftText.length}</span>
                </div>
              </>
            ) : (
              <DraftTabContent
                draftOutput={draftOutput}
                rankedContent={filteredRanked}
                summary={summary}
                tab={draftTab}
              />
            )}

            <label className="draft-field cta-field">
              <span>Call to Action (optional)</span>
              <input
                maxLength={100}
                placeholder="Add a grounded CTA after review."
                value={cta}
                onChange={(event) => setCta(event.target.value)}
              />
              <small>{cta.length} / 100</small>
            </label>

            <div className="warning-box">
              <Info size={22} />
              <div>
                <strong>No fabricated claims.</strong>
                <span>Use imported proof only. Add real quotes or client claims only when supplied.</span>
              </div>
            </div>

            <div className="draft-actions">
              <button className="secondary-action" onClick={saveDraft} type="button">
                <FileText size={16} />
                Save draft
              </button>
              <button className="calendar-action" onClick={addDraftToCalendar} type="button">
                <CalendarDays size={17} />
                Add to Calendar
              </button>
              <button className="calendar-caret" onClick={copyDraft} type="button" title="Copy draft">
                <Copy size={17} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

function DraftTabContent({
  draftOutput,
  rankedContent,
  summary,
  tab,
}: {
  draftOutput: DraftOutput | null
  rankedContent: RankedContent[]
  summary: PatternSummary
  tab: Exclude<DraftTab, 'Post Copy'>
}) {
  const content = useMemo(() => {
    if (tab === 'Hooks') {
      return draftOutput?.hooks.length
        ? draftOutput.hooks
        : rankedContent.slice(0, 5).map((item) => item.hook).filter(Boolean)
    }

    if (tab === 'Video Outline') {
      return draftOutput?.videoScript.map(
        (line) => `${line.time}: ${line.scene} VO: ${line.voiceover} Text: ${line.onScreenText}`,
      ) ?? []
    }

    return buildHashtags(summary)
  }, [draftOutput, rankedContent, summary, tab])

  if (content.length === 0) {
    return (
      <div className="draft-tab-content">
        <p>Import research data and generate a draft to fill this tab.</p>
      </div>
    )
  }

  return (
    <div className="draft-tab-content">
      {content.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  )
}

function SidebarPage({
  action,
  activePage,
  addBrandRule,
  addDraftToCalendar,
  addLibraryItem,
  addTeamMember,
  brandRules,
  calendarItems,
  clearWorkspace,
  contentItems,
  exportAnalysis,
  filteredRanked,
  libraryItems,
  onImportCsv,
  savedSearches,
  saveSearch,
  setActivePage,
  setBrandRules,
  setCalendarItems,
  setLibraryItems,
  setSavedSearches,
  setSettings,
  setTeamMembers,
  settings,
  summary,
  teamMembers,
}: {
  action: (message: string) => void
  activePage: PageKey
  addBrandRule: () => void
  addDraftToCalendar: () => void
  addLibraryItem: () => void
  addTeamMember: () => void
  brandRules: BrandRule[]
  calendarItems: CalendarItem[]
  clearWorkspace: () => void
  contentItems: ContentItem[]
  exportAnalysis: () => void
  filteredRanked: RankedContent[]
  libraryItems: LibraryItem[]
  onImportCsv: (event: ChangeEvent<HTMLInputElement>) => void
  savedSearches: SavedSearch[]
  saveSearch: () => void
  setActivePage: (value: PageKey) => void
  setBrandRules: (updater: (current: BrandRule[]) => BrandRule[]) => void
  setCalendarItems: (updater: (current: CalendarItem[]) => CalendarItem[]) => void
  setLibraryItems: (updater: (current: LibraryItem[]) => LibraryItem[]) => void
  setSavedSearches: (updater: (current: SavedSearch[]) => SavedSearch[]) => void
  setSettings: (updater: (current: AppSettings) => AppSettings) => void
  setTeamMembers: (updater: (current: TeamMember[]) => TeamMember[]) => void
  settings: AppSettings
  summary: PatternSummary
  teamMembers: TeamMember[]
}) {
  if (activePage === 'Overview') {
    return (
      <div className="subpage">
        <PageCard
          subtitle="Live workspace summary. All numbers come from imported or user-created records."
          title="Go-to-market overview"
        >
          <div className="placeholder-grid">
            <Metric title="Research rows" value={String(contentItems.length)} />
            <Metric title="Verified rows" value={String(contentItems.filter((item) => item.sourceQuality === 'verified').length)} />
            <Metric title="Draft assets" value={String(libraryItems.length)} />
          </div>
          <ActionRow
            actions={[
              { label: 'Open research', onClick: () => setActivePage('Research') },
              { label: 'Export analysis', onClick: exportAnalysis },
            ]}
            extra={<ImportCsvButton onChange={onImportCsv} />}
          />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Pattern Engine') {
    const columns = buildPatternColumns(summary)
    return (
      <div className="subpage">
        <PageCard
          subtitle="Reusable hooks, topics, formats, and visual styles calculated from imported winners."
          title="Pattern Engine"
        >
          {summary.sampleSize === 0 ? (
            <EmptyState
              text="Import content rows first. The engine will group patterns by hook type, topic, format, length, and visual style."
              title="No imported content"
            />
          ) : (
            <div className="pattern-grid-large">
              {columns.map((column) => (
                <div className="pattern-block" key={column.title}>
                  <div className="insight-heading">
                    {column.icon}
                    <strong>{column.title}</strong>
                  </div>
                  <ol>
                    {column.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                  <button className="link-button" onClick={exportAnalysis} type="button">
                    Export pattern
                  </button>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Calendar') {
    return (
      <DataPage
        action={action}
        buttonLabel="Remove"
        emptyText="Save a draft and add it to the calendar to create the first scheduled item."
        onAction={(id) => setCalendarItems((current) => current.filter((item) => item.id !== id))}
        rows={calendarItems.map((item) => ({
          id: item.id,
          cells: [formatDate(item.date), item.platform, item.title, item.status],
        }))}
        title="Publishing Calendar"
        toolbar={[
          { label: 'Add draft', onClick: addDraftToCalendar },
          { label: 'Export analysis', onClick: exportAnalysis },
        ]}
      />
    )
  }

  if (activePage === 'Content Library') {
    return (
      <DataPage
        action={action}
        buttonLabel="Remove"
        emptyText="Saved drafts and uploaded asset records will appear here."
        onAction={(id) => setLibraryItems((current) => current.filter((item) => item.id !== id))}
        rows={libraryItems.map((item) => ({
          id: item.id,
          cells: [item.title, item.type, item.status, item.audience],
        }))}
        title="Content Library"
        toolbar={[
          { label: 'Add asset', onClick: addLibraryItem },
          { label: 'Open draft studio', onClick: () => setActivePage('Research') },
        ]}
      />
    )
  }

  if (activePage === 'Reports') {
    const rows = platformReportRows(filteredRanked)
    return (
      <div className="subpage">
        <PageCard
          subtitle="Performance report from the active imported research set."
          title="Reports"
        >
          <div className="placeholder-grid">
            <Metric title="Median engagement" value={formatPercent(summary.medianEngagementRate)} />
            <Metric title="Best platform" value={rows[0]?.cells[0] ?? 'No data'} />
            <Metric title="Sample size" value={String(summary.sampleSize)} />
          </div>
          <DataTable
            emptyText="Import rows to calculate platform reports."
            rows={rows}
          />
          <ActionRow actions={[{ label: 'Export report', onClick: exportAnalysis }]} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Saved Searches') {
    return (
      <DataPage
        action={action}
        buttonLabel="Remove"
        emptyText="Save the active Research filter to keep a repeatable discovery workflow."
        onAction={(id) => setSavedSearches((current) => current.filter((item) => item.id !== id))}
        rows={savedSearches.map((item) => ({
          id: item.id,
          cells: [item.query, item.platforms, `${item.results} rows`, formatDate(item.savedAt)],
        }))}
        title="Saved Searches"
        toolbar={[{ label: 'Save active search', onClick: saveSearch }]}
      />
    )
  }

  if (activePage === 'Brand Voice') {
    return (
      <div className="subpage">
        <PageCard
          subtitle="Editable guardrails for credible Amsterdam Game Lab and Pro Actief copy."
          title="Brand Voice"
        >
          <div className="placeholder-grid">
            {brandRules.map((rule) => (
              <EditableCard
                key={rule.id}
                onChange={(value) =>
                  setBrandRules((current) =>
                    current.map((item) => (item.id === rule.id ? { ...item, text: value } : item)),
                  )
                }
                onRemove={() => setBrandRules((current) => current.filter((item) => item.id !== rule.id))}
                text={rule.text}
                title={rule.category}
              />
            ))}
          </div>
          {brandRules.length === 0 ? (
            <EmptyState
              text="Add tone rules, phrases to use, and claims to avoid before writing content."
              title="No brand rules"
            />
          ) : null}
          <ActionRow actions={[{ label: 'Add rule', onClick: addBrandRule }]} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Team') {
    return (
      <DataPage
        action={action}
        buttonLabel="Remove"
        emptyText="Add reviewers or content owners so every generated draft has a human checkpoint."
        onAction={(id) => setTeamMembers((current) => current.filter((item) => item.id !== id))}
        rows={teamMembers.map((member) => ({
          id: member.id,
          cells: [member.name, member.role, member.responsibility, member.status],
        }))}
        title="Team Workspace"
        toolbar={[{ label: 'Add member', onClick: addTeamMember }]}
      />
    )
  }

  return (
    <div className="subpage">
      <PageCard
        subtitle="Operational controls for a manual-review content workflow."
        title="Settings"
      >
        <div className="settings-grid">
          <SettingToggle
            active={settings.requireVerifiedMetrics}
            label="Require verified metrics"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                requireVerifiedMetrics: !current.requireVerifiedMetrics,
              }))
            }
          />
          <SettingToggle
            active={settings.manualPublishingOnly}
            label="Manual publishing only"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                manualPublishingOnly: !current.manualPublishingOnly,
              }))
            }
          />
          <SettingToggle
            active={settings.reviewBeforeExport}
            label="Review before export"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                reviewBeforeExport: !current.reviewBeforeExport,
              }))
            }
          />
          <SettingToggle
            active={settings.storeLocally}
            label="Store workspace locally"
            onClick={() =>
              setSettings((current) => ({
                ...current,
                storeLocally: !current.storeLocally,
              }))
            }
          />
        </div>
        <ActionRow
          actions={[
            { label: 'Export backup', onClick: exportAnalysis },
            { label: 'Clear workspace', onClick: clearWorkspace, danger: true },
          ]}
        />
      </PageCard>
    </div>
  )
}

function PageCard({ children, subtitle, title }: { children: ReactNode; subtitle: string; title: string }) {
  return (
    <section className="subpage-card wide">
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </section>
  )
}

function DataPage({
  action,
  buttonLabel,
  emptyText,
  onAction,
  rows,
  title,
  toolbar = [],
}: {
  action: (message: string) => void
  buttonLabel?: string
  emptyText: string
  onAction?: (id: string) => void
  rows: Array<{ id: string; cells: string[] }>
  title: string
  toolbar?: Array<{ label: string; onClick: () => void }>
}) {
  return (
    <div className="subpage">
      <PageCard title={title} subtitle="Workspace records created from imports or user actions.">
        <DataTable
          buttonLabel={buttonLabel}
          emptyText={emptyText}
          onAction={(id, label) => {
            onAction?.(id)
            action(`${label}: ${id}`)
          }}
          rows={rows}
        />
        {toolbar.length > 0 ? <ActionRow actions={toolbar} /> : null}
      </PageCard>
    </div>
  )
}

function DataTable({
  buttonLabel,
  emptyText,
  onAction,
  rows,
}: {
  buttonLabel?: string
  emptyText: string
  onAction?: (id: string, label: string) => void
  rows: Array<{ id: string; cells: string[] }>
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td>
                <EmptyState text={emptyText} title="No records yet" />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, index) => (
                  <td key={`${row.id}-${index}`}>{cell}</td>
                ))}
                {buttonLabel ? (
                  <td>
                    <button
                      className="compact-action danger-compact"
                      onClick={() => onAction?.(row.id, buttonLabel)}
                      type="button"
                    >
                      <Trash2 size={14} />
                      {buttonLabel}
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="placeholder-card metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ActionRow({
  actions,
  extra,
}: {
  actions: Array<{ danger?: boolean; label: string; onClick: () => void }>
  extra?: ReactNode
}) {
  return (
    <div className="action-row">
      {actions.map((item) => (
        <button
          className={`compact-action ${item.danger ? 'danger-compact' : ''}`}
          key={item.label}
          onClick={item.onClick}
          type="button"
        >
          {item.label}
        </button>
      ))}
      {extra}
    </div>
  )
}

function ImportCsvButton({ onChange }: { onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="compact-action import-action">
      <Upload size={15} />
      Import CSV
      <input accept=".csv,text/csv" onChange={onChange} type="file" />
    </label>
  )
}

function EditableCard({
  onChange,
  onRemove,
  text,
  title,
}: {
  onChange: (value: string) => void
  onRemove: () => void
  text: string
  title: string
}) {
  return (
    <div className="placeholder-card editable-card">
      <div className="editable-card-head">
        <strong>{title}</strong>
        <button aria-label={`Remove ${title}`} onClick={onRemove} type="button">
          <Trash2 size={14} />
        </button>
      </div>
      <textarea value={text} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function EmptyState({ text, title }: { text: string; title: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  )
}

function SettingToggle({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button className="setting-toggle" onClick={onClick} type="button">
      <span>{label}</span>
      <strong>{active ? 'On' : 'Off'}</strong>
    </button>
  )
}

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button aria-current={active ? 'page' : undefined} className={active ? 'active' : ''} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
    </button>
  )
}

function SelectBox({
  icon,
  label,
  onClick,
  value,
}: {
  icon?: ReactNode
  label: string
  onClick: () => void
  value: string
}) {
  return (
    <label className="select-box">
      <span>{label}</span>
      <button aria-label={value} className="select-control" onClick={onClick} type="button">
        {icon}
        <strong>{value}</strong>
        <ChevronDown size={17} />
      </button>
    </label>
  )
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return <span className={`platform-badge ${platform.toLowerCase()}`}>{platformLabel(platform)}</span>
}

function platformLabel(platform: Platform) {
  if (platform === 'LinkedIn') return 'in'
  if (platform === 'YouTube') return 'YT'
  if (platform === 'Instagram') return 'IG'
  return 'TT'
}

function ContentType({ format }: { format: string }) {
  const normalized = format.toLowerCase()
  const icon =
    normalized.includes('video') || normalized.includes('reel') || normalized.includes('short') ? (
      <Video size={15} />
    ) : normalized.includes('carousel') || normalized.includes('image') ? (
      <ImageIcon size={15} />
    ) : (
      <FileText size={15} />
    )

  return (
    <span className="content-type">
      {icon}
      {format || 'Content'}
    </span>
  )
}

function buildPatternColumns(summary: PatternSummary) {
  return [
    {
      icon: <Zap size={20} />,
      title: 'Top Hooks',
      items: summary.topHooks.map((item) => `${item.label} (${item.count})`),
      link: 'View hook evidence',
    },
    {
      icon: <Tags size={20} />,
      title: 'Top Topics',
      items: summary.topTopics.map((item) => `${item.label} (${item.count})`),
      link: 'View topics',
    },
    {
      icon: <Table2 size={20} />,
      title: 'Top Formats',
      items: summary.topFormats.map((item) => `${item.label} (${item.count})`),
      link: 'View formats',
    },
    {
      icon: <CalendarDays size={20} />,
      title: 'Ideal Length',
      items: [
        `Sample: ${summary.sampleSize}`,
        `Median ER: ${formatPercent(summary.medianEngagementRate)}`,
        `Target length: ${summary.recommendedLength}`,
      ],
      link: 'View guidance',
    },
    {
      icon: <ImageIcon size={20} />,
      title: 'Visual Style',
      items: summary.topVisualStyles.map((item) => `${item.label} (${item.count})`),
      link: 'View examples',
    },
  ]
}

function buildHashtags(summary: PatternSummary) {
  const topicTags = summary.topTopics
    .slice(0, 4)
    .map((item) => `#${item.label.replace(/[^a-z0-9]+/gi, '')}`)
    .filter((item) => item.length > 1)

  return [...topicTags, '#WorkplaceWellbeing', '#LearningAndDevelopment', '#SeriousGames']
}

function platformReportRows(rows: RankedContent[]) {
  const reportRows: Array<{ id: string; cells: string[] }> = []

  for (const platform of platforms) {
    const platformRows = rows.filter((item) => item.platform === platform)
    if (platformRows.length === 0) continue

    const averageScore = Math.round(
      platformRows.reduce((total, item) => total + item.score, 0) / platformRows.length,
    )
    const averageEngagement =
      platformRows.reduce((total, item) => total + item.engagementRate, 0) / platformRows.length
    const bestFormat = platformRows[0]?.format ?? 'No format'

    reportRows.push({
      id: platform,
      cells: [platform, String(averageScore), formatPercent(averageEngagement), bestFormat],
    })
  }

  return reportRows.sort((a, b) => Number(b.cells[1]) - Number(a.cells[1]))
}

function confidenceLabel(sourceQuality: ContentItem['sourceQuality']) {
  return sourceQuality === 'verified' ? 'Verified' : 'Imported'
}

function buildReferences(rows: RankedContent[], selectedId?: string) {
  const selected = rows.find((item) => item.id === selectedId)
  const remainder = rows.filter((item) => item.id !== selectedId)
  return selected ? [selected, ...remainder].slice(0, 3) : rows.slice(0, 3)
}

function mergeContentItems(next: ContentItem[], current: ContentItem[]) {
  const seen = new Set<string>()
  const merged: ContentItem[] = []

  for (const item of [...next, ...current]) {
    const key = item.url || `${item.platform}-${item.title}-${item.date}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }

  return merged
}

function dateRangeLabel(rows: RankedContent[]) {
  const timestamps = rows
    .map((item) => new Date(item.date).getTime())
    .filter((time) => Number.isFinite(time))

  if (timestamps.length === 0) return 'Import date range'

  const start = new Date(Math.min(...timestamps)).toISOString()
  const end = new Date(Math.max(...timestamps)).toISOString()
  return `${formatDate(start)} - ${formatDate(end)}`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value || 'No date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function nextIsoDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function cycleValue<T>(current: T, options: T[]) {
  const index = options.indexOf(current)
  return options[(index + 1) % options.length]
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === 'undefined') return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback))

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

export default App
