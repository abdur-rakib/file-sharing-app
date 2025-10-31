# Simple Branch Protection Setup

## 🎯 Simple Setup - Just Tests Required

### 1. Go to GitHub Repository Settings

- Navigate to: `https://github.com/abdur-rakib/file-sharing-app/settings/branches`
- Click **"Add rule"**

### 2. Configure Branch Protection (SIMPLE)

```
Branch name pattern: master

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging

  Required status check:
  - "🧪 Run Tests & Coverage"  ← ONLY THIS ONE NEEDED
```

### 3. Save Rule

**That's it!** Now:

- ❌ **Tests fail** = Merge button DISABLED
- ✅ **Tests pass** = Merge button ENABLED

## 🧪 What This Does

1. **When PR created**: Tests run automatically
2. **Tests running**: Merge button disabled (grayed out)
3. **Tests fail**: Merge button stays disabled
4. **Tests pass**: Merge button becomes green and clickable

## ⚡ Quick Setup (GitHub CLI)

```bash
gh api repos/abdur-rakib/file-sharing-app/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["🧪 Run Tests & Coverage"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null
```

**Simple = Better!** 🚀
