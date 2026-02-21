"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotificacoesNaoLidas, marcarComoLidas } from "@/server/actions/notificacoes";

export function NotificationBell() {
    const [notificacoes, setNotificacoes] = useState<{ id: string, mensagem: string, lida: boolean, createdAt: Date }[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchNotifs() {
            const data = await getNotificacoesNaoLidas();
            setNotificacoes(data);
        }
        fetchNotifs();
    }, []);

    async function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen);
        if (!isOpen && notificacoes.length > 0) {
            // Ao fechar, marcar como lidas no banco
            await marcarComoLidas();
            setNotificacoes([]);
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-blue-800 focus-visible:ring-0">
                    <Bell className="h-5 w-5" />
                    {notificacoes.length > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-pm-blue"></span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificacoes.length === 0 ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                        Nenhuma notificação nova.
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notificacoes.map((n) => (
                            <DropdownMenuItem key={n.id} className="flex flex-col items-start p-3 gap-1 cursor-default">
                                <span className="text-sm font-medium">{n.mensagem}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                                    })}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
