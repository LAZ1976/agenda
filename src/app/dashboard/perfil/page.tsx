import { getPerfilUsuario } from "@/server/actions/perfil";
import { redirect } from "next/navigation";
import PerfilForm from "./form";

export default async function PerfilPage() {
    const perfil = await getPerfilUsuario();

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-pm-blue">
                    Completar Cadastro
                </h1>
                <p className="text-muted-foreground mt-2">
                    Para prosseguir no sistema, precisamos de suas informações institucionais.
                    Estes dados sairão no cabeçalho dos seus protocolos de agendamento.
                </p>
            </div>

            <PerfilForm dadosIniciais={perfil} />
        </div>
    );
}
