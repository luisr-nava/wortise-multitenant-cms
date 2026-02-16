# Vercel Deployment Checklist

Follow this checklist to ensure a smooth production deployment on Vercel.

## 1. Environment Variables

Configure these in **Settings > Environment Variables**:

- [ ] `DATABASE_URL`: Connection string to your MongoDB Atlas cluster.
  - _Tip_: Ensure "Network Access" in Atlas allows Vercel IPs (or allow
    `0.0.0.0/0` temporarily).
- [ ] `BETTER_AUTH_SECRET`: Generate a strong random string
      (`openssl rand -base64 32`).
- [ ] `BETTER_AUTH_URL`: Your Vercel deployment URL (e.g.,
      `https://project.vercel.app`).
  - _Note_: For preview deployments, BetterAuth may need dynamic configuration
    or a wildcard domain.
- [ ] `NODE_ENV`: Should be `production` (Default on Vercel).

## 2. Build Settings

- [ ] **Framework Preset**: Next.js
- [ ] **Build Command**: `next build` (Default)
- [ ] **Install Command**: `npm install` (Default)

## 3. MongoDB Configuration

- [ ] **Indexes**: Ensure indexes are created.
  - The app attempts to create them on startup in `src/lib/db.ts`.
  - _Monitor_: Check Vercel Function logs for "Indexes ensured" message.
- [ ] **Connection Pooling**: Vercel Serverless Functions freeze.
  - Ensure `clientPromise` pattern in `src/lib/db.ts` is working (It is
    implemented correctly in this repo).

## 4. Post-Deployment Verification

- [ ] **Log In**: Test authentication flow.
- [ ] **Organization Switch**: Verify you can create and switch organizations.
- [ ] **Security Headers**: inspect response headers for
      `X-Content-Type-Options: nosniff`.

