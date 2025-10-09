import { Button } from "@/Components/ui/button";
import { Menu, X } from "lucide-react";

import {
    Drawer,
    DrawerTrigger,
    DrawerTitle,
    DrawerContent,
    DrawerHeader,
    DrawerClose,
} from "@/components/ui/drawer";

//layout components
import NavigationLinks from "./NavigationLinks";

// assets & contants
import { mainNavItems } from "@/constants/navBarItems";
import logo from "../src/zcmc.jpeg";
import { drawerContants } from "@/constants/contants";

const Header = ({ page }) => {

    const { sidebarHeader, header } = drawerContants;

    return (
        <header className="flex items-center space-x-2 h-15 p-2 fixed top-0 left-0 bg-gray-800 text-white right-0 shadow-md">

            <Drawer direction="left">

                {/* Trigger to open drawer */}
                <DrawerTrigger>
                    <Button
                        variant="outline"
                        className="bg-gray-800"
                    >
                        <Menu className={"text-3xl"} />
                    </Button>

                </DrawerTrigger>

                <DrawerContent className="bg-gray-800">
                    <DrawerHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-none ml-[-3px]">
                                <img
                                    src={logo}
                                    alt=""
                                    width="40px"
                                    height="40px"
                                />
                            </div>

                            <DrawerClose>
                                <Button
                                    variant="outline"
                                    className="bg-gray-800"
                                >
                                    <X className="text-white" />
                                </Button>
                            </DrawerClose>
                        </div>

                        <DrawerTitle
                            className={"my-3 text-white text-xl flex-1"}
                        >
                            {sidebarHeader}
                        </DrawerTitle>
                        {/* <DrawerDescription>This action cannot be undone.</DrawerDescription> */}
                    </DrawerHeader>

                    {/* sidebar navigation */}
                    <nav className=" flex flex-col space-y-2">
                        {mainNavItems.map(({ title, href, icon }) => (
                            <NavigationLinks
                                key={title}
                                title={title}
                                href={href}
                                icon={icon}
                                page={page}
                            />
                        ))}
                    </nav>

                </DrawerContent>
            </Drawer>

            <div className="flex items-center space-x-2">
                <img src={logo} alt="" width="24px" height="24px" />
                <span className="text-xs font-bold">
                    {header}
                </span>
            </div>

        </header>
    );
};

export default Header;