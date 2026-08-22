# Deploy TradeWise to GitHub Pages

## One-time setup (about 30 seconds)

1. Open **Settings → Pages**: https://github.com/lzhang-png/trade/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Re-run the deploy workflow: https://github.com/lzhang-png/trade/actions/workflows/deploy.yml → **Run workflow**

After that, every push to `main` deploys automatically.

## Your live URL

**https://lzhang-png.github.io/trade/**

Open this on your phone — the app has a mobile menu (☰) in the top-right corner.

## Manual deploy

```bash
npm run build:pages
# Output is in ./out — uploaded by GitHub Actions on push to main
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on GitHub Pages | Enable Pages source = GitHub Actions (step above) |
| Deploy workflow failed | Re-run after enabling Pages |
| Styles broken | Ensure `GITHUB_PAGES=true` is set in the workflow (already configured) |
