// app/(main)/layout.js
"use client";

import { useUser } from "@/components/header/useUser";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserProvider";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function Layout({ children }) {
    const { user, isLoading } = useUser();
    return (
        <SidebarProvider>
            <TooltipProvider>
                <UserProvider user={user}>
                    <DashboardLayout user={user} isLoading={isLoading}>
                        {children}
                    </DashboardLayout>
                </UserProvider>
            </TooltipProvider>
        </SidebarProvider>
    );
}
