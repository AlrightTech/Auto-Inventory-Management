# Auto Inventory Management System

A modern, full-stack ERP system for vehicle inventory management built with Next.js 15, Supabase, and a futuristic dark theme.

## 🚀 Features

- **Role-based Authentication** (Admin, Seller, Transporter)
- **Task Management** with real-time updates
- **Event Scheduling** with notifications
- **Real-time Chat** between all users
- **Vehicle Inventory** management
- **Futuristic UI** with glassmorphism and neon accents
- **Responsive Design** for all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd auto-inventory-management
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the database setup script:

```bash
node scripts/setup-database.js
```

Then follow the instructions to:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

### 4. Create Admin User

In Supabase Dashboard:
1. Go to Authentication > Users
2. Create a new user with email `admin@example.com`
3. Set password
4. The user will automatically get admin role via the database trigger

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and login with your admin credentials.

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── tasks/            # Task management
│   ├── events/           # Event management
│   └── chat/             # Chat components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   └── validations/      # Zod schemas
├── types/                # TypeScript types
├── supabase/             # Database schema
└── scripts/              # Setup scripts
```

## 🎨 Design System

The application features a futuristic dark theme with:

- **Colors**: Deep blacks, electric blues, neon accents
- **Effects**: Glassmorphism, glow effects, subtle shadows
- **Typography**: Inter and Poppins fonts
- **Components**: Custom glass cards, gradient buttons
- **Animations**: Smooth transitions with Framer Motion

## 🔐 Authentication & Roles

### Admin
- Full access to all modules
- User management
- System configuration
- Analytics and reporting

### Seller
- Vehicle inventory management
- Task assignment and completion
- Event participation
- Chat with all users

### Transporter
- View vehicle inventory
- Task completion
- Event participation
- Chat with all users

## 📊 Modules

### Dashboard
- Key metrics and KPIs
- Sales performance charts
- Auction performance
- Calendar integration

### Task Management
- Create and assign tasks
- Track completion status
- Category-based organization
- Due date tracking

### Event Scheduling
- Create events with assignments
- Calendar view
- Notification system
- User-specific events

### Real-time Chat
- Multi-user messaging
- Online status indicators
- Typing indicators
- Message history

### Inventory Management
- Vehicle CRUD operations
- Status tracking
- Location management
- Title and ARB status

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main branch

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Schema

The database includes these main tables:

- `profiles` - User profiles and roles
- `vehicles` - Vehicle inventory
- `tasks` - Task management
- `events` - Event scheduling
- `messages` - Chat messages
- `notifications` - System notifications
- `user_status` - Online presence

### API Routes

- `/api/tasks` - Task CRUD operations
- `/api/events` - Event CRUD operations
- `/api/messages` - Chat messaging
- `/api/vehicles` - Vehicle management

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the schema from `supabase/schema.sql`
3. Enable Row Level Security (RLS)
4. Configure realtime subscriptions
5. Set up authentication providers

### Customization

- **Colors**: Modify `tailwind.config.ts`
- **Components**: Update `src/components/ui/`
- **Database**: Extend `supabase/schema.sql`
- **Types**: Update `src/types/database.ts`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

Built with ❤️ using Next.js 15 and Supabase