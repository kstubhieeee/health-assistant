# Health Assistant

A modern web application that provides personalized health assessments and recommendations using AI. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication**
  - GitHub OAuth integration
  - Google OAuth integration
  - Secure session management with NextAuth.js

- 📊 **Health Assessment**
  - Comprehensive health questionnaire
  - Real-time form validation
  - Dynamic form sections
  - Progress tracking

- 🤖 **AI-Powered Analysis**
  - Integration with Astra DB and Langflow
  - Personalized health recommendations
  - Detailed health status breakdown
  - Risk factor analysis

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Accessible components
  - Loading states and error handling

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Authentication:** NextAuth.js
- **Form Handling:** React Hook Form + Zod
- **API Integration:** Astra DB + Langflow
- **Markdown Rendering:** marked

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub OAuth credentials
- Google OAuth credentials
- Astra DB account and API token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kstubhieeee/health-assistant.git
cd health-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# Authentication
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# API Configuration
LANGFLOW_API_URL=your_langflow_api_url
LANGFLOW_API_TOKEN=your_langflow_api_token
ASTRA_DB_TOKEN=your_astra_db_token
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
health-assistant/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── check/         # Health assessment form
│   └── layout.tsx     # Root layout
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
└── public/           # Static assets
```

## Key Features Implementation

### Health Assessment Form
- Multi-step form with validation
- Dynamic form sections based on user input
- Real-time progress tracking
- Error handling and validation feedback

### AI Integration
- Secure API communication with Astra DB
- Markdown rendering for AI responses
- Error handling and fallback states
- Rate limiting and request validation

### Authentication
- OAuth integration with GitHub and Google
- Protected routes and API endpoints
- Session management
- User profile handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Astra DB](https://www.datastax.com/products/datastax-astra)
- [Langflow](https://github.com/logspace-ai/langflow)

## Contact

Your Name - [@kstubhieeee](https://github.com/kstubhieeee)

Project Link: [https://github.com/kstubhieeee/health-assistant](https://github.com/kstubhieeee/health-assistant) 
