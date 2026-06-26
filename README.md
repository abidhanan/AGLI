# AGLI - Amsterdam Game Lab Intelligence

AGLI is a lightweight content-intelligence and content-writing prototype for Amsterdam Game Lab. It helps a small team collect high-performing content examples, rank them, identify repeatable patterns, and turn those patterns into grounded draft content for Pro Actief.

The tool is designed for the hackathon case: category creation, low search demand, small budget, non-technical users, and strict no-fabricated-claims guardrails.

## What It Does

- Ranks imported LinkedIn, YouTube, Instagram, and TikTok content by views, engagement rate, shares, comments, recency, and source quality.
- Surfaces pattern insights: hooks, topics, formats, lengths, and visual styles.
- Generates draft post copy, hook options, and video outlines for Amsterdam Game Lab and Pro Actief.
- Keeps demo seed rows clearly labelled as synthetic so they are not mistaken for real proof.
- Exports analysis JSON and includes a reproducible command-line pattern report.

## Stack

- React + Vite + TypeScript
- Local JSON/CSV data workflow
- No paid API required for the demo
- Vercel-ready static deployment

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Reproduce the Pattern Report

```bash
npm run analyze
```

This writes `dist-analysis/pattern-report.md` from `src/data/seedContent.json`.

## Use Real Research Data

1. Collect posts and videos from LinkedIn analytics, YouTube Studio, VidIQ, TubeBuddy, TikTok Creative Center, Instagram insights, or manual platform review.
2. Fill `public/sample-import.csv` with verified metrics.
3. In the app, click **Import CSV**.
4. Turn off **Show demo seed** before making a client-facing export.
5. Use **Export analysis** to download the ranked rows, patterns, draft, and guardrails.

## Important Honesty Rules

- Demo seed metrics are synthetic and only prove the workflow.
- Do not present demo seed rows as actual market research.
- Do not invent client results, ROI, medical claims, quotes, or case studies.
- Generated output is a draft for human review, not auto-published content.

## Hackathon Submission Folder

Recommended folder name:

```text
GroupName/PersonalName_AGLI
```

Include:

- Working deployed URL
- GitHub repo URL
- `README.md`
- `docs/tutorial.md`
- `docs/hackathon-deck.md`
- `docs/deployment.md`
- `dist-analysis/pattern-report.md` after running `npm run analyze`
