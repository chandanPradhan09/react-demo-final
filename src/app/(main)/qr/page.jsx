"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserProvider";
import { post } from "@/lib/apiClient";
import { apiConfig } from "@/lib/apiConfig";
import Image from "next/image";
import { toast } from "sonner";

export default function QrDetailsCard() {
    const [qrType, setQrType] = useState("static");
    const [amount, setAmount] = useState("");
    const [selectedVpa, setSelectedVpa] = useState("");
    const [secondsRemaining, setSecondsRemaining] = useState(120);

    const [qrImage, setQrImage] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔥 CACHE: { vpa_id: image }
    const [staticQrCache, setStaticQrCache] = useState({});

    const { userData } = useUserData();

    const merchantData = userData?.data
        ? Array.isArray(userData.data)
            ? userData.data
            : [userData.data]
        : [];

    useEffect(() => {
        document.title = "PNB - QR Details";
        if (merchantData.length > 0) {
            setSelectedVpa(merchantData[0].vpa_id);
        }
    }, [userData]);

    const selectedMerchant =
        merchantData.find((m) => m.vpa_id === selectedVpa) || null;

    function formatCountdown(secondsLeft) {
        const safeSeconds = Math.max(0, secondsLeft);
        const minutes = Math.floor(safeSeconds / 60);
        const seconds = safeSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
    const toPngDataUrl = (base64Image) => {
        if (!base64Image || typeof base64Image !== "string") return "";
        if (base64Image.startsWith("data:image")) return base64Image;
        return `data:image/png;base64,${base64Image}`;
    };

    const getStaticQrImage = async (qrString) => {
        try {
            const response = await post(apiConfig.endpoints.staticQr, {
                qrString,
            });
            return response?.base64Image || response?.data?.base64Image || "";
        } catch (err) {
            console.error("QR API failed", err);
            return "";
        }
    };

    // 🔥 AUTO FETCH STATIC QR (WITH CACHE)
    useEffect(() => {
        if (qrType !== "static" || !selectedMerchant) return;

        const cached = staticQrCache[selectedMerchant.vpa_id];

        if (cached) {
            setQrImage(cached);
            return;
        }

        const fetchStaticQr = async () => {
            setLoading(true);
            try {
                const qrString = selectedMerchant.qr_string;
                const base64 = await getStaticQrImage(qrString);
                const imageUrl = toPngDataUrl(base64);

                // save in cache
                setStaticQrCache((prev) => ({
                    ...prev,
                    [selectedMerchant.vpa_id]: imageUrl,
                }));

                setQrImage(imageUrl);
            } finally {
                setLoading(false);
            }
        };

        fetchStaticQr();
    }, [qrType, selectedMerchant]);

    // 🔥 DYNAMIC QR
    const handleGenerateDynamic = async () => {
        if (!selectedMerchant) return toast.error("No merchant selected");
        if (!amount) return toast.error("Amount is required");

        setLoading(true);
        setQrImage("");

        try {
            setQrImage("/dummy-qr.png");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 DOWNLOAD
    const handleDownloadStaticQr = () => {
        if (!qrImage) return alert("QR not available");

        const link = document.createElement("a");
        link.href = qrImage;
        link.download = `static-qr-${selectedMerchant?.vpa_id}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (qrType !== "dynamic" || !qrImage) return;

        setSecondsRemaining(120); // reset when new QR comes

        const timer = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setQrImage(""); // expire QR
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer); // cleanup (VERY IMPORTANT)
    }, [qrType, qrImage]);

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                QR Details
            </h2>

            <div className="flex flex-col gap-4">
                {/* 🔹 CARD 1 */}
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-base text-muted-foreground mb-2">
                                Select The Type of QR
                            </p>

                            <RadioGroup
                                value={qrType}
                                onValueChange={(val) => {
                                    setQrType(val);
                                    setQrImage(""); // only reset for dynamic
                                }}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="static"
                                        id="static"
                                    />
                                    <Label
                                        htmlFor="static"
                                        className="cursor-pointer text-base"
                                    >
                                        Static
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="dynamic"
                                        id="dynamic"
                                    />
                                    <Label
                                        htmlFor="dynamic"
                                        className="cursor-pointer text-base"
                                    >
                                        Dynamic
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* 🔹 DYNAMIC INPUT */}
                        {qrType === "dynamic" && (
                            <div className="flex gap-3">
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleGenerateDynamic();
                                        }
                                    }}
                                    className="text-base max-w-80"
                                />

                                <Button
                                    onClick={handleGenerateDynamic}
                                    disabled={loading}
                                    className="text-base rounded-md"
                                >
                                    {loading ? "Generating..." : "Generate QR"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 🔹(QR DISPLAY) */}
                {(qrType === "static" || (qrType === "dynamic" && qrImage)) && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-2">
                            {/* 🔥 LOADER */}
                            {loading && (
                                <div className="w-64 h-64 animate-pulse bg-gray-200 rounded-md" />
                            )}

                            {/* 🔥 QR IMAGE */}
                            {!loading && qrImage && (
                                <Image
                                    src={qrImage}
                                    alt="QR Code"
                                    width={220}
                                    height={220}
                                    className="border rounded-md"
                                />
                            )}

                            {/* DOWNLOAD */}
                            {qrType === "static" && qrImage && !loading && (
                                <Button
                                    className="mt-4 text-sm rounded-md"
                                    onClick={handleDownloadStaticQr}
                                >
                                    Download QR
                                </Button>
                            )}
                            {qrType === "dynamic" && qrImage && !loading && (
                                <p className="text-base pt-2 text-red-500 font-medium">
                                    Valid till :{" "}
                                    {formatCountdown(secondsRemaining)}
                                </p>
                            )}

                            <div className="flex flex-col items-center justify-center">
                                <p className="mt-4 text-sm text-muted-foreground">
                                    POWERED BY
                                </p>
                                <Image
                                    src="/upilogo.png"
                                    alt="upi"
                                    width={127}
                                    height={52}
                                    className="-mt-3"
                                    priority
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
