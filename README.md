# LoFoNet 🔍

> **The Intelligent Lost & Found Network** - Reconnecting people with their belongings through advanced matching algorithms and geospatial intelligence.


---

## 📖 Overview

LoFoNet is a next-generation smart lost and found platform that revolutionizes how people recover their lost items. By leveraging intelligent matching algorithms, geospatial filtering, and real-time notifications, LoFoNet bridges the gap between those who have lost items and those who have found them.

### The Problem We Solve

Every day, millions of items are lost and found worldwide. Traditional lost and found systems are fragmented, inefficient, and rely on manual matching. LoFoNet automates this process through:

- **Intelligent Matching**: AI-powered algorithms that correlate lost item reports with found items based on multiple dimensions
- **Geospatial Awareness**: Location-based filtering to prioritize nearby matches
- **Real-time Connectivity**: Instant notifications when potential matches are found
- **Privacy-First Design**: Secure communication without exposing personal information

---

## ✨ Key Features

### 🎯 Core Functionality

- **Smart Item Reporting**: Easy-to-use interface for reporting lost or found items with image uploads
- **Heuristic Matching Engine**: Multi-dimensional matching algorithm considering:
  - Item category and description keywords
  - Geographic proximity (location-based filtering)
  - Temporal correlation (time windows)
  - Visual similarity (image comparison)
- **Interactive Map Integration**: Visual geospatial interface for precise location marking
- **Real-time Match Notifications**: Instant alerts when potential matches are identified
- **Secure Messaging System**: Built-in chat for claimants to verify ownership
- **Admin Dashboard**: Comprehensive management interface for moderating reports

### 🔐 Security & Privacy

- **End-to-End Verification**: Multi-step ownership verification process
- **Anonymous Communication**: Contact details remain private until both parties agree
- **Secure Image Storage**: CDN-backed image hosting with access controls
- **Role-Based Access Control**: Granular permissions for users and administrators

### 📱 User Experience

- **Progressive Web App (PWA)**: Install on any device, works offline
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Intuitive Interface**: Clean, modern UI built with accessibility in mind
- **Multi-language Support**: (Coming soon) Localization for global reach

### 🎨 Design Features

- **Modern UI Components**: Built with Shadcn UI and Tailwind CSS
- **Dark Mode Support**: Eye-friendly interface for all lighting conditions
- **Smooth Animations**: Polished interactions and transitions
- **Accessibility**: WCAG 2.1 compliant interface

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript 5 (Strict Mode)
- **Build Tool**: Vite (Lightning-fast HMR with ESBuild)
- **Styling**: Tailwind CSS 3 (Utility-first CSS framework)
- **Component Library**: Shadcn UI (Radix UI primitives)
- **State Management**: React Context API + Custom Hooks
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Maps**: Leaflet.js with OpenStreetMap

### Backend
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Native SQL queries (Prepared statements)
- **Authentication**: JWT-based authentication
- **Image Storage**: ImgBB API with CDN distribution

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript compiler
- **Deployment**: Vercel/Netlify (Frontend) + Railway (Backend)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: Access to a PostgreSQL database (Neon.tech recommended)
- **ImgBB API Key**: For image uploads ([Get one here](https://api.imgbb.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itsTrack/lofonet.git
   cd lofonet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   VITE_NEON_DATABASE_URL=postgresql://user:password@host:5432/database
   
   # Image Upload
   VITE_IMGBB_API_KEY=your_imgbb_api_key
   
   # API Base URL (for production)
   VITE_API_BASE_URL=http://localhost:3000/api
   
   # JWT Secret (backend)
   JWT_SECRET=your_secure_jwt_secret_key_here
   ```

4. **Database setup**
   
   Run the database migration script:
   ```bash
   # Execute the schema.sql file
   psql $VITE_NEON_DATABASE_URL < database/schema.sql
   
   # Or if using a GUI tool, import database/schema.sql
   ```

5. **Seed the database (optional)**
   ```bash
   # Run seed script for demo data
   psql $VITE_NEON_DATABASE_URL < database/seed.sql
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Default Admin Credentials

After seeding the database:
- **Email**: `admin@lofonet-sys.com`
- **Password**: `Admin123!@#`

---

## 📁 Project Structure

```
lofonet/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── layout/         # Layout components (header, footer, etc.)
│   │   └── features/       # Feature-specific components
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useGeolocation.ts
│   │   └── useMatching.ts
│   ├── pages/              # Application pages/routes
│   │   ├── Home.tsx
│   │   ├── ReportLost.tsx
│   │   ├── ReportFound.tsx
│   │   ├── Dashboard.tsx
│   │   └── Admin.tsx
│   ├── services/           # API integration layer
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── items.service.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── matching.ts
│   │   ├── geospatial.ts
│   │   └── validators.ts
│   ├── App.tsx             # Root component
│   └── main.tsx            # Application entry point
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── public/                 # Static assets
│   ├── icons/
│   └── images/
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎯 Usage Guide

### For Users Who Lost Items

1. **Create an account** or **log in**
2. Click **"Report Lost Item"**
3. Fill in item details:
   - Category (phone, wallet, keys, etc.)
   - Description with identifying features
   - Upload clear photos
   - Mark location on map
   - Specify date/time lost
4. Submit and wait for match notifications

### For Users Who Found Items

1. **Create an account** or **log in**
2. Click **"Report Found Item"**
3. Provide item details:
   - Category and description
   - Upload photos
   - Mark location where found
   - Specify date/time found
4. Submit and check for potential matches

### Matching Process

1. System automatically scans for potential matches
2. Users receive notifications for high-confidence matches
3. Both parties can view limited details
4. Built-in messaging for verification
5. Coordinate safe return of item

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🌐 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify JWT token

### Items Endpoints

- `GET /api/items/lost` - Get all lost items
- `GET /api/items/found` - Get all found items
- `POST /api/items/lost` - Report lost item
- `POST /api/items/found` - Report found item
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Matching Endpoints

- `GET /api/matches/:itemId` - Get potential matches for item
- `POST /api/matches/verify` - Verify match
- `GET /api/matches/history` - Get user's match history

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy automatically on push

### Backend Deployment (Railway)

1. Create new project in Railway
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### Database (Neon)

1. Create account at [Neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Run migrations

---


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



---

## 🙏 Acknowledgments

- OpenStreetMap for map data
- ImgBB for image hosting
- Neon for serverless PostgreSQL
- Shadcn UI for component primitives
- The open-source community

---

<div align="center">

**LoFoNet** - *Reuniting people with their belongings*

Made with ❤️ by the LoFoNet Team

[Website](https://lofonet.com) • 
</div>
