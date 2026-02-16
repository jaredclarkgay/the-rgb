# Safe GitHub Push Checklist ✅

## Before You Push - Verify Your API Key is Protected

### Step 1: Initialize Git
```bash
git init
git add .
```

### Step 2: VERIFY .env is NOT staged
```bash
git status
```

**You should see**:
```
Changes to be committed:
  new file:   .env.example          ✅ (safe - no real key)
  new file:   .gitignore            ✅ (protects .env)
  new file:   src/App.jsx           ✅ (no secrets)
  ...

Untracked files:
  .env                              ✅ (IGNORED - contains your key!)
```

**You should NOT see**:
```
  new file:   .env                  ❌ DANGER!
```

### Step 3: Double-Check with git ls-files
```bash
# This shows ONLY files that will be committed
git ls-files | grep env
```

**Safe output**:
```
.env.example                        ✅ Only the example, not the real key
```

**Dangerous output**:
```
.env                                ❌ STOP! Don't push!
```

### Step 4: Search for Accidental Hardcoded Keys
```bash
# Search all staged files for "sk-ant-"
git diff --cached | grep "sk-ant-"
```

**Safe output**: (nothing)

**Dangerous output**:
```
+VITE_ANTHROPIC_API_KEY=sk-ant-api03-...  ❌ ABORT!
```

### Step 5: Commit Safely
```bash
git commit -m "Initial commit: RGB modular 3D environment"
```

### Step 6: Create GitHub Repo & Push
```bash
# On GitHub: Create new repo (don't initialize with README)
git remote add origin https://github.com/YOUR-USERNAME/the-rgb.git
git branch -M main
git push -u origin main
```

### Step 7: Verify on GitHub
- Go to your repo on GitHub
- Check that `.env` is NOT visible
- Check that `.env.example` IS visible (with placeholder text)

---

## If You Accidentally Commit Your Key ⚠️

**DON'T PANIC** - but act quickly:

1. **Regenerate your API key immediately**:
   - Go to https://console.anthropic.com/
   - Delete the exposed key
   - Create a new one
   - Update your local `.env`

2. **Remove from Git history**:
   ```bash
   # If you haven't pushed yet
   git reset HEAD~1
   git add .
   git commit -m "Initial commit: RGB modular 3D environment"

   # If you already pushed (more complex)
   # You'll need to force-push, which rewrites history
   ```

3. **For pushed commits with secrets**, see:
   https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

## Best Practices

✅ **DO**:
- Always check `git status` before committing
- Use `.env.example` with placeholder values
- Keep `.env` in `.gitignore`
- Verify on GitHub after first push

❌ **DON'T**:
- Hardcode API keys in source files
- Commit `.env` files
- Skip the verification steps above
- Assume .gitignore works without testing

---

## Alternative: Use GitHub Secrets (for deployment)

If you deploy this app, use GitHub Actions secrets instead:
1. Repo Settings → Secrets → New repository secret
2. Name: `VITE_ANTHROPIC_API_KEY`
3. Value: Your key
4. Reference in workflows as `${{ secrets.VITE_ANTHROPIC_API_KEY }}`

This keeps keys out of your code entirely!
