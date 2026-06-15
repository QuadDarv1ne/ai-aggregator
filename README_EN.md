<div align="center">

# AI Aggregator — Multimodal AI Model Aggregator

### Unified Interface for Leading AI Models

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-new--york-black)](https://ui.shadcn.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

---

**Author:** Dupley Maxim Igorevich

**Intellectual Property:** Dupley Maxim Igorevich

</div>

---

## About the Project

**AI Aggregator** is a modern web platform for unified access to multiple AI providers through a single interface. The project brings together leading language models (Z.ai, OpenAI, Anthropic, DeepSeek) with model comparison, image generation, web search, and flexible configuration. The platform is designed for developers, researchers, and anyone who regularly uses AI models and wants a single access point.

## Key Features

- **4 AI providers and 11 models** — Z.ai (GLM-4 Plus/Flash/Air/Long), OpenAI (GPT-4o, GPT-4o Mini), Anthropic (Claude Sonnet 4, Claude 3.5 Haiku), DeepSeek (V3, R1)
- **Compare mode** — send one query to two models simultaneously with split-view responses
- **Image generation** — built-in AI image generator
- **Web search** — search the internet directly from the chat interface
- **Smart model recommendation** — automatically selects the best model based on query context
- **Prompt templates** — save and quickly access frequently used prompts
- **Conversation management** — create, search, tag, pin, and export conversations to Markdown
- **Dark/light theme** — toggle with state persistence
- **Keyboard shortcuts** — quick commands for all major actions
- **Usage statistics** — token monitoring by provider and model
- **Notification system** — sound alerts on response completion
- **Responsive interface** — fully adaptive design for mobile, tablet, and desktop
- **Animations and transitions** — smooth UI powered by Framer Motion
- **Persistence** — conversations and settings saved to localStorage

## Supported Providers and Models

| Provider | Models | Speed | Quality | Cost |
|----------|--------|-------|---------|------|
| **Z.ai** 🟣 | GLM-4 Plus, Flash, Air, Long | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$ |
| **OpenAI** 🟢 | GPT-4o, GPT-4o Mini | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$$$$ |
| **Anthropic** 🟠 | Claude Sonnet 4, Claude 3.5 Haiku | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$$$ |
| **DeepSeek** 🔵 | DeepSeek V3, DeepSeek R1 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $ |

## Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 | React framework with App Router and SSR |
| **TypeScript** | 5 | Static typing for code reliability |
| **React** | 19 | User interface library |
| **Tailwind CSS** | 4 | Utility-first CSS for rapid UI development |
| **shadcn/ui** | — | UI components in New York style |
| **Zustand** | 5 | Lightweight state management with localStorage persistence |
| **Framer Motion** | 12 | Smooth animations and transitions |
| **Z.ai Dev SDK** | — | SDK for Z.ai model integration |
| **Prisma** | 6 | ORM for database management |
| **NextAuth** | 4 | User authentication |
| **React Hook Form** | 7 | Form management |
| **TanStack Query** | 5 | Server state management |
| **React Markdown** | — | Markdown message rendering |
| **Recharts** | — | Statistics visualization |
| **Sonner** | — | Notification system |
| **Lucide React** | — | Icon set for the interface |
| **Radix UI** | — | Accessible UI component primitives |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New chat |
| `Ctrl+K` | Web search |
| `Ctrl+Shift+I` | Image generation |
| `Ctrl+Shift+P` | Prompt templates |
| `Ctrl+Shift+S` | Chat settings |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+D` | Toggle theme |
| `Ctrl+/` | Shortcuts help |

## Installation and Setup

### Prerequisites

- **Node.js** version 18.17 or higher (20+ recommended)
- **Bun**, **npm**, **yarn**, or **pnpm** as package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/dupleymi-aup/ai-aggregator.git
cd ai-aggregator

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run in development mode
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
ai-aggregator/
├── public/                         # Static files
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main chat page
│   │   ├── globals.css             # Global styles
│   │   └── api/
│   │       ├── route.ts            # Chat API route
│   │       ├── chat/route.ts       # Chat API
│   │       ├── web-search/route.ts # Web search API
│   │       ├── generate-image/route.ts # Image generation API
│   │       ├── conversations/      # Conversations API
│   │       └── messages/route.ts   # Messages API
│   ├── components/
│   │   ├── chat/                   # Chat components
│   │   │   ├── chat-input.tsx      # Message input
│   │   │   ├── chat-message.tsx    # Message display
│   │   │   ├── chat-sidebar.tsx    # Conversation sidebar
│   │   │   ├── chat-settings.tsx   # Chat settings
│   │   │   ├── compare-view.tsx    # Model comparison view
│   │   │   ├── model-selector.tsx  # Model selector
│   │   │   ├── prompt-templates.tsx # Prompt templates
│   │   │   ├── image-generator.tsx # Image generator
│   │   │   ├── web-search.tsx      # Web search
│   │   │   ├── usage-stats.tsx     # Usage statistics
│   │   │   ├── shortcuts-panel.tsx # Keyboard shortcuts
│   │   │   └── mobile-nav.tsx      # Mobile navigation
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── chat-store.ts           # Zustand chat store
│   │   ├── ai-providers.ts         # AI provider configuration
│   │   ├── db.ts                   # Database connection
│   │   ├── prompt-templates.ts     # Prompt templates
│   │   └── utils.ts                # Common utilities
│   └── hooks/                      # Custom hooks
├── prisma/
│   └── schema.prisma               # Database schema
├── package.json                    # Dependencies and scripts
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.mjs              # PostCSS configuration
├── eslint.config.mjs               # ESLint configuration
├── components.json                 # shadcn/ui configuration
├── README.md                       # Brief documentation (RU)
├── README_RU.md                    # Full documentation in Russian
├── README_EN.md                    # Full documentation in English
├── LICENSE                         # License
└── .gitignore                      # Git exclusions
```

## Roadmap

- [x] Z.ai support (GLM-4 Plus, Flash, Air, Long)
- [x] OpenAI support (GPT-4o, GPT-4o Mini)
- [x] Anthropic support (Claude Sonnet 4, Claude 3.5 Haiku)
- [x] DeepSeek support (V3, R1)
- [x] Model comparison mode
- [x] Image generation
- [x] Web search
- [x] Smart model recommendation
- [x] Prompt templates
- [x] Conversation management (search, tags, pinning)
- [x] Markdown conversation export
- [x] Dark/light theme
- [x] Keyboard shortcuts
- [x] Token usage statistics
- [x] Responsive design
- [ ] Plugin system
- [ ] Google Gemini support
- [ ] Mistral AI support
- [ ] File storage integration

---

## Author

**Dupley Maxim Igorevich**

This project is the intellectual property of Dupley Maxim Igorevich. All rights to the source code, design, content, and educational materials belong to the author.

---

## License

This project is the intellectual property of Dupley Maxim Igorevich. Terms of use are described in the [LICENSE](./LICENSE) file.

---

<div align="center">

**AI Aggregator** — © 2025-2026 Dupley Maxim Igorevich

</div>
