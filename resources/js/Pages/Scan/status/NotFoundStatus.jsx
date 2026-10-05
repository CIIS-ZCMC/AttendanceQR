import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { AlertCircle, MapPin, Clock, RotateCcw, QrCode, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFoundStatusContants } from "@/constants/contants";
import QRScannerModal from "@/Components/ui/CustomComponent/QRScannerModal";

const NotFoundStatus = ({ activeMapLocation }) => {
    const { header, description } = notFoundStatusContants;
    const [scannerOpen, setScannerOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <QRScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
            />

            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center ring-4 ring-slate-200/50">
                <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Session Inactive
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {header}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {description}
                </p>
            </div>

            {activeMapLocation && (
                <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{activeMapLocation.location}</span>
                    </div>
                    {activeMapLocation.description && (
                        <p className="text-[11px] text-slate-500">
                            {activeMapLocation.description}
                        </p>
                    )}
                    {activeMapLocation.open_time && activeMapLocation.closing_time && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium pt-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                                Scheduled: {activeMapLocation.open_time?.slice(0, 5)} —{" "}
                                {activeMapLocation.closing_time?.slice(0, 5)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="w-full space-y-2 pt-1">
                {/* Primary Action: Launch Camera QR Scanner */}
                <Button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="w-full h-13 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <QrCode className="w-4 h-4" />
                    <span>Scan Station QR Code</span>
                </Button>

                {/* Secondary Action: Reload Current Link */}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => (window.location.href = "/")}
                    className="w-full h-10 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    <span>Reload Current Page</span>
                </Button>
            </div>
        </div>
    );
};

export default NotFoundStatus;