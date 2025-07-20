import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string // needs to be the same name as folder
  }
}

const Page = async ({ params }: PageProps) => {
  // retrieve file id
  const { fileid } = params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`);

  // make db call
  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id // a user can only view their own file
    },
  });

  if(!file) notFound();

  return (
    <div>
      
    </div>
  )
}

export default Page