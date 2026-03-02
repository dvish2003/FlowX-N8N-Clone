import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
const session = await getServerSession(authOptions);

if(!session?.user){
    redirect("/login")
}


  return <div>{children}</div>;
}