import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation';

const Page = () => {
  // current user logged in 
  const { getUser } = getKindeServerSession();
  const user = getUser();

  // passing a query to then send the user back where they where to not disrupt their flow.
  if(!user || !user.id) redirect('/auth-callback?origin=dashboard');

  return (
    <div>P</div>
  )
}

export default Page

// user logs in
  // are they already in the db
    // they can continue to use services
  // if they are not we sync user to db  (in the auth-callback page)
    // then they can proceed to the dashboard to use services

// this entier process is called eventual consistency: user not direnctly added to db but often though a webhook