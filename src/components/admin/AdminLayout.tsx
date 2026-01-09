import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Users,
    GitCompare,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    ChevronLeft,
    Shield,
} from 'lucide-react';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/reports', label: 'Reports Management', icon: FileText },
    { href: '/admin/users', label: 'Users Management', icon: Users },
    { href: '/admin/matches', label: 'Matches', icon: GitCompare },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Sidebar - Desktop */}
            <aside
                className={cn(
                    "fixed right-0 top-0 z-40 h-screen bg-card border-l shadow-lg transition-all duration-300 hidden lg:block",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
                                <p className="text-xs text-muted-foreground">LoFoNet System</p>
                            </div>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:flex"
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", !isSidebarOpen && "rotate-180")} />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 right-0 left-0 p-4 border-t bg-card">
                    <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size={isSidebarOpen ? "default" : "icon"}
                        onClick={handleLogout}
                        className={cn("w-full mt-3 text-destructive hover:text-destructive hover:bg-destructive/10", !isSidebarOpen && "mt-2")}
                    >
                        <LogOut className="h-4 w-4" />
                        {isSidebarOpen && <span className="mr-2">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 right-0 left-0 z-50 h-16 bg-card border-b shadow-sm">
                <div className="flex items-center justify-between h-full px-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Link to="/admin" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                            <Shield className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold">Dashboard</span>
                    </Link>

                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-foreground/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <aside
                        className="fixed right-0 top-0 h-full w-72 bg-card shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between h-16 px-4 border-b">
                            <Link to="/admin" className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                                    <Shield className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <span className="font-bold">Dashboard</span>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <nav className="p-4 space-y-2">
                            {sidebarLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="absolute bottom-0 right-0 left-0 p-4 border-t">
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="mr-2">Logout</span>
                            </Button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className={cn(
                "min-h-screen transition-all duration-300 pt-16 lg:pt-0",
                isSidebarOpen ? "lg:mr-64" : "lg:mr-20"
            )}>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}