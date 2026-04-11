import AuthLayout from "@/layouts/AuthLayout";
import AuthCard from "@/components/AuthCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <AuthLayout>
            <AuthCard
                title="404 - Page Not Found"
                description="The page you are looking for does not exist."
            >
                <Link href="/dashboard">
                    <Button className="w-full cursor-pointer rounded-xl">
                        Go to Home
                    </Button>
                </Link>
            </AuthCard>
        </AuthLayout>
    );
}
