import type { ContentItem, DraftInputs, DraftOutput, PatternSummary } from '../types'

function platformInstruction(platform: DraftInputs['platform']) {
  switch (platform) {
    case 'LinkedIn':
      return 'Use short paragraphs, a clear professional point of view, and one grounded question.'
    case 'YouTube':
      return 'Open with the outcome, show the activity fast, and close with a practical next step.'
    case 'Instagram':
      return 'Use caption-led structure, saveable prompts, and a visual before/after rhythm.'
    case 'TikTok':
      return 'Start in the middle of the problem, use direct camera energy, and keep captions simple.'
  }
}

function formatReferenceTitles(references: ContentItem[]) {
  return references
    .slice(0, 3)
    .map((item) => `- ${item.platform}: ${item.title}`)
    .join('\n')
}

export function generateDraft(
  inputs: DraftInputs,
  summary: PatternSummary,
  references: ContentItem[],
): DraftOutput {
  const pattern = inputs.selectedPattern || summary.topHooks[0]?.label || 'Problem-first'
  const topic = summary.topTopics[0]?.label || 'workplace stress prevention'
  const length = summary.recommendedLength
  const platformAdvice = platformInstruction(inputs.platform)
  const safeProofLine =
    'If approved by Amsterdam Game Lab, add one verified proof line from supplied client materials.'

  const hooks = [
    `Your team may not need another wellbeing lecture. It may need a safer way to talk about stress.`,
    `What if a serious game could reveal team stress patterns before they turn into absence?`,
    `The strongest stress-prevention conversation often starts with play, then becomes very practical.`,
    `If stress is treated only as an individual issue, the team misses half the picture.`,
  ]

  const postCopy = [
    hooks[0],
    '',
    `For ${inputs.audience}, the hard part is not knowing that stress exists. It is getting people to name what is happening across the Individual, Group, Leader, and Organisation levels without turning the session into blame.`,
    '',
    `Pro Actief is built for that moment. It uses a facilitated serious-game format to help teams notice stress signals, discuss them safely, and turn reflection into concrete next steps.`,
    '',
    `A strong ${inputs.platform} draft using the ${pattern} pattern should stay specific: show one recognizable team moment, connect it to ${topic}, then offer a practical question managers can use this week.`,
    '',
    safeProofLine,
    '',
    `Draft CTA: If your team is trying to prevent stress earlier, Amsterdam Game Lab can help you explore whether Pro Actief fits your context.`,
  ].join('\n')

  const videoScript = [
    {
      time: '0-3s',
      scene: 'Close-up of facilitator setting down a game card or team prompt.',
      voiceover: 'Your team might look fine on paper and still be carrying stress nobody is naming.',
      onScreenText: 'Stress hides in normal routines',
    },
    {
      time: '3-12s',
      scene: 'Cut between team members reacting, choosing cards, and writing one reflection.',
      voiceover:
        'Pro Actief uses serious game mechanics to make stress patterns visible across the IGLO levels.',
      onScreenText: 'Individual | Group | Leader | Organisation',
    },
    {
      time: '12-28s',
      scene: 'Show the facilitator guiding a short debrief, not a lecture.',
      voiceover:
        'The point is not to win a game. The point is to create a conversation teams usually postpone.',
      onScreenText: 'The debrief is the intervention',
    },
    {
      time: '28-42s',
      scene: 'Show one written team action on a card, then Amsterdam Game Lab name.',
      voiceover:
        'Use the session to agree what the team can change before stress becomes absence or turnover.',
      onScreenText: 'Turn reflection into action',
    },
    {
      time: '42-55s',
      scene: 'End with a calm product shot or workshop moment.',
      voiceover: 'Start with a conversation your team can actually have.',
      onScreenText: 'Pro Actief by Amsterdam Game Lab',
    },
  ]

  const checklist = [
    'Ground the angle in imported high-performing examples.',
    'Verify every metric and URL before using it in a client-facing deck.',
    'Do not invent ROI, clinical outcomes, or client quotes.',
    'Use the supplied AGL tone of voice before publishing.',
    `Platform fit: ${platformAdvice}`,
    `Target length from pattern engine: ${length}.`,
  ]

  const markdown = [
    `# AGLI draft for ${inputs.platform}`,
    '',
    `Objective: ${inputs.objective}`,
    `Audience: ${inputs.audience}`,
    `Tone: ${inputs.tone}`,
    `Pattern: ${pattern}`,
    `Product angle: ${inputs.productAngle}`,
    '',
    '## Hook options',
    ...hooks.map((hook) => `- ${hook}`),
    '',
    '## Post copy',
    postCopy,
    '',
    '## Video outline',
    ...videoScript.map(
      (line) =>
        `- ${line.time}: ${line.scene} VO: ${line.voiceover} Text: ${line.onScreenText}`,
    ),
    '',
    '## Pattern references',
    formatReferenceTitles(references),
    '',
    '## Guardrails',
    ...checklist.map((item) => `- ${item}`),
  ].join('\n')

  return {
    hooks,
    postCopy,
    videoScript,
    checklist,
    markdown,
  }
}
