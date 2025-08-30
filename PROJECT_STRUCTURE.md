# UrjaBandhu Project Structure

This document outlines the organized folder structure of the UrjaBandhu project.

## 📁 Root Directory Structure

```
UrjaBandhu/
├── 📂 frontend/              # Next.js frontend application
├── 📂 backend/               # Backend API services
├── 📂 ml-models/             # Machine learning models and data
├── 📂 supabase/              # Supabase configuration and functions
├── 📂 docs/                  # All documentation files
├── 📂 scripts/               # Automation and deployment scripts
├── 📂 sql/                   # Database schemas and migrations
├── 📂 config/                # Configuration files
├── 📂 .vscode/               # VS Code settings
├── 📂 .next/                 # Next.js build artifacts (auto-generated)
├── 📂 node_modules/          # Dependencies (auto-generated)
├── 📂 .git/                  # Git repository data
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # Main project README
```

## 📂 Detailed Folder Structure

### 🎨 Frontend (`/frontend/`)
- Next.js 15.5.2 application
- React components, pages, and API routes
- Tailwind CSS styling
- TypeScript configuration

### ⚙️ Backend (`/backend/`)
- API services and business logic
- Authentication and data processing
- Integration with external services

### 🤖 ML Models (`/ml-models/`)
- Machine learning models for energy prediction
- Training data and preprocessing scripts
- Model artifacts and configurations

### 🗄️ Supabase (`/supabase/`)
- Database functions and triggers
- Edge functions
- Migration files
- Supabase configuration

### 📚 Documentation (`/docs/`)

#### Database Documentation (`/docs/database/`)
- `DATABASE_SETUP.md` - Main database setup guide
- `FRONTEND_DATABASE_SETUP.md` - Frontend-specific database configuration
- `HOW_TO_ADD_DATABASES_SUPABASE.md` - Supabase database management
- `QUICK_START_SUPABASE_TABLES.md` - Quick reference for tables
- `ALL_TABLES_TO_ADD.md` - Complete table specifications

#### Deployment Documentation (`/docs/deployment/`)
- `NETLIFY_DEPLOYMENT.md` - Netlify deployment guide

#### Setup Documentation (`/docs/setup/`)
- `OAUTH_SETUP_GUIDE.md` - OAuth configuration guide
- `PHASE_2_COMPLETE.md` - Phase 2 completion status
- `PHASE_4_COMPLETE.md` - Phase 4 completion status
- `PROFILE_FIX_SUMMARY.md` - Profile system fixes
- `SETUP_COMPLETE.md` - Overall setup completion guide

#### Feature Documentation (`/docs/features/`)
- `CONSUMER_SETUP_IMPLEMENTATION.md` - Consumer onboarding system
- `OCR_DEBUG_REPORT.md` - OCR debugging information
- `OCR_FIX_GUIDE.md` - OCR troubleshooting guide
- `OCR_IMPLEMENTATION_SUMMARY.md` - OCR implementation overview
- `OCR_QUICK_FIX.md` - Quick OCR fixes
- `OCR_SETUP.md` - OCR setup instructions
- `TESSERACT_OCR_IMPLEMENTATION.md` - Tesseract OCR details

#### Other Documentation (`/docs/`)
- `Plan.md` - Project planning and roadmap

### 🔧 Scripts (`/scripts/`)

#### Database Scripts (`/scripts/database/`)
- Database management and utility scripts

#### Deployment Scripts (`/scripts/deployment/`)
- `deploy-to-netlify.ps1` - PowerShell deployment script
- `deploy-to-netlify.sh` - Bash deployment script

#### Setup Scripts (`/scripts/setup/`)
- `setup.ps1` - PowerShell setup script
- `setup.sh` - Bash setup script
- `influxdb-manager.ps1` - InfluxDB management (PowerShell)
- `influxdb-manager.sh` - InfluxDB management (Bash)

### 🗃️ SQL (`/sql/`)

#### Table Definitions (`/sql/tables/`)
- `ADDITIONAL_TABLES.sql` - Additional table schemas
- `MANUAL_DATABASE_SETUP.sql` - Manual database setup
- `phase2_tables.sql` - Phase 2 table definitions
- `phase3b_automation_tables.sql` - Phase 3B automation tables
- `PHASE_2_TABLES.sql` - Phase 2 table specifications
- `SETUP_DATABASE_TABLES.sql` - Initial database tables
- `test_device_catalog.sql` - Device catalog test data

#### Migrations (`/sql/migrations/`)
- `FIX_PROFILES_TABLE.sql` - Profile table fixes
- `setup-storage.sql` - Storage setup migration
- `VERIFY_DATABASE_COMPLETE.sql` - Database verification
- `VERIFY_DATABASE_SETUP.sql` - Setup verification

### ⚙️ Configuration (`/config/`)
- `docker-compose.yml` - Docker container configuration
- `netlify.toml` - Netlify deployment configuration

## 🚀 Getting Started

1. **Frontend Development**: Navigate to `/frontend/` and run `npm run dev`
2. **Backend Services**: Navigate to `/backend/` for API services
3. **Database Setup**: Check `/docs/database/` for setup instructions
4. **Deployment**: Use scripts in `/scripts/deployment/` for deployment

## 📝 Documentation Guidelines

- All new features should have documentation in `/docs/features/`
- Database changes should be documented in `/docs/database/`
- Setup procedures should be documented in `/docs/setup/`
- SQL changes should be versioned in `/sql/migrations/`

## 🔄 Development Workflow

1. **Feature Development**: Work in respective folders (`frontend/`, `backend/`, etc.)
2. **Documentation**: Update relevant docs in `/docs/`
3. **Database Changes**: Add migrations to `/sql/migrations/`
4. **Deployment**: Use deployment scripts in `/scripts/deployment/`

## 📞 Support

For questions about the project structure or organization, refer to the specific documentation in the `/docs/` folder or contact the development team.
