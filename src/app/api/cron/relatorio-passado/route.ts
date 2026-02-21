import { db } from "@/db";
import { agendamentos, notificacoes, usuariosInfo } from "@/db/schema";
import { inArray, and, eq, gte, lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        // 1. Encontrar o intervalo da semana passada (Segunda a Sexta passados)
        const hoje = new Date();
        const diasDesdeSegunda = (hoje.getDay() + 6) % 7;
        const ultimaSegunda = new Date(hoje);
        ultimaSegunda.setDate(hoje.getDate() - diasDesdeSegunda - 7);
        ultimaSegunda.setHours(0, 0, 0, 0);

        const ultimaSexta = new Date(ultimaSegunda);
        ultimaSexta.setDate(ultimaSegunda.getDate() + 4);
        ultimaSexta.setHours(23, 59, 59, 999);

        // 2. Buscar Agendamentos
        const realizados = await db
            .select({
                id: agendamentos.id,
                dataHora: agendamentos.dataHora,
                motivo: agendamentos.motivo,
                postoGraduacao: usuariosInfo.postoGraduacao,
                nomeGuerra: usuariosInfo.nomeGuerra,
            })
            .from(agendamentos)
            .leftJoin(usuariosInfo, eq(agendamentos.solicitanteId, usuariosInfo.id))
            .where(
                and(
                    eq(agendamentos.status, "Realizado"),
                    gte(agendamentos.dataHora, ultimaSegunda),
                    lt(agendamentos.dataHora, ultimaSexta)
                )
            )
            .all();

        // 3. Formatar Mensagem
        let mensagem = `📊 FECHAMENTO: Na última semana foram realizadas ${realizados.length} trocas de funcionais.`;

        // 4. Buscar Administradores
        const admins = await db.select().from(usuariosInfo).where(inArray(usuariosInfo.role, ["admin_p5", "admin_central"])).all();

        // 5. Salvar Notificações
        for (const admin of admins) {
            await db.insert(notificacoes).values({
                id: randomUUID(),
                usuarioId: admin.id,
                mensagem,
                lida: false,
                createdAt: new Date(),
            });

            // Simulação de Email
            console.log(`\n[EMAIL CRON] Enviando para: ${admin.postoGraduacao} ${admin.nomeGuerra} (Admin ID: ${admin.id})`);
            console.log(`Assunto: Fechamento de Agendamentos da Semana`);
            console.log(`Mensagem: ${mensagem}\n`);
        }

        return NextResponse.json({ success: true, count: realizados.length, message: "Relatório Passado gerado." });
    } catch (error) {
        console.error("Erro CRON Relatorio Passado", error);
        return NextResponse.json({ success: false, error: "Falha ao executar CRON" }, { status: 500 });
    }
}
