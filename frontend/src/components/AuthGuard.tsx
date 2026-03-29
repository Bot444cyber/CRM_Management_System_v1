"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.replace("/login");
        } else {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background transition-colors duration-500 overflow-hidden">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                            <Zap size={28} className="text-primary animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="space-y-3 text-center">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-[0.5em] animate-in fade-in slide-in-from-bottom-2 duration-700">
                        Synchronizing Identity
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
                        Verifying Secure Uplink...
                    </p>
                </div>
                {/* Subtle Backdrop Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
            </div>
        );
    }

    return <>{children}</>;
}
