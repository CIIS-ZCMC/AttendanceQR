import React from "react";
import { Link } from "@inertiajs/react";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordedStatusContants } from "@/constants/contants";

const RecordedStatus = () => {
    const { header, description } = recordedStatusContants;

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center animate-pulse-subtle">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Success • Logged
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {header}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {description}
                </p>
            </div>

            <div className="w-full pt-2">
                <Link href="/my-attendance" className="block w-full">
                    <Button
                        type="button"
                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Clock className="w-4 h-4" />
                        <span>View My Attendance Logs</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default RecordedStatus;
