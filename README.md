# RapidResponse

A real-time crisis coordination platform for hospitality venues. RapidResponse enables guests to seamlessly report emergencies and allows staff to manage these incidents via a live, high-density dashboard with instant updates and status tracking.

## Prerequisites

- Node.js 18.17 or later
- A free [Supabase](https://supabase.com/) account
- A free [Vercel](https://vercel.com/) account for deployment

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/rapidresponse-prototype.git
   cd rapidresponse-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the example environment file and fill in your actual credentials:
   ```bash
   cp .env.local.example .env.local
   ```
   *Note: Ensure `SESSION_SECRET` is set to a secure random string.*

4. **Database Setup**
   Run the SQL statements found in `supabase/schema.sql` (to be created) in your Supabase project's SQL Editor to create the necessary tables and constraints.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Demo

[Placeholder: Demo instructions and live URLs will be added here.]

## What Is Not Included

[Placeholder: Scope constraints and excluded features will be listed here.]
