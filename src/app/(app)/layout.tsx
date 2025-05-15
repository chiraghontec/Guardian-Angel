
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col bg-background">
          <div className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
