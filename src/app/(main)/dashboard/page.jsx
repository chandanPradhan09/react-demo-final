"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { ArrowLeftRight, Banknote } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserData } from "@/context/UserProvider";

export default function DashboardPage() {
    const { userData, loading } = useUserData();

    const [selectedVpa, setSelectedVpa] = useState("");
    const [dateFilter, setDateFilter] = useState("today");

    const [stats, setStats] = useState({
        totalTxn: "20.7K",
        totalAmount: "76,000 cr",
    });

    /* ================= DERIVED DATA (NO STATE) ================= */

    const merchantData = userData?.data
        ? Array.isArray(userData.data)
            ? userData.data
            : [userData.data]
        : [];

    const vpaList = merchantData.length
        ? [...new Set(merchantData.map((m) => m.vpa_id))]
        : [];

    /* ================= DEFAULT VPA SET (SAFE) ================= */

    const effectiveVpa =
        selectedVpa || (merchantData.length > 0 ? merchantData[0].vpa_id : "");

    /* ================= FETCH STATS ================= */

    useEffect(() => {
        document.title = "PNB - Dashboard";
        if (!selectedVpa) return;

        async function fetchStats() {
            try {
                const data = {
                    totalTxn: "20.7K",
                    totalAmount: "76,000 cr",
                };

                setStats({
                    totalTxn: data.totalTxn || "0",
                    totalAmount: data.totalAmount || "0",
                });
            } catch (err) {
                console.error(err);
            }
        }

        fetchStats();
    }, [selectedVpa, dateFilter]);

    return (
        <>
            {/* ================= TOP BAR ================= */}
            <div className="flex items-center justify-between mb-6">
                {loading ? (
                    <>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-15" />
                            <Skeleton className="h-9 w-55" />
                        </div>

                        <Skeleton className="h-9 w-35" />
                    </>
                ) : (
                    <>
                        {/* VPA Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                VPA ID :
                            </span>

                            <Select
                                value={effectiveVpa}
                                onValueChange={setSelectedVpa}
                            >
                                <SelectTrigger className="w-55 h-9 text-sm">
                                    <SelectValue placeholder="Select VPA" />
                                </SelectTrigger>

                                <SelectContent>
                                    {vpaList.map((vpa) => (
                                        <SelectItem key={vpa} value={vpa}>
                                            {vpa}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Filter */}
                        <Select
                            value={dateFilter}
                            onValueChange={setDateFilter}
                        >
                            <SelectTrigger className="w-35 h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">
                                    Yesterday
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                )}
            </div>

            {/* ================= CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Total No Of Transaction"
                            value={stats.totalTxn}
                            icon={<ArrowLeftRight size={18} />}
                        />

                        <StatCard
                            title="Total Amount"
                            value={stats.totalAmount}
                            icon={<Banknote size={18} />}
                        />
                    </>
                )}
            </div>
        </>
    );
}

/* ================= SKELETON ================= */

function StatCardSkeleton() {
    return (
        <div className="rounded-xl border bg-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />

                <div className="space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>

            <Skeleton className="h-6 w-15" />
        </div>
    );
}
