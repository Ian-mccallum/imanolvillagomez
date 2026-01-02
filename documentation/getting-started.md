# Getting Started

This guide will help you set up the NOL Videography project on your local machine and get started with development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nol
```

### 2. Install Dependencies

```bash
npm install
```

This will install all project dependencies defined in `package.json`.

### 3. Environment Setup

Copy the example environment file and configure your local environment:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration values:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_CONTACT_EMAIL=contact@example.com
VITE_CONTACT_PHONE=+1234567890
```

### 4. Start Development Server

```bash
npm run dev
```

The development server will start at `http://localhost:5173` (or the next available port).

## Available Scripts

### Development

- `npm run dev` - Start the development server with hot module replacement
- `npm run preview` - Preview the production build locally

### Build & Quality

- `npm run build` - Build the project for production (outputs to `dist/`)
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run format` - Format code using Prettier
- `npm run type-check` - Run TypeScript compiler in check mode (no emit)

## Project Structure Overview

```
src/
├── components/    # Reusable React components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── constants/     # Application constants
├── services/      # API services
├── contexts/      # React Context providers
└── assets/        # Static assets (images, fonts, etc.)
```

For detailed information, see [Project Structure](./project-structure.md).

## Your First Change

1. Open `src/pages/HomePage.tsx`
2. Modify the content
3. Save the file
4. See your changes instantly in the browser (hot reload)

## Next Steps

- Read the [Architecture](./architecture.md) documentation to understand the system design
- Review the [Development Guide](./development-guide.md) for best practices
- Check out the [Code Style Guide](./code-style-guide.md) for coding conventions
- Explore [Components](./components.md) to understand the component library

## Getting Help

- Check [Troubleshooting](./troubleshooting.md) for common issues
- Review existing code and documentation
- Consult the [TypeScript Guide](./typescript-guide.md) for type-related questions
