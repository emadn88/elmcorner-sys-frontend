# Vuxy-Inspired Next.js Template

A premium, modern Next.js admin dashboard template inspired by the Vuxy theme. Built with TypeScript, TailwindCSS, shadcn/ui, framer-motion, and Recharts.

## Features

- 🎨 **Modern UI Design** - Vuxy-inspired color palette and gradients
- 🎭 **Smooth Animations** - Powered by framer-motion
- 📊 **Interactive Charts** - Built with Recharts
- 📱 **Fully Responsive** - Mobile-first design
- 🎯 **Component-Based** - Clean, reusable components
- 🔧 **Type-Safe** - Full TypeScript support
- 🚀 **Ready to Scale** - Prepared for LMS platform expansion

## Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - High-quality component primitives
- **framer-motion** - Animation library
- **Recharts** - Chart library
- **lucide-react** - Icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
/app
  /(auth)/login          # Login page
  /dashboard             # Dashboard pages
/components
  /ui                    # shadcn/ui components
  /layout                # Layout components (Sidebar, Header)
  /charts                # Chart components
  /dashboard             # Dashboard widgets
/lib                     # Utilities and data
/hooks                   # Custom React hooks
/types                   # TypeScript types
/styles                  # Theme configuration
```

## Pages

- **Login** (`/login`) - Animated login page with gradient background
- **Dashboard** (`/dashboard`) - Main dashboard with charts and widgets

## Components

### Layout Components
- `Sidebar` - Collapsible navigation sidebar
- `Header` - Top header with breadcrumb, search, notifications
- `DashboardLayout` - Main layout wrapper

### Dashboard Widgets
- `StatCard` - Animated statistics card
- `RecentActivity` - Activity timeline
- `ProgressCard` - Circular progress indicator

### Charts
- `AreaChart` - Revenue/area visualization
- `BarChart` - Bar chart visualization
- `LineChart` - Line chart visualization

## Customization

### Colors

Edit `tailwind.config.ts` and `app/globals.css` to customize the color scheme.

### Theme

Theme configuration is in `styles/theme.ts`.

## Future Expansion

This template is structured to easily expand into a full LMS platform. The sidebar includes navigation items for:

- Courses
- Students
- Instructors
- Assignments
- Grades
- Calendar
- Reports
- Messages
- Library
- Settings

## License

MIT

