"use client";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

export function MobileNav({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <header className="h-16 flex items-center justify-between px-4 bg-pm-blue text-white shadow-md">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-blue-800">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-pm-blue border-none">
                    <div onClick={() => setOpen(false)} className="h-full">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>

            <div className="font-bold tracking-tight">Agenda PMESP</div>

            <UserButton afterSignOutUrl="/" />
        </header>
    );
}
