# Max — Your AI, Maximized

A minimalist, Apple-inspired landing page for **Max**, an AI assistant app. Built with Next.js, Tailwind CSS, Supabase Auth, and Stripe.

## Features

- **Landing page** with hero, how it works, features grid, and waitlist signup
- **User authentication** via Supabase (email/password sign-up and sign-in)
- **Subscription payments** via Stripe Checkout (monthly and yearly plans)
- **Responsive design** optimized for all screen sizes
- **Scroll animations** with Intersection Observer

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — Authentication & waitlist storage
- [Stripe](https://stripe.com) — Subscription billing

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

You'll need:

- **Supabase**: Create a project at [supabase.com](https://supabase.com), then copy your project URL and anon key
- **Stripe**: Create an account at [stripe.com](https://stripe.com), then copy your API keys. Create two subscription products/prices for monthly ($19) and yearly ($149) plans

### 3. Set up Supabase tables

In your Supabase SQL editor, create the waitlist table:

```sql
CREATE TABLE waitlist (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON waitlist
  FOR INSERT WITH CHECK (true);
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Project Structure

```
app/
  page.tsx              Landing page
  signup/page.tsx       Sign up form
  login/page.tsx        Login form
  payment/page.tsx      Subscription plans (protected)
  api/
    checkout/route.ts   Stripe Checkout session creation
    webhook/route.ts    Stripe webhook handler
    waitlist/route.ts   Waitlist email storage
components/
  Navbar.tsx            Navigation bar
  Hero.tsx              Hero section
  HowItWorks.tsx        Three-step section
  Features.tsx          Feature grid
  WaitlistCTA.tsx       Email capture form
  Footer.tsx            Site footer
  AuthForm.tsx          Reusable auth form
  PricingCard.tsx       Subscription plan card
lib/
  supabase.ts           Supabase client
  stripe.ts             Stripe client
```
