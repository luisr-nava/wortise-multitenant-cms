import { Sidebar } from "@/components/layout/Sidebar";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-zinc-50/50 dark:bg-black">
      <Sidebar user={session.user} />
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-[1400px] px-6 sm:px-10 md:px-12 lg:px-16 py-10 md:py-16">
          <div className="max-w-5xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}

