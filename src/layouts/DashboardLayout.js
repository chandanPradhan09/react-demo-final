"use client";

import Sidebar from "@/components/AppSidebar";
import Header from "@/components/header/Header";

export default function DashboardLayout({ children, user, isLoading }) {
    return (
        <div className="flex h-screen w-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header user={user} isLoading={isLoading} />
                <div className="flex-1 p-4 bg-gray-50">{children}</div>
            </div>
        </div>
    );
}
