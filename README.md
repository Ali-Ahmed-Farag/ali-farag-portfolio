# Ali Farag — Portfolio

Personal portfolio built with Angular, based on a Hero / Resume / Stack / Projects / Contact layout.

## Run locally

```bash
npm install
npm start
```
Then open http://localhost:4200

## Build for production

```bash
npm run build
```
Output goes to `dist/`. Deploy the `dist/` folder to Vercel, Netlify, or any static host.

## ⚠️ TODO before you publish this

1. **Contact form (EmailJS)** — `src/app/contact/contact.component.ts` (2 places) and `src/index.html`:
   - Service ID is already set: `service_nay6z7g`
   - Replace `TODO_TEMPLATE_ID` with your EmailJS template ID
   - Replace `TODO_PUBLIC_KEY` with your EmailJS public key (in **both** files — they must match)

2. **Profile photo** — `src/assets/images/profile.jpg` is a placeholder. Replace it with your real photo (keep the same filename, or update `photoPath` in `src/app/hero/hero.component.ts`).

3. **Projects** — `src/app/projects/projects.component.ts` has an empty `allProjects` array with an example object commented above it. Add your projects there once ready, and drop matching images into `src/assets/projects/`.

4. **GitHub stats (optional)** — the Projects page can show live GitHub stats via `api/github.js` (a Vercel serverless function). If you deploy to Vercel, add a `GITHUB_TOKEN` environment variable (a GitHub personal access token) for this to work. Otherwise the GitHub stats section will just show an error state — harmless.

## Structure

- `hero` — landing section (name, title, photo)
- `stack` — tech stack + about + certificates + social links
- `projects` — filterable project grid + live GitHub stats
- `resume` — modal résumé (opened from navbar)
- `contact` — modal contact form + book-a-call calendar (opened from navbar)
- `navbar` — floating pill navigation
