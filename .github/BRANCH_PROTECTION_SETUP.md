# GitHub Branch Protection Rules Configuration

## 🛡️ Required Settings for Branch Protection

To ensure merges are blocked until all CI checks pass, configure these settings in your GitHub repository:

### 1. Go to Repository Settings

- Navigate to `Settings` → `Branches` → `Add rule`

### 2. Branch Protection Rule Configuration

**CRITICAL SETTINGS FOR MERGE BUTTON BLOCKING:**

```
🎯 Branch name pattern: master

✅ Require a pull request before merging
  ✅ Require approvals: 1 (optional, can be 0)

🚫 MOST IMPORTANT - MERGE BUTTON CONTROL:
✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging

  🔒 Required status checks (COPY EXACT NAMES):
  Search and add each of these status check names:

  1. "🔍 Code Quality & Security"
  2. "🧪 Test Suite (20)"
  3. "🧪 Test Suite (22)"
  4. "🧪 Test Suite (23)"
  5. "🐳 Docker Build & Test"
  6. "🔒 Security Audit"
  7. "🛡️ Branch Protection"  ← THIS BLOCKS THE MERGE BUTTON

✅ Require conversation resolution before merging (optional)

❌ Do NOT check "Allow force pushes"
❌ Do NOT check "Allow deletions"
✅ Include administrators (recommended)
```

**RESULT:** Merge button will be DISABLED until ALL 7 status checks show ✅### 3. Critical Status Check Names

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

## 🚨 How The Merge Button Blocking Works

### When CI is Running 🔄

```
PR Status: 🔄 Some checks haven't completed yet
Button: [Merge pull request] ← DISABLED (grayed out)
Message: "Merging is blocked"
```

### When Any Check Fails ❌

```
PR Status: ❌ Some checks were not successful
Button: [Merge pull request] ← DISABLED (grayed out)
Message: "Merging is blocked. The branch protection rule requires status checks to pass"

GitHub will show:
❌ 🔍 Code Quality & Security — Failed
❌ 🧪 Test Suite (23) — Failed
❌ 🛡️ Branch Protection — Failed
```

### When All Checks Pass ✅

```
PR Status: ✅ All checks have passed
Button: [Merge pull request] ← ENABLED (green, clickable)

GitHub will show:
✅ 🔍 Code Quality & Security — Successful
✅ 🧪 Test Suite (20) — Successful
✅ 🧪 Test Suite (22) — Successful
✅ 🧪 Test Suite (23) — Successful
✅ 🐳 Docker Build & Test — Successful
✅ 🔒 Security Audit — Successful
✅ 🛡️ Branch Protection — Successful
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

## ⚡ Quick Setup Commands

### Option 1: GitHub CLI (Fastest)

```bash
# Navigate to your repo directory first
cd /Users/bs01080/Desktop/Practice/file-sharing-app

# Set branch protection for master branch
gh api repos/abdur-rakib/file-sharing-app/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["🔍 Code Quality & Security","🧪 Test Suite (20)","🧪 Test Suite (22)","🧪 Test Suite (23)","🐳 Docker Build & Test","🔒 Security Audit","🛡️ Branch Protection"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null
```

### Option 2: Manual Setup (Recommended for first time)

1. Go to: https://github.com/abdur-rakib/file-sharing-app/settings/branches
2. Click "Add rule"
3. Follow the configuration above
4. Save rule

### Option 3: Test Current Setup

```bash
# Check if branch protection is working
gh api repos/abdur-rakib/file-sharing-app/branches/master/protection
```
