import AuthCard from "@/components/AuthCard";
import AuthLayout from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export const metadata = {
    title: "Login",
};

export default function LoginPage() {
    return (
        // <div className="flex h-screen items-center justify-center">
        <AuthLayout>
            <AuthCard
                title="Login"
                description="Please sign in to continue to the application."
            >
                <form
                    action={async () => {
                        "use server";
                        await signIn("authentik", {
                            callbackUrl: "/dashboard",
                        });
                    }}
                >
                    <Button
                        type="submit"
                        className="w-full border py-2 rounded-lg cursor-pointer"
                    >
                        Login with Authentik
                    </Button>
                </form>
            </AuthCard>
        </AuthLayout>
        // </div>
    );
}
