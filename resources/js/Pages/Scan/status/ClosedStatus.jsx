import React from "react";
import { Link } from "@inertiajs/react";
import { Lock, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { closedStatusContants } from "@/constants/contants";

const ClosedStatus = () => {
    const { header, description } = closedStatusContants;

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center ring-4 ring-slate-200/50 dark:ring-slate-800/50">
                <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Session Closed
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {header}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {description}
                </p>
            </div>

            <div className="w-full pt-2 flex flex-col gap-2">
                <Link href="/my-attendance" className="block w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl text-xs font-semibold active:scale-95"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Check Past Attendances</span>
                    </Button>
                </Link>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => window.location.reload()}
                    className="w-full h-10 text-xs text-slate-500 hover:text-slate-800"
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    <span>Check again</span>
                </Button>
            </div>
        </div>
    );
};

export default ClosedStatus;
