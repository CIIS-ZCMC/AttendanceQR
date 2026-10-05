import React from "react";

const StatusCardComponent = ({ statusContent }) => {
    return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                {statusContent}
            </div>
        </div>
    );
};

export default StatusCardComponent;