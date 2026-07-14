import React, { useEffect } from "react";
import { MapPinOff } from "lucide-react";
import Header from "@/layouts/Header";

export default function NoLocation() {
    useEffect(() => {
        const savedToken = localStorage.getItem("attendanceToken");
        if (savedToken) {
            window.location.href = `/?token=${savedToken}`;
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex items-center justify-center p-6 pt-20">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                            <MapPinOff className="w-10 h-10 text-red-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                            No Attendance Location
                        </h1>
                        <p className="text-sm text-gray-600">
                            No attendance or location of attendance was included.
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-yellow-800">
                            Please scan the QR code provided at the attendance area or use the link shared by your administrator to access the attendance page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
