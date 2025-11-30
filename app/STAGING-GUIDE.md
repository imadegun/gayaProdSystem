# Staging Environment Setup Guide

This guide will help you set up a staging environment to test the Estimates module and other features live.

## Quick Start Options

### Option 1: Local Staging (Fastest for Testing)

Run the app locally with production build:

```bash
cd app

# 1. Build the application
npm run build

# 2. Start the production server
npm run start
```

The app will be available at `http://localhost:3000`

### Option 2: Docker Deployment (Recommended for Team Testing)

```bash
# Build and run with Docker
docker build -t gayaprod-staging .
docker run -p 3000:3000 --env-file .env.staging gayaprod-staging
```

### Option 3: Cloud Deployment (Vercel, Railway, etc.)

See detailed instructions below.

---

## Detailed Setup Instructions

### Step 1: Database Setup

#### Option A: Use Local PostgreSQL
```bash
# Install PostgreSQL if not already installed
# Create a staging database
psql -U postgres
CREATE DATABASE gayaProd_staging;
\q
```

#### Option B: Use Cloud PostgreSQL (Recommended for staging)
- **Supabase** (Free tier): https://supabase.com
- **Railway** (Free tier): https://railway.app
- **Neon** (Free tier): https://neon.tech

After creating the database, copy the connection string.

### Step 2: Configure Environment

1. Copy the staging environment template:
```bash
cp .env.staging .env.local
```

2. Edit `.env.local` with your staging values:
```env
DATABASE_URL="postgresql://user:password@host:5432/gayaProd_staging"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"  # or your staging URL
```

3. Generate a secure secret:
```bash
openssl rand -base64 32
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to staging database
npx prisma db push

# (Optional) Seed with sample data
npm run seed
```

### Step 4: Build and Run

```bash
# Build for production
npm run build

# Start the server
npm run start
```

---

## Testing the Estimates Module

### Test Workflow

1. **Login as R&D User**
   - Create a new project
   - Add directory list items to the project

2. **Create Estimate (R&D/Sales)**
   - Go to `/rnd/estimates`
   - Click "Create Estimate"
   - Select a project
   - Choose directory items
   - Fill in title and description
   - Submit

3. **Set Prices (Admin/CEO)**
   - Login as Admin
   - Go to `/rnd/estimates`
   - Find the draft estimate
   - Click the $ (dollar) icon
   - Enter unit prices for each item
   - Save

4. **Send to Client (Sales)**
   - Login as Sales
   - Find the priced estimate
   - Click the send icon
   - Enter client email
   - Send

5. **Verify Project Status**
   - Check that project status updated to "quotation_sent"

### Test Users

Create test users with different roles:

```sql
-- Run in your database or use Prisma Studio
INSERT INTO "User" (username, password, role, "isActive") VALUES
('rnd_user', '$2a$10$...', 'R&D', true),
('sales_user', '$2a$10$...', 'Sales', true),
('admin_user', '$2a$10$...', 'Admin', true);
```

Or use Prisma Studio:
```bash
npx prisma studio
```

---

## Cloud Deployment Options

### Vercel (Easiest)

1. Push your code to GitHub
2. Connect to Vercel: https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Railway

1. Create account at https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Deploy from GitHub
5. Add environment variables

### Docker (Self-hosted)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Authentication Issues
- Ensure NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain
- Check browser cookies are enabled

### Missing Data
```bash
# Reset and reseed database
npx prisma db push --force-reset
npm run seed
```

---

## Monitoring & Logs

### View Logs (Local)
```bash
npm run start 2>&1 | tee app.log
```

### View Logs (Vercel)
```bash
vercel logs
```

### Database Inspection
```bash
npx prisma studio
```

---

## Security Checklist

Before going live:

- [ ] Generate new NEXTAUTH_SECRET
- [ ] Use HTTPS for NEXTAUTH_URL
- [ ] Set strong database password
- [ ] Enable database SSL
- [ ] Review user permissions
- [ ] Test all role-based access controls
- [ ] Backup database before testing

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Database
npx prisma generate    # Generate client
npx prisma db push     # Push schema
npx prisma studio      # GUI for database
npx prisma migrate dev # Create migration

# Seed data
npm run seed