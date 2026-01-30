import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout";
import { IssueReportForm } from "@/components/issues/issue-report-form";

export default async function NewIssuePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <IssueReportForm />
    </DashboardLayout>
  );
}
