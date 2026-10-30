# GitHub Deployment Guide for Personal Daily Expense Tracker

## Step 1: Create a GitHub Account (if you don't have one)
Go to https://github.com/signup and create an account

## Step 2: Create a New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: **daily-expense-tracker**
3. Description: "Personal Daily Expense Tracker - Track expenses, income, and budget with charts"
4. Choose: **Public** (so it's accessible to everyone)
5. DO NOT check "Initialize this repository with a README" (we already have one)
6. Click "Create repository"

## Step 3: Add Remote Repository (Copy-paste these commands in PowerShell)

`
cd c:\Users\Rajib\OneDrive\Desktop\daily-expense-tracker

# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/daily-expense-tracker.git
git branch -M main
git push -u origin main
`

## Step 4: Authentication
When you run git push, you'll be asked to authenticate. Choose one:

**Option A: Personal Access Token (Recommended)**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Select scopes: repo (all), workflow
4. Copy the token
5. When prompted by git, paste the token as password

**Option B: GitHub CLI**
Run: gh auth login

## Step 5: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click Settings → Pages
3. Under "Branch", select "main"
4. Click Save
5. Your site will be live at: https://YOUR_USERNAME.github.io/daily-expense-tracker/

## Your Application Will Be Live!
After 1-2 minutes, visit: https://YOUR_USERNAME.github.io/daily-expense-tracker/

---

## QUICK DEPLOYMENT COMMANDS

Replace YOUR_USERNAME with your GitHub username:

\\\powershell
cd c:\Users\Rajib\OneDrive\Desktop\daily-expense-tracker

# Set remote
git remote add origin https://github.com/YOUR_USERNAME/daily-expense-tracker.git
git branch -M main
git push -u origin main
\\\

That's it! Your app is now live on GitHub Pages!
