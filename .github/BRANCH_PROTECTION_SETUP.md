# GitHub Branch Protection Rules Configuration

## 🛡️ Required Settings for Branch Protection

To ensure merges are blocked until all CI checks pass, configure these settings in your GitHub repository:

### 1. Go to Repository Settings

- Navigate to `Settings` → `Branches` → `Add rule`

### 2. Branch Protection Rule Configuration

```
Branch name pattern: master (or main)

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale PR approvals when new commits are pushed
  ✅ Require review from code owners (if you have CODEOWNERS file)

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging

  Required status checks (ADD ALL OF THESE):
  - 🔍 Code Quality & Security
  - 🧪 Test Suite (20)
  - 🧪 Test Suite (22)
  - 🧪 Test Suite (23)
  - 🐳 Docker Build & Test
  - 🔒 Security Audit
  - 🛡️ Branch Protection  ← MOST IMPORTANT

✅ Require conversation resolution before merging

✅ Restrict pushes that create files

✅ Do not allow bypassing the above settings
  ✅ Restrict pushes that create files that exceed GitHub file size limit
```

### 3. Critical Status Check Names

The following status check names MUST be added to branch protection:

- `🔍 Code Quality & Security`
- `🧪 Test Suite (20)`
- `🧪 Test Suite (22)`
- `🧪 Test Suite (23)`
- `🐳 Docker Build & Test`
- `🔒 Security Audit`
- `🛡️ Branch Protection` ← **This is the key one that blocks merges**

### 4. Repository Settings (Additional)

```
✅ General Settings:
  - Allow merge commits: ✅
  - Allow squash merging: ✅ (recommended)
  - Allow rebase merging: ✅
  - Automatically delete head branches: ✅

✅ Pull Request Settings:
  - Allow auto-merge: ✅ (only after checks pass)
  - Require linear history: ✅ (optional, recommended)
```

## 🚨 How It Works

### When All Checks Pass ✅

```
PR Status: ✅ All checks have passed
Button: [Merge pull request] ← Available
```

### When Any Check Fails ❌

```
PR Status: ❌ Some checks were not successful
Button: [Merge pull request] ← DISABLED/BLOCKED
Message: "Merging is blocked. The branch protection rule requires status checks to pass"
```

## 📋 Setup Checklist

- [ ] Navigate to GitHub Repository Settings
- [ ] Go to Branches → Add rule
- [ ] Set branch name pattern: `master` or `main`
- [ ] Enable "Require status checks to pass before merging"
- [ ] Add all 7 required status checks listed above
- [ ] Enable "Require branches to be up to date before merging"
- [ ] Save branch protection rule
- [ ] Test with a sample PR

## 🧪 Testing the Setup

1. Create a test branch with failing tests
2. Open a PR - should show blocked merge
3. Fix the tests
4. PR should become mergeable

## ⚡ Quick Setup Command (GitHub CLI)

If you have GitHub CLI installed:

```bash
# Set branch protection for master branch
gh api repos/:owner/:repo/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["🔍 Code Quality & Security","🧪 Test Suite (20)","🧪 Test Suite (22)","🧪 Test Suite (23)","🐳 Docker Build & Test","🔒 Security Audit","🛡️ Branch Protection"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```
