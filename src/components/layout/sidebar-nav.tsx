
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_ITEMS_MAIN, NAV_ITEMS_FOOTER } from "@/lib/constants";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLogo } from "@/components/icons/app-logo";
import { LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUser, logout, loading: authLoading } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <AppLogo className="h-8 w-8 text-primary" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {NAV_ITEMS_MAIN.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="justify-start"
                disabled={authLoading}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto">
        <SidebarMenu>
           {NAV_ITEMS_FOOTER.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="justify-start"
                disabled={authLoading}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator />
           <SidebarMenuItem>
              <SidebarMenuButton
                variant="ghost"
                className="justify-start w-full group-data-[collapsible=icon]:justify-center"
                tooltip="Logout"
                onClick={logout}
                disabled={authLoading}
              >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="flex items-center gap-3 p-2 mt-4 rounded-lg bg-muted group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mt-2">
          {authLoading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="group-data-[collapsible=icon]:hidden space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </>
          ) : currentUser ? (
            <>
              <Avatar className="h-10 w-10">
                {currentUser.photoURL ? (
                  <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || currentUser.email || 'User'} data-ai-hint="profile person" />
                ) : (
                   <UserCircle2 className="h-10 w-10 text-muted-foreground" /> // Placeholder icon
                )}
                <AvatarFallback>{getInitials(currentUser.displayName || currentUser.email)}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold truncate max-w-[150px]" title={currentUser.displayName || currentUser.email || undefined}>
                  {currentUser.displayName || currentUser.email}
                </p>
                {currentUser.displayName && currentUser.email && (
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={currentUser.email}>
                    {currentUser.email}
                  </p>
                )}
              </div>
            </>
          ) : (
             <>
              <Avatar className="h-10 w-10">
                 <UserCircle2 className="h-10 w-10 text-muted-foreground" />
                <AvatarFallback>??</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold">Not Logged In</p>
              </div>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
