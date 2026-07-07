import { useState } from "react"
import { cn } from "@/lib/utils"
import { NavLink, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Building, LogOut, Calendar, ChevronDown, ChevronRight, Settings, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { UserRole } from "@/types"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

interface SubMenuItem {
    label: string
    href: string
    allowedRoles?: UserRole[]
}

interface MenuItem {
    label: string
    icon: React.ElementType
    href?: string
    allowedRoles?: UserRole[]
    subItems?: SubMenuItem[]
}

export const menuItems: MenuItem[] = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "Building",
        icon: Building,
        href: "/buildings",
    },
    {
        label: "Crews",
        icon: Users,
        href: "/crews",
    },
    {
        label: "Enquiries",
        icon: MessageSquare,
        subItems: [
            { label: "Add Enquiries", href: "/enquiries/add" },
            { label: "All Enquiries", href: "/enquiries/all" }
        ]
    },
    {
        label: "Schedules",
        icon: Calendar,
        subItems: [
            { label: "Calendar View", href: "/schedules/calendar" },
            { label: "Jobs", href: "/schedules/jobs" },
            { label: "Add Schedule", href: "/schedules/add" }
        ]
    },

    {
        label: "Settings",
        icon: Settings,
        subItems: [
            { label: "Services", href: "/settings/services" },
            { label: "Users", href: "/users", allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
        ]
    }
]



export function Sidebar({ className }: SidebarProps) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
        const initialOpenState: Record<string, boolean> = {};
        menuItems.forEach(item => {
            if (item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.href))) {
                initialOpenState[item.label] = true;
            }
        });
        return initialOpenState;
    });

    const toggleMenu = (label: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    return (
        <div className={cn("pb-12 min-h-screen border-r border-[#001e60] bg-[#001e60] w-56 flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1">
                <div className="px-6 py-4 flex items-center justify-center">
                    <img src="/logo.png" alt="Osool Admin" className="h-16 w-auto" />
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            if (item.allowedRoles && (!user || !item.allowedRoles.includes(user.role))) return null;

                            if (item.subItems) {
                                const isOpen = openMenus[item.label];
                                const isActive = item.subItems.some(sub => location.pathname.startsWith(sub.href));
                                
                                return (
                                    <div key={item.label} className="space-y-1">
                                        <button
                                            onClick={() => toggleMenu(item.label)}
                                            className={cn(
                                                "flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-md transition-colors",
                                                isActive
                                                    ? "bg-white/10 text-white"
                                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.label}
                                            </div>
                                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>
                                        
                                        {isOpen && (
                                            <div className="pl-11 pr-4 space-y-1">
                                                {item.subItems.map(subItem => {
                                                    if (subItem.allowedRoles && (!user || !subItem.allowedRoles.includes(user.role))) return null;
                                                    
                                                    return (
                                                        <NavLink
                                                            key={subItem.href}
                                                            to={subItem.href}
                                                            className={({ isActive }) => cn(
                                                                "flex items-center w-full py-2 text-sm font-medium rounded-md transition-colors",
                                                                isActive
                                                                    ? "text-white"
                                                                    : "text-white/60 hover:text-white"
                                                            )}
                                                        >
                                                            {subItem.label}
                                                        </NavLink>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.href!}
                                    to={item.href!}
                                    className={({ isActive }) => cn(
                                        "flex items-center w-full px-4 py-3 text-base font-medium rounded-md transition-colors",
                                        isActive
                                            ? "bg-white/10 text-white"
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </NavLink>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="px-3 py-4 mt-auto border-t">
                {user && (
                    <div className="px-4 py-2 mb-2 text-sm text-white/70">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs">{user.role}</p>
                    </div>
                )}
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={logout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    )
}
