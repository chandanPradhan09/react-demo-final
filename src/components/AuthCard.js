"use client";

import Image from "next/image";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export default function AuthCard({ title, description, children, footer }) {
    return (
        <Card className="w-full max-w-md shadow-[0_0_25px_rgba(0,0,0,0.15)] border p-5 bg-white">
            {/* HEADER */}
            <CardHeader className="items-center text-center space-y-3">
                <div className="w-full flex items-center justify-center">
                    <Image
                        src="/pnbLogo.svg"
                        alt="PNB"
                        width={127}
                        height={52}
                        priority
                    />
                </div>

                {title && (
                    <CardTitle className="text-2xl font-bold">
                        {title}
                    </CardTitle>
                )}

                {description && (
                    <CardDescription className="text-base">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>

            {/* BODY */}
            <CardContent className="space-y-4">{children}</CardContent>

            {/* FOOTER */}
            {footer && (
                <CardFooter className="flex flex-col gap-3">
                    {footer}
                </CardFooter>
            )}
        </Card>
    );
}
