import React from 'react'

import { Lock } from 'lucide-react'
import { closedStatusContants } from '@/constants/contants'

const ClosedStatus = () => {
    const { header, description } = closedStatusContants;
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <Lock className="w-10 h-10 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
                {header}
            </h2>
            <p className="text-sm text-gray-500 text-center">
                {description}
            </p>
        </div>
    )
}

export default ClosedStatus