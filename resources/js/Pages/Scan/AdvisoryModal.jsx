import React from 'react';
import { TriangleAlert, Gavel, Scale, ShieldAlert, X } from 'lucide-react';

export default function AdvisoryModal({ open, setOpen }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header Section */}
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <TriangleAlert className="text-red-400" size={28} />
                        </div>
                        <div>
                            <h2 className="text-black-700 font-black text-xl tracking-tight">
                                OFFICIAL ADVISORY
                            </h2>
                            <p className="text-black-600/80 text-sm font-semibold uppercase tracking-wider">
                                Location Integrity & Data Authenticity
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5">
                    <p className="text-gray-700 leading-relaxed">
                        The system has detected <span className="font-bold text-black-700 underline decoration-red-300">irregularities</span> associated with geographical data. Providing authentic, real-time location information is a <span className="font-bold">mandatory requirement</span> for all personnel.
                    </p>

                    {/* Policy Violation Box */}
                    <div className="flex gap-4 p-4 bg-slate-50 border-l-4 border-black-600 rounded-r-lg">
                        <Gavel className="text-black-600 shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Policy Violation</h4>
                            <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                                The use of unauthorized tools or methods to bypass location-based restrictions—including manipulation—is a direct breach of the Code of Conduct.
                            </p>
                        </div>
                    </div>

                    {/* Consequences List */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                            <Scale size={18} className="text-amber-600" />
                            <span>Consequences of Non-Compliance</span>
                        </div>
                        <ul className="space-y-3 pl-2">
                            <li className="flex gap-3 text-sm text-gray-700">
                                <span className="text-amber-600 font-bold">•</span>
                                <span><span className="font-bold">Formal HR Intervention:</span> Immediate summoning for an official explanatory meeting.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-gray-700">
                                <span className="text-amber-600 font-bold">•</span>
                                <span><span className="font-bold">IPCR Rating Impact:</span> Manipulation will lead to a significant deduction (<span className="text-red-600 font-black">Unsatisfactory Rating</span>) in your IPCR.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <ShieldAlert size={16} className="text-blue-600 mt-0.5" />
                        <p className="text-[11px] italic text-blue-800 leading-tight">
                            Note: Security protocols automatically identify discrepancies in coordinate data and hardware signatures. Specific detection parameters remain non-disclosed.
                        </p>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto px-8 py-2.5 bg-blue-900 hover:bg-blue-850 text-white font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-blue-200"
                    >
                        I UNDERSTAND
                    </button>
                </div>
            </div>
        </div>
    );
}