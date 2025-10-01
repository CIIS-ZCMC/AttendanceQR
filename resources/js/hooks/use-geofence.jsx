import React, { useEffect, useState } from "react";
import { LoadScript } from "@react-google-maps/api";
export function useGeofence() {
    const [isInsideGeofence, setIsInsideGeofence] = useState(false);
    const geofenceCenter = { lat: 6.905891, lng: 122.080778 };
    const geofenceRadius = 50;

    useEffect(() => {
        if (!geofenceCenter || !geofenceRadius) return; // prevent errors

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    checkGeofence(coords);
                },
                () => {
                    alert("❌ Unable to fetch location.");
                }
            );
        } else {
            alert("❌ Geolocation not supported.");
        }
    }, []);

    const checkGeofence = (coords) => {
        // const userLatLng = new window.google.maps.LatLng(
        //     coords.lat,
        //     coords.lng
        // );
        const userLatLng = new window.google.maps.LatLng(
            geofenceCenter.lat,
            geofenceCenter.lng
        );

        const geofenceLatLng = new window.google.maps.LatLng(
            geofenceCenter.lat,
            geofenceCenter.lng
        );
        const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
                userLatLng,
                geofenceLatLng
            );

        if (distance <= geofenceRadius) {
            setIsInsideGeofence(true);
        } else {
            //Set this to false
            setIsInsideGeofence(false);
        }
    };

    return isInsideGeofence;
}
