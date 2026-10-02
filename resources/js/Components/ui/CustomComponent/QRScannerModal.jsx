import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import {
    QrCode,
    X,
    Camera,
    RefreshCw,
    Flashlight,
    FlashlightOff,
    UploadCloud,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    MapPin,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractLocationToken } from "@/lib/qr-utils";
import { toast } from "sonner";

export default function QRScannerModal({ open, onClose, onLocationFound }) {
    const [scannerState, setScannerState] = useState("initializing"); // "initializing" | "scanning" | "verifying" | "success" | "warning" | "error" | "permission-denied"
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [verifiedLocation, setVerifiedLocation] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);

    const html5QrCodeRef = useRef(null);
    const isStoppingRef = useRef(false);
    const fileInputRef = useRef(null);
    const isScanningActiveRef = useRef(false);

    const elementId = "attendance-qr-reader-viewport";

    // Stop the active scanner safely
    const stopScanner = async () => {
        if (!html5QrCodeRef.current || isStoppingRef.current) return;
        isStoppingRef.current = true;
        try {
            if (html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
        } catch (err) {
            console.warn("Error while stopping scanner:", err);
        } finally {
            isScanningActiveRef.current = false;
            isStoppingRef.current = false;
        }
    };

    // Start or restart camera scanner
    const startScanner = async (cameraId = null) => {
        setScannerState("initializing");
        setFeedbackMessage("");
        setVerifiedLocation(null);

        // Ensure previous scanner is stopped
        await stopScanner();

        // Check if element exists in DOM
        const targetElement = document.getElementById(elementId);
        if (!targetElement) {
            console.warn("Scanner container element not found yet");
            return;
        }

        try {
            const scannerInstance = new Html5Qrcode(elementId);
            html5QrCodeRef.current = scannerInstance;

            // Fetch available video input devices
            let devices = [];
            try {
                devices = await Html5Qrcode.getCameras();
                setCameras(devices);
            } catch (cameraFetchErr) {
                console.warn("Could not query camera devices list:", cameraFetchErr);
            }

            // Pick back/environment camera by default if available
            let cameraConfig = { facingMode: "environment" };
            if (cameraId) {
                cameraConfig = { deviceId: { exact: cameraId } };
                setSelectedCameraId(cameraId);
            } else if (devices.length > 0) {
                // Look for back/rear camera in labels
                const rearCamera = devices.find(
                    (d) =>
                        d.label.toLowerCase().includes("back") ||
                        d.label.toLowerCase().includes("rear") ||
                        d.label.toLowerCase().includes("environment")
                );
                const chosen = rearCamera ? rearCamera.id : devices[0].id;
                cameraConfig = { deviceId: { exact: chosen } };
                setSelectedCameraId(chosen);
            }

            await scannerInstance.start(
                cameraConfig,
                {
                    fps: 12,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const edge = Math.min(viewfinderWidth, viewfinderHeight);
                        const size = Math.floor(edge * 0.72);
                        return { width: Math.max(220, size), height: Math.max(220, size) };
                    },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    handleDecodedText(decodedText);
                },
                () => {
                    // Ignored per-frame scan failure
                }
            );

            isScanningActiveRef.current = true;
            setScannerState("scanning");

            // Check if torch/flashlight is supported
            try {
                // @ts-ignore
                const capabilities = scannerInstance.getRunningTrackCapabilities?.();
                if (capabilities && capabilities.torch) {
                    setTorchSupported(true);
                } else {
                    setTorchSupported(false);
                }
            } catch {
                setTorchSupported(false);
            }
        } catch (err) {
            console.error("Camera startup failed:", err);
            const errString = String(err).toLowerCase();
            if (
                errString.includes("notallowed") ||
                errString.includes("permission") ||
                errString.includes("denied")
            ) {
                setScannerState("permission-denied");
                setFeedbackMessage(
                    "Camera permission was denied. Please allow camera access in your browser settings or upload an image of the QR code."
                );
            } else {
                setScannerState("error");
                setFeedbackMessage(
                    "Unable to start camera. Please verify device permissions or try uploading a QR photo below."
                );
            }
        }
    };

    // Lifecycle: when modal opens or closes
    useEffect(() => {
        if (open) {
            // Small timeout to allow modal animation and DOM container to mount
            const timer = setTimeout(() => {
                startScanner();
            }, 150);
            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        } else {
            stopScanner();
        }
    }, [open]);

    // Handle scanned QR text
    const handleDecodedText = async (decodedText) => {
        if (!decodedText || isStoppingRef.current || scannerState === "verifying") return;

        // Extract expected location token
        const token = extractLocationToken(decodedText);

        if (!token) {
            // Unexpected QR content - not an attendance location link
            setScannerState("error");
            setFeedbackMessage(
                "Invalid QR Code: Expected an attendance location link (e.g. /?token=...). Please scan the official station QR code."
            );

            // Optional subtle vibration warning
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }

            // Resume scanning after 3.5 seconds
            setTimeout(() => {
                if (open && isScanningActiveRef.current) {
                    setScannerState("scanning");
                    setFeedbackMessage("");
                }
            }, 3500);
            return;
        }

        // Token found: Pause active scanning and verify with server
        setScannerState("verifying");
        setFeedbackMessage("Validating location QR with server...");

        try {
            const response = await axios.get(`/validate-qr-location?token=${encodeURIComponent(token)}`);
            const data = response.data;

            if (data.valid) {
                setVerifiedLocation(data);
                // Vibration success feedback
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                    navigator.vibrate(200);
                }

                // Recognize and directly redirect
                setScannerState("success");
                setFeedbackMessage(
                    `Location recognized: ${data.location}! Redirecting...`
                );
                localStorage.setItem("attendanceToken", data.token);
                toast.success(`Location identified: ${data.location}`);

                // Direct redirect
                setTimeout(async () => {
                    await stopScanner();
                    if (onLocationFound) {
                        onLocationFound(data);
                    } else {
                        window.location.href = data.redirect_url || `/?token=${data.token}`;
                    }
                }, 700);
            } else {
                setScannerState("error");
                setFeedbackMessage(data.message || "Unrecognized location QR code.");
            }
        } catch (err) {
            console.error("Token verification error:", err);
            // If network request failed (e.g. offline/network glitch) but we have a valid token, proceed with redirect
            if (!err.response && token) {
                localStorage.setItem("attendanceToken", token);
                window.location.href = `/?token=${encodeURIComponent(token)}`;
                return;
            }

            const errMsg =
                err.response?.data?.message ||
                "Unrecognized location QR. Please ensure you are scanning an official attendance QR code.";
            setScannerState("error");
            setFeedbackMessage(errMsg);

            // Resume scanning after 4 seconds
            setTimeout(() => {
                if (open && isScanningActiveRef.current) {
                    setScannerState("scanning");
                    setFeedbackMessage("");
                }
            }, 4000);
        }
    };

    // Switch between front/back cameras
    const handleSwitchCamera = async () => {
        if (cameras.length <= 1) return;
        const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        const nextCamera = cameras[nextIndex];
        await startScanner(nextCamera.id);
    };

    // Toggle flashlight/torch
    const handleToggleTorch = async () => {
        if (!html5QrCodeRef.current || !torchSupported) return;
        try {
            const newTorchState = !torchOn;
            await html5QrCodeRef.current.applyVideoConstraints({
                advanced: [{ torch: newTorchState }],
            });
            setTorchOn(newTorchState);
        } catch (e) {
            console.warn("Torch toggle failed:", e);
        }
    };

    // Handle image file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScannerState("verifying");
        setFeedbackMessage("Scanning uploaded QR image...");

        try {
            await stopScanner();
            const scanner = new Html5Qrcode(elementId);
            html5QrCodeRef.current = scanner;
            const decodedText = await scanner.scanFile(file, true);
            handleDecodedText(decodedText);
        } catch (err) {
            console.error("File scan failed:", err);
            setScannerState("error");
            setFeedbackMessage(
                "Could not find a valid QR code in the uploaded image. Please try another image or use the camera."
            );
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleClose = async () => {
        await stopScanner();
        onClose();
    };

    const handleProceedToLocation = async (url) => {
        await stopScanner();
        window.location.href = url;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <style>{`
                #${elementId} {
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                    position: relative;
                }
                #${elementId} video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 1.25rem !important;
                }
                #${elementId} img {
                    display: none !important;
                }
                @keyframes scanBeam {
                    0% { top: 6%; opacity: 0.85; }
                    50% { top: 90%; opacity: 1; }
                    100% { top: 6%; opacity: 0.85; }
                }
                .animate-scan-beam {
                    animation: scanBeam 2.2s ease-in-out infinite;
                }
            `}</style>

            <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                                Scan Location QR
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Point camera at station QR stand
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close Scanner"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Viewport Area */}
                <div className="p-4 sm:p-5 flex flex-col items-center space-y-4">
                    <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] rounded-3xl overflow-hidden bg-black shadow-inner border border-slate-800">
                        {/* Video Element Container */}
                        <div id={elementId} className="w-full h-full" />

                        {/* Custom Scanner Frame Overlay */}
                        {scannerState === "scanning" && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                                {/* Dimmed surroundings with cutout frame */}
                                <div className="relative w-full h-full border-2 border-white/30 rounded-2xl">
                                    {/* Top-left corner */}
                                    <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                                    {/* Top-right corner */}
                                    <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                                    {/* Bottom-left corner */}
                                    <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                                    {/* Bottom-right corner */}
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

                                    {/* Animated Scan Laser */}
                                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#3b82f6] animate-scan-beam" />
                                </div>
                            </div>
                        )}

                        {/* Viewport States (Loading / Permission / Verifying) */}
                        {scannerState === "initializing" && (
                            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
                                <LoaderCircle className="w-8 h-8 text-blue-500 animate-spin" />
                                <span className="text-xs font-semibold text-white">
                                    Starting camera...
                                </span>
                            </div>
                        )}

                        {scannerState === "verifying" && (
                            <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2.5 z-10">
                                <LoaderCircle className="w-9 h-9 text-indigo-400 animate-spin" />
                                <span className="text-xs font-bold text-white tracking-wide">
                                    Validating Location QR...
                                </span>
                                <span className="text-[11px] text-slate-300 max-w-[200px]">
                                    Connecting to attendance server
                                </span>
                            </div>
                        )}

                        {scannerState === "success" && (
                            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2 z-10 animate-in zoom-in-95">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/30">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <span className="text-sm font-black text-white">
                                    Location Verified!
                                </span>
                                <span className="text-xs text-emerald-200">
                                    Redirecting to attendance...
                                </span>
                            </div>
                        )}

                        {scannerState === "permission-denied" && (
                            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center space-y-3 z-10">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-white block">
                                        Camera Permission Needed
                                    </span>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Please enable camera access in your browser or select an image file instead.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startScanner()}
                                    className="h-8 text-xs text-white border-slate-700 hover:bg-slate-800"
                                >
                                    Retry Camera
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Quick Camera Action Controls */}
                    <div className="flex items-center justify-center gap-2">
                        {cameras.length > 1 && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleSwitchCamera}
                                className="h-9 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                                title="Switch Camera"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Switch</span>
                            </Button>
                        )}

                        {torchSupported && (
                            <Button
                                type="button"
                                size="sm"
                                variant={torchOn ? "default" : "outline"}
                                onClick={handleToggleTorch}
                                className="h-9 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                                title="Toggle Flashlight"
                            >
                                {torchOn ? (
                                    <>
                                        <FlashlightOff className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Light Off</span>
                                    </>
                                ) : (
                                    <>
                                        <Flashlight className="w-3.5 h-3.5" />
                                        <span>Light</span>
                                    </>
                                )}
                            </Button>
                        )}

                        {/* File Upload Fallback */}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 px-3 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                        >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload QR</span>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Dynamic Feedback Banner */}
                    {feedbackMessage && (
                        <div
                            className={`w-full p-3 rounded-2xl text-left flex items-start gap-2.5 transition-all animate-in fade-in ${
                                scannerState === "error"
                                    ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200"
                                    : scannerState === "warning"
                                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200"
                                    : scannerState === "success"
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200"
                                    : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200"
                            }`}
                        >
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed flex-1">
                                {feedbackMessage}
                            </div>
                        </div>
                    )}

                    {/* Warning Actions (if location found but attendance not open/active) */}
                    {scannerState === "warning" && verifiedLocation && (
                        <div className="w-full space-y-2 pt-1">
                            <Button
                                type="button"
                                onClick={() => handleProceedToLocation(verifiedLocation.redirect_url)}
                                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Go to {verifiedLocation.location} anyway</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => startScanner()}
                                className="w-full h-10 rounded-xl text-xs font-semibold"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                <span>Scan Another QR Code</span>
                            </Button>
                        </div>
                    )}

                    {/* Helpful instructions footer */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed">
                        The QR link depends on your attendance station. Make sure to scan the designated poster QR code.
                    </div>
                </div>
            </div>
        </div>
    );
}
