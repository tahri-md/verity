# Verity Frontend

A modern Next.js-based frontend for the Verity Blockchain Verification System. Built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Theme

The frontend uses a **Crayon Gray & Black** color scheme:
- **Primary**: Deep black/gray (#0f0f0f in dark mode)
- **Secondary**: Medium gray (#808080)
- **Accent**: Light gray/white accents
- **Background**: Clean light backgrounds transitioning to dark
- **Borders**: Subtle gray dividers

## Features

### Authentication
- Login & Sign Up with email/password
- Password recovery
- JWT token-based authentication
- Persistent login state

### Dashboard
- Summary cards (balance, transactions, blocks status)
- Quick action buttons
- Recent activity feeds
- Real-time statistics

### Account Management
- Create, view, and delete accounts
- Account details & transaction history
- Cryptographic key generation (ECDSA P-256)
- Balance tracking

### Transaction Management
- Create and sign transactions
- View transaction history with filtering
- Transaction status tracking (pending, confirmed, failed)
- Signature verification

### Blockchain Features
- View blocks with merkle root & hash
- Consensus state and voting
- Comprehensive audit logging
- Ledger state verification

### Cryptographic Tools
- Merkle Proof verification
- Digital signature verification
- Transaction signing
- Key generation

### User Management
- User profile viewing
- Settings and preferences
- Security options (2FA, password change)
- Notification preferences

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
verity-front/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── globals.css               # Global styles & theme
│   ├── page.tsx                  # Root page
│   ├── login/                    # Authentication
│   ├── signup/
│   ├── forgot-password/
│   ├── dashboard/                # Main dashboard
│   ├── accounts/                 # Account management
│   ├── transactions/             # Transaction management
│   ├── blocks/                   # Block management
│   ├── consensus/                # Consensus & voting
│   ├── audit/                    # Audit logging
│   ├── ledger/                   # Ledger state
│   ├── crypto/                   # Cryptographic tools
│   ├── profile/                  # User profile
│   ├── settings/                 # User settings
│   └── [error pages]/            # Error pages (404, 403, 500)
├── components/
│   ├── Navigation.tsx            # Main navigation
│   └── PrivateLayout.tsx         # Protected route wrapper
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local                    # Environment config
```

## Color Palette

The theme uses a professional gray/black crayon color scheme:

```
Light Mode:
- Background: #FAF9F7 (off-white)
- Foreground: #0F0F0F (deep black)
- Card: #FFFFFF (white)
- Primary: #1A1A1A (dark gray)
- Muted: #737373 (medium gray)
- Border: #E5E5E5 (light gray)

Dark Mode:
- Background: #0D0D0D (almost black)
- Foreground: #F2F2F2 (almost white)
- Card: #1E1E1E (dark gray)
- Primary: #F2F2F2 (light gray)
- Muted: #8F8F8F (medium gray)
- Border: #404040 (dark gray)
```

## API Integration

The frontend connects to the Verity backend API (default: `http://localhost:8080/api`).

### Endpoints Used:
- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `GET /accounts` - List accounts
- `POST /accounts` - Create account
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `GET /blocks` - List blocks
- `GET /consensus` - Get consensus state
- `GET /audit` - Audit log
- `GET /ledger` - Ledger state
- `POST /crypto/verify-signature` - Verify signatures
- `POST /crypto/verify-merkle` - Verify merkle proofs

## Development

### Code Style
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for UI components
- React hooks for state management

### Responsive Design
All pages are responsive and work on mobile, tablet, and desktop devices.

### State Management
Uses React hooks (useState, useEffect) for state management. Consider Redux/Zustand for larger projects.

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Verity backend API URL | `http://localhost:8080/api` |

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- CSS-in-JS minification
- Native Next.js optimizations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Create a pull request

## License

MIT

## Support

For issues and questions:
- Check the [backend documentation](../README.md)
- Review [FRONTEND_PAGES.md](../FRONTEND_PAGES.md) for page descriptions
- Open an issue in the repository
