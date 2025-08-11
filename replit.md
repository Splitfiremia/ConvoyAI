# Convoy AI - AI Receptionist Dashboard

## Overview

Convoy AI is a comprehensive AI-powered receptionist and CRM communication platform that automates customer interactions, manages call queues, and provides intelligent routing capabilities. The system combines real-time call handling with AI conversation processing, team management, and analytics dashboards. Built as a full-stack web application, it provides both automated AI responses and seamless human agent handoff when needed.

## Key Features Implemented

### AI Receptionist
- Automatically routes unanswered calls to AI instead of voicemail
- Seamlessly works with any iOS or Android phone
- Books appointments automatically
- Answers business questions intelligently
- Transfers calls to human agents when needed
- Sends call transcripts and recordings directly to your phone

### Seamless Handoff Capability
- Effortless transition from AI to human touch with live call transfer
- Maintains conversation flow during handoff
- Round robin queues for immediate redirection to available team members
- Maintains engagement at scale

### High-Volume Calling
- Ability to make & receive up to 1800 calls in 60 seconds
- Speaks to every person simultaneously
- Scalable call processing infrastructure

### Intelligent Real-Time Interaction
- AI excels in intelligent engagement
- Dynamically assesses and participates in conversations
- Understanding that mirrors human insight
- Real-time sentiment analysis and conversation routing

### SaaS Marketing Platform
- **Professional Landing Page**: Hero section, feature highlights, and compelling CTAs
- **Tiered Pricing Plans**: Starter ($99), Professional ($299), Enterprise ($799) with clear feature differentiation
- **14-Day Free Trial**: No credit card required trial system with automatic tracking
- **Integrated Signup Flow**: Seamless transition from marketing to trial activation
- **Trial Management**: In-dashboard trial status tracking with upgrade prompts

### Independent AI Services (Architecturally Isolated)
- **Email AI Service** (`/services/email`): Gmail API + SendGrid integration with dedicated email_responses database
- **Mobile AI Service** (`/services/mobile`): Twilio SMS + Firebase Cloud Messaging with dedicated mobile_comms database
- **Zero Dependencies**: Services operate independently with no shared components or cross-service API calls
- **Separate Data Stores**: Each service maintains its own isolated storage and billing meters
- **Parallel Execution**: Services run in completely separate containers with discrete request pipelines

### LinkedIn-Inspired Onboarding Architecture
- **4-Stage Progressive Flow**: Frictionless Signup → Goal-Based Segmentation → Service-Specific Quick Wins → Cross-Service Activation
- **Personalized Paths**: Adapts onboarding based on primary service selection (Voice AI, Email AI, Mobile AI)
- **Gamification Elements**: Achievement badges, progress tracking, and completion rewards
- **Quick Wins Strategy**: Interactive checklists with 2-4 minute tasks for immediate value demonstration
- **Social Proof Integration**: Customer testimonials and usage statistics to drive engagement
- **Onboarding Guards**: Automatic redirection system ensuring users complete setup before accessing main dashboard

## User Preferences

Preferred communication style: Simple, everyday language.
Selected logo design: Network Nodes (Option 5) - Connected network nodes representing AI communication in blue color scheme.
Logo design selection completed - Logo Design Options page removed as no longer needed.

## Recent Changes

**Latest Update (August 11, 2025):**
- ✓ **Terms and Conditions Acceptance System**: Implemented comprehensive terms acceptance flow
  - Created `/terms` page with complete terms content from provided legal document
  - Added scroll-to-bottom requirement before Accept button activation
  - Added prominent "Scroll To Bottom" button with smooth scrolling functionality
  - Updated all landing page CTAs to redirect to terms before signup
  - Added terms acceptance validation guard in signup page
  - Integrated Accept/Decline functionality with proper routing
- ✓ **White Label Navigation**: Added "Return to Dashboard" button to White Label Management page header
- ✓ **Login Page Branding Updates**: 
  - Aligned Convoy AI logo above "1800+ Calls" text in feature grid
  - Replaced all instances of "receptionist" with "Support" for consistent branding

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, modern interface design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for consistent theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live call queue updates and system notifications

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Real-time Communication**: WebSocket server for broadcasting live updates to connected clients
- **API Design**: RESTful endpoints for CRUD operations with JSON request/response format
- **Middleware**: Custom logging, error handling, and request processing middleware

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database interactions and schema management
- **Database**: PostgreSQL with Neon serverless hosting for scalable data persistence
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **In-Memory Storage**: Fallback memory storage implementation for development and testing

### Authentication and Authorization
- **Firebase Authentication**: Multi-provider OAuth integration with Google and Apple Sign-In support
- **Google OAuth**: Secure Google account authentication with popup and redirect fallback
- **Apple OAuth**: Apple ID authentication for iOS/macOS users with seamless integration
- **Session Management**: Firebase Auth state persistence with automatic token refresh
- **Protected Routes**: Route-level authentication guards protecting dashboard and admin features
- **User Profiles**: Dynamic user profile display with authenticated account integration (photo, name, email)
- **Dual Sign-out Options**: Convenient logout buttons in both sidebar profile and top navigation
- **Test Mode Support**: Demo accounts for development and testing without external dependencies
- **API Security**: Request validation using Zod schemas for type-safe data processing

## External Dependencies

### Authentication and User Management
- **Firebase Authentication**: Google OAuth provider for secure user sign-in and account management
- **Firebase SDK**: Client-side authentication state management and redirect handling
- **Authentication Guards**: Route-level protection ensuring secure access to dashboard features

### AI and Communication Services
- **OpenAI API**: GPT-4o integration for intelligent conversation handling, sentiment analysis, and call transcription
- **Telephony Service**: Mock telephony service (designed for Twilio Voice API integration) for call management and routing
- **Voice Processing**: AI-powered call transcription and real-time conversation analysis
- **High-Volume Call Processing**: Simulated capability for handling up to 1800 simultaneous calls
- **Intelligent Call Routing**: AI-powered decision making for call distribution and escalation

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **WebSocket Server**: Built-in WebSocket implementation for real-time client updates

### Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement and optimized production builds
- **PostCSS**: CSS processing with Tailwind CSS and autoprefixer plugins
- **ESBuild**: Backend bundling for production deployments
- **TypeScript**: Type checking and compilation across the entire stack

### UI and Styling Libraries
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management
- **React Hook Form**: Form validation and management with Zod resolvers