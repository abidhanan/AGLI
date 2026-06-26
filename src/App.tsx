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
  PencilLine,
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
  {
    id: 1,
    title: 'Stop calling it soft skills.',
    platform: 'LinkedIn',
    account: 'Pro Actief',
    type: 'Text Post',
    score: 86,
    engagement: '1.2K',
    views: '52K',
    published: 'May 16, 2025',
    confidence: 'Medium',
  },
  {
    id: 2,
    title: 'Zo bouw je een leercultuur die blijft.',
    platform: 'YouTube',
    account: 'AGL Learning',
    type: 'Video',
    score: 82,
    engagement: '980',
    views: '34K',
    published: 'May 12, 2025',
    confidence: 'Medium',
  },
  {
    id: 3,
    title: '5 vragen voor sterkere gesprekken',
    platform: 'Instagram',
    account: 'Pro Actief',
    type: 'Carousel',
    score: 79,
    engagement: '1.1K',
    views: '29K',
    published: 'May 14, 2025',
    confidence: 'Medium',
  },
  {
    id: 4,
    title: 'Leiderschap begint bij luisteren.',
    platform: 'LinkedIn',
    account: 'AGL',
    type: 'Text Post',
    score: 76,
    engagement: '842',
    views: '26K',
    published: 'May 10, 2025',
    confidence: 'Medium',
  },
  {
    id: 5,
    title: '3 manieren om feedback veilig te maken',
    platform: 'TikTok',
    account: 'Pro Actief',
    type: 'Video',
    score: 74,
    engagement: '2.3K',
    views: '41K',
    published: 'May 11, 2025',
    confidence: 'Low',
  },
  {
    id: 6,
    title: 'Waar focus, flow en resultaat samenkomen',
    platform: 'LinkedIn',
    account: 'AGL',
    type: 'Article',
    score: 71,
    engagement: '620',
    views: '18K',
    published: 'May 9, 2025',
    confidence: 'Low',
  },
  {
    id: 7,
    title: 'Team check-in template',
    platform: 'Instagram',
    account: 'AGL Learning',
    type: 'Carousel',
    score: 68,
    engagement: '780',
    views: '22K',
    published: 'May 8, 2025',
    confidence: 'Low',
  },
  {
    id: 8,
    title: 'Learning is a team sport',
    platform: 'TikTok',
    account: 'AGL Learning',
    type: 'Video',
    score: 66,
    engagement: '1.1K',
    views: '24K',
    published: 'May 7, 2025',
    confidence: 'Low',
  },
]

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
    items: [
      'Stop doing X.',
      'Zo bouw je...',
      '3 manieren om...',
      'Wat werkgevers vaak missen...',
      'Leiderschap begint bij...',
    ],
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
    items: ['Text Post              34%', 'Short Video            28%', 'Carousel               22%', 'Article                10%', 'Live/Long Form          6%'],
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

function App() {
  const [draftText, setDraftText] = useState(postCopy)
  const [cta, setCta] = useState('Deel je ervaring in de comments!')
  const wordCount = useMemo(() => draftText.trim().split(/\s+/).filter(Boolean).length, [draftText])

  function generateDraft() {
    setDraftText(postCopy)
    setCta('Plan een korte teamsessie met Pro Actief.')
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(`${draftText}\n\n${cta}`)
  }

  return (
    <div className="prototype-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <strong>AGLI</strong>
          <span>Amsterdam Game Lab Intelligence</span>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          <NavItem icon={<Home size={18} />} label="Overview" />
          <NavItem active icon={<Search size={19} />} label="Research" />
          <NavItem icon={<Table2 size={18} />} label="Pattern Engine" />
          <NavItem icon={<PencilLine size={18} />} label="Draft Studio" />
          <NavItem icon={<CalendarDays size={18} />} label="Calendar" />
          <NavItem icon={<Folder size={18} />} label="Content Library" />
          <NavItem icon={<LineChart size={18} />} label="Reports" />
          <NavItem icon={<Bookmark size={18} />} label="Saved Searches" />
        </nav>

        <div className="nav-divider" />

        <nav className="nav-list nav-secondary" aria-label="Settings navigation">
          <NavItem icon={<MessageSquare size={18} />} label="Brand Voice" />
          <NavItem icon={<Users size={18} />} label="Team" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="sidebar-user">
          <span>JB</span>
          <div>
            <strong>Jamie Bakker</strong>
            <small>Content Strategist</small>
          </div>
          <ChevronDown size={17} />
        </div>
      </aside>

      <main className="research-page">
        <header className="research-topbar">
          <h1>Research</h1>
          <div className="status-strip">
            <ShieldCheck size={21} />
            <span>Verified metrics only. Replace demo data with verified metrics before publishing.</span>
            <strong>No fabricated claims</strong>
            <i />
            <CircleHelp size={21} />
            <Bell size={21} />
          </div>
        </header>

        <section className="filter-row" aria-label="Research filters">
          <SelectBox label="ICP" value="HR & L&D Professionals" />
          <SelectBox label="Platform" value="All Platforms" />
          <SelectBox label="Objective" value="Awareness" />
          <SelectBox label="Tone" value="Professional & Warm" />
          <button className="date-button" type="button">
            <CalendarDays size={17} />
            May 5 - May 18, 2025
          </button>
          <button className="filter-button" type="button">
            <Search size={17} />
            Filters
          </button>
          <button className="save-button" type="button">
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
                      <th>Traction Score ↓</th>
                      <th>Engagement <span>(Demo)</span></th>
                      <th>Views <span>(Demo)</span></th>
                      <th>Published</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td className="title-cell">{row.title}</td>
                        <td>
                          <PlatformBadge platform={row.platform} />
                        </td>
                        <td>{row.account}</td>
                        <td>
                          <ContentType type={row.type} />
                        </td>
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
                  <button type="button">‹</button>
                  <button className="active" type="button">1</button>
                  <button type="button">2</button>
                  <button type="button">3</button>
                  <button type="button">4</button>
                  <button type="button">5</button>
                  <span>...</span>
                  <button type="button">30</button>
                  <button type="button">›</button>
                </div>
              </div>
            </section>

            <section className="insights-panel" id="patterns">
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
                    <a href="#patterns">{column.link}</a>
                  </div>
                ))}
              </div>

              <div className="insight-disclaimer">
                <Info size={17} />
                <span>These are AI-derived patterns from demo data. Replace with verified metrics before publishing.</span>
              </div>
            </section>
          </div>

          <aside className="draft-card" id="draft-studio">
            <div className="draft-header">
              <h2>Draft Studio</h2>
              <button className="generate-button" type="button" onClick={generateDraft}>
                <Sparkles size={16} />
                Generate draft
              </button>
            </div>

            <div className="draft-tabs">
              <button className="active" type="button">Post Copy</button>
              <button type="button">Hooks</button>
              <button type="button">Video Outline</button>
              <button type="button">Hashtags</button>
            </div>

            <div className="draft-form-grid">
              <SelectBox label="Brand / Client" value="Pro Actief" />
              <SelectBox label="Content Pillar" value="Leiderschap" />
              <SelectBox icon={<span className="mini-linkedin">in</span>} label="Platform" value="LinkedIn" />
              <SelectBox label="Objective" value="Awareness" />
            </div>

            <label className="draft-field">
              <span>
                Post Copy <em>Demo draft — review and replace with verified insights.</em>
              </span>
              <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} />
            </label>

            <div className="copy-meta">
              <span>Word count: {wordCount}</span>
              <span>Characters: {draftText.length}</span>
            </div>

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
              <button className="secondary-action" type="button" onClick={copyDraft}>
                <Copy size={16} />
                Save draft
              </button>
              <button className="calendar-action" type="button">
                <CalendarDays size={17} />
                Add to Calendar
              </button>
              <button className="calendar-caret" type="button">
                <ChevronDown size={17} />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function NavItem({ active, icon, label }: { active?: boolean; icon: ReactNode; label: string }) {
  return (
    <a className={active ? 'active' : ''} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}>
      {icon}
      <span>{label}</span>
    </a>
  )
}

function SelectBox({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: string
}) {
  return (
    <label className="select-box">
      <span>{label}</span>
      <div>
        {icon}
        <strong>{value}</strong>
        <ChevronDown size={17} />
      </div>
    </label>
  )
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return <span className={`platform-badge ${platform.toLowerCase()}`}>{platformLabel(platform)}</span>
}

function platformLabel(platform: Platform) {
  if (platform === 'LinkedIn') return 'in'
  if (platform === 'YouTube') return '▶'
  if (platform === 'Instagram') return '◎'
  return '♪'
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
