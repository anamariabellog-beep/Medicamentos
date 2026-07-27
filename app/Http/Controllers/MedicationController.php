<?php

namespace App\Http\Controllers;

use App\Exports\MedicationsExport;
use App\Models\Medication;
use App\Models\MedicationRemoval;
use App\Models\MedicationStockAdjustment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class MedicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Medication::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('laboratory', 'like', "%{$search}%")
                  ->orWhere('presentation', 'like', "%{$search}%")
                  ->orWhere('lot_number', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            match ($status) {
                'expired' => $query->whereDate('expiration_date', '<', now()),
                'expiring' => $query->whereDate('expiration_date', '>', now())->whereDate('expiration_date', '<=', now()->addDays(30)),
                'low_stock' => $query->where('quantity', '>', 0)->whereColumn('quantity', '<=', 'min_stock'),
                'out_of_stock' => $query->where('quantity', 0),
                'available' => $query->where('quantity', '>', 0)->whereColumn('quantity', '>', 'min_stock')->where(function ($q) {
                    $q->whereDate('expiration_date', '>', now())->orWhereNull('expiration_date');
                }),
                default => null,
            };
        }

        $medications = $query->orderByStatusPriority()->paginate(12)->withQueryString();

        $medications->through(function ($med) {
            $expired = $med->expiration_date?->isPast() ?? false;
            $now = now();
            $expiringSoon = $med->expiration_date?->isFuture() && $med->expiration_date->diffInDays($now) <= 30;
            $lowStock = $med->quantity <= $med->min_stock;
            $daysToExpiry = $med->expiration_date ? (int) $now->diffInDays($med->expiration_date, false) : null;

            $med->setAttribute('statusColor', match (true) {
                $expired || $med->quantity === 0 => 'red',
                $lowStock || $expiringSoon => 'orange',
                default => 'green',
            });
            $med->setAttribute('isExpired', $expired);
            $med->setAttribute('isExpiringSoon', $expiringSoon);
            $med->setAttribute('isLowStock', $lowStock);
            $med->setAttribute('daysToExpiry', $daysToExpiry);

            return $med;
        });

        $allResults = $query->get();
        $now = now();
        $stats = [
            'expired' => $allResults->filter(fn($m) => $m->expiration_date?->isPast())->count(),
            'expiring' => $allResults->filter(fn($m) => $m->expiration_date?->isFuture() && $m->expiration_date->diffInDays($now) <= 30)->count(),
            'out_of_stock' => $allResults->filter(fn($m) => $m->quantity === 0)->count(),
            'low_stock' => $allResults->filter(fn($m) => $m->quantity > 0 && $m->quantity <= $m->min_stock)->count(),
            'available' => $allResults->filter(fn($m) => $m->quantity > 0 && $m->quantity > $m->min_stock && (! $m->expiration_date || $m->expiration_date->isFuture()))->count(),
            'total' => $allResults->count(),
        ];

        return Inertia::render('farmacia', [
            'medications' => $medications,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'laboratory' => 'nullable|string|max:255',
            'presentation' => 'nullable|string|max:255',
            'lot_number' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'expiration_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        Medication::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Medication $medication)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'laboratory' => 'nullable|string|max:255',
            'presentation' => 'nullable|string|max:255',
            'lot_number' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'expiration_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $medication->update($validated);

        return redirect()->back();
    }

    public function destroy(Medication $medication)
    {
        $medication->delete();

        return redirect()->back();
    }

    public function remove(Request $request, Medication $medication)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'quantity_removed' => 'required|integer|min:1',
        ]);

        MedicationRemoval::create([
            'medication_id' => $medication->id,
            'reason' => $validated['reason'],
            'quantity_removed' => $validated['quantity_removed'],
            'removed_at' => now(),
        ]);

        $medication->decrement('quantity', $validated['quantity_removed']);

        return redirect()->back();
    }

    public function export()
    {
        return Excel::download(new MedicationsExport, 'medicamentos.xlsx');
    }

    public function adjustStock(Request $request, Medication $medication)
    {
        $validated = $request->validate([
            'quantity_adjusted' => 'required|integer|min:1',
            'type' => 'required|in:entry,adjustment',
            'reason' => 'nullable|string|max:255',
        ]);

        MedicationStockAdjustment::create([
            'medication_id' => $medication->id,
            'quantity_adjusted' => $validated['quantity_adjusted'],
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'adjusted_at' => now(),
        ]);

        $medication->increment('quantity', $validated['quantity_adjusted']);

        return redirect()->back();
    }

    public function history(Request $request)
    {
        $query = MedicationRemoval::with('medication')->orderBy('removed_at', 'desc');

        if ($search = $request->get('search')) {
            $query->whereHas('medication', fn($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $removals = $query->paginate(15)->withQueryString();

        return Inertia::render('farmacia/bajas', [
            'removals' => $removals,
            'filters' => $request->only(['search']),
        ]);
    }
}
