# Golf Charity Platform

A full-stack web application that combines golf scoring with charitable giving through a subscription-based lottery system. Users subscribe monthly or yearly, track their golf scores, and participate in automated draws where prizes are distributed to winners and charities.

## Features

- **User Authentication**: Secure login/signup with JWT tokens and cookies
- **Subscription Management**: Monthly/Yearly plans with Razorpay payment integration
- **Golf Score Tracking**: Record and manage Stableford scores (1-45 points)
- **Automated Draws**: Monthly lottery system with random/weighted algorithms
- **Charity Integration**: Users allocate percentage of subscriptions to featured charities
- **Winner Management**: Proof submission and verification for prize claims
- **Admin Dashboard**: Comprehensive admin controls for draws, users, and analytics
- **Responsive Frontend**: Modern React/Vite interface with TypeScript

## Tech Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Razorpay integration
- **Validation**: Built-in request validation

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS modules with responsive design
- **HTTP Client**: Axios for API communication
- **State Management**: React hooks and context

### DevOps & Tools

- **Database Migrations**: Prisma Migrate
- **Seeding**: Prisma seed scripts
- **Linting**: ESLint configurations
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd golf-charity-platform
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Database setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

## Environment Setup

Create `.env` files in both `backend/` and `frontend/` directories.

### Backend (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/golf_charity_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
FRONTEND_URL="http://localhost:5173"

# Razorpay (for payments)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_MONTHLY_AMOUNT=99900  # ₹999 in paise
RAZORPAY_YEARLY_AMOUNT=899900  # ₹8999 in paise
MONTHLY_PRICE=999
YEARLY_PRICE=8999
```

### Frontend (.env)

```env
VITE_API_URL="http://localhost:5000/api"
```

## Running the Application

1. **Start the backend**

   ```bash
   cd backend
   npm run dev
   ```

   Server runs on http://localhost:5000

2. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   App runs on http://localhost:5173

3. **Access the application**
   - Frontend: http://localhost:5173
   - API Health Check: http://localhost:5000/api/health

## API Documentation

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Subscriptions

- `POST /api/subscriptions/initiate` - Create payment order
- `POST /api/subscriptions/confirm` - Verify and activate subscription
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/mock-activate` - Mock activation (development)
- `GET /api/subscriptions` - Get user subscription

### User Management

- `GET /api/user/dashboard` - User dashboard data
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/winners/:id/proof` - Upload winner proof

### Golf Scores

- `POST /api/scores` - Submit golf score
- `GET /api/scores` - Get user scores
- `DELETE /api/scores/:id` - Delete score

### Draws

- `GET /api/draws/published` - Get published draw results
- `POST /api/draws/simulate` - Simulate draw (admin)
- `POST /api/draws/publish` - Publish draw results (admin)

### Charities

- `GET /api/charities` - List charities
- `POST /api/charities/contribute` - Set charity contribution

### Admin (requires admin role)

- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - List users
- `POST /api/admin/draws/simulate` - Simulate draws
- `POST /api/admin/draws/publish` - Publish results

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and profile data
- **Subscriptions**: Payment and plan management
- **Golf Scores**: User score tracking
- **Draws**: Monthly lottery events
- **Draw Entries**: User participation records
- **Winners**: Prize winners and verification
- **Charities**: Charitable organizations
- **Charity Contributions**: User charity allocations

Run `npx prisma studio` to explore the database visually.

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Testing Payments

Use the `/api/subscriptions/mock-activate` endpoint for development testing without real payments.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
