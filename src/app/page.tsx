import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CollegeHome } from "@/components/home/college-home";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Redirect to landing page for unauthenticated users
    redirect("/landing");
  }

  return <CollegeHome />;
}
