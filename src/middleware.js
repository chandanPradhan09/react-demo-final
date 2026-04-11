import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    if (pathname === "/login") {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
    ],
};
