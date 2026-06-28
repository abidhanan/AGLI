import type { ContentItem, DraftInputs, DraftOutput, PatternSummary } from '../types'

function platformInstruction(platform: DraftInputs['platform'], language: DraftInputs['language']) {
  if (language === 'id') {
    switch (platform) {
      case 'LinkedIn':
        return 'Gunakan paragraf pendek, sudut pandang profesional yang jelas, dan satu pertanyaan yang berdasar.'
      case 'YouTube':
        return 'Buka dengan outcome, tampilkan aktivitas dengan cepat, lalu tutup dengan langkah praktis.'
      case 'Instagram':
        return 'Gunakan struktur berbasis caption, prompt yang saveable, dan ritme visual before/after.'
      case 'TikTok':
        return 'Mulai dari inti masalah, gunakan energi direct-to-camera, dan jaga caption tetap sederhana.'
    }
  }

  if (language === 'nl') {
    switch (platform) {
      case 'LinkedIn':
        return 'Gebruik korte paragrafen, een duidelijk professioneel standpunt en een onderbouwde vraag.'
      case 'YouTube':
        return 'Open met de uitkomst, toon de activiteit snel en sluit af met een praktische volgende stap.'
      case 'Instagram':
        return 'Gebruik een caption-gestuurde structuur, bewaarbare prompts en een visueel before/after-ritme.'
      case 'TikTok':
        return 'Begin midden in het probleem, gebruik directe camera-energie en houd captions eenvoudig.'
    }
  }

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

function localizedHooks(language: DraftInputs['language']) {
  if (language === 'id') {
    return [
      'Tim kamu mungkin tidak butuh kuliah wellbeing lagi. Mereka mungkin butuh cara yang lebih aman untuk membahas stres.',
      'Bagaimana jika serious game bisa memperlihatkan pola stres tim sebelum berubah menjadi absensi?',
      'Percakapan pencegahan stres yang paling kuat sering dimulai dari bermain, lalu menjadi sangat praktis.',
      'Jika stres hanya diperlakukan sebagai isu individu, tim melewatkan setengah gambarnya.',
    ]
  }

  if (language === 'nl') {
    return [
      'Je team heeft misschien geen nieuwe wellbeing-lezing nodig. Het heeft misschien een veiligere manier nodig om over stress te praten.',
      'Wat als een serious game stresspatronen zichtbaar kan maken voordat ze tot verzuim leiden?',
      'Het sterkste stresspreventiegesprek begint vaak met spel en wordt daarna heel praktisch.',
      'Als stress alleen als individueel probleem wordt behandeld, mist het team de helft van het beeld.',
    ]
  }

  return [
    'Your team may not need another wellbeing lecture. It may need a safer way to talk about stress.',
    'What if a serious game could reveal team stress patterns before they turn into absence?',
    'The strongest stress-prevention conversation often starts with play, then becomes very practical.',
    'If stress is treated only as an individual issue, the team misses half the picture.',
  ]
}

function localizedDraftBody(
  language: DraftInputs['language'],
  inputs: DraftInputs,
  hook: string,
  pattern: string,
  topic: string,
  proofLine: string,
) {
  if (language === 'id') {
    return [
      hook,
      '',
      `Untuk ${inputs.audience}, tantangannya bukan sekadar tahu bahwa stres ada. Tantangannya adalah membantu orang menamai apa yang terjadi di level Individual, Group, Leader, dan Organisation tanpa membuat sesi terasa menyalahkan.`,
      '',
      'Pro Actief dibuat untuk momen itu. Format serious game yang difasilitasi membantu tim melihat sinyal stres, membahasnya dengan aman, lalu mengubah refleksi menjadi langkah berikutnya yang konkret.',
      '',
      `Draft ${inputs.platform} yang kuat dengan pola ${pattern} perlu tetap spesifik: tampilkan satu momen tim yang mudah dikenali, hubungkan dengan ${topic}, lalu berikan pertanyaan praktis yang bisa dipakai manager minggu ini.`,
      '',
      proofLine,
      '',
      'Draft CTA: Jika tim kamu ingin mencegah stres lebih awal, Amsterdam Game Lab bisa membantu mengeksplorasi apakah Pro Actief cocok untuk konteksmu.',
    ].join('\n')
  }

  if (language === 'nl') {
    return [
      hook,
      '',
      `Voor ${inputs.audience} is de uitdaging niet alleen weten dat stress bestaat. De uitdaging is mensen laten benoemen wat er gebeurt op Individual, Group, Leader en Organisation niveau zonder dat de sessie beschuldigend voelt.`,
      '',
      'Pro Actief is gebouwd voor dat moment. Het gebruikt een gefaciliteerd serious-game format om teams stresssignalen te laten zien, veilig te bespreken en reflectie om te zetten in concrete volgende stappen.',
      '',
      `Een sterk ${inputs.platform}-concept met het ${pattern}-patroon blijft specifiek: toon een herkenbaar teammoment, verbind het met ${topic}, en bied een praktische vraag die managers deze week kunnen gebruiken.`,
      '',
      proofLine,
      '',
      'Concept CTA: Als je team stress eerder wil voorkomen, kan Amsterdam Game Lab helpen onderzoeken of Pro Actief bij jullie context past.',
    ].join('\n')
  }

  return [
    hook,
    '',
    `For ${inputs.audience}, the hard part is not knowing that stress exists. It is getting people to name what is happening across the Individual, Group, Leader, and Organisation levels without turning the session into blame.`,
    '',
    `Pro Actief is built for that moment. It uses a facilitated serious-game format to help teams notice stress signals, discuss them safely, and turn reflection into concrete next steps.`,
    '',
    `A strong ${inputs.platform} draft using the ${pattern} pattern should stay specific: show one recognizable team moment, connect it to ${topic}, then offer a practical question managers can use this week.`,
    '',
    proofLine,
    '',
    `Draft CTA: If your team is trying to prevent stress earlier, Amsterdam Game Lab can help you explore whether Pro Actief fits your context.`,
  ].join('\n')
}

function localizedProofLine(language: DraftInputs['language']) {
  if (language === 'id') {
    return 'Jika sudah disetujui Amsterdam Game Lab, tambahkan satu proof line terverifikasi dari materi klien yang disediakan.'
  }
  if (language === 'nl') {
    return 'Voeg na goedkeuring door Amsterdam Game Lab een geverifieerde proof line toe uit aangeleverde klantmaterialen.'
  }
  return 'If approved by Amsterdam Game Lab, add one verified proof line from supplied client materials.'
}

function localizedVideoScript(language: DraftInputs['language']) {
  if (language === 'id') {
    return [
      {
        time: '0-3s',
        scene: 'Close-up fasilitator meletakkan kartu game atau prompt tim.',
        voiceover: 'Tim kamu bisa terlihat baik-baik saja di laporan, tapi tetap membawa stres yang belum dinamai.',
        onScreenText: 'Stres sering tersembunyi di rutinitas',
      },
      {
        time: '3-12s',
        scene: 'Potongan anggota tim memilih kartu, bereaksi, dan menulis satu refleksi.',
        voiceover: 'Pro Actief memakai mekanik serious game untuk membuat pola stres terlihat di level IGLO.',
        onScreenText: 'Individual | Group | Leader | Organisation',
      },
      {
        time: '12-28s',
        scene: 'Fasilitator memandu debrief singkat, bukan lecture.',
        voiceover: 'Tujuannya bukan menang. Tujuannya membuka percakapan yang biasanya ditunda tim.',
        onScreenText: 'Debrief adalah intervensinya',
      },
      {
        time: '28-42s',
        scene: 'Tampilkan satu aksi tim yang tertulis di kartu, lalu nama Amsterdam Game Lab.',
        voiceover: 'Gunakan sesi untuk menyepakati apa yang bisa diubah tim sebelum stres menjadi absensi.',
        onScreenText: 'Ubah refleksi menjadi aksi',
      },
      {
        time: '42-55s',
        scene: 'Akhiri dengan product shot atau momen workshop yang tenang.',
        voiceover: 'Mulai dari percakapan yang benar-benar bisa dilakukan tim.',
        onScreenText: 'Pro Actief by Amsterdam Game Lab',
      },
    ]
  }

  if (language === 'nl') {
    return [
      {
        time: '0-3s',
        scene: 'Close-up van een facilitator die een gamekaart of teamprompt neerlegt.',
        voiceover: 'Je team kan er op papier goed uitzien en toch stress dragen die niemand benoemt.',
        onScreenText: 'Stress verstopt zich in routines',
      },
      {
        time: '3-12s',
        scene: 'Snelle cuts van teamleden die kaarten kiezen, reageren en een reflectie opschrijven.',
        voiceover: 'Pro Actief gebruikt serious-game mechanics om stresspatronen zichtbaar te maken op IGLO-niveau.',
        onScreenText: 'Individual | Group | Leader | Organisation',
      },
      {
        time: '12-28s',
        scene: 'Laat de facilitator een korte debrief begeleiden, geen lezing.',
        voiceover: 'Het doel is niet winnen. Het doel is een gesprek openen dat teams vaak uitstellen.',
        onScreenText: 'De debrief is de interventie',
      },
      {
        time: '28-42s',
        scene: 'Toon een geschreven teamactie op een kaart, daarna Amsterdam Game Lab.',
        voiceover: 'Gebruik de sessie om af te spreken wat het team kan veranderen voordat stress verzuim wordt.',
        onScreenText: 'Van reflectie naar actie',
      },
      {
        time: '42-55s',
        scene: 'Eindig met een rustige productshot of workshopmoment.',
        voiceover: 'Start met een gesprek dat je team echt kan voeren.',
        onScreenText: 'Pro Actief by Amsterdam Game Lab',
      },
    ]
  }

  return [
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
}

function localizedChecklist(
  language: DraftInputs['language'],
  platformAdvice: string,
  length: string,
) {
  if (language === 'id') {
    return [
      'Dasarkan angle pada contoh performa tinggi yang diimpor.',
      'Verifikasi setiap metrik dan URL sebelum dipakai di deck client-facing.',
      'Jangan membuat ROI, outcome klinis, atau kutipan klien palsu.',
      'Gunakan tone of voice AGL yang disediakan sebelum publikasi.',
      `Platform fit: ${platformAdvice}`,
      `Target durasi dari Pattern Engine: ${length}.`,
    ]
  }

  if (language === 'nl') {
    return [
      'Baseer de invalshoek op geimporteerde voorbeelden die goed presteren.',
      'Verifieer elke metric en URL voordat je die in een client-facing deck gebruikt.',
      'Verzin geen ROI, klinische outcomes of klantquotes.',
      'Gebruik de aangeleverde AGL tone of voice voor publicatie.',
      `Platform fit: ${platformAdvice}`,
      `Doellengte uit Pattern Engine: ${length}.`,
    ]
  }

  return [
    'Ground the angle in imported high-performing examples.',
    'Verify every metric and URL before using it in a client-facing deck.',
    'Do not invent ROI, clinical outcomes, or client quotes.',
    'Use the supplied AGL tone of voice before publishing.',
    `Platform fit: ${platformAdvice}`,
    `Target length from pattern engine: ${length}.`,
  ]
}

export function generateDraft(
  inputs: DraftInputs,
  summary: PatternSummary,
  references: ContentItem[],
): DraftOutput {
  const language = inputs.language ?? 'en'
  const pattern = inputs.selectedPattern || summary.topHooks[0]?.label || 'Problem-first'
  const topic = summary.topTopics[0]?.label || 'workplace stress prevention'
  const length = summary.recommendedLength
  const platformAdvice = platformInstruction(inputs.platform, language)
  const safeProofLine = localizedProofLine(language)
  const hooks = localizedHooks(language)
  const postCopy = localizedDraftBody(language, inputs, hooks[0], pattern, topic, safeProofLine)
  const videoScript = localizedVideoScript(language)
  const checklist = localizedChecklist(language, platformAdvice, length)

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
