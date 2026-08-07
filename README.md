# 🌍 Book With AI - AI-Powered Trip Planner

An intelligent travel planning application powered by Google's Gemini AI, featuring voice conversation, real-time personalization, and comprehensive trip management.

![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Convex](https://img.shields.io/badge/Convex-Database-orange?style=for-the-badge)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-red?style=for-the-badge&logo=google)

## ✨ Features

### 🤖 AI-Powered Trip Planning
- **Conversational AI Interface**: Natural language trip planning with Google Gemini 2.5 Flash
- **Intelligent Recommendations**: Personalized hotel and activity suggestions
- **Context-Aware Planning**: AI remembers conversation history and user preferences

### 🎤 Voice Conversation System
- **Bidirectional Voice**: Speech recognition + Text-to-speech integration
- **Auto-Send Feature**: Automatic message submission at 60%+ confidence
- **Real-Time Feedback**: Visual confidence indicators and status updates
- **Hands-Free Planning**: Complete trips without typing

### 🎯 Personalization Engine
- **Learning Algorithm**: AI learns from your travel patterns and preferences
- **Travel Analytics**: Comprehensive statistics on destinations, budgets, and patterns
- **Smart Recommendations**: Destination, budget, hotel, and style suggestions
- **Pattern Recognition**: Seasonal preferences and group size analysis

### 🗺️ Trip Management
- **Interactive Itineraries**: Day-by-day activity planning with maps
- **Hotel Management**: Curated hotel recommendations with ratings and pricing
- **Place Details**: Integration with Google Places API and SerpAPI
- **Image Optimization**: All external image domains supported (wikimedia, tripadvisor, etc.)

### 🔔 Notification System
- **Price Alerts**: Get notified of price drops on destinations
- **Trip Reminders**: Important travel reminders and updates
- **Weather Alerts**: Real-time weather notifications
- **Deal Alerts**: Special offers and travel deals

### 🔐 Authentication & Security
- **Clerk Authentication**: Secure user authentication and management
- **Premium Access**: Special features for premium users
- **Arcjet Rate Limiting**: API protection with premium user bypass
- **Secure Data Storage**: Encrypted preferences and travel history

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Shadcn/ui** - Beautiful UI components
- **Magic UI** - Enhanced component library
- **Lucide Icons** - Modern icon system

### Backend & Database
- **Convex** - Real-time backend and database
- **Clerk** - User authentication
- **Arcjet** - Rate limiting and security

### AI & APIs
- **Google Gemini 2.5 Flash** - Conversational AI
- **Google Places API** - Location data
- **SerpAPI** - Fallback place information
- **Web Speech API** - Voice recognition and synthesis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Convex account
- Clerk account
- Google Gemini API key
- (Optional) Google Places API key
- (Optional) SerpAPI key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/georgeadriel07/Book-With-AI.git
cd Book-With-AI
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Optional APIs
GOOGLE_PLACE_API_KEY=your_google_places_api_key
SERPAPI_API_KEY=your_serpapi_key

# Arcjet (Rate Limiting)
ARCJET_KEY=your_arcjet_key
```

4. **Set up Convex**
```bash
npx convex dev
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Authentication pages
│   ├── _components/             # Home page components
│   ├── api/                     # API routes
│   ├── create-new-trip/         # Trip creation interface
│   ├── my-trips/                # Trip management
│   ├── personalization/         # AI personalization dashboard
│   ├── pricing/                 # Pricing page
│   └── view-trip/               # Trip details view
├── components/                   # Reusable UI components
│   ├── ui/                      # Shadcn components
│   └── magicui/                 # Magic UI components
├── convex/                       # Convex backend
│   ├── schema.ts                # Database schema
│   ├── tripDetail.ts            # Trip queries/mutations
│   ├── user.ts                  # User management
│   └── personalization.ts       # AI personalization logic
├── hooks/                        # Custom React hooks
│   ├── use-voice-conversation.tsx
│   └── use-personalization.tsx
├── context/                      # React context providers
├── utils/                        # Utility functions
│   ├── gemini.tsx               # Gemini AI integration
│   ├── arcjet.tsx               # Rate limiting
│   └── openai.tsx               # OpenAI integration
└── public/                       # Static assets
```

## 🎯 Key Features Explained

### Voice Conversation
The app includes a complete bidirectional voice system:
- Speech recognition for hands-free input
- Auto-send at 60%+ confidence for seamless experience
- Text-to-speech for AI responses
- Visual feedback with confidence indicators

### AI Personalization
Advanced learning system that:
- Analyzes your travel history
- Learns budget preferences
- Identifies destination patterns
- Provides seasonal recommendations
- Suggests optimal group sizes

### Trip Planning Flow
1. Start conversation with AI
2. Specify origin, destination, budget, duration, and group size
3. AI generates personalized itinerary
4. Review hotels and daily activities
5. Save trip to your account
6. View and manage all trips

## 🔧 Configuration

### Image Optimization
All external image domains are configured with wildcard patterns in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
    { protocol: 'http', hostname: '**' }
  ]
}
```

### Rate Limiting
Premium users bypass rate limits. Configure in `utils/arcjet.tsx`:
```typescript
const isPremiumUser = userEmail === 'contactsanket1@gmail.com'
```

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Setup
Ensure all API keys are configured in your deployment platform.

## 📝 Database Schema

### Main Tables
- **UserTable**: User profiles and preferences
- **TripDetailTable**: Trip information and itineraries
- **UserPreferences**: AI learning data
- **Notifications**: User notifications
- **SearchHistory**: Search patterns
- **PriceAlerts**: Price monitoring
- **TripReminders**: Travel reminders

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Rohan Desai**
- 📧 Email: rohandesai568@gmail.com
- 📱 Phone: +91 7020428986
- 💼 GitHub: [@georgeadriel07](https://github.com/georgeadriel07)

## 🙏 Acknowledgments

- Google Gemini AI for conversational intelligence
- Convex for real-time backend infrastructure
- Clerk for authentication services
- Shadcn/ui for beautiful components
- Next.js team for the amazing framework

## 📊 Project Stats

- **Framework**: Next.js 15.4.4
- **Language**: TypeScript
- **AI Model**: Google Gemini 2.5 Flash
- **Database**: Convex (Real-time)
- **Authentication**: Clerk
- **Styling**: TailwindCSS + Shadcn/ui

---

**Built with ❤️ by rohan**

*Making travel planning intelligent and effortless*
