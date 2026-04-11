"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Row Component (clean + reusable)
 */
function InfoRow({ label, value }) {
    return (
        <div className="grid grid-cols-2 text-sm py-2">
            <span className="text-gray-400">{label}</span>
            <span className="font-medium text-gray-700 text-left">{value}</span>
        </div>
    );
}

/**
 * Section Card (matches UI blocks)
 */
function Section({ title, children }) {
    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                {title}
            </div>

            {/* Content */}
            <div className="px-4">{children}</div>
        </div>
    );
}

export default function ProfileDialog({ open, setOpen, user, userData }) {
    const userDetails = userData?.data[0] || {};
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden rounded-xs [&>button]:hidden">
                {/* HEADER */}
                <DialogHeader className="px-6 py-2 border-b">
                    <DialogTitle className="text-base font-semibold text-gray-800">
                        View Profile Details
                    </DialogTitle>
                </DialogHeader>

                {/* BODY */}
                <div className="px-6 space-y-2">
                    {/* BASIC INFO */}
                    <Section title="Basic Information">
                        <InfoRow label="Name" value={user?.name || "—"} />
                        <InfoRow label="Phone" value={user?.user_name || "—"} />
                    </Section>

                    {/* DEVICE INFO */}
                    <Section title="Device Information">
                        <InfoRow
                            label="Device Serial Number"
                            value={userDetails?.serial_number || "—"}
                        />
                        <InfoRow
                            label="Linked Account Number"
                            value={userDetails?.merchant_account_no || "—"}
                        />
                        <InfoRow
                            label="UPI ID"
                            value={userDetails?.vpa_id || "—"}
                        />
                        <InfoRow
                            label="IFSC Code"
                            value={userDetails?.ifsc || "—"}
                        />
                        <InfoRow
                            label="Merchant ID"
                            value={userDetails?.merchant_id || "—"}
                        />
                        <InfoRow
                            label="Merchant Mobile Number"
                            value={userDetails?.merchant_mobile || "—"}
                        />
                        <InfoRow
                            label="Network Type"
                            value={userDetails?.network_type || "—"}
                        />
                        <InfoRow
                            label="Device Status"
                            value={userDetails?.device_status || "—"}
                        />
                        <InfoRow
                            label="Mapping Status"
                            value={userDetails?.mapping_status || "—"}
                        />
                        <InfoRow
                            label="QR Type"
                            value={userDetails?.qr_type || "—"}
                        />
                    </Section>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end px-6 py-2 border-t">
                    <Button
                        onClick={() => setOpen(false)}
                        className="rounded-lg cursor-pointer"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
