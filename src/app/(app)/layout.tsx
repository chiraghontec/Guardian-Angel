
"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
// Toaster is now in RootLayout
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    // Basic full-page skeleton loader for app layout
    return (
      <div className="flex min-h-screen">
        <div className="w-16 md:w-64 bg-muted p-4 border-r">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-8 w-full mb-3" />
          <Skeleton className="h-8 w-full mb-3" />
          <Skeleton className="h-8 w-full mb-3" />
          <Skeleton className="h-8 w-full mt-auto" />
        </div>
        <main className="flex-1 flex flex-col bg-background">
          <div className="flex-1 p-6 md:p-8 overflow-auto">
             <Skeleton className="h-12 w-1/3 mb-4" />
             <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    // This check is mostly redundant due to useEffect, but good for safety
    // Or you could return a specific "Access Denied" or redirecting message
    return null; 
  }

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
      {/* Toaster moved to RootLayout */}
    </SidebarProvider>
  );
}
