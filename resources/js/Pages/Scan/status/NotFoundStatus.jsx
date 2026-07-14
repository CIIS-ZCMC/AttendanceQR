import React from 'react'

import { AlertCircle, MapPin, Clock } from 'lucide-react'
import { notFoundStatusContants } from '@/constants/contants'

const NotFoundStatus = ({ activeMapLocation }) => {
    const { header, description } = notFoundStatusContants;
    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h2 className="text-md font-semibold text-gray-800">
                {header}
            </h2>
            <p className="text-xs text-gray-500 text-center">
                {description}
            </p>

            {activeMapLocation && (
                <div className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
                   
                    <h3 className="text-sm font-semibold text-gray-900">
                        {activeMapLocation.location}
                    </h3>
                    {activeMapLocation.description && (
                        <p className="text-xs text-gray-600 mt-1">
                            {activeMapLocation.description}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="font-mono">
                            {activeMapLocation.lat}, {activeMapLocation.lng}
                        </span>
                        {activeMapLocation.open_time && activeMapLocation.closing_time && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activeMapLocation.open_time?.slice(0, 5)} — {activeMapLocation.closing_time?.slice(0, 5)}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotFoundStatus