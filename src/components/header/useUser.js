"use client";

import { useSession } from "next-auth/react";

/**
 * Custom hook to manage user session logic
 * Keeps components clean and reusable
 */
export function useUser() {
    const { data: session, status } = useSession();

    return {
        user: session?.user || null,
        isLoading: status === "loading",
    };
}
