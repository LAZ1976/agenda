"use client";

import { useTransition } from "react";
import { atualizarRole } from "@/server/actions/perfil";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ROLES = [
    { value: "user", label: "Usuário" },
    { value: "admin_p5", label: "Chefe P5" },
    { value: "admin_central", label: "Central" },
] as const;

interface Props {
    userId: string;
    currentRole: "user" | "admin_p5" | "admin_central";
}

export function UsuarioRoleForm({ userId, currentRole }: Props) {
    const [isPending, startTransition] = useTransition();

    function handleChange(novaRole: "user" | "admin_p5" | "admin_central") {
        startTransition(async () => {
            const res = await atualizarRole(userId, novaRole);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        });
    }

    return (
        <Select
            defaultValue={currentRole}
            onValueChange={(v) => handleChange(v as "user" | "admin_p5" | "admin_central")}
            disabled={isPending}
        >
            <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-sm">
                        {r.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
