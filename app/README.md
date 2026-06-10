## Project Structure

```
docker-ninja/
├── app/                          # Next.js App Router (primary source)
│   ├── [slug]/page.tsx           # Dynamic app-detail route
│   ├── about/page.tsx
│   ├── categories/page.tsx
│   ├── community/page.tsx
│   ├── containers/page.tsx
│   ├── docs/page.tsx
│   ├── features/ChatAI.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── page-client.tsx
│   ├── sponsoring/page.tsx
│   ├── README.md
│   ├── actions.ts
│   ├── components/               # Reusable UI components
│   ├── context/AppsContext.tsx
│   ├── hooks/
│   ├── utils/
│   └── style/globals.css
├── src/                          # Additional source (duplicate/legacy root)
├── lib/supabase.ts               # Supabase client init
├── supabase/                     # DB migrations / schema
├── public/                       # Static assets
├── Dockerfile / Dockerfile.dev
├── compose.yml / compose.dev.yml
├── next.config.ts
├── open-next.config.ts
├── wrangler.toml / wrangler.jsonc
├── sync-versions.mjs             # DB version sync script
├── package.json
└── pnpm-workspace.yaml

```

## Development

### Local Run

| Command | Description |
|---------|-------------|
| `pnpm dev` | Starts the **Next.js dev server** with hot reloading on `localhost:3000` |
| `pnpm build` | Compiles the Next.js app for production into `.next/` |
| `pnpm start` | Runs the **already-built** production app (must run `pnpm build` first) |


### Local Docker Run

| Command | Description |
|---------|-------------|
| `docker compose -f compose.dev.yml up -d --build --no-cache` | Uses a **separate dev compose** (`compose.dev.yml`), starts app in **detached mode**, rebuilds images from **scratch** using (`Dockerfile.dev`).|
| `docker compose up -d --build --no-cache` | Uses default `compose.yml`, starts app in **detached mode**, rebuilds images from **scratch** using (`Dockerfile`).|

### Cloudflare Run

Use the following commands to preview or deploy the optimized cloudflare worker build:

| Command | Description |
|---------|-------------|
| `pnpm run preview` | Builds for **Cloudflare Worker** via `opennextjs-cloudflare` and starts a **local preview server** to test the edge build before deploying |
| `pnpm run deploy` | Builds for **Cloudflare Worker** and **deploys** it to Cloudflare Workers with minification enabled |