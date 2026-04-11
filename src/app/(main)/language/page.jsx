"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useUserData } from "@/context/UserProvider";
import { get, post } from "@/lib/apiClient";
import { apiConfig } from "@/lib/apiConfig";

import { Check } from "lucide-react";

export default function LanguageUpdateUI() {
    const [open, setOpen] = useState(false);

    const { userData } = useUserData();

    const merchantData = userData?.data
        ? Array.isArray(userData.data)
            ? userData.data
            : [userData.data]
        : [];

    const [selectedVpa, setSelectedVpa] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState("N/A");
    const [languageOptions, setLanguageOptions] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState("");

    const [loadingLang, setLoadingLang] = useState(false);
    const [updating, setUpdating] = useState(false);

    // APIs
    const getLanguage = async (deviceSerial) => {
        const res = await get(
            apiConfig.endpoints.currentLanguage + "/" + deviceSerial,
        );
        return res?.data || "ENGLISH";
    };

    const getLanguageOptions = async () => {
        const res = await get(apiConfig.endpoints.fetchLanguage);
        return res?.data || [];
    };

    const updateLanguage = async (deviceSerial, language) => {
        const res = await post(apiConfig.endpoints.updateLanguage, {
            tid: deviceSerial,
            update_language: language,
        });
        return res?.data || [];
    };

    // Default VPA
    useEffect(() => {
        document.title = "PNB - Language";
        if (merchantData.length > 0) {
            setSelectedVpa(merchantData[0].vpa_id);
        }
    }, [userData]);

    const selectedMerchant =
        merchantData.find((m) => m.vpa_id === selectedVpa) || null;

    // Fetch current language
    useEffect(() => {
        const fetchLanguage = async () => {
            if (!selectedMerchant?.serial_number) return;

            try {
                setLoadingLang(true);
                const lang = await getLanguage(selectedMerchant.serial_number);
                setCurrentLanguage(lang);
            } catch (e) {
                console.error(e);
                setCurrentLanguage("N/A");
            } finally {
                setLoadingLang(false);
            }
        };

        fetchLanguage();
    }, [selectedMerchant]);

    // Fetch language options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const options = await getLanguageOptions();
                setLanguageOptions(options);
            } catch (e) {
                console.error(e);
            }
        };

        fetchOptions();
    }, []);

    // Update handler
    const handleUpdate = async () => {
        if (!selectedMerchant?.serial_number || !selectedLanguage) return;

        try {
            setUpdating(true);

            await updateLanguage(
                selectedMerchant.serial_number,
                selectedLanguage,
            );

            const updatedLang = await getLanguage(
                selectedMerchant.serial_number,
            );
            setCurrentLanguage(updatedLang);

            setSelectedLanguage("");
            setOpen(true);
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="bg-gray-50">
            <div className="p-2 mx-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Language Update
                </h2>

                <div className="border rounded-md p-6 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        {/* VPA */}
                        <div>
                            <label className="text-xs text-gray-500">
                                VPA ID
                            </label>
                            <select
                                className="w-full mt-1 h-10 px-3 border rounded-md"
                                value={selectedVpa}
                                onChange={(e) => setSelectedVpa(e.target.value)}
                            >
                                <option value="">Select VPA</option>
                                {merchantData.map((m, i) => (
                                    <option key={i} value={m.vpa_id}>
                                        {m.vpa_id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Serial */}
                        <div>
                            <label className="text-xs text-gray-500">
                                Device Serial Number
                            </label>
                            <input
                                className="w-full mt-1 h-10 px-3 border rounded-md bg-gray-100"
                                value={selectedMerchant?.serial_number || ""}
                                readOnly
                            />
                        </div>

                        {/* Current Language */}
                        <div>
                            <label className="text-xs text-gray-500">
                                Current Language
                            </label>
                            <input
                                className="w-full mt-1 h-10 px-3 border rounded-md bg-gray-100"
                                value={
                                    loadingLang
                                        ? "Fetching..."
                                        : currentLanguage
                                }
                                readOnly
                            />
                        </div>

                        {/* Language Dropdown */}
                        <div>
                            <label className="text-xs text-gray-500">
                                Language Update
                            </label>
                            <select
                                className="w-full mt-1 h-10 px-3 border rounded-md"
                                value={selectedLanguage}
                                onChange={(e) =>
                                    setSelectedLanguage(e.target.value)
                                }
                            >
                                <option value="">Select Language</option>
                                {languageOptions.map((lang, i) => (
                                    <option key={i} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-8">
                        <Button variant="link">Cancel</Button>

                        <Button
                            className="px-6 rounded-md"
                            disabled={
                                !selectedVpa || !selectedLanguage || updating
                            }
                            onClick={handleUpdate}
                        >
                            {updating ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTitle className="hidden">
                    <p>hello</p>
                </DialogTitle>
                <DialogContent className="p-0 overflow-hidden max-w-md rounded-lg [&>button]:hidden">
                    {/* Top Content */}
                    <div className="bg-white border-b px-6 py-8 text-center">
                        <h2 className="text-lg font-semibold text-gray-800 leading-snug">
                            Language update request <br />
                            Initiated Successfully
                        </h2>

                        {/* Green Circle Check */}
                        <div className="flex justify-center mt-6">
                            <div className="relative flex items-center justify-center">
                                {/* Outer Ring */}
                                <div className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center">
                                    {/* Inner Circle */}
                                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                                        <Check className="text-white w-8 h-8 stroke-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Button */}
                    <div className="p-4 bg-white">
                        <Button
                            className="w-full rounded-md"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
