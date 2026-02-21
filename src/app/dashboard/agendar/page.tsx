import { getPerfilUsuario } from "@/server/actions/perfil";
import { redirect } from "next/navigation";
import AgendarForm from "./form";

export default async function AgendarPage() {
    const perfil = await getPerfilUsuario();

    if (!perfil) {
        // Redireciona para completar cadastro caso o usuário tente pular etapas
        redirect("/dashboard/perfil");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pt-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-pm-blue">
                    Agendar Troca de Serviço
                </h1>
                <p className="text-muted-foreground mt-2">
                    Siga os passos abaixo para escolher o motivo, a data e o horário da sua
                    solicitação.
                </p>
            </div>

            <AgendarForm perfil={perfil} />
        </div>
    );
}
