import {
    LayoutDashboard,
    FileText,
    QrCode,
    Settings,
    HelpCircle,
} from "lucide-react";

export const menu = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { name: "Transaction Reports", icon: "reports", path: "/reports" },
    { name: "QR Details", icon: "qr", path: "/qr" },
    { name: "Language Update", icon: "language", path: "/language" },
    { name: "Help & Support", icon: "help", path: "/help" },
];

// export const iconMap = {
//     dashboard: LayoutDashboard,
//     reports: FileText,
//     qr: QrCode,
//     settings: Settings,
//     help: HelpCircle,
// };

export const iconMap = {
    dashboard: "/icons/dashboard",
    reports: "/icons/reports",
    qr: "/icons/qr",
    language: "/icons/language",
    help: "/icons/help",
};
