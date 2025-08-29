#!/bin/bash
# UrjaBandhu Netlify Deployment Script

echo " UrjaBandhu Netlify Deployment Setup"
echo "======================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo " Git repository not found. Please initialize git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo " Frontend package.json not found. Are you in the right directory?"
    exit 1
fi

echo " Project structure verified"

# Test build locally
echo " Testing local build..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo " Build failed. Please fix errors before deploying."
    exit 1
fi
cd ..
echo " Build successful"

# Stage files for commit
echo " Staging files for commit..."
git add netlify.toml
git add frontend/.env.example
git add frontend/next.config.js
git add NETLIFY_DEPLOYMENT.md

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    # Commit changes
    echo " Committing deployment configuration..."
    git commit -m "Add Netlify deployment configuration

- Add netlify.toml with build settings
- Add environment variables example
- Update Next.js config for production
- Add comprehensive deployment guide"

    # Push to remote
    echo " Pushing to remote repository..."
    git push origin main
    if [ $? -eq 0 ]; then
        echo " Changes pushed successfully"
    else
        echo " Failed to push changes"
        exit 1
    fi
else
    echo "ℹ No changes to commit"
fi

echo ""
echo " Deployment setup complete!"
echo " Next steps:"
echo "   1. Go to https://app.netlify.com"
echo "   2. Click 'Add new site'  'Import an existing project'"
echo "   3. Select your Git provider and this repository"
echo "   4. Netlify will auto-detect the build settings"
echo "   5. Add environment variables (see .env.example)"
echo "   6. Deploy!"
echo ""
echo " For detailed instructions, see NETLIFY_DEPLOYMENT.md"
