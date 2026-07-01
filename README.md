# LEVEL UP LAB

A bilingual static personal website about English, AI, digital media and business.

## Publish

Upload this entire folder to Netlify, Cloudflare Pages, GitHub Pages or any static web host. No build command or dependency installation is required; use the folder root as the publish directory.

## Content

- `index.html` — homepage
- `tracks.html` — learning paths
- `projects.html` — project archive
- `project.html?id=...` — project case studies
- `journal.html` — learning journal
- `article.html?post=...` — journal entries

Published content lives in `content/projects.json` and `content/articles.json`. Replace the generic student profile with real personal details before sharing publicly.

## Publishing dashboard

The editor is available at `/admin/`. The frontend reads the two JSON content files directly, so no site build command is required.

For online login and publishing:

1. Push this folder to a GitHub repository using the `main` branch.
2. Import that repository into Netlify.
3. Enable Netlify Identity and Git Gateway.
4. Invite your editor account in Netlify Identity.
5. Open `https://your-site.example/admin/`, sign in, edit content and click Publish.

For local CMS editing, run a Decap local proxy in addition to the static web server. The published site does not need this local proxy.
