import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import {
    MapPin,
    Navigation,
    RotateCcw,
    AlertTriangle,
    Smartphone,
    Globe,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
} from "lucide-react";
import { GoogleMap, CircleF as Circle, MarkerF as Marker } from "@react-google-maps/api";
import useGoogleMaps from "@/hooks/use-google-maps";

const GEOFENCE_RADIUS = 30;

export const NotInLocation = ({
    locationService,
    distance,
    activeMapLocation,
    userCoords,
}) => {
    const { isLoaded: mapsReady } = useGoogleMaps();
    const [showSteps, setShowSteps] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good morning";
        if (hour >= 12 && hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const savedToken =
        typeof window !== "undefined"
            ? localStorage.getItem("attendanceToken")
            : null;
    const retryHref = savedToken ? `/?token=${savedToken}` : "/";

    return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-4 py-2 text-center animate-in fade-in duration-300">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 p-5 shadow-xl space-y-4">
                {/* Visual Icon */}
                <div className="relative inline-flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center ring-4 ring-rose-500/10">
                        <Navigation className="w-8 h-8 rotate-45" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                        !
                    </span>
                </div>

                {/* Status Text */}
                <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                        Location Restriction
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        Outside Allowed Area
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {getGreeting()}! You must be inside the designated campus area to mark attendance.
                    </p>
                </div>

                {/* Target Location Card */}
                {activeMapLocation && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Target Area
                            </span>
                            {distance != null && locationService && (
                                <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                    ~{distance.toFixed(0)}m away
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                            {activeMapLocation.location}
                        </h4>
                        {activeMapLocation.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {activeMapLocation.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Google Map View */}
                {locationService &&
                    mapsReady &&
                    activeMapLocation &&
                    !!activeMapLocation.w_map &&
                    userCoords && (
                        <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
                                center={{
                                    lat: parseFloat(activeMapLocation.lat),
                                    lng: parseFloat(activeMapLocation.lng),
                                }}
                                zoom={17}
                                options={{
                                    zoomControl: false,
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    fullscreenControl: false,
                                }}
                            >
                                <Circle
                                    center={{
                                        lat: parseFloat(activeMapLocation.lat),
                                        lng: parseFloat(activeMapLocation.lng),
                                    }}
                                    radius={GEOFENCE_RADIUS}
                                    options={{
                                        fillColor: "#ef4444",
                                        fillOpacity: 0.15,
                                        strokeColor: "#ef4444",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                    }}
                                />
                                <Marker
                                    position={{
                                        lat: parseFloat(activeMapLocation.lat),
                                        lng: parseFloat(activeMapLocation.lng),
                                    }}
                                    label={{ text: "Campus", fontSize: "10px" }}
                                />
                                <Marker
                                    position={{ lat: userCoords.lat, lng: userCoords.lng }}
                                    label={{ text: "You", fontSize: "10px" }}
                                />
                            </GoogleMap>
                            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-medium flex items-center justify-between">
                                <span>Red circle: Allowed 30m geofence</span>
                                <span className="font-mono text-emerald-400">GPS Live</span>
                            </div>
                        </div>
                    )}

                {/* Retry Button */}
                <div className="pt-1">
                    <Link href={retryHref} className="block w-full">
                        <Button
                            type="button"
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            <span>Try Again / Refresh GPS</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* GPS Instructions Collapsible */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs">
                <button
                    type="button"
                    onClick={() => setShowSteps(!showSteps)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 p-1"
                >
                    <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Troubleshoot Location Settings
                    </span>
                    {showSteps ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                </button>

                {showSteps && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-left space-y-3 animate-in fade-in">
                        {/* Android */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Smartphone className="w-4 h-4 text-emerald-600" />
                                <span>For Android Phones</span>
                            </div>
                            <ol className="list-decimal pl-5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                                <li>Swipe down and ensure <b>Location</b> is turned on.</li>
                                <li>Tap the lock icon in Chrome address bar → <b>Permissions</b> → Allow Location.</li>
                                <li>Turn off Battery Saver or High Accuracy mode if GPS drifts.</li>
                            </ol>
                        </div>

                        {/* iOS */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Globe className="w-4 h-4 text-blue-600" />
                                <span>For iPhone (iOS Safari)</span>
                            </div>
                            <ol className="list-decimal pl-5 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                                <li>Open <b>Settings</b> → <b>Privacy & Security</b> → <b>Location Services</b> (On).</li>
                                <li>Tap <b>Safari Websites</b> → select <b>While Using the App</b>.</li>
                                <li>Ensure <b>Precise Location</b> toggle is turned ON.</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
