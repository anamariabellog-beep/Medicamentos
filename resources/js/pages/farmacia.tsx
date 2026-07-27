import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Download, Package, Plus, Search } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useCallback } from 'react';
import farmacia from '@/routes/farmacia';
import type { PaginationData } from '@/types';

interface Medication {
    id: number;
    name: string;
    laboratory: string | null;
    presentation: string | null;
    lot_number: string | null;
    quantity: number;
    min_stock: number;
    unit_price: number | null;
    expiration_date: string | null;
    description: string | null;
    is_active: boolean;
    statusColor: string;
    isLowStock: boolean;
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysToExpiry: number | null;
}

interface Stats {
    expired: number;
    expiring: number;
    out_of_stock: number;
    low_stock: number;
    available: number;
    total: number;
}

interface PageProps {
    medications: PaginationData<Medication>;
    filters: { search?: string; status?: string };
    stats: Stats;
    [key: string]: unknown;
}

export default function Farmacia() {
    const { medications, filters, stats } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removeReason, setRemoveReason] = useState('');
    const [removeQuantity, setRemoveQuantity] = useState(1);
    const [adjustStockOpen, setAdjustStockOpen] = useState(false);
    const [adjustQuantity, setAdjustQuantity] = useState(1);
    const [adjustType, setAdjustType] = useState<'entry' | 'adjustment'>('entry');
    const [adjustReason, setAdjustReason] = useState('');
    const [chartsOpen, setChartsOpen] = useState(true);

    const { data, setData, processing, reset } = useForm({
        name: '',
        laboratory: '',
        presentation: '',
        lot_number: '',
        quantity: 0,
        min_stock: 5,
        unit_price: '',
        expiration_date: '',
        description: '',
    });

    const handleSearch = useCallback(() => {
        router.get(farmacia.index().url, { search, status: statusFilter === 'all' ? undefined : statusFilter }, { preserveState: true, preserveScroll: true });
    }, [search, statusFilter]);

    const handleFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        router.get(farmacia.index().url, { search: search || undefined, status: value === 'all' ? undefined : value }, { preserveState: true, preserveScroll: true });
    }, [search]);

    const openDetail = (medication: Medication) => {
        setSelectedMedication(medication);
        setDetailOpen(true);
    };

    const openForm = (medication?: Medication) => {
        if (medication) {
            setData({
                name: medication.name,
                laboratory: medication.laboratory ?? '',
                presentation: medication.presentation ?? '',
                lot_number: medication.lot_number ?? '',
                quantity: medication.quantity,
                min_stock: medication.min_stock,
                unit_price: medication.unit_price?.toString() ?? '',
                expiration_date: medication.expiration_date ?? '',
                description: medication.description ?? '',
            });
            setSelectedMedication(medication);
        } else {
            reset();
            setSelectedMedication(null);
        }
        setFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, unit_price: data.unit_price || null, expiration_date: data.expiration_date || null };

        if (selectedMedication) {
            router.put(farmacia.update.url(selectedMedication.id), payload, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); reset(); },
            });
        } else {
            router.post(farmacia.store.url(), payload, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); reset(); },
            });
        }
    };

    const handleDelete = (medication: Medication) => {
        if (confirm(`¿Eliminar "${medication.name}"?`)) {
            router.delete(farmacia.destroy.url(medication.id), { preserveState: true, preserveScroll: true });
        }
    };

    const handleAdjustStock = () => {
        if (!selectedMedication) return;
        router.post(farmacia.adjustStock.url(selectedMedication.id), { quantity_adjusted: adjustQuantity, type: adjustType, reason: adjustReason || null }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => { setAdjustStockOpen(false); setAdjustQuantity(1); setAdjustReason(''); setDetailOpen(false); },
        });
    };

    const handleRemove = () => {
        if (!selectedMedication) return;
        router.post(farmacia.remove.url(selectedMedication.id), { reason: removeReason, quantity_removed: removeQuantity }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => { setRemoveOpen(false); setRemoveReason(''); setRemoveQuantity(1); setDetailOpen(false); },
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const statusBadge = (medication: Medication) => {
        if (medication.isExpired) return <Badge variant="destructive">Vencido</Badge>;
        if (medication.quantity === 0) return <Badge variant="destructive">Agotado</Badge>;
        if (medication.isLowStock) return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Stock bajo</Badge>;
        if (medication.isExpiringSoon) return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Por vencer</Badge>;
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Disponible</Badge>;
    };

    return (
        <>
            <Head title="Farmacia - Inventario" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Inventario de Medicamentos</h1>
                        <p className="text-muted-foreground text-sm">Gestión de stock, vencimientos y alertas</p>
                    </div>
                    <div className="flex gap-2">
                        <a href={farmacia.export().url}>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </a>
                        <Button variant="outline" asChild>
                            <Link href={farmacia.history()}>Bajas</Link>
                        </Button>
                        <Button onClick={() => openForm()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                    <button onClick={() => handleFilterChange('all')} className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{stats.total}</p>
                    </button>
                    <button onClick={() => handleFilterChange('expired')} className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:hover:bg-red-900/50">
                        <p className="text-xs text-red-600 dark:text-red-400">Vencidos</p>
                        <p className="text-xl font-bold text-red-700 dark:text-red-300">{stats.expired}</p>
                    </button>
                    <button onClick={() => handleFilterChange('expiring')} className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left transition-colors hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:hover:bg-amber-900/50">
                        <p className="text-xs text-amber-600 dark:text-amber-400">Por vencer</p>
                        <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{stats.expiring}</p>
                    </button>
                    <button onClick={() => handleFilterChange('out_of_stock')} className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-left transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:hover:bg-rose-900/50">
                        <p className="text-xs text-rose-600 dark:text-rose-400">Agotados</p>
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{stats.out_of_stock}</p>
                    </button>
                    <button onClick={() => handleFilterChange('low_stock')} className="cursor-pointer rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-left transition-colors hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950 dark:hover:bg-yellow-900/50">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Stock bajo</p>
                        <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats.low_stock}</p>
                    </button>
                    <button onClick={() => handleFilterChange('available')} className="cursor-pointer rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-left transition-colors hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900/50">
                        <p className="text-xs text-green-600 dark:text-green-400">Disponibles</p>
                        <p className="text-xl font-bold text-green-700 dark:text-green-300">{stats.available}</p>
                    </button>
                </div>

                <div className="rounded-lg border">
                    <button onClick={() => setChartsOpen(!chartsOpen)} className="flex w-full items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <span>Gráficos</span>
                        <span className="text-xs">{chartsOpen ? '▲ Ocultar' : '▼ Mostrar'}</span>
                    </button>
                    {chartsOpen && (
                        <div className="grid grid-cols-1 gap-4 border-t p-3 lg:grid-cols-2">
                            <div>
                                <p className="mb-2 text-sm font-medium text-muted-foreground">Distribución por estado</p>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={[
                                            { name: 'Vencidos', value: stats.expired, color: '#ef4444' },
                                            { name: 'Por vencer', value: stats.expiring, color: '#f97316' },
                                            { name: 'Agotados', value: stats.out_of_stock, color: '#dc2626' },
                                            { name: 'Stock bajo', value: stats.low_stock, color: '#ea580c' },
                                            { name: 'Disponibles', value: stats.available, color: '#22c55e' },
                                        ]} cx="50%" cy="45%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}
                                            label={({ name, value, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                            labelLine>
                                            {[
                                                { color: '#ef4444' },
                                                { color: '#f97316' },
                                                { color: '#dc2626' },
                                                { color: '#ea580c' },
                                                { color: '#22c55e' },
                                            ].map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => {
                                            const total = stats.expired + stats.expiring + stats.out_of_stock + stats.low_stock + stats.available;
                                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                            return [`${value} (${pct}%)`, undefined];
                                        }} />
                                        <Legend verticalAlign="bottom" height={24} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-muted-foreground">Stock por medicamento (bajo)</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={medications.data.filter(m => m.isLowStock || m.quantity === 0).slice(0, 8)} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
                                        <Tooltip formatter={(value: number, name: string) => [`${value} uds.`, 'Stock']} />
                                        <Bar dataKey="quantity" radius={[0, 4, 4, 0]} fill="#f97316" />
                                    </BarChart>
                                </ResponsiveContainer>
                                {medications.data.filter(m => m.isLowStock || m.quantity === 0).length === 0 && (
                                    <p className="py-8 text-center text-sm text-muted-foreground">Sin medicamentos con stock bajo</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, laboratorio, presentación..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="expired">Vencidos</SelectItem>
                            <SelectItem value="expiring">Por vencer (30 días)</SelectItem>
                            <SelectItem value="low_stock">Stock bajo</SelectItem>
                            <SelectItem value="out_of_stock">Agotados</SelectItem>
                            <SelectItem value="available">Disponibles</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="secondary" onClick={handleSearch}>Buscar</Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estado</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Laboratorio</TableHead>
                                <TableHead>Presentación</TableHead>
                                <TableHead>Lote</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Stock mín.</TableHead>
                                <TableHead className="text-right">Precio</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead className="text-right">Días</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medications.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="mb-2 h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No hay medicamentos</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                medications.data.map((medication) => (
                                    <TableRow
                                        key={medication.id}
                                        className="cursor-pointer"
                                        onClick={() => openDetail(medication)}
                                    >
                                        <TableCell>
                                            <span className={cn(
                                                'inline-block rounded-md px-2 py-0.5 text-xs font-medium text-white',
                                                medication.statusColor === 'red' && 'bg-red-500',
                                                medication.statusColor === 'orange' && 'bg-orange-500',
                                                medication.statusColor === 'green' && 'bg-green-500',
                                            )}>
                                                {medication.statusColor === 'red' ? (medication.isExpired ? 'Vencido' : 'Agotado') : ''}
                                                {medication.statusColor === 'orange' ? (medication.isLowStock ? 'Stock bajo' : 'Por vencer') : ''}
                                                {medication.statusColor === 'green' ? 'Disponible' : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{medication.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{medication.laboratory ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{medication.presentation ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{medication.lot_number ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={cn(
                                                'font-semibold',
                                                medication.quantity === 0 && 'text-red-500',
                                                medication.isLowStock && medication.quantity > 0 &&                                             'text-orange-600 dark:text-orange-400',
                                            )}>
                                                {medication.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{medication.min_stock}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {medication.unit_price ? `$${Number(medication.unit_price).toFixed(2)}` : '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(medication.expiration_date)}
                                        </TableCell>
                                        <TableCell>
                                            {medication.daysToExpiry !== null && (
                                                <span className="whitespace-nowrap text-xs">
                                                    {medication.daysToExpiry < 0 ? (
                                                        <span className="font-medium text-red-500">{Math.abs(medication.daysToExpiry)}d vencido</span>
                                                    ) : medication.daysToExpiry <= 30 ? (
                                                        <span className="font-medium text-orange-600 dark:text-orange-400">Faltan {medication.daysToExpiry}d</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">{medication.daysToExpiry}d</span>
                                                    )}
                                                </span>
                                            )}
                                            {medication.daysToExpiry === null && <span className="text-muted-foreground">—</span>}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando {medications.from ?? 0}–{medications.to ?? 0} de {medications.total} medicamentos
                    </p>
                    <div className="flex gap-2">
                        {medications.links.filter(l => !l.label.includes('...')).map((link) => (
                            <Link
                                key={link.label}
                                href={link.url ?? '#'}
                                preserveScroll
                                preserveState
                            >
                                <Button
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    disabled={!link.url}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedMedication?.name}</DialogTitle>
                        {selectedMedication?.presentation && (
                            <DialogDescription>{selectedMedication.presentation}</DialogDescription>
                        )}
                    </DialogHeader>
                    {selectedMedication && (
                        <div className="grid gap-3">
                            <div className="flex items-center gap-2">
                            <span className={cn(
                                'inline-block rounded-md px-2 py-0.5 text-xs font-medium text-white mr-2',
                                selectedMedication.statusColor === 'red' && 'bg-red-500',
                                selectedMedication.statusColor === 'orange' && 'bg-orange-500',
                                selectedMedication.statusColor === 'green' && 'bg-green-500',
                            )}>
                                {selectedMedication.statusColor === 'red' ? (selectedMedication.isExpired ? 'Vencido' : 'Agotado') : ''}
                                {selectedMedication.statusColor === 'orange' ? (selectedMedication.isLowStock ? 'Stock bajo' : 'Por vencer') : ''}
                                {selectedMedication.statusColor === 'green' ? 'Disponible' : ''}
                            </span>
                                <span className="text-2xl font-bold">{selectedMedication.quantity}</span>
                                <span className="text-muted-foreground">unidades</span>
                                {statusBadge(selectedMedication)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Laboratorio</p>
                                    <p className="font-medium">{selectedMedication.laboratory ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Presentación</p>
                                    <p className="font-medium">{selectedMedication.presentation ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Lote</p>
                                    <p className="font-medium">{selectedMedication.lot_number ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Stock mínimo</p>
                                    <p className="font-medium">{selectedMedication.min_stock} uds.</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Precio unitario</p>
                                    <p className="font-medium">
                                        {selectedMedication.unit_price ? `$${Number(selectedMedication.unit_price).toFixed(2)}` : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Vencimiento</p>
                                    <p className="font-medium">{formatDate(selectedMedication.expiration_date)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Días restantes</p>
                                    <p>
                                        {selectedMedication.daysToExpiry !== null ? (
                                            <span className="text-sm">
                                                {selectedMedication.daysToExpiry < 0 ? (
                                                    <span className="font-semibold text-red-500">Vencido hace {Math.abs(selectedMedication.daysToExpiry)} días</span>
                                                ) : selectedMedication.daysToExpiry <= 30 ? (
                                                    <span className="font-semibold text-orange-600 dark:text-orange-400">Faltan {selectedMedication.daysToExpiry} días</span>
                                                ) : (
                                                    <span className="text-muted-foreground">{selectedMedication.daysToExpiry} días restantes</span>
                                                )}
                                            </span>
                                        ) : '—'}
                                    </p>
                                </div>
                            </div>
                            {selectedMedication.description && (
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Descripción</p>
                                    <p>{selectedMedication.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="flex-wrap gap-2">
                        <Button variant="outline" onClick={() => { setDetailOpen(false); openForm(selectedMedication!); }}>
                            Editar
                        </Button>
                        <Button variant="secondary" onClick={() => { setAdjustStockOpen(true); }}>
                            Ajustar stock
                        </Button>
                        <Button variant="secondary" onClick={() => { setRemoveQuantity(selectedMedication?.quantity ?? 1); setRemoveOpen(true); }}>
                            Dar de baja
                        </Button>
                        <Button variant="destructive" onClick={() => { handleDelete(selectedMedication!); setDetailOpen(false); }}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Dar de baja: {selectedMedication?.name}</DialogTitle>
                        <DialogDescription>Registra el motivo y la cantidad a retirar del inventario.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="remove_quantity">Cantidad a retirar</Label>
                            <Input id="remove_quantity" type="number" min={1} max={selectedMedication?.quantity} value={removeQuantity} onChange={(e) => setRemoveQuantity(Number(e.target.value))} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="remove_reason">Motivo</Label>
                            <Select value={removeReason} onValueChange={setRemoveReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar motivo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Vencido">Vencido</SelectItem>
                                    <SelectItem value="Deterioro">Deterioro</SelectItem>
                                    <SelectItem value="Devolución">Devolución</SelectItem>
                                    <SelectItem value="Merma">Merma</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancelar</Button>
                            <Button onClick={handleRemove} disabled={!removeReason || removeQuantity < 1}>Confirmar baja</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={adjustStockOpen} onOpenChange={setAdjustStockOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Ajustar stock: {selectedMedication?.name}</DialogTitle>
                        <DialogDescription>Agrega unidades al inventario o registra un ajuste.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="adjust_type">Tipo</Label>
                            <Select value={adjustType} onValueChange={(v) => setAdjustType(v as 'entry' | 'adjustment')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entry">Entrada de stock</SelectItem>
                                    <SelectItem value="adjustment">Ajuste manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adjust_quantity">Cantidad a agregar</Label>
                            <Input id="adjust_quantity" type="number" min={1} value={adjustQuantity} onChange={(e) => setAdjustQuantity(Number(e.target.value))} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="adjust_reason">Motivo (opcional)</Label>
                            <Input id="adjust_reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Ej: reposición de proveedor" />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAdjustStockOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAdjustStock} disabled={adjustQuantity < 1}>Confirmar</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedMedication ? 'Editar Medicamento' : 'Agregar Medicamento'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="laboratory">Laboratorio</Label>
                                <Input id="laboratory" value={data.laboratory} onChange={(e) => setData('laboratory', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="presentation">Presentación</Label>
                                <Input id="presentation" value={data.presentation} onChange={(e) => setData('presentation', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="lot_number">Lote</Label>
                                <Input id="lot_number" value={data.lot_number} onChange={(e) => setData('lot_number', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit_price">Precio unitario</Label>
                                <Input id="unit_price" type="number" step="0.01" value={data.unit_price} onChange={(e) => setData('unit_price', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Cantidad *</Label>
                                <Input id="quantity" type="number" value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value))} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="min_stock">Stock mínimo *</Label>
                                <Input id="min_stock" type="number" value={data.min_stock} onChange={(e) => setData('min_stock', Number(e.target.value))} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expiration_date">Fecha de vencimiento</Label>
                            <Input id="expiration_date" type="date" value={data.expiration_date} onChange={(e) => setData('expiration_date', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                {selectedMedication ? 'Guardar cambios' : 'Agregar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Farmacia.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Farmacia', href: farmacia.index().url },
    ],
};
