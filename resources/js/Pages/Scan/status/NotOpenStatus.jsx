import { Button } from "@/components/ui/button";
import { usePage, Link } from "@inertiajs/react";

import warning from '../../../src/warning.gif';
import { notOpenStatusContants } from '@/constants/contants';

const NotOpenStatus = () => {
    const { header, description, label } = notOpenStatusContants;

    const page = usePage();

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <img
                src={warning}
                alt=""
                width="60px"
                height="60px"
            />
            <h2 className="text-sm font-semibold text-gray-800">
                {header}
            </h2>
            <p className="text-xs text-gray-500 text-center">
                {description}
            </p>
            <Link href={page.url}>
                <Button type="button" size="sm">
                    {label}
                </Button>
            </Link>
        </div>
    )
}

export default NotOpenStatus