"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const reAtual = searchParams.get("re") || "";

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const re = form.get("re") as string;

        startTransition(() => {
            if (re) {
                router.push(`/dashboard/admin/usuarios?re=${re}`);
            } else {
                router.push(`/dashboard/admin/usuarios`);
            }
        });
    }

    function clearSearch() {
        startTransition(() => {
            router.push(`/dashboard/admin/usuarios`);
        });
    }

    return (
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                    name="re"
                    placeholder="Buscar por RE..."
                    className="pl-9"
                    defaultValue={reAtual}
                    maxLength={6}
                    disabled={isPending}
                />
            </div>
            <Button type="submit" disabled={isPending} variant="secondary">
                Buscar
            </Button>
            {reAtual && (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={clearSearch}
                    disabled={isPending}
                    className="text-slate-500"
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpar
                </Button>
            )}
        </form>
    );
}
