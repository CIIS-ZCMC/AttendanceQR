import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import {
    Crosshair,
    MapPin,
    Compass,
    Navigation,
    RefreshCw,
    Radio,
    Layers,
    Copy,
    Check,
    ExternalLink,
    ShieldCheck,
    AlertTriangle,
    CircleDot,
    Activity,
    Wifi,
    Smartphone,
    Globe,
    LocateFixed,
    Info,
    ArrowUp,
    CheckCircle2,
    XCircle,
    Satellite,
    Map as MapIcon,
    Loader2,
    SlidersHorizontal,
    Sparkles,
    Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
    GoogleMap,
    CircleF as Circle,
    MarkerF as Marker,
    useGoogleMap,
} from "@react-google-maps/api";
import useGoogleMaps from "@/hooks/use-google-maps";

const GEOFENCE_RADIUS = 30; // Standard 30 meters geofence radius for ZCMC Attendance

/**
 * Minimal, crash-safe replacement for <PolylineF>.
 *
 * Google Maps can throw "Cannot read properties of undefined (reading 'setAt')"
 * inside Polyline#setPath when its internal path array isn't initialised.
 * Thrown from a React effect, that unmounts the whole page (white screen).
 * Here any such failure is caught and the line is simply not drawn.
 */
function SafePolyline({ path, options }) {
    const map = useGoogleMap();

    // Primitive deps so a new array/object literal each render doesn't recreate the line
    const pathKey = JSON.stringify(path);
    const optionsKey = JSON.stringify(options);

    useEffect(() => {
        if (!map || !window.google?.maps?.Polyline) return;

        const points = JSON.parse(pathKey);
        const valid = points.every(
            (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)
        );
        if (!valid) return;

        let line = null;
        try {
            line = new window.google.maps.Polyline({
                ...JSON.parse(optionsKey),
                map,
            });
            line.setPath(points);
        } catch (err) {
            console.warn("[SafePolyline] Could not draw polyline:", err);
            try {
                line?.setMap(null);
            } catch {
                /* ignore */
            }
            return;
        }

        return () => line.setMap(null);
    }, [map, pathKey, optionsKey]);

    return null;
}

/** Keeps a Google Maps error from blanking the whole page. */
class MapErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error("[MapErrorBoundary] Map failed to render:", error);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="h-[320px] flex flex-col items-center justify-center gap-2 text-center px-6 text-sm text-slate-500 dark:text-slate-400">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <p>The map could not be displayed. Distance and location readings still work.</p>
                    <button
                        onClick={() => this.setState({ error: null })}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Mathematical Haversine Distance (meters)
function computeHaversineDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371e3; // Earth's radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Bearing angle from point A to point B in degrees (0 - 360)
function computeBearing(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
}

// 16-point cardinal compass direction
function getCompassDirection(bearing) {
    const directions = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
    ];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
}

export default function Calibrate({
    mapLocations = [],
    activeMapLocation = null,
    is_admin = false,
}) {
    // If user is not admin and an active location is set, lock to that location.
    // Otherwise fallback to the active location or first available map location.
    const initialLocationId = useMemo(() => {
        if (!is_admin && activeMapLocation?.id) {
            return activeMapLocation.id;
        }
        if (activeMapLocation?.id && mapLocations.some((loc) => loc.id === activeMapLocation.id)) {
            return activeMapLocation.id;
        }
        return mapLocations.length > 0 ? mapLocations[0].id : "";
    }, [is_admin, activeMapLocation, mapLocations]);

    const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [updateCount, setUpdateCount] = useState(0);
    const [calibrated, setCalibrated] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [distance, setDistance] = useState(null);
    const [bearing, setBearing] = useState(null);
    const [mapTypeId, setMapTypeId] = useState("roadmap");
    const [activeTab, setActiveTab] = useState("calibrate");

    const watchIdRef = useRef(null);
    const mapRef = useRef(null);

    // True only once the Google Maps API is fully loaded
    const { isLoaded: mapsReady } = useGoogleMaps();

    // Keep selectedLocationId in sync if props change or if locked to non-admin active location
    useEffect(() => {
        if (!is_admin && activeMapLocation?.id) {
            setSelectedLocationId(activeMapLocation.id);
        }
    }, [is_admin, activeMapLocation]);

    // Selected Map Location
    const selectedLocation = useMemo(() => {
        if (!is_admin && activeMapLocation) {
            // Prioritize the user's assigned active location if not admin
            const foundInList = mapLocations.find((loc) => loc.id === activeMapLocation.id);
            return foundInList || activeMapLocation;
        }
        return (
            mapLocations.find((loc) => loc.id === parseInt(selectedLocationId)) ||
            (mapLocations.length > 0 ? mapLocations[0] : null)
        );
    }, [is_admin, activeMapLocation, mapLocations, selectedLocationId]);

    // Recalculate distance and bearing whenever userLocation or selectedLocation changes
    useEffect(() => {
        if (userLocation && selectedLocation) {
            const targetLat = parseFloat(selectedLocation.lat);
            const targetLng = parseFloat(selectedLocation.lng);

            if (!isNaN(targetLat) && !isNaN(targetLng)) {
                let dist = null;
                if (window.google?.maps?.geometry?.spherical) {
                    const p1 = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
                    const p2 = new window.google.maps.LatLng(targetLat, targetLng);
                    dist = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
                } else {
                    dist = computeHaversineDistance(userLocation.lat, userLocation.lng, targetLat, targetLng);
                }

                setDistance(dist);
                const brng = computeBearing(userLocation.lat, userLocation.lng, targetLat, targetLng);
                setBearing(brng);
            }
        } else {
            setDistance(null);
            setBearing(null);
        }
    }, [userLocation, selectedLocation]);

    // Handle Geolocation Success
    const handlePositionSuccess = useCallback((position) => {
        const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            rawTimestamp: position.timestamp,
        };
        setUserLocation(loc);
        setCalibrated(true);
        setLoading(false);
        setLocationError(null);
        setUpdateCount((prev) => prev + 1);
    }, []);

    // Handle Geolocation Error
    const handlePositionError = useCallback(
        (error) => {
            let message = "Unable to retrieve your location.";
            if (error.code === 1) {
                message = "Location permission denied. Please allow location access in your browser settings.";
            } else if (error.code === 2) {
                message = "GPS position unavailable. Please check your device location services.";
            } else if (error.code === 3) {
                message = "Location request timed out. Please try again in an area with clear sky view.";
            }
            setLocationError(message);
            setLoading(false);
            if (isTracking) {
                stopLiveTracking();
            }
        },
        [isTracking]
    );

    // One-time Location Query
    const getLocation = useCallback(() => {
        setLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(handlePositionSuccess, handlePositionError, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
        });
    }, [handlePositionSuccess, handlePositionError]);

    // Live Tracking Controls
    const startLiveTracking = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setLocationError(null);
        setIsTracking(true);
        toast.success("Live GPS tracking started");

        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionSuccess,
            handlePositionError,
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000,
            }
        );
    }, [handlePositionSuccess, handlePositionError]);

    const stopLiveTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        toast.info("Live GPS tracking stopped");
    }, []);

    const toggleLiveTracking = useCallback(() => {
        if (isTracking) {
            stopLiveTracking();
        } else {
            startLiveTracking();
        }
    }, [isTracking, startLiveTracking, stopLiveTracking]);

    // Clean up watch on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Network & Device Info
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (navigator.connection) {
                const conn = navigator.connection;
                setNetworkInfo({
                    effectiveType: (conn.effectiveType || "Unknown").toUpperCase(),
                    downlink: conn.downlink ? `${conn.downlink} Mbps` : "N/A",
                    rtt: conn.rtt != null ? `${conn.rtt} ms` : "N/A",
                    saveData: conn.saveData ? "Active" : "Off",
                    type: conn.type || "Network",
                });
            }

            setDeviceInfo({
                userAgent: navigator.userAgent,
                platform: navigator.platform || "Unknown",
                language: navigator.language || "Unknown",
                languages: navigator.languages?.join(", ") || "N/A",
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                screenColorDepth: `${window.screen.colorDepth}-bit`,
                pixelRatio: `${window.devicePixelRatio}x`,
                online: navigator.onLine ? "Connected" : "Offline",
                cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
            });
        }
    }, []);

    // Copy to clipboard helper
    const copyToClipboard = (text, field, successMessage) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopiedField(field);
                toast.success(successMessage || `Copied to clipboard`);
                setTimeout(() => setCopiedField(null), 2000);
            })
            .catch(() => {
                toast.error("Failed to copy");
            });
    };

    const isInsideGeofence =
        calibrated && userLocation && selectedLocation && distance !== null
            ? distance <= GEOFENCE_RADIUS
            : false;

    // Accuracy health evaluation
    const getAccuracyBadge = (acc) => {
        if (acc == null) return null;
        if (acc <= 10) {
            return {
                label: "High Precision",
                color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
                icon: CheckCircle2,
            };
        }
        if (acc <= 25) {
            return {
                label: "Acceptable",
                color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
                icon: Info,
            };
        }
        return {
            label: "Low Precision",
            color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
            icon: AlertTriangle,
        };
    };

    const accuracyBadge = userLocation ? getAccuracyBadge(userLocation.accuracy) : null;

    // Map helpers
    const mapCenter = useMemo(() => {
        if (userLocation && selectedLocation) {
            // Midpoint or user
            return {
                lat: (userLocation.lat + parseFloat(selectedLocation.lat)) / 2,
                lng: (userLocation.lng + parseFloat(selectedLocation.lng)) / 2,
            };
        }
        if (selectedLocation) {
            return { lat: parseFloat(selectedLocation.lat), lng: parseFloat(selectedLocation.lng) };
        }
        return { lat: 6.907257, lng: 122.080909 }; // ZCMC coordinates default
    }, [userLocation, selectedLocation]);

    const targetCenter = useMemo(() => {
        if (!selectedLocation) return { lat: 6.907257, lng: 122.080909 };
        return {
            lat: parseFloat(selectedLocation.lat),
            lng: parseFloat(selectedLocation.lng),
        };
    }, [selectedLocation]);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const fitBothInView = useCallback(() => {
        if (!mapRef.current || !selectedLocation || !userLocation || !window.google) return;
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(targetCenter);
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
        mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }, [targetCenter, userLocation]);

    const centerOnTarget = useCallback(() => {
        if (!mapRef.current || !selectedLocation) return;
        mapRef.current.panTo(targetCenter);
        mapRef.current.setZoom(18);
    }, [targetCenter, selectedLocation]);

    const centerOnUser = useCallback(() => {
        if (!mapRef.current || !userLocation) return;
        mapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
        mapRef.current.setZoom(18);
    }, [userLocation]);

    const mapOptions = useMemo(
        () => ({
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            gestureHandling: "greedy",
            styles: [
                {
                    featureType: "poi.business",
                    stylers: [{ visibility: "off" }],
                },
            ],
        }),
        []
    );

    // Calculate meter bar percentages
    const maxGaugeDistance = Math.max(60, distance ? Math.ceil(distance * 1.25) : 60);
    const geofenceMarkerPercent = (GEOFENCE_RADIUS / maxGaugeDistance) * 100;
    const currentDistancePercent = distance ? Math.min(100, (distance / maxGaugeDistance) * 100) : 0;

    return (
        <AppLayout is_admin={is_admin}>
            <div className="w-full max-w-xl mx-auto space-y-4 pb-6 animate-in fade-in duration-300">
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-5 shadow-lg shadow-blue-500/15 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-medium tracking-wide">
                                <Crosshair className="w-3.5 h-3.5 text-blue-200" />
                                <span>ZCMC GPS Verification Suite</span>
                                {is_admin && (
                                    <span className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded text-[9px] uppercase">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Location Calibrator</h1>
                            <p className="text-xs text-blue-100/90 leading-relaxed max-w-sm">
                                Test and verify your physical position against the 30-meter hospital geofence perimeter.
                            </p>
                        </div>

                        {/* Live Tracking Status Badge */}
                        <div className="shrink-0 pt-1">
                            {isTracking ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    <span>LIVE ({updateCount})</span>
                                </div>
                            ) : calibrated ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium">
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Locked</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-blue-100 text-xs">
                                    <Radio className="w-3.5 h-3.5" />
                                    <span>Standby</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl h-11">
                        <TabsTrigger
                            value="calibrate"
                            className="rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Calibrate</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="telemetry"
                            className="rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <LocateFixed className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>GPS Data</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="diagnostics"
                            className="rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:dark:bg-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>System</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ======================================================== */}
                    {/* TAB 1: CALIBRATE & MAP                                    */}
                    {/* ======================================================== */}
                    <TabsContent value="calibrate" className="space-y-4 mt-3">
                        {/* Target Location Card */}
                        <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                Target Map Location
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                                {is_admin
                                                    ? "Select the attendance station to calibrate"
                                                    : "Current attendance location to calibrate"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {is_admin ? (
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                            {mapLocations.length} Locations
                                        </span>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-1 py-0.5 px-2"
                                        >
                                            <Lock className="w-3 h-3 text-slate-400" />
                                            <span>Current Location</span>
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="px-4 sm:px-5 pb-5 pt-0 space-y-3.5">
                                {!selectedLocation && mapLocations.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        No map locations configured. Please contact the system administrator.
                                    </div>
                                ) : (
                                    <>
                                        {/* Dropdown for Admin, Locked Display for Non-Admin */}
                                        {is_admin ? (
                                            <div className="relative">
                                                <select
                                                    value={selectedLocationId}
                                                    onChange={(e) => setSelectedLocationId(e.target.value)}
                                                    className="w-full h-12 pl-3.5 pr-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    {mapLocations.map((loc) => (
                                                        <option
                                                            key={loc.id}
                                                            value={loc.id}
                                                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1"
                                                        >
                                                            {loc.location}
                                                            {loc.description ? ` (${loc.description})` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <SlidersHorizontal className="w-4 h-4" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between px-3.5 py-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                            {selectedLocation?.location || "No Location Assigned"}
                                                        </div>
                                                        {selectedLocation?.description && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                {selectedLocation.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    Locked
                                                </span>
                                            </div>
                                        )}

                                        {/* Location Quick Info Pill */}
                                        {selectedLocation && (
                                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Crosshair className="w-3.5 h-3.5 text-blue-500" /> Center Coordinates
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                            {parseFloat(selectedLocation.lat).toFixed(6)},{" "}
                                                            {parseFloat(selectedLocation.lng).toFixed(6)}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    `${selectedLocation.lat}, ${selectedLocation.lng}`,
                                                                    "target_coords",
                                                                    "Copied target coordinates"
                                                                )
                                                            }
                                                            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                            title="Copy coordinates"
                                                        >
                                                            {copiedField === "target_coords" ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                                                    <span className="text-slate-500 dark:text-slate-400">Allowed Perimeter</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {GEOFENCE_RADIUS} meters radius
                                                        </span>
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                                                        >
                                                            Maps <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons: Calibrate & Live Tracking */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                            <Button
                                                onClick={getLocation}
                                                disabled={loading || !selectedLocation}
                                                className="h-12 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Detecting GPS...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Navigation className="w-4 h-4" />
                                                        <span>Calibrate Once</span>
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                type="button"
                                                variant={isTracking ? "destructive" : "outline"}
                                                onClick={toggleLiveTracking}
                                                disabled={!selectedLocation}
                                                className={`h-12 rounded-2xl text-xs sm:text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                                                    isTracking
                                                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
                                                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                                                }`}
                                            >
                                                {isTracking ? (
                                                    <>
                                                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                                        <span>Stop Live Radar</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        <span>Live Tracking</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Error Alert */}
                        {locationError && (
                            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 text-left flex items-start gap-3 shadow-xs">
                                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">
                                        Geolocation Access Notice
                                    </h4>
                                    <p className="text-xs text-rose-700/90 dark:text-rose-400 leading-relaxed">
                                        {locationError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Live Geofence Status Card (When Calibrated / Tracking) */}
                        {calibrated && userLocation && selectedLocation && (
                            <Card
                                className={`rounded-3xl border shadow-md transition-all overflow-hidden ${
                                    isInsideGeofence
                                        ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                                        : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                                }`}
                            >
                                <CardContent className="p-4 sm:p-5 space-y-4">
                                    {/* Primary Geofence Banner */}
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ring-4 ${
                                                isInsideGeofence
                                                    ? "bg-emerald-600 text-white ring-emerald-500/20"
                                                    : "bg-rose-600 text-white ring-rose-500/20"
                                            }`}
                                        >
                                            {isInsideGeofence ? (
                                                <CheckCircle2 className="w-7 h-7" />
                                            ) : (
                                                <XCircle className="w-7 h-7" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs font-black uppercase tracking-wider ${
                                                        isInsideGeofence
                                                            ? "text-emerald-700 dark:text-emerald-400"
                                                            : "text-rose-700 dark:text-rose-400"
                                                    }`}
                                                >
                                                    {isInsideGeofence ? "INSIDE GEOFENCE" : "OUTSIDE GEOFENCE"}
                                                </span>
                                                {isInsideGeofence ? (
                                                    <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0 border-none font-bold">
                                                        Valid Scan Zone
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500 text-white text-[10px] px-2 py-0 border-none font-bold">
                                                        Scan Rejected
                                                    </Badge>
                                                )}
                                            </div>

                                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                                                {distance != null ? (
                                                    <>
                                                        <span className="font-mono">{distance.toFixed(1)}m</span> from Center
                                                    </>
                                                ) : (
                                                    "Calculating distance..."
                                                )}
                                            </h3>

                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {isInsideGeofence && distance != null
                                                    ? `Safely within the 30m boundary (${(GEOFENCE_RADIUS - distance).toFixed(1)}m cushion remaining)`
                                                    : distance != null
                                                    ? `${(distance - GEOFENCE_RADIUS).toFixed(1)}m beyond the 30-meter perimeter limit`
                                                    : "Position check completed"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Visual Geofence Distance Meter Bar */}
                                    {distance != null && (
                                        <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                <span>0m (Center)</span>
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                    30m Boundary Limit
                                                </span>
                                                <span>{maxGaugeDistance}m+</span>
                                            </div>

                                            {/* Bar Track */}
                                            <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                                                {/* 30m Boundary safe area tint */}
                                                <div
                                                    className="absolute top-0 bottom-0 left-0 bg-emerald-500/20 dark:bg-emerald-500/10 border-r-2 border-dashed border-emerald-500 z-0"
                                                    style={{ width: `${geofenceMarkerPercent}%` }}
                                                />

                                                {/* Current Distance Progress */}
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 relative z-10 ${
                                                        isInsideGeofence
                                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                                            : "bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600"
                                                    }`}
                                                    style={{ width: `${currentDistancePercent}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                <span>Target Anchor</span>
                                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    Current: {distance.toFixed(1)}m
                                                </span>
                                                <span>Far Perimeter</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4-Stat Metric Summary Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                        {/* 1. Distance */}
                                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Distance
                                            </span>
                                            <span className="font-mono text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                                                {distance != null ? `${distance.toFixed(1)}m` : "N/A"}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500 mt-0.5 block">
                                                {isInsideGeofence ? "Inside Boundary" : "Outside"}
                                            </span>
                                        </div>

                                        {/* 2. GPS Accuracy */}
                                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Accuracy
                                            </span>
                                            <span className="font-mono text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                                                {userLocation.accuracy != null
                                                    ? `±${userLocation.accuracy.toFixed(1)}m`
                                                    : "N/A"}
                                            </span>
                                            {accuracyBadge && (
                                                <span
                                                    className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-0.5 ${accuracyBadge.color}`}
                                                >
                                                    {accuracyBadge.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* 3. Bearing & Direction */}
                                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Bearing
                                            </span>
                                            <div className="flex items-center justify-center gap-1 mt-0.5">
                                                <ArrowUp
                                                    className="w-3.5 h-3.5 text-blue-600 transition-transform duration-300"
                                                    style={{
                                                        transform: `rotate(${bearing || 0}deg)`,
                                                    }}
                                                />
                                                <span className="font-mono text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                                                    {bearing != null ? `${Math.round(bearing)}°` : "N/A"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                                                {bearing != null ? getCompassDirection(bearing) : "N/A"} to Center
                                            </span>
                                        </div>

                                        {/* 4. Fix Time / Updates */}
                                        <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-2.5 border border-slate-200/80 dark:border-slate-800 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Last Fix
                                            </span>
                                            <span className="font-mono text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
                                                {userLocation.timestamp}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500 mt-0.5 block">
                                                {isTracking ? `${updateCount} updates` : "Static check"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Interactive Google Map Card */}
                        {mapsReady && selectedLocation && (
                            <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                                <CardHeader className="py-3 px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <div>
                                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    Geofence Visualizer
                                                </CardTitle>
                                                <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Green/Red circle is the 30m attendance boundary
                                                </CardDescription>
                                            </div>
                                        </div>

                                        {/* Map Toolbar Controls */}
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setMapTypeId((prev) =>
                                                        prev === "roadmap" ? "satellite" : "roadmap"
                                                    )
                                                }
                                                className="h-8 px-2.5 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700"
                                                title="Toggle satellite / road map"
                                            >
                                                {mapTypeId === "roadmap" ? (
                                                    <>
                                                        <Satellite className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Satellite
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapIcon className="w-3.5 h-3.5 mr-1 text-blue-600" /> Map
                                                    </>
                                                )}
                                            </Button>

                                            {userLocation && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={fitBothInView}
                                                    className="h-8 px-2 rounded-xl text-xs border-slate-200 dark:border-slate-700"
                                                    title="Fit both target and your location in view"
                                                >
                                                    <Layers className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 relative">
                                    <MapErrorBoundary>
                                    <GoogleMap
                                        mapContainerStyle={{ width: "100%", height: "320px" }}
                                        center={mapCenter}
                                        zoom={17}
                                        options={mapOptions}
                                        mapTypeId={mapTypeId}
                                        onLoad={onMapLoad}
                                    >
                                        {/* 30-Meter Allowed Geofence Circle */}
                                        <Circle
                                            center={targetCenter}
                                            radius={GEOFENCE_RADIUS}
                                            options={{
                                                fillColor: isInsideGeofence ? "#10b981" : "#ef4444",
                                                fillOpacity: 0.22,
                                                strokeColor: isInsideGeofence ? "#059669" : "#dc2626",
                                                strokeOpacity: 0.9,
                                                strokeWeight: 2,
                                            }}
                                        />

                                        {/* Target Center Marker */}
                                        <Marker
                                            position={targetCenter}
                                            title={selectedLocation.location}
                                            label={{
                                                text: "Center",
                                                fontSize: "11px",
                                                fontWeight: "bold",
                                                color: "#ffffff",
                                                className: "px-1.5 py-0.5 rounded bg-blue-600 text-white font-sans",
                                            }}
                                            icon={
                                                window.google
                                                    ? {
                                                          path: window.google.maps.SymbolPath.CIRCLE,
                                                          scale: 8,
                                                          fillColor: "#2563eb",
                                                          fillOpacity: 1,
                                                          strokeColor: "#ffffff",
                                                          strokeWeight: 2.5,
                                                      }
                                                    : undefined
                                            }
                                        />

                                        {/* User Location Marker & Accuracy Circle */}
                                        {userLocation && (
                                            <>
                                                {/* Accuracy Uncertainty Halo */}
                                                <Circle
                                                    center={{
                                                        lat: userLocation.lat,
                                                        lng: userLocation.lng,
                                                    }}
                                                    radius={userLocation.accuracy || 10}
                                                    options={{
                                                        fillColor: "#3b82f6",
                                                        fillOpacity: 0.12,
                                                        strokeColor: "#3b82f6",
                                                        strokeOpacity: 0.45,
                                                        strokeWeight: 1,
                                                    }}
                                                />

                                                {/* User Current Position Dot */}
                                                <Marker
                                                    position={{
                                                        lat: userLocation.lat,
                                                        lng: userLocation.lng,
                                                    }}
                                                    title="Your Position"
                                                    label={{
                                                        text: "You",
                                                        fontSize: "11px",
                                                        fontWeight: "bold",
                                                        color: "#ffffff",
                                                        className:
                                                            "px-1.5 py-0.5 rounded bg-emerald-600 text-white font-sans",
                                                    }}
                                                    icon={
                                                        window.google
                                                            ? {
                                                                  path: window.google.maps.SymbolPath.CIRCLE,
                                                                  scale: 8,
                                                                  fillColor: isInsideGeofence
                                                                      ? "#10b981"
                                                                      : "#f43f5e",
                                                                  fillOpacity: 1,
                                                                  strokeColor: "#ffffff",
                                                                  strokeWeight: 2.5,
                                                              }
                                                            : undefined
                                                    }
                                                />

                                                {/* Distance Connecting Polyline */}
                                                <SafePolyline
                                                    path={[
                                                        {
                                                            lat: userLocation.lat,
                                                            lng: userLocation.lng,
                                                        },
                                                        targetCenter,
                                                    ]}
                                                    options={{
                                                        strokeColor: isInsideGeofence
                                                            ? "#10b981"
                                                            : "#ef4444",
                                                        strokeOpacity: 0.75,
                                                        strokeWeight: 2,
                                                        geodesic: true,
                                                    }}
                                                />
                                            </>
                                        )}
                                    </GoogleMap>
                                    </MapErrorBoundary>

                                    {/* Map Floating Quick Center Buttons */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800">
                                        <button
                                            onClick={centerOnTarget}
                                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 rounded-xl transition-all"
                                        >
                                            Target
                                        </button>
                                        {userLocation && (
                                            <>
                                                <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
                                                <button
                                                    onClick={centerOnUser}
                                                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 rounded-xl transition-all"
                                                >
                                                    You
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>

                                {/* Map Legend Footer */}
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-950" />
                                        <span>Target Station</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full ${
                                                isInsideGeofence ? "bg-emerald-500" : "bg-rose-500"
                                            }`}
                                        />
                                        <span>30m Geofence Perimeter</span>
                                    </div>
                                    {userLocation && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 opacity-60" />
                                            <span>
                                                Accuracy (±{userLocation.accuracy?.toFixed(0) || 0}m)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ======================================================== */}
                    {/* TAB 2: DETAILED GPS TELEMETRY                             */}
                    {/* ======================================================== */}
                    <TabsContent value="telemetry" className="space-y-4 mt-3">
                        <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
                            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                            <LocateFixed className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                Raw GPS Telemetry
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                                Device sensor coordinates and precision
                                            </CardDescription>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={getLocation}
                                        disabled={loading}
                                        className="h-8 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-poll
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="px-4 sm:px-5 pb-5 pt-0">
                                {!userLocation ? (
                                    <div className="text-center py-8 space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                            <Navigation className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                            No GPS fix acquired yet. Press Calibrate or start Live Tracking on the main tab.
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={getLocation}
                                            className="h-9 rounded-xl text-xs font-semibold bg-blue-600 text-white"
                                        >
                                            Poll GPS Position
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {/* Coordinate Breakdown */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Latitude
                                                </span>
                                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                                                    {userLocation.lat.toFixed(6)}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Longitude
                                                </span>
                                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                                                    {userLocation.lng.toFixed(6)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detailed Attributes Table */}
                                        <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Horizontal Accuracy</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                    {userLocation.accuracy != null
                                                        ? `±${userLocation.accuracy.toFixed(1)} meters`
                                                        : "Not reported"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Altitude</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                    {userLocation.altitude != null
                                                        ? `${userLocation.altitude.toFixed(1)} m above sea level`
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Altitude Accuracy</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                    {userLocation.altitudeAccuracy != null
                                                        ? `±${userLocation.altitudeAccuracy.toFixed(1)} m`
                                                        : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Device Heading</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                    {userLocation.heading != null && !isNaN(userLocation.heading)
                                                        ? `${userLocation.heading.toFixed(1)}°`
                                                        : "Stationary / N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Ground Speed</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                    {userLocation.speed != null
                                                        ? `${(userLocation.speed * 3.6).toFixed(1)} km/h (${userLocation.speed.toFixed(1)} m/s)`
                                                        : "0.0 km/h"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-slate-500">Timestamp</span>
                                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                                    {userLocation.timestamp}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Accuracy Advice if accuracy is > 20m */}
                                        {userLocation.accuracy != null && userLocation.accuracy > 20 && (
                                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                                <p>
                                                    Accuracy uncertainty is ±{userLocation.accuracy.toFixed(0)}m. Dense concrete walls or metal roofs can distort satellite signals. For accurate perimeter calibration, verify outdoors.
                                                </p>
                                            </div>
                                        )}

                                        {/* Quick Copy Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
                                                        "coords_formatted",
                                                        "Copied: Lat, Lng"
                                                    )
                                                }
                                                className="h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                            >
                                                <Copy className="w-3.5 h-3.5 mr-1" />
                                                <span>Copy Lat, Lng</span>
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`,
                                                        "maps_link",
                                                        "Copied Google Maps link"
                                                    )
                                                }
                                                className="h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                                            >
                                                <Globe className="w-3.5 h-3.5 mr-1" />
                                                <span>Copy Maps Link</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ======================================================== */}
                    {/* TAB 3: DIAGNOSTICS & SYSTEM                               */}
                    {/* ======================================================== */}
                    <TabsContent value="diagnostics" className="space-y-4 mt-3">
                        {/* Network Telemetry Card */}
                        <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
                            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <Wifi className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                            Network Quality
                                        </CardTitle>
                                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                            Client connection and latency metrics
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-5 pb-5 pt-0">
                                {networkInfo ? (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Effective Network
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                                                {networkInfo.effectiveType}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Downlink Bandwidth
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                                                {networkInfo.downlink}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Round Trip Latency
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                                                {networkInfo.rtt}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Data Saver Mode
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                                                {networkInfo.saveData}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-4">
                                        Network Information API not supported by this browser.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Device & Client Card */}
                        <Card className="shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
                            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                            Device & Environment
                                        </CardTitle>
                                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                                            Client browser and hardware profile
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-5 pb-5 pt-0 space-y-3">
                                {deviceInfo && (
                                    <>
                                        <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Operating System / Platform</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    {deviceInfo.platform}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Screen Resolution</span>
                                                <span className="font-mono text-slate-800 dark:text-slate-200">
                                                    {deviceInfo.screenWidth} × {deviceInfo.screenHeight} ({deviceInfo.pixelRatio})
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Timezone</span>
                                                <span className="font-mono text-slate-800 dark:text-slate-200">
                                                    {deviceInfo.timezone}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                                                <span className="text-slate-500">Locale Language</span>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    {deviceInfo.language}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-1">
                                                <span className="text-slate-500">Online Status</span>
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {deviceInfo.online}
                                                </span>
                                            </div>
                                        </div>

                                        {/* User Agent Block */}
                                        <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Browser User Agent
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            deviceInfo.userAgent,
                                                            "ua",
                                                            "Copied User-Agent"
                                                        )
                                                    }
                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                                                >
                                                    {copiedField === "ua" ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-500" /> Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" /> Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all leading-relaxed">
                                                {deviceInfo.userAgent}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer Diagnostic Note */}
                <div className="text-center pt-2 space-y-1">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        Attendance location validation strictly enforces a 30-meter radius limit.
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600">
                        Diagnostics run entirely on-device. No telemetry coordinates are logged.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
