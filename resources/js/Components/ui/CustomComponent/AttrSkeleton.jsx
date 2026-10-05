import React from "react";
import { MapPin, Sparkles } from "lucide-react";

export const AttrSkeleton = () => {
    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-300">
            {/* Pulsing Radar Circle */}
            <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-24 h-24 rounded-full bg-blue-500/10 animate-ping" />
                <div className="absolute w-16 h-16 rounded-full bg-blue-500/20 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <MapPin className="w-7 h-7 animate-bounce" />
                </div>
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Verifying Geofence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                Checking your real-time GPS coordinates against hospital attendance boundaries...
            </p>

            <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Acquiring high-accuracy fix</span>
            </div>
        </div>
    );
};
