# UrjaBandhu - Electricity Bill Optimization WebApp

An intelligent platform that helps users optimize their electricity consumption using AI-powered analytics, Non-Intrusive Load Monitoring (NILM), and personalized recommendations.

## 🚀 Features

- **Time Series Analysis**: Advanced consumption prediction using foundation models
- **Device Detection**: OCR-based automatic device identification and power estimation
- **NILM Technology**: Individual appliance load disaggregation
- **AI Chatbot**: Personalized optimization suggestions with multi-language support
- **Real-time Analytics**: Live consumption monitoring and statistics
- **Multi-language Support**: TTS/STT in Hindi, Bengali, Tamil, Telugu, and more

## 🏗️ Architecture

```
UrjaBandhu/
├── frontend/          # Next.js React application
├── backend/           # FastAPI Python backend
├── ml-models/         # ML models and training scripts
├── docs/              # Documentation and API specs
└── docker/            # Docker configuration files
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand
- **Charts**: Chart.js + D3.js
- **PWA**: Next-PWA

### Backend & Database
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL with Row Level Security
- **Real-time**: Supabase Real-time subscriptions
- **File Storage**: Supabase Storage (for device images)

### ML/AI & External Services
- **Time Series**: Prophet, LSTM, Transformers
- **NILM**: HMM, Neural Networks
- **OCR**: Tesseract, Google Vision API
- **NLP**: Transformers, OpenAI GPT
- **TTS/STT**: Azure Cognitive Services
- **Time Series Analytics**: InfluxDB (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase Account (free tier available)
- Docker (optional, for additional services)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/SrivarsanK/UrjaBandhu.git
cd urjabandhu
```

2. **Setup Supabase**

- Create a new project at [supabase.com](https://supabase.com)
- Copy your project URL and anon key
- Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

3. **Setup Frontend**

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

4. **Access the Application**

- Frontend: http://localhost:3000
- Supabase Dashboard: Your project dashboard

5. **Optional: Setup Additional Services**

```bash
# For advanced analytics with InfluxDB
docker-compose --profile analytics up -d

# For caching with Redis
docker-compose --profile cache up -d
```

## 📈 Development Roadmap

### Phase 1: Foundation ✅
- [x] Project structure setup
- [x] Basic UI mockups
- [x] Sample data integration

### Phase 2: Core Features ✅
- [x] OCR device detection
- [x] Time series data handling
- [x] Basic analytics

### Phase 3: Advanced Analytics ✅
- [x] NILM implementation
- [x] Time series foundation models
- [x] Advanced visualizations

### Phase 4: AI Integration ✅
- [x] AI chatbot
- [x] Personalized recommendations
- [x] Multi-language TTS/STT

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Time Series Foundation Models research community
- NILM algorithm developers
- Open source ML/AI libraries
- Indian language processing tools

---

**Note**: This project is under active development. Check the [Plan.md](Plan.md) for detailed development timeline and progress updates.
