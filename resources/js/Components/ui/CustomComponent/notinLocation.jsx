import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import warning from "../../../src/warning.gif";

import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { Toaster } from "sonner";
import location from "../../../src/location.png";
import { Smartphone, Globe } from "lucide-react";
import { GoogleMap, Circle, Marker } from "@react-google-maps/api";

const GEOFENCE_RADIUS = 30;

export const NotInLocation = ({ locationService, distance, activeMapLocation, userCoords }) => {

    const page = usePage();
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return "Good morning";
        } else if (hour >= 12 && hour < 17) {
            return "Good afternoon";
        } else {
            return "Good evening";
        }
    };

    return (
        <>
            <div className="lg:mt-120">

                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-center mb-4">
                        <div className="text-2xl font-bold uppercase text-blue-700 mb-4">
                            {getGreeting()}!
                        </div>

                        {activeMapLocation && (
                            <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-4 mb-4 max-w-xs mx-auto">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Attendance Location
                                </div>
                                <div className="text-lg font-semibold text-gray-800">
                                    {activeMapLocation.location}
                                </div>
                                {activeMapLocation.description && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        {activeMapLocation.description}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                           
                             <img
                        src={warning}
                        alt="Warning"
                        className="w-10 h-10 "
                    />
                  

                            Unable to log attendance — you are outside the allowed area.
                        </div>
                    </div>
                   
                    <span className="text-xs text-center text-red-600">
                        {locationService ? (
                            <>
                              
                                <span className="font-semibold text-gray-600 text-xs">
                                    Approximately{" "}
                                    <span className="font-bold text-red-600 text-lg">
                                        {distance?.toFixed(2)}
                                    </span>{" "}
                                    meters away from the allowed area.
                                </span>
                            </>
                        ) : (
                            <p className="text-xs text-center text-gray-600">
                                <span className="font-semibold text-lg">
                                    Location access is currently
                                    disabled.
                                </span>
                                <br />
                                <div className="flex justify-center max-h-[50vh] overflow-y-auto">
                                    <div className="border-t p-3 pt-4 mt-4 text-left space-y-3">
                                        <span className="font-semibold text-sm">
                                            To enable location access,
                                            follow these steps:
                                        </span>
                                        <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                            <Smartphone className="w-5 h-5 text-green-500" />{" "}
                                            For Android:
                                        </h3>
                                        <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                                            <li>
                                                Open <b>Settings</b> →{" "}
                                                <b>Location</b>
                                            </li>
                                            <li>
                                                Turn on{" "}
                                                <b>Use location</b>
                                            </li>
                                            <li>
                                                Allow this app or
                                                browser to access your
                                                location when prompted
                                            </li>
                                        </ul>

                                        <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                            <Globe className="w-5 h-5 text-blue-500" />{" "}
                                            For iOS:
                                        </h3>
                                        <ul className="list-disc pl-6 text-gray-600 text-sm space-y-1">
                                            <li>
                                                Open <b>Settings</b> →{" "}
                                                <b>
                                                    Privacy & Security
                                                </b>{" "}
                                                →{" "}
                                                <b>Location Services</b>
                                            </li>
                                            <li>
                                                Ensure{" "}
                                                <b>Location Services</b>{" "}
                                                is turned on
                                            </li>
                                            <li>
                                                Find your browser (e.g.
                                                Safari, Chrome) and set
                                                it to{" "}
                                                <b>
                                                    While Using the App
                                                </b>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </p>
                        )}
                    </span>

                    {locationService && (
                        <p className="text-sm mt-2 p-3">
                            Kindly move to the allowed area and click{" "}
                            <span className="font-semibold">Try Again</span>.
                        </p>
                    )}

                    {locationService && mapsReady && activeMapLocation && !!activeMapLocation.w_map && userCoords && (
                        <div className="w-full mt-2 rounded-lg overflow-hidden border border-gray-200">
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "300px" }}
                                center={{ lat: parseFloat(activeMapLocation.lat), lng: parseFloat(activeMapLocation.lng) }}
                                zoom={17}
                                options={{
                                    zoomControl: true,
                                    mapTypeControl: false,
                                    streetViewControl: false,
                                    fullscreenControl: true,
                                }}
                            >
                                <Circle
                                    center={{ lat: parseFloat(activeMapLocation.lat), lng: parseFloat(activeMapLocation.lng) }}
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
                                    position={{ lat: parseFloat(activeMapLocation.lat), lng: parseFloat(activeMapLocation.lng) }}
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
                                <Marker
                                    position={{ lat: userCoords.lat, lng: userCoords.lng }}
                                    label={{ text: "You", fontSize: "10px", className: "bg-red-500" }}
                                    icon={{
                                        path: window.google.maps.SymbolPath.PIN,
                                        scale: 1.2,
                                        fillColor: "#ef4444",
                                        fillOpacity: 1,
                                        strokeColor: "#dc2626",
                                        strokeWeight: 1,
                                    }}
                                />
                            </GoogleMap>
                        </div>
                    )}
                </div>

                <Link href={(() => {
                    const savedToken = localStorage.getItem("attendanceToken");
                    return savedToken ? `/?token=${savedToken}` : "/";
                })()}>
                    <Button type="button" className="w-full">
                        Try again
                    </Button>
                </Link>
            </div>
            <Toaster position="top-right" richColors />
        </>

    );
};
