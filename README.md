# AI Data Center Atlas

A polished Three.js-powered static site mapping major publicly reported AI-focused data center campuses in the United States. It uses cinematic motion, glowing markers, and responsive glassmorphism UI to make large-scale AI infrastructure easier to explore.

## Features

- Interactive Three.js map with animated markers for major AI data center sites.
- Curated AI-focused dataset including OpenAI/Oracle Stargate, xAI Colossus, Microsoft Fairwater, Meta Hyperion, CoreWeave, AWS, Google, and related projects.
- Responsive modern design with accessible cards, summary metrics, and mobile layouts.
- Dependency-light static build pipeline ready for Vercel deployment.

## Run locally

```bash
git clone <your-repository-url>
cd data-center-map
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New Project** and import the GitHub repo.
3. Use build command `npm run build` and output directory `dist`.
4. Click **Deploy**.

## Data note

The project intentionally tracks only major AI-oriented U.S. facilities and announced campuses, not every conventional colocation or enterprise data center. Capacities and statuses are public estimates and should be verified before business, investment, energy, or policy use.
