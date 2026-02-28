# Arena Management System

A full-stack application for managing sports arenas, teams, matches, and players with admin dashboard and real-time chat capabilities.

## 📋 Project Structure

```
.
├── client/                 # React + Vite frontend application
│   ├── src/
│   │   ├── pages/         # Page components (Dashboard, Login, Arenas, Teams, Matches, etc.)
│   │   ├── contexts/      # Context providers (ThemeContext)
│   │   ├── api/           # API configuration (Axios)
│   │   ├── assets/        # Static assets
│   │   ├── styles/        # Global styles (Tailwind, CSS modules)
│   │   └── Flow/          # Onboarding flow components
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── package.json
│
├── server/                 # Node.js + Express backend
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models (User, Match, Chat, etc.)
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── teamManagement.js
│   │   ├── profileRoutes.js
│   │   └── dashboard.js
│   ├── middlewares/       # Custom middleware (auth verification)
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables
│   └── package.json
│
├── lib/                    # Shared utilities
│   └── utils.ts
│
└── package.json            # Root package configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app-name>
JWT_SECRET=<your-secret-key>
PORT=4000
```

## 🛠️ Running the Application

### Start the Server

```bash
cd server
npm start
```

The server will run on `http://localhost:4000` with Socket.IO support for real-time features.

### Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

### Development Mode (Both Simultaneously)

You can run both in separate terminals:

**Terminal 1 - Server:**
```bash
cd server && npm start
```

**Terminal 2 - Client:**
```bash
cd client && npm run dev
```

## 📦 Key Dependencies

### Client
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Icons** - Icon library
- **clsx** - Utility for constructing className strings
- **tailwind-merge** - Utility for merging Tailwind CSS classes

### Server
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **CORS** - Cross-origin resource sharing
- **node-cron** - Task scheduling

## 🔐 Features

- **Authentication** - User login/registration with JWT
- **Admin Dashboard** - Manage arenas, teams, and matches
- **Arena Management** - Create and view arenas with details
- **Team Management** - Create and manage sports teams
- **Match Scheduling** - Create and track matches
- **Player Management** - Manage player profiles
- **Real-time Chat** - Socket.IO powered messaging
- **User Profiles** - Edit profile information
- **Theme Support** - Light/dark theme toggle
- **Responsive Design** - Mobile-friendly UI

## 📁 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin
- `GET/POST /api/admin/arenas` - Arena management
- `GET/POST /api/admin/teams` - Team management
- `GET/POST /api/admin/matches` - Match management

### Teams
- `GET/POST /api/teams` - Team operations
- `GET /api/teams/:id` - Get team details

### Matches
- `GET/POST /api/matches` - Match operations
- `GET /api/matches/:id` - Get match details

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Dashboard
- `GET /api/dashboard` - Dashboard data

## 🔄 Real-time Features

Socket.IO is configured for:
- Real-time match updates
- Live chat messaging
- Instant notifications

## 🛡️ Middleware

- **verifyToken.js** - JWT authentication middleware
- **verifyAdmin.js** - Admin authorization middleware

## 📝 Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Server
```bash
npm start        # Start server
npm run dev      # Start with nodemon (if configured)
```

## 🐛 Troubleshooting

### MongoDB Connection Error
Ensure your `MONGO_URI` is correct in the `.env` file and MongoDB Atlas cluster is accessible.

### Missing Dependencies
Run `npm install` in both `client` and `server` directories, and at the root level.

### Port Already in Use
- Server runs on port 4000
- Client runs on port 5173
- Ensure these ports are available or modify in configuration files

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- Nitin Kapoor

---

For more information or issues, please contact the development team.
