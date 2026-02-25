import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
export function UserMenu() {
    var _a = useAuth(), user = _a.user, logout = _a.logout;
    if (!user)
        return null;
    var initials = user.full_name
        ? user.full_name
            .split(" ")
            .map(function (n) { return n[0]; })
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : user.email.slice(0, 2).toUpperCase();
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-9 w-9 rounded-full", children: _jsx(Avatar, { className: "h-9 w-9", children: _jsx(AvatarFallback, { className: "bg-gradient-signature text-white text-sm font-semibold", children: initials }) }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsx(DropdownMenuLabel, { className: "font-normal", children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: user.full_name || "User" }), _jsx("p", { className: "text-xs text-muted-foreground", children: user.email })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: logout, className: "cursor-pointer text-destructive focus:text-destructive", children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), "Sign out"] })] })] }));
}
