export type Platform = 'LinkedIn' | 'YouTube' | 'Instagram' | 'TikTok'

export type SourceQuality = 'demo' | 'verified' | 'imported'

export interface ContentItem {
  id: string
  platform: Platform
  title: string
  creator: string
  url: string
  topic: string
  angle: string
  hook: string
  hookType: string
  format: string
  visualStyle: string
  lengthSeconds: number
  audience: string
  views: number
  engagements: number
  comments: number
  shares: number
  date: string
  sourceQuality: SourceQuality
  verificationNote: string
}

export interface RankedContent extends ContentItem {
  engagementRate: number
  score: number
  scoreReasons: string[]
}

export interface PatternGroup {
  label: string
  count: number
  averageScore: number
  examples: string[]
}

export interface PatternSummary {
  sampleSize: number
  medianEngagementRate: number
  averageLengthSeconds: number
  recommendedLength: string
  topHooks: PatternGroup[]
  topTopics: PatternGroup[]
  topFormats: PatternGroup[]
  topVisualStyles: PatternGroup[]
}

export interface DraftInputs {
  platform: Platform
  format: string
  objective: string
  audience: string
  tone: string
  productAngle: string
  selectedPattern: string
}

export interface DraftOutput {
  hooks: string[]
  postCopy: string
  videoScript: Array<{
    time: string
    scene: string
    voiceover: string
    onScreenText: string
  }>
  checklist: string[]
  markdown: string
}
