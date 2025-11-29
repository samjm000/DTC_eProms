# NHS EPROMS - Quick Start Guide

## 🚀 System is Ready!

All services are configured and running.

## 📍 Access URLs

- **Frontend Application**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

## 🔐 Test Accounts

### Patient Account
```
Email: patient@test.com
Password: Password123
```

### Clinician Account
```
Email: clinician@test.com
Password: Password123
```

## ⚡ Quick Commands

### Start the System
```bash
cd /home/samjm000/code/DTC_EPROMS
docker compose up -d
```

### Stop the System
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f
```

### Restart a Service
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart postgres
```

### Check Status
```bash
docker compose ps
```

## 🗄️ Database Access

```bash
# Access PostgreSQL
docker exec -it eproms-db psql -U eproms_user -d eproms_db

# View all users
docker exec eproms-db psql -U eproms_user -d eproms_db -c "SELECT email, role, first_name, last_name FROM users;"

# View CTCAE events
docker exec eproms-db psql -U eproms_user -d eproms_db -c "SELECT event_name, patient_friendly_name FROM ctcae_adverse_events LIMIT 10;"

# Make a user a clinician
docker exec eproms-db psql -U eproms_user -d eproms_db -c "UPDATE users SET role = 'clinician' WHERE email = 'YOUR_EMAIL';"
```

## 📊 What's Loaded

- ✅ 18 CTCAE Adverse Events
- ✅ 13 CTCAE Categories
- ✅ 2 Test User Accounts
- ✅ Complete Database Schema

## 🎯 Testing the System

### As a Patient:
1. Login with patient@test.com
2. Click "Report Side Effect"
3. Search for "nausea" or "fatigue"
4. Select a side effect and fill in the form
5. View your dashboard

### As a Clinician:
1. Login with clinician@test.com
2. View patient list (will show any registered patients)
3. View urgent side effects dashboard
4. Click on a patient to see their details

## 📚 Full Documentation

- `README.md` - Project overview
- `SETUP.md` - Detailed setup guide
- `API_DOCUMENTATION.md` - Complete API reference
- `PROJECT_SUMMARY.md` - Comprehensive feature list

## 🔧 Troubleshooting

### Port Conflicts
Frontend runs on port 3002 (not 3000) to avoid conflicts.

### Services Not Starting
```bash
docker compose down -v
docker compose up -d
```

### Database Issues
```bash
docker compose restart postgres
docker logs eproms-db
```

## 💡 Common Tasks

### Create a New Patient Profile (as Clinician)
1. First, the patient must register an account
2. Then clinician can create patient profile linking to that account via API

### Add More CTCAE Events
Edit `backend/database/init.sql` and rebuild database

### Export Patient Data
Use the API endpoints documented in `API_DOCUMENTATION.md`

---

**System Status**: ✅ Running
**Last Updated**: 2025-11-27
**Services**: PostgreSQL 15, Node.js 18, React 18
