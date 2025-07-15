import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

const Page = async () => {
  // current user logged in 
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // passing a query to then send the user back where they where to not disrupt their flow.
  if(!user || !user.id) redirect('/auth-callback?origin=dashboard');

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id
    }
  });

  if (!dbUser) redirect('/auth-callback?origin=dashboard');

  return <Dashboard />
}

export default Page

