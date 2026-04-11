"use client";

import { getInitials, stringToColor } from "@/lib/user.utils";

/**
 * Avatar component
 * - Shows initials
 * - Handles loading skeleton
 */
export default function Avatar({ name, isLoading }) {
    const initials = getInitials(name);
    const bgColor = stringToColor(name);

    return (
        <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold ${
                isLoading ? "bg-gray-300 animate-pulse" : ""
            }`}
            style={!isLoading ? { backgroundColor: bgColor } : {}}
        >
            {!isLoading ? initials : ""}
        </div>
    );
}
