"use client";

import { useTransition } from "react";
import { confirmarPresenca } from "@/server/actions/dashboard";
import { cancelarAgendamento } from "@/server/actions/agendamentos";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface Props {
    agendamentoId: string;
    dataHora: Date;
    status: string;
}

export function ConfirmarPresencaBtn({ agendamentoId, dataHora, status }: Props) {
    const [isPending, startTransition] = useTransition();

    const horarioAtingido = new Date() >= new Date(dataHora);

    if (status === "Realizado") {
        return (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Realizado
            </span>
        );
    }

    if (status === "Cancelado") {
        return <span className="text-xs text-slate-400 italic">Cancelado</span>;
    }

    if (!horarioAtingido) {
        return <span className="text-xs text-slate-400 italic">Aguardando horário</span>;
    }

    function handleConfirmar() {
        startTransition(async () => {
            const res = await confirmarPresenca(agendamentoId);
            if (res.success) toast.success(res.message);
            else toast.error(res.message);
        });
    }

    function handleNaoCompareceu() {
        startTransition(async () => {
            const res = await cancelarAgendamento(agendamentoId);
            if (res.success) toast.warning("Agendamento cancelado — policial não compareceu.");
            else toast.error(res.message);
        });
    }

    return (
        <div className="flex gap-2 justify-end flex-wrap">
            <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                onClick={handleConfirmar}
                disabled={isPending}
            >
                ✓ Compareceu
            </Button>
            <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
                onClick={handleNaoCompareceu}
                disabled={isPending}
            >
                ✗ Não Compareceu
            </Button>
        </div>
    );
}
