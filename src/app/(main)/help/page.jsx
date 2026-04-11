"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { post } from "@/lib/apiClient";
import { apiConfig } from "@/lib/apiConfig";

export default function TicketPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [open, setOpen] = useState(false);

    // 🔥 FETCH ALL TICKETS
    const fetchTickets = async () => {
        try {
            setLoading(true);

            const res = await post(apiConfig.endpoints.viewAllTickets, {
                status: "new",
            });

            setTickets(res?.data || []);
        } catch (e) {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 CREATE TICKET
    const handleCreateTicket = async () => {
        if (!subject || !description) return toast("Fill all fields");

        try {
            setLoading(true);

            const res = await post(apiConfig.endpoints.createTicket, {
                body: description,
                subject: subject,
                ticket_form_id: 55401877538841,
                custom_fields: [
                    {
                        id: 900013325983,
                        value: subject,
                    },
                    {
                        id: 32240028334873,
                        value: "qr",
                    },
                    {
                        id: 32240169914009,
                        value: "damaged_qr",
                    },
                    {
                        id: 900013326003,
                        value: description,
                    },
                ],
            });

            if (res?.statusCode === 0) {
                toast("Ticket Created");
                setSubject("");
                setDescription("");
                fetchTickets();
            } else {
                toast.error(res?.status_desc || "Failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getFieldLabel = (id) => {
        switch (id) {
            case 32240028334873:
                return "Issue Type";
            case 32240169914009:
                return "Issue Sub Type";
            case 32240372697497:
                return "Reference ID";
            case 32240502371865:
                return "Mobile Number";
            default:
                return "Field";
        }
    };

    // 🔥 VIEW SINGLE TICKET
    const handleViewTicket = async (id) => {
        try {
            const res = await post(apiConfig.endpoints.viewTicket, {
                ticket_id: id,
            });

            if (res?.statusCode === 0) {
                setSelectedTicket(res.data);
                setOpen(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        document.title = "PNB - Help & Support";
        fetchTickets();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-black">
                Support Tickets
            </h2>

            {/* CREATE TICKET */}
            <Card>
                <CardContent className="space-y-4">
                    <h3 className="font-medium text-base">Create Ticket</h3>

                    <Input
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="text-base"
                    />

                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-base"
                    />

                    <Button
                        onClick={handleCreateTicket}
                        disabled={loading}
                        className="w-full rounded-md text-base"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </Button>
                </CardContent>
            </Card>

            {/* TICKET TABLE */}
            <Card>
                <CardContent className="space-y-4">
                    <h3 className="font-medium text-base">All Tickets</h3>

                    <Table className="text-base">
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {tickets.length ? (
                                tickets.map((t, i) => (
                                    <TableRow key={t.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.subject}</TableCell>
                                        <TableCell>{t.status}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                t.created_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleViewTicket(t.id)
                                                }
                                                className="rounded-md"
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        No Tickets
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* VIEW MODAL */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl text-base">
                    <DialogHeader>
                        <DialogTitle>Ticket #{selectedTicket?.id}</DialogTitle>
                    </DialogHeader>

                    {selectedTicket && (
                        <div className="space-y-6 text-sm">
                            {/* BASIC INFO */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500">Subject</p>
                                    <p className="font-medium">
                                        {selectedTicket.subject}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <p className="font-medium capitalize">
                                        {selectedTicket.status}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Priority</p>
                                    <p className="font-medium">
                                        {selectedTicket.priority || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        Support Type
                                    </p>
                                    <p className="font-medium">
                                        {selectedTicket.support_type || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <p className="text-gray-500 mb-1">
                                    Description
                                </p>
                                <div className="border rounded-md p-3 bg-gray-50">
                                    {selectedTicket.description}
                                </div>
                            </div>

                            {/* TIMELINE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500">Created At</p>
                                    <p>
                                        {new Date(
                                            selectedTicket.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Updated At</p>
                                    <p>
                                        {new Date(
                                            selectedTicket.updated_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* TAGS */}
                            {selectedTicket.tags?.length > 0 && (
                                <div>
                                    <p className="text-gray-500 mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTicket.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 text-xs bg-gray-200 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* IMPORTANT CUSTOM FIELDS */}
                            <div>
                                <p className="text-gray-500 mb-2">Details</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {selectedTicket.custom_fields
                                        ?.filter((f) =>
                                            [
                                                32240028334873, 32240169914009,
                                                32240372697497, 32240502371865,
                                            ].includes(f.id),
                                        )
                                        .map((f) => (
                                            <div key={f.id}>
                                                <p className="text-gray-400 text-xs">
                                                    {getFieldLabel(f.id)}
                                                </p>
                                                <p className="font-medium">
                                                    {f.value || "N/A"}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
