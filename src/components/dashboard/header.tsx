import { UserButton } from "@clerk/nextjs";
import { NotificationBell } from "./notification-bell";

export function Header() {
    return (
        <header className="h-16 flex items-center justify-between px-6 bg-pm-blue shadow-sm border-b border-blue-900/50 sticky top-0 z-40">
            <div className="flex-1">
                {/* Opcional: Breadcrumbs ou Título dinâmico */}
            </div>
            <div className="flex items-center space-x-4">
                <NotificationBell />
                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
    );
}
