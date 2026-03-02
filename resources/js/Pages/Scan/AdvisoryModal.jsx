import React from 'react';
import { TriangleAlert, Gavel, Scale, ShieldAlert, X } from 'lucide-react';

export default function AdvisoryModal({ open, setOpen }) {
    if (!open) return null;

    return (
        // Added overflow-y-auto to the overlay so content is reachable if it exceeds screen height
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">

            {/* max-h-[90vh] ensures the modal doesn't touch the very edges of the screen on tiny phones */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] sm:max-h-none">

                {/* Close Button - Increased touch target size for mobile */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Header Section */}
                <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <TriangleAlert className="text-red-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-gray-900 font-black text-lg sm:text-xl tracking-tight leading-none">
                                OFFICIAL ADVISORY
                            </h2>
                            <p className="text-gray-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1">
                                Location Integrity & Data Authenticity
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Content - Added scrollability if content is too long for mobile */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        The system has detected <span className="font-bold text-gray-900 underline decoration-red-300">irregularities</span> associated with geographical data. Providing authentic, real-time location information is a <span className="font-bold">mandatory requirement</span>.
                    </p>

                    {/* Policy Violation Box */}
                    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 border-l-4 border-black rounded-r-lg">
                        <Gavel className="text-gray-700 shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Policy Violation</h4>
                            <p className="text-gray-600 text-[11px] sm:text-xs mt-1 leading-relaxed">
                                The use of unauthorized tools to bypass location-based restrictions is a direct breach of the Code of Conduct.
                            </p>
                        </div>
                    </div>

                    {/* Consequences List */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm uppercase tracking-wide">
                            <Scale size={16} className="text-amber-600" />
                            <span>Consequences of Non-Compliance</span>
                        </div>
                        <ul className="space-y-2 sm:space-y-3 pl-1">
                            <li className="flex gap-3 text-xs sm:text-sm text-gray-700">
                                <span className="text-amber-600 font-bold">•</span>
                                <span><span className="font-bold text-gray-900">Formal HR Intervention:</span> Immediate summoning for an official explanatory meeting.</span>
                            </li>
                            <li className="flex gap-3 text-xs sm:text-sm text-gray-700">
                                <span className="text-amber-600 font-bold">•</span>
                                <span><span className="font-bold text-gray-900">IPCR Rating Impact:</span> Manipulation leads to a significant deduction (<span className="text-red-600 font-black">Unsatisfactory Rating</span>).</span>
                            </li>
                        </ul>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <ShieldAlert size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] sm:text-[11px] italic text-blue-800 leading-tight">
                            Note: Security protocols automatically identify discrepancies in coordinate data. Parameters remain non-disclosed.
                        </p>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={() => setOpen(false)}
                        className="w-full px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] shadow-md shadow-blue-200 uppercase tracking-widest"
                    >
                        I UNDERSTAND
                    </button>
                </div>
            </div>
        </div>
    );
}