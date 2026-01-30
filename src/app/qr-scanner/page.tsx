import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout";
import { QrScanner } from "@/components/qr/qr-scanner";

export default async function QrScannerPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout>
      <QrScanner />
    </DashboardLayout>
  );
}
