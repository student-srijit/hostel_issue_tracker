# 🏠 Smart Hostel Issue Tracking System

A comprehensive, modern hostel management and issue tracking platform built with Next.js 14, MongoDB, and AI-powered features.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Core Features
- **Issue Tracking** - Report, track, and manage hostel maintenance issues
- **Multi-Role Dashboard** - Separate dashboards for Students, Management, and Maintenance staff
- **AI-Powered Categorization** - Automatic issue categorization using Groq AI
- **Real-time Notifications** - Stay updated with issue status changes
- **QR Code System** - Scan QR codes for quick issue reporting at specific locations

### 📱 User Features
- **Multi-step Issue Reporting** - Intuitive 4-step wizard for reporting issues
- **Image Attachments** - Upload photos with issues for better clarity
- **Voice Notes** - Record audio descriptions for issues
- **Upvoting System** - Upvote issues to prioritize them
- **Comments** - Add comments and track discussions
- **Karma Points** - Earn points for reporting valid issues

### 📊 Management Features
- **Analytics Dashboard** - Visual charts and statistics with Recharts
- **Hostel Map Visualization** - See issue hotspots across locations
- **Staff Performance Tracking** - Monitor maintenance staff efficiency
- **Announcements** - Create and manage hostel announcements
- **QR Code Generator** - Generate location-specific QR codes

### 🔧 Maintenance Features
- **Task Management** - View and manage assigned tasks
- **Kanban Board** - Drag-and-drop issue management
- **Performance Metrics** - Track personal performance and achievements
- **Gamification** - Earn badges and compete on leaderboard

### 🌟 Additional Features
- **Lost & Found** - Report and claim lost items
- **Dark Mode** - Full dark mode support
- **Keyboard Shortcuts** - Quick navigation with keyboard
- **Search** - Global search across issues, announcements, and more
- **Responsive Design** - Works on all device sizes
- **Email Notifications** - Automated emails for updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Groq API key (optional, for AI features)
- SMTP server (optional, for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hostel_issue
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hostel_tracker

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI (Groq)
GROQ_API_KEY=your-groq-api-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@hostel.edu

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the application**
Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
hostel_issue/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── issues/       # Issue CRUD operations
│   │   │   ├── announcements/# Announcements management
│   │   │   ├── lost-found/   # Lost & Found items
│   │   │   ├── qr/           # QR code generation
│   │   │   ├── notifications/# User notifications
│   │   │   ├── staff/        # Staff performance
│   │   │   └── ai/           # AI predictions
│   │   ├── dashboard/        # Main dashboard
│   │   ├── issues/           # Issue management pages
│   │   ├── announcements/    # Announcements page
│   │   ├── lost-found/       # Lost & Found page
│   │   ├── hostel-map/       # Visual hostel map
│   │   ├── leaderboard/      # Gamification leaderboard
│   │   ├── qr-codes/         # QR code management
│   │   ├── settings/         # User settings
│   │   ├── profile/          # User profile
│   │   ├── feedback/         # Feedback form
│   │   ├── login/            # Authentication
│   │   └── signup/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── issues/          # Issue-related components
│   │   ├── announcements/   # Announcement components
│   │   ├── lost-found/      # Lost & Found components
│   │   ├── voice-note/      # Voice recording
│   │   └── providers/       # Context providers
│   ├── lib/                 # Utility functions
│   │   ├── db.ts           # MongoDB connection
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── ai.ts           # Groq AI integration
│   │   ├── email.ts        # Email service
│   │   └── utils.ts        # Helper functions
│   └── models/             # Mongoose models
│       ├── User.ts
│       ├── Issue.ts
│       ├── Announcement.ts
│       ├── LostFound.ts
│       ├── QRCode.ts
│       ├── Notification.ts
│       └── StaffPerformance.ts
├── public/                 # Static assets
├── .env.local             # Environment variables
├── tailwind.config.ts     # Tailwind configuration
├── next.config.mjs        # Next.js configuration
└── package.json
```

## 🔐 User Roles

### Student
- Report issues
- View and track personal issues
- Upvote and comment on issues
- Report lost/found items
- View announcements

### Management
- View all issues and analytics
- Assign issues to maintenance staff
- Create announcements
- Generate QR codes
- Monitor staff performance
- Manage lost & found items

### Maintenance
- View assigned tasks
- Update issue status
- Track personal performance
- View leaderboard position

## 🎨 UI Components

Built with shadcn/ui and custom components:
- Button, Card, Badge, Dialog
- Tabs, Select, Input, Textarea
- Calendar, Command, Progress
- Avatar, Skeleton, Separator
- Tooltip, Switch, Checkbox
- And many more...

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open search |
| `G + D` | Go to Dashboard |
| `G + I` | Go to Issues |
| `G + N` | New Issue |
| `G + A` | Announcements |
| `G + S` | Settings |
| `Escape` | Go back |
| `?` | Show shortcuts |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **AI**: Groq SDK
- **Email**: Nodemailer
- **QR Codes**: qrcode
- **Forms**: React Hook Form, Zod
- **Icons**: Lucide React

## 📝 API Endpoints

### Issues
- `GET /api/issues` - List all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/[id]` - Get issue details
- `PATCH /api/issues/[id]` - Update issue
- `DELETE /api/issues/[id]` - Delete issue
- `POST /api/issues/[id]/comments` - Add comment
- `POST /api/issues/[id]/upvote` - Upvote issue

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `PATCH /api/announcements/[id]` - Update announcement
- `DELETE /api/announcements/[id]` - Delete announcement

### Lost & Found
- `GET /api/lost-found` - List items
- `POST /api/lost-found` - Report item
- `PATCH /api/lost-found/[id]` - Update item
- `DELETE /api/lost-found/[id]` - Delete item

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications` - Delete notifications

### QR Codes
- `POST /api/qr/generate` - Generate QR code
- `GET /api/qr/generate` - List QR codes

### AI
- `POST /api/ai/predict` - Predict issue category

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own hostel management needs!

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev/) for icons
- [Groq](https://groq.com/) for AI capabilities

---

Made with ❤️ for better hostel management
