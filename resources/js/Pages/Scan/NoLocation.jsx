import React, { useEffect, useState } from "react";
import { MapPinOff, QrCode } from "lucide-react";
import Header from "@/layouts/Header";
import { Button } from "@/components/ui/button";
import QRScannerModal from "@/Components/ui/CustomComponent/QRScannerModal";

export default function NoLocation() {
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("attendanceToken");
        if (savedToken) {
            window.location.href = `/?token=${savedToken}`;
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <Header />
            <QRScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
            />

            <div className="flex items-center justify-center p-6 pt-20">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                            <MapPinOff className="w-10 h-10 text-red-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                            No Attendance Location
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            No attendance or location of attendance was included.
                        </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-2xl p-4 text-left">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                            Please scan the QR code provided at the attendance area or use the link shared by your administrator to access the attendance page.
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            className="w-full h-13 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <QrCode className="w-4 h-4" />
                            <span>Scan Station QR Code</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
