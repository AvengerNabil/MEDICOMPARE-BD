# MediCompare BD — Environment Variables Guide

```env
# ==============================================================================
# MediCompare BD — Production Environment Variable Template
# ==============================================================================

# Node / Next.js
NODE_ENV=production
PORT=3000

# Supabase Project Configuration (Project: nfrzwsqudmvrluysqjfo)
NEXT_PUBLIC_SUPABASE_URL=https://nfrzwsqudmvrluysqjfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here

# Supabase PostgreSQL Connection String (Pooler - Port 6543)
DATABASE_URL=postgresql://postgres.nfrzwsqudmvrluysqjfo:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.nfrzwsqudmvrluysqjfo:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Backend API Configuration
BACKEND_PORT=8000
JWT_SECRET=production_super_secret_change_me_32chars_minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Client Configuration
NEXT_PUBLIC_APP_NAME="MediCompare BD"
NEXT_PUBLIC_DEFAULT_LOCALE=en
```
