# DTC EPROMS - Electronic Patient Recorded Outcome Measures

A comprehensive EPROMS (Electronic Patient Recorded Outcome Measures) system for cancer clinics in the NHS, focused on collecting and managing patient-reported side effects based on CTCAE (Common Terminology Criteria for Adverse Events) guidelines.

## Features

### Clinician Portal
- Patient list and dashboard with overview of all patients
- Individual patient views with comprehensive care details
- Real-time side effect monitoring and alerts
- Treatment timeline visualization
- Analytics dashboard for clinical insights
- PDF/CSV export functionality
- NHS SSO authentication

### Patient Portal
- Personal care dashboard
- Treatment timeline and appointment tracking
- CTCAE-guided side effect reporting
- Historical side effect tracking
- Secure email/password authentication with 2FA
- Email/SMS notifications for reminders

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL 15
- **Authentication**: JWT + NHS SSO + Passport.js
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (if running locally without Docker)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd DTC_EPROMS
```

2. Copy environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Install dependencies
```bash
npm run install:all
```

### Development

#### Using Docker (Recommended)
```bash
# Build and start all services
npm run docker:build
npm run docker:up

# Stop services
npm run docker:down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

#### Local Development
```bash
# Terminal 1 - Start PostgreSQL (if not using Docker)
# Terminal 2 - Start backend and frontend
npm run dev
```

## Project Structure

```
DTC_EPROMS/
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── database/
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── package.json
```

## Database Schema

The system includes:
- Users (clinicians and patients)
- Patients (medical records)
- Treatments and treatment cycles
- CTCAE side effects catalog
- Patient-reported side effects
- Notifications and alerts

## Security Features

- NHS Data Security and Protection Toolkit compliant
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- SQL injection prevention
- XSS protection

## NHS Integration

The system supports NHS SSO (Single Sign-On) for clinician authentication, ensuring compliance with NHS security standards.

## License

MIT

## Support

For issues or questions, please contact the development team.
