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
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import './App.css'

type Platform = 'LinkedIn' | 'YouTube' | 'Instagram' | 'TikTok'
type Confidence = 'Medium' | 'Low'
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

interface PrototypeRow {
  id: number
  title: string
  platform: Platform
  account: string
  type: 'Text Post' | 'Video' | 'Carousel' | 'Article'
  score: number
  engagement: string
  views: string
  published: string
  confidence: Confidence
}

const rows: PrototypeRow[] = [
  ['Stop calling it soft skills.', 'LinkedIn', 'Pro Actief', 'Text Post', 86, '1.2K', '52K', 'May 16, 2025', 'Medium'],
  ['Zo bouw je een leercultuur die blijft.', 'YouTube', 'AGL Learning', 'Video', 82, '980', '34K', 'May 12, 2025', 'Medium'],
  ['5 vragen voor sterkere gesprekken', 'Instagram', 'Pro Actief', 'Carousel', 79, '1.1K', '29K', 'May 14, 2025', 'Medium'],
  ['Leiderschap begint bij luisteren.', 'LinkedIn', 'AGL', 'Text Post', 76, '842', '26K', 'May 10, 2025', 'Medium'],
  ['3 manieren om feedback veilig te maken', 'TikTok', 'Pro Actief', 'Video', 74, '2.3K', '41K', 'May 11, 2025', 'Low'],
  ['Waar focus, flow en resultaat samenkomen', 'LinkedIn', 'AGL', 'Article', 71, '620', '18K', 'May 9, 2025', 'Low'],
  ['Team check-in template', 'Instagram', 'AGL Learning', 'Carousel', 68, '780', '22K', 'May 8, 2025', 'Low'],
  ['Learning is a team sport', 'TikTok', 'AGL Learning', 'Video', 66, '1.1K', '24K', 'May 7, 2025', 'Low'],
].map((item, index) => ({
  id: index + 1,
  title: item[0] as string,
  platform: item[1] as Platform,
  account: item[2] as string,
  type: item[3] as PrototypeRow['type'],
  score: item[4] as number,
  engagement: item[5] as string,
  views: item[6] as string,
  published: item[7] as string,
  confidence: item[8] as Confidence,
}))

const postCopy = `Sterk leiderschap begint niet bij de grote beslissingen,
maar bij de kleine momenten van aandacht.

Luisteren. Doorvragen. Ruimte geven.

Daar bouwen teams aan vertrouwen, eigenaarschap en groei.

Welke kleine gewoonte maakt voor jou het grootste verschil
in je team?`

const patternColumns = [
  {
    icon: <Zap size={20} />,
    title: 'Top Hooks',
    items: ['Stop doing X.', 'Zo bouw je...', '3 manieren om...', 'Wat werkgevers vaak missen...', 'Leiderschap begint bij...'],
    link: 'View more (18)',
  },
  {
    icon: <Tags size={20} />,
    title: 'Top Topics',
    items: ['Leercultuur', 'Leiderschap', 'Feedback & gesprekken', 'Skills & ontwikkeling', 'Teamwerk & samenwerking'],
    link: 'View more (21)',
  },
  {
    icon: <Table2 size={20} />,
    title: 'Top Formats',
    items: ['Text Post 34%', 'Short Video 28%', 'Carousel 22%', 'Article 10%', 'Live/Long Form 6%'],
    link: 'View more (6)',
  },
  {
    icon: <CalendarDays size={20} />,
    title: 'Ideal Length',
    items: ['Text: 80-140 words', 'Video: 30-60 sec', 'Carousel: 5-7 slides', 'Article: 800-1,200 words'],
    link: 'View guidance',
  },
  {
    icon: <ImageIcon size={20} />,
    title: 'Visual Style',
    items: ['Clean & minimal', 'Real people', 'On-brand teal accents', 'Bold text overlays', 'Light backgrounds'],
    link: 'View examples',
  },
]

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

const calendarItems = [
  ['May 20', 'LinkedIn', 'Manager check-in carousel', 'Ready for review'],
  ['May 22', 'Instagram', 'Stress signal reel', 'Drafting'],
  ['May 27', 'YouTube', 'Pro Actief workshop short', 'Needs footage'],
  ['Jun 03', 'TikTok', 'Debrief question clip', 'Scheduled'],
]

const libraryItems = [
  ['IGLO explainer deck', 'Slides', 'Brand approved', 'L&D managers'],
  ['Pro Actief workshop photos', 'Image set', 'Needs consent check', 'HR leads'],
  ['Client logo reference sheet', 'Asset', 'Internal only', 'Sales deck'],
  ['Facilitator video clips', 'Video', 'Ready for editing', 'Short-form content'],
]

const savedSearches = [
  ['HR burnout prevention', 'LinkedIn + YouTube', '24 winners found'],
  ['Team-building debrief questions', 'TikTok + Instagram', '18 winners found'],
  ['Learning culture posts', 'LinkedIn', '31 winners found'],
]

const teamMembers = [
  ['Jamie Bakker', 'Content Strategist', 'Owns calendar', 'Active'],
  ['Mila de Vries', 'Facilitator', 'Reviews brand fit', 'Active'],
  ['Noah Janssen', 'Marketing Lead', 'Approves publishing', 'Away'],
  ['Sofia Klein', 'L&D Advisor', 'Checks HR relevance', 'Active'],
]

function App() {
  const [activePage, setActivePage] = useState<PageKey>('Research')
  const [draftTab, setDraftTab] = useState<DraftTab>('Post Copy')
  const [draftText, setDraftText] = useState(postCopy)
  const [cta, setCta] = useState('Deel je ervaring in de comments!')
  const [notice, setNotice] = useState('Ready')
  const wordCount = useMemo(() => draftText.trim().split(/\s+/).filter(Boolean).length, [draftText])

  function action(message: string) {
    setNotice(message)
  }

  function generateDraft() {
    setDraftText(postCopy)
    setCta('Plan een korte teamsessie met Pro Actief.')
    action('Draft regenerated from selected pattern')
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(`${draftText}\n\n${cta}`)
    action('Draft copied')
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

        <button className="sidebar-user" onClick={() => action('User menu opened')} type="button">
          <span>JB</span>
          <div>
            <strong>Jamie Bakker</strong>
            <small>Content Strategist</small>
          </div>
          <ChevronDown size={17} />
        </button>
      </aside>

      <main className="research-page">
        <header className="research-topbar">
          <h1>{activePage}</h1>
          <div className="status-strip">
            <ShieldCheck size={21} />
            <span>Verified metrics only. Replace demo data with verified metrics before publishing.</span>
            <strong>{notice}</strong>
            <i />
            <button aria-label="Help" onClick={() => action('Help panel opened')} type="button">
              <CircleHelp size={21} />
            </button>
            <button aria-label="Notifications" onClick={() => action('Notifications checked')} type="button">
              <Bell size={21} />
            </button>
          </div>
        </header>

        {activePage === 'Research' ? (
          <ResearchPage
            action={action}
            copyDraft={copyDraft}
            cta={cta}
            draftTab={draftTab}
            draftText={draftText}
            generateDraft={generateDraft}
            setCta={setCta}
            setDraftTab={setDraftTab}
            setDraftText={setDraftText}
            wordCount={wordCount}
          />
        ) : (
          <SidebarPage action={action} activePage={activePage} />
        )}
      </main>
    </div>
  )
}

function ResearchPage({
  action,
  copyDraft,
  cta,
  draftTab,
  draftText,
  generateDraft,
  setCta,
  setDraftTab,
  setDraftText,
  wordCount,
}: {
  action: (message: string) => void
  copyDraft: () => Promise<void>
  cta: string
  draftTab: DraftTab
  draftText: string
  generateDraft: () => void
  setCta: (value: string) => void
  setDraftTab: (value: DraftTab) => void
  setDraftText: (value: string) => void
  wordCount: number
}) {
  return (
    <>
      <section className="filter-row" aria-label="Research filters">
        <SelectBox label="ICP" onClick={() => action('ICP filter opened')} value="HR & L&D Professionals" />
        <SelectBox label="Platform" onClick={() => action('Platform filter opened')} value="All Platforms" />
        <SelectBox label="Objective" onClick={() => action('Objective filter opened')} value="Awareness" />
        <SelectBox label="Tone" onClick={() => action('Tone filter opened')} value="Professional & Warm" />
        <button className="date-button" onClick={() => action('Date range opened')} type="button">
          <CalendarDays size={17} />
          May 5 - May 18, 2025
        </button>
        <button className="filter-button" onClick={() => action('Advanced filters opened')} type="button">
          <Search size={17} />
          Filters
        </button>
        <button className="save-button" onClick={() => action('Search saved')} type="button">
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
                <span>(by traction)</span>
                <Info size={16} />
              </div>
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
                    <th>Traction Score {'\u2193'}</th>
                    <th>Engagement <span>(Demo)</span></th>
                    <th>Views <span>(Demo)</span></th>
                    <th>Published</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} onClick={() => action(`${row.title} selected`)}>
                      <td>{row.id}</td>
                      <td className="title-cell">{row.title}</td>
                      <td><PlatformBadge platform={row.platform} /></td>
                      <td>{row.account}</td>
                      <td><ContentType type={row.type} /></td>
                      <td className="score-cell">{row.score}</td>
                      <td>{row.engagement}</td>
                      <td>{row.views}</td>
                      <td>{row.published}</td>
                      <td>
                        <span className={`confidence ${row.confidence.toLowerCase()}`}>
                          {row.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing 1-8 of 240 results</span>
              <div className="pagination">
                {['\u2039', '1', '2', '3', '4', '5', '...', '30', '\u203a'].map((item) => (
                  <button
                    className={item === '1' ? 'active' : ''}
                    key={item}
                    onClick={() => action(`Page ${item} clicked`)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="insights-panel">
            <div className="insights-title">
              <h2>Pattern Insights</h2>
              <span>(AI summary from top content)</span>
              <Info size={16} />
            </div>

            <div className="insight-columns">
              {patternColumns.map((column) => (
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

            <div className="insight-disclaimer">
              <Info size={17} />
              <span>These are AI-derived patterns from demo data. Replace with verified metrics before publishing.</span>
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
              {(['Post Copy', 'Hooks', 'Video Outline', 'Hashtags'] as DraftTab[]).map((tab) => (
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
              <SelectBox label="Brand / Client" onClick={() => action('Brand selector opened')} value="Pro Actief" />
              <SelectBox label="Content Pillar" onClick={() => action('Content pillar selector opened')} value="Leiderschap" />
              <SelectBox icon={<span className="mini-linkedin">in</span>} label="Platform" onClick={() => action('Draft platform selector opened')} value="LinkedIn" />
              <SelectBox label="Objective" onClick={() => action('Draft objective selector opened')} value="Awareness" />
            </div>

            {draftTab === 'Post Copy' ? (
              <>
                <label className="draft-field">
                  <span>
                    Post Copy <em>Demo draft - review and replace with verified insights.</em>
                  </span>
                  <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} />
                </label>
                <div className="copy-meta">
                  <span>Word count: {wordCount}</span>
                  <span>Characters: {draftText.length}</span>
                </div>
              </>
            ) : (
              <DraftTabContent tab={draftTab} />
            )}

            <label className="draft-field cta-field">
              <span>Call to Action (optional)</span>
              <input value={cta} onChange={(event) => setCta(event.target.value)} />
              <small>{cta.length} / 100</small>
            </label>

            <div className="warning-box">
              <Info size={22} />
              <div>
                <strong>Demo content. No fabricated claims.</strong>
                <span>Replace with verified metrics and real quotes before publishing.</span>
              </div>
            </div>

            <div className="draft-actions">
              <button className="secondary-action" onClick={copyDraft} type="button">
                <Copy size={16} />
                Save draft
              </button>
              <button className="calendar-action" onClick={() => action('Draft added to calendar')} type="button">
                <CalendarDays size={17} />
                Add to Calendar
              </button>
              <button className="calendar-caret" onClick={() => action('Calendar options opened')} type="button">
                <ChevronDown size={17} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

function DraftTabContent({ tab }: { tab: Exclude<DraftTab, 'Post Copy'> }) {
  const content = {
    Hooks: ['Stop calling it soft skills.', 'A team can look calm and still carry stress.', 'What if stress prevention started with play?'],
    'Video Outline': ['0-3s: Show a facilitator placing a card.', '3-20s: Team reacts and discusses.', '20-45s: Debrief question connects play to work.'],
    Hashtags: ['#LearningAndDevelopment', '#WorkplaceWellbeing', '#TeamDevelopment', '#SeriousGames'],
  }[tab]

  return (
    <div className="draft-tab-content">
      {content.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  )
}

function SidebarPage({ action, activePage }: { action: (message: string) => void; activePage: PageKey }) {
  if (activePage === 'Overview') {
    return (
      <div className="subpage">
        <PageCard title="Go-to-market overview" subtitle="Live dummy snapshot for the AGLI workflow.">
          <div className="placeholder-grid">
            <Metric title="Content winners" value="240" />
            <Metric title="Drafts this month" value="18" />
            <Metric title="Ready to review" value="7" />
          </div>
          <ActionRow action={action} labels={['Start research run', 'Import metrics', 'Open calendar']} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Pattern Engine') {
    return (
      <div className="subpage">
        <PageCard title="Pattern Engine" subtitle="Reusable hooks, topics, formats, and visual styles from winning content.">
          <div className="pattern-grid-large">
            {patternColumns.map((column) => (
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
                <button className="link-button" onClick={() => action(`${column.title} exported`)} type="button">
                  Export pattern
                </button>
              </div>
            ))}
          </div>
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Calendar') {
    return <DataPage action={action} buttonLabel="Schedule" rows={calendarItems} title="Publishing Calendar" />
  }

  if (activePage === 'Content Library') {
    return <DataPage action={action} buttonLabel="Open asset" rows={libraryItems} title="Content Library" />
  }

  if (activePage === 'Reports') {
    return (
      <div className="subpage">
        <PageCard title="Reports" subtitle="Dummy performance report for demo validation.">
          <div className="placeholder-grid">
            <Metric title="Median engagement" value="5.5%" />
            <Metric title="Best platform" value="LinkedIn" />
            <Metric title="Share rate" value="1.8%" />
          </div>
          <DataTable rows={[['LinkedIn', '86', '5.9%', 'Text post'], ['YouTube', '82', '4.8%', 'Short video'], ['Instagram', '79', '6.1%', 'Carousel']]} />
          <ActionRow action={action} labels={['Export report', 'Compare month', 'Share with team']} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Saved Searches') {
    return <DataPage action={action} buttonLabel="Run search" rows={savedSearches} title="Saved Searches" />
  }

  if (activePage === 'Brand Voice') {
    return (
      <div className="subpage">
        <PageCard title="Brand Voice" subtitle="Rules for credible Pro Actief copy.">
          <div className="placeholder-grid">
            <PlaceholderCard title="Do" text="Be practical, calm, specific, and human." />
            <PlaceholderCard title="Avoid" text="Clickbait, clinical promises, fake ROI, and invented quotes." />
            <PlaceholderCard title="Use" text="IGLO, stress prevention, facilitated serious game, team reflection." />
          </div>
          <ActionRow action={action} labels={['Approve tone', 'Edit phrases', 'Upload brand docs']} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Team') {
    return <DataPage action={action} buttonLabel="Assign" rows={teamMembers} title="Team Workspace" />
  }

  return (
    <div className="subpage">
      <PageCard title="Settings" subtitle="Demo controls for the prototype workspace.">
        <div className="settings-grid">
          {['Require verified metrics', 'Show demo labels', 'Manual publishing only', 'Review before export'].map((item) => (
            <button className="setting-toggle" key={item} onClick={() => action(`${item} toggled`)} type="button">
              <span>{item}</span>
              <strong>On</strong>
            </button>
          ))}
        </div>
        <ActionRow action={action} labels={['Save settings', 'Reset demo data', 'Download backup']} />
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
  rows: dataRows,
  title,
}: {
  action: (message: string) => void
  buttonLabel: string
  rows: string[][]
  title: string
}) {
  return (
    <div className="subpage">
      <PageCard title={title} subtitle="Dummy data for a functional prototype flow.">
        <DataTable buttonLabel={buttonLabel} onAction={action} rows={dataRows} />
      </PageCard>
    </div>
  )
}

function DataTable({
  buttonLabel,
  onAction,
  rows: dataRows,
}: {
  buttonLabel?: string
  onAction?: (message: string) => void
  rows: string[][]
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <tbody>
          {dataRows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
              {buttonLabel ? (
                <td>
                  <button className="compact-action" onClick={() => onAction?.(`${buttonLabel}: ${row[0]}`)} type="button">
                    {buttonLabel}
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
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

function ActionRow({ action, labels }: { action: (message: string) => void; labels: string[] }) {
  return (
    <div className="action-row">
      {labels.map((label) => (
        <button className="compact-action" key={label} onClick={() => action(`${label} clicked`)} type="button">
          {label}
        </button>
      ))}
    </div>
  )
}

function PlaceholderCard({ text, title }: { text: string; title: string }) {
  return (
    <div className="placeholder-card">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
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
  if (platform === 'YouTube') return '\u25b6'
  if (platform === 'Instagram') return '\u25ce'
  return '\u266a'
}

function ContentType({ type }: { type: PrototypeRow['type'] }) {
  const icon =
    type === 'Video' ? (
      <Video size={15} />
    ) : type === 'Carousel' ? (
      <ImageIcon size={15} />
    ) : (
      <FileText size={15} />
    )

  return (
    <span className="content-type">
      {icon}
      {type}
    </span>
  )
}

export default App
