"use client";

import UserProfile from "./UserProfile";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Header Component
 * - Layout only
 * - No business logic
 */
export default function Header({ user, isLoading }) {
    return (
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
            {/* LEFT: Menu icon */}
            {/* <SidebarTrigger className="p-2 rounded-md hover:bg-gray-100 [&>svg.lucide]:hidden">
                <Image src="/MenuFold.svg" alt="Menu" width={18} height={16} />
            </SidebarTrigger> */}
            <SidebarTrigger />

            {/* RIGHT: User profile */}
            <UserProfile user={user} isLoading={isLoading} />
        </div>
    );
}
