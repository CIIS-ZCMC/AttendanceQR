import React from "react";
import { Button } from "@/components/ui/button";
import { usePage, Link } from "@inertiajs/react";
import { Timer, RotateCcw } from "lucide-react";
import { notOpenStatusContants } from "@/constants/contants";

const NotOpenStatus = () => {
    const { header, description, label } = notOpenStatusContants;
    const page = usePage();

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center ring-4 ring-amber-500/15">
                <Timer className="w-8 h-8" />
            </div>

            <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Upcoming Session
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {header}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {description}
                </p>
            </div>

            <div className="w-full pt-2">
                <Link href={page.url} className="block w-full">
                    <Button
                        type="button"
                        className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>{label || "Check Attendance Again"}</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotOpenStatus;