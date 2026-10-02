import React, { useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Building2, UserPlus, Info, CheckCircle2 } from "lucide-react";

export default function NoEmployeeID({
    googleName,
    setNoEmployeeID,
    handleSaveNoEmployeeID,
    setData,
    data,
}) {
    useEffect(() => {
        setData({ ...data, name: googleName, is_no_employee_id: true });
    }, [googleName]);

    return (
        <div className="w-full max-w-sm mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-slate-600 hover:text-slate-900 active:scale-95 pl-1"
                    onClick={() => {
                        setNoEmployeeID(false);
                        setData({ ...data, name: null, area: null, is_no_employee_id: false });
                    }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to ID Entry</span>
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                        <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">New Employee / Trainee Registration</h3>
                    <p className="text-xs text-amber-100 mt-1">
                        Attendance requires an active UMIS Employee Profile
                    </p>
                </div>

                <div className="p-5 space-y-4 text-left">
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Building2 className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>Visit IMISS Office</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="font-semibold text-slate-900 dark:text-white">Tower 1 Building, Ground Floor</span>
                            <br />
                            <span className="text-slate-500 text-[11px]">(Near the main hospital entrance)</span>
                        </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Our staff will assist you with biometric registration and account setup.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Once registered, your daily attendance will be logged automatically.</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl border-slate-300 font-semibold text-xs active:scale-95"
                        onClick={() => {
                            setNoEmployeeID(false);
                            setData({ ...data, name: null, area: null, is_no_employee_id: false });
                        }}
                    >
                        Return to ID Login
                    </Button>
                </div>
            </div>
        </div>
    );
}
