
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_ITEMS_MAIN, NAV_ITEMS_FOOTER, PLACEHOLDER_USER } from "@/lib/constants";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/icons/app-logo";
import { LogOut } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

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
                onClick={() => {
                  // Placeholder for logout logic
                  // Typically, you would redirect to /login or call an API
                  console.log("Logout clicked");
                  // router.push('/login'); // if using useRouter
                }}
              >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="flex items-center gap-3 p-2 mt-4 rounded-lg bg-muted group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:mt-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={PLACEHOLDER_USER.avatar} alt={PLACEHOLDER_USER.name} data-ai-hint="profile person" />
            <AvatarFallback>{PLACEHOLDER_USER.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">{PLACEHOLDER_USER.name}</p>
            <p className="text-xs text-muted-foreground">{PLACEHOLDER_USER.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
