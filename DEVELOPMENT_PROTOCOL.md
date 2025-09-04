# Development Protocol

## 🎯 **Purpose**

This document provides a standardized protocol for developing, testing, deploying, and maintaining the **Waste Management Simulator for Isla Holbox**. Its goal is to ensure consistency, safety, and clear communication across all development cycles.

-----

## 📋 **Pre-Development Checklist**

### 1\. **Analysis & Discovery Phase**

  - [ ] **Understand the Goal:** Clearly define the "why" behind the change.
  - [ ] **Code & System Review:** Study existing code, architecture, and dependencies.
  - [ ] **Impact Assessment:** Identify all potentially affected files, components, and services.
  - [ ] **Data Schema Review:** Examine database models, relationships, and potential data integrity issues.
  - [ ] **Define Scope:** Document the current state vs. the desired state to prevent scope creep.

### 2\. **Planning Phase**

  - [ ] **Task Breakdown:** Create a ticket or a `TODO` list, breaking down complex tasks into small, manageable steps.
  - [ ] **Identify Risks:** Note potential breaking changes, performance bottlenecks, or security vulnerabilities.
  - [ ] **Define Success:** How will you know the change is working correctly? (e.g., "Users can now reset their password via email.")
  - [ ] **Plan Rollback:** Briefly outline a strategy to revert the changes if the deployment fails.

-----

## 🛠️ **Development to Deployment Workflow**

### **Step 1: Initial Project Setup (One-Time)**

First, set up your local workspace. You only need to do this once per machine for the project.

1. **Clone the Repository**

    ```bash
    git clone [YOUR_GIT_REPOSITORY_URL]
    cd waste-simulator
    ```

2. **Install Node.js Dependencies** 📦
    Install all required npm packages for the React/TypeScript application.

    ```bash
    # Install all dependencies from package.json
    npm install
    ```

3. **Verify Development Setup**
    Test that the development environment is working correctly.

    ```bash
    # Start the development server
    npm run dev
    ```

    The application should start at `http://localhost:5173` (Vite's default port).

4. **Configure `.gitignore`**
    Ensure Node.js dependencies and build artifacts are ignored by Git. Your `.gitignore` should contain:

    ```
    # Node.js dependencies
    node_modules/
    
    # Build outputs
    dist/
    
    # Environment files
    .env
    .env.local
    .env.*.local
    
    # OS files
    .DS_Store
    Thumbs.db
    ```

### **Step 2: Feature Development (Recurring)**

Follow these steps for every new feature, bugfix, or change.

1. **Sync and Create a Feature Branch** 🌿

    Feature branches isolate your work from the stable `main` branch, allowing for safer development and easier collaboration.

    ```bash
    # Make sure your main branch is up-to-date
    git checkout main
    git pull origin main

    # Create a new branch for your task (use descriptive names)
    git checkout -b feature/analytics-dashboard
    # or
    git checkout -b bugfix/simulation-calculation-error
    # or  
    git checkout -b enhancement/mobile-responsive-tables
    ```

    **Branch Naming Conventions:**
    - `feature/description` - New functionality
    - `bugfix/description` - Bug fixes
    - `enhancement/description` - Improvements to existing features
    - `docs/description` - Documentation updates
    - `refactor/description` - Code restructuring without new features

2. **Code and Test Locally**

    - Make all your code changes and test them thoroughly in your local development environment.
    - If you add a new npm package, install it and it will automatically be added to `package.json`:
        ```bash
        # Add a new dependency
        npm install new-package
        
        # Or add a development dependency
        npm install --save-dev new-dev-package
        ```
    - Run the linter to ensure code quality:
        ```bash
        npm run lint
        ```
    - Test the production build to catch any build issues early:
        ```bash
        npm run build
        npm run preview
        ```

3. **Commit, Push, and Create Pull Request** 🔄

    - Make multiple commits as you work (it's ok to commit incomplete work on feature branches):
        ```bash
        # Stage and commit your changes using Conventional Commits standard
        git add .
        git commit -m "feat: Add scenario comparison dashboard component"
        
        # Continue working...
        git add .
        git commit -m "feat: Add data visualization to comparison dashboard"
        
        # Fix something...
        git add .
        git commit -m "fix: Correct calculation error in comparison logic"
        ```
        
    - Push your feature branch to GitHub:
        ```bash
        # First push - creates the remote branch
        git push origin feature/scenario-comparison
        
        # Subsequent pushes (shorter syntax)
        git push
        ```
        
    - **Create Pull Request on GitHub:**
        1. Go to your GitHub repository
        2. Click "Compare & pull request" (appears after pushing new branch)
        3. Fill out PR description explaining what you built and why
        4. Request reviewers if working with a team
        5. **Vercel will automatically create a preview deployment** for testing
        
    - **Benefits of Pull Requests:**
        - ✅ Code review before merging to main
        - ✅ Preview deployment to test your changes live  
        - ✅ Automatic tests run on your code
        - ✅ Discussion and collaboration on the changes
        - ✅ History of what was changed and why

### **Step 2b: After Merging - Branch Cleanup** 🧹

Once your PR is merged, clean up your local environment:

```bash
# Switch back to main branch
git checkout main

# Pull the latest changes (includes your merged feature)
git pull origin main

# Delete your local feature branch (it's now merged)
git branch -d feature/scenario-comparison

# Delete the remote branch (optional - GitHub can do this automatically)
git push origin --delete feature/scenario-comparison
```

**Why clean up branches?**
- Keeps your local repository organized
- Prevents confusion about which branches are active
- Reduces clutter in branch lists

### **Step 3: Deployment**

Once the PR is approved and merged into `main`, deploy the changes. This project is designed for static site hosting.

#### **Option A: Automated Deployment (Recommended)**

Set up GitHub Actions or similar CI/CD for automatic deployment:

```bash
# Typical CI/CD workflow will:
# 1. npm install
# 2. npm run build  
# 3. Deploy dist/ folder to hosting provider (Netlify, Vercel, GitHub Pages, etc.)
```

#### **Option B: Manual Deployment**

For manual deployment to your hosting provider:

```bash
# 1. Ensure you're on the latest main branch locally
git checkout main
git pull origin main

# 2. Install dependencies and build
npm install
npm run build

# 3. Deploy the dist/ folder to your hosting provider
# (Commands vary by provider - Netlify, Vercel, AWS S3, etc.)
```

### **Step 4: Post-Deployment Verification**

Verify that the deployment was successful and the application is working correctly.

```bash
# Check that the application loads correctly
curl -I [YOUR_APP_URL]

# Test key functionality:
# - Application loads without console errors
# - Simulation calculations work correctly
# - Scenario saving/loading functions properly
# - Different tabs and visualizations display correctly
```

-----

## 🗄️ **Database Changes Protocol**

This project uses a client-side SQLite database (via SQL.js) with localStorage persistence. Database changes are handled differently than traditional server databases:

- **Client-Side Database**: The SQLite database runs in the user's browser and is stored in localStorage.
- **Schema Changes**: Database schema is defined in `src/lib/database.ts` in the `createTables()` method.
- **Data Persistence**: Data is automatically saved to localStorage and can be exported/imported by users.

**Process for Schema Changes:**
1. Update the schema in `src/lib/database.ts` → `createTables()` method
2. Consider backwards compatibility - new installations will get the new schema, but existing users may need migration logic
3. Test schema changes thoroughly in different browsers and with existing/new data
4. If breaking changes are needed, increment the database version and add migration logic

**Process for Default Data Changes:**
1. Update initial state in `src/constants/initialState.js`
2. Test that new users get the updated defaults
3. Consider whether existing users should get updates (usually they should keep their customizations)

-----

## 🚨 **Emergency & Rollback Procedures**

### **Option A: Safe Rollback (Recommended)**

Use `git revert` to create a new commit that undoes the changes from a previous commit. This is safe because it doesn't rewrite repository history.

```bash
# On your local machine

# 1. Find the hash of the commit you want to revert
git log -n 5

# 2. Revert the commit. This creates a new commit that undoes the changes.
git revert [commit_hash_to_revert]

# 3. Push the new revert commit to the main branch
git push origin main

# 4. Redeploy on the server following the standard deployment process
```

### **Option B: Hard Reset (Destructive - Use with Extreme Caution)**

Use `git reset --hard` only in true emergencies where you must erase commits from the branch history. 🚨 **DANGER:** This rewrites history and requires a force push, which can cause problems for other developers.

```bash
# On your local machine
git reset --hard [last_known_good_commit_hash]
git push --force origin main # <-- DANGEROUS

# Then, pull the forced changes on the server and restart.
```

### **Service Recovery**

If the deployed application is having issues:

```bash
# 1. Check if it's a deployment issue - redeploy the last known good version
git checkout [last_known_good_commit_hash]
npm install
npm run build
# Deploy dist/ folder to hosting provider

# 2. Check hosting provider status and logs
# (Process varies by provider - check Netlify/Vercel/etc. dashboard)

# 3. If the issue is client-side database corruption, users can:
# - Clear localStorage in browser developer tools
# - Use the app's export/import feature to backup/restore their scenarios
```

-----

## 🎯 **Best Practices**

- **Code Quality:** Use ESLint for code linting, TypeScript for type safety, and write clean, self-documenting code.
- **Performance:** Use React's `useMemo` and `useCallback` for expensive calculations. The simulation engine already uses `useMemo` for the complex waste flow calculations.
- **State Management:** Keep state as close to components as possible. Use custom hooks (like `useWasteSimulation`) to encapsulate complex logic.
- **Data Handling:** The client-side SQLite database automatically handles data persistence. Users can export/import their scenarios for backup.
- **Security:** Never commit API keys or sensitive data. Keep Supabase credentials in environment variables if using cloud features.
- **Testing:** Test simulation calculations thoroughly when making changes. Verify that KPI calculations remain consistent across seasons.
- **Browser Compatibility:** Test in different browsers since the app uses localStorage and SQL.js.
- **Git Workflow:** Always use feature branches for development. Keep main branch stable and deployable at all times.

## 🌿 **Advanced Git Workflows**

### **Common Scenarios**

**Starting a new feature:**
```bash
git checkout main && git pull origin main
git checkout -b feature/new-awesome-feature
```

**Keeping your feature branch up to date with main:**
```bash
# While on your feature branch
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main  # or: git rebase main (advanced)
```

**Making changes to a PR after feedback:**
```bash
# Make your changes, then commit and push
git add .
git commit -m "address: Fix issue mentioned in PR review"
git push  # Updates the existing PR automatically
```

**Emergency hotfix:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix
# Fix the bug, test, commit
git push origin hotfix/critical-bug-fix
# Create PR, get quick review, merge immediately
```

-----

## 📝 **Change Log Template**

Document significant changes in a `CHANGELOG.md` file or in your PR descriptions.

```markdown
## Change: [Brief Description of Feature/Fix]
**Date:** [YYYY-MM-DD]
**Author:** [Your Name]
**Ticket/Issue:** #[Ticket-Number]

### Description
A brief summary of what changed and why.

### Files Modified
- `src/components/features/KPIDashboard.tsx`
- `src/hooks/useWasteSimulation.tsx`
- `src/constants/initialState.js`

### Deployment Notes
- Run `npm run build` to ensure the new changes compile correctly
- Test simulation calculations with different input scenarios
- Verify that existing user scenarios still load correctly after changes
