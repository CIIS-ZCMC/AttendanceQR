import React, { useEffect, useState } from "react";
import {
    MapPin,
    Smartphone,
    Globe,
    ShieldCheck,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    ArrowRight,
    Loader2,
} from "lucide-react";
import logo from "../../src/zcmc.jpeg";
import googleLogo from "../../src/googleLogin.png";

export default function Welcome({ mapToken }) {
    const [showInstructions, setShowInstructions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (mapToken) {
            localStorage.setItem("attendanceToken", mapToken);
        } else {
            localStorage.removeItem("attendanceToken");
        }
    }, [mapToken]);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        const savedToken =
            typeof window !== "undefined"
                ? localStorage.getItem("attendanceToken")
                : null;
        window.location.href = savedToken
            ? `/auth/google?token=${savedToken}`
            : "/auth/google";
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-between max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 text-center animate-in fade-in duration-300">
            {/* Top Branding Section */}
            <div className="pt-6 sm:pt-10 space-y-4">
                <div className="relative inline-flex items-center justify-center">
                    <div className="absolute w-28 h-28 rounded-3xl bg-blue-500/15 blur-xl animate-pulse" />
                    <img
                        src={logo}
                        alt="ZCMC Logo"
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl relative z-10"
                    />
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                        Zamboanga City Medical Center
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        UMIS Attendance
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Official mobile portal for automated geofence-verified employee attendance
                    </p>
                </div>

                {/* Subtle trust badges */}
                <div className="pt-1 flex items-center justify-center gap-2.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Campus GPS Geofence
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Secure SSO
                    </span>
                </div>
            </div>

            {/* Actions & Instructions */}
            <div className="py-6 space-y-4">
                {/* Noticeable Google Sign In Action Block */}
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Ready to Time In / Out • Sign In Below
                    </div>

                    {/* Highly noticeable button with animated ambient glow */}
                    <div className="relative group">
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition duration-300 animate-pulse-subtle" />

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            aria-label="Sign In with Hospital Google Account"
                            className="relative w-full h-16 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 px-4 sm:px-5 flex items-center justify-between border-2 border-blue-500/40 hover:border-blue-500/70 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                        >
                            {/* Google Logo Icon Box & Labels */}
                            <div className="flex items-center gap-3.5 text-left">
                                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-700 shrink-0">
                                    <img
                                        src={googleLogo}
                                        alt="Google"
                                        className="w-6 h-6 object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                                        <span>Sign In with Google</span>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    </div>
                                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                        Hospital Google Account
                                    </div>
                                </div>
                            </div>

                            {/* Action Arrow / Loading spinner */}
                            <div className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30 group-hover:translate-x-0.5 transition-transform">
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                )}
                            </div>
                        </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                        Use your official <span className="font-semibold text-slate-700 dark:text-slate-200">@zcmc.gov.ph</span> or registered account
                    </p>
                </div>

                {/* Location Help Accordion */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs text-left">
                    <button
                        type="button"
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 p-1 cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            First time? Enable Location Services
                        </span>
                        {showInstructions ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {showInstructions && (
                        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-400 animate-in fade-in">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Android Devices</span>
                                </div>
                                <p className="text-[11px] leading-relaxed">
                                    Turn on <b>Location</b> in notification shade → Allow browser location permission when prompted.
                                </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Apple iPhone (iOS)</span>
                                </div>
                                <p className="text-[11px] leading-relaxed">
                                    Settings → Privacy & Security → Location Services → Safari → <b>While Using the App</b> with <b>Precise Location</b> ON.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-2">
                    ZCMC IMISS • Health Information Systems Development
                </div>
            </div>
        </div>
    );
}
