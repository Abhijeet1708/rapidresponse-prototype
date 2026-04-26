-- Enable the uuid-ossp extension if not already enabled (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT NOT NULL DEFAULT ('INC-' || upper(substr(md5(random()::text), 1, 4))),
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'acknowledged', 'responding', 'escalated', 'resolved')),
    staff_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- Enable Realtime for the incidents table
-- By default, Supabase creates a publication called 'supabase_realtime'
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Set up Row Level Security (RLS) policies
-- Since this is a prototype, we'll allow public inserts for the reporting form
-- and public selects/updates for the staff dashboard (in a real app, staff would be authenticated via Supabase Auth)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.incidents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.incidents FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update" ON public.incidents FOR UPDATE TO public USING (true);
