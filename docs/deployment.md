# Deployment Notes

The app is Vercel-ready through `vercel.json`.

## Vercel

```bash
npm install
npm run build
npx vercel login
npx vercel deploy --prod
```

If you already have a token:

```bash
npx vercel deploy --prod --yes --token=$VERCEL_TOKEN
```

This Codex session attempted deployment through the Vercel plugin and CLI. The plugin returned CLI instructions, and the CLI waited for authentication. No `VERCEL_TOKEN` or `.vercel/project.json` was present locally, so deployment is blocked by account authentication, not by code.

## Local Preview

```bash
npm run dev
```

Current local development URL used for QA:

```text
http://127.0.0.1:5173
```

## GitHub

This workspace is already initialized as a Git repository and has one clean commit.

After creating an empty GitHub repo named `AGLI`, run:

```bash
git remote add origin https://github.com/<your-username>/AGLI.git
git branch -M main
git push -u origin main
```

GitHub CLI was not available in this session, so the repo could not be created automatically.
