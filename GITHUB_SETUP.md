# 📤 GitHub Setup & Deployment Guide

This guide will walk you through setting up your repository on GitHub and pushing your TrustChain voting project.

## 🎯 Prerequisites

- Git installed on your system
- GitHub account created
- Project initialized with `git init` (already done)

## 📋 Step-by-Step Guide

### Step 1: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `trustchain-voting` (or your preferred name)
   - **Description**: "A decentralized e-voting application built on Ethereum blockchain"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 2: Configure Git (First Time Only)

If you haven't configured Git before, set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Initialize and Add Files

From your project directory (`/home/shimura/Desktop/voting-project2`):

```bash
# Check git status
git status

# Add all files to staging
git add .

# Commit the files
git commit -m "Initial commit: TrustChain decentralized voting application"
```

### Step 4: Connect to GitHub Repository

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/trustchain-voting.git

# Verify remote was added
git remote -v
```

### Step 5: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

If prompted, enter your GitHub credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your password)

### Step 6: Create Personal Access Token (if needed)

If you don't have a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name (e.g., "TrustChain Project")
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

### Step 7: Verify Upload

1. Go to your GitHub repository URL
2. Refresh the page
3. You should see all your files uploaded

## 🔄 Making Future Changes

After making changes to your code:

```bash
# Check what changed
git status

# Add specific files
git add path/to/file

# Or add all changes
git add .

# Commit with a descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push
```

## 📝 Common Git Commands

```bash
# View commit history
git log --oneline

# View current status
git status

# View differences
git diff

# Create a new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature

# Pull latest changes
git pull origin main

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## 🌿 Recommended Branch Strategy

For collaborative development:

```bash
# Main branch (production-ready code)
main

# Development branch
git checkout -b develop

# Feature branches
git checkout -b feature/add-candidate-images
git checkout -b feature/improve-ui

# Bug fix branches
git checkout -b bugfix/metamask-connection

# When feature is complete
git checkout develop
git merge feature/add-candidate-images
git push origin develop

# When ready for release
git checkout main
git merge develop
git push origin main
```

## 🏷️ Creating Releases

To create a release version:

1. Go to your GitHub repository
2. Click **"Releases"** → **"Create a new release"**
3. Click **"Choose a tag"** → Type `v1.0.0` → **"Create new tag"**
4. **Release title**: "TrustChain v1.0.0 - Initial Release"
5. **Description**: Add release notes
6. Click **"Publish release"**

## 🔒 Security Best Practices

### Files to NEVER Commit

The `.gitignore` file already excludes these, but be extra careful:

- ✅ `.env` files (contains private keys and API keys)
- ✅ `node_modules/` (too large, can be reinstalled)
- ✅ Private keys or mnemonics
- ✅ API keys or secrets
- ✅ Build artifacts (`dist/`, `build/`)

### If You Accidentally Committed Secrets

```bash
# Remove file from Git but keep locally
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from tracking"

# Push changes
git push

# Then, change all exposed secrets immediately!
```

For sensitive data already pushed, consider using:
- [BFG Repo-Cleaner](https://reps-cleaner.github.io/)
- `git filter-branch` (advanced)

## 📊 Adding Badges to README

Add these badges to the top of your README.md:

```markdown
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)
![Hardhat](https://img.shields.io/badge/Hardhat-2.27.1-yellow)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![License](https://img.shields.io/badge/License-ISC-green)
```

## 🤝 Collaborating with Others

### Adding Collaborators

1. Go to repository → Settings → Collaborators
2. Click **"Add people"**
3. Enter their GitHub username
4. They'll receive an invitation email

### Working with Pull Requests

```bash
# Fork the repository (on GitHub)
# Clone your fork
git clone https://github.com/YOUR_USERNAME/trustchain-voting.git

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to your fork
git push origin feature/my-feature

# Create Pull Request on GitHub
```

## 🚀 Continuous Integration (Optional)

Consider setting up GitHub Actions for automated testing:

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx hardhat compile
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
```

## 📞 Getting Help

- **Git Documentation**: https://git-scm.com/doc
- **Hub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

## ✅ Checklist Before Pushing

- [ ] All sensitive data removed (.env files, private keys)
- [ ] `.gitignore` properly configured
- [ ] README.md updated with project information
- [ ] Code is tested and working
- [ ] Commit messages are descriptive
- [ ] No `node_modules/` or build artifacts included
- [ ] License file added (if needed)

---

**Happy Coding! 🎉**Git
