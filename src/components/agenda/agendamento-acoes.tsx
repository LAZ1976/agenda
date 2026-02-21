"use client";

import { useTransition } from "react";
import { cancelarAgendamento } from "@/server/actions/agendamentos";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
    agendamentoId: string;
    status: string;
}

export function AgendamentoAcoes({ agendamentoId, status }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const podeAlterar = status === "Agendado";

    function handleCancelar() {
        startTransition(async () => {
            const res = await cancelarAgendamento(agendamentoId);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        });
    }

    if (!podeAlterar) {
        return <span className="text-xs text-slate-400 italic">—</span>;
    }

    return (
        <div className="flex gap-2 justify-end flex-wrap">
            <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
                onClick={() => router.push(`/dashboard/agendar?editar=${agendamentoId}`)}
                disabled={isPending}
            >
                Alterar
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
                        disabled={isPending}
                    >
                        {isPending ? "..." : "Cancelar"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O protocolo <strong>{agendamentoId}</strong> será cancelado e o horário ficará disponível para outros policiais. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelar}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Confirmar Cancelamento
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
