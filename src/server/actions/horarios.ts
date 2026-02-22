"use server";

import { db } from "@/db";
import { agendamentos, bloqueios } from "@/db/schema";
import { eq, and, gte, lt, or } from "drizzle-orm";

/**
 * Retorna os slots de 30 minutos disponíveis para uma determinada data.
 * Regras: Seg-Sex, 08:30-12:00 e 14:00-18:00 (Horário de Brasília - BRT = UTC-3).
 */
export async function getHorariosDisponiveis(dataConsulta: Date) {
    // Verifica se o dia é final de semana (0 = Domingo, 6 = Sábado)
    const diaSemana = dataConsulta.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
        return []; // Sem horários nos fins de semana
    }

    // Cria os slots usando o horário de Brasília (UTC-3)
    // Para garantir que os horários ficam corretos independente do servidor,
    // usamos o offset BRT (-3h = -180 min) explicitamente.
    const BRT_OFFSET_MINUTES = -3 * 60;

    function criarSlotBRT(hora: number, minuto: number): Date {
        const d = new Date(dataConsulta);
        // Remove a parte de hora/min/seg e ajusta para meia-noite UTC
        d.setUTCHours(0, 0, 0, 0);
        // Adiciona as horas e minutos de Brasília convertidos para UTC
        const totalMinutosUTC = hora * 60 + minuto - BRT_OFFSET_MINUTES;
        d.setUTCMinutes(totalMinutosUTC);
        return d;
    }

    // 1. Gera todos os slots possíveis para o dia em BRT
    const slotsManha = gerarSlotsBRT(dataConsulta, 8, 30, 12, 0, BRT_OFFSET_MINUTES);
    const slotsTarde = gerarSlotsBRT(dataConsulta, 14, 0, 18, 0, BRT_OFFSET_MINUTES);
    const todosSlots = [...slotsManha, ...slotsTarde];

    // 2. Define o início e fim do dia em BRT para usar nas queries
    const inicioDia = criarSlotBRT(0, 0);   // Meia-noite BRT
    const fimDia = criarSlotBRT(23, 59);     // Final do dia BRT

    // 3. Busca agendamentos já existentes neste dia no Banco
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

    // 4. Buscar Bloqueios Administrativos do dia
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

    // 5. Filtra os slots removendo os que já estão no banco ou bloqueados
    return todosSlots.filter((slot) => {
        if (horariosOcupados.has(slot.getTime())) return false;

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
 * Gera slots de 30 minutos em horário de Brasília (BRT).
 */
function gerarSlotsBRT(
    dataBase: Date,
    horaInicio: number,
    minutoInicio: number,
    horaFim: number,
    minutoFim: number,
    brtOffsetMinutes: number
): Date[] {
    const slots: Date[] = [];

    const totalInicio = horaInicio * 60 + minutoInicio;
    const totalFim = horaFim * 60 + minutoFim;

    for (let m = totalInicio; m < totalFim; m += 30) {
        const d = new Date(dataBase);
        d.setUTCHours(0, 0, 0, 0);
        d.setUTCMinutes(m - brtOffsetMinutes);
        slots.push(d);
    }

    return slots;
}
