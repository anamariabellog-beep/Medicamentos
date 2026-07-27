import { Head, Link } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { Pill, AlertTriangle, AlertCircle, PackageX, Package } from 'lucide-react';
import farmacia from '@/routes/farmacia';

interface MedicationStats {
    total: number;
    expired: number;
    expiring: number;
    low_stock: number;
    out_of_stock: number;
}

export default function Dashboard({ medicationStats }: { medicationStats: MedicationStats }) {
    const widgets = [
        { label: 'Total medicamentos', value: medicationStats.total, icon: Pill, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-900' },
        { label: 'Vencidos', value: medicationStats.expired, icon: PackageX, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-900' },
        { label: 'Por vencer (30d)', value: medicationStats.expiring, icon: AlertCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-900' },
        { label: 'Stock bajo', value: medicationStats.low_stock, icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-900' },
        { label: 'Agotados', value: medicationStats.out_of_stock, icon: Package, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950', border: 'border-rose-200 dark:border-rose-900' },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {widgets.map((w) => (
                        <div key={w.label} className={`rounded-xl border ${w.border} ${w.bg} flex items-center gap-4 p-4`}>
                            <div className={`rounded-lg p-2 ${w.bg}`}>
                                <w.icon className={`h-6 w-6 ${w.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{w.value}</p>
                                <p className={`text-sm ${w.color}`}>{w.label}</p>
                            </div>
                        </div>
                    ))}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-center">
                        <Link href={farmacia.index().url}>
                            <Button variant="outline" className="gap-2">
                                <Pill className="h-4 w-4" />
                                Ir a Farmacia
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
