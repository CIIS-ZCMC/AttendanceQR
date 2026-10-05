import { useJsApiLoader } from "@react-google-maps/api";

// All callers MUST share these exact options; the underlying loader is a
// singleton and throws if it's called again with different options.
// Keep LIBRARIES as a module-level constant (stable reference).
const GOOGLE_MAPS_API_KEY = "AIzaSyDok3Z6YRFk0Oj1f_bMTuWCDwDMOp6u4Sw";
const LIBRARIES = ["geometry"];

/**
 * Loads the Google Maps JS API once for the whole app.
 *
 * `isLoaded` only becomes true after Google's loader callback fires, i.e. when
 * classes like google.maps.Polyline are fully initialised. Do NOT poll for
 * `window.google.maps` instead: with `loading=async` that namespace exists
 * before the modules are ready, which causes errors such as
 * "Cannot read properties of undefined (reading 'setAt')".
 */
export default function useGoogleMaps() {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    return { isLoaded, loadError };
}
