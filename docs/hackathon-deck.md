# Hackathon Deck Outline - AGLI

## Slide 1 - Title

AGLI: Amsterdam Game Lab Intelligence

Content intelligence that finds what already works, then helps write more of it.

## Slide 2 - Client Problem

Amsterdam Game Lab sells serious games for workplace wellbeing and team development. The market is category-creation: buyers are not searching for "serious games for stress prevention", so SEO and paid search are weak. Growth depends on content that earns attention from HR, L&D, team leads, and managers.

## Slide 3 - Bottleneck

The team is small. Content production is slow and hit-or-miss. They do not need more content; they need a higher hit rate grounded in patterns that have already earned views, engagement, comments, and shares.

## Slide 4 - Solution

AGLI is a lightweight web app that supports a two-step workflow:

1. Research: collect and rank high-performing content examples.
2. Write: generate draft hooks, post copy, and video outlines based on proven patterns.

## Slide 5 - Product Demo

Show:

- Import CSV
- Ranking table
- Pattern Engine
- Use pattern
- Draft Studio
- Export analysis

## Slide 6 - Why This Is Honest

AGLI does not pretend restricted platform data is freely available. It supports manual or tool-assisted imports from VidIQ, TubeBuddy, TikTok Creative Center, LinkedIn analytics, Instagram insights, and YouTube Studio.

The app includes scenario rows for the live demo and warns users to replace them with verified imports before treating outputs as market evidence.

## Slide 7 - Scoring Logic

Score combines:

- View signal
- Engagement rate
- Share signal
- Comment signal
- Recency
- Source quality

## Slide 8 - Draft Logic

Drafts are grounded in:

- Selected content pattern
- Top hook type
- Top topic
- Target audience
- Platform style
- Pro Actief positioning and IGLO model

Outputs include hooks, post copy, video outline, and guardrail checklist.

## Slide 9 - Tech Stack

- React + Vite + TypeScript
- Static Vercel deployment
- CSV import for low-cost reproducibility
- Local scoring and drafting logic
- Optional future LLM/API layer

## Slide 10 - Roadmap

Next steps:

- Add authenticated YouTube Data API connector.
- Add OpenAI/Claude drafting endpoint with approved AGL brand examples.
- Store research runs in a database.
- Add team review workflow.
- Add scheduled monthly research refresh.

## Slide 11 - Submission

Deliverables:

- Working prototype
- GitHub repo
- Tutorial and deck outline
- Reproducible pattern report via `npm run analyze`
- Vercel deployment URL
