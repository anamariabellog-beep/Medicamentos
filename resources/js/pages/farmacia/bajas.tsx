import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { useState, useCallback } from 'react';
import farmacia from '@/routes/farmacia';
import type { PaginationData } from '@/types';

interface Removal {
    id: number;
    reason: string;
    quantity_removed: number;
    removed_at: string;
    medication: {
        id: number;
        name: string;
        laboratory: string | null;
        presentation: string | null;
    };
}

export default function Bajas() {
    const { removals, filters } = usePage<{ removals: PaginationData<Removal>; filters: { search?: string }; [key: string]: unknown }>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = useCallback(() => {
        router.get(farmacia.history().url, { search: search || undefined }, { preserveState: true, preserveScroll: true });
    }, [search]);

    return (
        <>
            <Head title="Historial de bajas" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={farmacia.index()}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight">Historial de bajas</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">Medicamentos retirados del inventario</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-8"
                        />
                    </div>
                    <Button variant="secondary" onClick={handleSearch}>Buscar</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Medicamento</TableHead>
                                <TableHead>Laboratorio</TableHead>
                                <TableHead>Presentación</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead>Fecha de baja</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {removals.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="mb-2 h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No hay registros de bajas</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                removals.data.map((removal) => (
                                    <TableRow key={removal.id}>
                                        <TableCell className="font-medium">{removal.medication.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{removal.medication.laboratory ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{removal.medication.presentation ?? '—'}</TableCell>
                                        <TableCell className="text-right">{removal.quantity_removed}</TableCell>
                                        <TableCell>
                                            <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                                                {removal.reason}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(removal.removed_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {removals.from ?? 0}–{removals.to ?? 0} de {removals.total} registros
                    </p>
                    <div className="flex gap-2">
                        {removals.links.filter(l => !l.label.includes('...')).map((link) => (
                            <Link key={link.label} href={link.url ?? '#'} preserveScroll preserveState>
                                <Button variant={link.active ? 'default' : 'outline'} size="sm" dangerouslySetInnerHTML={{ __html: link.label }} disabled={!link.url} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

Bajas.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Farmacia', href: '/farmacia' },
        { title: 'Historial de bajas', href: '/farmacia/bajas' },
    ],
};
