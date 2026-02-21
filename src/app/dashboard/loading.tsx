export default function Loading() {
    return (
        <div className="space-y-6">
            <div>
                <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mt-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
                ))}
            </div>
            <div className="h-[400px] w-full bg-slate-200 rounded-xl animate-pulse" />
        </div>
    );
}
