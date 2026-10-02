import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnomalyStatusContants } from "@/constants/contants";

const AnomalyStatus = () => {
    const { header, description } = AnomalyStatusContants;

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center ring-4 ring-rose-500/15">
                <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Security Warning
                </span>
                <h2 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight leading-snug">
                    {header}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {description}
                </p>
            </div>

            <div className="w-full pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = "/"}
                    className="w-full h-12 rounded-xl text-xs font-semibold active:scale-95 border-rose-200 text-rose-700 hover:bg-rose-50"
                >
                    Acknowledge & Return
                </Button>
            </div>
        </div>
    );
};

export default AnomalyStatus;
