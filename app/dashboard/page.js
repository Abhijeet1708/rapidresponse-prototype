import { supabase } from '@/lib/supabase';
import ClientDashboard from './ClientDashboard';

export const revalidate = 0; // Disable static rendering for this page

export default async function DashboardPage() {
  // Fetch initial incidents
  const { data: initialIncidents, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching initial incidents:', error);
  }

  // Determine the production URL for the QR code
  // In a real Vercel deployment, process.env.VERCEL_PROJECT_PRODUCTION_URL or NEXT_PUBLIC_SITE_URL might be available.
  // For this prototype, we'll use a placeholder or read from env if available.
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                 (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
                 'https://rapidresponse-prototype.vercel.app'); // fallback for demo

  const reportUrl = `${appUrl}/report`;

  return (
    <ClientDashboard initialIncidents={initialIncidents || []} reportUrl={reportUrl} />
  );
}
