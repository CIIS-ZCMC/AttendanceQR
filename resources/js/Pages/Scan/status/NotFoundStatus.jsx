import React from 'react'

import { AlertCircle } from 'lucide-react'
import { notFoundStatusContants } from '@/constants/contants'

const NotFoundStatus = () => {
    const { header, description } = notFoundStatusContants;
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h2 className="text-md font-semibold text-gray-800">
                {header}
            </h2>
            <p className="text-xs text-gray-500 text-center">
                {description}
            </p>
        </div>

    )
}

export default NotFoundStatus