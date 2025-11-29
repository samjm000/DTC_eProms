# DTC EPROMS - Setup Guide

This guide will help you set up and run the NHS EPROMS system locally or with Docker.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher (if running locally without Docker)
- Docker and Docker Compose (for containerized deployment)

## Quick Start with Docker (Recommended)

This is the easiest way to get started. Docker Compose will handle all dependencies including the database.

### 1. Clone and Setup

```bash
cd DTC_EPROMS
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` and update the following:
- `JWT_SECRET` - Set a strong random secret
- `SMTP_*` - Configure your email provider (optional for notifications)
- `NHS_SSO_*` - Configure NHS SSO credentials (if available)

### 3. Start the Application

```bash
# Install root dependencies
npm install

# Build and start all services (database, backend, frontend)
npm run docker:build
npm run docker:up
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

### 5. Stop the Application

```bash
npm run docker:down
```

## Local Development Setup (Without Docker)

If you prefer to run services locally:

### 1. Setup PostgreSQL Database

```bash
# Create database
createdb eproms_db

# Run initialization script
psql eproms_db < backend/database/init.sql
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

Backend will run on http://localhost:3001

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## Initial Setup

### Create First Clinician Account

Option 1: Use NHS SSO (if configured)
- Navigate to http://localhost:3000/login
- Click "Login with NHS SSO"

Option 2: Register manually
- Navigate to http://localhost:3000/register
- Fill in the registration form
- After registration, you'll need to update the user role in the database:

```sql
UPDATE users SET role = 'clinician' WHERE email = 'your.email@nhs.net';
```

### Create First Patient Account

1. Register at http://localhost:3000/register
2. After registration, a clinician needs to create the patient profile linking to this user account

## Database Management

### View Database

```bash
# Using Docker
docker exec -it eproms-db psql -U eproms_user -d eproms_db

# Local PostgreSQL
psql eproms_db
```

### Common SQL Queries

```sql
-- View all users
SELECT id, email, role, first_name, last_name FROM users;

-- View all patients
SELECT p.id, p.nhs_number, u.first_name, u.last_name, p.cancer_type
FROM patients p
JOIN users u ON p.user_id = u.id;

-- View urgent side effects
SELECT pse.*, ae.event_name, p.nhs_number
FROM patient_side_effects pse
JOIN ctcae_adverse_events ae ON pse.ctcae_event_id = ae.id
JOIN patients p ON pse.patient_id = p.id
WHERE pse.requires_urgent_attention = true
AND pse.clinician_review_status IN ('pending', 'action_required');
```

## Testing the Application

### Test Patient Flow

1. Register as a patient at http://localhost:3000/register
2. Login and view your dashboard
3. Click "Report Side Effect"
4. Search for a side effect (e.g., "nausea")
5. Fill in the form and submit

### Test Clinician Flow

1. Login as a clinician
2. View the dashboard showing all patients and urgent side effects
3. Click "Patients" to see the patient list
4. Click on a patient to view their details and side effects

## NHS SSO Configuration

To enable NHS SSO for clinicians:

1. Obtain NHS SSO credentials from your NHS Digital representative
2. Update the following in your `.env`:

```
NHS_SSO_CLIENT_ID=your_client_id
NHS_SSO_CLIENT_SECRET=your_client_secret
NHS_SSO_CALLBACK_URL=http://localhost:3001/auth/nhs/callback
NHS_SSO_ENTRY_POINT=https://auth.nhs.uk/saml
NHS_SSO_CERT=<your_certificate>
```

## Email Notifications (Optional)

To enable email notifications:

1. Configure SMTP settings in `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=NHS EPROMS <noreply@example.nhs.uk>
```

2. For Gmail, you'll need to create an "App Password"

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps  # For Docker
pg_isready  # For local PostgreSQL

# View database logs
docker logs eproms-db
```

### Backend Issues

```bash
# View backend logs
docker logs eproms-backend

# Check backend health
curl http://localhost:3001/health
```

### Frontend Issues

```bash
# View frontend logs
docker logs eproms-frontend

# Clear cache and rebuild
rm -rf frontend/node_modules frontend/dist
cd frontend && npm install && npm run build
```

### Port Conflicts

If ports 3000, 3001, or 5432 are already in use:

1. Stop the conflicting service
2. Or modify the ports in `docker-compose.yml` and update `.env` accordingly

## Production Deployment Considerations

Before deploying to production:

1. **Security**:
   - Change all default passwords
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure NHS SSO properly
   - Set up firewall rules

2. **Database**:
   - Use managed PostgreSQL service (e.g., AWS RDS, Azure Database)
   - Set up regular backups
   - Enable SSL connections

3. **Environment**:
   - Set `NODE_ENV=production`
   - Use production-grade secrets
   - Configure proper logging

4. **Compliance**:
   - Ensure GDPR compliance
   - Enable audit logging
   - Set up data retention policies
   - Configure NHS Data Security and Protection Toolkit requirements

5. **Monitoring**:
   - Set up application monitoring
   - Configure alerts for urgent side effects
   - Monitor system health and performance

## Support

For issues or questions:
- Check the logs first
- Review this setup guide
- Check the main README.md for architecture details
