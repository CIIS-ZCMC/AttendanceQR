import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Mail,
    Building2,
    Clock,
    ArrowLeft,
    LoaderCircle,
    CheckCircle2,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Summary({
    anomaly,
    employeeID,
    processing,
    data,
    setData,
    showSummary,
    setShowSummary,
    handleSubmitAttendance,
}) {
    if (!showSummary) return null;

    const initials =
        showSummary?.name
            ?.split(" ")
            .map((n) => n[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "ID";

    const handleBack = () => {
        setShowSummary(null);
        setData({
            ...data,
            employeeId: employeeID,
            area: null,
            is_no_employee_id: false,
        });
    };

    useEffect(() => {
        if (showSummary) {
            toast.info("Please review your details carefully, then tap Submit.");
        }
    }, [showSummary]);

    const formattedTime = showSummary.first_entry
        ? new Date(showSummary.first_entry).toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : new Date().toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              month: "short",
              day: "numeric",
              year: "numeric",
          });

    return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Navigation / Back */}
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-slate-600 hover:text-slate-900 active:scale-95 pl-1"
                    onClick={handleBack}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Change ID</span>
                </Button>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ID Verified</span>
                </div>
            </div>

            {/* Digital Badge Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                {/* Header Strip */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 pt-6 pb-8 text-white relative">
                    <div className="flex items-center justify-between text-xs font-medium text-blue-100 uppercase tracking-wider mb-3">
                        <span>ZCMC Attendance Pass</span>
                        <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                            Official Log
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Initials Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-white text-blue-700 font-extrabold text-xl flex items-center justify-center shadow-lg shrink-0 ring-4 ring-white/20">
                            {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight truncate">
                                {showSummary.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="inline-flex items-center font-mono text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-md text-white backdrop-blur-sm">
                                    ID: {showSummary.employee_id}
                                </span>
                                {showSummary.sector && (
                                    <span className="text-[11px] bg-blue-900/40 text-blue-100 px-2 py-0.5 rounded-md border border-white/10 truncate max-w-[140px]">
                                        {showSummary.sector}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-4">
                    <div className="space-y-3">
                        {/* Area */}
                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Assigned Area
                                </span>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block truncate">
                                    {showSummary.area || "General Campus"}
                                </span>
                                {showSummary.areacode && (
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                                        {showSummary.areacode}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        {showSummary.email && (
                            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Email Address
                                    </span>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 block truncate">
                                        {showSummary.email}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                                    Check-In Timestamp
                                </span>
                                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300 block">
                                    {formattedTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                            onClick={handleSubmitAttendance}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    <span>Recording Attendance...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>Confirm & Submit Attendance</span>
                                </>
                            )}
                        </Button>

                        <p className="text-[11px] text-slate-400 text-center mt-2.5">
                            By tapping submit, this official timestamp is recorded.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}