# UrjaBandhu - Netlify Deployment Guide

##  Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Git Repository**: Ensure your code is pushed to GitHub/GitLab/Bitbucket
3. **Supabase Project**: Have your Supabase credentials ready

##  Deployment Steps

### Step 1: Prepare Your Repository

Your repository now includes:
- `netlify.toml` - Netlify configuration file
- `frontend/.env.example` - Environment variables template
- Updated `frontend/next.config.js` - Production-ready Next.js config

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Add Netlify deployment configuration"
git push origin main
```

### Step 3: Connect to Netlify

1. **Log in to Netlify**: Go to [app.netlify.com](https://app.netlify.com)
2. **Import Project**: 
   - Click "Add new site"  "Import an existing project"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select the UrjaBandhu repository
3. **Configure Build Settings** (should auto-detect from netlify.toml):
   - Build command: `cd frontend && npm ci && npm run build`
   - Publish directory: `frontend/.next`
   - Node version: 18

### Step 4: Set Environment Variables

In Netlify Dashboard  Site Settings  Environment Variables, add:

```env
# Required Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration  
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app

# Optional: API Configuration
NEXT_PUBLIC_API_URL=https://your-site-name.netlify.app/api
```

### Step 5: Deploy

1. Click "Deploy site" - Netlify will automatically build and deploy
2. Your site will be available at `https://[random-name].netlify.app`
3. You can customize the domain in Site Settings  Domain Management

##  Post-Deployment Configuration

### Custom Domain (Optional)
1. Go to Domain Management in Netlify
2. Add your custom domain
3. Configure DNS settings as instructed

### Environment Variables Location
- In Netlify Dashboard: Site Settings  Environment Variables
- Add all variables from `.env.example`

### Monitoring & Analytics
- Netlify automatically provides build logs and deployment status
- Monitor performance in the Netlify Dashboard

##  Local Development vs Production

The configuration automatically handles:
- **Development**: API rewrites to `localhost:8000`
- **Production**: Direct API calls to deployed functions

##  Features Enabled on Netlify

 **Next.js App Router**: Full support  
 **Server-Side Rendering (SSR)**: Automatic  
 **Static Site Generation (SSG)**: Optimized  
 **Image Optimization**: Via Netlify Image CDN  
 **API Routes**: Deployed as Netlify Functions  
 **Middleware**: Deployed as Edge Functions  
 **Incremental Static Regeneration (ISR)**: Supported  

##  Troubleshooting

### Build Failures
- Check build logs in Netlify Dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Runtime Errors
- Check function logs in Netlify Dashboard
- Verify Supabase connection settings
- Ensure all API endpoints are configured

### Performance Issues
- Enable Netlify Analytics for insights
- Use Netlify Image CDN for optimized images
- Monitor Core Web Vitals in dashboard

##  Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js on Netlify**: [docs.netlify.com/frameworks/nextjs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
- **Netlify Support**: Available in dashboard for paid plans

##  Continuous Deployment

Every push to your main branch will automatically trigger a new deployment. 
Branch deploys are available for testing features before merging.

---

**Next Steps**: 
1. Push these changes to your repository
2. Connect to Netlify 
3. Configure environment variables
4. Deploy! 
