"use server";

import { db } from "@/db";
import { agendamentos, usuariosInfo } from "@/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getPerfilUsuario } from "./perfil";

function startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardStats() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);

    const [agendadosHoje, realizadosMes, cancelados] = await Promise.all([
        db.select().from(agendamentos)
            .where(and(
                gte(agendamentos.dataHora, todayStart),
                lt(agendamentos.dataHora, todayEnd),
                eq(agendamentos.status, "Agendado")
            )).all(),

        db.select().from(agendamentos)
            .where(and(
                gte(agendamentos.dataHora, monthStart),
                eq(agendamentos.status, "Realizado")
            )).all(),

        db.select().from(agendamentos)
            .where(eq(agendamentos.status, "Cancelado"))
            .all(),
    ]);

    return {
        agendadosHoje: agendadosHoje.length,
        realizadosMes: realizadosMes.length,
        cancelados: cancelados.length,
    };
}

export async function getAgendamentosHoje() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const rows = await db
        .select({
            id: agendamentos.id,
            dataHora: agendamentos.dataHora,
            motivo: agendamentos.motivo,
            status: agendamentos.status,
            porIntermedioServico: agendamentos.porIntermedioServico,
            solicitanteId: agendamentos.solicitanteId,
            postoGraduacao: usuariosInfo.postoGraduacao,
            nomeGuerra: usuariosInfo.nomeGuerra,
        })
        .from(agendamentos)
        .leftJoin(usuariosInfo, eq(agendamentos.solicitanteId, usuariosInfo.id))
        .where(and(
            gte(agendamentos.dataHora, todayStart),
            lt(agendamentos.dataHora, todayEnd),
        ))
        .orderBy(agendamentos.dataHora)
        .all();

    // Pendentes primeiro (próximo a ser atendido no topo), realizados/cancelados no final
    const pendentes = rows.filter(r => r.status === "Agendado");
    const concluidos = rows.filter(r => r.status !== "Agendado");

    return [...pendentes, ...concluidos];
}

export async function confirmarPresenca(agendamentoId: string) {
    try {
        const perfil = await getPerfilUsuario();
        if (!perfil || perfil.role === "user") {
            return { success: false, message: "Sem permissão" };
        }

        await db
            .update(agendamentos)
            .set({ status: "Realizado" })
            .where(eq(agendamentos.id, agendamentoId));

        revalidatePath("/dashboard");
        return { success: true, message: "Presença confirmada! Agendamento encerrado." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao confirmar presença" };
    }
}
