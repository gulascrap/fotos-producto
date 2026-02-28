import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { STYLES } from '@/lib/prompts';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const isAuth = await getSession();
  if (!isAuth) redirect('/login');

  return <Dashboard styles={STYLES} />;
}
