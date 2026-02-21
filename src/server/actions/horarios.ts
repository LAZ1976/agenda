"use server";

import { db } from "@/db";
import { agendamentos, bloqueios } from "@/db/schema";
import { eq, and, gte, lt, or } from "drizzle-orm";

/**
 * Retorna os slots de 30 minutos disponíveis para uma determinada data.
 * Regras: Seg-Sex, 08:30-12:00 e 14:00-18:00.
 */
export async function getHorariosDisponiveis(dataConsulta: Date) {
    // 1. Gera todos os slots possíveis para o dia
    const slotsPeriodoManha = gerarSlots(dataConsulta, 8, 30, 12, 0);
    const slotsPeriodoTarde = gerarSlots(dataConsulta, 14, 0, 18, 0);
    const todosSlots = [...slotsPeriodoManha, ...slotsPeriodoTarde];

    // 2. Busca agendamentos já existentes neste dia no Banco
    const inicioDia = new Date(dataConsulta);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(dataConsulta);
    fimDia.setHours(23, 59, 59, 999);

    const agendados = await db
        .select({ dataHora: agendamentos.dataHora })
        .from(agendamentos)
        .where(
            and(
                gte(agendamentos.dataHora, inicioDia),
                lt(agendamentos.dataHora, fimDia),
                eq(agendamentos.status, "Agendado")
            )
        );

    const horariosOcupados = new Set(
        agendados.map((a) => new Date(a.dataHora).getTime())
    );

    // 3. Buscar Bloqueios Administrativos do dia
    const bloqueiosDia = await db
        .select({ inicio: bloqueios.inicio, fim: bloqueios.fim })
        .from(bloqueios)
        .where(
            or(
                and(gte(bloqueios.inicio, inicioDia), lt(bloqueios.inicio, fimDia)),
                and(gte(bloqueios.fim, inicioDia), lt(bloqueios.fim, fimDia)),
                and(lt(bloqueios.inicio, inicioDia), gte(bloqueios.fim, fimDia))
            )
        )
        .all();

    // 4. Filtra os slots removendo os que já estão no banco
    return todosSlots.filter((slot) => {
        // Se já está reservado num agendamento
        if (horariosOcupados.has(slot.getTime())) return false;

        // Se cai num período de bloqueio do admin
        for (const blq of bloqueiosDia) {
            const slotTime = slot.getTime();
            if (slotTime >= new Date(blq.inicio).getTime() && slotTime < new Date(blq.fim).getTime()) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Função utilitária para gerar intervalos de 30min em um período.
 */
function gerarSlots(
    dataBase: Date,
    horaInicio: number,
    minutoInicio: number,
    horaFim: number,
    minutoFim: number
): Date[] {
    const slots: Date[] = [];
    const atual = new Date(dataBase);
    atual.setHours(horaInicio, minutoInicio, 0, 0);

    const fim = new Date(dataBase);
    fim.setHours(horaFim, minutoFim, 0, 0);

    while (atual < fim) {
        slots.push(new Date(atual));
        atual.setMinutes(atual.getMinutes() + 30);
    }

    return slots;
}
