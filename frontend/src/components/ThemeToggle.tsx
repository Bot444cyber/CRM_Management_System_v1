"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9 rounded-md border border-border" />; // Placeholder
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-9 h-9 flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors overflow-hidden group"
            aria-label="Toggle theme"
        >
            <div className="relative flex items-center justify-center w-full h-full">
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all absolute rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-slate-100" />
            </div>
        </button>
    );
}
