"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import Avatar from "./Avatar";
import ProfileDialog from "./ProfileDialog";
import { useUserData } from "@/context/UserProvider";

export default function UserProfile({ user, isLoading }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { userData } = useUserData();

    const name = user?.name || "User";

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <Avatar name={name} isLoading={isLoading} />

                        <span className="text-sm font-medium text-gray-700">
                            {isLoading ? "Loading..." : name}
                        </span>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-32">
                    {/* OPEN MODAL INSTEAD OF ROUTE */}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpen(true);
                        }}
                        className="cursor-pointer text-base p-2"
                    >
                        View Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-500 cursor-pointer text-base p-2"
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* MODAL */}
            <ProfileDialog
                open={open}
                setOpen={setOpen}
                user={user}
                userData={userData}
            />
        </>
    );
}
