# ח.א חקלאות — Agricultural Management System

## Project Structure
```
ha-agriculture/
├── server/          # Node.js + Express + MongoDB
│   └── src/
│       ├── models/          # Mongoose models (preserved from original)
│       ├── routes/          # API routes
│       ├── middleware/       # Auth, rate limiting
│       ├── utils/           # Helpers & factories
│       └── server.js        # Entry point
│
└── client/          # Vite + React + Tailwind
    └── src/
        ├── pages/           # Page components
        ├── components/      # Reusable UI components
        ├── services/        # API service (axios)
        ├── store/           # Zustand state management
        ├── hooks/           # Custom React hooks
        └── utils/           # Utilities
```

## Setup
### Server
```bash
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### Client
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## Security Features
- JWT access tokens (15min) + refresh tokens (7 days)
- Bcrypt password hashing (salt 12)
- Rate limiting on login endpoint
- Helmet.js security headers
- CORS configured
- Input validation

## Models (preserved from original DB)
- Sale, Expense, Client, Bid, User, TractorPrice, TaxValues
- PersonalSale, Workers, PersonalRkrExpenses, PersonalProductExpenses
- PersonalInvestment, PersonalTractorPrice
