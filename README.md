# Port Weekly Metrics Dashboard

Interactive React dashboard showing 16 weeks of sales metrics: Net New ARR, Opp ARR, Meetings, Won ARR, and New Signups.

## Setup (3 steps)

### 1. Create GitHub repository

```bash
cd port-dashboard
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/port-weekly-dashboard.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Enable GitHub Pages

1. Go to repo **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Save

(The deploy workflow will run automatically on push)

### 3. Update Dashboard.jsx

In `src/Dashboard.jsx`, replace:
```javascript
const response = await fetch('https://raw.githubusercontent.com/YOUR_USERNAME/port-weekly-dashboard/main/data/metrics.json');
```

with your actual GitHub username.

## Data pipeline (n8n)

The n8n workflow (`Weekly Digest Charts`) now exports JSON weekly:

1. **Snowflake query** outputs 16 weeks of metrics
2. **HTTP POST node** commits `metrics.json` to GitHub (via GitHub API)
3. **Dashboard auto-fetches** every 5 minutes

### n8n: Add GitHub export

In `Weekly Digest Charts` workflow, add **HTTP Request** node after **Build Charts**:

**Method**: POST  
**URL**: `https://api.github.com/repos/YOUR_USERNAME/port-weekly-dashboard/contents/data/metrics.json`

**Authentication**: Header `Authorization: Bearer YOUR_GITHUB_TOKEN`

**Body** (raw JSON):
```json
{
  "message": "Weekly metrics update",
  "content": "BASE64_ENCODED_JSON_HERE",
  "branch": "main"
}
```

To encode: `echo -n "$JSON_STRING" | base64`

## Dashboard URL

Once deployed:  
`https://YOUR_USERNAME.github.io/port-weekly-dashboard/`

## Updates

Push to `main` branch → GitHub Actions auto-builds & deploys in ~2 min.

---

**Last dashboard**: Renders 5 interactive line charts with tooltips. Dark mode auto-switches on system preference.
