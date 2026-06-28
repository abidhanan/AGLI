import {
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Database,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Folder,
  Home,
  Image as ImageIcon,
  Info,
  Keyboard,
  LineChart,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Tags,
  Trash2,
  Upload,
  User,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react'
import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
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
type AuthView = 'landing' | 'login' | 'app'
type Language = 'en' | 'id' | 'nl'
type PanelKey =
  | 'help'
  | 'notifications'
  | 'filters'
  | 'dateRange'
  | 'patterns'
  | 'profile'
  | 'dataSources'
  | 'shortcuts'
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
  | 'Profile'
  | 'Data Sources'
  | 'Shortcuts'
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
  language: Language
}

interface WorkspaceProfile {
  avatar: string
  email: string
  name: string
  role: string
  timezone: string
}

const platforms: Platform[] = ['LinkedIn', 'YouTube', 'Instagram', 'TikTok']
const platformOptions: PlatformFilter[] = ['All Platforms', ...platforms]
const icpOptions = ['HR & L&D Professionals', 'Team Leads', 'Managers', 'People Ops']
const objectiveOptions = ['Awareness', 'Discovery Call', 'Thought Leadership', 'Workshop Demand']
const toneOptions = ['Professional & Warm', 'Practical', 'Calm Expert', 'Direct']
const draftTabs: DraftTab[] = ['Post Copy', 'Hooks', 'Video Outline', 'Hashtags']
const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'English', value: 'en' },
  { label: 'Indonesia', value: 'id' },
  { label: 'Nederlands', value: 'nl' },
]

const translations: Record<Language, Record<string, string>> = {
  en: {},
  id: {
    'Overview': 'Ringkasan',
    'Research': 'Riset',
    'Pattern Engine': 'Mesin Pola',
    'Calendar': 'Kalender',
    'Content Library': 'Library Konten',
    'Reports': 'Laporan',
    'Saved Searches': 'Pencarian',
    'Brand Voice': 'Suara Brand',
    'Team': 'Tim',
    'Settings': 'Pengaturan',
    'Profile': 'Profil',
    'Data Sources': 'Sumber Data',
    'Shortcuts': 'Pintasan',
    'Update profile': 'Perbarui profil',
    'Data sources': 'Sumber data',
    'Logout': 'Keluar',
    'Login': 'Masuk',
    'Login to AGLI': 'Masuk ke AGLI',
    'Back to landing': 'Kembali ke landing',
    'Email': 'Email',
    'Password': 'Kata sandi',
    'Show password': 'Tampilkan kata sandi',
    'Hide password': 'Sembunyikan kata sandi',
    'Content intelligence for serious games that actually gets used.': 'Intelijen konten untuk serious game yang benar-benar dipakai.',
    'Research what earns attention with HR and L&D audiences, find the repeatable pattern, then draft credible Pro Actief content for human review.': 'Riset konten yang menarik perhatian audiens HR dan L&D, temukan pola yang bisa diulang, lalu buat draft Pro Actief yang kredibel untuk ditinjau manusia.',
    'Research what earns attention with HR and L&D audiences, find the repeatable pattern,\n            then draft credible Pro Actief content for human review.': 'Riset konten yang menarik perhatian audiens HR dan L&D, temukan pola yang bisa diulang, lalu buat draft Pro Actief yang kredibel untuk ditinjau manusia.',
    'Use the demo account below, or edit the profile details after entering.': 'Gunakan akun demo di bawah, atau ubah detail profil setelah masuk.',
    'Amsterdam Game Lab Intelligence': 'Amsterdam Game Lab Intelligence',
    'A lightweight workspace for content research, pattern discovery, and draft creation.': 'Workspace ringan untuk riset konten, penemuan pola, dan pembuatan draft.',
    'Verified metrics only. Import platform exports before publishing.': 'Hanya metrik terverifikasi. Impor ekspor platform sebelum publikasi.',
    'ICP': 'ICP',
    'Platform': 'Platform',
    'Objective': 'Tujuan',
    'Tone': 'Nada',
    'All Platforms': 'Semua Platform',
    'Awareness': 'Awareness',
    'Discovery Call': 'Discovery Call',
    'Thought Leadership': 'Thought Leadership',
    'Workshop Demand': 'Permintaan Workshop',
    'Professional & Warm': 'Profesional & Hangat',
    'Practical': 'Praktis',
    'Calm Expert': 'Ahli yang Tenang',
    'Direct': 'Langsung',
    'HR & L&D Professionals': 'Profesional HR & L&D',
    'Team Leads': 'Team Lead',
    'Managers': 'Manajer',
    'People Ops': 'People Ops',
    'Filters': 'Filter',
    'Save search': 'Simpan pencarian',
    'Top Performing Content': 'Konten Berkinerja Terbaik',
    'by imported traction': 'berdasarkan traction impor',
    'Import CSV': 'Impor CSV',
    '#': '#',
    'Title': 'Judul',
    'Account': 'Akun',
    'Type': 'Tipe',
    'Traction Score': 'Skor Traction',
    'Engagement': 'Engagement',
    'Views': 'Tayangan',
    'Published': 'Dipublikasikan',
    'Confidence': 'Keyakinan',
    'No research data imported': 'Belum ada data riset',
    'Upload a CSV export from LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, or manual research.': 'Unggah ekspor CSV dari LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, atau riset manual.',
    'Showing': 'Menampilkan',
    'of': 'dari',
    'imported rows': 'baris impor',
    'Pattern Insights': 'Insight Pola',
    'summary from imported content': 'ringkasan dari konten impor',
    'No patterns yet': 'Belum ada pola',
    'After import, AGLI will calculate hooks, topics, formats, lengths, and visual style patterns from the highest scoring rows.': 'Setelah impor, AGLI akan menghitung pola hook, topik, format, durasi, dan gaya visual dari baris dengan skor tertinggi.',
    'Patterns are computed only from imported rows. Verify every source before publishing.': 'Pola hanya dihitung dari baris impor. Verifikasi setiap sumber sebelum publikasi.',
    'Top Hooks': 'Hook Teratas',
    'Top Topics': 'Topik Teratas',
    'Top Formats': 'Format Teratas',
    'Ideal Length': 'Durasi Ideal',
    'Visual Style': 'Gaya Visual',
    'View hook evidence': 'Lihat bukti hook',
    'View topics': 'Lihat topik',
    'View formats': 'Lihat format',
    'View guidance': 'Lihat panduan',
    'View examples': 'Lihat contoh',
    'Draft Studio': 'Studio Draft',
    'Generate draft': 'Buat draft',
    'Post Copy': 'Copy Post',
    'Hooks': 'Hook',
    'Video Outline': 'Outline Video',
    'Hashtags': 'Hashtag',
    'Brand / Client': 'Brand / Klien',
    'Content Pillar': 'Pilar Konten',
    'Draft only - human review required.': 'Draft saja - perlu tinjauan manusia.',
    'Import research data, generate a draft, or write manually here.': 'Impor data riset, buat draft, atau tulis manual di sini.',
    'Word count': 'Jumlah kata',
    'Characters': 'Karakter',
    'Call to Action (optional)': 'Call to Action (opsional)',
    'Add a grounded CTA after review.': 'Tambahkan CTA yang berdasar setelah ditinjau.',
    'No fabricated claims.': 'Tidak ada klaim palsu.',
    'Use imported proof only. Add real quotes or client claims only when supplied.': 'Gunakan bukti impor saja. Tambahkan kutipan nyata atau klaim klien hanya jika tersedia.',
    'Save draft': 'Simpan draft',
    'Add to Calendar': 'Tambahkan ke Kalender',
    'Update photo': 'Perbarui foto',
    'Name': 'Nama',
    'Role': 'Peran',
    'Timezone': 'Zona waktu',
    'Operational controls for a manual-review content workflow.': 'Kontrol operasional untuk alur konten dengan review manual.',
    'Language': 'Bahasa',
    'Interface language': 'Bahasa antarmuka',
    'Choose the dashboard language. Data titles and imported research stay unchanged.': 'Pilih bahasa dashboard. Judul data dan riset impor tetap tidak berubah.',
    'Require verified metrics': 'Wajib metrik terverifikasi',
    'Manual publishing only': 'Publikasi manual saja',
    'Review before export': 'Review sebelum ekspor',
    'Store workspace locally': 'Simpan workspace lokal',
    'Export backup': 'Ekspor backup',
    'Clear workspace': 'Bersihkan workspace',
    'Update Profile': 'Perbarui Profil',
    'Update the workspace identity shown in the app shell.': 'Perbarui identitas workspace yang tampil di aplikasi.',
    'Manage research inputs and reproducible demo data.': 'Kelola input riset dan data demo yang reproducible.',
    'Fast paths for the live demo and day-to-day content workflow.': 'Pintasan untuk demo langsung dan workflow konten harian.',
    'Open Research': 'Buka Riset',
    'Open Library': 'Buka Library',
    'Open Reports': 'Buka Laporan',
    'Reset demo data': 'Reset data demo',
    'Export workspace': 'Ekspor workspace',
    'Close': 'Tutup',
    'No records yet': 'Belum ada catatan',
    'Workspace records created from imports or user actions.': 'Catatan workspace dibuat dari impor atau aksi pengguna.',
    'Import research data and generate a draft to fill this tab.': 'Impor data riset dan buat draft untuk mengisi tab ini.',
    'Storage': 'Penyimpanan',
    'Publishing': 'Publikasi',
    'Backup': 'Backup',
    'Local persistence on': 'Penyimpanan lokal aktif',
    'Local persistence off': 'Penyimpanan lokal nonaktif',
    'Manual publishing enforced': 'Publikasi manual diwajibkan',
    'Manual publishing optional': 'Publikasi manual opsional',
    'Portable project file': 'File proyek portabel',
    'Download a JSON copy of all imported rows, patterns, drafts, and workspace records.': 'Unduh salinan JSON berisi semua baris impor, pola, draft, dan catatan workspace.',
  },
  nl: {
    'Overview': 'Overzicht',
    'Research': 'Onderzoek',
    'Pattern Engine': 'Patroonmotor',
    'Calendar': 'Kalender',
    'Content Library': 'Bibliotheek',
    'Reports': 'Rapporten',
    'Saved Searches': 'Zoekopslag',
    'Brand Voice': 'Merkstem',
    'Team': 'Team',
    'Settings': 'Instellingen',
    'Profile': 'Profiel',
    'Data Sources': 'Databronnen',
    'Shortcuts': 'Snelkoppelingen',
    'Update profile': 'Profiel bijwerken',
    'Data sources': 'Databronnen',
    'Logout': 'Uitloggen',
    'Login': 'Inloggen',
    'Login to AGLI': 'Inloggen bij AGLI',
    'Back to landing': 'Terug naar landing',
    'Email': 'E-mail',
    'Password': 'Wachtwoord',
    'Show password': 'Wachtwoord tonen',
    'Hide password': 'Wachtwoord verbergen',
    'Content intelligence for serious games that actually gets used.': 'Content intelligence voor serious games die echt gebruikt worden.',
    'Research what earns attention with HR and L&D audiences, find the repeatable pattern, then draft credible Pro Actief content for human review.': 'Onderzoek wat aandacht krijgt bij HR- en L&D-doelgroepen, vind het herhaalbare patroon en maak geloofwaardige Pro Actief-concepten voor menselijke review.',
    'Research what earns attention with HR and L&D audiences, find the repeatable pattern,\n            then draft credible Pro Actief content for human review.': 'Onderzoek wat aandacht krijgt bij HR- en L&D-doelgroepen, vind het herhaalbare patroon en maak geloofwaardige Pro Actief-concepten voor menselijke review.',
    'Use the demo account below, or edit the profile details after entering.': 'Gebruik het demo-account hieronder, of pas de profielgegevens aan na het inloggen.',
    'A lightweight workspace for content research, pattern discovery, and draft creation.': 'Een lichte workspace voor contentonderzoek, patroonontdekking en conceptcreatie.',
    'Verified metrics only. Import platform exports before publishing.': 'Alleen geverifieerde metrics. Importeer platformexports voor publicatie.',
    'ICP': 'ICP',
    'Platform': 'Platform',
    'Objective': 'Doel',
    'Tone': 'Toon',
    'All Platforms': 'Alle platforms',
    'Awareness': 'Awareness',
    'Discovery Call': 'Discovery call',
    'Thought Leadership': 'Thought leadership',
    'Workshop Demand': 'Workshopvraag',
    'Professional & Warm': 'Professioneel & warm',
    'Practical': 'Praktisch',
    'Calm Expert': 'Rustige expert',
    'Direct': 'Direct',
    'HR & L&D Professionals': 'HR- & L&D-professionals',
    'Team Leads': 'Teamleiders',
    'Managers': 'Managers',
    'People Ops': 'People Ops',
    'Filters': 'Filters',
    'Save search': 'Zoekopdracht opslaan',
    'Top Performing Content': 'Best presterende content',
    'by imported traction': 'op basis van geimporteerde tractie',
    'Import CSV': 'CSV importeren',
    'Title': 'Titel',
    'Account': 'Account',
    'Type': 'Type',
    'Traction Score': 'Tractiescore',
    'Engagement': 'Engagement',
    'Views': 'Weergaven',
    'Published': 'Gepubliceerd',
    'Confidence': 'Betrouwbaarheid',
    'No research data imported': 'Geen onderzoeksdata geimporteerd',
    'Upload a CSV export from LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, or manual research.': 'Upload een CSV-export van LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram Insights of handmatig onderzoek.',
    'Showing': 'Toont',
    'of': 'van',
    'imported rows': 'geimporteerde rijen',
    'Pattern Insights': 'Patrooninzichten',
    'summary from imported content': 'samenvatting uit geimporteerde content',
    'No patterns yet': 'Nog geen patronen',
    'After import, AGLI will calculate hooks, topics, formats, lengths, and visual style patterns from the highest scoring rows.': 'Na import berekent AGLI hooks, onderwerpen, formats, lengte en visuele stijlen uit de best scorende rijen.',
    'Patterns are computed only from imported rows. Verify every source before publishing.': 'Patronen worden alleen berekend uit geimporteerde rijen. Verifieer elke bron voor publicatie.',
    'Top Hooks': 'Top hooks',
    'Top Topics': 'Toponderwerpen',
    'Top Formats': 'Topformats',
    'Ideal Length': 'Ideale lengte',
    'Visual Style': 'Visuele stijl',
    'View hook evidence': 'Bekijk hookbewijs',
    'View topics': 'Bekijk onderwerpen',
    'View formats': 'Bekijk formats',
    'View guidance': 'Bekijk richtlijn',
    'View examples': 'Bekijk voorbeelden',
    'Draft Studio': 'Conceptstudio',
    'Generate draft': 'Concept maken',
    'Post Copy': 'Posttekst',
    'Hooks': 'Hooks',
    'Video Outline': 'Video-outline',
    'Hashtags': 'Hashtags',
    'Brand / Client': 'Merk / Klant',
    'Content Pillar': 'Contentpijler',
    'Draft only - human review required.': 'Alleen concept - menselijke review vereist.',
    'Import research data, generate a draft, or write manually here.': 'Importeer onderzoeksdata, genereer een concept of schrijf hier handmatig.',
    'Word count': 'Aantal woorden',
    'Characters': 'Tekens',
    'Call to Action (optional)': 'Call-to-action (optioneel)',
    'Add a grounded CTA after review.': 'Voeg na review een onderbouwde CTA toe.',
    'No fabricated claims.': 'Geen verzonnen claims.',
    'Use imported proof only. Add real quotes or client claims only when supplied.': 'Gebruik alleen geimporteerd bewijs. Voeg echte quotes of klantclaims alleen toe als ze zijn aangeleverd.',
    'Save draft': 'Concept opslaan',
    'Add to Calendar': 'Toevoegen aan kalender',
    'Update photo': 'Foto bijwerken',
    'Name': 'Naam',
    'Role': 'Rol',
    'Timezone': 'Tijdzone',
    'Operational controls for a manual-review content workflow.': 'Operationele instellingen voor een contentworkflow met handmatige review.',
    'Language': 'Taal',
    'Interface language': 'Interfacetaal',
    'Choose the dashboard language. Data titles and imported research stay unchanged.': 'Kies de taal van het dashboard. Datatitels en geimporteerd onderzoek blijven ongewijzigd.',
    'Require verified metrics': 'Geverifieerde metrics verplicht',
    'Manual publishing only': 'Alleen handmatig publiceren',
    'Review before export': 'Review voor export',
    'Store workspace locally': 'Workspace lokaal opslaan',
    'Export backup': 'Backup exporteren',
    'Clear workspace': 'Workspace wissen',
    'Update Profile': 'Profiel bijwerken',
    'Update the workspace identity shown in the app shell.': 'Werk de workspace-identiteit bij die in de app wordt getoond.',
    'Manage research inputs and reproducible demo data.': 'Beheer onderzoeksinputs en reproduceerbare demodata.',
    'Fast paths for the live demo and day-to-day content workflow.': 'Snelle routes voor de live demo en dagelijkse contentworkflow.',
    'Open Research': 'Onderzoek openen',
    'Open Library': 'Bibliotheek openen',
    'Open Reports': 'Rapporten openen',
    'Reset demo data': 'Demodata resetten',
    'Export workspace': 'Workspace exporteren',
    'Close': 'Sluiten',
    'No records yet': 'Nog geen records',
    'Workspace records created from imports or user actions.': 'Workspace-records gemaakt via imports of gebruikersacties.',
    'Import research data and generate a draft to fill this tab.': 'Importeer onderzoeksdata en genereer een concept om dit tabblad te vullen.',
    'Storage': 'Opslag',
    'Publishing': 'Publicatie',
    'Backup': 'Backup',
    'Local persistence on': 'Lokale opslag aan',
    'Local persistence off': 'Lokale opslag uit',
    'Manual publishing enforced': 'Handmatig publiceren verplicht',
    'Manual publishing optional': 'Handmatig publiceren optioneel',
    'Portable project file': 'Draagbaar projectbestand',
    'Download a JSON copy of all imported rows, patterns, drafts, and workspace records.': 'Download een JSON-kopie van alle geimporteerde rijen, patronen, concepten en workspace-records.',
  },
}

const LanguageContext = createContext<Language>('en')

function translate(text: string, language: Language) {
  return translations[language][text] ?? text
}

function useT() {
  const language = useContext(LanguageContext)
  return (text: string) => translate(text, language)
}

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
  language: 'en',
}

const defaultWorkspaceProfile: WorkspaceProfile = {
  avatar: '',
  email: 'content@amsterdamgamelab.nl',
  name: 'AGLI workspace',
  role: 'Content strategist',
  timezone: 'Europe/Amsterdam',
}

const demoContentItems: ContentItem[] = [
  {
    id: 'demo-linkedin-soft-skills',
    platform: 'LinkedIn',
    title: 'Stop calling it soft skills.',
    creator: 'Pro Actief',
    url: 'https://example.com/linkedin-soft-skills',
    topic: 'Leadership',
    angle: 'Reframe communication habits as measurable team infrastructure.',
    hook: 'Stop calling it soft skills.',
    hookType: 'Contrarian reframe',
    format: 'Text post',
    visualStyle: 'Plain text with bold opening line',
    lengthSeconds: 0,
    audience: 'HR & L&D Professionals',
    views: 52000,
    engagements: 1200,
    comments: 86,
    shares: 148,
    date: '2026-06-18',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-youtube-learning-culture',
    platform: 'YouTube',
    title: 'Zo bouw je een leercultuur die blijft.',
    creator: 'AGL Learning',
    url: 'https://example.com/youtube-learning-culture',
    topic: 'Learning culture',
    angle: 'Show a practical team ritual instead of abstract L&D theory.',
    hook: 'Most learning culture plans fail because they skip the weekly ritual.',
    hookType: 'Mistake reveal',
    format: 'Short explainer video',
    visualStyle: 'Facilitator plus tabletop close-ups',
    lengthSeconds: 58,
    audience: 'HR & L&D Professionals',
    views: 34000,
    engagements: 980,
    comments: 72,
    shares: 120,
    date: '2026-06-15',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-instagram-stronger-talks',
    platform: 'Instagram',
    title: '5 vragen voor sterkere gesprekken',
    creator: 'Pro Actief',
    url: 'https://example.com/instagram-questions',
    topic: 'Team reflection',
    angle: 'Give managers saveable prompts for safer team conversations.',
    hook: 'Save these five questions before your next team check-in.',
    hookType: 'Saveable list',
    format: 'Carousel',
    visualStyle: 'Light cards with teal highlight',
    lengthSeconds: 0,
    audience: 'Managers',
    views: 29000,
    engagements: 1100,
    comments: 64,
    shares: 210,
    date: '2026-06-17',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-linkedin-listening',
    platform: 'LinkedIn',
    title: 'Leiderschap begint bij luisteren.',
    creator: 'Amsterdam Game Lab',
    url: 'https://example.com/linkedin-listening',
    topic: 'Leadership',
    angle: 'Connect listening behavior to stress prevention before problems escalate.',
    hook: 'Leadership starts before the big decision.',
    hookType: 'Small moment',
    format: 'Text post',
    visualStyle: 'Short paragraphs with one question',
    lengthSeconds: 0,
    audience: 'Team Leads',
    views: 26000,
    engagements: 842,
    comments: 51,
    shares: 96,
    date: '2026-06-12',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-tiktok-feedback',
    platform: 'TikTok',
    title: '3 manieren om feedback veilig te maken',
    creator: 'Pro Actief',
    url: 'https://example.com/tiktok-feedback',
    topic: 'Feedback safety',
    angle: 'Use fast myth/fact captions around difficult team feedback.',
    hook: 'If feedback feels unsafe, your team will edit the truth.',
    hookType: 'Problem-first',
    format: 'Short vertical video',
    visualStyle: 'Talking head with bold captions',
    lengthSeconds: 41,
    audience: 'Managers',
    views: 41000,
    engagements: 2300,
    comments: 118,
    shares: 390,
    date: '2026-06-16',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-linkedin-flow',
    platform: 'LinkedIn',
    title: 'Waar focus, flow en resultaat samenkomen',
    creator: 'Amsterdam Game Lab',
    url: 'https://example.com/linkedin-flow',
    topic: 'Workplace wellbeing',
    angle: 'Position wellbeing as better team operating conditions, not an extra perk.',
    hook: 'Focus is not a personal productivity trick. It is a team condition.',
    hookType: 'Reframe',
    format: 'Article',
    visualStyle: 'Header image plus structured bullets',
    lengthSeconds: 0,
    audience: 'People Ops',
    views: 18000,
    engagements: 620,
    comments: 39,
    shares: 88,
    date: '2026-06-10',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-instagram-checkin',
    platform: 'Instagram',
    title: 'Team check-in template',
    creator: 'AGL Learning',
    url: 'https://example.com/instagram-checkin',
    topic: 'Team reflection',
    angle: 'Turn a check-in template into a saveable visual tool.',
    hook: 'Use this check-in when the team says everything is fine.',
    hookType: 'Template',
    format: 'Carousel',
    visualStyle: 'Template cards with real meeting table photo',
    lengthSeconds: 0,
    audience: 'Team Leads',
    views: 22000,
    engagements: 780,
    comments: 46,
    shares: 170,
    date: '2026-06-09',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
  {
    id: 'demo-tiktok-team-sport',
    platform: 'TikTok',
    title: 'Learning is a team sport',
    creator: 'AGL Learning',
    url: 'https://example.com/tiktok-team-sport',
    topic: 'Learning culture',
    angle: 'Show a quick team exercise that exposes communication gaps.',
    hook: 'Try this one-minute exercise before your next retrospective.',
    hookType: 'Try this',
    format: 'Short vertical video',
    visualStyle: 'Hands-on activity with captions',
    lengthSeconds: 36,
    audience: 'L&D Professionals',
    views: 24000,
    engagements: 1100,
    comments: 77,
    shares: 205,
    date: '2026-06-08',
    sourceQuality: 'imported',
    verificationNote: 'Scenario seed for demo flow. Replace with verified metric export before client use.',
  },
]

const demoCalendarItems: CalendarItem[] = [
  { id: 'demo-cal-linkedin', date: '2026-06-28', platform: 'LinkedIn', title: 'Leadership starts before the big decision', status: 'Ready for review' },
  { id: 'demo-cal-instagram', date: '2026-06-30', platform: 'Instagram', title: 'Team check-in carousel', status: 'Needs brand pass' },
  { id: 'demo-cal-youtube', date: '2026-07-02', platform: 'YouTube', title: 'Pro Actief workshop short', status: 'Needs footage' },
]

const demoLibraryItems: LibraryItem[] = [
  { id: 'demo-lib-draft', title: 'LinkedIn draft - leadership begins with listening', type: 'Draft', status: 'Needs human review', audience: 'Team Leads' },
  { id: 'demo-lib-carousel', title: '5 questions carousel outline', type: 'Carousel outline', status: 'Ready for design', audience: 'Managers' },
  { id: 'demo-lib-video', title: 'IGLO tabletop B-roll shot list', type: 'Video asset list', status: 'Needs footage check', audience: 'L&D Professionals' },
]

const demoSavedSearches: SavedSearch[] = [
  { id: 'demo-search-hr', query: 'HR & L&D Professionals | Awareness | Professional & Warm', platforms: 'All Platforms', results: 8, savedAt: '2026-06-18T09:00:00.000Z' },
  { id: 'demo-search-tiktok', query: 'Managers | Workshop Demand | Direct', platforms: 'TikTok', results: 2, savedAt: '2026-06-19T11:30:00.000Z' },
  { id: 'demo-search-linkedin', query: 'Team Leads | Thought Leadership | Practical', platforms: 'LinkedIn', results: 3, savedAt: '2026-06-20T14:15:00.000Z' },
]

const demoTeamMembers: TeamMember[] = [
  { id: 'demo-team-jamie', name: 'Jamie Bakker', role: 'Content Strategist', responsibility: 'Owns research brief and calendar', status: 'Active' },
  { id: 'demo-team-mila', name: 'Mila de Vries', role: 'Facilitator', responsibility: 'Reviews Pro Actief brand fit', status: 'Active' },
  { id: 'demo-team-noah', name: 'Noah Janssen', role: 'Marketing Lead', responsibility: 'Approves publishing and export', status: 'Reviewing' },
]

function App() {
  const [authView, setAuthView] = useStoredState<AuthView>('agli:authView', 'landing')
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
  const [, setNotice] = useState('No fabricated claims')
  const [contentItems, setContentItems] = useStoredState<ContentItem[]>('agli:contentItems', demoContentItems)
  const [calendarItems, setCalendarItems] = useStoredState<CalendarItem[]>('agli:calendarItems', demoCalendarItems)
  const [libraryItems, setLibraryItems] = useStoredState<LibraryItem[]>('agli:libraryItems', demoLibraryItems)
  const [savedSearches, setSavedSearches] = useStoredState<SavedSearch[]>('agli:savedSearches', demoSavedSearches)
  const [teamMembers, setTeamMembers] = useStoredState<TeamMember[]>('agli:teamMembers', demoTeamMembers)
  const [brandRules, setBrandRules] = useStoredState<BrandRule[]>('agli:brandRules', defaultBrandRules)
  const [settings, setSettings] = useStoredState<AppSettings>('agli:settings', defaultSettings)
  const [workspaceProfile, setWorkspaceProfile] = useStoredState<WorkspaceProfile>('agli:workspaceProfile', defaultWorkspaceProfile)
  const [selectedContentId, setSelectedContentId] = useState('')
  const [tablePage, setTablePage] = useState(1)
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

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
  const language = settings.language ?? 'en'
  const topReference = useMemo(
    () => filteredRanked.find((item) => item.id === selectedContentId) ?? filteredRanked[0],
    [filteredRanked, selectedContentId],
  )
  const contentPillar = summary.topTopics[0]?.label ?? 'Import data first'

  useEffect(() => {
    setTablePage(1)
  }, [platformFilter, contentItems.length])

  useEffect(() => {
    const seedVersion = window.localStorage.getItem('agli:demoSeedVersion')
    if (contentItems.length === 0 && seedVersion !== 'interactive-v1' && seedVersion !== 'cleared') {
      loadDemoWorkspace()
    }
  })

  function action(message: string) {
    if (message) setNotice(message)
  }

  function openPanel(panel: PanelKey) {
    setProfileMenuOpen(false)
    setActivePanel(panel)
  }

  function openProfilePage(page: PageKey) {
    setActivePage(page)
    setActivePanel(null)
    setProfileMenuOpen(false)
  }

  function loadDemoWorkspace() {
    setContentItems(demoContentItems)
    setCalendarItems(demoCalendarItems)
    setLibraryItems(demoLibraryItems)
    setSavedSearches(demoSavedSearches)
    setTeamMembers(demoTeamMembers)
    setBrandRules(defaultBrandRules)
    setSelectedContentId(demoContentItems[0]?.id ?? '')
    window.localStorage.setItem('agli:demoSeedVersion', 'interactive-v1')
    action('Demo scenario reset')
  }

  function enterApp() {
    setAuthView('app')
    loadDemoWorkspace()
  }

  function logout() {
    setAuthView('landing')
    setActivePage('Research')
    setActivePanel(null)
    setProfileMenuOpen(false)
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
    setCta(buildCta(objective, draftPlatform))
    action(`${draftPlatform} draft generated for ${objective}`)
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
    window.localStorage.setItem('agli:demoSeedVersion', 'cleared')
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

  if (authView !== 'app') {
    return (
      <LanguageContext.Provider value={language}>
        <AuthScreen
          mode={authView}
          onEnter={enterApp}
          onModeChange={setAuthView}
          profile={workspaceProfile}
          setProfile={setWorkspaceProfile}
        />
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={language}>
    <div className="prototype-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <img alt="AGLI robot mark" src="/assets/agli-logo.jpeg" />
          <strong>AGLI</strong>
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
                setActivePanel(null)
                setProfileMenuOpen(false)
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
                setActivePanel(null)
                setProfileMenuOpen(false)
              }}
            />
          ))}
        </nav>

      </aside>

      <main className="research-page">
        <header className="research-topbar">
          <h1>{translate(activePage, language)}</h1>
          <div className="status-strip">
            <ShieldCheck size={21} />
            <span>{translate('Verified metrics only. Import platform exports before publishing.', language)}</span>
            <i />
            <button aria-label="Help" onClick={() => openPanel('help')} type="button">
              <CircleHelp size={21} />
            </button>
            <button aria-label="Notifications" onClick={() => openPanel('notifications')} type="button">
              <Bell size={21} />
            </button>
            <ProfileMenu
              logout={logout}
              open={profileMenuOpen}
              openPage={openProfilePage}
              profile={workspaceProfile}
              setOpen={setProfileMenuOpen}
            />
          </div>
        </header>

        {activePage === 'Research' ? (
          <ResearchPage
            action={action}
            addDraftToCalendar={addDraftToCalendar}
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
            openPanel={openPanel}
            onImportCsv={handleCsvUpload}
            page={tablePage}
            platformFilter={platformFilter}
            saveDraft={saveDraft}
            saveSearch={saveSearch}
            selectedContentId={selectedContentId}
            setCta={setCta}
            setDraftPlatform={setDraftPlatform}
            setDraftTab={setDraftTab}
            setDraftText={setDraftText}
            setIcp={setIcp}
            setObjective={setObjective}
            setPage={setTablePage}
            setPlatformFilter={setPlatformFilter}
            setSelectedContentId={setSelectedContentId}
            setTone={setTone}
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
            setWorkspaceProfile={setWorkspaceProfile}
            settings={settings}
            summary={summary}
            teamMembers={teamMembers}
            workspaceProfile={workspaceProfile}
            loadDemoWorkspace={loadDemoWorkspace}
          />
        )}
        {activePanel ? (
          <UtilityPanel
            activePanel={activePanel}
            brandRules={brandRules}
            close={() => setActivePanel(null)}
            contentItems={contentItems}
            filteredRanked={filteredRanked}
            icp={icp}
            objective={objective}
            platformFilter={platformFilter}
            savedSearches={savedSearches}
            setActivePage={setActivePage}
            summary={summary}
            tone={tone}
            workspaceProfile={workspaceProfile}
            setWorkspaceProfile={setWorkspaceProfile}
            onImportCsv={handleCsvUpload}
            loadDemoWorkspace={loadDemoWorkspace}
            exportAnalysis={exportAnalysis}
            logout={logout}
          />
        ) : null}
      </main>
    </div>
    </LanguageContext.Provider>
  )
}

function ProfileMenu({
  logout,
  open,
  openPage,
  profile,
  setOpen,
}: {
  logout: () => void
  open: boolean
  openPage: (page: PageKey) => void
  profile: WorkspaceProfile
  setOpen: (updater: (current: boolean) => boolean) => void
}) {
  const t = useT()

  function openProfilePage(page: PageKey) {
    setOpen(() => false)
    openPage(page)
  }

  return (
    <div className="topbar-user-wrap">
      {open ? (
        <div className="profile-menu topbar-profile-menu">
          <button onClick={() => openProfilePage('Profile')} type="button">
            <User size={16} />
            {t('Update profile')}
          </button>
          <button onClick={() => openProfilePage('Data Sources')} type="button">
            <Database size={16} />
            {t('Data sources')}
          </button>
          <button onClick={() => openProfilePage('Shortcuts')} type="button">
            <Keyboard size={16} />
            {t('Shortcuts')}
          </button>
          <button onClick={logout} type="button">
            <LogOut size={16} />
            {t('Logout')}
          </button>
        </div>
      ) : null}
      <button
        aria-expanded={open}
        className={`topbar-user ${open ? 'open' : ''}`}
        onClick={() => {
          setOpen((current) => !current)
        }}
        type="button"
      >
        <span>
          {profile.avatar ? <img alt="" src={profile.avatar} /> : 'AG'}
        </span>
        <div>
          <strong>{profile.name}</strong>
          <small>{profile.role}</small>
        </div>
        <ChevronDown size={16} />
      </button>
    </div>
  )
}

function AuthScreen({
  mode,
  onEnter,
  onModeChange,
  profile,
  setProfile,
}: {
  mode: AuthView
  onEnter: () => void
  onModeChange: (value: AuthView) => void
  profile: WorkspaceProfile
  setProfile: (updater: (current: WorkspaceProfile) => WorkspaceProfile) => void
}) {
  const isLogin = mode === 'login'
  const [showPassword, setShowPassword] = useState(false)
  const t = useT()

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <img alt="" className="auth-bg" src="/assets/agl-workshop.png" />
        <div className="auth-overlay" />
        <div className="auth-hero-content">
        <div className="auth-brand-lockup">
            <img alt="AGLI robot mark" className="auth-logo" src="/assets/agli-logo.jpeg" />
            <strong>AGLI</strong>
          </div>
          <h1>{t('Content intelligence for serious games that actually gets used.')}</h1>
          <p>{t('Research what earns attention with HR and L&D audiences, find the repeatable pattern, then draft credible Pro Actief content for human review.')}</p>
          <div className="auth-stat-row">
            <span>{t('Research')}</span>
            <span>{t('Pattern Engine')}</span>
            <span>{t('Draft Studio')}</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        {isLogin ? (
          <div className="auth-panel-title-row">
            <div className="auth-panel-lockup">
              <img alt="AGLI robot mark" className="auth-panel-logo" src="/assets/agli-logo.jpeg" />
            </div>
            <h2>{t('Login to AGLI')}</h2>
          </div>
        ) : (
          <>
            <div className="auth-panel-lockup">
              <img alt="AGLI robot mark" className="auth-panel-logo" src="/assets/agli-logo.jpeg" />
              <strong>AGLI</strong>
            </div>
            <h2>{t('Amsterdam Game Lab Intelligence')}</h2>
          </>
        )}
        <p>
          {isLogin
            ? t('Use the demo account below, or edit the profile details after entering.')
            : t('A lightweight workspace for content research, pattern discovery, and draft creation.')}
        </p>

        {isLogin ? (
          <div className="panel-form">
            <label>
              {t('Email')}
              <input
                value={profile.email}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>
            <label>
              {t('Password')}
              <span className="password-field">
                <input type={showPassword ? 'text' : 'password'} value="agli-demo" readOnly />
                <button
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button className="save-button auth-primary" onClick={onEnter} type="button">
              {t('Login')}
            </button>
            <button className="secondary-action auth-secondary" onClick={() => onModeChange('landing')} type="button">
              {t('Back to landing')}
            </button>
          </div>
        ) : (
          <div className="auth-actions">
            <button className="save-button auth-primary" onClick={() => onModeChange('login')} type="button">
              {t('Login')}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

function ResearchPage({
  action,
  addDraftToCalendar,
  contentPillar,
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
  openPanel,
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
  openPanel: (panel: PanelKey) => void
  onImportCsv: (event: ChangeEvent<HTMLInputElement>) => void
  page: number
  platformFilter: PlatformFilter
  saveDraft: () => void
  saveSearch: () => void
  selectedContentId: string
  setCta: (value: string) => void
  setDraftPlatform: (value: Platform) => void
  setDraftTab: (value: DraftTab) => void
  setDraftText: (value: string) => void
  setIcp: (value: string) => void
  setObjective: (value: string) => void
  setPage: (value: number) => void
  setPlatformFilter: (value: PlatformFilter) => void
  setSelectedContentId: (value: string) => void
  setTone: (value: string) => void
  summary: PatternSummary
  tone: string
  wordCount: number
}) {
  const t = useT()
  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredRanked.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filteredRanked.slice((safePage - 1) * pageSize, safePage * pageSize)
  const columns = buildPatternColumns(summary)

  return (
    <>
      <section className="filter-row" aria-label="Research filters">
        <SelectBox label="ICP" onSelect={setIcp} options={icpOptions} value={icp} />
        <SelectBox label="Platform" onSelect={(value) => setPlatformFilter(value as PlatformFilter)} options={platformOptions} value={platformFilter} />
        <SelectBox label="Objective" onSelect={setObjective} options={objectiveOptions} value={objective} />
        <SelectBox label="Tone" onSelect={setTone} options={toneOptions} value={tone} />
        <button className="date-button" onClick={() => openPanel('dateRange')} type="button">
          <CalendarDays size={17} />
          {dateLabel}
        </button>
        <button className="filter-button" onClick={() => openPanel('filters')} type="button">
          <Filter size={17} />
          {t('Filters')}
        </button>
        <button className="save-button" onClick={saveSearch} type="button">
          <Bookmark size={17} />
          {t('Save search')}
        </button>
      </section>

      <div className="workspace-grid">
        <div className="left-stack">
          <section className="content-panel">
            <div className="panel-title">
              <div>
                <h2>{t('Top Performing Content')}</h2>
                <span>({t('by imported traction')})</span>
                <Info size={16} />
              </div>
              <label className="compact-action import-action">
                <Upload size={15} />
                {t('Import CSV')}
                <input accept=".csv,text/csv" onChange={onImportCsv} type="file" />
              </label>
            </div>

            <div className="table-frame">
              <table className="prototype-table">
                <thead>
                  <tr>
                    <th>{t('#')}</th>
                    <th>{t('Title')}</th>
                    <th>{t('Platform')}</th>
                    <th>{t('Account')}</th>
                    <th>{t('Type')}</th>
                    <th>{t('Traction Score')}</th>
                    <th>{t('Engagement')}</th>
                    <th>{t('Views')}</th>
                    <th>{t('Published')}</th>
                    <th>{t('Confidence')}</th>
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
                {t('Showing')} {pageRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-
                {Math.min(safePage * pageSize, filteredRanked.length)} {t('of')} {filteredRanked.length} {t('imported rows')}
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
              <h2>{t('Pattern Insights')}</h2>
              <span>({t('summary from imported content')})</span>
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
                    <button className="link-button" onClick={() => openPanel('patterns')} type="button">
                      {column.link}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="insight-disclaimer">
              <Info size={17} />
              <span>{t('Patterns are computed only from imported rows. Verify every source before publishing.')}</span>
            </div>
          </section>
        </div>

        <aside className="draft-card">
          <div className="draft-header">
            <h2>{t('Draft Studio')}</h2>
            <button className="generate-button" onClick={generateDraft} type="button">
              <Sparkles size={16} />
              {t('Generate draft')}
            </button>
          </div>

          <div className="draft-tabs">
            {draftTabs.map((tab) => (
              <button
                className={draftTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => {
                  setDraftTab(tab)
                }}
                type="button"
              >
                {t(tab)}
              </button>
            ))}
          </div>

          <div className="draft-scroll">
            <div className="draft-form-grid">
                <SelectBox label="Brand / Client" onSelect={() => action('Pro Actief selected')} options={['Pro Actief', 'Amsterdam Game Lab']} value="Pro Actief" />
              <SelectBox label="Content Pillar" onSelect={() => action('Pillar comes from imported patterns')} options={[contentPillar, 'Stress prevention', 'Team reflection', 'Leadership']} value={contentPillar} />
              <SelectBox icon={<PlatformBadge platform={draftPlatform} />} label="Platform" onSelect={(value) => setDraftPlatform(value as Platform)} options={platforms} value={draftPlatform} />
              <SelectBox label="Objective" onSelect={setObjective} options={objectiveOptions} value={objective} />
            </div>

            {draftTab === 'Post Copy' ? (
              <>
                <label className="draft-field">
                  <span>
                    {t('Post Copy')} <em>{t('Draft only - human review required.')}</em>
                  </span>
                  <textarea
                    placeholder={t('Import research data, generate a draft, or write manually here.')}
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                  />
                </label>
                <div className="copy-meta">
                  <span>{t('Word count')}: {wordCount}</span>
                  <span>{t('Characters')}: {draftText.length}</span>
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
              <span>{t('Call to Action (optional)')}</span>
              <input
                maxLength={100}
                placeholder={t('Add a grounded CTA after review.')}
                value={cta}
                onChange={(event) => setCta(event.target.value)}
              />
              <small>{cta.length} / 100</small>
            </label>

            <div className="warning-box">
              <Info size={22} />
              <div>
                <strong>{t('No fabricated claims.')}</strong>
                <span>{t('Use imported proof only. Add real quotes or client claims only when supplied.')}</span>
              </div>
            </div>

            <div className="draft-actions">
              <button className="secondary-action" onClick={saveDraft} type="button">
                <FileText size={16} />
                {t('Save draft')}
              </button>
              <button className="calendar-action" onClick={addDraftToCalendar} type="button">
                <CalendarDays size={17} />
                {t('Add to Calendar')}
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
  const t = useT()
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
        <p>{t('Import research data and generate a draft to fill this tab.')}</p>
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

function UtilityPanel({
  activePanel,
  brandRules,
  close,
  contentItems,
  exportAnalysis,
  filteredRanked,
  icp,
  loadDemoWorkspace,
  logout,
  objective,
  onImportCsv,
  platformFilter,
  savedSearches,
  setActivePage,
  setWorkspaceProfile,
  summary,
  tone,
  workspaceProfile,
}: {
  activePanel: PanelKey
  brandRules: BrandRule[]
  close: () => void
  contentItems: ContentItem[]
  exportAnalysis: () => void
  filteredRanked: RankedContent[]
  icp: string
  loadDemoWorkspace: () => void
  logout: () => void
  objective: string
  onImportCsv: (event: ChangeEvent<HTMLInputElement>) => void
  platformFilter: PlatformFilter
  savedSearches: SavedSearch[]
  setActivePage: (page: PageKey) => void
  setWorkspaceProfile: (updater: (current: WorkspaceProfile) => WorkspaceProfile) => void
  summary: PatternSummary
  tone: string
  workspaceProfile: WorkspaceProfile
}) {
  const t = useT()
  const panelTitle = panelLabel(activePanel)
  function openPage(page: PageKey) {
    setActivePage(page)
    close()
  }

  return (
    <div className="utility-panel-shell" role="dialog" aria-label={t(panelTitle)}>
      <div className="utility-panel">
        <div className="utility-panel-head">
          <div>
            <span>AGLI workspace</span>
            <h2>{t(panelTitle)}</h2>
          </div>
          <button aria-label="Close panel" onClick={close} type="button">
            <X size={18} />
          </button>
        </div>

        {activePanel === 'help' ? (
          <div className="panel-list">
            {[
              ['1. Pick a scenario', 'Use ICP, platform, objective, and tone dropdowns to reshape ranking and draft output.'],
              ['2. Select a winning row', 'Click a row in Research to make it the primary reference for Draft Studio.'],
              ['3. Generate and review', 'Draft Studio writes a human-review draft, then Calendar and Library store the next steps.'],
              ['4. Review honestly', 'Use Data Sources or Reports to export the evidence pack for the deck.'],
            ].map(([title, text]) => (
              <PanelItem key={title} text={text} title={title} />
            ))}
          </div>
        ) : null}

        {activePanel === 'notifications' ? (
          <div className="panel-list">
            <PanelItem text={`${contentItems.length} scenario rows are available for ranking.`} title="Research data ready" />
            <PanelItem text={`${savedSearches.length} saved discovery flows can be reused.`} title="Saved searches" />
            <PanelItem text={`${brandRules.length} brand rules are active before publishing.`} title="Brand guardrails" />
          </div>
        ) : null}

        {activePanel === 'profile' ? (
          <div className="profile-panel">
            <div className="profile-panel-head">
              <span>
                {workspaceProfile.avatar ? <img alt="" src={workspaceProfile.avatar} /> : 'AG'}
              </span>
              <div>
                <strong>{workspaceProfile.name}</strong>
                <p>{workspaceProfile.role}</p>
                <em>{workspaceProfile.email}</em>
              </div>
            </div>
            <ProfileEditor profile={workspaceProfile} setProfile={setWorkspaceProfile} />
          </div>
        ) : null}

        {activePanel === 'dataSources' ? (
          <div className="panel-list">
            <PanelItem text={`${contentItems.length} active research rows are available for ranking and draft generation.`} title="Active data" />
            <PanelItem text="CSV imports can come from LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, or manual research." title="Accepted sources" />
            <ImportCsvButton onChange={onImportCsv} />
            <button className="profile-panel-action" onClick={loadDemoWorkspace} type="button">
              <Database size={16} />
              Reset demo scenario
            </button>
            <button className="profile-panel-action" onClick={exportAnalysis} type="button">
              <FileText size={16} />
              Export backup
            </button>
          </div>
        ) : null}

        {activePanel === 'shortcuts' ? (
          <div className="panel-list">
            <PanelItem text="Research -> select a row -> Generate draft -> Save draft -> Add to Calendar." title="Demo flow" />
            <PanelItem text="Use Pattern Engine and Reports after importing rows to show the evidence pack behind drafts." title="Evidence flow" />
            <button className="profile-panel-action" onClick={() => openPage('Research')} type="button">
              <Search size={16} />
              Open Research
            </button>
            <button className="profile-panel-action" onClick={() => openPage('Content Library')} type="button">
              <Folder size={16} />
              Open Content Library
            </button>
            <button className="profile-panel-action" onClick={() => openPage('Reports')} type="button">
              <LineChart size={16} />
              Open Reports
            </button>
            <button className="profile-panel-action" onClick={logout} type="button">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : null}

        {activePanel === 'filters' ? (
          <div className="panel-list">
            <PanelItem text={icp} title="Active ICP" />
            <PanelItem text={platformFilter} title="Active platform" />
            <PanelItem text={objective} title="Active objective" />
            <PanelItem text={tone} title="Active tone" />
            <PanelItem text={`${filteredRanked.length} rows match this scenario.`} title="Scenario result" />
          </div>
        ) : null}

        {activePanel === 'dateRange' ? (
          <div className="panel-list">
            <PanelItem text={dateRangeLabel(filteredRanked)} title="Research window" />
            <PanelItem text="Dates come from imported or scenario rows. Change platform/ICP filters to reshape the active window." title="How it works" />
          </div>
        ) : null}

        {activePanel === 'patterns' ? (
          <div className="panel-list">
            <PanelItem text={`${summary.sampleSize} rows in active pattern sample.`} title="Sample size" />
            <PanelItem text={summary.topHooks.map((item) => item.label).join(', ') || 'No hooks yet'} title="Hook evidence" />
            <PanelItem text={summary.topTopics.map((item) => item.label).join(', ') || 'No topics yet'} title="Topic evidence" />
            <PanelItem text={summary.recommendedLength} title="Length guidance" />
          </div>
        ) : null}

        <div className="utility-panel-actions">
          <button className="secondary-action" onClick={close} type="button">
            {t('Close')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PanelItem({ text, title }: { text: string; title: string }) {
  const t = useT()
  return (
    <section className="panel-item">
      <strong>{t(title)}</strong>
      <p>{t(text)}</p>
    </section>
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
  loadDemoWorkspace,
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
  setWorkspaceProfile,
  settings,
  summary,
  teamMembers,
  workspaceProfile,
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
  loadDemoWorkspace: () => void
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
  setWorkspaceProfile: (updater: (current: WorkspaceProfile) => WorkspaceProfile) => void
  settings: AppSettings
  summary: PatternSummary
  teamMembers: TeamMember[]
  workspaceProfile: WorkspaceProfile
}) {
  const t = useT()

  if (activePage === 'Profile') {
    return (
      <div className="subpage">
        <PageCard subtitle="Update the workspace identity shown in the app shell." title="Update Profile">
          <ProfileEditor profile={workspaceProfile} setProfile={setWorkspaceProfile} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Data Sources') {
    return (
      <div className="subpage">
        <PageCard subtitle="Manage research inputs and reproducible demo data." title="Data Sources">
          <WorkflowGrid
            cards={[
              {
                eyebrow: 'CSV',
                text: 'Import verified exports from LinkedIn, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, or manual research.',
                title: `${contentItems.length} active research rows`,
              },
              {
                eyebrow: 'Demo',
                text: 'Reset the integrated scenario rows when you need to show a clean hackathon walkthrough.',
                title: 'Scenario reset',
                actionLabel: 'Reset demo data',
                onAction: loadDemoWorkspace,
              },
              {
                eyebrow: 'Backup',
                text: 'Download the current workspace, including rows, drafts, settings, and guardrails.',
                title: 'Export workspace',
                actionLabel: 'Export backup',
                onAction: exportAnalysis,
              },
            ]}
          />
          <ActionRow actions={[{ label: 'Export backup', onClick: exportAnalysis }]} extra={<ImportCsvButton onChange={onImportCsv} />} />
        </PageCard>
      </div>
    )
  }

  if (activePage === 'Shortcuts') {
    return (
      <div className="subpage">
        <PageCard subtitle="Fast paths for the live demo and day-to-day content workflow." title="Shortcuts">
          <WorkflowGrid
            cards={[
              {
                eyebrow: 'Demo flow',
                text: 'Research -> select a row -> Generate draft -> Save draft -> Add to Calendar.',
                title: 'End-to-end content run',
                actionLabel: 'Open Research',
                onAction: () => setActivePage('Research'),
              },
              {
                eyebrow: 'Review flow',
                text: 'Drafts saved from Draft Studio appear in Content Library and can be scheduled manually.',
                title: 'Human review loop',
                actionLabel: 'Open Library',
                onAction: () => setActivePage('Content Library'),
              },
              {
                eyebrow: 'Reporting flow',
                text: 'Reports and Pattern Engine both update from the same filtered ranked rows.',
                title: 'Evidence pack',
                actionLabel: 'Open Reports',
                onAction: () => setActivePage('Reports'),
              },
            ]}
          />
        </PageCard>
      </div>
    )
  }

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
          <WorkflowGrid
            cards={[
              {
                actionLabel: 'Import research',
                eyebrow: 'Step 1',
                onAction: () => setActivePage('Research'),
                text: 'Bring in platform exports or manual research rows before scoring any content pattern.',
                title: contentItems.length > 0 ? `${contentItems.length} rows ready for scoring` : 'Research intake is empty',
              },
              {
                actionLabel: 'Open patterns',
                eyebrow: 'Step 2',
                onAction: () => setActivePage('Pattern Engine'),
                text: 'Ranked rows are grouped into hooks, topics, formats, length guidance, and visual style signals.',
                title: summary.sampleSize > 0 ? `${summary.sampleSize} rows in pattern sample` : 'Pattern engine waiting for data',
              },
              {
                actionLabel: 'Review calendar',
                eyebrow: 'Step 3',
                onAction: () => setActivePage('Calendar'),
                text: 'Drafts stay as internal review items until a human approves them for scheduling.',
                title: `${calendarItems.length} calendar item${calendarItems.length === 1 ? '' : 's'}`,
              },
            ]}
          />
          <ActionRow
            actions={[
              { label: 'Open research', onClick: () => setActivePage('Research') },
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
          <WorkflowGrid
            cards={[
              {
                eyebrow: 'Evidence',
                text: 'Rows are ranked by views, engagement rate, shares, comments, and recency. Verification status stays visible.',
                title: `${filteredRanked.length} ranked row${filteredRanked.length === 1 ? '' : 's'}`,
              },
              {
                eyebrow: 'Signal',
                text: 'Pattern groups are only created from imported rows, so empty states are intentional until research is added.',
                title: summary.sampleSize > 0 ? `${summary.topHooks.length} hook groups found` : 'No hook groups yet',
              },
              {
                actionLabel: 'Export patterns',
                eyebrow: 'Output',
                onAction: exportAnalysis,
                text: 'Export the exact ranked rows and pattern summary used to generate draft content.',
                title: 'Reproducible evidence pack',
              },
            ]}
          />
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
        ]}
      >
        <WorkflowGrid
          cards={[
            {
              eyebrow: 'Queue',
              text: 'Only drafts saved from Draft Studio can be pushed into this calendar, keeping publishing manual.',
              title: `${calendarItems.length} item${calendarItems.length === 1 ? '' : 's'} in calendar`,
            },
            {
              actionLabel: 'Add current draft',
              eyebrow: 'Next action',
              onAction: addDraftToCalendar,
              text: 'Turn the current draft into a review item with a suggested date three days from now.',
              title: 'Schedule after review',
            },
            {
              eyebrow: 'Guardrail',
              text: 'Nothing auto-publishes. Calendar entries are planning records for the Amsterdam Game Lab team.',
              title: 'Manual publishing only',
            },
          ]}
        />
      </DataPage>
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
      >
        <WorkflowGrid
          cards={[
            {
              eyebrow: 'Library',
              text: 'Saved drafts, uploaded asset records, and review notes are kept here for reuse in the submission.',
              title: `${libraryItems.length} saved asset${libraryItems.length === 1 ? '' : 's'}`,
            },
            {
              actionLabel: 'Create asset record',
              eyebrow: 'Intake',
              onAction: addLibraryItem,
              text: 'Add an asset placeholder, then rename it after a real deck, image set, or edited draft is ready.',
              title: 'Asset tracker',
            },
            {
              eyebrow: 'Review',
              text: 'Each item keeps a status so drafts do not get confused with approved publishing material.',
              title: 'Human review required',
            },
          ]}
        />
      </DataPage>
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
          <WorkflowGrid
            cards={[
              {
                eyebrow: 'Coverage',
                text: 'Reports compare platforms only after imported rows exist for those platforms.',
                title: `${rows.length} platform report${rows.length === 1 ? '' : 's'}`,
              },
              {
                eyebrow: 'Best signal',
                text: rows[0] ? `${rows[0].cells[0]} currently has the strongest average score.` : 'Import rows to identify the strongest platform.',
                title: rows[0]?.cells[3] ?? 'No winning format yet',
              },
              {
                actionLabel: 'Export report',
                eyebrow: 'Submission',
                onAction: exportAnalysis,
                text: 'Download the evidence pack used for deck screenshots, tutorial notes, and GitHub reproducibility.',
                title: 'Analysis JSON',
              },
            ]}
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
      >
        <WorkflowGrid
          cards={[
            {
              eyebrow: 'Repeatable research',
              text: 'Saved searches store the active ICP, objective, tone, platform, and result count for repeat runs.',
              title: `${savedSearches.length} saved search${savedSearches.length === 1 ? '' : 'es'}`,
            },
            {
              actionLabel: 'Save active search',
              eyebrow: 'Shortcut',
              onAction: saveSearch,
              text: 'Create a reusable query snapshot from the current Research filters.',
              title: 'Capture current filters',
            },
            {
              eyebrow: 'Use case',
              text: 'Great for monthly content discovery using the same HR/L&D audience assumptions.',
              title: 'Discovery playbook',
            },
          ]}
        />
      </DataPage>
    )
  }

  if (activePage === 'Brand Voice') {
    return (
      <div className="subpage">
        <PageCard
          subtitle="Editable guardrails for credible Amsterdam Game Lab and Pro Actief copy."
          title="Brand Voice"
        >
          <WorkflowGrid
            cards={[
              {
                eyebrow: 'Tone',
                text: 'Keep copy practical, warm, and specific to workplace wellbeing without turning it into clickbait.',
                title: 'Credible warm voice',
              },
              {
                eyebrow: 'Claims',
                text: 'Client names, outcomes, and metrics must come from supplied materials or verified imports.',
                title: 'Evidence before proof',
              },
              {
                actionLabel: 'Add rule',
                eyebrow: 'Governance',
                onAction: addBrandRule,
                text: 'Add a reusable rule when a reviewer catches a phrase, claim, or tone choice that should be repeated or avoided.',
                title: `${brandRules.length} active rule${brandRules.length === 1 ? '' : 's'}`,
              },
            ]}
          />
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
      >
        <WorkflowGrid
          cards={[
            {
              eyebrow: 'Reviewers',
              text: 'Add people responsible for content strategy, brand voice, metrics verification, and final approval.',
              title: `${teamMembers.length} team member${teamMembers.length === 1 ? '' : 's'}`,
            },
            {
              actionLabel: 'Add reviewer',
              eyebrow: 'Assignment',
              onAction: addTeamMember,
              text: 'Create a review owner record before exporting deliverables.',
              title: 'Human checkpoint',
            },
            {
              eyebrow: 'Workflow',
              text: 'Drafts remain internal until a reviewer checks source links, AGL tone, and no-fabrication guardrails.',
              title: 'Review before publish',
            },
          ]}
        />
      </DataPage>
    )
  }

  return (
    <div className="subpage">
      <PageCard
        subtitle="Operational controls for a manual-review content workflow."
        title="Settings"
      >
        <WorkflowGrid
          cards={[
            {
              eyebrow: 'Storage',
              text: 'Research rows and workspace records are stored locally in this browser for quick hackathon use.',
              title: settings.storeLocally ? 'Local persistence on' : 'Local persistence off',
            },
            {
              eyebrow: 'Publishing',
              text: 'AGLI creates planning records and drafts, but never publishes directly to social platforms.',
              title: settings.manualPublishingOnly ? 'Manual publishing enforced' : 'Manual publishing optional',
            },
            {
              actionLabel: 'Export backup',
              eyebrow: 'Backup',
              onAction: exportAnalysis,
              text: 'Download a JSON copy of all imported rows, patterns, drafts, and workspace records.',
              title: 'Portable project file',
            },
          ]}
        />
        <div className="language-setting">
          <SelectBox
            label="Language"
            onSelect={(label) => {
              const selected = languageOptions.find((item) => item.label === label)
              if (selected) {
                setSettings((current) => ({ ...current, language: selected.value }))
              }
            }}
            options={languageOptions.map((item) => item.label)}
            value={languageOptions.find((item) => item.value === (settings.language ?? 'en'))?.label ?? 'English'}
          />
          <div>
            <strong>{t('Interface language')}</strong>
            <p>{t('Choose the dashboard language. Data titles and imported research stay unchanged.')}</p>
          </div>
        </div>
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
  const t = useT()
  return (
    <section className="subpage-card wide">
      <h2>{t(title)}</h2>
      <p>{t(subtitle)}</p>
      {children}
    </section>
  )
}

function ProfileEditor({
  profile,
  setProfile,
}: {
  profile: WorkspaceProfile
  setProfile: (updater: (current: WorkspaceProfile) => WorkspaceProfile) => void
}) {
  const t = useT()
  function updateProfile(field: keyof WorkspaceProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => updateProfile('avatar', String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  return (
    <div className="profile-page-grid">
      <div className="profile-avatar-card">
        <div className="profile-avatar-large">
          {profile.avatar ? <img alt="" src={profile.avatar} /> : <span>AG</span>}
        </div>
        <label className="compact-action import-action">
          <Upload size={15} />
          {t('Update photo')}
          <input accept="image/*" onChange={uploadAvatar} type="file" />
        </label>
      </div>
      <div className="panel-form profile-form">
        <label>
          {t('Name')}
          <input value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} />
        </label>
        <label>
          {t('Role')}
          <input value={profile.role} onChange={(event) => updateProfile('role', event.target.value)} />
        </label>
        <label>
          {t('Email')}
          <input value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} />
        </label>
        <label>
          {t('Timezone')}
          <input value={profile.timezone} onChange={(event) => updateProfile('timezone', event.target.value)} />
        </label>
      </div>
    </div>
  )
}

function DataPage({
  action,
  buttonLabel,
  children,
  emptyText,
  onAction,
  rows,
  title,
  toolbar = [],
}: {
  action: (message: string) => void
  buttonLabel?: string
  children?: ReactNode
  emptyText: string
  onAction?: (id: string) => void
  rows: Array<{ id: string; cells: string[] }>
  title: string
  toolbar?: Array<{ label: string; onClick: () => void }>
}) {
  return (
    <div className="subpage">
      <PageCard title={title} subtitle="Workspace records created from imports or user actions.">
        {children}
        <DataTable
          buttonLabel={buttonLabel}
          emptyText={emptyText}
          onAction={(id, label) => {
            onAction?.(id)
            action(label === 'Remove' ? '' : label)
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
  const t = useT()
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
                      aria-label={t(buttonLabel)}
                      onClick={() => onAction?.(row.id, buttonLabel)}
                      type="button"
                    >
                      <Trash2 size={14} />
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
  const t = useT()
  return (
    <div className="placeholder-card metric-card">
      <span>{t(title)}</span>
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
  const t = useT()
  return (
    <div className="action-row">
      {actions.map((item) => (
        <button
          className={`compact-action ${item.danger ? 'danger-compact' : ''}`}
          key={item.label}
          onClick={item.onClick}
          type="button"
        >
          {t(item.label)}
        </button>
      ))}
      {extra}
    </div>
  )
}

function ImportCsvButton({ onChange }: { onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const t = useT()
  return (
    <label className="compact-action import-action">
      <Upload size={15} />
      {t('Import CSV')}
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
  const t = useT()
  return (
    <div className="placeholder-card editable-card">
      <div className="editable-card-head">
        <strong>{t(title)}</strong>
        <button aria-label={`Remove ${title}`} onClick={onRemove} type="button">
          <Trash2 size={14} />
        </button>
      </div>
      <textarea value={text} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

function EmptyState({ text, title }: { text: string; title: string }) {
  const t = useT()
  return (
    <div className="empty-state">
      <strong>{t(title)}</strong>
      <span>{t(text)}</span>
    </div>
  )
}

function WorkflowGrid({
  cards,
}: {
  cards: Array<{
    actionLabel?: string
    eyebrow: string
    onAction?: () => void
    text: string
    title: string
  }>
}) {
  const t = useT()
  return (
    <div className="workflow-grid">
      {cards.map((card) => (
        <section className="workflow-card" key={`${card.eyebrow}-${card.title}`}>
          <span>{t(card.eyebrow)}</span>
          <strong>{t(card.title)}</strong>
          <p>{t(card.text)}</p>
          {card.actionLabel && card.onAction ? (
            <button className="link-button" onClick={card.onAction} type="button">
              {t(card.actionLabel)}
            </button>
          ) : null}
        </section>
      ))}
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
  const t = useT()
  return (
    <button aria-pressed={active} className={`setting-toggle ${active ? 'active' : ''}`} onClick={onClick} type="button">
      <span>{t(label)}</span>
      <strong aria-hidden="true">
        <i />
      </strong>
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
  const t = useT()
  return (
    <button aria-current={active ? 'page' : undefined} className={active ? 'active' : ''} onClick={onClick} type="button">
      {icon}
      <span>{t(label)}</span>
    </button>
  )
}

function SelectBox({
  icon,
  label,
  onClick,
  onSelect,
  options,
  value,
}: {
  icon?: ReactNode
  label: string
  onClick?: () => void
  onSelect?: (value: string) => void
  options?: string[]
  value: string
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuOptions = [...new Set(options ?? [])]

  function toggleMenu() {
    if (menuOptions.length === 0 || !onSelect) {
      onClick?.()
      return
    }

    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const menuHeight = Math.min(260, menuOptions.length * 40 + 12)
      const width = Math.max(rect.width, 180)
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)
      const preferredTop = rect.bottom + 6
      const top =
        preferredTop + menuHeight > window.innerHeight - 12
          ? Math.max(12, rect.top - menuHeight - 6)
          : preferredTop

      setMenuPosition({ left, top, width })
    }

    setOpen((current) => !current)
  }

  return (
    <div className="select-box">
      <span>{t(label)}</span>
      <button
        aria-expanded={open}
        aria-label={value}
        className={`select-control ${open ? 'open' : ''}`}
        onClick={toggleMenu}
        ref={buttonRef}
        type="button"
      >
        {icon}
        <strong>{t(value)}</strong>
        <ChevronDown size={17} />
      </button>
      {open && menuOptions.length > 0
        ? createPortal(
        <div
          className="select-menu select-menu-floating"
          style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
        >
          {menuOptions.map((option) => (
            <button
              className={option === value ? 'active' : ''}
              key={option}
              onClick={() => {
                onSelect?.(option)
                setOpen(false)
              }}
              type="button"
            >
              {isPlatform(option) ? <PlatformBadge platform={option} /> : null}
              {t(option)}
            </button>
          ))}
        </div>,
        document.body,
      )
        : null}
    </div>
  )
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className={`platform-badge ${platform.toLowerCase()}`}>
      <img alt={platform} src={platformIconPath(platform)} />
    </span>
  )
}

function isPlatform(value: string): value is Platform {
  return platforms.includes(value as Platform)
}

function platformIconPath(platform: Platform) {
  if (platform === 'LinkedIn') return '/assets/social/linkedin.jpg'
  if (platform === 'YouTube') return '/assets/social/youtube.jpg'
  if (platform === 'Instagram') return '/assets/social/instagram.jpg'
  return '/assets/social/tiktok.jpg'
}

function panelLabel(panel: PanelKey) {
  const labels: Record<PanelKey, string> = {
    dateRange: 'Research date range',
    filters: 'Advanced filters',
    help: 'How AGLI works',
    notifications: 'Workspace notifications',
    patterns: 'Pattern evidence',
    profile: 'Update profile',
    dataSources: 'Data sources',
    shortcuts: 'Shortcuts',
  }
  return labels[panel]
}

function buildCta(objective: string, platform: Platform) {
  if (objective === 'Discovery Call') return 'Book a short Pro Actief fit check with Amsterdam Game Lab.'
  if (objective === 'Workshop Demand') return 'Invite your team lead to test this exercise in the next workshop.'
  if (objective === 'Thought Leadership') return 'Save this question for your next leadership conversation.'
  if (platform === 'TikTok' || platform === 'Instagram') return 'Save this for your next team check-in.'
  return 'Share one small team habit that makes stress easier to discuss.'
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
