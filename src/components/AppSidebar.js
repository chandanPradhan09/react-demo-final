// components/AppSidebar.jsx

"use client";

import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { menu, iconMap } from "@/data/data";
import Link from "next/link";
import Image from "next/image";

export default function AppSidebar() {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarHeader className="flex items-center justify-center">
                    <Image
                        src={isCollapsed ? "/pnbLogo-h.svg" : "/pnbLogo.svg"}
                        alt="Logo"
                        width={isCollapsed ? 51 : 127}
                        height={isCollapsed ? 51 : 51}
                        priority
                    />
                </SidebarHeader>
                <SidebarGroup className="px-0 transition-all duration-200">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menu.map((item) => {
                                const isActive = pathname === item.path;

                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    className={cn(
                                                        "relative flex items-center transition-all duration-200",

                                                        // EXPANDED
                                                        !isCollapsed &&
                                                            "p-5 text-base justify-start",

                                                        // COLLAPSED
                                                        isCollapsed &&
                                                            "p-2 justify-center size-10 mx-auto",

                                                        // ACTIVE STATE
                                                        isActive
                                                            ? cn(
                                                                  "bg-primary! text-white! after:absolute after:right-0 after:top-0 after:h-full after:bg-secondary",

                                                                  !isCollapsed &&
                                                                      "after:w-1",

                                                                  isCollapsed &&
                                                                      "after:w-0.5 rounded-xs",
                                                              )
                                                            : "hover:bg-gray-100",
                                                    )}
                                                >
                                                    <Link
                                                        href={item.path}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Image
                                                            src={
                                                                isActive
                                                                    ? iconMap[
                                                                          item
                                                                              .icon
                                                                      ] +
                                                                      "-w.svg"
                                                                    : iconMap[
                                                                          item
                                                                              .icon
                                                                      ] +
                                                                      "-b.svg"
                                                            }
                                                            alt={item.name}
                                                            width={20}
                                                            height={20}
                                                            className={
                                                                isActive
                                                                    ? "fill-white"
                                                                    : "fill-black"
                                                            }
                                                        />
                                                        {!isCollapsed && (
                                                            <span>
                                                                {item.name}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </TooltipTrigger>

                                            {isCollapsed && (
                                                <TooltipContent side="right">
                                                    {item.name}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
