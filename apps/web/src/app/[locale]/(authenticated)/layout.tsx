import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@repo/ui/components/base/sidebar";
import { cookies } from "next/headers";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
  );
}
