import React from 'react';

import { Card, CardContent } from '@/Components/ui/card';

const StatusCardComponent = ({ statusContent }) => {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="w-full max-w-md shadow-md border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    {statusContent}
                </CardContent>
            </Card>
        </div>

    )
}

export default StatusCardComponent