import React, { useState, useEffect, useCallback, useRef } from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Copy, RefreshCw, Wifi, Smartphone, Globe, Crosshair, Loader2, Check, Navigation, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { GoogleMap, Circle, Marker } from "@react-google-maps/api";

const GEOFENCE_RADIUS = 30;

export default function Calibrate({ mapLocations = [] }) {
    const [selectedLocationId, setSelectedLocationId] = useState(
        mapLocations.length > 0 ? mapLocations[0].id : ""
    );
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [calibrated, setCalibrated] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [distance, setDistance] = useState(null);
    const [mapsReady, setMapsReady] = useState(false);

    useEffect(() => {
        const checkMaps = setInterval(() => {
            if (window.google && window.google.maps) {
                setMapsReady(true);
                clearInterval(checkMaps);
            }
        }, 200);
        return () => clearInterval(checkMaps);
    }, []);

    const selectedLocation = mapLocations.find((loc) => loc.id === parseInt(selectedLocationId)) || null;

    const getLocation = useCallback(() => {
        setLoading(true);
        setLocationError(null);
        setCalibrated(false);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: new Date(position.timestamp).toLocaleString(),
                };
                setUserLocation(loc);
                setLoading(false);
                setCalibrated(true);

                if (selectedLocation && window.google && window.google.maps) {
                    const userLatLng = new window.google.maps.LatLng(loc.lat, loc.lng);
                    const centerLatLng = new window.google.maps.LatLng(
                        parseFloat(selectedLocation.lat),
                        parseFloat(selectedLocation.lng)
                    );
                    const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
                        userLatLng,
                        centerLatLng
                    );
                    setDistance(dist);
                }
            },
            (error) => {
                let message = "Unable to retrieve your location.";
                if (error.code === 1)
                    message =
                        "Location access denied. Please enable location permissions in your browser settings.";
                else if (error.code === 2)
                    message = "Position unavailable. Check your GPS or network connection.";
                else if (error.code === 3) message = "Location request timed out. Try again.";
                setLocationError(message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, [selectedLocation]);

    useEffect(() => {
        if (navigator.connection) {
            const conn = navigator.connection;
            setNetworkInfo({
                effectiveType: conn.effectiveType || "Unknown",
                downlink: conn.downlink || null,
                rtt: conn.rtt || null,
                saveData: conn.saveData || false,
                type: conn.type || "Unknown",
            });
        }

        setDeviceInfo({
            userAgent: navigator.userAgent,
            platform: navigator.platform || "Unknown",
            language: navigator.language || "Unknown",
            languages: navigator.languages?.join(", ") || "N/A",
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            screenColorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio,
            online: navigator.onLine,
            cookiesEnabled: navigator.cookieEnabled,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
        });
    }, []);

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            toast.success(`Copied: ${text}`);
            setTimeout(() => setCopiedField(null), 2000);
        }).catch(() => {
            toast.error("Failed to copy");
        });
    };

    const CopyButton = ({ value, field }) => (
        <button
            onClick={() => copyToClipboard(value, field)}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
            {copiedField === field ? (
                <>
                    <Check className="w-3 h-3" /> Copied
                </>
            ) : (
                <>
                    <Copy className="w-3 h-3" /> Copy
                </>
            )}
        </button>
    );

    const InfoRow = ({ label, value, copyField, mono }) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>
                    {value || "N/A"}
                </span>
                {value && copyField && <CopyButton value={value} field={copyField} />}
            </div>
        </div>
    );

    const isInsideGeofence =
        calibrated && userLocation && selectedLocation && distance !== null
            ? distance <= GEOFENCE_RADIUS
            : false;

    const mapCenter = selectedLocation
        ? { lat: parseFloat(selectedLocation.lat), lng: parseFloat(selectedLocation.lng) }
        : { lat: 6.907257, lng: 122.080909 };

    const mapOptions = {
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-4">
                {/* Header */}
                <div className="text-center pt-2 pb-1">
                    <div className="inline-flex items-center gap-2 mb-1">
                        <Crosshair className="w-6 h-6 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-900">Location Calibrator</h1>
                    </div>
                    <p className="text-xs text-gray-500">
                        Verify your GPS position against a map location's geofence
                    </p>
                </div>

                {/* Location Selector & Calibrate */}
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div>
                                <CardTitle className="text-base">Select Location</CardTitle>
                                <CardDescription className="text-xs">
                                    Choose a map location to calibrate against
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-3">
                        {mapLocations.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-3">
                                No map locations available.
                            </p>
                        ) : (
                            <>
                                <div className="relative w-full">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        value={selectedLocationId}
                                        onChange={(e) => {
                                            setSelectedLocationId(e.target.value);
                                            setCalibrated(false);
                                            setDistance(null);
                                        }}
                                        className="pl-10 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                        {mapLocations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.location}
                                                {loc.description ? ` — ${loc.description}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedLocation && (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Center Coordinates
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-gray-900">
                                                    {selectedLocation.lat}, {selectedLocation.lng}
                                                </span>
                                                <CopyButton
                                                    value={`${selectedLocation.lat}, ${selectedLocation.lng}`}
                                                    field="center"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Geofence Radius
                                            </span>
                                            <span className="text-xs font-medium text-gray-900">
                                                {GEOFENCE_RADIUS} meters
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full h-10"
                                    onClick={getLocation}
                                    disabled={loading || !selectedLocation}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                            Detecting your location...
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="w-4 h-4 mr-2" /> Calibrate
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Status Result */}
                {calibrated && userLocation && selectedLocation && (
                    <Card
                        className={`shadow-sm border-l-4 ${
                            isInsideGeofence ? "border-l-green-500" : "border-l-red-500"
                        }`}
                    >
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-3 rounded-lg ${
                                        isInsideGeofence ? "bg-green-50" : "bg-red-50"
                                    }`}
                                >
                                    {isInsideGeofence ? (
                                        <Check className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <CircleDot className="w-6 h-6 text-red-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3
                                        className={`text-sm font-semibold ${
                                            isInsideGeofence ? "text-green-700" : "text-red-700"
                                        }`}
                                    >
                                        {isInsideGeofence ? "Inside Geofence" : "Outside Geofence"}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {distance !== null
                                            ? `You are ${distance.toFixed(1)}m from the center (${GEOFENCE_RADIUS}m radius)`
                                            : "Distance calculation unavailable"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Map */}
                {mapsReady && selectedLocation && (
                    <Card className="shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-green-600" />
                                <div>
                                    <CardTitle className="text-base">Map View</CardTitle>
                                    <CardDescription className="text-xs">
                                        Geofence circle and your position
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "400px" }}
                                center={mapCenter}
                                zoom={17}
                                options={mapOptions}
                            >
                                <Circle
                                    center={mapCenter}
                                    radius={GEOFENCE_RADIUS}
                                    options={{
                                        fillColor: isInsideGeofence ? "#22c55e" : "#ef4444",
                                        fillOpacity: 0.15,
                                        strokeColor: isInsideGeofence ? "#22c55e" : "#ef4444",
                                        strokeOpacity: 0.8,
                                        strokeWeight: 2,
                                    }}
                                />
                                <Marker
                                    position={mapCenter}
                                    label={{ text: "Target", fontSize: "10px" }}
                                    icon={{
                                        path: window.google.maps.SymbolPath.CIRCLE,
                                        scale: 7,
                                        fillColor: "#3b82f6",
                                        fillOpacity: 1,
                                        strokeColor: "#1d4ed8",
                                        strokeWeight: 2,
                                    }}
                                />
                                {userLocation && (
                                    <Marker
                                        position={{
                                            lat: userLocation.lat,
                                            lng: userLocation.lng,
                                        }}
                                        label={{ text: "You", fontSize: "10px" }}
                                    />
                                )}
                            </GoogleMap>
                        </CardContent>
                    </Card>
                )}

                {/* GPS Location Card */}
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <div>
                                    <CardTitle className="text-base">GPS Location</CardTitle>
                                    <CardDescription className="text-xs">
                                        Your current coordinates
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={getLocation}
                                disabled={loading}
                                className="h-8"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Detecting...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {locationError ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                <p className="text-xs text-red-600">{locationError}</p>
                            </div>
                        ) : !userLocation ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                <span className="ml-2 text-xs text-gray-500">
                                    Press Calibrate to detect your location...
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-0">
                                <InfoRow
                                    label="Latitude"
                                    value={userLocation.lat?.toFixed(6)}
                                    copyField="lat"
                                    mono
                                />
                                <InfoRow
                                    label="Longitude"
                                    value={userLocation.lng?.toFixed(6)}
                                    copyField="lng"
                                    mono
                                />
                                <InfoRow
                                    label="Accuracy"
                                    value={
                                        userLocation.accuracy
                                            ? `±${userLocation.accuracy.toFixed(1)} meters`
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Altitude"
                                    value={
                                        userLocation.altitude
                                            ? `${userLocation.altitude.toFixed(1)} m`
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Altitude Accuracy"
                                    value={
                                        userLocation.altitudeAccuracy
                                            ? `±${userLocation.altitudeAccuracy.toFixed(1)} m`
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Heading"
                                    value={
                                        userLocation.heading
                                            ? `${userLocation.heading.toFixed(1)}°`
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Speed"
                                    value={
                                        userLocation.speed
                                            ? `${userLocation.speed.toFixed(1)} m/s`
                                            : null
                                    }
                                />
                                <InfoRow
                                    label="Timestamp"
                                    value={userLocation.timestamp}
                                />

                                <div className="flex gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 flex-1"
                                        onClick={() =>
                                            copyToClipboard(
                                                `${userLocation.lat}, ${userLocation.lng}`,
                                                "latlng"
                                            )
                                        }
                                    >
                                        <Copy className="w-3 h-3 mr-1" /> Copy Lat, Lng
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 flex-1"
                                        onClick={() =>
                                            copyToClipboard(
                                                `${userLocation.lat},${userLocation.lng}`,
                                                "latlngcomma"
                                            )
                                        }
                                    >
                                        <Copy className="w-3 h-3 mr-1" /> Copy for Maps
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Network Info Card */}
                <Card className="shadow-sm border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-green-600" />
                            <div>
                                <CardTitle className="text-base">Network Information</CardTitle>
                                <CardDescription className="text-xs">
                                    Connection details
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {networkInfo ? (
                            <div className="space-y-0">
                                <InfoRow label="Connection Type" value={networkInfo.type} />
                                <InfoRow label="Effective Type" value={networkInfo.effectiveType} />
                                <InfoRow
                                    label="Downlink"
                                    value={
                                        networkInfo.downlink ? `${networkInfo.downlink} Mbps` : null
                                    }
                                />
                                <InfoRow
                                    label="Round Trip Time"
                                    value={
                                        networkInfo.rtt != null ? `${networkInfo.rtt} ms` : null
                                    }
                                />
                                <InfoRow
                                    label="Data Saver"
                                    value={networkInfo.saveData ? "Enabled" : "Disabled"}
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-3">
                                Network information API not available in this browser.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Device Info Card */}
                <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-purple-600" />
                            <div>
                                <CardTitle className="text-base">Device & Browser</CardTitle>
                                <CardDescription className="text-xs">
                                    System information
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {deviceInfo && (
                            <div className="space-y-0">
                                <InfoRow label="Platform" value={deviceInfo.platform} />
                                <InfoRow label="Language" value={deviceInfo.language} />
                                <InfoRow label="Languages" value={deviceInfo.languages} />
                                <InfoRow
                                    label="Screen Resolution"
                                    value={`${deviceInfo.screenWidth} x ${deviceInfo.screenHeight}`}
                                />
                                <InfoRow
                                    label="Color Depth"
                                    value={`${deviceInfo.screenColorDepth}-bit`}
                                />
                                <InfoRow
                                    label="Pixel Ratio"
                                    value={deviceInfo.pixelRatio?.toString()}
                                />
                                <InfoRow
                                    label="Online Status"
                                    value={deviceInfo.online ? "Online" : "Offline"}
                                />
                                <InfoRow
                                    label="Cookies Enabled"
                                    value={deviceInfo.cookiesEnabled ? "Yes" : "No"}
                                />
                                <InfoRow label="Timezone" value={deviceInfo.timezone} />
                                <div className="py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-xs text-gray-500">User Agent</span>
                                    <p className="text-xs font-mono text-gray-700 mt-1 break-all bg-gray-50 rounded p-2">
                                        {deviceInfo.userAgent}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-400 pt-2 pb-4">
                    This page is for diagnostic purposes only. No data is stored or transmitted.
                </p>
            </div>
        </AppLayout>
    );
}
