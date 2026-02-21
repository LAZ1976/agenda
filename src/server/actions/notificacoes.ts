"use server";

import { db } from "@/db";
import { notificacoes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getNotificacoesNaoLidas() {
    try {
        const { userId } = await auth();
        if (!userId) return [];

        return await db
            .select()
            .from(notificacoes)
            .where(
                and(
                    eq(notificacoes.usuarioId, userId),
                    eq(notificacoes.lida, false)
                )
            )
            .orderBy(desc(notificacoes.createdAt))
            .all();

    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function marcarComoLidas() {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false };

        await db
            .update(notificacoes)
            .set({ lida: true })
            .where(
                and(
                    eq(notificacoes.usuarioId, userId),
                    eq(notificacoes.lida, false)
                )
            );
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}
