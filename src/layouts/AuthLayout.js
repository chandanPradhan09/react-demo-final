"use client";

import Image from "next/image";

export default function AuthLayout({ title, description, children, footer }) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA]">
            <div className="fixed inset-0 z-10 overflow-hidden">
                <Image
                    src="/pnb-bg.png"
                    alt="Background"
                    fill
                    priority
                    className="absolute left-0 top-0 object-none hidden xl:block"
                />
            </div>

            {/* CONTENT */}
            <div className="relative z-10 w-full max-w-md px-4">{children}</div>
        </div>
    );
}
