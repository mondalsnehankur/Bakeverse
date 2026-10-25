# BakeVerse — public demo preview

This is a **frontend-only demonstration build** of BakeVerse. It uses an illustrative sample catalogue stored in `src/data/demoProducts.js`; it does not connect to the original database or backend.

## What's enabled

- Home page and sample bakery showcase
- Sample product catalogue
- Product search, category/bakery filters, dietary filters and sorting
- Product detail preview and light/dark theme toggle

## What's intentionally disabled

User accounts, login, ordering, cart/checkout, reviews, live inventory, AI services, custom cake tools, admin tools and bakery dashboards. Those features need the original backend and database and should not be presented as live functionality in this demo.

## Deploy it under your own accounts

You retain ownership by creating and controlling the GitHub repository and Vercel project yourself. Do not share account passwords or tokens with anyone.

1. Extract this ZIP on your computer.
2. Create a new repository in **your own GitHub account** (public or private as you prefer). Name it something like `bakeverse-demo`.
3. Upload the contents of this `BakeVerse-demo` folder to the repository root. The `package.json`, `package-lock.json`, `index.html`, `src/` and `vercel.json` files should be at the repository root, not nested inside another folder.
4. Sign in to Vercel using your own account and choose **Add New → Project**.
5. Import your `bakeverse-demo` GitHub repository.
6. Use these project settings:
   - Framework preset: **Vite** (or let Vercel detect it)
   - Root directory: `./`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install` (default is fine)
   - Environment variables: **none required** for this demo
7. Deploy. Vercel will build and host the site under the project associated with your account. You can later attach a domain you own from the Vercel project settings.

## Run locally (optional)

Install Node.js LTS, open a terminal in this folder, and run:

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in the terminal.

## Important notes

- The original `Bakery.zip` archive is separate and has not been modified by preparing this demo package.
- This ZIP contains only the frontend source and public demo data; it does not include the backend, database dump, local environment files, API keys, `node_modules` or a stale prebuilt `dist/` folder.
- Product images are loaded from Unsplash URLs, so the browser needs an internet connection to display them.
- Product names, prices, ratings and bakery listings are demonstration data, not live offers or verified stock.
- A local production build could not be verified in the preparation environment because dependency installation timed out and Vite was unavailable. Vercel will install dependencies during deployment; if its build log reports an error, use that exact error to troubleshoot before sharing the site publicly.
