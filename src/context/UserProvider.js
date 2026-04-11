"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { post } from "@/lib/apiClient";
import { apiConfig } from "@/lib/apiConfig";

const UserContext = createContext();

export function UserProvider({ children, user }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!user?.user_name || fetched) return;

        async function fetchUserData() {
            try {
                setLoading(true);

                const res = await post(apiConfig.endpoints.fetchUserDetails, {
                    mobile_number: user.user_name,
                });

                setUserData(res);
                setFetched(true);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [user?.user_name, fetched]);

    return (
        <UserContext.Provider value={{ userData, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserData = () => useContext(UserContext);
