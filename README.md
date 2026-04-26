# RapidResponse

[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=rapidresponse-prototype)](https://rapidresponse-prototype.vercel.app/)
[![CI](https://github.com/Abhijeet1708/rapidresponse-prototype/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhijeet1708/rapidresponse-prototype/actions/workflows/ci.yml)

RapidResponse is a real-time crisis coordination platform designed for hospitality venues. It enables guests to instantly report emergencies via a mobile-optimized interface without needing to authenticate, and provides staff with a high-density, real-time "operations console" to acknowledge, track, and resolve those incidents instantly. 

## Live Demo

**Production URL:** [https://rapidresponse-prototype.vercel.app](https://rapidresponse-prototype.vercel.app)

## Tech Stack

- **Next.js 14**: React framework with App Router and Server/Client Components.
- **Supabase**: Realtime database and Postgres backend.
- **Tailwind CSS**: Utility-first CSS framework for high-end styling.
- **Vercel**: Edge network for continuous deployment and hosting.
- **qrcode npm**: For generating dynamic reporting URLs.

## Prerequisites

- Node.js 18 or above
- A free account on [Supabase](https://supabase.com)
- A free account on [Vercel](https://vercel.com)

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhijeet1708/rapidresponse-prototype.git
   cd rapidresponse-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project. Set `SESSION_SECRET` to a random 32-character string.

4. **Initialize Database Schema**
   Open your Supabase project dashboard, navigate to the SQL Editor, and run the SQL script found at `supabase/schema.sql` to create the `incidents` table and Realtime policies.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Demo Instructions

To run a live demonstration of the core loop in a room with multiple people:

1. Open the Staff Dashboard (`/dashboard`) on a large screen or projector.
2. Log in using the demo credentials defined in your environment variables (e.g., `demo` / `rapidresponse`).
3. Instruct participants to scan the QR code displayed in the top right corner of the dashboard using their smartphones.
4. When a participant submits an emergency on their phone, watch it appear on the dashboard **within one second** via Supabase Realtime.
5. Click on the incident card on the dashboard to expand the controls, and click "Acknowledge" or "Responding".
6. The participant's phone will automatically update to reflect the new status in real time without refreshing.

## What Is Not Included

This prototype focuses entirely on the real-time reporting loop. The following features are intentionally omitted and scoped for the full production build:
- **Floor map SVG picker**: Visual location selection.
- **Photo and voice note uploads**: Rich media incident attachments.
- **Real user authentication**: Role-based access control (RBAC) via Supabase Auth.
- **Multi-property support**: Scoping incidents to specific hotel branches.
- **Twilio SMS escalation**: Out-of-band notifications for critical incidents.
- **PDF compliance export**: Generating post-incident audit trails.
- **Stripe billing**: SaaS subscription management.
- **Analytics**: Historical incident resolution metrics.
