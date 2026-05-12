# Changelog UI

An editorial changelog interface built for developer audiences. Clean typography, tag filtering synced to URL params, and MDX-rendered entries.

[Live Demo →](https://changelog.javiertpadilla.com/)

![Changelog UI screenshot](./screenshot.png)

## What it does

A production-ready changelog UI with a focus on reading experience and developer tooling aesthetics. Built as a portfolio piece demonstrating design-to-code execution.

- MDX-rendered changelog entries with custom component overrides
- URL-synced tag filtering (shareable filtered views)
- Highlight entry treatment with distinct visual hierarchy
- Three-font editorial system: Newsreader (display), IBM Plex Sans (body), JetBrains Mono (UI labels)
- Fully static, no database required

## Stack

Next.js 14 · TypeScript · Tailwind CSS · MDX · next-mdx-remote

## Run locally

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/changelog-ui
cd changelog-ui
npm install
npm run dev
\`\`\`

## Design decisions

- Tag state lives in the URL (`?tags=feature,fix`) so filtered views are shareable and back/forward navigation works correctly
- Highlight entries get an amber left border treatment to differentiate major releases
- Typography hierarchy is intentional: Newsreader for editorial weight, IBM Plex for readability, JetBrains Mono for labels only


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
