"use client";

import { useEffect, useMemo, useState } from "react";
import { apiConfig } from "@/lib/apiConfig";
import { post } from "@/lib/apiClient";
import { useUserData } from "@/context/UserProvider";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const monthlyOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const reportColumns = [
    { key: "Account_Number", label: "Account Number" },
    { key: "VPA_ID", label: "VPA ID" },
    { key: "Date_&_Time", label: "Date & Time" },
    { key: "Transaction_Amount", label: "Amount" },
    { key: "Transaction_Id", label: "Txn ID" },
    { key: "RRN", label: "RRN" },
];

export default function ReportsPage() {
    const { userData } = useUserData();

    const today = new Date().toISOString().split("T")[0];

    const [filterType, setFilterType] = useState("today");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [monthlySelection, setMonthlySelection] = useState("January");

    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const user = userData?.data?.[0];

    const formatToDDMMYYYY = (date) => {
        if (!date) return "";
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const fetchReports = async () => {
        if (!user?.vpa_id) return;

        try {
            setLoading(true);

            const res = await fetch(
                apiConfig.endpoints.reportsQuerySubmitUser,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        startDate: formatToDDMMYYYY(startDate),
                        endDate: formatToDDMMYYYY(endDate),
                        vpa_id: user.vpa_id,
                        mode: "both",
                    }),
                },
            );

            const data = await res.json();
            setRows(data?.data || []);
        } catch (e) {
            console.error(e);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "PNB - Reports";
        if (filterType === "today") {
            const todayDate = new Date().toISOString().split("T")[0];

            setStartDate(todayDate);
            setEndDate(todayDate);

            fetchReports(todayDate, todayDate);
        }
    }, [filterType]);

    const filteredRows = useMemo(() => {
        if (!search) return rows;
        return rows.filter((row) =>
            Object.values(row).some((val) =>
                String(val).toLowerCase().includes(search.toLowerCase()),
            ),
        );
    }, [rows, search]);

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Transaction Reports
            </h2>

            {/* FILTER CARD */}
            <Card>
                <CardContent className="space-y-4">
                    {/* FILTER TYPE */}
                    <p className="text-base text-gray-500">
                        Select a Report Filter
                    </p>
                    <RadioGroup
                        value={filterType}
                        onValueChange={setFilterType}
                        className="flex gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="today" id="today" />
                            <Label
                                htmlFor="today"
                                className="cursor-pointer text-base"
                            >
                                Today
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label
                                htmlFor="monthly"
                                className="cursor-pointer  text-base"
                            >
                                Monthly
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label
                                htmlFor="custom"
                                className="cursor-pointer text-base"
                            >
                                Custom Range
                            </Label>
                        </div>
                    </RadioGroup>

                    {/* CONDITIONAL FILTER */}
                    {filterType === "custom" && (
                        <div>
                            <div className="flex sm:max-w-78 lg:max-w-98 justify-between">
                                <p className="text-base pb-2">Start Date</p>
                                <p className="text-base pb-2">End Date</p>
                            </div>
                            <div className="flex gap-4 max-w-180">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="text-base"
                                />
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-base"
                                />
                                <Button
                                    onClick={fetchReports}
                                    disabled={loading}
                                    className="rounded-md"
                                >
                                    {loading ? "Loading..." : "Submit"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {filterType === "monthly" && (
                        <div>
                            <p className="text-base pb-2">Monthly</p>
                            <div className="flex gap-2">
                                <Select onValueChange={setMonthlySelection}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthlyOptions.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={fetchReports}
                                    disabled={loading}
                                    className="rounded-md"
                                >
                                    {loading ? "Loading..." : "Submit"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* TABLE CARD */}
            <Card>
                <CardContent className="space-y-4">
                    {/* SEARCH */}
                    <div className="flex justify-between">
                        <Input
                            placeholder="Search..."
                            className="w-[250px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <Button>Download</Button>
                    </div>

                    {/* TABLE */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                {reportColumns.map((col) => (
                                    <TableHead key={col.key}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredRows.length ? (
                                filteredRows.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{i + 1}</TableCell>
                                        {reportColumns.map((col) => (
                                            <TableCell key={col.key}>
                                                {row[col.key] || "-"}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center"
                                    >
                                        No Data
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
