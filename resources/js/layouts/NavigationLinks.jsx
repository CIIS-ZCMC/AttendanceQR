import { Link } from "@inertiajs/react";

const NavigationLinks = ({ href, title, Icon, page }) => {

    const pageActive = page.url.split("?")[0] === href;

    return (
        <div>
            <Link href={href}>
                <div
                    className={`ml-2 p-2 flex items-center space-x-3  ${pageActive
                        ? "text-white"
                        : "text-gray-500"
                        }`}
                >
                    {Icon && (
                        <Icon className="w-5 h-5" />
                    )}
                    <span>{title}</span>
                </div>
            </Link>
        </div>
    );
}

export default NavigationLinks;